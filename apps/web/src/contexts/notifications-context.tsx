'use client';

import * as React from 'react';
import { useMutation, useQuery } from '@apollo/client';
import {
  GET_NOTIFICATIONS,
  MARK_NOTIFICATION_AS_READ,
} from '@/graphql/operations-extended';

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

/**
 * Map a server SmartNotification type to the local presentation type + icon.
 */
function mapServerType(serverType: string): { type: Notification['type']; icon: string } {
  const normalized = (serverType || '').toLowerCase();
  if (normalized.includes('task')) return { type: 'task_reminder', icon: '⏰' };
  if (normalized.includes('goal') || normalized.includes('milestone'))
    return { type: 'goal_milestone', icon: '🎉' };
  if (normalized.includes('plan')) return { type: 'plan_ready', icon: '✨' };
  if (normalized.includes('streak') || normalized.includes('achievement'))
    return { type: 'achievement', icon: '🔥' };
  return { type: 'system', icon: '🔔' };
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  // Server notifications (SmartNotification rows) — polled for freshness.
  // errorPolicy 'all' keeps the app working when unauthenticated or offline.
  const { data } = useQuery(GET_NOTIFICATIONS, {
    variables: { unreadOnly: false },
    pollInterval: 60_000,
    errorPolicy: 'all',
    fetchPolicy: 'cache-and-network',
  });

  const [markNotificationAsRead] = useMutation(MARK_NOTIFICATION_AS_READ, {
    onError: () => {
      // Local state already updated optimistically; server sync retries on next poll
    },
  });

  // Local-only additions (client-side events) and local dismissals.
  const [localNotifications, setLocalNotifications] = React.useState<Notification[]>([]);
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = React.useState<Set<string>>(new Set());

  const serverNotifications: Notification[] = React.useMemo(() => {
    const rows: any[] = data?.notifications || [];
    return rows.map((n) => {
      const { type, icon } = mapServerType(n.type);
      const metadata = n.metadata || {};
      return {
        id: n.id,
        type,
        title: n.title,
        message: n.message,
        timestamp: new Date(n.createdAt),
        read: Boolean(n.isRead) || readIds.has(n.id),
        actionUrl: metadata.actionUrl,
        actionLabel: metadata.actionLabel,
        icon,
      };
    });
  }, [data, readIds]);

  const notifications = React.useMemo(() => {
    return [...localNotifications, ...serverNotifications]
      .filter((n) => !dismissedIds.has(n.id))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [localNotifications, serverNotifications, dismissedIds]);

  const unreadCount = React.useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const addNotification = React.useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date(),
        read: false,
      };
      setLocalNotifications((prev) => [newNotification, ...prev]);
    },
    []
  );

  const markAsRead = React.useCallback(
    (id: string) => {
      setReadIds((prev) => new Set(prev).add(id));
      setLocalNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      if (!id.startsWith('local-')) {
        markNotificationAsRead({ variables: { id } });
      }
    },
    [markNotificationAsRead]
  );

  const markAllAsRead = React.useCallback(() => {
    const unread = notifications.filter((n) => !n.read);
    setReadIds((prev) => {
      const next = new Set(prev);
      for (const n of unread) next.add(n.id);
      return next;
    });
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    for (const n of unread) {
      if (!n.id.startsWith('local-')) {
        markNotificationAsRead({ variables: { id: n.id } });
      }
    }
  }, [notifications, markNotificationAsRead]);

  const deleteNotification = React.useCallback((id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
    setLocalNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = React.useCallback(() => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      for (const n of notifications) next.add(n.id);
      return next;
    });
    setLocalNotifications([]);
  }, [notifications]);

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
