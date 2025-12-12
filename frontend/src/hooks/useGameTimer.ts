/**
 * Custom hook for managing game timer using Web Worker
 * Uses a separate thread for accurate timing even during heavy computation
 */

import { useEffect, useRef, useCallback } from 'react';
import { GameStatus } from '../domain/models/GameState';
import { GAME_CONFIG } from '../constants/gameConfig';
import type { TimerMessage, TimerResponse } from '../workers/timer.worker';

interface UseGameTimerProps {
  status: GameStatus;
  onTick: () => void;
}

export function useGameTimer({ status, onTick }: UseGameTimerProps) {
  const workerRef = useRef<Worker | null>(null);
  const onTickRef = useRef(onTick);

  // Keep onTick reference up to date without recreating worker
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  // Initialize worker once
  useEffect(() => {
    // Create worker from inline code to avoid bundling issues
    const workerCode = `
      let intervalId = null;
      
      self.onmessage = (event) => {
        const message = event.data;
        
        switch (message.type) {
          case 'start':
            if (intervalId !== null) {
              clearInterval(intervalId);
            }
            intervalId = setInterval(() => {
              self.postMessage({ type: 'tick' });
            }, message.interval);
            break;
            
          case 'stop':
            if (intervalId !== null) {
              clearInterval(intervalId);
              intervalId = null;
              self.postMessage({ type: 'stopped' });
            }
            break;
            
          case 'reset':
            if (intervalId !== null) {
              clearInterval(intervalId);
              intervalId = null;
            }
            self.postMessage({ type: 'reset' });
            break;
        }
      };
    `;

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    
    try {
      workerRef.current = new Worker(workerUrl);
      
      // Set up message handler
      workerRef.current.onmessage = (event: MessageEvent<TimerResponse>) => {
        if (event.data.type === 'tick') {
          onTickRef.current();
        }
      };

      workerRef.current.onerror = (error) => {
        console.error('Timer worker error:', error);
      };
    } catch (error) {
      console.error('Failed to create timer worker:', error);
      // Fallback to regular setInterval if worker creation fails
      workerRef.current = null;
    } finally {
      URL.revokeObjectURL(workerUrl);
    }

    // Cleanup on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'stop' } as TimerMessage);
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []); // Only create worker once

  // Control timer based on game status
  useEffect(() => {
    if (!workerRef.current) {
      // Fallback to setInterval if worker not available
      if (status === GameStatus.Playing) {
        const intervalId = setInterval(() => {
          onTickRef.current();
        }, GAME_CONFIG.timerInterval);

        return () => clearInterval(intervalId);
      }
      return;
    }

    if (status === GameStatus.Playing) {
      workerRef.current.postMessage({ 
        type: 'start', 
        interval: GAME_CONFIG.timerInterval 
      } as TimerMessage);
    } else {
      workerRef.current.postMessage({ type: 'stop' } as TimerMessage);
    }
  }, [status]);

  const resetTimer = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'reset' } as TimerMessage);
    }
  }, []);

  return { resetTimer };
}
