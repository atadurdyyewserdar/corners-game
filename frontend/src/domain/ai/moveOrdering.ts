/**
 * Move ordering for alpha-beta pruning optimization
 * 
 * Better move ordering = more pruning = faster search
 */

import type { PieceWithId } from '../models/Position';
import type { PlayerType } from '../models/Player';
import type { Board } from '../models/Board';
import { getValidMoves } from '../utils/moveValidation';
import { quickEvaluateMove } from './evaluation';

export interface OrderedMove {
  piece: PieceWithId;
  to: { row: number; col: number };
  score: number;
}

/**
 * Generate and order all possible moves for a player
 * Moves with higher potential are searched first
 * 
 * @param board - Current board state
 * @param pieces - All pieces on board
 * @param player - Player making the move
 * @returns Ordered array of moves (best first)
 */
export function getOrderedMoves(
  board: Board,
  pieces: PieceWithId[],
  player: PlayerType
): OrderedMove[] {
  const playerPieces = pieces.filter(p => p.player === player);
  const orderedMoves: OrderedMove[] = [];
  
  // Generate all possible moves
  for (const piece of playerPieces) {
    const validMoves = getValidMoves(board, piece);
    
    for (const move of validMoves) {
      const score = quickEvaluateMove(
        { row: piece.row, col: piece.col },
        { row: move.row, col: move.col },
        player
      );
      
      orderedMoves.push({
        piece,
        to: { row: move.row, col: move.col },
        score,
      });
    }
  }
  
  // Sort by score descending (best moves first)
  orderedMoves.sort((a, b) => b.score - a.score);
  
  return orderedMoves;
}

/**
 * Checks if there are any valid moves for the player
 */
export function hasAnyValidMoves(
  board: Board,
  pieces: PieceWithId[],
  player: PlayerType
): boolean {
  const playerPieces = pieces.filter(p => p.player === player);
  
  for (const piece of playerPieces) {
    const validMoves = getValidMoves(board, piece);
    if (validMoves.length > 0) return true;
  }
  
  return false;
}
