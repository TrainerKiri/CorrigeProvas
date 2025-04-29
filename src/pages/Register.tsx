import React from 'react';
import AuthForm from '../components/auth/AuthForm';
import { FileCheck } from 'lucide-react';

const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
          <FileCheck className="h-8 w-8 text-white" />
        </div>
        <h2 className="mt-2 text-3xl font-extrabold text-gray-900">ExamGrader</h2>
        <p className="mt-2 text-sm text-gray-600">
          Create your account to get started
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <AuthForm mode="register" />
      </div>
    </div>
  );
};

export default Register;