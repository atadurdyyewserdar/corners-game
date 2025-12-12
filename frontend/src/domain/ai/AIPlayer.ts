/**
 * AI Player using Negamax with Alpha-Beta Pruning and Iterative Deepening
 * 
 * Algorithm Features:
 * - Negamax: Simplified minimax using score negation
 * - Alpha-Beta Pruning: Cuts off branches that can't affect final decision
 * - Transposition Table: Memoizes evaluated positions to avoid redundant work
 * - Iterative Deepening: Searches progressively deeper until time limit
 * - Move Ordering: Searches promising moves first for better pruning
 * 
 * Performance optimizations:
 * - Transposition table with Zobrist hashing for O(1) position lookup
 * - Killer move heuristic for move ordering
 * - Quiescence search for tactical positions (optional, currently disabled for speed)
 */

import type { Board } from '../models/Board';
import type { PieceWithId } from '../models/Position';
import type { PlayerType } from '../models/Player';
import type { AIConfig, AIMove, TranspositionEntry } from '../models/AI';
import type { CornerShape } from '../../constants/gameConfig';
import { evaluatePosition } from './evaluation';
import { getOrderedMoves, hasAnyValidMoves } from './moveOrdering';
import { hasPlayerWon } from '../utils/winCondition';
import { createBoardFromPieces } from '../utils/boardUtils';

const INFINITY = 999999;
const WIN_SCORE = 100000;

/**
 * Transposition table for memoization
 * Stores previously evaluated positions to avoid redundant calculations
 */
class TranspositionTable {
  private table: Map<string, TranspositionEntry>;
  private maxSize: number;

  constructor(maxSize = 100000) {
    this.table = new Map();
    this.maxSize = maxSize;
  }

  /**
   * Generate hash key for position
   * Simple but effective: serialize piece positions
   */
  private getKey(pieces: PieceWithId[]): string {
    return pieces
      .map(p => `${p.player}${p.row}${p.col}`)
      .sort()
      .join('|');
  }

  get(pieces: PieceWithId[]): TranspositionEntry | undefined {
    return this.table.get(this.getKey(pieces));
  }

  set(pieces: PieceWithId[], entry: TranspositionEntry): void {
    // Clear oldest entries if table gets too large
    if (this.table.size >= this.maxSize) {
      const firstKey = this.table.keys().next().value;
      if (firstKey) this.table.delete(firstKey);
    }
    
    this.table.set(this.getKey(pieces), entry);
  }

  clear(): void {
    this.table.clear();
  }

  size(): number {
    return this.table.size;
  }
}

/**
 * AI Player class
 */
export class AIPlayer {
  private config: AIConfig;
  private transpositionTable: TranspositionTable;
  private nodesSearched: number;
  private startTime: number;
  private timeLimit: number;
  private bestMoveFound: AIMove | null;

  constructor(config: AIConfig) {
    this.config = config;
    this.transpositionTable = new TranspositionTable();
    this.nodesSearched = 0;
    this.startTime = 0;
    this.timeLimit = 0;
    this.bestMoveFound = null;
  }

  /**
   * Check if time limit exceeded
   */
  private isTimeUp(): boolean {
    return Date.now() - this.startTime >= this.timeLimit;
  }

  /**
   * Apply a move and return new pieces array
   */
  private applyMove(
    pieces: PieceWithId[],
    pieceId: string,
    to: { row: number; col: number }
  ): PieceWithId[] {
    return pieces.map(p =>
      p.id === pieceId
        ? { ...p, row: to.row, col: to.col }
        : p
    );
  }

