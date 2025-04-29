import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SidebarLayout from '../components/layout/SidebarLayout';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import { BarChart2, PieChart, BarChart, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Exam, Result, Question } from '../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialExamId = searchParams.get('exam');
  
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState(initialExamId || '');
  const [results, setResults] = useState<Result[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  useEffect(() => {
    const fetchExams = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('exams')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedExams = data.map(exam => ({
          id: exam.id,
          title: exam.title,
          date: exam.date,
          totalPoints: exam.total_points,
          scoringType: exam.scoring_type,
          createdAt: exam.created_at,
        }));

        setExams(mappedExams);

        // If we have an initial exam ID from the URL, use it
        // Otherwise select the first exam if available
        if (initialExamId) {
          setSelectedExamId(initialExamId);
        } else if (mappedExams.length > 0) {
          setSelectedExamId(mappedExams[0].id);
        }
      } catch (error) {
        console.error('Error fetching exams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [user, initialExamId]);

  useEffect(() => {
    const fetchExamData = async () => {
      if (!selectedExamId) return;

      try {
        setLoading(true);

        // Fetch results for the selected exam
        const { data: resultsData, error: resultsError } = await supabase
          .from('results')
          .select(`
            *,
            students (name)
          `)
          .eq('exam_id', selectedExamId)
          .order('final_score', { ascending: false });

        if (resultsError) throw resultsError;

        // Fetch questions for the selected exam
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('exam_id', selectedExamId)
          .order('number', { ascending: true });

        if (questionsError) throw questionsError;

        const mappedResults: Result[] = resultsData.map(r => ({
          id: r.id,
          studentId: r.student_id,
          examId: r.exam_id,
          studentName: r.students?.name,
          correctAnswers: r.correct_answers,
          finalScore: r.final_score,
          gradedAt: r.graded_at,
        }));

        const mappedQuestions: Question[] = questionsData.map(q => ({
          id: q.id,
          examId: q.exam_id,
          number: q.number,
          correctAnswer: q.correct_answer,
          points: q.points,
        }));

        setResults(mappedResults);
        setQuestions(mappedQuestions);
      } catch (error) {
        console.error('Error fetching exam data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [selectedExamId]);

  const handleExamChange = (value: string) => {
    setSelectedExamId(value);
  };

  // Prepare data for score distribution chart
  const prepareScoreDistributionData = () => {
    if (results.length === 0) return null;

    // Create score ranges (0-10, 11-20, etc.)
    const selectedExam = exams.find(exam => exam.id === selectedExamId);
    const maxScore = selectedExam?.totalPoints || 100;
    const rangeSize = Math.ceil(maxScore / 10);
    const ranges = Array.from({ length: 10 }, (_, i) => ({
      label: `${i * rangeSize}-${Math.min((i + 1) * rangeSize, maxScore)}`,
      count: 0,
    }));

    // Count results in each range
    results.forEach(result => {
      const rangeIndex = Math.min(Math.floor(result.finalScore / rangeSize), 9);
      ranges[rangeIndex].count++;
    });

    return {
      labels: ranges.map(range => range.label),
      datasets: [
        {
          label: 'Number of Students',
          data: ranges.map(range => range.count),
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for performance by question chart
  const prepareQuestionPerformanceData = () => {
    if (results.length === 0 || questions.length === 0) return null;

    // Calculate correct answer percentage for each question
    // This would require additional data about which answers each student got right
    // For this demo, we'll generate synthetic data
    const questionPerformance = questions.map(question => ({
      questionNumber: question.number,
      percentCorrect: Math.floor(Math.random() * 100), // Replace with actual data
    }));

    return {
      labels: questionPerformance.map(q => `Q${q.questionNumber}`),
      datasets: [
        {
          label: '% Correct',
          data: questionPerformance.map(q => q.percentCorrect),
          backgroundColor: 'rgba(16, 185, 129, 0.7)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for grade distribution pie chart
  const prepareGradeDistributionData = () => {
    if (results.length === 0) return null;

    // Define grade ranges
    const grades = [
      { label: 'A (90-100%)', count: 0, color: 'rgba(16, 185, 129, 0.7)' },
      { label: 'B (80-89%)', count: 0, color: 'rgba(59, 130, 246, 0.7)' },
      { label: 'C (70-79%)', count: 0, color: 'rgba(139, 92, 246, 0.7)' },
      { label: 'D (60-69%)', count: 0, color: 'rgba(245, 158, 11, 0.7)' },
      { label: 'F (0-59%)', count: 0, color: 'rgba(239, 68, 68, 0.7)' },
    ];

    // Calculate percentages and assign grades
    const selectedExam = exams.find(exam => exam.id === selectedExamId);
    const maxScore = selectedExam?.totalPoints || 100;
    
    results.forEach(result => {
      const percentage = (result.finalScore / maxScore) * 100;
      
      if (percentage >= 90) {
        grades[0].count++;
      } else if (percentage >= 80) {
        grades[1].count++;
      } else if (percentage >= 70) {
        grades[2].count++;
      } else if (percentage >= 60) {
        grades[3].count++;
      } else {
        grades[4].count++;
      }
    });

    return {
      labels: grades.map(grade => grade.label),
      datasets: [
        {
          data: grades.map(grade => grade.count),
          backgroundColor: grades.map(grade => grade.color),
          borderWidth: 1,
        },
      ],
    };
  };

  const scoreDistributionData = prepareScoreDistributionData();
  const questionPerformanceData = prepareQuestionPerformanceData();
  const gradeDistributionData = prepareGradeDistributionData();

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  const calculateClassStats = () => {
    if (results.length === 0) return { average: 0, highest: 0, lowest: 0 };
    
    const scores = results.map(r => r.finalScore);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    
    return {
      average: parseFloat(average.toFixed(2)),
      highest,
      lowest,
    };
  };

  const stats = calculateClassStats();

  const selectedExam = exams.find(exam => exam.id === selectedExamId);

  return (
    <SidebarLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Analytics</h1>
        {initialExamId && (
          <Link to={`/exams/${initialExamId}`} className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft size={16} className="mr-1" />
            Back to Exam
          </Link>
        )}
      </div>
      
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0 md:w-1/3">
            <Select
              label="Select Exam"
              options={exams.map(exam => ({
                value: exam.id,
                label: exam.title,
              }))}
              value={selectedExamId}
              onChange={handleExamChange}
            />
          </div>
          
          {selectedExam && results.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500">Class Average</p>
                <p className="text-xl font-medium text-blue-600">{stats.average}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Highest Score</p>
                <p className="text-xl font-medium text-green-600">{stats.highest}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Lowest Score</p>
                <p className="text-xl font-medium text-red-600">{stats.lowest}</p>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <BarChart2 size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h2>
            <p className="text-gray-500">
              {selectedExamId 
                ? "There are no graded exams for this exam yet." 
                : "Please select an exam to view analytics."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Score Distribution">
            <div className="h-64">
              {scoreDistributionData && (
                <Bar 
                  data={scoreDistributionData} 
                  options={barOptions}
                />
              )}
            </div>
          </Card>
          
          <Card title="Question Performance">
            <div className="h-64">
              {questionPerformanceData && (
                <Bar 
                  data={questionPerformanceData} 
                  options={barOptions}
                />
              )}
            </div>
          </Card>
          
          <Card title="Grade Distribution">
            <div className="h-64 flex items-center justify-center">
              {gradeDistributionData && (
                <Pie 
                  data={gradeDistributionData} 
                  options={pieOptions}
                />
              )}
            </div>
          </Card>
          
          <Card title="Student Performance">
            <div className="max-h-64 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Correct
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {results.map((result) => (
                    <tr key={result.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {result.studentName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {result.finalScore} / {selectedExam?.totalPoints}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {result.correctAnswers} / {questions.length}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </SidebarLayout>
  );
};

export default Analytics;