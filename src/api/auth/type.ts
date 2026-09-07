// Common response structure
export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
  status_code: number;
  success?: boolean;
  errors?: string[];
}

// User role
export interface UserRole {
  _id: string;
  name: string;
  value: number;
}

// User data
export interface User {
  _id: string;
  email: string;
  phone?: string;
  fullName?: string;
  avatar?: string;
  isVerified: boolean;
  step: number;
  role?: UserRole;
  has_logged_weight_this_week?: boolean;
}

// Auth tokens
export interface AuthTokens {
  token: string | null;
  refreshToken?: string;
}

// Signup request
export interface SignupRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  email: string;
  password: string;
  confirm_password: string;
  platform: string;
  authType: string;
  deviceToken: string;
  deviceType: string;
  /** IANA timezone, e.g. "Asia/Karachi" */
  timezone: string;
  usedReferralCode?: string;
}

// Signup response data
export interface SignupResponseData {
  user: User;
  token: string | null;
}

// Signup response
export type SignupResponse = ApiResponse<SignupResponseData>;

// Login request
export interface LoginRequest {
  email: string;
  password: string;
  deviceToken: string;
}

// Login response data
export interface LoginResponseData {
  user: User;
  token: string;
  refreshToken: string;
  /** Present when API includes weekly weight logging state. */
  has_logged_weight_this_week?: boolean;
}

// Login response
export type LoginResponse = ApiResponse<LoginResponseData>;

// Verify OTP request
export interface VerifyOtpRequest {
  userId?: string;
  email: string;
  otp: string;
  isForgotPassword: boolean;
}

// Verify OTP response data (shape from POST /auth/verify-otp)
export interface VerifyOtpResponseData {
  token?: string;
  tokenType?: string;
  user?: Record<string, unknown>;
  verified?: boolean;
  refreshToken?: string;
  has_logged_weight_this_week?: boolean;
}

// Verify OTP response
export type VerifyOtpResponse = ApiResponse<VerifyOtpResponseData>;

// Resend OTP request
export interface ResendOtpRequest {
  userId: string;
  email: string;
  phone?: string;
  isForgotPassword: boolean;
}

// Resend OTP response data
export interface ResendOtpResponseData {
  user: {
    _id: string;
    email: string;
    isVerified: boolean;
  };
  token: string | null;
}

// Resend OTP response
export type ResendOtpResponse = ApiResponse<ResendOtpResponseData>;

// Forgot password request
export interface ForgotPasswordRequest {
  email: string;
  phone?: string;
}

// Forgot password response data
export interface ForgotPasswordResponseData {
  email: string;
}

// Forgot password response
export type ForgotPasswordResponse = ApiResponse<ForgotPasswordResponseData>;

// Reset password request
export interface ResetPasswordRequest {
  // userId: string;
  email: string;
  otp: string;
  newPassword: string;
}

// Reset password response data
export interface ResetPasswordResponseData {
  user: {
    _id: string;
    email: string;
  };
  token: string;
}

// Reset password response
export type ResetPasswordResponse = ApiResponse<ResetPasswordResponseData>;

/** Populated on GET /auth/me `user.linkedProvider` when the account is linked to a provider. */
export interface MeLinkedProvider {
  _id?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileImage?: string | null;
}

/** Active subscription from GET /auth/me */
export interface MeSubscription {
  _id?: string;
  autoRenewStatus?: boolean;
  cancelledAt?: string | null;
  currentPeriodEnd?: string;
  currentPeriodStart?: string;
  isTrialAvailed?: boolean;
  planId?: string;
  planName?: string;
  productId?: string;
  store?: string;
  subscriptionStatus?: string;
  subscriptionTier?: string;
  trialEnd?: string | null;
  trialStart?: string | null;
}

// User with health profile data
export interface UserWithHealthProfile extends Omit<User, "role"> {
  firstName?: string;
  lastName?: string;
  isSocial?: boolean;
  isActive?: boolean;
  roleId?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  lesson_points?: number;
  bmi?: number;
  currentWeight?: number;
  dateOfBirth?: string; // ISO date string
  gender?: string;
  height?: number;
  role?: number | UserRole; // Can be number or UserRole object
  targetGoal?: string; // Goal _id
  /** May also appear on `user` when API nests it. */
  has_logged_weight_this_week?: boolean;
  linkedProvider?: MeLinkedProvider | null;
  isSubscribed?: boolean;
  subscription?: MeSubscription | null;
}

// Get Me response data
export interface GetMeResponseData {
  user: UserWithHealthProfile;
  /** Top-level flag from GET /auth/me (optional). */
  has_logged_weight_this_week?: boolean;
  isSubscribed?: boolean;
  subscription?: MeSubscription | null;
}

// Get Me response
export type GetMeResponse = ApiResponse<GetMeResponseData>;

// Change password request
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Change password response data
export interface ChangePasswordResponseData {
  message?: string;
}

// Change password response
export type ChangePasswordResponse = ApiResponse<ChangePasswordResponseData>;
