/**
 * Unit tests for move validation logic
 */

import { describe, it, expect } from 'vitest';
import { getValidMoves, isMoveValid } from '../domain/utils/moveValidation';
import { createEmptyBoard } from '../domain/models/Board';

describe('Move Validation', () => {
  describe('getValidMoves', () => {
    it('should return adjacent empty cells for a piece', () => {
      const board = createEmptyBoard();
      board[3][3] = 'A'; // Place a piece at center
      
      const moves = getValidMoves(board, { row: 3, col: 3 });
      
      // Should have 4 adjacent moves (up, down, left, right)
      expect(moves.length).toBe(4);
      expect(moves).toContainEqual({ row: 2, col: 3 }); // up
      expect(moves).toContainEqual({ row: 4, col: 3 }); // down
      expect(moves).toContainEqual({ row: 3, col: 2 }); // left
      expect(moves).toContainEqual({ row: 3, col: 4 }); // right
    });

    it('should not include occupied adjacent cells but should include jumps', () => {
      const board = createEmptyBoard();
      board[3][3] = 'A';
      board[2][3] = 'B'; // Block upward move
      board[3][4] = 'A'; // Block right move
      
      const moves = getValidMoves(board, { row: 3, col: 3 });
      
      // Should have 2 adjacent moves (down and left)
      // Plus potential jumps over the occupied cells
      expect(moves.length).toBeGreaterThanOrEqual(2);
      expect(moves).toContainEqual({ row: 4, col: 3 }); // down
      expect(moves).toContainEqual({ row: 3, col: 2 }); // left
      // Should include jumps over occupied cells if landing cells are empty
      expect(moves).toContainEqual({ row: 1, col: 3 }); // jump over B
      expect(moves).toContainEqual({ row: 3, col: 5 }); // jump over A
    });

    it('should include jump moves over occupied cells', () => {
      const board = createEmptyBoard();
      board[3][3] = 'A';
      board[3][4] = 'B'; // Piece to jump over
      
      const moves = getValidMoves(board, { row: 3, col: 3 });
      
      // Should include jump to [3, 5]
      expect(moves).toContainEqual({ row: 3, col: 5 });
    });

    it('should find multiple sequential jumps', () => {
      const board = createEmptyBoard();
      board[3][3] = 'A';
      board[3][4] = 'B'; // First jump
      board[3][6] = 'A'; // Second jump
      
      const moves = getValidMoves(board, { row: 3, col: 3 });
      
      // Should include both jumps
      expect(moves).toContainEqual({ row: 3, col: 5 });
      expect(moves).toContainEqual({ row: 3, col: 7 });
    });

    it('should handle corner positions', () => {
      const board = createEmptyBoard();
      board[0][0] = 'A'; // Top-left corner
      
      const moves = getValidMoves(board, { row: 0, col: 0 });
      
      // Should only have 2 moves (down and right)
      expect(moves.length).toBe(2);
      expect(moves).toContainEqual({ row: 1, col: 0 });
      expect(moves).toContainEqual({ row: 0, col: 1 });
    });
  });

  describe('isMoveValid', () => {
    it('should return true for valid adjacent move', () => {
      const board = createEmptyBoard();
      board[3][3] = 'A';
      
      const isValid = isMoveValid(board, { row: 3, col: 3 }, { row: 3, col: 4 });
      
      expect(isValid).toBe(true);
    });

    it('should return false for occupied adjacent cell', () => {
      const board = createEmptyBoard();
      board[3][3] = 'A';
      board[3][4] = 'B';
      
      const isValid = isMoveValid(board, { row: 3, col: 3 }, { row: 3, col: 4 });
      
      expect(isValid).toBe(false);
    });

    it('should return true for valid jump move', () => {
      const board = createEmptyBoard();
      board[3][3] = 'A';
      board[3][4] = 'B';
      
      const isValid = isMoveValid(board, { row: 3, col: 3 }, { row: 3, col: 5 });
      
      expect(isValid).toBe(true);
    });

    it('should return false for invalid jump (no piece to jump over)', () => {
      const board = createEmptyBoard();
      board[3][3] = 'A';
      
      const isValid = isMoveValid(board, { row: 3, col: 3 }, { row: 3, col: 5 });
      
      expect(isValid).toBe(false);
    });
  });
});
