export interface Resume {
  id: string;
  user_id: string;
  title: string;
  original_filename: string;
  file_url: string;
  file_type: string;
  file_size: number;
  template_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  latest_analysis?: ResumeAnalysisSummary | null;
}

export interface ResumeVersion {
  id: string;
  resume_id: string;
  version_number: number;
  source: string;
  raw_text: string | null;
  created_at: string;
}

export interface ResumeAnalysis {
  id: string;
  resume_version_id: string;
  overall_score: number;
  ats_score: number;
  content_score: number;
  skills_score: number;
  experience_score: number;
  formatting_score: number;
  keyword_score: number;
  strengths: string[] | null;
  weaknesses: string[] | null;
  recommendations: string[] | null;
  missing_keywords: string[] | null;
  detected_skills: string[] | null;
  model_name: string;
  model_version: string;
  created_at: string;
}

export interface ResumeAnalysisSummary {
  id: string;
  overall_score: number;
  ats_score: number;
  created_at: string;
}

export interface ResumeDetail {
  resume: Resume;
  latest_version: ResumeVersion | null;
  latest_analysis: ResumeAnalysisSummary | null;
}

export interface ResumeListResponse {
  resumes: Resume[];
  total: number;
}

export interface UploadResumeData {
  file: File;
  title?: string;
}
