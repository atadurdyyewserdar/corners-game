import React from "react";

export type CornerShape = { rows: number; cols: number };
export const availableCorners: CornerShape[] = [
  { rows: 3, cols: 3 },
  { rows: 3, cols: 4 },
  { rows: 4, cols: 4 },
];

export function cornerShapeLabel({ rows, cols }: CornerShape) {
  return `${rows}x${cols}`;
}

const CornerConfig: React.FC<{
  onSelect: (shape: CornerShape) => void
  disabled?: boolean
}> = ({ onSelect, disabled }) => (
  <div className="flex flex-col items-center gap-6">
    <h2 className="text-2xl font-bold text-[#7e511d]">Choose corner size</h2>
    <div className="flex flex-row gap-5">
      {availableCorners.map((shape) => (
        <button
          key={`${shape.rows}x${shape.cols}`}
          className="px-7 py-3 rounded text-xl font-semibold
            bg-gradient-to-br from-[#ffeec8] via-[#A46D41]/60 to-[#ebceb0]
            text-[#7e511d] shadow hover:scale-105 transition cursor-pointer
            border-1 border-[#e7ceaa] focus:ring-2 focus:ring-[#c5934f]"
          disabled={disabled}
          style={{ opacity: disabled ? 0.7 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
          onClick={() => onSelect(shape)}
        >
          {cornerShapeLabel(shape)}
        </button>
      ))}
    </div>
  </div>
);
export default CornerConfig;