# Technical Manual for Autonomous Model Context Protocol Orchestration and Troubleshooting in Arch Linux Environments

The integration of the Model Context Protocol (MCP) within the Roo-Code orchestration framework represents a sophisticated convergence of agentic reasoning and system-level execution. This report serves as a high-density technical specification and troubleshooting manual for systems engineers operating on Arch Linux, utilizing vLLM as an inference backend and VS Code as the primary agentic interface. The objective is to provide an exhaustive resource that serves both human developers for environment stabilization and the Roo-Code agent as a structured context map for autonomous debugging and codebase navigation.

## Architectural Context and the Arch Linux Implementation Strategy

Operating within the Arch Linux ecosystem requires a commitment to \"The Arch Way,\" which emphasizes simplicity, modernization, and a deep understanding of the underlying system state.^1^ For an AI agent like Roo-Code to function effectively as a systems engineer, it must possess a deterministic understanding of the dependency chain and the execution environment. On Arch Linux, this involves precise management of rolling-release packages and isolated development environments to ensure reproducibility across bare-metal and Windows Subsystem for Linux (WSL) deployments.

### System Dependency Specification

The foundational layer of the MCP stack relies on the availability of high-performance runtimes and package managers. Arch Linux provides these via the official repositories and the Arch User Repository (AUR). The following table defines the required system state for a functional Roo-Code/MCP environment.

### Table 1: Arch Linux System Dependency Matrix

| **Package** | **Source** | **Purpose**                                            | **Configuration Requirements**                                |
|-------------|------------|--------------------------------------------------------|---------------------------------------------------------------|
| nodejs      | extra      | Runtime for Roo-Code and MCP servers.                  | Minimum version 18+; LTS recommended.^2^                      |
| python      | core       | Primary language for vLLM and data science MCPs.       | Version 3.11+ required for modern SDK compatibility.^3^       |
| python-uv   | extra      | High-speed Python package and environment manager.     | Preferred for uvx execution of MCP servers.^3^                |
| git         | core       | Required for Roo-Code checkpoints and shadow repos.    | Version 2.40+; crucial for non-destructive state recovery.^4^ |
| docker      | extra      | Containerization for isolated MCP services and Qdrant. | Enable docker.service for persistent vector storage.^5^       |
| pnpm        | extra      | Efficient Node.js package management.                  | Required for building local TypeScript MCP servers.^6^        |

The interaction between the agent and these dependencies is managed through shell integration. On Arch Linux, successful terminal orchestration requires that the VS Code shell integration hooks are correctly injected into the user\'s shell configuration files. For Bash, this necessitates the inclusion of . \"\$(code \--locate-shell-integration-path bash)\" within \~/.bashrc.^7^ Without this, Roo-Code may experience \"command already running\" warnings, indicating that the agent has lost track of the terminal\'s state transition, a common failure point in long-running agentic workflows.

## vLLM Inference Infrastructure and Tool-Calling Optimization

The vLLM inference engine provides the computational backbone for the Roo-Code agent. Unlike cloud-based providers, local hosting on Arch Linux offers significantly reduced latency but introduces complexities regarding the handling of OpenAI-compatible tool-calling protocols.^8^

### Server Configuration for Autonomous Tool Choice

To enable Roo-Code to autonomously select and execute MCP tools, the vLLM server must be launched with specific flags that enable structured output and auto-tool choice. The primary command structure for serving a model like Qwen3-Coder or Llama-3 on Arch Linux involves the following parameters:

Bash

vllm serve Qwen/Qwen3-30B-A3B \\  
\--served-model-name Qwen3-30B-A3B \\  
\--api-key abc-123 \\  
\--enable-auto-tool-choice \\  
\--tool-call-parser hermes \\  
\--trust-remote-code

The \--enable-auto-tool-choice flag is mandatory for allowing the model to generate its own tool calls when it deems appropriate.^10^ Furthermore, the \--tool-call-parser should be carefully selected based on the model\'s training data; for Qwen coder models, qwen_coder or hermes is generally the most effective choice to ensure that the JSON output adheres to the expected schema of the MCP client.^11^

### Latency and Timeout Troubleshooting in Local Inference

A significant challenge in the vLLM/Roo-Code stack is the \"timeout gap.\" In standard OpenAI-compatible providers, tool calls are often only executed after the model completes its entire response generation.^8^ If the model is engaged in heavy reasoning or producing a long output, the VS Code extension may reach its default apiRequestTimeout of 600 seconds before the tool call is even transmitted.^8^

