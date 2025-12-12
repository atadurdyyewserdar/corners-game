/**
 * Win condition detection for the Corners game
 */

import type { PieceWithId } from '../models/Position';
import type { PlayerType } from '../models/Player';
import { GAME_CONFIG, type CornerShape } from '../../constants/gameConfig';

/**
 * Checks if a player has won by placing all their pieces in the opponent's corner
 */
export function hasPlayerWon(
  pieces: PieceWithId[],
  player: PlayerType,
  corner: CornerShape
): boolean {
  return isPlayerInOpponentCorner(pieces, player, corner);
}

/**
 * Checks if a player has all their pieces in the opponent's corner
 */
export function isPlayerInOpponentCorner(
  pieces: PieceWithId[],
  player: PlayerType,
  corner: CornerShape
): boolean {
  const targetCorner = getTargetCorner(player, corner);
  const playerPieces = pieces.filter(p => p.player === player);
  
  // Check if all positions in the target corner are occupied by the player
  for (let row = targetCorner.startRow; row < targetCorner.endRow; row++) {
    for (let col = targetCorner.startCol; col < targetCorner.endCol; col++) {
      const hasPiece = playerPieces.some(
        piece => piece.row === row && piece.col === col
      );
      
      if (!hasPiece) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Gets the target corner coordinates for a player
 * Player A starts at top-left, aims for bottom-right
 * Player B starts at bottom-right, aims for top-left
 */
function getTargetCorner(
  player: PlayerType,
  corner: CornerShape
): { startRow: number; endRow: number; startCol: number; endCol: number } {
  if (player === 'A') {
    // Player A targets bottom-right
    return {
      startRow: GAME_CONFIG.boardSize - corner.rows,
      endRow: GAME_CONFIG.boardSize,
      startCol: GAME_CONFIG.boardSize - corner.cols,
      endCol: GAME_CONFIG.boardSize,
    };
  } else {
    // Player B targets top-left
    return {
      startRow: 0,
      endRow: corner.rows,
      startCol: 0,
      endCol: corner.cols,
    };
  }
}

/**
 * Gets the starting corner coordinates for a player
 */
export function getStartingCorner(
  player: PlayerType,
  corner: CornerShape
): { startRow: number; endRow: number; startCol: number; endCol: number } {
  if (player === 'A') {
    // Player A starts at top-left
    return {
      startRow: 0,
      endRow: corner.rows,
      startCol: 0,
      endCol: corner.cols,
    };
  } else {
    // Player B starts at bottom-right
    return {
      startRow: GAME_CONFIG.boardSize - corner.rows,
      endRow: GAME_CONFIG.boardSize,
      startCol: GAME_CONFIG.boardSize - corner.cols,
      endCol: GAME_CONFIG.boardSize,
    };
  }
}

/**
 * Checks if both players have won (tie condition, though unlikely)
 */
export function isTie(
  pieces: PieceWithId[],
  corner: CornerShape
): boolean {
  return (
    hasPlayerWon(pieces, 'A', corner) &&
    hasPlayerWon(pieces, 'B', corner)
  );
}
