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
  const [classroom, setClassroom] = useState('');
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
          classroom: classroom.trim(),
        });
      
      if (error) throw error;
      
      toast.success('Aluno adicionado com sucesso!');
      navigate('/students');
    } catch (error) {
      console.error('Erro ao adicionar aluno:', error);
      toast.error('Falha ao adicionar aluno. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <SidebarLayout>
      <div className="mb-6">
        <Link to="/students" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft size={16} className="mr-1" />
          Voltar para Alunos
        </Link>
      </div>
      
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Adicionar Novo Aluno</h1>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <Input
            label="Nome do Aluno"
            placeholder="Digite o nome completo do aluno"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          
          <Input
            label="Sala"
            placeholder="Ex: 9º Ano A"
            value={classroom}
            onChange={(e) => setClassroom(e.target.value)}
            required
          />
          
          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              icon={<Save size={18} />}
            >
              Salvar Aluno
            </Button>
          </div>
        </form>
      </Card>
    </SidebarLayout>
  );
};

export default AddStudent;