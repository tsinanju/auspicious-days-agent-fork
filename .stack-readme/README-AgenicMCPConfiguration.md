# DevSecOps Agentic MCP Configuration
This repository contains the Model Context Protocol (mcp.json) configuration designed for a highly autonomous, local-first DevSecOps AI Agent. It bridges a local LLM (running via LM Studio / Roo Code) with a strict, airgapped-capable environment operating exclusively within `Arch Linux (WSL)`, alongside Dockerized SonarQube and self-hosted Sentry.

## Prerequisites
To run this MCP suite, the host Arch Linux WSL environment must have the following installed:
> Node.js & npm: Used to dynamically fetch and run the MCP servers (npx).

Arch Linux (WSL): The strict operating environment for the codebase and tools.
 - Docker: Running locally within Arch Linux to host SonarQube and Sentry containers.
 - Local CLIs: Ensure sentry-cli and sonar (or sonar-scanner) are installed within Arch Linux and added to your system's PATH.

## Setup & Installation
Copy the `mcp.example.json` to your local `mcp.json` on LMStudio.

Replace all `<PLACEHOLDER>` tags in mcp.json with your actual Arch Linux paths (e.g. `~/projects/...`), database connection strings, and API keys. Never commit the populated `mcp.json` to version control.

Load the mcp.json into your local inference server (e.g. LM Studio) or agentic IDE extension (e.g. Roo Code).

## Tool Breakdown
This configuration provides the LLM with 10 distinct tools, natively optimized for the Arch Linux environment:

### 1.0 Cognitive & Memory Tools
- Sequential Thinking: (`@modelcontextprotocol/server-sequential-thinking`) Forces the LLM to write out multi-step logic before executing code, preventing hallucination loops.
- Memory Server: (`@modelcontextprotocol/server-memory`) Builds a persistent local knowledge graph of project architecture, lore, and strict TypeScript typing rules (e.g. `afnm-types`).
### 2.0 File & Version Control (Arch Native)
 - WSL Filesystem: (`mcp-server-wsl-filesystem`) Operates strictly within the Arch Linux filesystem, running native Linux file manipulation and grep/find searches directly inside the workspace to ensure maximum I/O performance.
 - Git Server: (`@modelcontextprotocol/server-git`) Reads commit history and generates diffs for tracking codebase evolution natively.
### 3.0 DevSecOps Command Execution
 - Command Suite: (`@modelcontextprotocol/server-command-execution`) The core security bridge. It safely executes local Arch Linux CLIs with injected authentication tokens.
 - Allowed Commands: Restricted strictly to `sonar, sonar-scanner, sentry-cli, curl, wsl, docker, npm, tsc, git`.
 - Container Execution: Allows the AI to use `docker` to execute commands natively inside the Sonar/Sentry containers running on Arch.
### 4.0 Network & Research
 - Fetch Server: (`@modelcontextprotocol/server-fetch`) Makes authenticated REST API calls to local Sentry and Sonar endpoints running on localhost:9000 and localhost:9001.
 - Brave Search & Puppeteer: Scrapes external API documentation and searches the web for obscure compiler errors.
 - GitHub Server: Reads external repository issues and PRs.
### 5.0 Database Interaction
 - Postgres Server: (`@modelcontextprotocol/server-postgres`) Allows the LLM to run native SQL queries against the local SonarQube backend or application databases for deep state debugging.

## Environment Variables & Secrets
The `command-execution-suite` safely isolates your authentication tokens. The LLM does not need to know the raw token string; it relies on the CLIs and curl commands to read them from the Arch Linux environment.

### Update the following keys in your mcp.json:
 - `SONAR_TOKEN`: Your SonarQube User/Project Token.
 - `SENTRY_AUTH_TOKEN`: Your self-hosted Sentry Organization Token (org:ci scope required).
 - `BRAVE_API_KEY`: For external web searches. (if using)
 - `GITHUB_PERSONAL_ACCESS_TOKEN`: For reading external repository issues.

## System Prompting Guidelines
To get the most out of this MCP suite, add the following to your AI Agent's Custom Instructions:

 - Agent Directives:
   - **Strict TypeScript**: Always adhere to the project's [tsconfig-strict.json](./.agents/skills/typescript-best-practices/assets/tsconfig-presets/strict.json) . Use precise types and optional chaining.
   - **Pre-flight Checks**: Before modifying a file, use the Fetch API or Sonar CLI to check for existing issues (`sonar verify --file <path>`)
   - **Crash Reporting**: If analyzing a bug, use `curl` with the `$SENTRY_AUTH_TOKEN` to fetch the latest stack traces from the local Sentry API, or use `sentry-cli` to validate mock payloads.
   - **Complex Logic**: If a TypeScript type intersection is highly complex, invoke the `sequential-thinking` tool before writing code.

---   
Developed by the Auspicious-Days Contributor Circle.
