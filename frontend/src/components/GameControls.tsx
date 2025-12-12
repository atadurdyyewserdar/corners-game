/**
 * Game controls component - restart and end game buttons
 */

import React from 'react';
import { COMPUTED } from '../constants/dimensions';

interface GameControlsProps {
  onRestart: () => void;
  onEndGame: () => void;
  disabled?: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({
  onRestart,
  onEndGame,
  disabled = false,
}) => {
  return (
    <div
      className="flex flex-row gap-6 mt-7"
      style={{ width: COMPUTED.wrapperWidth }}
    >
      <button
        className="px-5 py-2 rounded font-semibold text-[#A46D41] bg-[#f3e1c0] border border-[#ca9b69] shadow hover:bg-[#e5d3ba] hover:scale-105 transition cursor-pointer"
        onClick={onRestart}
        disabled={disabled}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        Restart Game
      </button>
      <button
        className="px-5 py-2 rounded font-semibold text-[#75441a] bg-[#ffe4c7] border border-[#ca9b69] shadow hover:bg-[#fadfb5] hover:scale-105 transition cursor-pointer"
        onClick={onEndGame}
        disabled={disabled}
        style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
      >
        End Game
      </button>
    </div>
  );
};

export default GameControls;
