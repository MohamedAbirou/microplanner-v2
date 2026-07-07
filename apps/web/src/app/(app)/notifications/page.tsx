'use client';

import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, CheckCheck, Filter, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/notifications-context';
import Link from 'next/link';

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const [filter, setFilter] = React.useState<'all' | 'unread'>('all');

  const filteredNotifications = React.useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.read);
    }
    return notifications;
  }, [notifications, filter]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_reminder':
        return '⏰';
      case 'goal_milestone':
        return '🎯';
      case 'plan_ready':
        return '✨';
      case 'achievement':
        return '🏆';
      case 'system':
        return '🔔';
      default:
        return '📌';
    }
  };

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  return (
    <div className="container max-w-4xl py-8 mp-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-[13px] text-muted-foreground mt-1">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" className="h-9" onClick={markAllAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="outline" size="sm" className="h-9" onClick={clearAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <Tabs defaultValue="all" value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2">
              {notifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-[14px] border border-border bg-accent">
          <Bell className="h-12 w-12 text-accent-foreground/60 mb-4" />
          <h3 className="text-[15px] font-semibold mb-1.5 text-accent-foreground">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
          </h3>
          <p className="text-[13px] text-muted-foreground max-w-md">
            {filter === 'unread'
              ? "You're all caught up! Check back later for new updates."
              : "You don't have any notifications yet. We'll notify you when something important happens."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <div
                className={cn(
                  'relative group rounded-[10px] p-4 border border-border hover:bg-accent/50 transition-colors',
                  !notification.read && 'bg-primary/5 border-primary/20'
                )}
              >
                {notification.actionUrl ? (
                  <Link
                    href={notification.actionUrl}
                    onClick={() => handleNotificationClick(notification.id)}
                    className="block"
                  >
                    <NotificationContent notification={notification} getIcon={getNotificationIcon} />
                  </Link>
                ) : (
                  <div onClick={() => handleNotificationClick(notification.id)} className="cursor-pointer">
                    <NotificationContent notification={notification} getIcon={getNotificationIcon} />
                  </div>
                )}

                {/* Actions */}
                <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    title="Delete notification"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Unread indicator */}
                {!notification.read && (
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationContent({
  notification,
  getIcon
}: {
  notification: any;
  getIcon: (type: string) => string;
}) {
  const icon = notification.icon || getIcon(notification.type);

  return (
    <div className="flex items-start gap-4 pl-6">
      <div className="text-3xl flex-shrink-0 mt-1">{icon}</div>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between gap-4 pr-16">
          <h4 className="font-semibold text-base leading-tight">{notification.title}</h4>
          <time className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
          </time>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {notification.message}
        </p>
        {notification.actionLabel && (
          <div className="pt-1">
            <span className="text-sm text-primary font-medium">
              {notification.actionLabel} →
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
