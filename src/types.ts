export interface Lesson {
  id: string;
  number: number;
  title: string;
  description: string;
  durationMinutes: number;
  youtubeId: string;
  thumbnailUrl?: string;
  summary: string[];
  keyConcepts: string[];
  codeSnippet?: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: 'python' | 'web' | 'logic';
  level: 'Iniciante' | 'Intermediário' | 'Todos os níveis';
  isAvailable: boolean;
  coverImage: string;
  accentColor: string;
  totalDuration: string;
  logoType?: 'python' | 'html5' | 'css3' | 'php';
  cardTitle?: string;
  lessons: Lesson[];
  targetAudience: string;
  requirements: string[];
  toolsRecommended: { name: string; platform: string; link?: string }[];
}

export interface UserProgress {
  completedLessons: string[]; // lesson ids
  currentLessonId: string;
  quizScores: Record<string, number>; // lessonId -> score (1 or 0)
  studentName: string;
  certificateEarnedDate?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  createdAt: string;
  bio?: string;
  customNotes?: string;
}

export interface AuthSession {
  token: string;
  user: UserProfile;
  progress: UserProgress;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
  progress: UserProgress;
  message?: string;
}

export interface PasswordResetAudit {
  email: string;
  code: string;
  expiresAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  avatarText: string;
  content: string;
  highlight?: boolean;
}

export interface ModernizationTopic {
  id: string;
  title: string;
  category: 'architecture' | 'ui' | 'deploy' | 'interactivity' | 'performance';
  severity: 'high' | 'medium' | 'tip';
  before: string;
  after: string;
  explanation: string;
  codeSnippet?: {
    language: string;
    filename: string;
    code: string;
  };
}
