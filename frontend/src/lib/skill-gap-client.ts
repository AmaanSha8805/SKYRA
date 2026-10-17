import { SkillGapAnalyzeRequest, SkillGapResponse } from '@/types/skill-gap';
import { authClient } from './auth-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class SkillGapClient {
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

  async analyzeSkillGap(request: SkillGapAnalyzeRequest): Promise<SkillGapResponse> {
    return this.request<SkillGapResponse>('/skill-gap/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const skillGapClient = new SkillGapClient();
