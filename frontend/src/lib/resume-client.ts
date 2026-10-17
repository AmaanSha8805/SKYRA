import { Resume, ResumeListResponse, ResumeDetail, UploadResumeData, ResumeAnalysis } from '@/types/resume';
import { authClient } from './auth-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ResumeClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
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

  async uploadResume(data: UploadResumeData): Promise<Resume> {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.title) {
      formData.append('title', data.title);
    }

    const headers: Record<string, string> = {};
    if (authClient.getToken()) {
      headers['Authorization'] = `Bearer ${authClient.getToken()}`;
    }

    const response = await fetch(`${API_URL}/resumes/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
  }

  async listResumes(): Promise<ResumeListResponse> {
    return this.request<ResumeListResponse>('/resumes');
  }

  async getResume(resumeId: string): Promise<ResumeDetail> {
    return this.request<ResumeDetail>(`/resumes/${resumeId}`);
  }

  async deleteResume(resumeId: string): Promise<void> {
    await this.request(`/resumes/${resumeId}`, {
      method: 'DELETE',
    });
  }

  async parseResume(resumeId: string): Promise<{ parsed_data: any }> {
    return this.request<{ parsed_data: any }>(`/resumes/${resumeId}/parse`, {
      method: 'POST',
    });
  }

  async analyzeResume(resumeId: string): Promise<ResumeAnalysis> {
    return this.request<ResumeAnalysis>(`/resumes/${resumeId}/analyze`, {
      method: 'POST',
    });
  }

  async getResumeAnalysis(resumeId: string): Promise<ResumeAnalysis> {
    return this.request<ResumeAnalysis>(`/resumes/${resumeId}/analysis`);
  }
}

export const resumeClient = new ResumeClient();