The probability of a timeout event ![](media/image3.png){width="0.19375in" height="0.25833333333333336in"} can be defined by the ratio of tokens generated ![](media/image5.png){width="0.22291666666666668in" height="0.2713768591426072in"} to the tokens-per-second throughput ![](media/image4.png){width="0.12170056867891514in" height="0.26212489063867017in"}, constrained by the timeout limit ![](media/image1.png){width="0.1373261154855643in" height="0.2746522309711286in"}:

![](media/image2.png){width="6.458333333333333in" height="0.5603882327209099in"}

To mitigate this on Arch Linux systems with variable hardware performance, users must adjust the roo-cline.apiRequestTimeout setting to 0 to disable the timeout entirely for local providers.^8^ Additionally, the MCP-specific network timeout (defaulting to 60 seconds) should be increased for tools that involve long-running operations like deep codebase scans or external API lookups.^14^

## Model Context Protocol: Internal Architecture and Configuration

The Model Context Protocol acts as a standardized bridge between the agent and external capabilities. In the Roo-Code environment, MCP servers operate primarily via stdio transport, creating a private, local communication pipe that ensures security by avoiding network exposure.^16^

### Global and Project-Level Configuration Schemas

Roo-Code manages MCP servers through two primary JSON configuration files. The global mcp_settings.json is located in the extension\'s global storage directory on Arch Linux (typically \~/.config/Code/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json), while project-specific settings are stored in .roo/mcp.json.^14^

### Table 2: MCP Server Configuration Parameters

| **Field**   | **Type** | **Description**                                 | **Troubleshooting Implication**                          |
|-------------|----------|-------------------------------------------------|----------------------------------------------------------|
| command     | string   | The executable to run (e.g., npx, uvx, docker). | Must be in system PATH.^17^                              |
| args        | array    | Arguments passed to the command.                | Incorrect paths here cause \"spawn ENOENT\" errors.^21^  |
| env         | object   | Environment variables for the server.           | Missing API keys here cause authentication failures.^14^ |
| alwaysAllow | array    | List of tools to auto-approve.                  | Essential for uninterrupted self-healing loops.^14^      |
| disabled    | boolean  | Flag to enable or disable the server.           | Disabling reduces token usage in the system prompt.^14^  |

When troubleshooting tool detection, the first step is to verify the validity of these JSON files. Syntax errors or trailing commas will prevent Roo-Code from loading the entire MCP hub.^18^ Furthermore, if using OpenAI models, the tool naming convention mcp\--serverName\--toolName must be understood by the model; if the agent fails to invoke tools, it may be due to a loss of context regarding this convention in the system prompt.^22^

## RAG Infrastructure: Qdrant and Codebase Indexing

Roo-Code\'s ability to navigate complex TypeScript/ReactJS codebases is powered by its codebase indexing system. This system utilizes Retrieval-Augmented Generation (RAG) to find relevant code blocks based on semantic meaning rather than keyword matching.^5^

### Vector Retrieval Mechanism

The indexing pipeline involves several high-order operations:

1.  **Parsing:** Tree-sitter performs Abstract Syntax Tree (AST) analysis to identify functions, classes, and methods.^5^

2.  **Embedding:** Code blocks (between 100 and 1000 characters) are converted into mathematical vectors using an embedding model (e.g., Google Gemini text-embedding-004 or OpenAI text-embedding-3-small).^5^

3.  **Storage:** These vectors are stored in a Qdrant database, which handles similarity searches.^5^

On Arch Linux, the most robust way to host the vector database is via a Docker container, ensuring data persistence and isolation from the host OS.

### Table 3: Qdrant RAG Performance Variables

| **Variable**           | **Setting**   | **Optimization Impact**                                          |
|------------------------|---------------|------------------------------------------------------------------|
| Search Score Threshold | 0.4 (Default) | Lowering increases recall; raising increases precision.^5^       |
| Maximum Results        | 10-20         | Limits the amount of code context injected into the prompt.^5^   |
| Incremental Indexing   | Enabled       | Uses hash-based caching to only re-index modified files.^2^      |
| File Exclusion         | .rooignore    | Prevents indexing of large build artifacts or sensitive data.^5^ |

Troubleshooting RAG failures usually points to connection issues between VS Code and the Qdrant container. Running docker ps on the Arch host verifies if the service is active on port 6333. If the status indicator in Roo-Code remains red, checking the \"Roo Code\" output channel for \"Connection to Qdrant failed\" is the primary diagnostic step.^2^

