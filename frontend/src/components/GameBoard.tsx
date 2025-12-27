/**
 * Main GameBoard component - orchestrates game logic and UI
 * Refactored to use clean architecture with separated concerns
 */

import React, { useCallback, useEffect } from 'react';
import PlayerCard from './PlayerCard';
import Board from './Board';
import HistorySidebar from './HistorySidebar';
import GameControls from './GameControls';
import WinnerBanner from './WinnerBanner';
import GameSetup from './GameSetup';
import { EvaluationBar } from './EvaluationBar';
import { useGameState } from '../hooks/useGameState';
import { useGameTimer } from '../hooks/useGameTimer';
import { usePieceAnimation } from '../hooks/usePieceAnimation';
import { getBoardFromPieces, findPieceAt } from '../domain/utils/boardUtils';
import { getValidMoves } from '../domain/utils/moveValidation';
import { findJumpPath } from '../domain/utils/pathFinding';
import { GameStatus } from '../domain/models/GameState';
import { COLORS } from '../constants/theme';
import { COMPUTED } from '../constants/dimensions';
import type { CornerShape } from '../constants/gameConfig';

const GameBoard: React.FC = () => {
  const { state, actions } = useGameState();
  const { isAnimating, animatePieceStepwise } = usePieceAnimation();

  // Timer management
  useGameTimer({
    status: state.status,
    onTick: actions.incrementTimer,
  });

  // Get board matrix from pieces
  const board = getBoardFromPieces(state.pieces);

  // Handle AI moves with animation
  useEffect(() => {
    if (state.pendingAIMove && !isAnimating) {
      const { piece, to } = state.pendingAIMove;
      
      // Find jump path for the AI move
      const path = findJumpPath(board, piece, to);
      
      // Animate the move
      animatePieceStepwise(
        piece,
        path,
        state.pieces,
        actions.updatePieces
      ).then(() => {
        // After animation, make the move and check for winner
        const hasWinner = actions.makeMove(piece.id, to, path);
        
        // Clear the pending AI move
        actions.clearPendingAIMove();
        
        if (!hasWinner) {
          // Continue game - turn will be ended by makeMove
        }
      });
    }
  }, [state.pendingAIMove, isAnimating, board, state.pieces, actions, animatePieceStepwise]);

  /**
   * Handles cell click - either selects a piece or moves a selected piece
   */
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      // Prevent interaction during animation, AI turn, or game not playing
      if (state.status !== GameStatus.Playing || isAnimating || state.isAIThinking) return;
      
      // Prevent human from moving AI's pieces
      if (state.currentPlayer === state.aiPlayer) return;

      const clickedPiece = findPieceAt(state.pieces, row, col);

      // If a piece is already selected
      if (state.selectedPiece) {
        const validMoves = getValidMoves(board, state.selectedPiece);
        const isValidMove = validMoves.some(
          (move) => move.row === row && move.col === col
        );

        // Try to move to the clicked cell
        if (!clickedPiece && isValidMove) {
          const path = findJumpPath(board, state.selectedPiece, { row, col });

          // Animate the move
          animatePieceStepwise(
            state.selectedPiece,
            path,
            state.pieces,
            actions.updatePieces
          ).then(() => {
            // After animation, make the move and check for winner
            const hasWinner = actions.makeMove(state.selectedPiece!.id, { row, col }, path);
            
            if (!hasWinner) {
              // Continue game
              actions.selectPiece(null);
            }
          });
          return;
        }

        // Deselect if clicking the same piece
        if (
          clickedPiece &&
          state.selectedPiece.row === row &&
          state.selectedPiece.col === col
        ) {
          actions.selectPiece(null);
          return;
        }
      }

      // Select a piece if it belongs to the current player
      if (clickedPiece && clickedPiece.player === state.currentPlayer) {
        actions.selectPiece(clickedPiece);
      }
    },
    [
      state.status,
      state.selectedPiece,
      state.pieces,
      state.currentPlayer,
      state.aiPlayer,
      state.isAIThinking,
      isAnimating,
      board,
      actions,
      animatePieceStepwise,
    ]
  );

  /**
   * Handles game restart
   */
  const handleRestart = useCallback(() => {
    actions.resetGame(false);
  }, [actions]);

  /**
   * Handles ending the game and returning to setup
   */
  const handleEndGame = useCallback(() => {
    actions.resetGame(true);
  }, [actions]);

  /**
   * Handles jumping to a specific move in history
   */
  const handleJumpToHistory = useCallback(
    (index: number) => {
      actions.jumpToHistory(index);
    },
    [actions]
  );

  /**
   * Handles starting a new game with selected corner shape and game mode
   */
  const handleStartGame = useCallback(
    (cornerShape: CornerShape, gameMode: import('../domain/models/AI').GameMode, aiDifficulty: import('../domain/models/AI').AIDifficulty | null) => {
      actions.startGame(cornerShape, gameMode, aiDifficulty);
    },
    [actions]
  );

  // Show setup screen if game not started
  if (state.status === GameStatus.Setup || !state.cornerShape) {
    return <GameSetup onSelect={handleStartGame} />;
  }

  // Main game UI
  return (
    <div className="flex flex-col items-center min-h-screen justify-center bg-white py-6">
      <div className="w-full flex flex-col items-center">
        <div
          className="flex flex-col items-center"
          style={{ width: COMPUTED.wrapperWidth, minWidth: COMPUTED.wrapperWidth }}
        >
          {/* Player cards */}
          <div className="w-full flex flex-row mb-3 gap items-center">
            <div className="flex items-center gap-2">
              <PlayerCard
                label={state.gameMode === 'human-vs-ai' && state.aiPlayer === 'A' ? "AI Player" : "Player A"}
                pieceImg={COLORS.player.A.piece}
                active={state.currentPlayer === 'A' && state.status === GameStatus.Playing}
                color={COLORS.player.A.primary}
              />
              {state.isAIThinking && state.aiPlayer === 'A' && (
                <div className="px-3 py-1 bg-blue-100 border-2 border-blue-400 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="text-blue-700 font-semibold text-xs">
                      Thinking...
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[#7e511d] text-lg font-bold font-serif px-4 select-none">
              vs
            </div>

            <div className="flex items-center gap-2">
              <PlayerCard
                label={state.gameMode === 'human-vs-ai' && state.aiPlayer === 'B' ? "AI Player" : "Player B"}
                pieceImg={COLORS.player.B.piece}
                active={state.currentPlayer === 'B' && state.status === GameStatus.Playing}
                color={COLORS.player.B.primary}
              />
              {state.isAIThinking && state.aiPlayer === 'B' && (
                <div className="px-3 py-1 bg-blue-100 border-2 border-blue-400 rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="text-blue-700 font-semibold text-xs">
                      Thinking...
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Board, evaluation bar, and history sidebar */}
          <div
            className="flex flex-row items-start mx-auto gap-4"
            style={{ minWidth: COMPUTED.wrapperWidth }}
          >
            {/* Evaluation Bar */}
            {state.status === GameStatus.Playing && (
              <EvaluationBar score={state.evaluationScore} />
            )}

            <Board
              pieces={state.pieces}
              selectedPiece={state.selectedPiece}
              lastMove={state.lastMove}
              onCellClick={handleCellClick}
            />
            <HistorySidebar
              history={state.history}
              cornerShape={state.cornerShape}
              gameStatus={state.status}
              onJumpToHistory={handleJumpToHistory}
              gameSeconds={state.gameSeconds}
            />
          </div>

          {/* Game controls */}
          <GameControls
            onRestart={handleRestart}
            onEndGame={handleEndGame}
            disabled={isAnimating}
          />

          {/* Winner banner */}
          {state.status === GameStatus.Finished && state.winner && (
            <WinnerBanner winner={state.winner} />
          )}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
