/**
 * Path finding algorithm for jump sequences
 */

import type { Board } from '../models/Board';
import type { Position } from '../models/Position';
import { isAdjacentMove, isValidPosition, positionToKey } from '../models/Position';
import { isCellEmpty } from '../models/Board';
import { DIRECTION_ARRAY } from '../../constants/gameConfig';

/**
 * Finds the path for a jump move from one position to another using DFS
 * Returns the sequence of positions the piece travels through
 */
export function findJumpPath(
  board: Board,
  from: Position,
  to: Position
): Position[] {
  // If it's an adjacent move, no path finding needed
  if (isAdjacentMove(from, to)) {
    return [from, to];
  }
  
  // Use DFS to find the jump path
  const path: Position[] = [from];
  const visited = new Set<string>([positionToKey(from)]);
  
  if (searchJumpPath(board, from, to, path, visited)) {
    return path;
  }
  
  // If no path found, return direct path (shouldn't happen for valid moves)
  return [from, to];
}

/**
 * Recursive DFS to find jump path
 */
function searchJumpPath(
  board: Board,
  current: Position,
  target: Position,
  path: Position[],
  visited: Set<string>
): boolean {
  // Check if we reached the target
  if (current.row === target.row && current.col === target.col) {
    return true;
  }
  
  // Try all directions
  for (const { dr, dc } of DIRECTION_ARRAY) {
    const midRow = current.row + dr;
    const midCol = current.col + dc;
    const jumpRow = current.row + dr * 2;
    const jumpCol = current.col + dc * 2;
    
    // Check if jump is valid
    if (
      isValidPosition(jumpRow, jumpCol) &&
      isValidPosition(midRow, midCol) &&
      !isCellEmpty(board, midRow, midCol) &&
      isCellEmpty(board, jumpRow, jumpCol)
    ) {
      const jumpPosition: Position = { row: jumpRow, col: jumpCol };
      const key = positionToKey(jumpPosition);
      
      if (!visited.has(key)) {
        visited.add(key);
        path.push(jumpPosition);
        
        // Recursively search from this position
        if (searchJumpPath(board, jumpPosition, target, path, visited)) {
          return true;
        }
        
        // Backtrack if this path doesn't lead to target
        path.pop();
      }
    }
  }
  
  return false;
}

/**
 * Validates that a path is traversable
 */
export function isPathValid(board: Board, path: Position[]): boolean {
  if (path.length < 2) return false;
  
  for (let i = 1; i < path.length; i++) {
    const from = path[i - 1];
    const to = path[i];
    
    // Check if it's either an adjacent move or a valid jump
    if (!isAdjacentMove(from, to)) {
      const midRow = (from.row + to.row) / 2;
      const midCol = (from.col + to.col) / 2;
      
      // Must be a jump with occupied middle cell
      if (
        Math.abs(from.row - to.row) !== 2 ||
        Math.abs(from.col - to.col) !== 2 ||
        isCellEmpty(board, midRow, midCol)
      ) {
        return false;
      }
    }
  }
  
  return true;
}
