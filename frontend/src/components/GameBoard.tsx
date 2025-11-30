import React, { useState } from "react";
import { motion } from "framer-motion";
import type { Player } from "../types/game";

const BLACK_PIECE_IMG = "/piece_black.png"; // Player A
const RED_PIECE_IMG = "/piece_red.png";     // Player B

const BOARD_SIZE = 8;
const CELL_SIZE = 64;
const PIECE_SIZE = 0.8 * CELL_SIZE;

type Position = { row: number; col: number };
type PieceWithId = { id: string; player: Player; row: number; col: number };

function createInitialPieces(): PieceWithId[] {
  let idCounter = 1;
  const pieces: PieceWithId[] = [];
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 3; col++)
      pieces.push({ id: `A-${idCounter++}`, player: "A", row, col });
  idCounter = 1;
  for (let row = BOARD_SIZE - 3; row < BOARD_SIZE; row++)
    for (let col = BOARD_SIZE - 3; col < BOARD_SIZE; col++)
      pieces.push({ id: `B-${idCounter++}`, player: "B", row, col });
  return pieces;
}

function getBoardFromPieces(pieces: PieceWithId[]): (Player | null)[][] {
  const board: (Player | null)[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );
  for (const p of pieces) board[p.row][p.col] = p.player;
  return board;
}

function isPlayerInOpponentCorner(pieces: PieceWithId[], player: Player): boolean {
  if (player === "A") {
    for (let row = BOARD_SIZE - 3; row < BOARD_SIZE; row++)
      for (let col = BOARD_SIZE - 3; col < BOARD_SIZE; col++)
        if (!pieces.some(p => p.player === "A" && p.row === row && p.col === col))
          return false;
    return true;
  }
  if (player === "B") {
    for (let row = 0; row < 3; row++)
      for (let col = 0; col < 3; col++)
        if (!pieces.some(p => p.player === "B" && p.row === row && p.col === col))
          return false;
    return true;
  }
  return false;
}

