---
name: afnm-modding
description: Master orientation skill for Ascend From Nine Mountains mod development. Activate on any AFNM modding task to get project layout, toolchain, ModAPI-first philosophy, the fallback ladder, and routing to the correct specialized skill. This is the entry-point skill — load it first when starting mod work.
---

# AFNM Modding — Orientation

This skill orients agents to the project structure, conventions, and specialized skills for building Ascend From Nine Mountains mods. Load this skill first when starting any AFNM modding task; it routes to the correct specialized skill for the job.

## When to Activate

- Starting any AFNM mod development task
- Unfamiliar with this project's layout or conventions
- Unsure which specialized skill applies to the current task
- Beginning a new mod feature or reviewing existing mod code

## Core Concepts

### ModAPI-First Philosophy

All game state access must follow this preference order (the "fallback ladder"):

1. `window.modAPI.getGameStateSnapshot()` — safe, stable, read-only
2. `window.modAPI.subscribe()` — reactive state observation
3. `window.modAPI.injectUI()` / `registerOptionsUI()` — UI integration
4. Raw Redux store (`window.modAPI` internals) — only for verified API gaps
5. DOM / React Fiber scraping — absolute last resort, fragile across updates

Never skip tiers. If tier 1-3 can do the job, do not reach for tier 4-5. Always verify gaps with the runtime oracle before dropping to a lower tier.

### Project Layout

| Path | Purpose |
|------|---------|
| `src/modContent/index.ts` | Runtime entrypoint — mod logic starts here |
| `src/mod.ts` | Mod-loader bootstrap and metadata export |
| `src/global.d.ts` | Type boundary for `window.modAPI`, React, debug registry |
| `scripts/mod-package.js` | Single metadata source of truth |
| `docs/reference/MODAPI_QUICK_REFERENCE.md` | Every hook, action, and util catalogued |
| `docs/reference/AFNM_MODDING.md` | Upstream sources, fallback ladder, runtime patterns |
| `SUPPLEMENTARY_GUIDE.md` | Hard-won pitfalls from shipping real mods |

### Toolchain

- **Package manager**: `bun` (not npm/yarn)
- **Build**: `bun run build` (runs translation extraction → webpack → copy translations → zip)
- **Typecheck**: `bun run typecheck`
- **Validate**: `bun run release:validate` (typecheck + build + runtime oracle)
- **Runtime oracle**: `bun run runtime:oracle` / `bun run runtime:grep -- "<pattern>"`

## Practical Guidance

### Read Order for New Tasks

1. `AGENTS.md` — project layout, commands, rules
2. `SUPPLEMENTARY_GUIDE.md` — deep patterns and pitfalls
3. `docs/reference/MODAPI_QUICK_REFERENCE.md` — hook/action/util cheat sheet
4. `docs/reference/AFNM_MODDING.md` — upstream sources, fallback ladder, runtime facts

### Task-to-Skill Routing

| Task | Skill to load |
|------|--------------|
| Writing or using ModAPI hooks, actions, utilities | `modapi-lookup` |
| TypeScript code, types, interfaces | `typescript-afnm` |
| General TypeScript patterns and best practices | `typescript-best-practices` |
| Mod settings panels, custom screens, injected UI | `frontend-mod-ui` |
| Generic frontend/web UI design | `frontend-design` |
| Build errors, typecheck failures, runtime bugs | `systematic-debugging` |
| Verifying ModAPI surface against installed game | `runtime-oracle` |
| Testing mod in the actual game client | `live-game-testing` |
| Browser automation (generic or game Electron) | `agent-browser` |
| Automating Electron desktop apps via CDP | `electron` |
| Pre-commit / pre-release validation | `pre-commit-validation` |
| Steam Workshop publishing | `workshop-publishing` |
| Commit messages, branch naming, tags | `conventional-git` |
| Exploratory QA / bug hunting for web apps | `dogfood` |

## Documentation And Skill Stewardship

Docs and skills are editable working assets. If this skill, another skill, or any project doc is wrong, stale, duplicated, or unclear, correct it as soon as you notice it instead of deferring it to a later agent. Verify against the installed runtime, code, tests, or package scripts; keep skill bodies concise and move long details to references when needed.

## Gotchas

1. **`onReduxAction` and `onReduxActionPayload` run inside the reducer path.** Side effects, async calls, or broad state mutation in these hooks can corrupt game state or cause desyncs. Use them only for narrow, deterministic interception; prefer `subscribe()` for observation.

2. **`onGenerateExploreEvents` is pre-weight-expansion.** It fires before the game expands weighted pools into the final event list. Modifying odds here does not directly set final probabilities — it adjusts inputs to the expansion algorithm.

3. **Numeric global flags only for settings.** Store mod settings in numeric global flags (`modAPI.setGlobalFlag`). Do not use string flags, localStorage, or save-file data for configuration that should persist across saves.

4. **`fetch()` works on 0.6.50+ but must be non-fatal.** Network calls can fail in offline/restricted environments. Always wrap in try/catch and degrade gracefully.

5. **`disable_steam` blocks Workshop mod loading if left behind.** When testing with the game client directly, always create `disable_steam` before launch and delete it when done. Forgetting to delete it will silently break mod loading for all users.

6. **Game-shape assumptions drift across updates.** Centralize any assumptions about game data structures (Redux state shape, component hierarchy, event formats) in one place rather than scattering them across UI and logic modules. Verify with the runtime oracle after game updates.

7. **This repo IS the mod template.** Do not create separate template directories or scaffold new project structures. The template is the working directory itself — modify it directly.

8. **`bun`, not `npm`.** All commands use `bun`. Using `npm` will create lockfile conflicts and may pull different dependency versions.

## Integration

- `modapi-lookup` — Routes to the ModAPI quick reference for hook/action specifics
- `typescript-afnm` — AFNM-specific TypeScript conventions (optional chaining on modAPI, webpack externals, numeric flags)
- `typescript-best-practices` — General TypeScript guidance that complements `typescript-afnm`
- `frontend-mod-ui` — AFNM game UI components (GameDialog, GameButton, etc.)
- `frontend-design` — Generic frontend design principles for non-game UI
- `systematic-debugging` — Four-phase debugging methodology; cross-references SUPPLEMENTARY_GUIDE.md sections 3 and 7
- `runtime-oracle` — Verify ModAPI surface before using unverified hooks
- `live-game-testing` — Full client testing workflow including automated browser testing
- `pre-commit-validation` — Validation pipeline before commits and releases
- `workshop-publishing` — Steam Workshop upload and release lifecycle
- `conventional-git` — Commit message and branch naming conventions

## References

- `AGENTS.md` — Project layout, commands, modding rules, validation and release workflows
- `SUPPLEMENTARY_GUIDE.md` — 12 sections of hard-won patterns and pitfalls from shipping CraftBuddy, Lucky All Around, and ElderGPT Spirit Ring
- `docs/reference/MODAPI_QUICK_REFERENCE.md` — Compact cheat sheet of every ModAPI method
- `docs/reference/AFNM_MODDING.md` — Upstream sources, fallback ladder, known API gaps, key runtime facts
