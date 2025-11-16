'use client';

import * as React from 'react';

/**
 * Task resizing hook for calendar drag handles
 * Allows users to resize tasks by dragging top or bottom edges
 */

export interface UseTaskResizeOptions {
  onResize: (taskId: string, newDurationMinutes: number, newStartTime?: string) => void;
  minDurationMinutes?: number;
  snapToMinutes?: number;
}

export interface ResizeHandle {
  taskId: string;
  handle: 'top' | 'bottom';
  initialY: number;
  initialDuration: number;
  initialStartTime: string;
}

export function useTaskResize(options: UseTaskResizeOptions) {
  const { onResize, minDurationMinutes = 15, snapToMinutes = 15 } = options;

  const [activeResize, setActiveResize] = React.useState<ResizeHandle | null>(null);
  const [tempDuration, setTempDuration] = React.useState<number | null>(null);
  const [tempStartTime, setTempStartTime] = React.useState<string | null>(null);

  const startResize = React.useCallback(
    (
      taskId: string,
      handle: 'top' | 'bottom',
      initialY: number,
      initialDuration: number,
      initialStartTime: string
    ) => {
      setActiveResize({
        taskId,
        handle,
        initialY,
        initialDuration,
        initialStartTime,
      });
      setTempDuration(initialDuration);
      setTempStartTime(initialStartTime);
    },
    []
  );

  const handleMouseMove = React.useCallback(
    (event: MouseEvent) => {
      if (!activeResize) return;

      const deltaY = event.clientY - activeResize.initialY;

      // Convert pixels to minutes (assuming 60px = 1 hour)
      const pixelsPerHour = 60;
      const minutesPerPixel = 60 / pixelsPerHour;
      const deltaMinutes = Math.round((deltaY * minutesPerPixel) / snapToMinutes) * snapToMinutes;

      if (activeResize.handle === 'bottom') {
        // Resizing from bottom - change duration
        const newDuration = Math.max(
          minDurationMinutes,
          activeResize.initialDuration + deltaMinutes
        );
        setTempDuration(newDuration);
      } else {
        // Resizing from top - change start time and duration
        const newDuration = Math.max(
          minDurationMinutes,
          activeResize.initialDuration - deltaMinutes
        );

        // Calculate new start time
        const [hours, minutes] = activeResize.initialStartTime.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + deltaMinutes;
        const newHours = Math.floor(totalMinutes / 60);
        const newMinutes = totalMinutes % 60;
        const newStartTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;

        setTempDuration(newDuration);
        setTempStartTime(newStartTime);
      }
    },
    [activeResize, minDurationMinutes, snapToMinutes]
  );

  const handleMouseUp = React.useCallback(() => {
    if (activeResize && tempDuration !== null) {
      if (activeResize.handle === 'bottom') {
        onResize(activeResize.taskId, tempDuration);
      } else if (tempStartTime) {
        onResize(activeResize.taskId, tempDuration, tempStartTime);
      }
    }

    setActiveResize(null);
    setTempDuration(null);
    setTempStartTime(null);
  }, [activeResize, tempDuration, tempStartTime, onResize]);

  React.useEffect(() => {
    if (activeResize) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [activeResize, handleMouseMove, handleMouseUp]);

  const isResizing = (taskId?: string) => {
    if (!taskId) return activeResize !== null;
    return activeResize?.taskId === taskId;
  };

  const getResizeHandleProps = (
    taskId: string,
    handle: 'top' | 'bottom',
    initialDuration: number,
    initialStartTime: string
  ) => ({
    onMouseDown: (event: React.MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      startResize(taskId, handle, event.clientY, initialDuration, initialStartTime);
    },
    className: 'absolute left-0 right-0 h-2 cursor-ns-resize hover:bg-primary/20 transition-colors z-10',
    style: {
      [handle]: 0,
    },
  });

  return {
    isResizing,
    getResizeHandleProps,
    activeResize,
    tempDuration: activeResize && isResizing(activeResize.taskId) ? tempDuration : null,
    tempStartTime: activeResize && isResizing(activeResize.taskId) ? tempStartTime : null,
  };
}
