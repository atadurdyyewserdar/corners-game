/**
 * AI position evaluation heuristics
 * 
 * Evaluates board position from perspective of given player
 * Higher score = better for that player
 */

import type { PieceWithId } from '../models/Position';
import type { PlayerType } from '../models/Player';
import { GAME_CONFIG } from '../../constants/gameConfig';
import { getGoalCornerPositions } from '../utils/boardUtils';
import { getValidMoves } from '../utils/moveValidation';
import type { Board } from '../models/Board';

/**
 * Calculates Manhattan distance between two points
 */
function manhattanDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

/**
 * Calculate average distance to goal corner
 * Lower is better (closer to winning)
 */
function evaluateGoalDistance(pieces: PieceWithId[], player: PlayerType): number {
  const playerPieces = pieces.filter(p => p.player === player);
  const goalPositions = getGoalCornerPositions(player);
  
  if (playerPieces.length === 0) return 0;
  
  let totalDistance = 0;
  
  for (const piece of playerPieces) {
    // Find minimum distance to any goal position
    const minDistance = Math.min(
      ...goalPositions.map((goal: { row: number; col: number }) => 
        manhattanDistance(piece.row, piece.col, goal.row, goal.col)
      )
    );
    totalDistance += minDistance;
  }
  
  return -totalDistance / playerPieces.length; // Negative because lower distance is better
}

/**
 * Evaluate piece advancement toward goal
 * Rewards pieces that are closer to their goal corner
 */
function evaluateAdvancement(pieces: PieceWithId[], player: PlayerType): number {
  const playerPieces = pieces.filter(p => p.player === player);
  const boardSize = GAME_CONFIG.boardSize;
  
  let advancementScore = 0;
  
  for (const piece of playerPieces) {
    if (player === 'A') {
      // Player A advances toward bottom-right
      advancementScore += piece.row + piece.col;
    } else {
      // Player B advances toward top-left
      advancementScore += (boardSize - 1 - piece.row) + (boardSize - 1 - piece.col);
    }
  }
  
  return advancementScore;
}

/**
 * Count pieces already in goal corner
 * Massive bonus for pieces that reached goal
 */
function evaluatePiecesInGoal(pieces: PieceWithId[], player: PlayerType): number {
  const playerPieces = pieces.filter(p => p.player === player);
  const goalPositions = getGoalCornerPositions(player);
  
  let piecesInGoal = 0;
  
  for (const piece of playerPieces) {
    const isInGoal = goalPositions.some(
      (goal: { row: number; col: number }) => goal.row === piece.row && goal.col === piece.col
    );
    if (isInGoal) piecesInGoal++;
  }
  
  // Exponential reward for pieces in goal
  return piecesInGoal * piecesInGoal * 100;
}

/**
 * Evaluate mobility - number of valid moves available
 * More moves = more flexibility
 */
function evaluateMobility(board: Board, pieces: PieceWithId[], player: PlayerType): number {
  const playerPieces = pieces.filter(p => p.player === player);
  
  let totalMoves = 0;
  
  for (const piece of playerPieces) {
    const validMoves = getValidMoves(board, piece);
    totalMoves += validMoves.length;
  }
  
  return totalMoves * 2; // Weight factor
}

/**
 * Evaluate piece clustering
 * Penalize pieces that are too spread out (they can't support each other for jumps)
 */
function evaluateClustering(pieces: PieceWithId[], player: PlayerType): number {
  const playerPieces = pieces.filter(p => p.player === player);
  
  if (playerPieces.length <= 1) return 0;
  
  let clusterScore = 0;
  
  // Calculate average distance between pieces
  for (let i = 0; i < playerPieces.length; i++) {
    for (let j = i + 1; j < playerPieces.length; j++) {
      const distance = manhattanDistance(
        playerPieces[i].row,
        playerPieces[i].col,
        playerPieces[j].row,
        playerPieces[j].col
      );
      
      // Reward pieces that are 2-4 units apart (good for jumping)
      if (distance >= 2 && distance <= 4) {
        clusterScore += 5;
      } else if (distance > 6) {
        clusterScore -= 3; // Penalize too spread out
      }
    }
  }
  
  return clusterScore;
}

