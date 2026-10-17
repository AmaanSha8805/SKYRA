export interface CareerRoadmapPhase {
  phase_number: number;
  title: string;
  duration: string;
  goals: string[];
  skills_to_learn: string[];
  milestones: string[];
}

export interface CareerRoadmapGenerateRequest {
  resume_id: string;
  target_role: string;
  timeline_months: number;
}

export interface CareerRoadmapResponse {
  target_role: string;
  timeline_months: number;
  phases: CareerRoadmapPhase[];
  overall_strategy: string;
}
