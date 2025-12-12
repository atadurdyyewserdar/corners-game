/**
 * Move validation logic for the Corners game
 */

import type { Board } from '../models/Board';
import type { Position } from '../models/Position';
import { isValidPosition, positionToKey } from '../models/Position';
import { isCellEmpty } from '../models/Board';
import { DIRECTION_ARRAY } from '../../constants/gameConfig';

/**
 * Gets all valid moves (including jumps) for a piece at a given position
 * Uses BFS-like approach to find all reachable positions through jumps
 */
export function getValidMoves(board: Board, position: Position): Position[] {
  const moves: Position[] = [];
  const visited = new Set<string>();
  
  // Add adjacent empty cells
  addAdjacentMoves(board, position, moves, visited);
  
  // Add all jump moves using DFS
  findJumpMoves(board, position, moves, visited);
  
  return moves;
}

/**
 * Adds adjacent (non-jump) moves to the moves array
 */
function addAdjacentMoves(
  board: Board,
  position: Position,
  moves: Position[],
  visited: Set<string>
): void {
  for (const { dr, dc } of DIRECTION_ARRAY) {
    const newRow = position.row + dr;
    const newCol = position.col + dc;
    
    if (
      isValidPosition(newRow, newCol) &&
      isCellEmpty(board, newRow, newCol)
    ) {
      const newPosition: Position = { row: newRow, col: newCol };
      const key = positionToKey(newPosition);
      
      if (!visited.has(key)) {
        moves.push(newPosition);
        visited.add(key);
      }
    }
  }
}

/**
 * Recursively finds all jump moves from a position
 */
function findJumpMoves(
  board: Board,
  from: Position,
  moves: Position[],
  visited: Set<string>
): void {
  for (const { dr, dc } of DIRECTION_ARRAY) {
    const midRow = from.row + dr;
    const midCol = from.col + dc;
    const jumpRow = from.row + dr * 2;
    const jumpCol = from.col + dc * 2;
    
    // Check if jump is valid: middle cell occupied, landing cell empty
    if (
      isValidPosition(jumpRow, jumpCol) &&
      isValidPosition(midRow, midCol) &&
      !isCellEmpty(board, midRow, midCol) &&
      isCellEmpty(board, jumpRow, jumpCol)
    ) {
      const jumpTarget: Position = { row: jumpRow, col: jumpCol };
      const key = positionToKey(jumpTarget);
      
      if (!visited.has(key)) {
        moves.push(jumpTarget);
        visited.add(key);
        // Continue searching for more jumps from this position
        findJumpMoves(board, jumpTarget, moves, visited);
      }
    }
  }
}

/**
 * Checks if a move from one position to another is valid
 */
export function isMoveValid(
  board: Board,
  from: Position,
  to: Position
): boolean {
  const validMoves = getValidMoves(board, from);
  return validMoves.some(move => move.row === to.row && move.col === to.col);
}
