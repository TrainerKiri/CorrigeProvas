import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ExamList from './pages/ExamList';
import CreateExam from './pages/CreateExam';
import ExamDetail from './pages/ExamDetail';
import PrintAnswerSheet from './pages/PrintAnswerSheet';
import GradeExams from './pages/GradeExams';
import StudentList from './pages/StudentList';
import AddStudent from './pages/AddStudent';
import Analytics from './pages/Analytics';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? element : <Navigate to="/login" />;
};

// Public Route wrapper (redirects to dashboard if logged in)
const PublicRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/" /> : element;
};

// App Routes
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute element={<Login />} />} />
      <Route path="/register" element={<PublicRoute element={<Register />} />} />
      
      <Route path="/" element={<ProtectedRoute element={<Dashboard />} />} />
      <Route path="/exams" element={<ProtectedRoute element={<ExamList />} />} />
      <Route path="/exams/new" element={<ProtectedRoute element={<CreateExam />} />} />
      <Route path="/exams/:id" element={<ProtectedRoute element={<ExamDetail />} />} />
      <Route path="/exams/:id/print" element={<ProtectedRoute element={<PrintAnswerSheet />} />} />
      <Route path="/exams/:id/grade" element={<ProtectedRoute element={<GradeExams />} />} />
      
      <Route path="/students" element={<ProtectedRoute element={<StudentList />} />} />
      <Route path="/students/new" element={<ProtectedRoute element={<AddStudent />} />} />
      
      <Route path="/analytics" element={<ProtectedRoute element={<Analytics />} />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;