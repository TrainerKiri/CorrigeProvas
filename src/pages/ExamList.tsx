import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../components/layout/SidebarLayout';
import ExamListComponent from '../components/exams/ExamList';
import Button from '../components/ui/Button';
import { FileText, Plus, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Exam } from '../types';
import Input from '../components/ui/Input';

const ExamListPage: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchExams = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('exams')
          .select(`
            *,
            questions (*)
          `)
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
          questions: exam.questions?.map(q => ({
            id: q.id,
            examId: q.exam_id,
            number: q.number,
            correctAnswer: q.correct_answer,
            points: q.points,
          })),
        }));

        setExams(mappedExams);
        setFilteredExams(mappedExams);
      } catch (error) {
        console.error('Error fetching exams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [user]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredExams(exams);
      return;
    }

    const filtered = exams.filter(exam => 
      exam.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredExams(filtered);
  }, [searchTerm, exams]);

  return (
    <SidebarLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Exams</h1>
        <Link to="/exams/new">
          <Button variant="primary" icon={<Plus size={18} />}>
            Create New Exam
          </Button>
        </Link>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="Search exams..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={18} className="text-gray-400" />}
          className="max-w-md"
        />
      </div>
      
      <ExamListComponent exams={filteredExams} loading={loading} />
    </SidebarLayout>
  );
};

export default ExamListPage;