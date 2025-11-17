'use client';

import * as React from 'react';

/**
 * Mobile breakpoint detection hook
 * Follows Tailwind's default breakpoints
 */

const MOBILE_BREAKPOINT = 768; // md breakpoint

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Set initial value
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Modern browsers
    if (mql.addEventListener) {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }
    // Legacy browsers
    else {
      mql.addListener(onChange);
      return () => mql.removeListener(onChange);
    }
  }, []);

  return !!isMobile;
}

/**
 * Breakpoint detection hook for more granular control
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('lg');

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('sm');
      else if (width < 768) setBreakpoint('md');
      else if (width < 1024) setBreakpoint('lg');
      else if (width < 1280) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}

/**
 * Touch device detection
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = React.useState(false);

  React.useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore - legacy browsers
        (navigator.msMaxTouchPoints || 0) > 0
      );
    };

    checkTouch();
  }, []);

  return isTouch;
}
