/**
 * Position type definitions and utilities
 */

import { GAME_CONFIG } from '../../constants/gameConfig';

export interface Position {
  readonly row: number;
  readonly col: number;
}

export interface PieceWithId extends Position {
  readonly id: string;
  readonly player: import('./Player').PlayerType;
}

/**
 * Validates if a position is within the board boundaries
 */
export function isValidPosition(row: number, col: number): boolean {
  return (
    row >= 0 &&
    row < GAME_CONFIG.boardSize &&
    col >= 0 &&
    col < GAME_CONFIG.boardSize
  );
}

/**
 * Checks if a position is valid on the board
 */
export function isPositionValid(position: Position): boolean {
  return isValidPosition(position.row, position.col);
}

/**
 * Creates a position key for Set/Map usage
 */
export function positionToKey(position: Position): string {
  return `${position.row},${position.col}`;
}

/**
 * Parses a position key back to Position
 */
export function keyToPosition(key: string): Position {
  const [row, col] = key.split(',').map(Number);
  return { row, col };
}

/**
 * Checks if two positions are equal
 */
export function positionsEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

/**
 * Checks if a move is an adjacent step (not a jump)
 */
export function isAdjacentMove(from: Position, to: Position): boolean {
  const rowDiff = Math.abs(from.row - to.row);
  const colDiff = Math.abs(from.col - to.col);
  return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}
