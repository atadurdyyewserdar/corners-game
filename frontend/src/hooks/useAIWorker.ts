/**
 * Custom hook for managing AI Web Worker
 * Handles worker lifecycle, message passing, and computation requests
 */

import { useRef, useCallback, useEffect } from 'react';
import type { AIWorkerRequest, AIWorkerResponse } from '../workers/ai.worker';
import type { AIDifficulty, AIMove } from '../domain/models/AI';
import type { PieceWithId } from '../domain/models/Position';
import type { PlayerType } from '../domain/models/Player';
import type { CornerShape } from '../constants/gameConfig';

interface UseAIWorkerReturn {
  initializeWorker: (difficulty: AIDifficulty) => Promise<void>;
  computeMove: (
    pieces: PieceWithId[],
    currentPlayer: PlayerType,
    cornerShape: CornerShape
  ) => Promise<AIMove | null>;
  evaluatePosition: (
    pieces: PieceWithId[],
    currentPlayer: PlayerType
  ) => Promise<number>;
  clearCache: () => void;
  isComputing: boolean;
  lastComputationTime: number | null;
}

/**
 * Hook to manage AI computation in a Web Worker
 * Prevents UI blocking during heavy AI calculations
 */
export function useAIWorker(): UseAIWorkerReturn {
  const workerRef = useRef<Worker | null>(null);
  const isComputingRef = useRef(false);
  const lastComputationTimeRef = useRef<number | null>(null);
  const pendingPromiseRef = useRef<{
    resolve: (move: AIMove | null) => void;
    reject: (error: Error) => void;
  } | null>(null);
  const pendingEvaluationRef = useRef<{
    resolve: (score: number) => void;
    reject: (error: Error) => void;
  } | null>(null);

  /**
   * Initialize the worker and AI player
   */
  const initializeWorker = useCallback(async (difficulty: AIDifficulty): Promise<void> => {
    return new Promise((resolve, reject) => {
      try {
        // Terminate existing worker if any
        if (workerRef.current) {
          workerRef.current.terminate();
          workerRef.current = null;
        }

        // Create new worker
        workerRef.current = new Worker(
          new URL('../workers/ai.worker.ts', import.meta.url),
          { type: 'module' }
        );

        // Set up message handler
        workerRef.current.onmessage = (event: MessageEvent<AIWorkerResponse>) => {
          handleWorkerMessage(event.data);
        };

        // Set up error handler
        workerRef.current.onerror = (error) => {
          console.error('AI Worker error:', error);
          isComputingRef.current = false;
          
          if (pendingPromiseRef.current) {
            pendingPromiseRef.current.reject(
              new Error(`Worker error: ${error.message}`)
            );
            pendingPromiseRef.current = null;
          }
        };

        // Initialize the AI with difficulty
        const initTimeout = setTimeout(() => {
          reject(new Error('Worker initialization timeout'));
        }, 5000);

        const handleReady = (response: AIWorkerResponse) => {
          if (response.type === 'ready') {
            clearTimeout(initTimeout);
            workerRef.current?.removeEventListener('message', handleReady as EventListener);
            resolve();
          } else if (response.type === 'error') {
            clearTimeout(initTimeout);
            reject(new Error(response.error));
          }
        };

        workerRef.current.addEventListener('message', handleReady as EventListener);
        
        workerRef.current.postMessage({
          type: 'init',
          difficulty
        } as AIWorkerRequest);

      } catch (error) {
        reject(error instanceof Error ? error : new Error('Failed to initialize worker'));
      }
    });
  }, []);

  /**
   * Compute the best move for AI
   */
  const computeMove = useCallback(
    async (
      pieces: PieceWithId[],
      currentPlayer: PlayerType,
      cornerShape: CornerShape
    ): Promise<AIMove | null> => {
      if (!workerRef.current) {
        throw new Error('Worker not initialized. Call initializeWorker first.');
      }

      if (isComputingRef.current) {
        throw new Error('Worker is already computing a move');
      }

      return new Promise((resolve, reject) => {
        isComputingRef.current = true;
        pendingPromiseRef.current = { resolve, reject };

        workerRef.current!.postMessage({
          type: 'compute',
          pieces,
          currentPlayer,
          cornerShape
        } as AIWorkerRequest);
      });
    },
    []
  );

  /**
   * Evaluate current position and return a score
   * Positive score = advantage for current player
   */
  const evaluatePosition = useCallback(
    async (
      pieces: PieceWithId[],
      currentPlayer: PlayerType
    ): Promise<number> => {
      if (!workerRef.current) {
        // If worker not ready, return neutral score
        return 0;
      }

      return new Promise((resolve, reject) => {
        pendingEvaluationRef.current = { resolve, reject };

        workerRef.current!.postMessage({
          type: 'evaluate',
          pieces,
          currentPlayer
        } as AIWorkerRequest);
      });
    },
    []
  );

  /**
   * Clear the AI's transposition table cache
   */
  const clearCache = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({
        type: 'clearCache'
      } as AIWorkerRequest);
    }
  }, []);

  /**
   * Handle messages from the worker
   */
  const handleWorkerMessage = (response: AIWorkerResponse) => {
    switch (response.type) {
      case 'computing':
        // AI has started computing
        break;

      case 'moveComputed':
        isComputingRef.current = false;
        lastComputationTimeRef.current = response.computationTime;
        
        if (pendingPromiseRef.current) {
          pendingPromiseRef.current.resolve(response.move);
          pendingPromiseRef.current = null;
        }
        break;

      case 'evaluated':
        if (pendingEvaluationRef.current) {
          pendingEvaluationRef.current.resolve(response.score);
          pendingEvaluationRef.current = null;
        }
        break;

      case 'error':
        isComputingRef.current = false;
        
        if (pendingPromiseRef.current) {
          pendingPromiseRef.current.reject(new Error(response.error));
          pendingPromiseRef.current = null;
        }
        break;

      case 'ready':
        // Handled during initialization
        break;

      case 'cacheCleared':
        // Cache cleared successfully
        break;

      default: {
        const exhaustive: never = response;
        console.warn('Unknown response type:', exhaustive);
      }
    }
  };

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'terminate' } as AIWorkerRequest);
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  return {
    initializeWorker,
    computeMove,
    evaluatePosition,
    clearCache,
    isComputing: isComputingRef.current,
    lastComputationTime: lastComputationTimeRef.current,
  };
}
