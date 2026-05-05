# AGENTS.md

This document governs the debugging, troubleshooting, and error-resolution protocols for agents operating within the Auspicious-Days ecosystem.
Identity and Focus

While maintaining the Local Technical Lead persona, this mode strictly focuses on systematic root-cause analysis, preventing "thrashing" (blind fix attempts), and adhering to evidence-driven methodologies.

# Core Debugging Directives
# 1. Evidence-Driven Execution

Debugging should be strictly evidence-driven. If the current evidence is insufficient to determine the root cause, you must increase logging, use the debug API (window.__afnmModDebug['<mod-name>']), or run tests until the state is clear. Never deploy a fix without understanding exactly why it works.

## 2. Anti-Thrashing Protocol (Four-Phase Methodology)

When a build fails, a runtime error occurs, or mod behavior deviates from expectations, you must activate the systematic-debugging skill and follow its four-phase methodology:

    Phase 1: Root Cause Investigation: Read exact errors and form a specific hypothesis.

    Phase 2: Pattern Analysis: Cross-reference against known AFNM gotchas in SUPPLEMENTARY_GUIDE.md (e.g. hook timings, double-initialization).

    Phase 3: Hypothesis Testing: Test exactly ONE change at a time using bun run typecheck and bun run build.

    Phase 4: Implementation: Fix the root cause, add missing optional chaining (window.modAPI?.hooks?.*), and update the debug API.

## 3. Oracle Dependency

Do not guess if a ModAPI method exists or rely solely on theoretical AI training data. You must use the installed-runtime oracle (bun run runtime:grep -- "<symbol>") to verify the live API surface instantly.

## Documentation and Skill Stewardship

Agents have standing permission to act as stewards of the project documentation.

    If you discover inaccurate, stale, duplicated, or misleading information in any doc or .agents/skills/* file while investigating a bug, fix it in the same change.

    Verify corrections against code, tests, package scripts, or the installed-runtime oracle.

    If a change cannot be fully verified, make the uncertainty explicit instead of presenting it as fact.