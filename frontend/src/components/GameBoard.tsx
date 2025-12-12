/**
 * Main GameBoard component - orchestrates game logic and UI
 * Refactored to use clean architecture with separated concerns
 */

import React, { useCallback } from 'react';
import PlayerCard from './PlayerCard';
import Board from './Board';
import HistorySidebar from './HistorySidebar';
import GameControls from './GameControls';
import WinnerBanner from './WinnerBanner';
import GameSetup from './GameSetup';
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

  /**
   * Handles cell click - either selects a piece or moves a selected piece
   */
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (state.status !== GameStatus.Playing || isAnimating) return;

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
   * Handles starting a new game with selected corner shape
   */
  const handleStartGame = useCallback(
    (cornerShape: CornerShape) => {
      actions.startGame(cornerShape);
    },
    [actions]
  );

  // Show setup screen if game not started
  if (state.status === GameStatus.Setup || !state.cornerShape) {
    return <GameSetup onSelect={handleStartGame} />;
  }

  // Main game UI
  return (
    <div className="flex flex-col items-center min-h-[100vh] justify-center bg-white py-6">
      <div className="w-full flex flex-col items-center">
        <div
          className="flex flex-col items-center"
          style={{ width: COMPUTED.wrapperWidth, minWidth: COMPUTED.wrapperWidth }}
        >
          {/* Player cards */}
          <div className="w-full flex flex-row mb-3 gap">
            <PlayerCard
              label="Player A"
              pieceImg={COLORS.player.A.piece}
              active={state.currentPlayer === 'A' && state.status === GameStatus.Playing}
              timer={
                state.currentPlayer === 'A' && state.status === GameStatus.Playing
                  ? state.turnSeconds
                  : undefined
              }
              color={COLORS.player.A.primary}
            />
            <div className="text-[#7e511d] text-lg font-bold font-serif px-4 select-none">
              vs
            </div>
            <PlayerCard
              label="Player B"
              pieceImg={COLORS.player.B.piece}
              active={state.currentPlayer === 'B' && state.status === GameStatus.Playing}
              timer={
                state.currentPlayer === 'B' && state.status === GameStatus.Playing
                  ? state.turnSeconds
                  : undefined
              }
              color={COLORS.player.B.primary}
            />
          </div>

          {/* Board and history sidebar */}
          <div
            className="flex flex-row items-start mx-auto"
            style={{ minWidth: COMPUTED.wrapperWidth }}
          >
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
