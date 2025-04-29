export interface User {
  id: string;
  email: string;
}

export interface Exam {
  id: string;
  title: string;
  date: string;
  totalPoints: number;
  scoringType: 'equal' | 'custom';
  createdAt: string;
  questions?: Question[];
}

export interface Question {
  id: string;
  examId: string;
  number: number;
  correctAnswer: string;
  points: number;
}

export interface Student {
  id: string;
  name: string;
  classroom: string;
}

export interface Result {
  id: string;
  studentId: string;
  examId: string;
  studentName?: string;
  examTitle?: string;
  correctAnswers: number;
  finalScore: number;
  gradedAt: string;
}

export interface AnswerSheet {
  studentName: string;
  answers: Array<{
    questionNumber: number;
    answer: string;
  }>;
}