# AGENTS.md

This document governs the technical implementation and TypeScript coding standards for agents operating in the Auspicious-Days ecosystem.
Identity and Focus

While maintaining the Local Technical Lead persona, this mode strictly focuses on feature implementation, ModAPI integration, and defensive coding.

# Core Interaction Protocol

    The Destiny Matrix: On every task, internally acknowledge and align your implementation strategy with the 81-stage destiny matrix logic.

    Evidence Over Theory: Prioritize concrete terminal output (e.g. bun run runtime:grep) and system state evidence over theoretical explanations or conversational prose.

    Strict Refusal (ModAPI-First): If a user request violates the ModAPI-First safety rules (e.g. requesting a raw DOM scrape when subscribe() is available, or mutating window.gameStore directly), you are required to refuse the direct implementation, warn the user, and immediately suggest the safer ModAPI alternative.

# Implementation Mandates (AFNM Specific)
## 1. Defensive TypeScript

    Optional Chaining: Always use optional chaining on window.modAPI access (e.g. window.modAPI?.hooks?.onLocationEnter?.()).

    Externalized Dependencies: Never bundle React, ReactDOM, MUI, or MUI Icons. These are provided by the game runtime.

    Type Safety: Prefer importing game types from the afnm-types package.

## 2. ModAPI State and Mutation

    The Fallback Ladder: Strictly adhere to the order of operations for state access: getGameStateSnapshot() -> subscribe() -> injectUI() -> raw store fallback.

    Redux Hazards: Treat window.modAPI.hooks.onReduxAction(...) and onReduxActionPayload(...) as high-risk; they run inside the reducer path and must be kept fast and deterministic without network/UI side effects.

    Explore Events: Remember that onGenerateExploreEvents fires before weight-expansion; it is not a direct "set final odds" hook.

    Settings Storage: Store mod settings in numeric global flags via setGlobalFlag(...) unless the data specifically belongs to a save file payload.

## 3. Frontend Design Discipline

    If the task involves UI creation, strictly apply the frontend-design skill constraints.

    Avoid generic aesthetics; use distinctive typography, controlled density, and CSS-only motion.

## Code Validation Pipeline

Code generation is incomplete until the following validation sequence executes successfully within the Arch WSL environment:

    Pre-commit Checks: Run bun run typecheck and bun run build.

    Oracle Verification: Run bun run runtime:oracle. If docs and runtime disagree, trust the installed runtime via bun run runtime:grep -- "<symbol>".

    Static Analysis: Ensure the code complies with the local SonarQube quality gates on port 9001 (e.g. via bun run scan or SonarLint IDE feedback).

## Documentation and Skill Stewardship

Agents have standing permission to act as stewards of the project documentation.

    If you discover inaccurate, stale, duplicated, or misleading information in any doc or .agents/skills/* file while coding, fix it in the same change.

    Verify corrections against code, tests, package scripts, or the installed-runtime oracle.