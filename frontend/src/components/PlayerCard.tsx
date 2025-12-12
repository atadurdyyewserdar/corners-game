import React from "react";
import { COLORS } from "../constants/theme";
import { LAYOUT } from "../constants/dimensions";

interface PlayerCardProps {
  label: string;
  pieceImg: string;
  active: boolean;
  color?: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  label,
  pieceImg,
  active,
  color,
}) => (
  <div
    className="flex flex-col items-center px-3 py-1 rounded select-none bg-white"
    style={{
      border: active
        ? `${LAYOUT.activeBorderWidth}px solid ${COLORS.highlight.activeBorder}`
        : `${LAYOUT.borderWidth}px solid ${COLORS.ui.border.primary}`,
      minWidth: 88,
      position: "relative",
      transition: "border 0.15s, background 0.15s, box-shadow 0.25s",
    }}
  >
    <img
      src={pieceImg}
      alt="Piece"
      className="w-6 h-6 mb-1"
      style={{
        filter: "drop-shadow(0 0 6px #fff)",
      }}
    />
    <span
      className="font-bold text-xs uppercase tracking-wider"
      style={{ color: color || COLORS.ui.text.secondary }}
    >
      {label}
    </span>
  </div>
);

export default PlayerCard;