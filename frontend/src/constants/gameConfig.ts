/**
 * Game configuration and rules constants
 */

export const GAME_CONFIG = {
  boardSize: 8,
  minPlayers: 2,
  maxPlayers: 2,
  animationDelay: {
    firstStep: 90,
    subsequentSteps: 300,
  },
  timerInterval: 1000,
} as const;

export const DIRECTIONS = {
  up: { dr: -1, dc: 0 },
  down: { dr: 1, dc: 0 },
  left: { dr: 0, dc: -1 },
  right: { dr: 0, dc: 1 },
} as const;

export const DIRECTION_ARRAY = Object.values(DIRECTIONS);

export const CORNER_SHAPES = [
  { rows: 3, cols: 3 },
  { rows: 3, cols: 4 },
  { rows: 4, cols: 4 },
] as const;

export type CornerShape = (typeof CORNER_SHAPES)[number];

export const PLAYER_TYPES = {
  A: 'A',
  B: 'B',
} as const;

export type PlayerType = keyof typeof PLAYER_TYPES;
