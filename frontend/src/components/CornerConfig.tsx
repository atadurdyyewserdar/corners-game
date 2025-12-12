import React from "react";
import { CORNER_SHAPES, type CornerShape } from "../constants/gameConfig";
import { COLORS } from "../constants/theme";

export { type CornerShape } from "../constants/gameConfig";

export function cornerShapeLabel({ rows, cols }: CornerShape): string {
  return `${rows}x${cols}`;
}

interface CornerConfigProps {
  onSelect: (shape: CornerShape) => void;
  disabled?: boolean;
}

const CornerConfig: React.FC<CornerConfigProps> = ({ onSelect, disabled }) => {
  const [selected, setSelected] = React.useState<CornerShape | null>(null);

  const handleSelect = (shape: CornerShape) => {
    setSelected(shape);
    onSelect(shape);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-2xl font-bold">Choose corner size</h2>
      <div className="flex flex-row gap-5">
        {CORNER_SHAPES.map((shape) => {
          const isSelected = selected?.rows === shape.rows && selected?.cols === shape.cols;
          return (
            <button
              key={`${shape.rows}x${shape.cols}`}
              className={`px-7 py-3 rounded text-xl font-semibold shadow hover:scale-105 transition cursor-pointer border-2 focus:ring-2 ${
                isSelected ? 'bg-blue-500 text-white border-blue-700 scale-105' : ''
              }`}
              style={{
                color: isSelected ? 'white' : COLORS.ui.text.primary,
                borderColor: isSelected ? COLORS.ui.border.primary : COLORS.ui.border.tertiary,
                opacity: disabled ? 0.7 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
              disabled={disabled}
              onClick={() => handleSelect(shape)}
            >
              {cornerShapeLabel(shape)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CornerConfig;