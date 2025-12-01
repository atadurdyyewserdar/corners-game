import React from "react";

const PlayerCard: React.FC<{
  label: string;
  pieceImg: string;
  active: boolean;
  timer?: number;
  color?: string;
}> = ({ label, pieceImg, active, timer, color }) => (
  <div
    className="flex flex-col items-center px-3 py-1 rounded select-none bg-white"
    style={{
      border: active ? `2.2px solid #ffce3d` : "2px solid #cab38b",
      boxShadow: active ? "0 0 12px 2px #e7b82e2c" : "0 1px 3px 1px #d6d3cf20",
      minWidth: 88,
      position: "relative",
      transition: "border 0.15s, background 0.15s, box-shadow 0.25s"
    }}
  >
    <img
      src={pieceImg}
      alt="Piece"
      className="w-6 h-6 mb-1"
      style={{
        filter:
          color === "red"
            ? "drop-shadow(0 0 6px #f43f5e77)"
            : "drop-shadow(0 0 6px #fff)",
      }}
    />
    <span className="font-bold text-xs uppercase tracking-wider"
      style={{color: color === "red" ? "#a00" : "#84623a"}}
    >
      {label}
    </span>
    {active && timer !== undefined && (
      <span
        className="absolute -top-2 right-1 bg-[#72522e] text-white text-xs font-bold rounded px-2 py-px"
        style={{
          boxShadow: "0 1px 4px #3331",
          fontSize: 13,
          letterSpacing: 1.2,
        }}
      >
        {timer}s
      </span>
    )}
  </div>
);

export default PlayerCard;