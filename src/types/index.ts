export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  hasAccess: boolean;
}

export interface ModuleWithCategory {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  youtubeId: string;
  duration: number;
  order: number;
  isFree: boolean;
  isPublished: boolean;
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface ProgressData {
  moduleId: string;
  completed: boolean;
  completedAt: Date | null;
}
