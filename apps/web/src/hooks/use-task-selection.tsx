'use client';

import * as React from 'react';

/**
 * Multi-task selection hook for bulk operations
 * Supports click, Shift+click, Cmd/Ctrl+click patterns
 */

export interface UseTaskSelectionOptions {
  onSelectionChange?: (selectedIds: string[]) => void;
}

export function useTaskSelection(options: UseTaskSelectionOptions = {}) {
  const [selectedTaskIds, setSelectedTaskIds] = React.useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = React.useState<string | null>(null);
  const [allTaskIds, setAllTaskIds] = React.useState<string[]>([]);

  const selectedCount = selectedTaskIds.size;
  const isAnySelected = selectedCount > 0;

  const onSelectionChangeRef = React.useRef(options.onSelectionChange);
  onSelectionChangeRef.current = options.onSelectionChange;

  React.useEffect(() => {
    onSelectionChangeRef.current?.(Array.from(selectedTaskIds));
  }, [selectedTaskIds]);

  const setAvailableTaskIds = React.useCallback((taskIds: string[]) => {
    setAllTaskIds(taskIds);
  }, []);

  const selectTask = React.useCallback((taskId: string, event?: React.MouseEvent) => {
    if (!event) {
      // Simple single selection
      setSelectedTaskIds(new Set([taskId]));
      setLastSelectedId(taskId);
      return;
    }

    const isMetaKey = event.metaKey || event.ctrlKey; // Cmd on Mac, Ctrl on Windows
    const isShiftKey = event.shiftKey;

    if (isMetaKey) {
      // Toggle selection
      setSelectedTaskIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(taskId)) {
          newSet.delete(taskId);
        } else {
          newSet.add(taskId);
        }
        return newSet;
      });
      setLastSelectedId(taskId);
    } else if (isShiftKey && lastSelectedId) {
      // Range selection
      const lastIndex = allTaskIds.indexOf(lastSelectedId);
      const currentIndex = allTaskIds.indexOf(taskId);

      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const rangeIds = allTaskIds.slice(start, end + 1);

        setSelectedTaskIds(prev => {
          const newSet = new Set(prev);
          rangeIds.forEach(id => newSet.add(id));
          return newSet;
        });
      }
    } else {
      // Replace selection
      setSelectedTaskIds(new Set([taskId]));
      setLastSelectedId(taskId);
    }
  }, [lastSelectedId, allTaskIds]);

  const toggleTask = React.useCallback((taskId: string) => {
    setSelectedTaskIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  const selectAll = React.useCallback(() => {
    setSelectedTaskIds(new Set(allTaskIds));
  }, [allTaskIds]);

  const deselectAll = React.useCallback(() => {
    setSelectedTaskIds(new Set());
    setLastSelectedId(null);
  }, []);

  const isSelected = React.useCallback((taskId: string) => {
    return selectedTaskIds.has(taskId);
  }, [selectedTaskIds]);

  const getSelectedTaskIds = React.useCallback(() => {
    return Array.from(selectedTaskIds);
  }, [selectedTaskIds]);

  return {
    selectedTaskIds: getSelectedTaskIds(),
    selectedCount,
    isAnySelected,
    selectTask,
    toggleTask,
    selectAll,
    deselectAll,
    isSelected,
    setAvailableTaskIds,
  };
}
