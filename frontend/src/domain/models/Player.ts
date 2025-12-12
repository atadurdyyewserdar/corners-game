/**
 * Player type definitions and utilities
 */

export type PlayerType = 'A' | 'B';
export type Player = PlayerType | null;

export interface PlayerConfig {
  type: PlayerType;
  name: string;
  pieceImage: string;
  color: {
    primary: string;
    secondary: string;
    shadow: string;
  };
}

export function isValidPlayer(value: unknown): value is PlayerType {
  return value === 'A' || value === 'B';
}

export function getOpponent(player: PlayerType): PlayerType {
  return player === 'A' ? 'B' : 'A';
}

export function getPlayerLabel(player: PlayerType): string {
  return `Player ${player}`;
}
