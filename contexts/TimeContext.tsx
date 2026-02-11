/**
 * TimeContext - Global timer for real-time updates
 * Uses a timestamp number (rounded to the minute) to minimize re-renders
 * Only components that consume this context will re-render every minute
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

interface TimeContextValue {
  currentTime: Date;
}

const TimeContext = createContext<TimeContextValue | undefined>(undefined);

export function TimeProvider({ children }: { children: ReactNode }) {
  // Store timestamp rounded to the minute for stable comparisons
  const [timestamp, setTimestamp] = useState(() => Math.floor(Date.now() / 60000));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimestamp(Math.floor(Date.now() / 60000));
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Only create a new Date when the minute changes
  const value = useMemo<TimeContextValue>(() => ({
    currentTime: new Date(timestamp * 60000),
  }), [timestamp]);

  return (
    <TimeContext.Provider value={value}>
      {children}
    </TimeContext.Provider>
  );
}

export function useCurrentTime() {
  const context = useContext(TimeContext);
  if (context === undefined) {
    throw new Error('useCurrentTime must be used within a TimeProvider');
  }
  return context.currentTime;
}
