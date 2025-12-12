/**
 * Custom hook for managing piece animation
 */

import { useState, useCallback } from 'react';
import type { PieceWithId, Position } from '../domain/models/Position';
import { clonePieces } from '../domain/utils/boardUtils';
import { GAME_CONFIG } from '../constants/gameConfig';

export function usePieceAnimation() {
  const [isAnimating, setIsAnimating] = useState(false);

  const animatePieceStepwise = useCallback(
    async (
      piece: PieceWithId,
      path: Position[],
      pieces: PieceWithId[],
      onUpdate: (pieces: PieceWithId[]) => void
    ): Promise<void> => {
      setIsAnimating(true);
      let newPositions = clonePieces(pieces);

      for (let i = 1; i < path.length; ++i) {
        await new Promise((resolve) =>
          setTimeout(
            resolve,
            i === 1
              ? GAME_CONFIG.animationDelay.firstStep
              : GAME_CONFIG.animationDelay.subsequentSteps
          )
        );

        newPositions = newPositions.map((p) =>
          p.id === piece.id
            ? { ...p, row: path[i].row, col: path[i].col }
            : p
        );

        onUpdate(clonePieces(newPositions));
      }

      setIsAnimating(false);
    },
    []
  );

  return {
    isAnimating,
    animatePieceStepwise,
  };
}
