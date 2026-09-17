import type { ApiResponse } from "../auth/type";

export type ContactRequest = {
  full_name: string;
  email: string;
  message: string;
};

export type ContactResponse = ApiResponse<null>;

export type LinkProviderResponse = ApiResponse<{
  user?: Record<string, unknown>;
  linkedProvider?: Record<string, unknown> | null;
}>;

export type ApiNotification = {
  _id?: string;
  id?: string;
  title?: string;
  body?: string;
  message?: string;
  createdAt?: string;
  created_at?: string;
  read?: boolean;
  isRead?: boolean;
  is_read?: boolean;
  type?: string;
  kind?: string;
};

export type MyNotificationsResponse = ApiResponse<ApiNotification[]>;

export type NotificationUnreadCountResponse = ApiResponse<{
  count?: number;
  unreadCount?: number;
  unread_count?: number;
}>;

export type LogoutResponse = ApiResponse<null>;

export type MarkNotificationReadResponse = ApiResponse<null>;
