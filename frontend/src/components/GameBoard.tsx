import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import PlayerCard from "./PlayerCard";
import CornerConfig, { cornerShapeLabel } from "./CornerConfig";
import type { CornerShape } from "./CornerConfig";
import type { Player } from "../types/game";

const BLACK_PIECE_IMG = "/piece_black.png";
const RED_PIECE_IMG = "/piece_red.png";

const BOARD_SIZE = 8;
const CELL_SIZE = 64;
const PIECE_SIZE = 0.8 * CELL_SIZE;
const SIDEBAR_WIDTH = 230; // px for history sidebar
const BOARD_DISPLAY_WIDTH = BOARD_SIZE * CELL_SIZE + 16;
const WRAPPER_WIDTH = BOARD_DISPLAY_WIDTH + SIDEBAR_WIDTH + 32; // +gap

type Position = { row: number; col: number };
type PieceWithId = { id: string; player: Player; row: number; col: number };
type MoveEntry = { pieces: PieceWithId[]; from?: Position; to?: Position };

const DARK_SQUARE = "#A46D41";
const LIGHT_SQUARE = "#F7E0AC";

function createInitialPieces(corner: CornerShape): PieceWithId[] {
  let idCounterA = 1,
    idCounterB = 1;
  const pieces: PieceWithId[] = [];
  // Player A: top-left corner
  for (let row = 0; row < corner.rows; row++)
    for (let col = 0; col < corner.cols; col++)
      pieces.push({ id: `A-${idCounterA++}`, player: "A", row, col });
  // Player B: bottom-right corner
  for (let row = BOARD_SIZE - corner.rows; row < BOARD_SIZE; row++)
    for (let col = BOARD_SIZE - corner.cols; col < BOARD_SIZE; col++)
      pieces.push({ id: `B-${idCounterB++}`, player: "B", row, col });
  return pieces;
}
function clonePieces(pieces: PieceWithId[]): PieceWithId[] {
  return pieces.map((p) => ({ ...p }));
}
function getBoardFromPieces(pieces: PieceWithId[]): (Player | null)[][] {
  const board: (Player | null)[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );
  for (const p of pieces) board[p.row][p.col] = p.player;
  return board;
}
function isPlayerInOpponentCorner(
  pieces: PieceWithId[],
  player: Player,
  corner: CornerShape
): boolean {
  if (player === "A") {
    for (let row = BOARD_SIZE - corner.rows; row < BOARD_SIZE; row++)
      for (let col = BOARD_SIZE - corner.cols; col < BOARD_SIZE; col++)
        if (
          !pieces.some(
            (p) => p.player === "A" && p.row === row && p.col === col
          )
        )
          return false;
    return true;
  }
  if (player === "B") {
    for (let row = 0; row < corner.rows; row++)
      for (let col = 0; col < corner.cols; col++)
        if (
          !pieces.some(
            (p) => p.player === "B" && p.row === row && p.col === col
          )
        )
          return false;
    return true;
  }
  return false;
}
function getValidMoves(board: (Player | null)[][], pos: Position): Position[] {
  const directions = [
    { dr: -1, dc: 0 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
  ];
  const moves: Position[] = [];
  const visited = new Set<string>();
  function posKey(p: Position) {
    return `${p.row},${p.col}`;
  }
  directions.forEach(({ dr, dc }) => {
    const nr = pos.row + dr,
      nc = pos.col + dc;
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
  function dfsJump(from: Position) {
    directions.forEach(({ dr, dc }) => {
      const midR = from.row + dr,
        midC = from.col + dc;
      const jumpR = from.row + dr * 2,
        jumpC = from.col + dc * 2;
      if (
        jumpR >= 0 &&
        jumpR < BOARD_SIZE &&
        jumpC >= 0 &&
        jumpC < BOARD_SIZE &&
        board[midR][midC] !== null &&
        board[jumpR][jumpC] === null
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
function findJumpPath(
  board: (Player | null)[][],
  from: Position,
  to: Position
): Position[] {
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
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 },
    ];
    for (const { dr, dc } of dirs) {
      const midR = current.row + dr,
        midC = current.col + dc;
      const jumpR = current.row + dr * 2,
        jumpC = current.col + dc * 2;
      if (
        jumpR >= 0 &&
        jumpR < BOARD_SIZE &&
        jumpC >= 0 &&
        jumpC < BOARD_SIZE &&
        board[midR][midC] !== null &&
        board[jumpR][jumpC] === null &&
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
  return path[path.length - 1].row === to.row &&
    path[path.length - 1].col === to.col
    ? path
    : [from, to];
}

const GameBoard: React.FC = () => {
  const [started, setStarted] = useState(false);
  const [cornerShape, setCornerShape] = useState<CornerShape | null>(null);
  const [pieces, setPieces] = useState<PieceWithId[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("A");
  const [selected, setSelected] = useState<PieceWithId | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player>(null);
  const [lastMove, setLastMove] = useState<{
    from: Position;
    to: Position;
  } | null>(null);
  const [animating, setAnimating] = useState(false);
  const [turnSeconds, setTurnSeconds] = useState(0);
  const [history, setHistory] = useState<MoveEntry[]>([]);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (started && !gameOver) {
      interval.current = setInterval(() => {
        setTurnSeconds((s) => s + 1);
      }, 1000);
      return () => {
        if (interval.current) clearInterval(interval.current);
      };
    }
    if (!started || gameOver) {
      if (interval.current) clearInterval(interval.current);
    }
  }, [started, gameOver, currentPlayer]);

  useEffect(() => {
    setTurnSeconds(0);
  }, [currentPlayer, started, cornerShape]);

  function startGameWithCorner(shape: CornerShape) {
    setCornerShape(shape);
    const initial = createInitialPieces(shape);
    setPieces(initial);
    setCurrentPlayer("A");
    setSelected(null);
    setGameOver(false);
    setWinner(null);
    setLastMove(null);
    setAnimating(false);
    setTurnSeconds(0);
    setHistory([{ pieces: clonePieces(initial) }]);
    setStarted(true);
  }

  useEffect(() => {
    if (cornerShape && (!pieces.length || !started)) {
      const initial = createInitialPieces(cornerShape);
      setPieces(initial);
      setHistory([{ pieces: clonePieces(initial) }]);
    }
    // eslint-disable-next-line
  }, [cornerShape]);

  const board = getBoardFromPieces(pieces);
  const validMovePositions = selected ? getValidMoves(board, selected) : [];

  function resetGame(alsoStop?: boolean) {
    if (cornerShape) {
      const init = createInitialPieces(cornerShape);
      setPieces(init);
      setCurrentPlayer("A");
      setSelected(null);
      setGameOver(false);
      setWinner(null);
      setLastMove(null);
      setAnimating(false);
      setTurnSeconds(0);
      setHistory([{ pieces: clonePieces(init) }]);
      if (alsoStop) {
        setStarted(false);
        setCornerShape(null);
      }
    }
  }

  async function animatePieceStepwise(piece: PieceWithId, path: Position[]) {
    setAnimating(true);
    let newPositions = clonePieces(pieces);
    for (let i = 1; i < path.length; ++i) {
      await new Promise((res) => setTimeout(res, i === 1 ? 90 : 300));
      newPositions = newPositions.map((p) =>
        p.id === piece.id ? { ...p, row: path[i].row, col: path[i].col } : p
      );
      setPieces(clonePieces(newPositions));
      setLastMove({ from: path[0], to: path[path.length - 1] });
    }
    setAnimating(false);
  }

  function handleCellClick(row: number, col: number) {
    if (!started || gameOver || animating) return;
    const piece = pieces.find((p) => p.row === row && p.col === col);
    if (selected) {
      const moves = getValidMoves(board, selected);
      if (!piece && moves.some((p) => p.row === row && p.col === col)) {
        const path = findJumpPath(board, selected, { row, col });
        animatePieceStepwise(selected, path).then(() => {
          const movedPieces = pieces.map((p) =>
            p.id === selected.id ? { ...p, row, col } : p
          );
          setHistory((prev) => [
            ...prev,
            {
              pieces: movedPieces.map((p) => ({ ...p })),
              from: { row: path[0].row, col: path[0].col },
              to: {
                row: path[path.length - 1].row,
                col: path[path.length - 1].col,
              },
            },
          ]);
          if (
            isPlayerInOpponentCorner(movedPieces, currentPlayer, cornerShape!)
          ) {
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
    if (selected && selected.row === row && selected.col === col)
      outline = "#facc15";
    // else if (
    //   selected &&
    //   validMovePositions.some((p) => p.row === row && p.col === col)
    // )
    //   outline = "#14c8ea";
    else if (lastMove && lastMove.to.row === row && lastMove.to.col === col)
      outline = "#6366f1";
    else if (lastMove && lastMove.from.row === row && lastMove.from.col === col)
      outline = "#818cf8";
    return outline || undefined;
  }
  function isHistoryOverlay(row: number, col: number) {
    if (!history.length) return null;
    const latest = history[history.length - 1];
    if (!latest.from || !latest.to) return null;
    if (latest.from.row === row && latest.from.col === col) return "from";
    if (latest.to.row === row && latest.to.col === col) return "to";
    return null;
  }
  function jumpToHistory(idx: number) {
    setPieces(history[idx].pieces.map((p) => ({ ...p })));
    setCurrentPlayer(idx % 2 === 0 ? "A" : "B");
    setSelected(null);
    setGameOver(false);
    setWinner(null);
    setLastMove(
      history[idx].from && history[idx].to
        ? { from: history[idx].from, to: history[idx].to }
        : null
    );
    setTurnSeconds(0);
  }

  if (!started || !cornerShape) {
    return (
      <div className="flex flex-col items-center min-h-[100vh] justify-center bg-white py-6">
        <h1 className="text-4xl font-extrabold drop-shadow-sm text-center mb-8 mt-4">
          Corners Game
        </h1>
        <CornerConfig onSelect={startGameWithCorner} />
        <div className="mt-10 mb-4">
          <p className="text-center text-base">
            Select a starting corner size for both players. <br />
            3x3 is classic—try 3x4 or 4x4 for unique strategy!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-[100vh] justify-center bg-white py-6">
      <div className="w-full flex flex-col items-center">
        {/* Main content wrapper, fixed width: board+sidebar */}
        <div
          className="flex flex-col items-center"
          style={{ width: WRAPPER_WIDTH, minWidth: WRAPPER_WIDTH }}
        >
          {/* Centered player panel */}
          <div className="w-full flex flex-row mb-3 gap">
            <PlayerCard
              label="Player A"
              pieceImg={BLACK_PIECE_IMG}
              active={currentPlayer === "A" && !gameOver}
              timer={
                currentPlayer === "A" && !gameOver ? turnSeconds : undefined
              }
              color="#6b4c29"
            />
            <div
              className="text-[#7e511d] text-lg font-bold font-serif px-4 select-none"
            >
              vs
            </div>
            <PlayerCard
              label="Player B"
              pieceImg={RED_PIECE_IMG}
              active={currentPlayer === "B" && !gameOver}
              timer={
                currentPlayer === "B" && !gameOver ? turnSeconds : undefined
              }
              color="#b91c1c"
            />
          </div>

          {/* Board+History, perfectly centered as a total unit */}
          <div
            className="flex flex-row items-start mx-auto"
            style={{ minWidth: WRAPPER_WIDTH }}
          >
            <div className="relative overflow-hidden rounded bg-white border-2 border-gray-300">
              <div
                className="grid w-full h-full bg-gradient-to-b from-[#fff7eb] to-[#f7e0ac] overflow-hidden"
                style={{
                  gridTemplateColumns: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`,
                  gridTemplateRows: `repeat(${BOARD_SIZE}, ${CELL_SIZE}px)`,
                }}
              >
                {/* ...cell rendering unchanged */}
                {Array.from({ length: BOARD_SIZE }).map((_, row) =>
                  Array.from({ length: BOARD_SIZE }).map((_, col) => {
                    const color =
                      (row + col) % 2 === 1 ? DARK_SQUARE : LIGHT_SQUARE;
                    const outlineColor = cellOutline(row, col);
                    const histType = isHistoryOverlay(row, col);
                    let highlightBG = "";
                    if (outlineColor === "#14c8ea")
                      highlightBG =
                        "radial-gradient(circle at 55% 60%, #28e0ff99 0%, #f7e0ac33 100%)";
                    if (outlineColor === "#facc15")
                      highlightBG =
                        "radial-gradient(circle at 45% 40%, #ffe89399 0%, #a46d4133 100%)";
                    return (
                      <div
                        key={`${row}-${col}`}
                        className="relative rounded-[2px]"
                        style={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          background: highlightBG || color,
                          border: "none",
                          boxShadow:
                            row === 0 ||
                            col === 0 ||
                            row === BOARD_SIZE - 1 ||
                            col === BOARD_SIZE - 1
                              ? "0 2px 15px #52391d11"
                              : "",
                          cursor: "pointer",
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
                              borderRadius: 4,
                              zIndex: 2,
                              boxSizing: "border-box",
                              boxShadow: "0 0 8px 2px #dcfaee22",
                            }}
                          />
                        )}
                        {histType && (
                          <div
                            className="absolute inset-0 rounded"
                            style={{
                              background:
                                histType === "from"
                                  ? "rgba(70,123,233,0.18)"
                                  : "rgba(251,201,53,0.17)",
                              zIndex: 1,
                            }}
                          />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              {pieces.map((piece) => (
                <motion.img
                  key={piece.id}
                  src={piece.player === "A" ? BLACK_PIECE_IMG : RED_PIECE_IMG}
                  alt={piece.player === "A" ? "Player A" : "Player B"}
                  animate={{
                    left: piece.col * CELL_SIZE + (CELL_SIZE - PIECE_SIZE) / 2,
                    top: piece.row * CELL_SIZE + (CELL_SIZE - PIECE_SIZE) / 2,
                  }}
                  initial={false}
                  transition={{ type: "spring", stiffness: 520, damping: 32 }}
                  style={{
                    position: "absolute",
                    width: PIECE_SIZE,
                    height: PIECE_SIZE,
                    zIndex: 10,
                    pointerEvents: "none",
                    userSelect: "none",
                    filter:
                      piece.player === "A"
                        ? "drop-shadow(0 2px 10px #55380a8c)"
                        : "drop-shadow(0 2px 12px #a63f2470)",
                  }}
                  draggable={false}
                />
              ))}
            </div>
            {/* History - fixed width */}
            <div
              className="flex flex-col items-start rounded bg-white border border-gray-300 shadow px-3 py-2 ml-8"
              style={{
                width: SIDEBAR_WIDTH,
                minWidth: SIDEBAR_WIDTH,
                maxHeight: BOARD_SIZE * CELL_SIZE + 16,
              }}
            >
              <div className="font-bold mb-2 text-[#a46d41] text-base">
                Move history{" "}
                <span className="ml-1 text-xs font-normal text-[#ad905b]">
                  ({cornerShapeLabel(cornerShape)})
                </span>
              </div>
              <div className="overflow-y-auto w-full" style={{ maxHeight: BOARD_SIZE * CELL_SIZE - 45 }}>
                {history.map((item, idx) => (
                  <button
                    key={idx}
                    className={`mb-1 flex gap-2 items-center text-xs font-mono rounded px-2 py-[2px]  ${
                      idx === history.length - 1
                        ? "bg-[#eee3bc] font-bold border border-[#e4d39f]"
                        : "bg-white border border-transparent"
                    } hover:bg-[#f7e0ac]`}
                    onClick={gameOver ? () => jumpToHistory(idx) : undefined}
                    style={{
                      minWidth: 80,
                      cursor: gameOver ? "pointer" : "not-allowed",
                      opacity: gameOver ? 1 : 0.8,
                    }}
                    tabIndex={gameOver ? 0 : -1}
                    disabled={!gameOver}
                    aria-disabled={!gameOver}
                  >
                    <span className={`pr-1`}>
                      {idx === 0 ? "Start" : `#${idx}`}
                    </span>
                    {idx !== 0 && item.from && item.to && (
                      <span
                        className="rounded bg-gray-100 px-1"
                        style={{
                          fontFamily: "monospace",
                          fontSize: "12px",
                          color: "#555",
                        }}
                      >
                        {`[${item.from.row},${item.from.col}] → [${item.to.row},${item.to.col}]`}
                      </span>
                    )}
                  </button>
                ))}
                {gameOver === false && (
                  <div className="text-xs italic text-gray-400 w-full pl-1 pt-2">
                    (Available for step-back after game ends)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buttons - centered exactly below above wrapper */}
          <div
            className="flex flex-row gap-6 mt-7"
            style={{ width: WRAPPER_WIDTH }}
          >
            <button
              className="px-5 py-2 rounded font-semibold text-[#A46D41] bg-[#f3e1c0] border border-[#ca9b69] shadow hover:bg-[#e5d3ba] hover:scale-105 transition cursor-pointer"
              onClick={() => resetGame(false)}
              disabled={animating}
              style={{ cursor: "pointer" }}
            >
              Restart Game
            </button>
            <button
              className="px-5 py-2 rounded font-semibold text-[#75441a] bg-[#ffe4c7] border border-[#ca9b69] shadow hover:bg-[#fadfb5] hover:scale-105 transition cursor-pointer"
              onClick={() => resetGame(true)}
              disabled={animating}
              style={{ cursor: "pointer" }}
            >
              End Game
            </button>
          </div>
          {gameOver && (
            <div
              className="mt-7 px-8 py-4 bg-gradient-to-br from-[#f7e0ac] to-[#a46d41] border border-[#d7ad81] rounded shadow text-2xl font-black text-[#7e511d] tracking-wide uppercase flex flex-col items-center"
              style={{ width: WRAPPER_WIDTH }}
            >
              <div>
                Winner:{" "}
                <span
                  className={"ml-2"}
                  style={{
                    color: winner === "A" ? "#6b4c29" : "#b91c1c",
                    textShadow:
                      winner === "A" ? "0 2px 7px #fff9" : "0 2px 7px #fdcfcc",
                  }}
                >
                  {winner === "A" ? "Player A" : "Player B"}
                </span>
              </div>
              <div className="mt-2 text-base tracking-wider font-medium text-[#9f6d35]">
                (Tap Restart to play again or roll back with history)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
