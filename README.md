# Corners Game

A modern, professionally architected web-based strategic board game where two players race to occupy each other's corner - now with intelligent AI opponent!

# Demo

https://corners-game-qn4csj0mu-serdars-projects-39bf45aa.vercel.app

## Overview

Corners Game is built with **TypeScript** and **React** following clean code principles and SOLID design patterns. The game features domain-driven design architecture, comprehensive test coverage, production-ready code quality, and an intelligent AI opponent with multiple difficulty levels.

---

## ✨ Features

### Gameplay
- **Classic Corners gameplay** (similar to Halma and Chinese Checkers)
- **🤖 AI Opponent** - Play against computer with 3 difficulty levels
- **Two Game Modes** - Human vs Human or Human vs AI
- **8x8 board** with selectable corner sizes (3x3, 3x4, 4x4)
- **Animated piece movement** with smooth framer-motion animations
- **Move history** with ability to review game after completion
- **Turn timer** to track thinking time
- **Multi-jump support** with automatic path finding
- **AI thinking indicator** with loading animation

### AI Intelligence
- **Three Difficulty Levels:**
  - 😊 Easy - Perfect for beginners (0.5s thinking time)
  - 😐 Medium - Balanced challenge (2s thinking time)
  - 😈 Hard - Expert level opponent (5s thinking time)
- **Advanced Algorithms:**
  - Negamax with alpha-beta pruning
  - Transposition table for position memoization
  - Iterative deepening for time-controlled search
  - Smart move ordering for optimal pruning
- **Strategic Play:**
  - Evaluates goal distance and piece advancement
  - Considers piece mobility and positioning
  - Plans jump chains and blocking moves
  - 50-90% search space reduction with alpha-beta pruning

### Technical Excellence
- ✅ **Clean Architecture** - Domain-driven design with clear separation of concerns
- ✅ **40 Unit Tests** - Comprehensive test coverage with Vitest
- ✅ **Type-Safe** - Full TypeScript with strict mode
- ✅ **Modular Components** - Single responsibility principle
- ✅ **Performance Optimized** - React hooks with proper memoization
- ✅ **AI Implementation** - 1000+ lines of sophisticated game tree search
- ✅ **Well Documented** - Architecture decisions and refactoring notes

---

## 🏗️ Project Structure

```
corners-game/
├── frontend/                    # React + TypeScript application
│   ├── src/
│   │   ├── constants/          # Centralized configuration
│   │   ├── domain/             # Pure business logic
│   │   │   ├── ai/             # AI opponent implementation
│   │   │   ├── models/         # Type definitions
│   │   │   └── utils/          # Game logic functions
│   │   ├── hooks/              # Custom React hooks
│   │   ├── components/         # UI components
│   │   ├── tests/              # Unit tests (40 tests)
│   │   └── pages/              # Route pages
│   ├── ARCHITECTURE.md         # Architecture decisions
│   ├── REFACTORING_SUMMARY.md  # Detailed refactoring guide
│   └── README.md               # Frontend-specific docs
└── README.md                   # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/atadurdyyewserdar/corners-game.git
   cd corners-game
   ```

2. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173)

