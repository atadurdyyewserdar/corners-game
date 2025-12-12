/**
 * Centralized theme constants for colors and visual styling
 */

export const COLORS = {
  board: {
    dark: '#A46D41',
    light: '#F7E0AC',
    gradient: {
      from: '#fff7eb',
      to: '#f7e0ac',
    },
  },
  player: {
    A: {
      primary: '#6b4c29',
      secondary: '#84623a',
      piece: '/piece_black.png',
      shadow: '#55380a8c',
    },
    B: {
      primary: '#b91c1c',
      secondary: '#a00',
      piece: '/piece_red.png',
      shadow: '#a63f2470',
    },
  },
  highlight: {
    selected: '#facc15',
    validMove: '#14c8ea',
    lastMoveFrom: '#818cf8',
    lastMoveTo: '#6366f1',
    activeBorder: '#09a532ff',
  },
  ui: {
    text: {
      primary: '#7e511d',
      secondary: '#a46d41',
      tertiary: '#ad905b',
    },
    background: {
      primary: '#ffffff',
      secondary: '#f3e1c0',
      tertiary: '#ffe4c7',
    },
    border: {
      primary: '#cab38b',
      secondary: '#ca9b69',
      tertiary: '#e7ceaa',
      active: '#c5934f',
    },
    button: {
      restart: {
        bg: '#f3e1c0',
        hover: '#e5d3ba',
        border: '#ca9b69',
      },
      end: {
        bg: '#ffe4c7',
        hover: '#fadfb5',
        border: '#ca9b69',
      },
    },
    history: {
      bg: '#eee3bc',
      border: '#e4d39f',
      hover: '#f7e0ac',
      from: 'rgba(70,123,233,0.18)',
      to: 'rgba(251,201,53,0.17)',
    },
    timer: {
      bg: '#72522e',
      text: '#ffffff',
    },
    winner: {
      gradient: {
        from: '#f7e0ac',
        to: '#a46d41',
      },
      border: '#d7ad81',
    },
  },
} as const;

export const SHADOWS = {
  cell: '0 2px 15px #52391d11',
  piece: {
    A: 'drop-shadow(0 2px 10px #55380a8c)',
    B: 'drop-shadow(0 2px 12px #a63f2470)',
  },
  timer: '0 1px 4px #3331',
  button: '0 0 8px 2px #dcfaee22',
  winner: {
    A: '0 2px 7px #fff9',
    B: '0 2px 7px #fdcfcc',
  },
} as const;

export const GRADIENTS = {
  validMove: 'radial-gradient(circle at 55% 60%, #28e0ff99 0%, #f7e0ac33 100%)',
  selected: 'radial-gradient(circle at 45% 40%, #ffe89399 0%, #a46d4133 100%)',
  winner: 'linear-gradient(to bottom right, #f7e0ac, #a46d41)',
} as const;
