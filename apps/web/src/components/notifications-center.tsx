'use client';

import * as React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, CheckCheck, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/notifications-context';

export function NotificationsCenter() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotifications();

  const [open, setOpen] = React.useState(false);

  const handleNotificationClick = (id: string, actionUrl?: string) => {
    markAsRead(id);
    if (actionUrl) {
      setOpen(false);
    }
  };

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

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[400px] p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {unreadCount} unread
              </p>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-8 text-xs"
              >
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearAll}
                className="h-8 w-8"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Notifications list */}
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <h4 className="font-medium mb-1">No notifications</h4>
            <p className="text-sm text-muted-foreground">
              You're all caught up!
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="p-2">
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <div
                    className={cn(
                      'relative group rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer',
                      !notification.read && 'bg-primary/5'
                    )}
                  >
                    {notification.actionUrl ? (
                      <Link
                        href={notification.actionUrl}
                        onClick={() =>
                          handleNotificationClick(notification.id, notification.actionUrl)
                        }
                      >
                        <NotificationContent notification={notification} />
                      </Link>
                    ) : (
                      <div onClick={() => handleNotificationClick(notification.id)}>
                        <NotificationContent notification={notification} />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                    )}
                  </div>
                  {index < notifications.length - 1 && <Separator className="my-1" />}
                </React.Fragment>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-2">
              <Link href="/app/notifications" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-center text-xs">
                  View all notifications
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NotificationContent({ notification }: { notification: any }) {
  const icon = notification.icon || getNotificationIcon(notification.type);

  return (
    <div className="flex items-start gap-3 pl-4">
      <div className="text-2xl flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm leading-tight">{notification.title}</h4>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
          </p>
          {notification.actionLabel && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-primary font-medium">
                {notification.actionLabel}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function getNotificationIcon(type: string) {
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
}
