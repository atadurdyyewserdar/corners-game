/**
 * Legacy type exports - redirecting to new domain models
 * @deprecated Use domain models directly
 */

export type { Player, PlayerType } from '../domain/models/Player';
export type { Board } from '../domain/models/Board';
export type { Position, PieceWithId } from '../domain/models/Position';
export type { GameState, MoveEntry } from '../domain/models/GameState';
export type { GameStatus } from '../domain/models/GameState';
export { GameStatus as GameStatusEnum } from '../domain/models/GameState';
