# Repository Guidelines

This template is the default starting point for new *Ascend From Nine Mountains* mods. Keep it lean, ModAPI-first, and easy for later agents to extend.

## Read Order

1. This file — project layout, commands, rules
2. `SUPPLEMENTARY_GUIDE.md` — deep patterns and pitfalls from shipping real mods
3. `docs/reference/MODAPI_QUICK_REFERENCE.md` — compact cheat sheet of every hook, action, and util
4. `docs/reference/AFNM_MODDING.md` — practical reference: upstream sources, fallback ladder, game code patterns
5. `.agents/skills/` — workflow-specific skills (runtime oracle, debugging, validation, publishing, etc.)

## Documentation And Skill Stewardship

If you discover inaccurate, stale, duplicated, or misleading information in any doc or `.agents/skills/*` file while working, fix it in the same change. Agents have standing permission to edit, correct, prune, or improve docs and skills so future agents do not inherit known traps. Verify corrections against code, tests, package scripts, or the installed-runtime oracle; if something cannot be fully verified, make the uncertainty explicit instead of presenting it as fact. Keep updates concise and run the relevant docs/validation checks after changing docs or skills.

## Project Layout

- `src/modContent/index.ts` is the real runtime entrypoint.
- `src/mod.ts` is the AFNM mod-loader bootstrap and metadata export.
- `src/global.d.ts` is the shared typing boundary for `window.modAPI`, runtime React, and the template debug registry.
- `scripts/mod-package.js` is the single metadata source of truth for build/package scripts.
- `scripts/copy-translations.js` copies locale JSON files from `translations/` into `dist/<package-name>/translations/` after extraction/build, excluding the generated `template.json`.
- `scripts/zip-dist.js` packages `dist/<package-name>/` into `builds/<package-name>.zip`.
- `scripts/workshop-upload.ts` publishes through the sibling `../ModUploader-AFNM` repo.
- `scripts/installed-game-runtime.js` is the installed-runtime oracle; use it before assuming current AFNM behavior.
- `docs/reference/MODAPI_QUICK_REFERENCE.md` is the compact ModAPI cheat sheet.
- `docs/reference/AFNM_MODDING.md` is the practical modding reference with upstream links and game code patterns.
- `SUPPLEMENTARY_GUIDE.md` contains the non-obvious patterns and pitfalls learned from CraftBuddy, Lucky All Around, and ElderGPT Spirit Ring.

## Commands

- `bun install`
- `bun run extract-translations`
- `bun run typecheck`
- `bun run build`
- `bun run release:validate` — typecheck + build + runtime:oracle in one step
- `bun run runtime:oracle`
- `bun run runtime:extract`
- `bun run runtime:grep -- "<pattern>"`
- `bun run workshop:upload -- --change-note "vX.Y.Z - ..."`

## Essential Rules

- Always use optional chaining on `window.modAPI` access: `window.modAPI?.hooks?.onLocationEnter?.()`
- React, ReactDOM, MUI, and MUI Icons are externalized (provided by game runtime) — never bundle them
- Import game types from the `afnm-types` package
- Run `bun run typecheck && bun run build` before committing
- Trust the installed runtime over docs: `bun run runtime:grep -- "<symbol>"`
- Follow commit prefixes: `feat:`, `fix:`, `docs:`, `perf:`, `chore:`

## Modding Rules

- Prefer official state access in this order:
  1. `window.modAPI.getGameStateSnapshot()`
  2. `window.modAPI.subscribe()`
  3. `window.modAPI.injectUI()` / `registerOptionsUI()`
  4. raw store or DOM/fiber fallback only for verified gaps
- Store mod settings in numeric global flags unless the data truly belongs to a save file.
- Treat `window.modAPI.hooks.onReduxAction(...)` and `onReduxActionPayload(...)` as high-risk. They run inside the reducer path.
- Treat `window.modAPI.hooks.onGenerateExploreEvents(...)` as pre-weight-expansion. It is not a direct “set final odds” hook.
- Use `fetch()` normally on `0.6.50+`, but keep failures non-fatal.
- Keep game-shape assumptions centralized instead of scattering them across UI and logic modules.

## Validation Workflow

- Default path:
  1. `bun run typecheck`
  2. `bun run build`
  3. `bun run runtime:oracle`
  4. `bun run runtime:grep -- "<symbol-you-care-about>"`
- Use live UI/manual testing only when the installed-runtime oracle is insufficient.
- If you launch the real client directly, create `disable_steam` beside the executable first and delete it when done. Leaving it behind will block Workshop mod loading.
- Prefer the platform's direct executable or native launcher rather than bouncing back through the Steam UI when you only need a smoke test.

## Release Workflow

1. Finish code and docs.
2. Run `bun run release:validate`.
3. Upload to Workshop: `bun run workshop:upload -- --change-note "vX.Y.Z - ..." --allow-create`
4. Commit and push to `main`.
5. Tag with `git tag vX.Y.Z && git push origin vX.Y.Z` to trigger the GitHub Release workflow.

## Available Skills

Skills in `.agents/skills/` provide workflow-specific guidance (auto-discovered by agents following the agentskills.io standard):

**Start here:**
- `afnm-modding/SKILL.md` — master orientation: project layout, fallback ladder, task-to-skill routing

**AFNM-specific:**
- `modapi-lookup/SKILL.md` — hook/action/util reference and classification
- `typescript-afnm/SKILL.md` — TypeScript conventions for AFNM mods
- `frontend-mod-ui/SKILL.md` — mod UI design with game components
- `runtime-oracle/SKILL.md` — verify API surface against the shipped game
- `live-game-testing/SKILL.md` — disable_steam procedure and automated browser testing
- `systematic-debugging/SKILL.md` — four-phase debugging methodology
- `pre-commit-validation/SKILL.md` — evidence before claims
- `workshop-publishing/SKILL.md` — upload and release lifecycle
- `conventional-git/SKILL.md` — commit message and branch naming

**General-purpose:**
- `typescript-best-practices/SKILL.md` — general TypeScript patterns and best practices
- `frontend-design/SKILL.md` — frontend UI design principles
- `agent-browser/SKILL.md` — browser automation CLI via CDP
- `electron/SKILL.md` — Electron app automation via CDP
- `dogfood/SKILL.md` — systematic exploratory QA for web apps

## Template-Specific Notes

- The example options panel in `src/modContent/index.ts` is intentionally small but real. Replace it, do not work around it.
- The template debug surface is `window.__afnmModDebug['<package-name>']`.
- React/MUI dependencies are already present so future agents can add overlay UI without first reshaping the toolchain.
- `bun run build` now runs translation extraction before webpack, then copies locale translation files into the dist output before zipping. The generated `translations/template.json` stays as authoring scaffolding and is not packaged.
- The `.github/workflows/release.yml` builds the mod and creates a GitHub Release when you push a `v*` tag.
