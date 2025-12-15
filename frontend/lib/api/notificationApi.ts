import apiClient from "./apiClient";

export interface Notification {
  _id: string;
  type: 
    | "batch_complete"
    | "error"
    | "exam_completed"
    | "student_added"
    | "course_updated"
    | "system_alert"
    | "score_uploaded"
    | "analysis_complete";
  title: string;
  message: string;
  read: boolean;
  link?: string | null;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  success: boolean;
  data: Notification[];
  unreadCount: number;
}

class NotificationApi {
  // Get all notifications
  async getNotifications(limit = 50, unreadOnly = false): Promise<NotificationResponse> {
    const response = await apiClient.get("/notifications", {
      params: { limit, unreadOnly },
    });
    return response.data;
  }

  // Mark notification as read
  async markAsRead(id: string): Promise<void> {
    await apiClient.put(`/notifications/${id}/read`);
  }

  // Mark all as read
  async markAllAsRead(): Promise<void> {
    await apiClient.put("/notifications/read-all");
  }

  // Delete notification
  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  }
}

export const notificationApi = new NotificationApi();

