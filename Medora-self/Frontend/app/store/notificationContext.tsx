import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./authContext";

export type NotificationType = {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};



type NotificationContextType = {
  notifications: NotificationType[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  lastNotificationTime: Date | null;

  addNotification: (newNotification: Omit<NotificationType, "_id" | "createdAt">) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  fetchNotifications: async () => {},
  lastNotificationTime: null,
  addNotification: () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastNotificationTime, setLastNotificationTime] = useState<Date | null>(null);
  const { token } = useAuth();

  const fetchNotifications = async () => {
    if (!token) {
      console.warn("Cannot fetch notifications - no auth token");
      return;
    }

    try {
      const response = await fetch("http://192.168.162.200:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  const addNotification = (newNotification: Omit<NotificationType, "_id" | "createdAt">) => {
    const notification: NotificationType = {
      _id: `temp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...newNotification,
    };

    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => (newNotification.isRead ? prev : prev + 1));
  };

  const markAsRead = async (id: string) => {
    if (!token) {
      console.warn("Cannot mark as read - no auth token");
      return;
    }

    const originalNotifications = [...notifications];
    
    try {
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      const response = await fetch(`http://192.168.162.200:5000/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to mark as read");
      
      await fetchNotifications(); // Refresh from server after update
    } catch (error) {
      console.error("Error marking notification as read:", error);
      setNotifications(originalNotifications);
      setUnreadCount(prev => prev + 1);
    }
  };

  const markAllAsRead = async () => {
    if (!token) {
      console.warn("Cannot mark all as read - no auth token");
      return;
    }

    const originalNotifications = [...notifications];
    
    try {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);

      const response = await fetch("http://192.168.162.200:5000/api/notifications/mark-all-read", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to mark all as read");
      
      await fetchNotifications(); // Refresh from server after update
    } catch (error) {
      console.error("Error marking all as read:", error);
      setNotifications(originalNotifications);
      setUnreadCount(originalNotifications.filter(n => !n.isRead).length);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        fetchNotifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        lastNotificationTime,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};