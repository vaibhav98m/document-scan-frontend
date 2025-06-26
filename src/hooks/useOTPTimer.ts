import { useState, useEffect, useCallback } from "react";

interface UseOTPTimerReturn {
  timeLeft: number;
  isActive: boolean;
  start: () => void;
  reset: () => void;
  canResend: boolean;
}

export const useOTPTimer = (initialTime: number = 120): UseOTPTimerReturn => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const start = useCallback(() => {
    setTimeLeft(initialTime);
    setIsActive(true);
  }, [initialTime]);

  const reset = useCallback(() => {
    setTimeLeft(0);
    setIsActive(false);
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsActive(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    timeLeft,
    isActive,
    start,
    reset,
    canResend: !isActive && timeLeft === 0,
  };
};
