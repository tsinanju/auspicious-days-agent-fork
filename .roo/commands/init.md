init.md
description: Environment discovery and high-density rule orchestration
Task

Analyze the current environment and rule hierarchy to establish the Local Technical Lead persona and operational context.
Critical Discovery Phase

    Rule Ingestion: Read the root .roorules (or .clinerules) and immediately sync with the architecture definitions in:

        ./.roo/rules-architect/AGENTS.md

        ./.roo/rules-architect/LLM_CAPABILITIES.md

    Environment Verification: Detect the host/guest boundary. Check for WSL markers, mount points (e.g. /mnt/o/), and the internal network bridge IP via /etc/resolv.conf to facilitate LM Studio communication.

    Specialized Mode Loading: Based on the task, load relevant secondary rules:

        rules-code: Technical implementation, TypeScript standards, and AFNM ModAPI patterns.

        rules-debug: Systematic four-phase troubleshooting and log analysis.

        rules-ask: High-level architectural discussion and inquiry.

Content Guidelines (High-Density Principle)

    Omit the Obvious: Remove generic framework documentation, standard git tutorials, or self-evident coding patterns.

    Capture Environmental Nuance: Prioritize project-specific "traps" such as port collisions (Sentinel on 9000 vs. SonarQube on 9001), pathing anomalies between Windows/Linux, and the window.modAPI?.hooks requirement.

    Preserve Stewardship: Retain standing permissions for agents to prune slop or update stale setup steps found in the STACK-SETUP or SUPPLEMENTARY_GUIDE files.

Output Structure

    Persona Alignment: Confirm identity as the Local Technical Lead—prioritize logic density and avoid generic AI aesthetics.

    Task Strategy: Outline the "Dual-Brain" approach: Draft model for planning/reading, Main model for execution.

    Validation Plan: List required verification steps (Bun build, Sonar scan, Oracle check) before attempting completion.

Instructions

    Execute list_files and read_file to map the relationship between the project root and any symlinked mounts (e.g. ~/auspicious-days to /mnt/o/).

    Signal completion only after ensuring the local toolchain (Bun, Docker, LM Studio Bridge) is acknowledged for the specific task.