## The Self-Healing Loop: Sentry and SonarQube Orchestration

A truly agentic workflow enables the model to diagnose its own errors and verify its code quality autonomously. This is achieved by closing the loop between runtime monitoring (Sentry) and static analysis (SonarQube) via MCP.^25^

### Sentry for Autonomous Debugging

The Sentry MCP server allows the agent to pull real-time error data. This integration is crucial for \"self-healing\" because it provides the agent with the exact stack trace and event context needed to identify a regression introduced during a previous turn.^25^

#### JSON Configuration for Sentry MCP (Local Stdio)

JSON

{  
\"mcpServers\": {  
\"sentry\": {  
\"command\": \"npx\",  
\"args\": \[\"@sentry/mcp-server@latest\"\],  
\"env\": {  
\"SENTRY_AUTH_TOKEN\": \"YOUR_TOKEN\",  
\"OPENAI_API_KEY\": \"FOR_NATURAL_LANGUAGE_QUERIES\"  
}  
}  
}  
}

When an error is detected, the agent uses tools like search_issues to retrieve the relevant metadata. By mapping the stack trace to the codebase architecture defined in the \"context map,\" the agent can autonomously navigate to the failing component and propose a fix.^25^

### SonarQube for Automated Quality Gates

The SonarQube integration forces the agent to adhere to security and maintainability standards through a \"Fix-Scan-Verify\" loop. The process is as follows:

1.  **Generation:** Agent modifies a React component or TypeScript utility.

2.  **Scan:** Agent triggers sonar-scanner via the terminal.^26^

3.  **Retrieve:** Agent queries the SonarQube MCP server for quality gate status and specific issues.^26^

4.  **Correction:** If the gate fails, the agent refactors the code until the issues are resolved.

#### Table 4: SonarQube Autonomous Workflow Logic

| **Phase**               | **Tool/Command**        | **Agent Goal**                                               |
|-------------------------|-------------------------|--------------------------------------------------------------|
| **Analysis Initiation** | sonar-scanner           | Upload code snapshot to SonarQube Cloud/Server.^26^          |
| **Status Verification** | get_quality_gate_status | Determine if the code meets the project baseline.            |
| **Issue Localization**  | search_sonar_issues     | Map SonarQube findings to specific file paths and lines.^26^ |
| **Rule Understanding**  | show_rule               | Understand the underlying vulnerability or code smell.       |

The configuration of this loop requires a sonar-project.properties file in the project root, ensuring the scanner understands the project structure without repetitive instructions.^26^

## Agentic Mapping and Codebase Architecture

For Roo-Code to effectively operate on a TypeScript/ReactJS codebase, it requires a \"context map\" that goes beyond basic directory listings. This is implemented via AGENTS.md and SKILL.md files, which provide the agent with spatial and operational awareness.^6^

### Codebase Organization and Entry Points

The agent must be instructed on where specific logic resides. In a standard React architecture, this mapping should be explicitly defined in the AGENTS.md file:

- **UI Components:** /src/components/ - Presentational logic and reusable hooks.

- **State Management:** /src/store/ or /src/context/ - Global application state.

- **API Interactors:** /src/services/ - Data fetching and MCP integration logic.

- **Routing:** /src/routes/ - Application navigation flow.

By providing this structure, the engineer minimizes \"context overload,\" where the agent spends excessive tokens parsing irrelevant files.^31^ The AGENTS.md file acts as the primary \"README for agents,\" offering guidance on build steps, testing protocols, and architectural boundaries.^6^

### Multi-File Scoping and Rules

In large repositories or monorepos, nested AGENTS.md files can be used to provide tailored instructions for subprojects. Roo-Code reads the nearest file in the directory tree, allowing for granular control over agent behavior in different modules.^6^ This is particularly useful for projects that mix languages, such as a TypeScript frontend and a Python-based MCP backend.

## Troubleshooting the MCP Server Interaction

The most complex failures in the Roo-Code stack occur at the interface between the IDE and the MCP server process. These are often related to transport issues, permission conflicts, or environment mismatches.

### Stdio Transport Failures

Since Roo-Code communicates with MCP servers via standard input/output, any additional text printed to stdout by the server (such as debug logs or warnings) will corrupt the JSON-RPC message stream and cause the connection to drop.^14^

- **Symptom:** Server connects and immediately disconnects; tools fail to load.

