/**
 * AI-related type definitions
 */

export type GameMode = 'human-vs-human' | 'human-vs-ai';
export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface AIConfig {
  difficulty: AIDifficulty;
  maxDepth: number;
  maxTime: number; // milliseconds
}

export interface AIMove {
  from: { row: number; col: number };
  to: { row: number; col: number };
  score: number;
}

export interface TranspositionEntry {
  depth: number;
  score: number;
  flag: 'exact' | 'lowerbound' | 'upperbound';
  bestMove?: AIMove;
}

/**
 * AI difficulty configurations
 */
export const AI_DIFFICULTY_CONFIG: Record<AIDifficulty, AIConfig> = {
  easy: {
    difficulty: 'easy',
    maxDepth: 2,
    maxTime: 500,
  },
  medium: {
    difficulty: 'medium',
    maxDepth: 4,
    maxTime: 2000,
  },
  hard: {
    difficulty: 'hard',
    maxDepth: 6,
    maxTime: 5000,
  },
};
