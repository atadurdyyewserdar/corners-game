/**
 * AI Web Worker - Runs AI computation in a separate thread
 * Prevents blocking the main thread and UI during move calculation
 */

import { AIPlayer } from '../domain/ai/AIPlayer';
import { createBoardFromPieces } from '../domain/utils/boardUtils';
import { AI_DIFFICULTY_CONFIG } from '../domain/models/AI';
import type { PieceWithId } from '../domain/models/Position';
import type { PlayerType } from '../domain/models/Player';
import type { CornerShape } from '../constants/gameConfig';
import type { AIDifficulty, AIMove } from '../domain/models/AI';

/**
 * Message types sent TO the worker
 */
export type AIWorkerRequest = 
  | { 
      type: 'init'; 
      difficulty: AIDifficulty;
    }
  | { 
      type: 'compute'; 
      pieces: PieceWithId[];
      currentPlayer: PlayerType;
      cornerShape: CornerShape;
    }
  | { 
      type: 'clearCache'; 
    }
  | { 
      type: 'terminate'; 
    };

/**
 * Message types sent FROM the worker
 */
export type AIWorkerResponse = 
  | { 
      type: 'ready';
    }
  | { 
      type: 'computing';
    }
  | { 
      type: 'moveComputed'; 
      move: AIMove | null;
      computationTime: number;
    }
  | { 
      type: 'cacheCleared';
    }
  | { 
      type: 'error'; 
      error: string;
    };

// Worker state
let aiPlayer: AIPlayer | null = null;

/**
 * Handle messages from main thread
 */
self.onmessage = async (event: MessageEvent<AIWorkerRequest>) => {
  const message = event.data;

  try {
    switch (message.type) {
      case 'init': {
        const config = AI_DIFFICULTY_CONFIG[message.difficulty];
        aiPlayer = new AIPlayer(config);
        postResponse({ type: 'ready' });
        break;
      }

      case 'compute': {
        if (!aiPlayer) {
          postResponse({ 
            type: 'error', 
            error: 'AI player not initialized. Call init first.' 
          });
          return;
        }

        postResponse({ type: 'computing' });

        const startTime = performance.now();
        
        // Create board from pieces
        const board = createBoardFromPieces(message.pieces);
        
        // Compute best move (heavy computation runs here in worker thread)
        const move = aiPlayer.findBestMove(
          board,
          message.pieces,
          message.currentPlayer,
          message.cornerShape
        );

        const computationTime = performance.now() - startTime;

        postResponse({ 
          type: 'moveComputed', 
          move,
          computationTime 
        });
        break;
      }

      case 'clearCache': {
        if (aiPlayer) {
          aiPlayer.clearCache();
        }
        postResponse({ type: 'cacheCleared' });
        break;
      }

      case 'terminate': {
        aiPlayer = null;
        self.close();
        break;
      }

      default: {
        const exhaustive: never = message;
        console.warn('Unknown message type:', exhaustive);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    postResponse({ 
      type: 'error', 
      error: errorMessage 
    });
  }
};

/**
 * Handle worker errors
 */
self.addEventListener('error', (error) => {
  console.error('AI worker error:', error);
  postResponse({ 
    type: 'error', 
    error: error.message || 'Worker error occurred' 
  });
});

/**
 * Helper to post messages with type safety
 */
function postResponse(response: AIWorkerResponse): void {
  self.postMessage(response);
}
