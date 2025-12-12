/**
 * Custom hook for managing game state with reducer pattern and AI integration
 */

import { useReducer, useCallback, useEffect, useRef } from 'react';
import type { GameState, MoveEntry } from '../domain/models/GameState';
import type { PieceWithId, Position } from '../domain/models/Position';
import type { PlayerType } from '../domain/models/Player';
import type { CornerShape } from '../constants/gameConfig';
import type { GameMode, AIDifficulty } from '../domain/models/AI';
import { GameStatus, initialGameState } from '../domain/models/GameState';
import { getOpponent } from '../domain/models/Player';
import { createInitialPieces, clonePieces, movePiece, createBoardFromPieces } from '../domain/utils/boardUtils';
import { hasPlayerWon } from '../domain/utils/winCondition';
import { AIPlayer } from '../domain/ai/AIPlayer';
import { AI_DIFFICULTY_CONFIG } from '../domain/models/AI';

type GameAction =
  | { type: 'START_GAME'; cornerShape: CornerShape; gameMode: GameMode; aiDifficulty: AIDifficulty | null }
  | { type: 'SELECT_PIECE'; piece: PieceWithId | null }
  | { type: 'MOVE_PIECE'; pieceId: string; to: Position; path: Position[] }
  | { type: 'SET_ANIMATING'; isAnimating: boolean }
  | { type: 'SET_AI_THINKING'; isThinking: boolean }
  | { type: 'UPDATE_PIECES'; pieces: PieceWithId[] }
  | { type: 'END_TURN' }
  | { type: 'SET_WINNER'; winner: PlayerType }
  | { type: 'RESET_GAME'; keepShape?: boolean }
  | { type: 'JUMP_TO_HISTORY'; index: number }
  | { type: 'INCREMENT_TIMER' }
  | { type: 'RESET_TIMER' };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const pieces = createInitialPieces(action.cornerShape);
      return {
        ...initialGameState,
        status: GameStatus.Playing,
        gameMode: action.gameMode,
        aiDifficulty: action.aiDifficulty,
        aiPlayer: action.gameMode === 'human-vs-ai' ? 'B' : null, // AI always plays as Player B
        cornerShape: action.cornerShape,
        pieces,
        currentPlayer: 'A',
        history: [{ pieces: clonePieces(pieces) }],
      };
    }

    case 'SELECT_PIECE':
      return {
        ...state,
        selectedPiece: action.piece,
      };

    case 'MOVE_PIECE': {
      if (!state.cornerShape) return state;
      
      const movedPieces = movePiece(
        state.pieces,
        action.pieceId,
        action.to.row,
        action.to.col
      );
      
      const newHistory: MoveEntry = {
        pieces: clonePieces(movedPieces),
        from: action.path[0],
        to: action.path[action.path.length - 1],
      };
      
      return {
        ...state,
        pieces: movedPieces,
        lastMove: {
          from: action.path[0],
          to: action.path[action.path.length - 1],
        },
        history: [...state.history, newHistory],
      };
    }

    case 'SET_ANIMATING':
      return {
        ...state,
        isAnimating: action.isAnimating,
      };

    case 'SET_AI_THINKING':
      return {
        ...state,
        isAIThinking: action.isThinking,
      };

    case 'UPDATE_PIECES':
      return {
        ...state,
        pieces: action.pieces,
      };

    case 'END_TURN':
      return {
        ...state,
        currentPlayer: getOpponent(state.currentPlayer),
        selectedPiece: null,
        turnSeconds: 0,
      };

    case 'SET_WINNER':
      return {
        ...state,
        status: GameStatus.Finished,
        winner: action.winner,
        selectedPiece: null,
      };

    case 'RESET_GAME': {
      if (!state.cornerShape) return state;
      
      const pieces = createInitialPieces(state.cornerShape);
      return {
        ...initialGameState,
        status: action.keepShape ? GameStatus.Setup : GameStatus.Playing,
        gameMode: action.keepShape ? 'human-vs-human' : state.gameMode,
        aiDifficulty: action.keepShape ? null : state.aiDifficulty,
        aiPlayer: action.keepShape ? null : state.aiPlayer,
        cornerShape: action.keepShape ? null : state.cornerShape,
        pieces: action.keepShape ? [] : pieces,
        currentPlayer: 'A',
        history: action.keepShape ? [] : [{ pieces: clonePieces(pieces) }],
      };
    }

    case 'JUMP_TO_HISTORY': {
      const targetEntry = state.history[action.index];
      if (!targetEntry) return state;
      
      return {
        ...state,
        pieces: clonePieces(targetEntry.pieces),
        currentPlayer: action.index % 2 === 0 ? 'A' : 'B',
        selectedPiece: null,
        status: GameStatus.Playing,
        winner: null,
        lastMove: targetEntry.from && targetEntry.to
          ? { from: targetEntry.from, to: targetEntry.to }
          : null,
        turnSeconds: 0,
      };
    }

    case 'INCREMENT_TIMER':
      return {
        ...state,
        turnSeconds: state.turnSeconds + 1,
      };

    case 'RESET_TIMER':
      return {
        ...state,
        turnSeconds: 0,
      };

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const aiPlayerRef = useRef<AIPlayer | null>(null);
  const isAITurnInProgress = useRef(false);

  // Initialize AI player when game starts with AI mode
  useEffect(() => {
    if (state.gameMode === 'human-vs-ai' && state.aiDifficulty && !aiPlayerRef.current) {
      const config = AI_DIFFICULTY_CONFIG[state.aiDifficulty];
      aiPlayerRef.current = new AIPlayer(config);
    }
  }, [state.gameMode, state.aiDifficulty]);

  // Trigger AI move when it's AI's turn
  useEffect(() => {
    const shouldAIMove =
      state.status === GameStatus.Playing &&
      state.gameMode === 'human-vs-ai' &&
      state.currentPlayer === state.aiPlayer &&
      !state.isAnimating &&
      !state.isAIThinking &&
      !isAITurnInProgress.current;

    if (shouldAIMove && aiPlayerRef.current && state.cornerShape) {
      isAITurnInProgress.current = true;
      dispatch({ type: 'SET_AI_THINKING', isThinking: true });

      // Use setTimeout to allow UI to update before heavy computation
      setTimeout(() => {
        if (!aiPlayerRef.current || !state.cornerShape) return;

        const board = createBoardFromPieces(state.pieces);
        const aiMove = aiPlayerRef.current.findBestMove(
          board,
          state.pieces,
          state.currentPlayer,
          state.cornerShape
        );

        if (aiMove) {
          // Find the piece that needs to move
          const pieceToMove = state.pieces.find(
            p => p.row === aiMove.from.row && p.col === aiMove.from.col
          );

          if (pieceToMove) {
            // Create path for animation
            const path: Position[] = [
              { row: aiMove.from.row, col: aiMove.from.col },
              { row: aiMove.to.row, col: aiMove.to.col },
            ];

            // Execute the move
            dispatch({ type: 'MOVE_PIECE', pieceId: pieceToMove.id, to: aiMove.to, path });

            // Check for win
            const updatedPieces = movePiece(state.pieces, pieceToMove.id, aiMove.to.row, aiMove.to.col);
            if (state.cornerShape && hasPlayerWon(updatedPieces, state.currentPlayer, state.cornerShape)) {
              dispatch({ type: 'SET_WINNER', winner: state.currentPlayer });
            } else {
              dispatch({ type: 'END_TURN' });
            }
          }
        }

        dispatch({ type: 'SET_AI_THINKING', isThinking: false });
        isAITurnInProgress.current = false;
      }, 100);
    }
  }, [
    state.status,
    state.gameMode,
    state.currentPlayer,
    state.aiPlayer,
    state.isAnimating,
    state.isAIThinking,
    state.pieces,
    state.cornerShape,
  ]);

  const startGame = useCallback((cornerShape: CornerShape, gameMode: GameMode, aiDifficulty: AIDifficulty | null) => {
    // Clear old AI instance
    if (aiPlayerRef.current) {
      aiPlayerRef.current.clearCache();
      aiPlayerRef.current = null;
    }
    isAITurnInProgress.current = false;
    
    dispatch({ type: 'START_GAME', cornerShape, gameMode, aiDifficulty });
  }, []);

  const selectPiece = useCallback((piece: PieceWithId | null) => {
    dispatch({ type: 'SELECT_PIECE', piece });
  }, []);

  const makeMove = useCallback(
    (pieceId: string, to: Position, path: Position[]) => {
      dispatch({ type: 'MOVE_PIECE', pieceId, to, path });
      
      // Check for win condition after move
      if (state.cornerShape) {
        const updatedPieces = movePiece(state.pieces, pieceId, to.row, to.col);
        if (hasPlayerWon(updatedPieces, state.currentPlayer, state.cornerShape)) {
          dispatch({ type: 'SET_WINNER', winner: state.currentPlayer });
          return true; // Winner found
        }
      }
      
      dispatch({ type: 'END_TURN' });
      return false; // No winner yet
    },
    [state.currentPlayer, state.cornerShape, state.pieces]
  );

  const setAnimating = useCallback((isAnimating: boolean) => {
    dispatch({ type: 'SET_ANIMATING', isAnimating });
  }, []);

  const setAIThinking = useCallback((isThinking: boolean) => {
    dispatch({ type: 'SET_AI_THINKING', isThinking });
  }, []);

  const updatePieces = useCallback((pieces: PieceWithId[]) => {
    dispatch({ type: 'UPDATE_PIECES', pieces });
  }, []);

  const resetGame = useCallback((keepShape = false) => {
    if (aiPlayerRef.current) {
      aiPlayerRef.current.clearCache();
      if (keepShape) {
        aiPlayerRef.current = null;
      }
    }
    isAITurnInProgress.current = false;
    dispatch({ type: 'RESET_GAME', keepShape });
  }, []);

  const jumpToHistory = useCallback((index: number) => {
    dispatch({ type: 'JUMP_TO_HISTORY', index });
  }, []);

  const incrementTimer = useCallback(() => {
    dispatch({ type: 'INCREMENT_TIMER' });
  }, []);

  const resetTimer = useCallback(() => {
    dispatch({ type: 'RESET_TIMER' });
  }, []);

  return {
    state,
    actions: {
      startGame,
      selectPiece,
      makeMove,
      setAnimating,
      setAIThinking,
      updatePieces,
      resetGame,
      jumpToHistory,
      incrementTimer,
      resetTimer,
    },
  };
}
