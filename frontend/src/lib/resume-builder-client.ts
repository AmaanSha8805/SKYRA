import { Resume } from '@/types/resume';
import { authClient } from './auth-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ResumeBuilderClient {
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

  async generateSummary(parsedData: any): Promise<{ summary: string }> {
    return this.request<{ summary: string }>('/resumes/generate-summary', {
      method: 'POST',
      body: JSON.stringify(parsedData),
    });
  }

  async optimizeResume(resumeId: string): Promise<Resume> {
    return this.request<Resume>(`/resumes/${resumeId}/optimize`, {
      method: 'POST',
    });
  }

  async createResumeFromForm(resumeData: any, templateId: string = 'classic'): Promise<Resume> {
    return this.request<Resume>(`/resumes/create-from-form?template_id=${templateId}`, {
      method: 'POST',
      body: JSON.stringify(resumeData),
    });
  }

  async generateExperienceDescription(job_title: string, company: string, skills: string[]): Promise<{ description: string }> {
    return this.request<{ description: string }>('/resumes/generate-experience', {
      method: 'POST',
      body: JSON.stringify({ job_title, company, skills }),
    });
  }

  async generateProjectDescription(project_name: string, technologies: string[]): Promise<{ description: string }> {
    return this.request<{ description: string }>('/resumes/generate-project', {
      method: 'POST',
      body: JSON.stringify({ project_name, technologies }),
    });
  }

  async getTemplates(): Promise<any[]> {
    return this.request<any[]>('/resumes/templates', {
      method: 'GET',
    });
  }

  async regeneratePDF(resumeId: string, templateId: string = 'classic'): Promise<Resume> {
    return this.request<Resume>(`/resumes/${resumeId}/regenerate-pdf?template_id=${templateId}`, {
      method: 'POST',
    });
  }
}

export const resumeBuilderClient = new ResumeBuilderClient();