function getValidMoves(board: (Player | null)[][], pos: Position): Position[] {
  const directions = [
    { dr: -1, dc: 0 }, { dr: 1, dc: 0 },
    { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
  ];
  const moves: Position[] = [];
  const visited = new Set<string>();
  function posKey(p: Position) { return `${p.row},${p.col}`; }
  // Adjacent
  directions.forEach(({ dr, dc }) => {
    const nr = pos.row + dr, nc = pos.col + dc;
    if (
      nr >= 0 && nr < BOARD_SIZE &&
      nc >= 0 && nc < BOARD_SIZE &&
      board[nr][nc] === null
    ) {
      moves.push({ row: nr, col: nc });
      visited.add(posKey({ row: nr, col: nc }));
    }
  });
  // Recursive jumps
  function dfsJump(from: Position) {
    directions.forEach(({ dr, dc }) => {
      const midR = from.row + dr, midC = from.col + dc;
      const jumpR = from.row + dr * 2, jumpC = from.col + dc * 2;
      if (
        jumpR >= 0 && jumpR < BOARD_SIZE && jumpC >= 0 && jumpC < BOARD_SIZE &&
        board[midR][midC] !== null && board[jumpR][jumpC] === null
      ) {
        const jumpTarget: Position = { row: jumpR, col: jumpC };
        const key = posKey(jumpTarget);
        if (!visited.has(key)) {
          moves.push(jumpTarget);
          visited.add(key);
          dfsJump(jumpTarget);
        }
      }
    });
  }
  dfsJump(pos);
  return moves;
}

function findJumpPath(board: (Player | null)[][], from: Position, to: Position): Position[] {
  if (
    (Math.abs(from.row - to.row) === 1 && from.col === to.col) ||
    (Math.abs(from.col - to.col) === 1 && from.row === to.row)
  ) {
    return [from, to];
  }
  const path: Position[] = [from];
  const visited = new Set<string>([`${from.row},${from.col}`]);
  function dfs(current: Position): boolean {
    if (current.row === to.row && current.col === to.col) return true;
    const dirs = [
      { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
    ];
    for (const { dr, dc } of dirs) {
      const midR = current.row + dr, midC = current.col + dc;
      const jumpR = current.row + dr * 2, jumpC = current.col + dc * 2;
      if (
        jumpR >= 0 && jumpR < BOARD_SIZE && jumpC >= 0 && jumpC < BOARD_SIZE &&
        board[midR][midC] !== null && board[jumpR][jumpC] === null &&
        !visited.has(`${jumpR},${jumpC}`)
      ) {
        visited.add(`${jumpR},${jumpC}`);
        path.push({ row: jumpR, col: jumpC });
        if (dfs({ row: jumpR, col: jumpC })) return true;
        path.pop();
      }
    }
    return false;
  }
  dfs(from);
  return path[path.length - 1].row === to.row && path[path.length - 1].col === to.col ? path : [from, to];
}

const GameBoard = () => {
  const [pieces, setPieces] = useState<PieceWithId[]>(createInitialPieces());
  const [currentPlayer, setCurrentPlayer] = useState<Player>("A");
  const [selected, setSelected] = useState<PieceWithId | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player>(null);
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);
  const [animating, setAnimating] = useState(false);

  const board = getBoardFromPieces(pieces);
  const validMovePositions = selected ? getValidMoves(board, selected) : [];

  function resetGame() {
    setPieces(createInitialPieces());
    setCurrentPlayer("A");
    setSelected(null);
    setGameOver(false);
    setWinner(null);
    setLastMove(null);
    setAnimating(false);
  }

  async function animatePieceStepwise(piece: PieceWithId, path: Position[]) {
    setAnimating(true);
    for (let i = 1; i < path.length; ++i) {
      // First move: short delay (90ms), others: 300ms
      await new Promise(res => setTimeout(res, i === 1 ? 90 : 300));
      setPieces(prev =>
        prev.map(p =>
          p.id === piece.id
            ? { ...p, row: path[i].row, col: path[i].col }
            : p
        )
      );
      setLastMove({ from: path[i - 1], to: path[i] });
    }
    setAnimating(false);
  }

  function handleCellClick(row: number, col: number) {
    if (gameOver || animating) return;
    const piece = pieces.find(p => p.row === row && p.col === col);
    if (selected) {
      const moves = getValidMoves(board, selected);
      if (
        !piece &&
        moves.some((p) => p.row === row && p.col === col)
      ) {
        const path = findJumpPath(board, selected, { row, col });
        animatePieceStepwise(selected, path).then(() => {
          const movedPieces = pieces.map(p =>
            p.id === selected.id
              ? { ...p, row, col }
              : p
          );
          if (isPlayerInOpponentCorner(movedPieces, currentPlayer)) {
            setGameOver(true);
            setWinner(currentPlayer);
            setPieces(movedPieces);
            setSelected(null);
          } else {
            setPieces(movedPieces);
            setSelected(null);
            setCurrentPlayer(currentPlayer === "A" ? "B" : "A");
          }
        });
        return;
      }
      if (selected.row === row && selected.col === col) {
        setSelected(null);
        return;
      }
    }
    if (piece && piece.player === currentPlayer) {
      setSelected(piece);
    }
  }

  function cellOutline(row: number, col: number): string | undefined {
    let outline = "";
    if (selected && selected.row === row && selected.col === col) outline = "#facc15"; // yellow
    else if (
      selected &&
      validMovePositions.some((p) => p.row === row && p.col === col)
    )
      outline = "#22d3ee"; // cyan
    else if (lastMove && lastMove.to.row === row && lastMove.to.col === col) outline = "#6366f1";
    else if (lastMove && lastMove.from.row === row && lastMove.from.col === col) outline = "#818cf8";
    return outline || undefined;
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
              <span className="ml-2 text-black font-semibold animate-pulse">⬅ Your turn!</span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="inline-block w-4 h-4 bg-red-500 rounded-full"></span>
          <span>
            Player&nbsp;B
            {currentPlayer === "B" && !gameOver && (
              <span className="ml-2 text-red-700 font-semibold animate-pulse">⬅ Your turn!</span>
            )}
          </span>
        </div>
      </div>
      <div
        className="relative rounded overflow-hidden border-4 border-green-200"
        style={{
          width: BOARD_SIZE * CELL_SIZE + 8,
          height: BOARD_SIZE * CELL_SIZE + 8,
          background: "repeating-linear-gradient(135deg,#a3e635,#bef264 12px,#d9f99d 18px,#a3e635 32px)"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`,
            width: "100%",
            height: "100%",
            position: "relative",
            zIndex: 1,
          }}
        >
          {Array.from({ length: BOARD_SIZE }).map((_, row) =>
            Array.from({ length: BOARD_SIZE }).map((_, col) => {
              const colorIdx = (row + col) % 2;
              const outlineColor = cellOutline(row, col);
              return (
                <div
                  key={`${row}-${col}`}
                  className="relative"
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    background: colorIdx === 0 ? "#fafaf9" : "#e1ffd1",
                    border: "2px solid #bae6fd",
                    boxSizing: "border-box",
                    borderRadius: 8,
                    cursor: !gameOver ? "pointer" : "default"
                  }}
                  onClick={() => handleCellClick(row, col)}
                >
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
                        borderRadius: 8,
                        zIndex: 2,
                        boxSizing: "border-box",
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
        {pieces.map(piece => (
          <motion.img
            key={piece.id}
            src={piece.player === "A" ? BLACK_PIECE_IMG : RED_PIECE_IMG}
            alt={piece.player === "A" ? "Player A" : "Player B"}
            animate={{
              left: piece.col * CELL_SIZE + (CELL_SIZE - PIECE_SIZE) / 2,
              top: piece.row * CELL_SIZE + (CELL_SIZE - PIECE_SIZE) / 2
            }}
            initial={false}
            transition={{ type: "spring", stiffness: 450, damping: 28 }}
            style={{
              position: "absolute",
              width: PIECE_SIZE,
              height: PIECE_SIZE,
              zIndex: 10,
              pointerEvents: "none",
              userSelect: "none"
            }}
            draggable={false}
          />
        ))}
      </div>
      <button
        className="mt-4 mb-2 px-4 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm font-medium shadow"
        onClick={resetGame}
        disabled={animating}
      >
        Restart Game
      </button>
      <p className="mt-2 text-sm text-gray-500 text-center">
        Click a piece, then a highlighted cell to move.<br />
        <b>First jump of multi-jump is fast, subsequent hops animate!</b>
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