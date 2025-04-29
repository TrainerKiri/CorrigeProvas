import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SidebarLayout from '../components/layout/SidebarLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { ArrowLeft, UserPlus, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const AddStudent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('students')
        .insert({
          user_id: user.id,
          name: name.trim(),
        });
      
      if (error) throw error;
      
      toast.success('Student added successfully!');
      navigate('/students');
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SidebarLayout>
      <div className="mb-6">
        <Link to="/students" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft size={16} className="mr-1" />
          Back to Students
        </Link>
      </div>
      
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Add New Student</h1>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <Input
            label="Student Name"
            placeholder="Enter the student's full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          
          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              icon={<Save size={18} />}
            >
              Save Student
            </Button>
          </div>
        </form>
      </Card>
    </SidebarLayout>
  );
};

export default AddStudent;