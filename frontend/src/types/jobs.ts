export interface ApplyLinks {
  linkedin: string;
  naukri: string;
  indeed: string;
}

export interface MatchedJob {
  rank: number;
  job_title: string;
  company_type: string;
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  reason: string;
  salary_range: string;
  location_type: string;
  apply_links: ApplyLinks;
}

export interface JobMatchResponse {
  matched_jobs: MatchedJob[];
}

export interface JobMatchRequest {
  resume_id: string;
}