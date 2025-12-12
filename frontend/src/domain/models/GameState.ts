/**
 * Game state type definitions
 */

import type { PieceWithId, Position } from './Position';
import type { PlayerType } from './Player';
import type { CornerShape } from '../../constants/gameConfig';

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
  cornerShape: CornerShape | null;
  pieces: PieceWithId[];
  currentPlayer: PlayerType;
  selectedPiece: PieceWithId | null;
  lastMove: {
    from: Position;
    to: Position;
  } | null;
  winner: PlayerType | null;
  turnSeconds: number;
  history: MoveEntry[];
  isAnimating: boolean;
}

export const initialGameState: GameState = {
  status: GameStatus.Setup,
  cornerShape: null,
  pieces: [],
  currentPlayer: 'A',
  selectedPiece: null,
  lastMove: null,
  winner: null,
  turnSeconds: 0,
  history: [],
  isAnimating: false,
};
