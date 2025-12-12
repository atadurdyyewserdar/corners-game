/**
 * Board component - renders the game board with pieces
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { PieceWithId, Position } from '../domain/models/Position';
import { BOARD, COMPUTED } from '../constants/dimensions';
import { COLORS, SHADOWS, GRADIENTS } from '../constants/theme';

interface BoardProps {
  pieces: PieceWithId[];
  selectedPiece: PieceWithId | null;
  lastMove: { from: Position; to: Position } | null;
  onCellClick: (row: number, col: number) => void;
}

const Board: React.FC<BoardProps> = ({
  pieces,
  selectedPiece,
  lastMove,
  onCellClick,
}) => {
  const getCellOutline = (row: number, col: number): string | undefined => {
    if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
      return COLORS.highlight.selected;
    }
    if (lastMove && lastMove.to.row === row && lastMove.to.col === col) {
      return COLORS.highlight.lastMoveTo;
    }
    if (lastMove && lastMove.from.row === row && lastMove.from.col === col) {
      return COLORS.highlight.lastMoveFrom;
    }
    return undefined;
  };

  const getHistoryOverlay = (row: number, col: number): 'from' | 'to' | null => {
    if (!lastMove) return null;
    if (lastMove.from.row === row && lastMove.from.col === col) return 'from';
    if (lastMove.to.row === row && lastMove.to.col === col) return 'to';
    return null;
  };

  const getCellBackground = (outlineColor: string | undefined): string => {
    if (outlineColor === COLORS.highlight.validMove) {
      return GRADIENTS.validMove;
    }
    if (outlineColor === COLORS.highlight.selected) {
      return GRADIENTS.selected;
    }
    return '';
  };

  return (
    <div className="relative overflow-hidden rounded bg-white border-2 border-gray-300">
      <div
        className="grid w-full h-full bg-gradient-to-b from-[#fff7eb] to-[#f7e0ac] overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${BOARD.size}, ${BOARD.cellSize}px)`,
          gridTemplateRows: `repeat(${BOARD.size}, ${BOARD.cellSize}px)`,
        }}
      >
        {Array.from({ length: BOARD.size }).map((_, row) =>
          Array.from({ length: BOARD.size }).map((_, col) => {
            const color =
              (row + col) % 2 === 1 ? COLORS.board.dark : COLORS.board.light;
            const outlineColor = getCellOutline(row, col);
            const histType = getHistoryOverlay(row, col);
            const highlightBG = getCellBackground(outlineColor);
            const isEdgeCell =
              row === 0 ||
              col === 0 ||
              row === BOARD.size - 1 ||
              col === BOARD.size - 1;

            return (
              <div
                key={`${row}-${col}`}
                className="relative rounded-[2px]"
                style={{
                  width: BOARD.cellSize,
                  height: BOARD.cellSize,
                  background: highlightBG || color,
                  border: 'none',
                  boxShadow: isEdgeCell ? SHADOWS.cell : '',
                  cursor: 'pointer',
                }}
                onClick={() => onCellClick(row, col)}
              >
                {outlineColor && (
                  <div
                    style={{
                      pointerEvents: 'none',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      border: `3px solid ${outlineColor}`,
                      borderRadius: 4,
                      zIndex: 2,
                      boxSizing: 'border-box',
                      boxShadow: SHADOWS.button,
                    }}
                  />
                )}
                {histType && (
                  <div
                    className="absolute inset-0 rounded"
                    style={{
                      background:
                        histType === 'from'
                          ? COLORS.ui.history.from
                          : COLORS.ui.history.to,
                      zIndex: 1,
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
      {pieces.map((piece) => (
        <motion.img
          key={piece.id}
          src={COLORS.player[piece.player].piece}
          alt={`Player ${piece.player}`}
          animate={{
            left:
              piece.col * BOARD.cellSize +
              (BOARD.cellSize - COMPUTED.pieceSize) / 2,
            top:
              piece.row * BOARD.cellSize +
              (BOARD.cellSize - COMPUTED.pieceSize) / 2,
          }}
          initial={false}
          transition={{ type: 'spring', stiffness: 520, damping: 32 }}
          style={{
            position: 'absolute',
            width: COMPUTED.pieceSize,
            height: COMPUTED.pieceSize,
            zIndex: 10,
            pointerEvents: 'none',
            userSelect: 'none',
            filter: SHADOWS.piece[piece.player],
          }}
          draggable={false}
        />
      ))}
    </div>
  );
};

export default Board;