/**
 * Evaluate blocking opponent
 * Reward occupying positions that block opponent's path
 */
function evaluateBlocking(pieces: PieceWithId[], player: PlayerType): number {
  const opponent: PlayerType = player === 'A' ? 'B' : 'A';
  const playerPieces = pieces.filter(p => p.player === player);
  const opponentGoals = getGoalCornerPositions(opponent);
  
  let blockingScore = 0;
  
  for (const piece of playerPieces) {
    // Check if piece is near opponent's goal
    const minDistanceToOpponentGoal = Math.min(
      ...opponentGoals.map((goal: { row: number; col: number }) =>
        manhattanDistance(piece.row, piece.col, goal.row, goal.col)
      )
    );
    
    // Reward being close to opponent's goal (blocking their path)
    if (minDistanceToOpponentGoal <= 3) {
      blockingScore += 10;
    }
  }
  
  return blockingScore;
}

/**
 * Main evaluation function
 * Combines all heuristics with weights
 * 
 * @param board - Current board state
 * @param pieces - All pieces on board
 * @param player - Player to evaluate for
 * @returns Score (positive = good for player, negative = bad)
 */
export function evaluatePosition(
  board: Board,
  pieces: PieceWithId[],
  player: PlayerType
): number {
  const opponent: PlayerType = player === 'A' ? 'B' : 'A';
  
  // Calculate scores for both players
  const playerGoalDistance = evaluateGoalDistance(pieces, player);
  const opponentGoalDistance = evaluateGoalDistance(pieces, opponent);
  
  const playerAdvancement = evaluateAdvancement(pieces, player);
  const opponentAdvancement = evaluateAdvancement(pieces, opponent);
  
  const playerInGoal = evaluatePiecesInGoal(pieces, player);
  const opponentInGoal = evaluatePiecesInGoal(pieces, opponent);
  
  const playerMobility = evaluateMobility(board, pieces, player);
  const opponentMobility = evaluateMobility(board, pieces, opponent);
  
  const playerClustering = evaluateClustering(pieces, player);
  const opponentClustering = evaluateClustering(pieces, opponent);
  
  const playerBlocking = evaluateBlocking(pieces, player);
  const opponentBlocking = evaluateBlocking(pieces, opponent);
  
  // Weighted combination (player advantage - opponent advantage)
  const score =
    (playerGoalDistance - opponentGoalDistance) * 10 +  // Distance to goal (most important)
    (playerAdvancement - opponentAdvancement) * 5 +      // Progress toward goal
    (playerInGoal - opponentInGoal) * 1 +                 // Pieces in goal (handled by multiplier)
    (playerMobility - opponentMobility) * 1 +            // Move options
    (playerClustering - opponentClustering) * 0.5 +      // Piece positioning
    (playerBlocking - opponentBlocking) * 0.5;           // Blocking opponent
  
  return score;
}

/**
 * Quick evaluation for move ordering
 * Faster than full evaluation, used to order moves before deep search
 */
export function quickEvaluateMove(
  from: { row: number; col: number },
  to: { row: number; col: number },
  player: PlayerType
): number {
  const goalRow = player === 'A' ? GAME_CONFIG.boardSize - 1 : 0;
  const goalCol = player === 'A' ? GAME_CONFIG.boardSize - 1 : 0;
  
  const fromDistance = manhattanDistance(from.row, from.col, goalRow, goalCol);
  const toDistance = manhattanDistance(to.row, to.col, goalRow, goalCol);
  
  // Prefer moves that get closer to goal
  const improvement = fromDistance - toDistance;
  
  // Bonus for jumping (larger distance covered)
  const moveDistance = manhattanDistance(from.row, from.col, to.row, to.col);
  const jumpBonus = moveDistance > 1 ? 10 : 0;
  
  return improvement * 10 + jumpBonus;
}