- **Remediation:** Ensure all logging in custom MCP servers is redirected to stderr. On Arch Linux, verify that the user running VS Code has sufficient permissions to spawn child processes and access the required files.^16^

### Table 5: Troubleshooting Command-Line Errors (Arch Linux)

| **Error Code/Message**        | **Potential Cause**                            | **Verification Command**                     |
|-------------------------------|------------------------------------------------|----------------------------------------------|
| EACCES                        | Permission denied on script or directory.      | ls -l \<path\>; chmod +x \<script\>          |
| ENOENT                        | Command or file not found in \$PATH.           | which \<command\>; check settings.json       |
| ETIMEDOUT                     | Network or process lock during tool execution. | Increase networkTimeout in MCP settings.^14^ |
| SyntaxError: Unexpected token | Corrupted JSON in configuration files.         | jq. \<file\> to validate structure.^18^      |

### Shadow Git and Checkpoints

Roo-Code utilizes a shadow Git repository to manage checkpoints, allowing for non-destructive reverts of AI-suggested changes.^4^ On Arch Linux, if git is not configured (even if only locally), checkpoints may fail to initialize. The initialization timeout (default 30s) should be increased for large projects or those stored on slower storage media like HDDs or networked drives.^4^

## Advanced Self-Healing Configuration Snippets

To implement a fully autonomous debugging and self-healing workflow, the following JSON structures must be integrated into the Roo-Code environment. These snippets allow the agent to read logs, understand error reports, and execute debugging cycles without human intervention.

### MCP Logging and Error Capture

The agent interacts with the VS Code output channels and developer tools console to identify internal extension failures. A structured SKILL.md for \"System Diagnostics\" should be provided to the agent:

## name: system-diagnostics description: Instructions for diagnosing internal Roo-Code and MCP failures. {#name-system-diagnostics-description-instructions-for-diagnosing-internal-roo-code-and-mcp-failures.}

# Diagnostic Workflow

1.  Open the \"Output\" panel and select the \"Roo Code\" channel.

2.  Search for strings matching \"ERROR\", \"Timeout\", or \"ECONNREFUSED\".

3.  Access the Developer Tools Console (Help -\> Toggle Developer Tools).

4.  Filter by \"\" to identify shell integration issues.

5.  If an MCP server is failing, check if the command exists via which.

### SonarQube Self-Correction Logic

The agent should be provided with a sonar-project.properties template that includes the sonar.qualitygate.wait flag, which is critical for synchronous self-healing:

Properties

sonar.projectKey=my_agentic_app  
sonar.organization=my_org  
sonar.sources=src  
sonar.tests=tests  
sonar.javascript.lcov.reportPaths=coverage/lcov.info  
sonar.qualitygate.wait=true

By enabling wait=true, the agent\'s execution will block until the analysis is complete, ensuring that it cannot proceed with a task until the quality gate passes.^26^ If the gate fails, the agent is instructed to use search_sonar_issues_in_projects to pinpoint the defect.

## Conclusion: Future Outlook and Ecosystem Maturation

The agentic stack on Arch Linux is a high-performance, high-complexity environment that requires continuous maintenance and precise configuration. The shift toward standardized protocols like MCP and structured context files like AGENTS.md is transforming AI assistants from simple code generators into sophisticated autonomous systems.

As the ecosystem matures, the focus will likely shift toward improved incremental tool execution and more robust transport mechanisms like SSE (Server-Sent Events) for remote or containerized MCP services.^32^ For the elite Arch Systems Engineer, the key to a stable environment lies in the intersection of reproducible system states, semantic codebase awareness, and autonomous self-correction loops. By adhering to the protocols outlined in this report, developers can ensure that their Roo-Code agents operate with the precision and reliability required for complex software engineering tasks.^1^

#### Works cited

