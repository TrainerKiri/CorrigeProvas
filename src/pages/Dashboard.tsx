import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../components/layout/SidebarLayout';
import StatCard from '../components/dashboard/StatCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FileText, Users, Award, BarChart2, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Exam, Result } from '../types';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalExams: 0,
    totalStudents: 0,
    gradedExams: 0,
    averageScore: 0,
  });
  const [recentExams, setRecentExams] = useState<Exam[]>([]);
  const [recentResults, setRecentResults] = useState<Result[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch total exams
        const { data: exams, error: examsError } = await supabase
          .from('exams')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (examsError) throw examsError;

        // Fetch total students
        const { data: students, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', user.id);

        if (studentsError) throw studentsError;

        // Fetch recent results
        const { data: results, error: resultsError } = await supabase
          .from('results')
          .select(`
            *,
            students (name),
            exams (title)
          `)
          .order('graded_at', { ascending: false })
          .limit(5);

        if (resultsError) throw resultsError;

        // Calculate stats
        const mappedResults = results.map(result => ({
          id: result.id,
          studentId: result.student_id,
          examId: result.exam_id,
          studentName: result.students?.name,
          examTitle: result.exams?.title,
          correctAnswers: result.correct_answers,
          finalScore: result.final_score,
          gradedAt: result.graded_at,
        }));

        const averageScore = mappedResults.length
          ? mappedResults.reduce((sum, result) => sum + result.finalScore, 0) / mappedResults.length
          : 0;

        setStats({
          totalExams: exams.length,
          totalStudents: students.length,
          gradedExams: mappedResults.length,
          averageScore: parseFloat(averageScore.toFixed(2)),
        });

        setRecentExams(exams.slice(0, 3).map(exam => ({
          id: exam.id,
          title: exam.title,
          date: exam.date,
          totalPoints: exam.total_points,
          scoringType: exam.scoring_type,
          createdAt: exam.created_at,
        })));

        setRecentResults(mappedResults);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <SidebarLayout>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg shadow p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Exams"
            value={stats.totalExams}
            icon={<FileText size={24} />}
            color="blue"
          />
          <StatCard
            title="Students"
            value={stats.totalStudents}
            icon={<Users size={24} />}
            color="green"
          />
          <StatCard
            title="Graded Exams"
            value={stats.gradedExams}
            icon={<Award size={24} />}
            color="purple"
          />
          <StatCard
            title="Average Score"
            value={stats.averageScore}
            icon={<BarChart2 size={24} />}
            color="amber"
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Exams">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentExams.length > 0 ? (
            <div className="space-y-4">
              {recentExams.map((exam) => (
                <Link 
                  key={exam.id}
                  to={`/exams/${exam.id}`}
                  className="block p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition"
                >
                  <h3 className="font-medium text-gray-900">{exam.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(exam.date), 'PPP')} • {exam.totalPoints} points
                  </p>
                </Link>
              ))}
              
              <div className="pt-2">
                <Link to="/exams">
                  <Button variant="outline" className="w-full">
                    View All Exams
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <FileText size={36} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 mb-4">No exams created yet</p>
              <Link to="/exams/new">
                <Button variant="primary" icon={<Plus size={16} />}>
                  Create First Exam
                </Button>
              </Link>
            </div>
          )}
        </Card>
        
        <Card title="Recent Results">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : recentResults.length > 0 ? (
            <div className="space-y-4">
              {recentResults.map((result) => (
                <div 
                  key={result.id}
                  className="p-4 border border-gray-200 rounded-md"
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{result.studentName}</h3>
                      <p className="text-sm text-gray-500">{result.examTitle}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Score: {result.finalScore}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(result.gradedAt), 'PPP')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-2">
                <Link to="/analytics">
                  <Button variant="outline" className="w-full">
                    View Analytics
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Award size={36} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500 mb-4">No results available yet</p>
              <p className="text-sm text-gray-400">
                Grade exams to see results here
              </p>
            </div>
          )}
        </Card>
      </div>
    </SidebarLayout>
  );
};

export default Dashboard;