import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { Question, Student } from '../../types';
import Select from '../ui/Select';

interface GradeExamFormProps {
  examId: string;
  questions: Question[];
  students: Student[];
  onSubmit: (studentId: string, answers: string[], score: number) => Promise<void>;
  isSubmitting: boolean;
}

const GradeExamForm: React.FC<GradeExamFormProps> = ({
  examId,
  questions,
  students,
  onSubmit,
  isSubmitting,
}) => {
  const [selectedStudent, setSelectedStudent] = useState('');
  const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(''));
  const [gradeResult, setGradeResult] = useState<{
    score: number;
    correctCount: number;
    totalQuestions: number;
    details: Array<{ question: number; isCorrect: boolean; points: number }>;
  } | null>(null);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
    
    // Clear grade result when answers change
    if (gradeResult) {
      setGradeResult(null);
    }
  };

  const handleStudentChange = (value: string) => {
    setSelectedStudent(value);
    
    // Reset answers and grade result when student changes
    setAnswers(Array(questions.length).fill(''));
    setGradeResult(null);
  };

  const handleCalculateGrade = () => {
    let totalScore = 0;
    let correctCount = 0;
    const details = [];
    
    for (let i = 0; i < questions.length; i++) {
      const isCorrect = answers[i].toUpperCase() === questions[i].correctAnswer.toUpperCase();
      const points = isCorrect ? questions[i].points : 0;
      
      if (isCorrect) {
        correctCount++;
        totalScore += points;
      }
      
      details.push({
        question: i + 1,
        isCorrect,
        points: isCorrect ? points : 0,
      });
    }
    
    setGradeResult({
      score: parseFloat(totalScore.toFixed(2)),
      correctCount,
      totalQuestions: questions.length,
      details,
    });
  };

  const handleSubmit = async () => {
    if (!gradeResult || !selectedStudent) return;
    
    await onSubmit(selectedStudent, answers, gradeResult.score);
    
    // Reset form
    setSelectedStudent('');
    setAnswers(Array(questions.length).fill(''));
    setGradeResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Grade Exam</h2>
        
        <Select
          label="Select Student"
          options={students.map(student => ({
            value: student.id,
            label: student.name,
          }))}
          value={selectedStudent}
          onChange={handleStudentChange}
        />
        
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {questions.map((question, index) => (
            <div 
              key={index}
              className={`
                p-4 border rounded-md 
                ${gradeResult ? (
                  gradeResult.details[index]?.isCorrect 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                ) : 'border-gray-200'}
              `}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Question {question.number}</h3>
                {gradeResult && (
                  gradeResult.details[index]?.isCorrect ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <AlertCircle size={16} className="text-red-600" />
                  )
                )}
              </div>
              
              <Select
                label="Student's Answer"
                options={[
                  { value: '', label: 'Select...' },
                  { value: 'A', label: 'A' },
                  { value: 'B', label: 'B' },
                  { value: 'C', label: 'C' },
                  { value: 'D', label: 'D' },
                  { value: 'E', label: 'E' },
                ]}
                value={answers[index]}
                onChange={(value) => handleAnswerChange(index, value)}
                disabled={!!gradeResult}
              />
              
              {gradeResult && (
                <div className="mt-2 text-sm">
                  <p>
                    Correct: <span className="font-medium">{question.correctAnswer}</span>
                  </p>
                  <p>
                    Points: <span className="font-medium">
                      {gradeResult.details[index]?.points}/{question.points}
                    </span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {gradeResult ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Grading Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded-md text-center">
              <p className="text-sm text-blue-600 font-medium">Total Score</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {gradeResult.score}
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-md text-center">
              <p className="text-sm text-green-600 font-medium">Correct Answers</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {gradeResult.correctCount}/{gradeResult.totalQuestions}
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-md text-center">
              <p className="text-sm text-purple-600 font-medium">Percentage</p>
              <p className="text-2xl font-bold text-purple-700 mt-1">
                {Math.round((gradeResult.score / questions.reduce((sum, q) => sum + q.points, 0)) * 100)}%
              </p>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => setGradeResult(null)}
            >
              Edit Answers
            </Button>
            
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Save Results
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={handleCalculateGrade}
            disabled={!selectedStudent || answers.some(a => !a)}
          >
            Calculate Grade
          </Button>
        </div>
      )}
    </div>
  );
};

export default GradeExamForm;