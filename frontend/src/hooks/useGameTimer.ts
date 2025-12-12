/**
 * Custom hook for managing game timer
 */

import { useEffect, useRef } from 'react';
import { GameStatus } from '../domain/models/GameState';
import { GAME_CONFIG } from '../constants/gameConfig';

interface UseGameTimerProps {
  status: GameStatus;
  onTick: () => void;
}

export function useGameTimer({ status, onTick }: UseGameTimerProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (status === GameStatus.Playing) {
      intervalRef.current = setInterval(() => {
        onTick();
      }, GAME_CONFIG.timerInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [status, onTick]);

  return intervalRef;
}
