import React from 'react';
import { Calendar, FileText, Users, CheckCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Exam } from '../../types';

interface ExamListProps {
  exams: Exam[];
  loading: boolean;
}

const ExamList: React.FC<ExamListProps> = ({ exams, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className="animate-pulse bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="h-24 bg-gray-200"></div>
            <div className="p-5">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="mt-4 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (exams.length === 0) {
    return (
      <Card className="text-center py-10">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FileText size={24} className="text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">No exams yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating your first exam
        </p>
        <div className="mt-6">
          <Link to="/exams/new">
            <Button variant="primary">Create New Exam</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {exams.map((exam) => (
        <Card key={exam.id} hover className="h-full">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-gray-900 line-clamp-1">
              {exam.title}
            </h3>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {exam.scoringType === 'equal' ? 'Equal Points' : 'Custom Points'}
            </span>
          </div>
          
          <div className="space-y-3 mb-5">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar size={16} className="mr-2" />
              <span>{format(new Date(exam.date), 'PPP')}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <FileText size={16} className="mr-2" />
              <span>{exam.questions?.length || 0} questions</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CheckCircle size={16} className="mr-2" />
              <span>Total: {exam.totalPoints} points</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Link to={`/exams/${exam.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
            <Link to={`/exams/${exam.id}/grade`} className="flex-1">
              <Button variant="primary" className="w-full">
                Grade Exams
              </Button>
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ExamList;