import { ApiResponse } from '../auth/type';

// Goal data
export interface Goal {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Goals response
export type GoalsResponse = ApiResponse<Goal[]>;

// Health Profile request
export interface HealthProfileRequest {
  dateOfBirth: string; // Format: "1990-01-15"
  gender: string;
  height: number;
  currentWeight: number;
  targetGoal: string; // Goal _id
  /** IANA timezone, e.g. "Asia/Karachi" */
  timezone: string;
  /** Public URL after upload (e.g. from settings profile photo) */
  avatar?: string;
}

// Health Profile response data (PATCH /user/health-profile)
export interface HealthProfileResponseData {
  user?: Record<string, unknown>;
  [key: string]: unknown;
}

// Health Profile response
export type HealthProfileResponse = ApiResponse<HealthProfileResponseData>;

// Questionnaire Answer
export interface QuestionnaireAnswer {
  question_id: string;
  option_id: string;
  body_system_id: string;
}

// Questionnaire Submission request
export interface QuestionnaireSubmissionRequest {
  answers: QuestionnaireAnswer[];
}

// Questionnaire Submission response data
export interface QuestionnaireSubmissionResponseData {
  message?: string;
  [key: string]: any;
}

// Questionnaire Submission response
export type QuestionnaireSubmissionResponse = ApiResponse<QuestionnaireSubmissionResponseData>;

// Question option
export interface QuestionOption {
  _id: string;
  value: string;
  emoji: string;
}

// Question
export interface Question {
  _id: string;
  question: string;
  options: QuestionOption[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Grouped question by body system
export interface GroupedQuestion {
  _id: string;
  topic: string;
  description: string;
  image: string;
  questions: Question[];
}

// Grouped questions response
export interface GroupedQuestionsResponse {
  status: boolean;
  message: string;
  data: GroupedQuestion[];
  status_code: number;
}

// User Assessment request (for submitting individual answer)
export interface UserAssessmentRequest {
  questionId: string;
  optionId: string;
}

// User Assessment response data
export interface UserAssessmentResponseData {
  message?: string;
  [key: string]: any;
}

// User Assessment response
export type UserAssessmentResponse = ApiResponse<UserAssessmentResponseData>;

