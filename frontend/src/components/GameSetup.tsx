/**
 * Game setup component for corner shape selection
 */

import React from 'react';
import CornerConfig from './CornerConfig';
import type { CornerShape } from '../constants/gameConfig';

interface GameSetupProps {
  onSelect: (shape: CornerShape) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center min-h-[100vh] justify-center bg-white py-6">
      <h1 className="text-4xl font-extrabold drop-shadow-sm text-center mb-8 mt-4">
        Corners Game
      </h1>
      <CornerConfig onSelect={onSelect} />
      <div className="mt-10 mb-4">
        <p className="text-center text-base">
          Select a starting corner size for both players. <br />
          3x3 is classic—try 3x4 or 4x4 for unique strategy!
        </p>
      </div>
    </div>
  );
};

export default GameSetup;
