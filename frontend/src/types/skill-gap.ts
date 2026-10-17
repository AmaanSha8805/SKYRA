export interface LearningResource {
  title: string;
  url?: string;
  description?: string;
}

export interface MissingSkill {
  skill: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  learning_resources: LearningResource[];
}

export interface SkillGapAnalyzeRequest {
  resume_id: string;
  target_role: string;
}

export interface SkillGapResponse {
  current_skills: string[];
  required_skills: string[];
  missing_skills: MissingSkill[];
  strong_skills: string[];
  overall_readiness_percentage: number;
}
