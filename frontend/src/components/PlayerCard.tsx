import React from "react";
import { COLORS, SHADOWS } from "../constants/theme";
import { LAYOUT } from "../constants/dimensions";

interface PlayerCardProps {
  label: string;
  pieceImg: string;
  active: boolean;
  timer?: number;
  color?: string;
  isAIThinking?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  label,
  pieceImg,
  active,
  timer,
  color,
  isAIThinking = false,
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
    {active && timer !== undefined && (
      <span
        className="absolute -top-6 right-1 text-xs font-bold rounded-sm px-2 py-px"
        style={{
          backgroundColor: COLORS.ui.timer.bg,
          color: COLORS.ui.timer.text,
          boxShadow: SHADOWS.timer,
          fontSize: 13,
          letterSpacing: 1.2,
        }}
      >
        {timer}s
      </span>
    )}
    {/* AI Thinking Indicator - Fixed height to prevent layout shift */}
    <div style={{ height: '20px', marginTop: '4px' }}>
      {isAIThinking && active && (
        <div className="flex items-center gap-1">
          <div className="animate-spin h-3 w-3 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="text-blue-600 font-semibold text-xs">Thinking...</span>
        </div>
      )}
    </div>
  </div>
);

export default PlayerCard;