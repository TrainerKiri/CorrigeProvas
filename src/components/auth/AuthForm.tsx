import React, { useState } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

interface AuthFormProps {
  mode: 'login' | 'register';
}

const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let errorMessage = null;
      
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) errorMessage = error.message;
      } else {
        const { error } = await signUp(email, password);
        if (error) errorMessage = error.message;
      }
      
      if (errorMessage) {
        setError(errorMessage);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-auto">
      <div className="flex items-center justify-center mb-6">
        <User size={36} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900 ml-2">
          {mode === 'login' ? 'Sign in to ExamGrader' : 'Create your account'}
        </h1>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <Input
          type="email"
          label="Email address"
          placeholder="teacher@school.edu"
          icon={<Mail size={18} className="text-gray-400" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Input
          type="password"
          label="Password"
          placeholder="••••••••"
          icon={<Lock size={18} className="text-gray-400" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        
        <Button
          type="submit"
          variant="primary"
          className="w-full mt-4"
          isLoading={loading}
        >
          {mode === 'login' ? 'Sign in' : 'Sign up'}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          {mode === 'login' ? (
            <>
              Don't have an account?{' '}
              <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </a>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthForm;