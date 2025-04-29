import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../components/layout/SidebarLayout';
import ExamForm from '../components/exams/ExamForm';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CreateExam: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: {
    title: string;
    date: string;
    totalPoints: number;
    scoringType: 'equal' | 'custom';
    questions: { number: number; correctAnswer: string; points: number }[];
  }) => {
    if (!user) return;

    try {
      setIsSubmitting(true);

      // Insert the exam
      const { data: examData, error: examError } = await supabase
        .from('exams')
        .insert({
          user_id: user.id,
          title: values.title,
          date: values.date,
          total_points: values.totalPoints,
          scoring_type: values.scoringType,
        })
        .select()
        .single();

      if (examError) throw examError;

      // Insert the questions
      const questionsToInsert = values.questions.map(question => ({
        exam_id: examData.id,
        number: question.number,
        correct_answer: question.correctAnswer,
        points: question.points,
      }));

      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (questionsError) throw questionsError;

      toast.success('Exam created successfully!');
      navigate(`/exams/${examData.id}`);
    } catch (error) {
      console.error('Error creating exam:', error);
      toast.error('Failed to create exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SidebarLayout>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create New Exam</h1>
      <ExamForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </SidebarLayout>
  );
};

export default CreateExam;