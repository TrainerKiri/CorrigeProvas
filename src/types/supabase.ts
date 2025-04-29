export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      exams: {
        Row: {
          id: string
          user_id: string
          title: string
          date: string
          total_points: number
          scoring_type: 'equal' | 'custom'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          date: string
          total_points: number
          scoring_type: 'equal' | 'custom'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          date?: string
          total_points?: number
          scoring_type?: 'equal' | 'custom'
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          exam_id: string
          number: number
          correct_answer: string
          points: number
          created_at: string
        }
        Insert: {
          id?: string
          exam_id: string
          number: number
          correct_answer: string
          points: number
          created_at?: string
        }
        Update: {
          id?: string
          exam_id?: string
          number?: number
          correct_answer?: string
          points?: number
          created_at?: string
        }
      }
      students: {
        Row: {
          id: string
          user_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          created_at?: string
        }
      }
      results: {
        Row: {
          id: string
          student_id: string
          exam_id: string
          correct_answers: number
          final_score: number
          graded_at: string
        }
        Insert: {
          id?: string
          student_id: string
          exam_id: string
          correct_answers: number
          final_score: number
          graded_at?: string
        }
        Update: {
          id?: string
          student_id?: string
          exam_id?: string
          correct_answers?: number
          final_score?: number
          graded_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}