1.  Model Context Protocol (MCP) \| Roo Code Documentation, accessed on May 9, 2026, [[https://docs.roocode.com/features/mcp/overview]{.underline}](https://docs.roocode.com/features/mcp/overview)

2.  Qdrant MCP Server - LobeHub, accessed on May 9, 2026, [[https://lobehub.com/mcp/kindash-qdrant-mcp-server]{.underline}](https://lobehub.com/mcp/kindash-qdrant-mcp-server)

3.  arch-mcp - Awesome MCP Servers, accessed on May 9, 2026, [[https://mcpservers.org/servers/nihalxkumar/arch-mcp]{.underline}](https://mcpservers.org/servers/nihalxkumar/arch-mcp)

4.  Checkpoints \| Roo Code Documentation, accessed on May 9, 2026, [[https://docs.roocode.com/features/checkpoints]{.underline}](https://docs.roocode.com/features/checkpoints)

5.  Codebase Indexing \| Roo Code Documentation, accessed on May 9, 2026, [[https://docs.roocode.com/features/codebase-indexing]{.underline}](https://docs.roocode.com/features/codebase-indexing)

6.  AGENTS.md, accessed on May 9, 2026, [[https://agents.md/]{.underline}](https://agents.md/)

7.  Frequently Asked Questions \| Roo Code Documentation, accessed on May 9, 2026, [[https://docs.roocode.com/faq]{.underline}](https://docs.roocode.com/faq)

8.  \[BUG\] Tool Calls Not Applied Until End of Generation (Causes Timeout with Large Responses) · Issue \#11482 · RooCodeInc/Roo-Code - GitHub, accessed on May 9, 2026, [[https://github.com/RooCodeInc/Roo-Code/issues/11482]{.underline}](https://github.com/RooCodeInc/Roo-Code/issues/11482)

9.  How to Build Your Own Remote Code Agent with RooCode (for Cloud Workflows) - Medium, accessed on May 9, 2026, [[https://medium.com/@justinduy/how-to-build-your-own-remote-code-agent-with-roocode-for-cloud-workflows-0db9027cff51]{.underline}](https://medium.com/@justinduy/how-to-build-your-own-remote-code-agent-with-roocode-for-cloud-workflows-0db9027cff51)

10. Tool Calling - vLLM, accessed on May 9, 2026, [[https://docs.vllm.ai/en/latest/features/tool_calling/]{.underline}](https://docs.vllm.ai/en/latest/features/tool_calling/)

11. candle-vllm/docs/mcp_tool_calling.md at master - GitHub, accessed on May 9, 2026, [[https://github.com/EricLBuehler/candle-vllm/blob/master/docs/mcp_tool_calling.md]{.underline}](https://github.com/EricLBuehler/candle-vllm/blob/master/docs/mcp_tool_calling.md)

12. AI agent with MCPs using vLLM and PydanticAI - ROCm Documentation - AMD, accessed on May 9, 2026, [[https://rocm.docs.amd.com/projects/ai-developer-hub/en/latest/notebooks/inference/build_airbnb_agent_mcp.html]{.underline}](https://rocm.docs.amd.com/projects/ai-developer-hub/en/latest/notebooks/inference/build_airbnb_agent_mcp.html)

13. considering dropping roo-code over the 5m timeout issue : r/RooCode - Reddit, accessed on May 9, 2026, [[https://www.reddit.com/r/RooCode/comments/1rvbi67/considering_dropping_roocode_over_the_5m_timeout/]{.underline}](https://www.reddit.com/r/RooCode/comments/1rvbi67/considering_dropping_roocode_over_the_5m_timeout/)

14. Using MCP in Roo Code \| Roo Code Documentation - Roo Code Docs, accessed on May 9, 2026, [[https://docs.roocode.com/features/mcp/using-mcp-in-roo]{.underline}](https://docs.roocode.com/features/mcp/using-mcp-in-roo)

15. \[Roo Code + MCP\] How to handle long-running MCP calls without hitting timeout? - Reddit, accessed on May 9, 2026, [[https://www.reddit.com/r/mcp/comments/1o68nhb/roo_code_mcp_how_to_handle_longrunning_mcp_calls/]{.underline}](https://www.reddit.com/r/mcp/comments/1o68nhb/roo_code_mcp_how_to_handle_longrunning_mcp_calls/)

16. MCP Server for Arch Wiki, Packages, and AUR, accessed on May 9, 2026, [[https://bbs.archlinux.org/viewtopic.php?id=309732]{.underline}](https://bbs.archlinux.org/viewtopic.php?id=309732)

17. Building MCP clients-Node.js, accessed on May 9, 2026, [[https://modelcontextprotocol.info/docs/tutorials/building-a-client-node/]{.underline}](https://modelcontextprotocol.info/docs/tutorials/building-a-client-node/)

18. Roo Code Marketplace \| Roo Code Documentation, accessed on May 9, 2026, [[https://docs.roocode.com/features/marketplace]{.underline}](https://docs.roocode.com/features/marketplace)

19. Roo Code to Kilo Code Migration Guide (2026), accessed on May 9, 2026, [[https://kilo.ai/articles/roo-to-kilo-migration-guide]{.underline}](https://kilo.ai/articles/roo-to-kilo-migration-guide)

20. Scrapfly MCP Integration for Roo Code VS Code Extension \| Setup Guide, accessed on May 9, 2026, [[https://scrapfly.io/docs/mcp/integrations/roo-code]{.underline}](https://scrapfly.io/docs/mcp/integrations/roo-code)

21. Visual Studio Code - ArchWiki, accessed on May 9, 2026, [[https://wiki.archlinux.org/title/Visual_Studio_Code]{.underline}](https://wiki.archlinux.org/title/Visual_Studio_Code)

22. \[BUG\] Agents unable to call MCP tools when using ChatGPT · Issue \#11317 · RooCodeInc/Roo-Code - GitHub, accessed on May 9, 2026, [[https://github.com/RooCodeInc/Roo-Code/issues/11317]{.underline}](https://github.com/RooCodeInc/Roo-Code/issues/11317)

23. roo-code-codebase-indexing-free-setup - AIXplore - Tech Articles, accessed on May 9, 2026, [[https://ai.rundatarun.io/Practical+Applications/roo-code-codebase-indexing-free-setup]{.underline}](https://ai.rundatarun.io/Practical+Applications/roo-code-codebase-indexing-free-setup)

24. Local Quickstart - Qdrant, accessed on May 9, 2026, [[https://qdrant.tech/documentation/quickstart/]{.underline}](https://qdrant.tech/documentation/quickstart/)

25. Sentry MCP Server - Sentry Docs, accessed on May 9, 2026, [[https://docs.sentry.io/ai/mcp/]{.underline}](https://docs.sentry.io/ai/mcp/)

26. Claude Code + SonarQube MCP: Building an autonomous code \..., accessed on May 9, 2026, [[https://www.sonarsource.com/blog/claude-code-sonarqube-mcp-building-an-autonomous-code-review-workflow]{.underline}](https://www.sonarsource.com/blog/claude-code-sonarqube-mcp-building-an-autonomous-code-review-workflow)

27. SonarQube MCP Server & Gemini Code Assist Agent Mode \| Sonar, accessed on May 9, 2026, [[https://www.sonarsource.com/resources/library/get-started-with-sonarqube-mcp-server-and-gemini-code-assist-agent-mode/]{.underline}](https://www.sonarsource.com/resources/library/get-started-with-sonarqube-mcp-server-and-gemini-code-assist-agent-mode/)

28. Set up the SonarQube plugin for Claude Code \| Sonar, accessed on May 9, 2026, [[https://www.sonarsource.com/resources/library/set-up-the-sonarqube-plugin-for-claude-code/]{.underline}](https://www.sonarsource.com/resources/library/set-up-the-sonarqube-plugin-for-claude-code/)

29. How to Build Your AGENTS.md (2026): The Context File That Makes AI Coding Agents Actually Work, accessed on May 9, 2026, [[https://www.augmentcode.com/guides/how-to-build-agents-md]{.underline}](https://www.augmentcode.com/guides/how-to-build-agents-md)

30. Context engineering for IDEs: Agents.md & agent skills - LogRocket Blog, accessed on May 9, 2026, [[https://blog.logrocket.com/context-engineering-for-ides-agents-md-agent-skills/]{.underline}](https://blog.logrocket.com/context-engineering-for-ides-agents-md-agent-skills/)

31. Writing My Own AI Agent Coding Method \| by Mathieu Veron \| Medium, accessed on May 9, 2026, [[https://medium.com/@mathieu.veron_70170/writing-my-own-ai-agent-coding-method-4b0ea46d83aa]{.underline}](https://medium.com/@mathieu.veron_70170/writing-my-own-ai-agent-coding-method-4b0ea46d83aa)

32. Roo Code - Cognee Documentation, accessed on May 9, 2026, [[https://docs.cognee.ai/cognee-mcp/integrations/roo-code]{.underline}](https://docs.cognee.ai/cognee-mcp/integrations/roo-code)

33. MCP-Server-Roo-Code: A Deep Dive for AI Engineers - Skywork, accessed on May 9, 2026, [[https://skywork.ai/skypage/en/MCP-Server-Roo-Code-A-Deep-Dive-for-AI-Engineers/1972852844913553408]{.underline}](https://skywork.ai/skypage/en/MCP-Server-Roo-Code-A-Deep-Dive-for-AI-Engineers/1972852844913553408)
