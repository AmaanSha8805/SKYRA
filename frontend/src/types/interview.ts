export interface QuestionOptions {
  A: string;
  B: string;
  C: string;
  D: string;
}

export interface Question {
  id: number;
  question: string;
  type: string;
  category: string;
  options: QuestionOptions;
  correct_answer: string;
  explanation: string;
}

export interface InterviewStartRequest {
  resume_id: string;
  job_title: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface InterviewStartResponse {
  questions: Question[];
}

export interface AnswerEvaluation {
  is_correct: boolean;
  score: number;
  explanation: string;
  correct_answer: string;
}

export interface InterviewAnswerRequest {
  question: string;
  selected_option: 'A' | 'B' | 'C' | 'D';
  correct_answer: string;
  explanation: string;
}

export interface InterviewAnswerResponse {
  evaluation: AnswerEvaluation;
}

export interface InterviewResult {
  question: string;
  selected_option: string;
  evaluation: AnswerEvaluation;
  questionData?: Question;
}