import React, { useState } from "react";
import type { Board, Player } from "../types/game";

// Set your asset filepaths here (place your PNGs in public/ or set import path)
const BLACK_PIECE_IMG = "/pawn_black.png"; // Player A
const RED_PIECE_IMG = "/pawn_red.png"; // Player B

const BOARD_SIZE = 8;

function createInitialBoard(): Board {
  const board: Board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null as Player)
  );
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      board[row][col] = "A";
    }
  }
  for (let row = BOARD_SIZE - 3; row < BOARD_SIZE; row++) {
    for (let col = BOARD_SIZE - 3; col < BOARD_SIZE; col++) {
      board[row][col] = "B";
    }
  }
  return board;
}

type Position = { row: number; col: number };

function isPlayerInOpponentCorner(board: Board, player: Player): boolean {
  if (player === "A") {
    for (let row = BOARD_SIZE - 3; row < BOARD_SIZE; row++) {
      for (let col = BOARD_SIZE - 3; col < BOARD_SIZE; col++) {
        if (board[row][col] !== "A") {
          return false;
        }
      }
    }
    return true;
  }
  if (player === "B") {
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board[row][col] !== "B") {
          return false;
        }
      }
    }
    return true;
  }
  return false;
}

// Get all valid moves for CORNERS: adjacent or chains of horizontal/vertical jumps
function getValidMoves(board: Board, pos: Position): Position[] {
  const BOARD_SIZE = board.length;
  const directions = [
    { dr: -1, dc: 0 }, // up
    { dr: 1, dc: 0 }, // down
    { dr: 0, dc: -1 }, // left
    { dr: 0, dc: 1 }, // right
  ];
  const moves: Position[] = [];
  const visited = new Set<string>();

  function posKey(p: Position) {
    return `${p.row},${p.col}`;
  }

  // 1. Adjacent moves
  directions.forEach(({ dr, dc }) => {
    const nr = pos.row + dr;
    const nc = pos.col + dc;
    if (
      nr >= 0 &&
      nr < BOARD_SIZE &&
      nc >= 0 &&
      nc < BOARD_SIZE &&
      board[nr][nc] === null
    ) {
      moves.push({ row: nr, col: nc });
      visited.add(posKey({ row: nr, col: nc }));
    }
  });

  // 2. Recursive Jumps
  function dfsJump(from: Position) {
    directions.forEach(({ dr, dc }) => {
      const middleR = from.row + dr;
      const middleC = from.col + dc;
      const jumpR = from.row + dr * 2;
      const jumpC = from.col + dc * 2;
      if (
        jumpR >= 0 &&
        jumpR < BOARD_SIZE &&
        jumpC >= 0 &&
        jumpC < BOARD_SIZE &&
        board[middleR][middleC] !== null &&
        board[jumpR][jumpC] === null
      ) {
        const jumpTarget: Position = { row: jumpR, col: jumpC };
        const key = posKey(jumpTarget);
        if (!visited.has(key)) {
          moves.push(jumpTarget);
          visited.add(key);
          dfsJump(jumpTarget); // Allow multi-jump
        }
      }
    });
  }

  dfsJump(pos);

  return moves;
}

const CELL_SIZE = 64; // px
const BOARD_PX = BOARD_SIZE * CELL_SIZE;

