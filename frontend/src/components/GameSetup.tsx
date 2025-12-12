/**
 * Game setup component for corner shape selection and game mode
 */

import React, { useState } from 'react';
import CornerConfig from './CornerConfig';
import type { CornerShape } from '../constants/gameConfig';
import type { GameMode, AIDifficulty } from '../domain/models/AI';

interface GameSetupProps {
  onSelect: (shape: CornerShape, gameMode: GameMode, aiDifficulty: AIDifficulty | null) => void;
}

const GameSetup: React.FC<GameSetupProps> = ({ onSelect }) => {
  const [gameMode, setGameMode] = useState<GameMode>('human-vs-human');
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>('medium');
  const [selectedShape, setSelectedShape] = useState<CornerShape | null>(null);

  const handleStart = () => {
    if (selectedShape) {
      onSelect(
        selectedShape,
        gameMode,
        gameMode === 'human-vs-ai' ? aiDifficulty : null
      );
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[100vh] justify-center bg-white py-6">
      <h1 className="text-4xl font-extrabold drop-shadow-sm text-center mb-8 mt-4">
        Corners Game
      </h1>

      {/* Game Mode Selection */}
      <div className="mb-8 w-full max-w-md">
        <h2 className="text-xl font-semibold text-center mb-4">Choose Game Mode</h2>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setGameMode('human-vs-human')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all cursor-pointer ${
              gameMode === 'human-vs-human'
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            👥 Human vs Human
          </button>
          <button
            onClick={() => setGameMode('human-vs-ai')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all cursor-pointer ${
              gameMode === 'human-vs-ai'
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🤖 Human vs AI
          </button>
        </div>
      </div>

      {/* AI Difficulty Selection (only shown for AI mode) */}
      {gameMode === 'human-vs-ai' && (
        <div className="mb-8 w-full max-w-md">
          <h2 className="text-xl font-semibold text-center mb-4">Choose Difficulty</h2>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setAIDifficulty('easy')}
              className={`px-5 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                aiDifficulty === 'easy'
                  ? 'bg-green-500 text-white shadow-md scale-105'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              😊 Easy
            </button>
            <button
              onClick={() => setAIDifficulty('medium')}
              className={`px-5 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                aiDifficulty === 'medium'
                  ? 'bg-yellow-500 text-white shadow-md scale-105'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              😐 Medium
            </button>
            <button
              onClick={() => setAIDifficulty('hard')}
              className={`px-5 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                aiDifficulty === 'hard'
                  ? 'bg-red-500 text-white shadow-md scale-105'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              😈 Hard
            </button>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            {aiDifficulty === 'easy' && 'Perfect for beginners - AI thinks 0.5 seconds'}
            {aiDifficulty === 'medium' && 'Balanced challenge - AI thinks 2 seconds'}
            {aiDifficulty === 'hard' && 'Expert level - AI thinks 5 seconds'}
          </p>
        </div>
      )}

      {/* Corner Shape Selection */}
      <CornerConfig onSelect={setSelectedShape} />

      {/* Start Button */}
      <button
        onClick={handleStart}
        disabled={!selectedShape}
        className={`mt-8 px-8 py-4 rounded-lg text-lg font-bold transition-all cursor-pointer ${
          selectedShape
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Start Game
      </button>

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
