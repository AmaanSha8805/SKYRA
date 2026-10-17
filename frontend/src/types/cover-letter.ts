export interface CoverLetterGenerateRequest {
  resume_id: string;
  job_title: string;
  company_name: string;
  job_description?: string;
}

export interface CoverLetterResponse {
  cover_letter: string;
  word_count: number;
}
