// Shared TypeScript types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    total?: number;
  };
  errors?: string[];
}
