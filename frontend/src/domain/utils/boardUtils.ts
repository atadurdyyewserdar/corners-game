/**
 * Board utility functions for game piece management
 */

import type { Board } from '../models/Board';
import type { PieceWithId } from '../models/Position';
import type { PlayerType } from '../models/Player';
import { createEmptyBoard, isCellEmpty } from '../models/Board';
import { isValidPosition } from '../models/Position';
import { GAME_CONFIG, type CornerShape } from '../../constants/gameConfig';

/**
 * Custom error class for game-related errors
 */
export class GameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameError';
  }
}

/**
 * Creates initial pieces for both players based on corner shape
 */
export function createInitialPieces(corner: CornerShape): PieceWithId[] {
  const pieces: PieceWithId[] = [];
  
  // Player A: top-left corner
  pieces.push(...createPiecesForPlayer('A', corner, { row: 0, col: 0 }));
  
  // Player B: bottom-right corner
  const startRow = GAME_CONFIG.boardSize - corner.rows;
  const startCol = GAME_CONFIG.boardSize - corner.cols;
  pieces.push(...createPiecesForPlayer('B', corner, { row: startRow, col: startCol }));
  
  return pieces;
}

/**
 * Creates pieces for a specific player at a given starting position
 */
function createPiecesForPlayer(
  player: PlayerType,
  corner: CornerShape,
  startPosition: { row: number; col: number }
): PieceWithId[] {
  const pieces: PieceWithId[] = [];
  let pieceId = 1;
  
  for (let row = 0; row < corner.rows; row++) {
    for (let col = 0; col < corner.cols; col++) {
      const actualRow = startPosition.row + row;
      const actualCol = startPosition.col + col;
      
      if (!isValidPosition(actualRow, actualCol)) {
        throw new GameError(
          `Invalid piece position for Player ${player}: [${actualRow}, ${actualCol}]`
        );
      }
      
      pieces.push({
        id: `${player}-${pieceId++}`,
        player,
        row: actualRow,
        col: actualCol,
      });
    }
  }
  
  return pieces;
}

/**
 * Deep clones an array of pieces
 */
export function clonePieces(pieces: PieceWithId[]): PieceWithId[] {
  return pieces.map(piece => ({ ...piece }));
}

/**
 * Converts pieces array to board matrix with validation
 */
export function getBoardFromPieces(pieces: PieceWithId[]): Board {
  const board = createEmptyBoard();
  
  for (const piece of pieces) {
    if (!isValidPosition(piece.row, piece.col)) {
      throw new GameError(
        `Invalid piece position: [${piece.row}, ${piece.col}]`
      );
    }
    
    if (!isCellEmpty(board, piece.row, piece.col)) {
      throw new GameError(
        `Cell [${piece.row}, ${piece.col}] is already occupied`
      );
    }
    
    board[piece.row][piece.col] = piece.player;
  }
  
  return board;
}

/**
 * Alias for getBoardFromPieces (for consistency with AI code)
 */
export const createBoardFromPieces = getBoardFromPieces;

/**
 * Gets the goal corner positions for a player
 */
export function getGoalCornerPositions(player: PlayerType): Array<{ row: number; col: number }> {
  const boardSize = GAME_CONFIG.boardSize;
  const positions: Array<{ row: number; col: number }> = [];
  
  if (player === 'A') {
    // Player A's goal is bottom-right corner (where B starts)
    for (let row = boardSize - 3; row < boardSize; row++) {
      for (let col = boardSize - 3; col < boardSize; col++) {
        positions.push({ row, col });
      }
    }
  } else {
    // Player B's goal is top-left corner (where A starts)
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        positions.push({ row, col });
      }
    }
  }
  
  return positions;
}

/**
 * Finds a piece at a specific position
 */
export function findPieceAt(
  pieces: PieceWithId[],
  row: number,
  col: number
): PieceWithId | undefined {
  return pieces.find(piece => piece.row === row && piece.col === col);
}

/**
 * Gets all pieces for a specific player
 */
export function getPiecesForPlayer(
  pieces: PieceWithId[],
  player: PlayerType
): PieceWithId[] {
  return pieces.filter(piece => piece.player === player);
}

/**
 * Updates a piece's position in the pieces array
 */
export function movePiece(
  pieces: PieceWithId[],
  pieceId: string,
  newRow: number,
  newCol: number
): PieceWithId[] {
  if (!isValidPosition(newRow, newCol)) {
    throw new GameError(`Invalid move position: [${newRow}, ${newCol}]`);
  }
  
  return pieces.map(piece =>
    piece.id === pieceId
      ? { ...piece, row: newRow, col: newCol }
      : piece
  );
}
