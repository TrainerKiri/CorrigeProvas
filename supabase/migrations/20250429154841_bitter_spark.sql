/*
  # Criação das tabelas iniciais do sistema

  1. Novas Tabelas
    - `exams` (provas)
      - `id` (uuid, chave primária)
      - `user_id` (uuid, referência ao usuário)
      - `title` (texto, título da prova)
      - `date` (data da prova)
      - `total_points` (pontuação total)
      - `scoring_type` (tipo de pontuação: igual ou personalizado)
      - `created_at` (data de criação)

    - `questions` (questões)
      - `id` (uuid, chave primária)
      - `exam_id` (uuid, referência à prova)
      - `number` (número da questão)
      - `correct_answer` (resposta correta)
      - `points` (pontos da questão)
      - `created_at` (data de criação)

    - `students` (alunos)
      - `id` (uuid, chave primária)
      - `user_id` (uuid, referência ao usuário)
      - `name` (nome do aluno)
      - `created_at` (data de criação)

    - `results` (resultados)
      - `id` (uuid, chave primária)
      - `student_id` (uuid, referência ao aluno)
      - `exam_id` (uuid, referência à prova)
      - `correct_answers` (número de acertos)
      - `final_score` (nota final)
      - `graded_at` (data da correção)

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas de acesso baseadas no user_id
*/

-- Criar tabela de provas
CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  date date NOT NULL,
  total_points numeric(5,2) NOT NULL,
  scoring_type text CHECK (scoring_type IN ('equal', 'custom')) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Criar tabela de questões
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  number integer NOT NULL,
  correct_answer char(1) CHECK (correct_answer IN ('A', 'B', 'C', 'D', 'E')) NOT NULL,
  points numeric(5,2) NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Criar tabela de alunos
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Criar tabela de resultados
CREATE TABLE IF NOT EXISTS results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE NOT NULL,
  correct_answers integer NOT NULL,
  final_score numeric(5,2) NOT NULL,
  graded_at timestamptz DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para provas
CREATE POLICY "Usuários podem ver suas próprias provas"
  ON exams FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias provas"
  ON exams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Políticas de segurança para questões
CREATE POLICY "Usuários podem ver questões de suas provas"
  ON questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exams
      WHERE exams.id = exam_id
      AND exams.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar questões para suas provas"
  ON questions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exams
      WHERE exams.id = exam_id
      AND exams.user_id = auth.uid()
    )
  );

-- Políticas de segurança para alunos
CREATE POLICY "Usuários podem ver seus próprios alunos"
  ON students FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem adicionar alunos"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Políticas de segurança para resultados
CREATE POLICY "Usuários podem ver resultados de suas provas"
  ON results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exams
      WHERE exams.id = exam_id
      AND exams.user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem adicionar resultados para suas provas"
  ON results FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM exams
      WHERE exams.id = exam_id
      AND exams.user_id = auth.uid()
    )
  );