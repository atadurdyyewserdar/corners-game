/**
 * Board type definitions and utilities
 */

import type { Player } from './Player';
import { GAME_CONFIG } from '../../constants/gameConfig';

export type Board = Player[][];

/**
 * Creates an empty board filled with nulls
 */
export function createEmptyBoard(): Board {
  return Array.from({ length: GAME_CONFIG.boardSize }, () =>
    Array.from({ length: GAME_CONFIG.boardSize }, () => null)
  );
}

/**
 * Creates a deep copy of a board
 */
export function cloneBoard(board: Board): Board {
  return board.map(row => [...row]);
}

/**
 * Checks if a cell on the board is empty
 */
export function isCellEmpty(board: Board, row: number, col: number): boolean {
  return board[row]?.[col] === null;
}

/**
 * Gets the player at a specific position
 */
export function getPlayerAt(board: Board, row: number, col: number): Player {
  return board[row]?.[col] ?? null;
}
