/**
 * Game state type definitions
 */

import type { PieceWithId, Position } from './Position';
import type { PlayerType } from './Player';
import type { CornerShape } from '../../constants/gameConfig';
import type { GameMode, AIDifficulty } from './AI';

export type GameStatus = 'setup' | 'playing' | 'finished';

export const GameStatus = {
  Setup: 'setup' as const,
  Playing: 'playing' as const,
  Finished: 'finished' as const,
};

export interface MoveEntry {
  pieces: PieceWithId[];
  from?: Position;
  to?: Position;
}

export interface GameState {
  status: GameStatus;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty | null;
  aiPlayer: PlayerType | null; // Which player is AI (null if human vs human)
  cornerShape: CornerShape | null;
  pieces: PieceWithId[];
  currentPlayer: PlayerType;
  selectedPiece: PieceWithId | null;
  lastMove: {
    from: Position;
    to: Position;
  } | null;
  winner: PlayerType | null;
  gameSeconds: number;
  history: MoveEntry[];
  isAnimating: boolean;
  isAIThinking: boolean;
  pendingAIMove: { piece: PieceWithId; from: Position; to: Position } | null;
}

export const initialGameState: GameState = {
  status: GameStatus.Setup,
  gameMode: 'human-vs-human',
  aiDifficulty: null,
  aiPlayer: null,
  cornerShape: null,
  pieces: [],
  currentPlayer: 'A',
  selectedPiece: null,
  lastMove: null,
  winner: null,
  gameSeconds: 0,
  history: [],
  isAnimating: false,
  isAIThinking: false,
  pendingAIMove: null,
};
