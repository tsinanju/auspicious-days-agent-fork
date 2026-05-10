# Environment Examples

This directory contains template files that serve as starting points for common configuration needs in the **Auspicious Days** mod project. These files are architected to ensure a reproducible system state on **Arch Linux** (WSL and bare-metal) and provide high-density context for the **Roo-Code** orchestration agent.^1^

## File Descriptions

### afnm-workshop.example.json {#afnm-workshop.example.json}

- **Purpose:** Template for Steam Workshop metadata (Ascend From Nine Mountains framework).

- **Usage:** Copy to project root and replace placeholder values.

- **Key fields:**

  - workshopId: Your unique Steam Workshop ID.

  - title: Mod display name.

  - tags: Categorization for the AFNM modding framework.

  - visibility: Set to public for release.

### DESCRIPTION.example.md {#description.example.md}

- **Purpose:** Canonical source for mod documentation; converts to Steam Workshop BBCode.

- **Usage:** Customize with feature lists and technical requirements.

- **Note:** This file is the primary source for the agent when generating external-facing documentation.^3^

### MCP.example.json {#mcp.example.json}

- **Purpose:** Configuration for the Model Context Protocol (MCP) used by the Roo-Code agent.

- **Usage:** Rename to .vscode/mcp.json or .mcp.json to enable agentic tool access.^8^

- **Key sections:**

  - sonarqube: Configures the mcp/sonarqube Docker container for agentic analysis.^7^

  - sentry: Registers the @sentry/mcp-server for autonomous debugging.^11^

### sonar-project.example.properties {#sonar-project.example.properties}

- **Purpose:** Template for SonarQube static analysis and quality gate enforcement.^7^

- **Usage:** Define your sonar.projectKey and sonar.sources to enable the self-healing loop.

- **Important properties:**

  - sonar.javascript.environments: Configured for React/TypeScript.

  - sonar.scm.provider: Set to git for Arch-native repository tracking.^12^

### vscode.settings.example.json {#vscode.settings.example.json}

- **Purpose:** Recommended VSCode settings for the elite Arch development environment.

- **Usage:** Merge into .vscode/settings.json to synchronize editor behavior with agent capabilities.^13^

- **Key settings:**

  - roo-code.searchScoreThreshold: Set to 0.4 for optimal Qdrant RAG retrieval.

  - typescript.tsdk: Points to the Arch-native Node.js toolchain.

  - editor.codeActionsOnSave: Automatically triggers ESLint and Prettier for \"The Arch Way\" code correctness.^1^

## Customization Instructions

1.  **Initialize Configs:** Copy the required .example files to your project root, removing the .example suffix.

2.  **Arch Dependency Check:** Ensure base-devel, pnpm, and jq are installed via pacman before running validation scripts.^4^

3.  **Variable Injection:** Replace all placeholder values (marked with \[ \]). For sensitive tokens (e.g., SONAR_TOKEN), use a .env file instead of hardcoding into JSON.^6^

4.  **Agent Verification:** Point Roo-Code to the new MCP.json and run the analyze_codebase tool to verify the context map is active.^3^

*For comprehensive system orchestration details, refer to the main documentation in* .stack-readme/STACK-SETUP.

#### Works cited

1.  The Arch Way - Design Principles, accessed on May 9, 2026, [[https://principles.design/examples/the-arch-way]{.underline}](https://principles.design/examples/the-arch-way)

2.  Install Arch Linux on WSL - ArchWiki, accessed on May 9, 2026, [[https://wiki.archlinux.org/title/Install_Arch_Linux_on_WSL]{.underline}](https://wiki.archlinux.org/title/Install_Arch_Linux_on_WSL)

3.  Context Mentions \| Roo Code Documentation, accessed on May 9, 2026, [[https://docs.roocode.com/basic-usage/context-mentions]{.underline}](https://docs.roocode.com/basic-usage/context-mentions)

4.  Meta package and package group - ArchWiki, accessed on May 9, 2026, [[https://wiki.archlinux.org/title/Meta_package_and_package_group]{.underline}](https://wiki.archlinux.org/title/Meta_package_and_package_group)

5.  Install AUR packages with pacman, accessed on May 9, 2026, [[https://gewhere.github.io/install-aur-with-pacman]{.underline}](https://gewhere.github.io/install-aur-with-pacman)

6.  Agentic Analysis \| SonarQube Cloud - Sonar Documentation, accessed on May 9, 2026, [[https://docs.sonarsource.com/sonarqube-cloud/analyzing-source-code/agentic-analysis]{.underline}](https://docs.sonarsource.com/sonarqube-cloud/analyzing-source-code/agentic-analysis)

7.  SonarQube Agentic Analysis in VS Code with GitHub Copilot \| Sonar, accessed on May 9, 2026, [[https://www.sonarsource.com/resources/library/sonarqube-agentic-analysis-in-vs-code-with-github-copilot/]{.underline}](https://www.sonarsource.com/resources/library/sonarqube-agentic-analysis-in-vs-code-with-github-copilot/)

8.  Roo Code Marketplace \| Roo Code Documentation, accessed on May 9, 2026, [[https://docs.roocode.com/features/marketplace]{.underline}](https://docs.roocode.com/features/marketplace)

9.  SonarQube Agentic Analysis using Claude Code \| Sonar, accessed on May 9, 2026, [[https://www.sonarsource.com/resources/library/get-started-with-sonarqube-agentic-analysis-using-claude-code/]{.underline}](https://www.sonarsource.com/resources/library/get-started-with-sonarqube-agentic-analysis-using-claude-code/)

10. SonarSource/sonarqube-mcp-server - GitHub, accessed on May 9, 2026, [[https://github.com/SonarSource/sonarqube-mcp-server]{.underline}](https://github.com/SonarSource/sonarqube-mcp-server)

11. Automated Error Analysis with Sentry MCP - Continue Docs, accessed on May 9, 2026, [[https://docs.continue.dev/guides/sentry-mcp-error-monitoring]{.underline}](https://docs.continue.dev/guides/sentry-mcp-error-monitoring)

12. Tools \| SonarQube MCP server - Sonar Documentation, accessed on May 9, 2026, [[https://docs.sonarsource.com/sonarqube-mcp-server/using/tools]{.underline}](https://docs.sonarsource.com/sonarqube-mcp-server/using/tools)

13. Roo Code: A Guide With 7 Practical Examples - DataCamp, accessed on May 9, 2026, [[https://www.datacamp.com/tutorial/roo-code]{.underline}](https://www.datacamp.com/tutorial/roo-code)

14. React Best Practices -- Tips for Writing Better React Code - freeCodeCamp, accessed on May 9, 2026, [[https://www.freecodecamp.org/news/best-practices-for-react/]{.underline}](https://www.freecodecamp.org/news/best-practices-for-react/)
