---
description: Analyze codebase and create concise AGENTS.md files for AI assistants
---

# Task
[cite_start]Analyze this codebase and create/update AGENTS.md files to enable immediate productivity for AI assistants[cite: 1, 2].

# Critical Discovery Phase
1. [cite_start]**Check Existing Rules**: You must first read any existing `AGENTS.md`, `.cursorrules`, `CLAUDE.md`, or `.roorules` in the project root[cite: 8, 21].
2. **Check Mode-Specific Rules**: Check for existing files at these exact paths relative to the project root:
   - [cite_start]`.roo/rules-code/AGENTS.md` [cite: 6, 27]
   - [cite_start]`.roo/rules-debug/AGENTS.md` [cite: 6, 27]
   - [cite_start]`.roo/rules-ask/AGENTS.md` [cite: 6, 27]
   - [cite_start]`.roo/rules-architect/AGENTS.md` [cite: 6, 28]

# Content Guidelines (The Non-Obvious Principle)
- [cite_start]**Delete Obvious Info**: Aggressively remove standard practices, framework defaults (e.g., "React uses JSX"), or anything derivable from file names[cite: 7, 11, 20].
- [cite_start]**Keep Non-Obvious Discoveries**: Only include project-specific utilities, non-standard patterns, or hidden dependencies discovered by reading the code (e.g., custom `safeWriteJson` utilities)[cite: 3, 30, 35].
- **Conciseness**: Aim for approximately 20 lines. [cite_start]The goal is to make the files shorter and more valuable than before[cite: 4, 11, 16].

# Output Structure
1. [cite_start]**Main AGENTS.md**: Header must be "# AGENTS.md\n\nThis file provides guidance to agents..."[cite: 19].
2. [cite_start]**Mode-Specific Files**: Create or improve the files in `.roo/rules-*/` within the project root[cite: 23, 24].

# Instructions for the Assistant
- [cite_start]Use `list_files` and `read_file` immediately to begin the discovery phase.
- [cite_start]If `update_todo_list` is available, create a list covering stack identification, command extraction, and pattern analysis[cite: 5, 9, 12, 17].
- [cite_start]Signal completion using `attempt_completion` only after the files are updated[cite: 11, 36, 37].