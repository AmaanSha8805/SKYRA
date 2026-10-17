import { JobMatchResponse, JobMatchRequest } from '@/types/jobs';
import { authClient } from './auth-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class JobsClient {
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

  async matchJobs(request: JobMatchRequest): Promise<JobMatchResponse> {
    return this.request<JobMatchResponse>('/jobs/match', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }
}

export const jobsClient = new JobsClient();
