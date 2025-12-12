/**
 * Unit tests for win condition detection
 */

import { describe, it, expect } from 'vitest';
import { hasPlayerWon } from '../domain/utils/winCondition';
import type { PieceWithId } from '../domain/models/Position';
import type { CornerShape } from '../constants/gameConfig';

describe('Win Condition', () => {
  const corner3x3: CornerShape = { rows: 3, cols: 3 };

  describe('hasPlayerWon - Player A', () => {
    it('should return true when Player A occupies bottom-right corner', () => {
      const pieces: PieceWithId[] = [
        { id: 'A-1', player: 'A', row: 5, col: 5 },
        { id: 'A-2', player: 'A', row: 5, col: 6 },
        { id: 'A-3', player: 'A', row: 5, col: 7 },
        { id: 'A-4', player: 'A', row: 6, col: 5 },
        { id: 'A-5', player: 'A', row: 6, col: 6 },
        { id: 'A-6', player: 'A', row: 6, col: 7 },
        { id: 'A-7', player: 'A', row: 7, col: 5 },
        { id: 'A-8', player: 'A', row: 7, col: 6 },
        { id: 'A-9', player: 'A', row: 7, col: 7 },
      ];

      expect(hasPlayerWon(pieces, 'A', corner3x3)).toBe(true);
    });

    it('should return false when Player A does not fully occupy bottom-right corner', () => {
      const pieces: PieceWithId[] = [
        { id: 'A-1', player: 'A', row: 5, col: 5 },
        { id: 'A-2', player: 'A', row: 5, col: 6 },
        { id: 'A-3', player: 'A', row: 5, col: 7 },
        { id: 'A-4', player: 'A', row: 6, col: 5 },
        { id: 'A-5', player: 'A', row: 6, col: 6 },
        // Missing pieces at [6,7], [7,5], [7,6], [7,7]
      ];

      expect(hasPlayerWon(pieces, 'A', corner3x3)).toBe(false);
    });
  });

  describe('hasPlayerWon - Player B', () => {
    it('should return true when Player B occupies top-left corner', () => {
      const pieces: PieceWithId[] = [
        { id: 'B-1', player: 'B', row: 0, col: 0 },
        { id: 'B-2', player: 'B', row: 0, col: 1 },
        { id: 'B-3', player: 'B', row: 0, col: 2 },
        { id: 'B-4', player: 'B', row: 1, col: 0 },
        { id: 'B-5', player: 'B', row: 1, col: 1 },
        { id: 'B-6', player: 'B', row: 1, col: 2 },
        { id: 'B-7', player: 'B', row: 2, col: 0 },
        { id: 'B-8', player: 'B', row: 2, col: 1 },
        { id: 'B-9', player: 'B', row: 2, col: 2 },
      ];

      expect(hasPlayerWon(pieces, 'B', corner3x3)).toBe(true);
    });

    it('should return false when Player B does not fully occupy top-left corner', () => {
      const pieces: PieceWithId[] = [
        { id: 'B-1', player: 'B', row: 0, col: 0 },
        { id: 'B-2', player: 'B', row: 0, col: 1 },
        { id: 'B-3', player: 'B', row: 1, col: 0 },
        // Missing pieces
      ];

      expect(hasPlayerWon(pieces, 'B', corner3x3)).toBe(false);
    });
  });

  describe('Different corner shapes', () => {
    it('should work with 3x4 corner shape', () => {
      const corner3x4: CornerShape = { rows: 3, cols: 4 };
      const pieces: PieceWithId[] = [
        { id: 'A-1', player: 'A', row: 5, col: 4 },
        { id: 'A-2', player: 'A', row: 5, col: 5 },
        { id: 'A-3', player: 'A', row: 5, col: 6 },
        { id: 'A-4', player: 'A', row: 5, col: 7 },
        { id: 'A-5', player: 'A', row: 6, col: 4 },
        { id: 'A-6', player: 'A', row: 6, col: 5 },
        { id: 'A-7', player: 'A', row: 6, col: 6 },
        { id: 'A-8', player: 'A', row: 6, col: 7 },
        { id: 'A-9', player: 'A', row: 7, col: 4 },
        { id: 'A-10', player: 'A', row: 7, col: 5 },
        { id: 'A-11', player: 'A', row: 7, col: 6 },
        { id: 'A-12', player: 'A', row: 7, col: 7 },
      ];

      expect(hasPlayerWon(pieces, 'A', corner3x4)).toBe(true);
    });

    it('should work with 4x4 corner shape', () => {
      const corner4x4: CornerShape = { rows: 4, cols: 4 };
      const pieces: PieceWithId[] = [];
      
      // Fill bottom-right 4x4 corner for Player A
      let id = 1;
      for (let row = 4; row < 8; row++) {
        for (let col = 4; col < 8; col++) {
          pieces.push({ id: `A-${id++}`, player: 'A', row, col });
        }
      }

      expect(hasPlayerWon(pieces, 'A', corner4x4)).toBe(true);
    });
  });
});
