import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SidebarLayout from '../components/layout/SidebarLayout';
import Button from '../components/ui/Button';
import AnswerSheetPDF from '../components/exams/AnswerSheetPDF';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Exam, Question } from '../types';

const PrintAnswerSheet: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  
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

        setExam(mappedExam);
        setQuestions(mappedQuestions);
      } catch (error) {
        console.error('Error fetching exam details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamDetails();
  }, [id]);

  if (loading) {
    return (
      <SidebarLayout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
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
      <div className="mb-6">
        <Link to={`/exams/${id}`} className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft size={16} className="mr-1" />
          Back to Exam
        </Link>
      </div>
      
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Print Answer Sheets - {exam.title}
      </h1>
      
      <AnswerSheetPDF examTitle={exam.title} totalQuestions={questions.length} />
    </SidebarLayout>
  );
};

export default PrintAnswerSheet;