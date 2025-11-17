'use client';

import * as React from 'react';

export interface Notification {
  id: string;
  type: 'task_reminder' | 'goal_milestone' | 'plan_ready' | 'achievement' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationsContext = React.createContext<NotificationsContextType | undefined>(undefined);

// Mock notifications for development
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'task_reminder',
    title: 'Task due soon',
    message: 'Deep work: Code review is starting in 30 minutes',
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 min ago
    read: false,
    actionUrl: '/week',
    actionLabel: 'View task',
    icon: '⏰',
  },
  {
    id: '2',
    type: 'goal_milestone',
    title: 'Goal milestone reached!',
    message: 'You\'ve completed 10 tasks for your Fitness goal this week',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    read: false,
    actionUrl: '/goals',
    actionLabel: 'View goals',
    icon: '🎉',
  },
  {
    id: '3',
    type: 'plan_ready',
    title: 'Weekly plan ready',
    message: 'Your AI-generated plan for next week is ready to review',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
    actionUrl: '/plans/review',
    actionLabel: 'Review plan',
    icon: '✨',
  },
  {
    id: '4',
    type: 'achievement',
    title: '7-day streak!',
    message: 'You\'ve maintained your fitness routine for 7 days straight',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    actionUrl: '/analytics',
    actionLabel: 'View analytics',
    icon: '🔥',
  },
];

export function NotificationsProvider({ children }: { children: React.Node }) {
  const [notifications, setNotifications] = React.useState<Notification[]>(mockNotifications);

  const unreadCount = React.useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  const addNotification = React.useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
        read: false,
      };
      setNotifications(prev => [newNotification, ...prev]);
    },
    []
  );

  const markAsRead = React.useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = React.useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const deleteNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = React.useCallback(() => {
    setNotifications([]);
  }, []);

  const value = React.useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
    }),
    [notifications, unreadCount, addNotification, markAsRead, markAllAsRead, deleteNotification, clearAll]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = React.useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationsProvider');
  }
  return context;
}
