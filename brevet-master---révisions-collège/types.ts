
export enum Subject {
  MATHS = 'Mathématiques',
  FRENCH = 'Français',
  HISTORY_GEO = 'Histoire-Géographie & EMC',
  SCIENCES = 'Sciences'
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface SubjectInfo {
  id: Subject;
  icon: string;
  color: string;
  topics: string[];
}

export interface LastQuizScore {
  subject: string;
  subjectIcon: string;
  topic: string;
  score: number;
  total: number;
  date: string;
}

export interface RevisionSession {
  id: string;
  subject: string;
  subjectIcon: string;
  topic: string;
  score: number;
  total: number;
  date: string;
  timestamp: number;
}

export type ReminderFrequency = 'daily' | 'weekly';

export interface Reminder {
  id: string;
  subjectId: string;
  topic?: string;
  frequency: ReminderFrequency;
  dayOfWeek?: number; // 0-6 pour weekly
  time: string; // "HH:mm"
  isActive: boolean;
  createdAt: number;
}
