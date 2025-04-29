import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SidebarLayout from '../components/layout/SidebarLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import AnswerSheetPDF from '../components/exams/AnswerSheetPDF';
import { Calendar, FileText, Award, Users, Edit, Printer, BarChart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Exam, Question, Result } from '../types';
import { format } from 'date-fns';

const ExamDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  
  useEffect(() => {
    const fetchExamDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);

        // Fetch exam details
        const { data: examData, error: examError } = await supabase
          .from('exams')
          .select('*')
          .eq('id', id)
          .single();

        if (examError) throw examError;

        // Fetch questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('exam_id', id)
          .order('number', { ascending: true });

        if (questionsError) throw questionsError;

        // Fetch results
        const { data: resultsData, error: resultsError } = await supabase
          .from('results')
          .select(`
            *,
            students (name)
          `)
          .eq('exam_id', id)
          .order('final_score', { ascending: false });

        if (resultsError) throw resultsError;

        const mappedExam: Exam = {
          id: examData.id,
          title: examData.title,
          date: examData.date,
          totalPoints: examData.total_points,
          scoringType: examData.scoring_type,
          createdAt: examData.created_at,
        };

        const mappedQuestions: Question[] = questionsData.map(q => ({
          id: q.id,
          examId: q.exam_id,
          number: q.number,
          correctAnswer: q.correct_answer,
          points: q.points,
        }));

        const mappedResults: Result[] = resultsData.map(r => ({
          id: r.id,
          studentId: r.student_id,
          examId: r.exam_id,
          studentName: r.students?.name,
          correctAnswers: r.correct_answers,
          finalScore: r.final_score,
          gradedAt: r.graded_at,
        }));

        setExam(mappedExam);
        setQuestions(mappedQuestions);
        setResults(mappedResults);
      } catch (error) {
        console.error('Error fetching exam details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamDetails();
  }, [id]);

  const calculateClassAverage = () => {
    if (results.length === 0) return 0;
    return parseFloat((results.reduce((sum, r) => sum + r.finalScore, 0) / results.length).toFixed(2));
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  if (!exam) {
    return (
      <SidebarLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Exam not found</h2>
          <p className="text-gray-500 mb-6">The exam you're looking for doesn't exist or you don't have access.</p>
          <Link to="/exams">
            <Button variant="primary">Back to Exams</Button>
          </Link>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">{exam.title}</h1>
        <div className="space-x-2">
          <Link to={`/exams/${id}/edit`}>
            <Button variant="outline" icon={<Edit size={16} />}>
              Edit Exam
            </Button>
          </Link>
          <Link to={`/exams/${id}/grade`}>
            <Button variant="primary" icon={<Award size={16} />}>
              Grade Exams
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Exam Information</h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <Calendar size={18} className="text-gray-500 mr-2" />
              <span className="text-gray-700">Date: {format(new Date(exam.date), 'PPP')}</span>
            </div>
            
            <div className="flex items-center">
              <FileText size={18} className="text-gray-500 mr-2" />
              <span className="text-gray-700">Questions: {questions.length}</span>
            </div>
            
            <div className="flex items-center">
              <Award size={18} className="text-gray-500 mr-2" />
              <span className="text-gray-700">Total Points: {exam.totalPoints}</span>
            </div>
            
            <div className="flex items-center">
              <Users size={18} className="text-gray-500 mr-2" />
              <span className="text-gray-700">Students Graded: {results.length}</span>
            </div>
          </div>
        </Card>
        
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Class Performance</h3>
          
          {results.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Class Average:</span>
                <span className="text-lg font-medium text-blue-600">
                  {calculateClassAverage()} points
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Highest Score:</span>
                <span className="text-lg font-medium text-green-600">
                  {results[0]?.finalScore || 0} points
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Lowest Score:</span>
                <span className="text-lg font-medium text-red-600">
                  {results[results.length - 1]?.finalScore || 0} points
                </span>
              </div>
              
              <div className="mt-4">
                <Link to={`/analytics?exam=${id}`}>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    icon={<BarChart size={16} />}
                  >
                    Detailed Analytics
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Award size={24} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">
                No students have been graded yet
              </p>
              <div className="mt-4">
                <Link to={`/exams/${id}/grade`}>
                  <Button variant="primary" size="sm">
                    Start Grading
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
        
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
          
          <div className="space-y-3">
            <Link to={`/exams/${id}/print`}>
              <Button 
                variant="outline" 
                className="w-full" 
                icon={<Printer size={16} />}
              >
                Print Answer Sheets
              </Button>
            </Link>
            
            <Link to={`/exams/${id}/grade`}>
              <Button 
                variant="outline" 
                className="w-full" 
                icon={<Award size={16} />}
              >
                Grade Exams
              </Button>
            </Link>
            
            <Link to={`/analytics?exam=${id}`}>
              <Button 
                variant="outline" 
                className="w-full" 
                icon={<BarChart size={16} />}
              >
                View Analytics
              </Button>
            </Link>
            
            <Link to={`/exams/${id}/edit`}>
              <Button 
                variant="outline" 
                className="w-full" 
                icon={<Edit size={16} />}
              >
                Edit Exam
              </Button>
            </Link>
          </div>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Answer Key">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {questions.map((question) => (
              <div 
                key={question.id}
                className="p-3 border border-gray-200 rounded-md"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">Q{question.number}</span>
                  <span className="text-sm text-gray-500">{question.points} pts</span>
                </div>
                <div className="mt-1 flex items-center justify-center">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 font-medium">
                    {question.correctAnswer}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
        
        <Card title="Student Results">
          {results.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {results.map((result) => (
                <div key={result.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{result.studentName}</p>
                    <p className="text-sm text-gray-500">
                      {result.correctAnswers} of {questions.length} correct
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-medium text-blue-600">
                      {result.finalScore} points
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(result.gradedAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Users size={24} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">
                No students have been graded yet
              </p>
            </div>
          )}
        </Card>
      </div>
    </SidebarLayout>
  );
};

export default ExamDetail;