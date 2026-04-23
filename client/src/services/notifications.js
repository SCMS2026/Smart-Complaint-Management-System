import API_URL from './apiConfig';

const API = `${API_URL}/notifications`;

// Get JWT token
export const getToken = () => {
  const token = localStorage.getItem("user_token");
  if (token && token.startsWith("Bearer ")) {
    return token.substring(7);
  }
  return token;
};

// Get all notifications with pagination
export const getNotifications = async (page = 1, limit = 10, unreadOnly = false) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(unreadOnly && { unread: 'true' })
    });

    const res = await fetch(`${API}?${params}`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!res.ok) throw new Error('Failed to fetch notifications');
    return await res.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { notifications: [], pagination: null, unreadCount: 0 };
  }
};

// Get unread count only (lightweight)
export const getUnreadCount = async () => {
  try {
    const res = await fetch(`${API}/unread`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!res.ok) throw new Error('Failed to fetch unread count');
    return await res.json();
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return { unreadCount: 0 };
  }
};

// Mark single notification as read
export const markAsRead = async (notificationId) => {
  try {
    const res = await fetch(`${API}/${notificationId}/mark-read`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!res.ok) throw new Error('Failed to mark as read');
    return await res.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return null;
  }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const res = await fetch(`${API}/mark-all-read`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!res.ok) throw new Error('Failed to mark all as read');
    return await res.json();
  } catch (error) {
    console.error('Error marking all as read:', error);
    return null;
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    const res = await fetch(`${API}/${notificationId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!res.ok) throw new Error('Failed to delete notification');
    return await res.json();
  } catch (error) {
    console.error('Error deleting notification:', error);
    return null;
  }
};

// Clear all notifications
export const clearAllNotifications = async () => {
  try {
    const res = await fetch(`${API}/clear-all`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!res.ok) throw new Error('Failed to clear notifications');
    return await res.json();
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return null;
  }
};

export default {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications
};
