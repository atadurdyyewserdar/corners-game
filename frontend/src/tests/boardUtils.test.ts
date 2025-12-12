/**
 * Unit tests for board utilities
 */

import { describe, it, expect } from 'vitest';
import {
  createInitialPieces,
  clonePieces,
  getBoardFromPieces,
  findPieceAt,
  getPiecesForPlayer,
  movePiece,
  GameError,
} from '../domain/utils/boardUtils';
import type { PieceWithId } from '../domain/models/Position';
import type { CornerShape } from '../constants/gameConfig';

describe('Board Utilities', () => {
  const corner3x3: CornerShape = { rows: 3, cols: 3 };

  describe('createInitialPieces', () => {
    it('should create 18 pieces for 3x3 corner (9 per player)', () => {
      const pieces = createInitialPieces(corner3x3);
      
      expect(pieces.length).toBe(18);
      
      const playerAPieces = pieces.filter(p => p.player === 'A');
      const playerBPieces = pieces.filter(p => p.player === 'B');
      
      expect(playerAPieces.length).toBe(9);
      expect(playerBPieces.length).toBe(9);
    });

    it('should place Player A pieces in top-left corner', () => {
      const pieces = createInitialPieces(corner3x3);
      const playerAPieces = pieces.filter(p => p.player === 'A');
      
      playerAPieces.forEach(piece => {
        expect(piece.row).toBeLessThan(3);
        expect(piece.col).toBeLessThan(3);
      });
    });

    it('should place Player B pieces in bottom-right corner', () => {
      const pieces = createInitialPieces(corner3x3);
      const playerBPieces = pieces.filter(p => p.player === 'B');
      
      playerBPieces.forEach(piece => {
        expect(piece.row).toBeGreaterThanOrEqual(5);
        expect(piece.col).toBeGreaterThanOrEqual(5);
      });
    });

    it('should create unique IDs for each piece', () => {
      const pieces = createInitialPieces(corner3x3);
      const ids = pieces.map(p => p.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(pieces.length);
    });
  });

  describe('clonePieces', () => {
    it('should create a deep copy of pieces array', () => {
      const pieces = createInitialPieces(corner3x3);
      const cloned = clonePieces(pieces);
      
      expect(cloned).toEqual(pieces);
      expect(cloned).not.toBe(pieces);
      expect(cloned[0]).not.toBe(pieces[0]);
    });

    it('should not affect original when modifying clone', () => {
      const pieces = createInitialPieces(corner3x3);
      const cloned = clonePieces(pieces);
      
      cloned[0] = { ...cloned[0], row: 999 };
      
      expect(pieces[0].row).not.toBe(999);
    });
  });

  describe('getBoardFromPieces', () => {
    it('should create a board matrix from pieces', () => {
      const pieces = createInitialPieces(corner3x3);
      const board = getBoardFromPieces(pieces);
      
      expect(board.length).toBe(8);
      expect(board[0].length).toBe(8);
    });

    it('should place pieces correctly on board', () => {
      const pieces = createInitialPieces(corner3x3);
      const board = getBoardFromPieces(pieces);
      
      // Check Player A's top-left corner
      expect(board[0][0]).toBe('A');
      expect(board[2][2]).toBe('A');
      
      // Check Player B's bottom-right corner
      expect(board[7][7]).toBe('B');
      expect(board[5][5]).toBe('B');
      
      // Check middle is empty
      expect(board[3][3]).toBeNull();
      expect(board[4][4]).toBeNull();
    });

    it('should throw error for invalid position', () => {
      const pieces: PieceWithId[] = [{ id: 'A-1', player: 'A', row: -1, col: 0 }];
      
      expect(() => getBoardFromPieces(pieces)).toThrow(GameError);
    });

    it('should throw error for duplicate position', () => {
      const pieces: PieceWithId[] = [
        { id: 'A-1', player: 'A', row: 0, col: 0 },
        { id: 'B-1', player: 'B', row: 0, col: 0 },
      ];
      
      expect(() => getBoardFromPieces(pieces)).toThrow(GameError);
    });
  });

  describe('findPieceAt', () => {
    it('should find a piece at given position', () => {
      const pieces = createInitialPieces(corner3x3);
      const piece = findPieceAt(pieces, 0, 0);
      
      expect(piece).toBeDefined();
      expect(piece?.row).toBe(0);
      expect(piece?.col).toBe(0);
      expect(piece?.player).toBe('A');
    });

    it('should return undefined if no piece at position', () => {
      const pieces = createInitialPieces(corner3x3);
      const piece = findPieceAt(pieces, 4, 4);
      
      expect(piece).toBeUndefined();
    });
  });

  describe('getPiecesForPlayer', () => {
    it('should return only pieces for specified player', () => {
      const pieces = createInitialPieces(corner3x3);
      const playerAPieces = getPiecesForPlayer(pieces, 'A');
      
      expect(playerAPieces.length).toBe(9);
      playerAPieces.forEach(piece => {
        expect(piece.player).toBe('A');
      });
    });
  });

  describe('movePiece', () => {
    it('should update piece position', () => {
      const pieces = createInitialPieces(corner3x3);
      const pieceId = pieces[0].id;
      
      const updated = movePiece(pieces, pieceId, 3, 3);
      const movedPiece = updated.find(p => p.id === pieceId);
      
      expect(movedPiece?.row).toBe(3);
      expect(movedPiece?.col).toBe(3);
    });

    it('should not modify original pieces array', () => {
      const pieces = createInitialPieces(corner3x3);
      const pieceId = pieces[0].id;
      const originalRow = pieces[0].row;
      
      movePiece(pieces, pieceId, 3, 3);
      
      expect(pieces[0].row).toBe(originalRow);
    });

    it('should throw error for invalid target position', () => {
      const pieces = createInitialPieces(corner3x3);
      const pieceId = pieces[0].id;
      
      expect(() => movePiece(pieces, pieceId, -1, 0)).toThrow(GameError);
      expect(() => movePiece(pieces, pieceId, 10, 10)).toThrow(GameError);
    });
  });
});
