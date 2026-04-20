export type UserRole = 'admin' | 'guru' | 'siswa';

export interface Profile {
  id: string;
  full_name: string;
  nis?: string;
  role: UserRole;
  kelas?: string;
  created_at: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  subject: string;
  duration: number; // in minutes
  start_time: string;
  end_time: string;
  created_by: string;
  created_at: string;
}

export interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer: 'A' | 'B' | 'C' | 'D';
  points: number;
}

export interface ExamAttempt {
  id: string;
  exam_id: string;
  student_id: string;
  start_time: string;
  end_time?: string;
  score?: number;
  status: 'ongoing' | 'submitted';
}

export interface ExamResponse {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option: string;
}
