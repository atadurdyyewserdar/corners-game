/**
 * Centralized dimension and layout constants
 */

export const BOARD = {
  size: 8,
  cellSize: 64,
  pieceSizeRatio: 0.8,
} as const;

export const LAYOUT = {
  sidebarWidth: 230,
  gap: 32,
  borderWidth: 2,
  activeBorderWidth: 2.2,
} as const;

// Computed dimensions
export const COMPUTED = {
  get pieceSize() {
    return BOARD.pieceSizeRatio * BOARD.cellSize;
  },
  get boardDisplayWidth() {
    return BOARD.size * BOARD.cellSize + 16;
  },
  get wrapperWidth() {
    return this.boardDisplayWidth + LAYOUT.sidebarWidth + LAYOUT.gap;
  },
} as const;

export const BORDERS = {
  default: 2,
  active: 2.2,
  outline: 3,
  radius: {
    small: 2,
    medium: 4,
  },
} as const;

export const SPACING = {
  cell: {
    padding: 0,
    margin: 0,
  },
  component: {
    gap: 6,
    padding: {
      small: 2,
      medium: 4,
      large: 8,
    },
  },
} as const;
