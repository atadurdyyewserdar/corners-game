import type { CornerShape } from "../constants/gameConfig";

export type { CornerShape } from "../constants/gameConfig";

export function cornerShapeLabel({ rows, cols }: CornerShape): string {
  return `${rows}x${cols}`;
}