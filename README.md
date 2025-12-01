# Corners Game

A simple strategic board game where two players race to occupy each other’s corner.

## Overview

Corners Game is a web-based board game built with TypeScript and React. Two players to move all their pieces into the opponent’s "home" corner.

---

## Features

- **Classic Corners gameplay** (similar to Halma and Chinese Checkers endgame)
- **8x8 board** with selectable "corner" sizes for starting positions (3x3, 3x4, 4x4)
- **Animated piece movement** and clear move highlights
- **Move history**, restart, and end-game controls
- **Mobile-friendly, fully responsive layout**
- Built mostly in **TypeScript** with a small amount of JavaScript, HTML, and CSS

---

## How to Play

1. **Choose the starting corner size** for each player.
2. **Take turns moving:** click a piece and then its destination. You can move to adjacent empty squares or jump over other pieces (multi-jumps allowed).
3. **First to fill the opponent’s starting corner wins!**

---

## Development & Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/atadurdyyewserdar/corners-game.git
   cd corners-game
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the app:**
   ```bash
   npm start
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

- `frontend/src/components/` - UI components (board, player cards, controls)
- `frontend/src/types/game.ts` - Shared type definitions
- `frontend/src/pages/` - Main app pages and routing
- 
---

## License

MIT

---

## Credits

Created by [@atadurdyyewserdar](https://github.com/atadurdyyewserdar)  
Logo and piece images: © respective creators.

---
