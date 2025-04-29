/*
  # Adicionar campo de sala aos alunos

  1. Alterações
    - Adiciona coluna `classroom` na tabela `students`
*/

ALTER TABLE students ADD COLUMN IF NOT EXISTS classroom text NOT NULL DEFAULT '';