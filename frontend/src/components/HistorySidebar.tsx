/**
 * History sidebar component - shows move history
 */

import React from 'react';
import type { MoveEntry } from '../domain/models/GameState';
import type { CornerShape } from '../constants/gameConfig';
import { cornerShapeLabel } from './CornerConfig';
import { BOARD, LAYOUT } from '../constants/dimensions';
import { GameStatus } from '../domain/models/GameState';

interface HistorySidebarProps {
  history: MoveEntry[];
  cornerShape: CornerShape;
  gameStatus: GameStatus;
  onJumpToHistory: (index: number) => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({
  history,
  cornerShape,
  gameStatus,
  onJumpToHistory,
}) => {
  const isGameFinished = gameStatus === GameStatus.Finished;

  return (
    <div
      className="flex flex-col items-start rounded bg-white border border-gray-300 shadow px-3 py-2 ml-8"
      style={{
        width: LAYOUT.sidebarWidth,
        minWidth: LAYOUT.sidebarWidth,
        maxHeight: BOARD.size * BOARD.cellSize + 16,
      }}
    >
      <div className="font-bold mb-2 text-[#a46d41] text-base">
        Move history{' '}
        <span className="ml-1 text-xs font-normal text-[#ad905b]">
          ({cornerShapeLabel(cornerShape)})
        </span>
      </div>
      <div
        className="overflow-y-auto w-full"
        style={{ maxHeight: BOARD.size * BOARD.cellSize - 45 }}
      >
        {history.map((item, idx) => (
          <button
            key={idx}
            className={`mb-1 flex gap-2 items-center text-xs font-mono rounded px-2 py-[2px] ${
              idx === history.length - 1
                ? 'bg-[#eee3bc] font-bold border border-[#e4d39f]'
                : 'bg-white border border-transparent'
            } hover:bg-[#f7e0ac]`}
            onClick={isGameFinished ? () => onJumpToHistory(idx) : undefined}
            style={{
              minWidth: 80,
              cursor: isGameFinished ? 'pointer' : 'not-allowed',
              opacity: isGameFinished ? 1 : 0.8,
            }}
            tabIndex={isGameFinished ? 0 : -1}
            disabled={!isGameFinished}
            aria-disabled={!isGameFinished}
          >
            <span className="pr-1">{idx === 0 ? 'Start' : `#${idx}`}</span>
            {idx !== 0 && item.from && item.to && (
              <span
                className="rounded bg-gray-100 px-1"
                style={{
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#555',
                }}
              >
                {`[${item.from.row},${item.from.col}] → [${item.to.row},${item.to.col}]`}
              </span>
            )}
          </button>
        ))}
        {!isGameFinished && (
          <div className="text-xs italic text-gray-400 w-full pl-1 pt-2">
            (Available for step-back after game ends)
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorySidebar;
