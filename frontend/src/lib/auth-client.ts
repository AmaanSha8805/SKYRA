import { LoginRequest, RegisterRequest, ChangePasswordRequest, AuthResponse, AuthError, ValidationError } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class AuthClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

getToken(): string | null {
    if (typeof window !== 'undefined') {
      const localStorageToken = localStorage.getItem('access_token');
      if (localStorageToken) {
        this.token = localStorageToken;
      }
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error: AuthError = await response.json().catch(() => ({ detail: 'An error occurred' }));
        throw new Error(this.parseErrorMessage(error, response.status));
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        // Re-throw errors that were already handled above
        if (error.message.includes('Invalid email or password') || 
            error.message.includes('Email already registered') ||
            error.message.includes('User account is inactive') ||
            error.message.includes('Access denied') ||
            error.message.includes('Server error') ||
            error.message.includes('Invalid request data') ||
            error.message.includes('The requested resource was not found')) {
          throw error;
        }
        // Handle network errors (including when backend is unavailable)
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          throw new Error('Network error: Unable to connect to the server. Please ensure the backend is running and try again.');
        }
        // Handle other network-related errors
        throw new Error('Network error: Unable to connect to the server. Please check your connection and try again.');
      }
      throw new Error('An unexpected error occurred');
    }
  }

  private parseErrorMessage(error: AuthError, status: number): string {
    // Handle string detail
    if (typeof error.detail === 'string') {
      return error.detail;
    }

    // Handle validation errors array
    if (Array.isArray(error.detail)) {
      const validationErrors = error.detail as ValidationError[];
      if (validationErrors.length > 0) {
        // Extract the message from the first validation error
        const firstError = validationErrors[0];
        if (firstError.msg) {
          return firstError.msg;
        }
        // Fallback to stringifying the whole error
        return JSON.stringify(error.detail);
      }
    }

    // Handle specific HTTP status codes
    switch (status) {
      case 401:
        return 'Invalid email or password';
      case 403:
        return 'Access denied. Your account may be inactive.';
      case 404:
        return 'The requested resource was not found';
      case 422:
        return 'Invalid request data. Please check your input';
      case 500:
        return 'Server error. Please try again later';
      default:
        return 'Request failed';
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(data.access_token);
    return data;
  }

  async register(credentials: RegisterRequest): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(data.access_token);
    return data;
  }

  async getCurrentUser(): Promise<AuthResponse['user']> {
    return this.request<AuthResponse['user']>('/auth/me');
  }

  async changePassword(credentials: ChangePasswordRequest): Promise<void> {
    await this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(credentials),
    });
  }

  logout() {
    this.clearToken();
  }

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      const localStorageToken = localStorage.getItem('access_token');
      if (localStorageToken) {
        this.token = localStorageToken;
        return true;
      }
    }
    return !!this.token;
  }
}

export const authClient = new AuthClient();