4. **Run tests:**
   ```bash
   npm test              # Watch mode
   npm test -- --run     # Single run
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🎮 How to Play

### Game Setup
1. **Choose game mode:**
   - **Human vs Human** - Play with a friend on the same device
   - **Human vs AI** - Challenge the computer opponent
2. **Select difficulty** (if playing vs AI):
   - Easy, Medium, or Hard
3. **Choose corner size** for both players (3x3 recommended for quick games)

### Gameplay
1. **Take turns moving:** 
   - Click a piece to select it
   - Click an empty square to move
   - Move to adjacent squares or jump over pieces
   - Chain multiple jumps in one turn
2. **Win condition:** First player to move all pieces into opponent's starting corner wins!

### Playing Against AI
- AI automatically makes moves when it's their turn
- Watch the "🤖 AI is thinking..." indicator
- AI considers strategic positioning and optimal paths
- Higher difficulty = deeper search and stronger play

---

## 📊 Code Quality Metrics

| Metric | Value |
|--------|-------|
| **Total Tests** | 40 (100% passing) |
| **Test Coverage** | ~80% (core logic) |
| **TypeScript** | Strict mode, zero errors |
| **Component Size** | 75% reduction (679 → 170 lines) |
| **Magic Numbers** | 100% eliminated |
| **Build Time** | ~630ms |
| **Bundle Size** | 407KB (130KB gzipped) |
| **AI Code** | 1000+ lines |

---

## 🏛️ Architecture Highlights

### Clean Code Principles
- **Single Responsibility Principle** - Each module has one clear purpose
- **Don't Repeat Yourself** - Shared logic extracted to utilities
- **Separation of Concerns** - Domain, hooks, and UI layers
- **Meaningful Names** - Self-documenting code
- **Small Functions** - Most functions under 30 lines

### Domain-Driven Design
- **Pure business logic** - Framework-agnostic game rules
- **Type-driven development** - Strong TypeScript types throughout
- **Testable architecture** - Pure functions enable easy testing
- **AI as domain logic** - Clean separation of AI algorithms from UI

### Modern React Patterns
- **Custom hooks** - useGameState with useReducer pattern
- **Component composition** - Small, focused components
- **Performance optimization** - useCallback and memoization
- **Async AI execution** - Non-blocking UI during AI computation

### AI Architecture
- **Negamax algorithm** - Efficient minimax variant with score negation
- **Alpha-beta pruning** - Eliminates 50-90% of search tree
- **Transposition table** - Caches evaluated positions (100k entries)
- **Iterative deepening** - Progressive depth search with time limits
- **Move ordering** - Evaluates promising moves first
- **Multi-heuristic evaluation** - 6 different strategic factors

For detailed architecture decisions, see [frontend/ARCHITECTURE.md](frontend/ARCHITECTURE.md)

---

## 🧪 Testing

The project includes comprehensive unit tests covering:
- Board manipulation (16 tests)
- Move validation (9 tests)
- Path finding algorithms (9 tests)
- Win condition detection (6 tests)
- *(AI tests coming in future release)*

```bash
cd frontend
npm test              # Run tests in watch mode
npm test -- --run     # Run once
npm test:coverage     # Generate coverage report
```

---

## 📚 Documentation

- **[ARCHITECTURE.md](frontend/ARCHITECTURE.md)** - Architecture Decision Records (ADR)
- **[REFACTORING_SUMMARY.md](frontend/REFACTORING_SUMMARY.md)** - Complete refactoring guide
- **[Frontend README](frontend/README.md)** - Frontend-specific documentation
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and release notes

---

## 🛠️ Technology Stack

- **Frontend Framework:** React 19
- **Language:** TypeScript 5.9 (strict mode)
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion 12
- **Routing:** TanStack Router 1
- **Testing:** Vitest 4 + Testing Library
- **Build Tool:** Vite 7
- **Package Manager:** npm

---

## 🌳 Git Workflow

This project follows Git Flow methodology:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Feature development branches
- `docs/*` - Documentation branches

### Recent Releases

**v2.1.0 (December 2024)** - AI Opponent Feature
- Added intelligent AI opponent with 3 difficulty levels
- Implemented Negamax with alpha-beta pruning
- Game mode selection (Human vs Human / Human vs AI)
- AI thinking indicator and strategic play

**v2.0.0 (January 2025)** - Clean Code Refactoring
- Complete architectural overhaul
- 40 comprehensive unit tests
- Domain-driven design implementation
- 75% reduction in component complexity

See [CHANGELOG.md](CHANGELOG.md) for detailed release notes.

---

## 📝 Development Guidelines

### Branch Naming
- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/component-name` - Code refactoring
- `docs/documentation-topic` - Documentation updates
- `test/test-description` - Test additions

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New features
- `fix:` - Bug fixes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the MIT License.

---

## 👤 Author

**Serdar Atadurdyyew**

- GitHub: [@atadurdyyewserdar](https://github.com/atadurdyyewserdar)
- Repository: [corners-game](https://github.com/atadurdyyewserdar/corners-game)

---

## 🎯 Project Status

**Status:** ✅ **Production Ready**

The game is fully functional, well-tested, and production-ready with professional-grade architecture and intelligent AI opponent.

---

## 📈 Future Enhancements

Potential features for future releases:
- [ ] AI unit tests and benchmarks
- [ ] Online multiplayer support
- [ ] Advanced AI with opening book
- [ ] Game state persistence
- [ ] Undo/redo functionality
- [ ] Alternative board sizes (10x10, 16x16)
- [ ] Tournament mode
- [ ] Statistics tracking
- [ ] Achievement system
- [ ] AI difficulty customization

---

## 🙏 Acknowledgments

Built with modern web technologies and following industry best practices from:
- Clean Code by Robert C. Martin
- Domain-Driven Design by Eric Evans
- Artificial Intelligence: A Modern Approach by Russell & Norvig
- React Documentation by Meta
- TypeScript Best Practices

AI algorithms inspired by:
- Chess programming techniques
- Game tree search optimization strategies
- Evaluation function design patterns

---

**Made with ❤️ and clean code principles**
