---
name: pre-commit-validation
description: Run verification commands before claiming work is complete. Activate before committing code changes, before claiming a task is done, or before creating a release to ensure type safety and build success.
---

# Skill: Pre-Commit Validation

Run actual verification commands before claiming work is complete. Evidence before claims, always.

## When to activate

- Before committing code changes
- Before claiming a task is done
- Before creating a release
- After implementing any new feature or fix

## Workflow

```bash
# Minimum validation before any commit:
bun run typecheck
bun run build

# Full validation before release or major changes:
bun run release:validate    # runs typecheck + build + runtime:oracle

# If the mod uses hooks, verify they still exist:
bun run runtime:grep -- "<hook-names-you-use>"
```

## Rules

- Never commit code that doesn't typecheck. Run `bun run typecheck` first.
- Never claim "it builds" without running `bun run build` and confirming zero errors.
- Never skip the oracle check before a release. Runtime behavior is the authority.
- If any verification step fails, fix the issue before proceeding. Do not commit with known failures.
- Check `git diff` for secrets, API keys, or sensitive data before committing.
- Follow commit message conventions: `feat:`, `fix:`, `docs:`, `perf:`, `chore:`.