const GameBoard = () => {
  const [board, setBoard] = useState<Board>(createInitialBoard);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("A");
  const [selected, setSelected] = useState<Position | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player>(null);
  const [lastMove, setLastMove] = useState<{
    from: Position;
    to: Position;
  } | null>(null);
  const [animating, setAnimating] = useState(false);

  const validMovePositions = selected ? getValidMoves(board, selected) : [];

  async function animateMovePath(path: Position[], player: Player) {
    if (path.length < 2) return;
    setAnimating(true);
    let clone = board.map((r) => r.slice());
    let from = path[0];
    for (let stepIdx = 1; stepIdx < path.length; stepIdx++) {
      const to = path[stepIdx];
      clone[to.row][to.col] = player;
      clone[from.row][from.col] = null;
      setBoard(clone.map((r) => r.slice()));
      setLastMove({ from, to });
      await new Promise((res) => setTimeout(res, 300));
      from = to;
    }
    setAnimating(false);
    return clone;
  }

  async function handleCellClick(row: number, col: number) {
    if (gameOver || animating) return;
    const cell = board[row][col];
    if (selected) {
      const moves = getValidMoves(board, selected);
      if (cell === null && moves.some((p) => p.row === row && p.col === col)) {
        // Find the jump path (DFS)
        let path: Position[] = [selected, { row, col }];
        function findJumpPath(
          current: Position,
          target: Position,
          visited: Set<string>,
          acc: Position[]
        ): boolean {
          if (current.row === target.row && current.col === target.col)
            return true;
          const directions = [
            { dr: -1, dc: 0 },
            { dr: 1, dc: 0 },
            { dr: 0, dc: -1 },
            { dr: 0, dc: 1 },
          ];
          visited.add(`${current.row},${current.col}`);
          for (const { dr, dc } of directions) {
            const midR = current.row + dr;
            const midC = current.col + dc;
            const jumpR = current.row + dr * 2;
            const jumpC = current.col + dc * 2;
            if (
              jumpR >= 0 &&
              jumpR < BOARD_SIZE &&
              jumpC >= 0 &&
              jumpC < BOARD_SIZE &&
              board[midR][midC] !== null &&
              board[jumpR][jumpC] === null &&
              !visited.has(`${jumpR},${jumpC}`)
            ) {
              acc.push({ row: jumpR, col: jumpC });
              if (
                findJumpPath({ row: jumpR, col: jumpC }, target, visited, acc)
              ) {
                return true;
              }
              acc.pop();
            }
          }
          return false;
        }
        if (
          (Math.abs(row - selected.row) === 2 && col === selected.col) ||
          (Math.abs(col - selected.col) === 2 && row === selected.row)
        ) {
          path = [selected];
          findJumpPath(selected, { row, col }, new Set(), path);
        }
        // Animate movement
        const newClone = await animateMovePath(path, currentPlayer);

        // After moves, check for win
        if (newClone && isPlayerInOpponentCorner(newClone, currentPlayer)) {
          setBoard(newClone);
          setGameOver(true);
          setWinner(currentPlayer);
          setSelected(null);
          return;
        }

        setBoard(newClone!);
        setSelected(null);
        setCurrentPlayer(currentPlayer === "A" ? "B" : "A");
        return;
      }
      if (selected.row === row && selected.col === col) {
        setSelected(null);
        return;
      }
    }
    if (cell === currentPlayer && !animating) {
      setSelected({ row, col });
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* Player Legend */}
      <div className="flex gap-6 items-center mt-4 mb-2 text-base">
        <div className="flex items-center gap-1">
          <span className="inline-block w-4 h-4 bg-black rounded-full"></span>
          <span>
            Player&nbsp;A
            {currentPlayer === "A" && !gameOver && (
              <span
                className="ml-2 text-black font-semibold animate-pulse"
                aria-label="Current turn"
              >
                ⬅ Your turn!
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-4 h-4 bg-red-500 rounded-full"></span>
          <span>
            Player&nbsp;B
            {currentPlayer === "B" && !gameOver && (
              <span
                className="ml-2 text-red-700 font-semibold animate-pulse"
                aria-label="Current turn"
              >
                ⬅ Your turn!
              </span>
            )}
          </span>
        </div>
      </div>
      <div
        className="relative rounded-2xl shadow-lg overflow-hidden border-4 border-green-200"
        style={{
          width: BOARD_PX + 8,
          height: BOARD_PX + 8,
          background:
            "repeating-linear-gradient(135deg,#a3e635,#bef264 12px,#d9f99d 18px,#a3e635 32px)",
        }}
      >
        {Array.from({ length: BOARD_SIZE }).map((_, row) =>
          Array.from({ length: BOARD_SIZE }).map((_, col) => {
            const colorIdx = (row + col) % 2;
            const isSelected =
              selected && selected.row === row && selected.col === col;
            const isValidMove =
              selected &&
              validMovePositions.some((p) => p.row === row && p.col === col);
            const wasLastFrom =
              lastMove &&
              lastMove.from.row === row &&
              lastMove.from.col === col;
            const wasLastTo =
              lastMove && lastMove.to.row === row && lastMove.to.col === col;
            const cell = board[row][col];

            // Choose highlight color based on state
            let outlineColor = "";
            if (wasLastTo) outlineColor = "#6366f1";
            else if (isSelected) outlineColor = "#facc15";
            else if (isValidMove) outlineColor = "#22d3ee";
            else if (wasLastFrom) outlineColor = "#818cf8";

            return (
              <div
                key={`${row}-${col}`}
                className="absolute flex items-center justify-center"
                onClick={() => handleCellClick(row, col)}
                tabIndex={-1}
                style={{
                  top: row * CELL_SIZE,
                  left: col * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  background: colorIdx === 0 ? "#fafaf9" : "#e1ffd1",
                  border: "2px solid #bae6fd",
                  borderRadius: 8,
                  boxSizing: "border-box", // ensures border doesn't shrink interior
                  zIndex: cell ? 10 : 1,
                  cursor: gameOver ? "not-allowed" : "pointer",
                  opacity: gameOver ? 0.6 : 1,
                  position: "absolute",
                  overflow: "visible",
                }}
              >
                {/* Highlight always overlays the piece, fills the cell exactly */}
                {outlineColor && (
                  <div
                    style={{
                      pointerEvents: "none",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      border: `3px solid ${outlineColor}`,
                      borderRadius: 6,
                      zIndex: 30,
                      boxSizing: "border-box",
                    }}
                  />
                )}
                {cell && (
                  <img
                    src={cell === "A" ? BLACK_PIECE_IMG : RED_PIECE_IMG}
                    alt={cell === "A" ? "Player A" : "Player B"}
                    className="w-[80%] h-[80%] drop-shadow-lg pointer-events-none"
                    draggable={false}
                    style={{
                      filter: animating
                        ? "drop-shadow(0 0 6px #818cf8)"
                        : undefined,
                      opacity: animating || gameOver ? 0.9 : 1,
                      zIndex: 20,
                    }}
                  />
                )}
              </div>
            );
          })
        )}
      </div>
      <button
        className="mt-4 mb-2 px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm font-medium shadow"
        onClick={() => {
          setBoard(createInitialBoard());
          setCurrentPlayer("A");
          setSelected(null);
          setGameOver(false);
          setWinner(null);
          setLastMove(null);
        }}
        disabled={animating}
      >
        Restart Game
      </button>
      <p className="mt-2 text-sm text-gray-500 text-center">
        Click your piece, then click a highlighted cell to move.
        <br />
        Adjacent moves or multi-jump chains (horizontal/vertical only).
        <br />
      </p>
      {gameOver && (
        <div className="mt-4 px-6 py-3 bg-green-100 border border-green-300 rounded shadow text-xl font-bold text-green-700">
          Winner: {winner}
        </div>
      )}
    </div>
  );
};

export default GameBoard;
