export const AUTH = {
  SIGNUP: "/auth/signup",
  LOGIN: "/auth/login",
  VERIFY_OTP: "/auth/verify-otp",
  RESEND_OTP: "/auth/resend-otp",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  ME: "/auth/me",
  CHANGE_PASSWORD: "/auth/change-password",
} as const;

export const MAIN = {
  LOGOUT: "/auth/logout",
  CONTACT: "/contact",
  NOTIFICATIONS: "/notifications",
  NOTIFICATIONS_UNREAD_COUNT: "/notifications/unread-count",
  markNotificationRead: (id: string) =>
    `/notifications/${encodeURIComponent(id)}/read`,
  NOTIFICATIONS_MARK_ALL_READ: "/notifications/mark-all-read",
} as const;

export const UPLOAD = {
  UPLOAD_IMAGE: "/upload/file",
} as const;
