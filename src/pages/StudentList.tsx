import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarLayout from '../components/layout/SidebarLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Plus, Users, Search, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Student } from '../types';

const StudentList: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    const fetchStudents = async () => {
      if (!user) return;

      try {
        setLoading(true);

        const { data, error } = await supabase
          .from('students')
          .select('*')
          .eq('user_id', user.id)
          .order('classroom', { ascending: true })
          .order('name', { ascending: true });

        if (error) throw error;

        const mappedStudents = data.map(student => ({
          id: student.id,
          name: student.name,
          classroom: student.classroom,
        }));

        setStudents(mappedStudents);
        setFilteredStudents(mappedStudents);
      } catch (error) {
        console.error('Erro ao buscar alunos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.classroom.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  // Agrupar alunos por sala
  const groupedStudents = filteredStudents.reduce((groups, student) => {
    const classroom = student.classroom || 'Sem Sala';
    if (!groups[classroom]) {
      groups[classroom] = [];
    }
    groups[classroom].push(student);
    return groups;
  }, {} as Record<string, Student[]>);

  return (
    <SidebarLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Alunos</h1>
        <Link to="/students/new">
          <Button variant="primary" icon={<UserPlus size={18} />}>
            Adicionar Novo Aluno
          </Button>
        </Link>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="Buscar alunos ou salas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search size={18} className="text-gray-400" />}
          className="max-w-md"
        />
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-lg shadow p-5">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : Object.keys(groupedStudents).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedStudents).map(([classroom, students]) => (
            <Card key={classroom}>
              <h2 className="text-lg font-medium text-gray-900 mb-4">{classroom}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 border border-gray-200 rounded-md hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-lg">
                        {student.name.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-900">{student.name}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-10">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Users size={24} className="text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Nenhum aluno cadastrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comece adicionando seu primeiro aluno
          </p>
          <div className="mt-6">
            <Link to="/students/new">
              <Button variant="primary">Adicionar Novo Aluno</Button>
            </Link>
          </div>
        </Card>
      )}
    </SidebarLayout>
  );
};

export default StudentList;