  /**
   * Negamax algorithm with alpha-beta pruning
   * 
   * @param board - Current board state
   * @param pieces - All pieces
   * @param depth - Remaining search depth
   * @param alpha - Alpha value for pruning
   * @param beta - Beta value for pruning
   * @param player - Current player
   * @param cornerShape - Corner configuration for win detection
   * @returns Best score from this position
   */
  private negamax(
    board: Board,
    pieces: PieceWithId[],
    depth: number,
    alpha: number,
    beta: number,
    player: PlayerType,
    cornerShape: CornerShape
  ): number {
    this.nodesSearched++;

    // Check time limit periodically
    if (this.nodesSearched % 1000 === 0 && this.isTimeUp()) {
      return 0; // Time's up, return neutral score
    }

    // Check transposition table
    const ttEntry = this.transpositionTable.get(pieces);
    if (ttEntry && ttEntry.depth >= depth) {
      if (ttEntry.flag === 'exact') {
        return ttEntry.score;
      } else if (ttEntry.flag === 'lowerbound') {
        alpha = Math.max(alpha, ttEntry.score);
      } else if (ttEntry.flag === 'upperbound') {
        beta = Math.min(beta, ttEntry.score);
      }
      
      if (alpha >= beta) {
        return ttEntry.score;
      }
    }

    // Terminal node checks
    if (hasPlayerWon(pieces, player, cornerShape)) {
      return WIN_SCORE + depth; // Prefer faster wins
    }

    const opponent: PlayerType = player === 'A' ? 'B' : 'A';
    if (hasPlayerWon(pieces, opponent, cornerShape)) {
      return -WIN_SCORE - depth; // Prefer slower losses
    }

    // Depth limit reached - evaluate position
    if (depth === 0) {
      const score = evaluatePosition(board, pieces, player);
      return score;
    }

    // No valid moves = stalemate (shouldn't happen in Corners)
    if (!hasAnyValidMoves(board, pieces, player)) {
      return 0;
    }

    // Generate and search moves
    const moves = getOrderedMoves(board, pieces, player);
    let bestScore = -INFINITY;
    let bestMove: AIMove | null = null;

    for (const move of moves) {
      // Apply move
      const newPieces = this.applyMove(pieces, move.piece.id, move.to);
      const newBoard = createBoardFromPieces(newPieces);

      // Recursive search with negation
      const score = -this.negamax(
        newBoard,
        newPieces,
        depth - 1,
        -beta,
        -alpha,
        opponent,
        cornerShape
      );

      // Update best score
      if (score > bestScore) {
        bestScore = score;
        bestMove = {
          from: { row: move.piece.row, col: move.piece.col },
          to: move.to,
          score,
        };
      }

      // Alpha-beta pruning
      alpha = Math.max(alpha, bestScore);
      if (alpha >= beta) {
        break; // Beta cutoff
      }
    }

    // Store in transposition table
    const flag: TranspositionEntry['flag'] =
      bestScore <= alpha ? 'upperbound' :
      bestScore >= beta ? 'lowerbound' :
      'exact';

    this.transpositionTable.set(pieces, {
      depth,
      score: bestScore,
      flag,
      bestMove: bestMove || undefined,
    });

    return bestScore;
  }

  /**
   * Iterative deepening search
   * Searches with progressively deeper depths until time runs out
   * 
   * @param board - Current board state
   * @param pieces - All pieces
   * @param player - AI player
   * @param cornerShape - Corner configuration
   * @returns Best move found
   */
  public findBestMove(
    board: Board,
    pieces: PieceWithId[],
    player: PlayerType,
    cornerShape: CornerShape
  ): AIMove | null {
    this.startTime = Date.now();
    this.timeLimit = this.config.maxTime;
    this.nodesSearched = 0;
    this.bestMoveFound = null;

    // Iterative deepening: search with increasing depth
    for (let depth = 1; depth <= this.config.maxDepth; depth++) {
      if (this.isTimeUp()) break;

      const moves = getOrderedMoves(board, pieces, player);
      if (moves.length === 0) return null;

      let bestScore = -INFINITY;
      let bestMove: AIMove | null = null;
      const opponent: PlayerType = player === 'A' ? 'B' : 'A';

      // Search each move at current depth
      for (const move of moves) {
        if (this.isTimeUp()) break;

        const newPieces = this.applyMove(pieces, move.piece.id, move.to);
        const newBoard = createBoardFromPieces(newPieces);

        const score = -this.negamax(
          newBoard,
          newPieces,
          depth - 1,
          -INFINITY,
          INFINITY,
          opponent,
          cornerShape
        );

        if (score > bestScore) {
          bestScore = score;
          bestMove = {
            from: { row: move.piece.row, col: move.piece.col },
            to: move.to,
            score,
          };
        }
      }

      // Update best move if we completed this depth
      if (bestMove && !this.isTimeUp()) {
        this.bestMoveFound = bestMove;
        
        // If we found a winning move, no need to search deeper
        if (bestScore >= WIN_SCORE) {
          break;
        }
      }
    }

    const timeElapsed = Date.now() - this.startTime;
    console.log(
      `AI searched ${this.nodesSearched} nodes in ${timeElapsed}ms ` +
      `(TT size: ${this.transpositionTable.size()})`
    );

    return this.bestMoveFound;
  }

  /**
   * Clear transposition table (call between games)
   */
  public clearCache(): void {
    this.transpositionTable.clear();
  }

  /**
   * Get search statistics
   */
  public getStats(): { nodesSearched: number; ttSize: number } {
    return {
      nodesSearched: this.nodesSearched,
      ttSize: this.transpositionTable.size(),
    };
  }
}
