import React, { useState } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Minus, Plus, Save } from 'lucide-react';
import { Question } from '../../types';

interface ExamFormProps {
  initialValues?: {
    title: string;
    date: string;
    totalPoints: number;
    scoringType: 'equal' | 'custom';
    questions: Question[];
  };
  onSubmit: (values: {
    title: string;
    date: string;
    totalPoints: number;
    scoringType: 'equal' | 'custom';
    questions: { number: number; correctAnswer: string; points: number }[];
  }) => void;
  isSubmitting: boolean;
}

const ExamForm: React.FC<ExamFormProps> = ({
  initialValues = {
    title: '',
    date: new Date().toISOString().split('T')[0],
    totalPoints: 10,
    scoringType: 'equal',
    questions: [],
  },
  onSubmit,
  isSubmitting,
}) => {
  const [title, setTitle] = useState(initialValues.title);
  const [date, setDate] = useState(initialValues.date);
  const [totalPoints, setTotalPoints] = useState(initialValues.totalPoints);
  const [scoringType, setScoringType] = useState<'equal' | 'custom'>(initialValues.scoringType);
  
  const [questions, setQuestions] = useState<Array<{
    number: number;
    correctAnswer: string;
    points: number;
  }>>(
    initialValues.questions.length > 0
      ? initialValues.questions.map(q => ({
          number: q.number,
          correctAnswer: q.correctAnswer,
          points: q.points,
        }))
      : [{ number: 1, correctAnswer: 'A', points: scoringType === 'equal' ? totalPoints / 1 : 1 }]
  );
  
  const handleAddQuestion = () => {
    const newQuestionNumber = questions.length + 1;
    setQuestions([
      ...questions,
      {
        number: newQuestionNumber,
        correctAnswer: 'A',
        points: scoringType === 'equal' 
          ? parseFloat((totalPoints / newQuestionNumber).toFixed(2)) 
          : 1,
      },
    ]);
    
    // Recalculate points for all questions if scoring type is equal
    if (scoringType === 'equal') {
      const pointsPerQuestion = parseFloat((totalPoints / (questions.length + 1)).toFixed(2));
      setQuestions(prev => 
        prev.map(q => ({ ...q, points: pointsPerQuestion }))
      );
    }
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return;
    
    const newQuestions = questions.filter((_, i) => i !== index);
    
    // Renumber remaining questions
    const renumberedQuestions = newQuestions.map((q, i) => ({
      ...q,
      number: i + 1,
    }));
    
    setQuestions(renumberedQuestions);
    
    // Recalculate points for all questions if scoring type is equal
    if (scoringType === 'equal') {
      const pointsPerQuestion = parseFloat((totalPoints / renumberedQuestions.length).toFixed(2));
      setQuestions(prev => 
        prev.map(q => ({ ...q, points: pointsPerQuestion }))
      );
    }
  };

  const handleQuestionChange = (index: number, field: string, value: string | number) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value,
    };
    setQuestions(newQuestions);
  };

  const handleScoringTypeChange = (value: string) => {
    const newScoringType = value as 'equal' | 'custom';
    setScoringType(newScoringType);
    
    if (newScoringType === 'equal') {
      const pointsPerQuestion = parseFloat((totalPoints / questions.length).toFixed(2));
      setQuestions(prev => 
        prev.map(q => ({ ...q, points: pointsPerQuestion }))
      );
    }
  };

  const handleTotalPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTotalPoints = parseFloat(e.target.value);
    setTotalPoints(newTotalPoints);
    
    if (scoringType === 'equal') {
      const pointsPerQuestion = parseFloat((newTotalPoints / questions.length).toFixed(2));
      setQuestions(prev => 
        prev.map(q => ({ ...q, points: pointsPerQuestion }))
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      date,
      totalPoints,
      scoringType,
      questions,
    });
  };

  // Calculate actual total from questions
  const actualTotal = questions.reduce((sum, q) => sum + q.points, 0);
  const isPointsValid = Math.abs(actualTotal - totalPoints) < 0.01; // Allow for floating point imprecision

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Exam Details</h2>
        
        <Input
          label="Exam Title"
          placeholder="Midterm Exam"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        
        <Input
          type="date"
          label="Exam Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="number"
            label="Total Points"
            min="1"
            step="0.5"
            value={totalPoints}
            onChange={handleTotalPointsChange}
            required
          />
          
          <Select
            label="Scoring Type"
            options={[
              { value: 'equal', label: 'Equal points per question' },
              { value: 'custom', label: 'Custom points per question' },
            ]}
            value={scoringType}
            onChange={handleScoringTypeChange}
          />
        </div>
        
        {!isPointsValid && scoringType === 'custom' && (
          <div className="mt-2 text-sm text-amber-600">
            Warning: The sum of question points ({actualTotal.toFixed(2)}) doesn't match the total points ({totalPoints}).
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Questions & Answer Key</h2>
          <Button 
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddQuestion}
            icon={<Plus size={16} />}
          >
            Add Question
          </Button>
        </div>
        
        <div className="space-y-4">
          {questions.map((question, index) => (
            <div 
              key={index}
              className="p-4 border border-gray-200 rounded-md"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Question {question.number}</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveQuestion(index)}
                  disabled={questions.length <= 1}
                  icon={<Minus size={16} />}
                >
                  Remove
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Correct Answer"
                  options={[
                    { value: 'A', label: 'A' },
                    { value: 'B', label: 'B' },
                    { value: 'C', label: 'C' },
                    { value: 'D', label: 'D' },
                    { value: 'E', label: 'E' },
                  ]}
                  value={question.correctAnswer}
                  onChange={(value) => handleQuestionChange(index, 'correctAnswer', value)}
                />
                
                <Input
                  type="number"
                  label="Points"
                  min="0.5"
                  step="0.5"
                  value={question.points}
                  onChange={(e) => handleQuestionChange(index, 'points', parseFloat(e.target.value))}
                  disabled={scoringType === 'equal'}
                  required
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          icon={<Save size={18} />}
          disabled={!isPointsValid}
        >
          Save Exam
        </Button>
      </div>
    </form>
  );
};

export default ExamForm;