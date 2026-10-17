import { CoverLetterGenerateRequest, CoverLetterResponse } from '@/types/cover-letter';
import { authClient } from './auth-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class CoverLetterClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (authClient.getToken()) {
      headers['Authorization'] = `Bearer ${authClient.getToken()}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }

    return response.json();
  }

  async generateCoverLetter(request: CoverLetterGenerateRequest): Promise<CoverLetterResponse> {
    return this.request<CoverLetterResponse>('/cover-letter/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const coverLetterClient = new CoverLetterClient();
