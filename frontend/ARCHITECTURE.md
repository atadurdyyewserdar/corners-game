# Architecture Decision Record (ADR)

## Context
The Corners Game codebase needed a comprehensive refactoring to follow clean code principles and industry best practices.

---

## Decision 1: Domain-Driven Design Architecture

### Status
**ACCEPTED**

### Context
The original code mixed business logic with React components, making it difficult to test and maintain.

### Decision
Implement a layered architecture with clear separation:
- **Domain Layer** - Pure TypeScript, no React dependencies
- **Application Layer** - React hooks for state management  
- **Presentation Layer** - React components for UI

### Consequences

**Positive:**
- Business logic is framework-agnostic
- Easy to write unit tests for pure functions
- Clear boundaries between layers
- Can potentially reuse domain logic in other contexts (mobile app, backend validation)

**Negative:**
- More files and folders to navigate
- Initial learning curve for developers unfamiliar with DDD

**Neutral:**
- Requires discipline to maintain boundaries

---

## Decision 2: UseReducer for Complex State

### Status
**ACCEPTED**

### Context
GameBoard component had 12+ useState calls, making state management difficult to reason about.

### Decision
Use `useReducer` pattern in `useGameState` hook with action-based state updates.

### Consequences

**Positive:**
- Predictable state transitions
- Centralized state logic
- Easy to add new actions
- Better for complex state interdependencies
- Easier to debug (action history)

**Negative:**
- More boilerplate than useState
- Requires understanding of reducer pattern

---

## Decision 3: Constants Over Magic Numbers

### Status
**ACCEPTED**

### Context
Hardcoded values were scattered throughout the codebase (colors, dimensions, timings).

### Decision
Create centralized constant files with semantic names using TypeScript's `as const`.

### Consequences

**Positive:**
- Single source of truth
- Easy to change theme/dimensions
- Better IntelliSense support
- Type-safe constants
- Self-documenting code

**Negative:**
- One more place to look for values

---

## Decision 4: Pure Functions for Game Logic

### Status
**ACCEPTED**

### Context
Game logic was embedded in React components with setState calls, making it untestable.

### Decision
Extract all game logic into pure functions in domain/utils.

### Consequences

**Positive:**
- Highly testable (no mocking required)
- Reusable across components
- Easy to reason about (no side effects)
- Can run logic without React
- Enables property-based testing

**Negative:**
- Requires careful management of immutability

---

## Decision 5: Component Decomposition Strategy

### Status
**ACCEPTED**

### Context
Single 679-line component was doing everything.

### Decision
Split into specialized components following Single Responsibility Principle:
- Container component (GameBoard) - orchestration
- Presentational components (Board, Controls, etc.) - UI only

### Consequences

**Positive:**
- Easier to understand each component
- Better reusability
- Simpler testing
- Faster development of new features
- Better code review process

**Negative:**
- More files to manage
- Need to pass props between components

---

## Decision 6: Custom Hooks for Logic Reuse

### Status
**ACCEPTED**

### Context
Component logic needed to be extracted but remain React-aware.

### Decision
Create custom hooks for timer, animation, and state management.

### Consequences

**Positive:**
- Reusable React logic
- Cleaner component code
- Easy to test hooks independently
- Follows React best practices

**Negative:**
- Requires understanding of hooks rules
- Can be overused if not careful

---

## Decision 7: Vitest for Testing

### Status
**ACCEPTED**

### Context
No testing framework was configured.

### Decision
Use Vitest (modern, fast, Vite-native alternative to Jest).

### Consequences

**Positive:**
- Fast test execution
- Native ESM support
- Seamless Vite integration
- Modern API (compatible with Jest)
- Good developer experience

**Negative:**
- Less mature than Jest
- Smaller ecosystem

---

## Decision 8: TypeScript Strict Mode

### Status
**ACCEPTED**

### Context
Type safety needed improvement.

### Decision
Use strong typing with branded types, readonly properties, and strict null checks.

### Consequences

**Positive:**
- Catch errors at compile time
- Better IDE support
- Self-documenting code
- Prevents common bugs

**Negative:**
- More verbose type definitions
- Longer development time initially

---

## Decision 9: Error Handling with Custom Error Class

### Status
**ACCEPTED**

### Context
No error handling existed, making bugs harder to track.

### Decision
Create `GameError` class and validate all inputs at boundaries.

### Consequences

**Positive:**
- Clear error messages
- Fail-fast approach
- Easier debugging
- Prevents invalid states

**Negative:**
- More code to write
- Performance overhead (minimal)

---

## Decision 10: No Global State Management Library

### Status
**ACCEPTED**

### Context
Considered Redux, Zustand, or Jotai for state management.

### Decision
Use React's built-in useReducer and Context (if needed in future).

### Consequences

**Positive:**
- No external dependencies
- Simpler setup
- Adequate for current complexity
- Better performance (no subscriptions)

**Negative:**
- May need refactor if state grows significantly
- No dev tools integration

---

## Future Considerations

### Potential Changes
1. **Add React Context** - If components deep in tree need global state
2. **Implement Undo/Redo** - Stack-based history navigation
3. **Add Persistence** - LocalStorage for game state
4. **Multiplayer** - WebSocket integration
5. **AI Opponent** - Minimax algorithm for single-player mode

### Technical Debt
- Consider adding integration tests
- Add E2E tests with Playwright
- Implement accessibility improvements
- Add error boundary components
- Consider React Suspense for async operations

---

## References

- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Domain-Driven Design by Eric Evans](https://www.amazon.com/Domain-Driven-Design-Tackling-Complexity-Software/dp/0321125215)
- [React Documentation - Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
