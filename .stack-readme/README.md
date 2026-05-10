# Master Architecture Context Map and System Setup: Arch Linux AI-DevOps Stack

## Strategic Infrastructure Overview and Dual-Purpose Mandate

The deployment and orchestration of a high-performance artificial intelligence and DevOps stack demand an uncompromising architectural foundation. This document serves a dual purpose: it operates as a rigorous, no-nonsense setup and deployment guide for human systems engineers, while simultaneously functioning as a highly structured, machine-readable context map for the Roo-Code autonomous orchestration agent operating within the Visual Studio Code (VSCode) environment.^1^ The migration of this complex stack---encompassing the vLLM inference engine, IBM Granite multi-adapter models, Sentry telemetry, Qdrant vector databases, and SonarQube static analysis tools---represents a paradigm shift from a vulnerable, root-centric deployment model to a highly isolated, professional multi-user Arch Linux ecosystem.^1^

For the human developer, this context map dictates the exact commands, dependency management strategies, and kernel tuning parameters required to establish a reproducible system state across both Windows Subsystem for Linux (WSL2) and bare-metal Arch Linux environments.^1^ It explicitly addresses the complexities of proprietary GPU driver compilation, Python C-API sandboxing, and memory abstraction. For the Roo-Code agent, this document provides the topological awareness necessary to execute autonomous code generation, system monitoring, and Level 2 Continuous AI error remediation.^1^ By defining the precise execution boundaries, Model Context Protocol (MCP) JSON configurations, and TypeScript Abstract Syntax Tree (AST) strictness parameters, the architecture ensures that the agent operates deterministically within the bounds of a predefined 81-stage Destiny Matrix logic without hallucinating configurations or introducing technical debt.^1^

## Operating System Substrates: Bare-Metal and WSL2 Deployment Specifications

The core operating system substrate relies on Arch Linux, selected for its rolling-release architecture, deep customizability, and minimal background overhead.^1^ The system is engineered to function identically across both bare-metal hardware and WSL2 virtualized environments, though the initial hardware abstraction layers require distinct initialization protocols.^1^

### Bare-Metal Hardware Initialization and Dependency Resolution

When deploying on bare-metal systems, Arch Linux requires exact dependency management, particularly concerning the proprietary NVIDIA drivers necessary for Tensor Core operations within the vLLM engine.^1^ Human engineers frequently encounter catastrophic dependency resolution failures within the pacman package manager during initial setup.^11^ These conflicts typically arise when legacy driver metadata (such as phantom nvidia-580xx-utils packages) corrupts the local pacman database, preventing the installation of the standard nvidia-utils and nvidia base packages.^11^

To achieve a reproducible system state, the architecture mandates a strict chroot-based recovery and installation protocol to bypass broken dependency trees without compromising the operating system\'s integrity.^12^

| **Setup Phase**          | **Execution Command**                                                | **Architectural Rationale**                                                                                                  |
|--------------------------|----------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| **System Isolation**     | systemctl isolate rescue.target                                      | Halts non-essential daemon execution to safely manipulate the graphics stack.^12^                                            |
| **Live Medium Mounting** | mount /dev/sd\<X\>\<n\> /mnt followed by mount -o bind /dev /mnt/dev | Establishes a clean chroot environment from a live USB, bypassing the corrupted local kernel state.^12^                      |
| **Dependency Override**  | pacman -Rdd nvidia-libgl lib32-nvidia-libgl mesa                     | The -Rdd flag forces the removal of phantom providers, bypassing dependency checks that otherwise block the transaction.^12^ |
| **Driver Installation**  | pacman -S nvidia-utils                                               | Installs the clean proprietary driver stack required for the PyTorch CUDA backend.^11^                                       |

### WSL2 Virtualization and Memory Abstraction

For enterprise environments restricted to Windows 11 host operating systems, the stack relies on the Windows Subsystem for Linux (WSL2).^1^ WSL2 utilizes a lightweight Hyper-V utility VM to execute the Arch Linux guest.^13^ While this simplifies GPU pass-through via native Windows drivers, it introduces severe memory management complexities. The host OS frequently fails to reclaim cached memory from the WSL2 instance, leading to progressive starvation of the AI inference engine.^1^

To enforce a deterministic memory state before initiating the vLLM stack, developers and orchestration agents must utilize the PowerShell cold-boot command: wsl \--shutdown.^1^ This forcefully terminates the lightweight utility VM, clearing corrupted Page Tables and resetting the virtualized Video RAM (VRAM) allocations, ensuring that the subsequent boot sequence possesses access to the maximum available hardware resources.^1^

## Kernel Tuning, Daemon Lifecycle, and Privilege Isolation

The architectural paradigm strictly prohibits the execution of AI models or telemetry databases under the root user.^1^ The entire stack has been migrated to a dedicated limited user environment named llmuser, which maintains membership exclusively within the wheel and docker groups.^1^ Process lifecycle management is handled entirely by systemd, which governs the automated startup, dependency mapping, and crash recovery of the stack components.^1^

### Systemd Process Isolation and Docker Daemon Ownership

Transitioning containerized services (such as the SonarQube static analyzer and the Sentry telemetry platform) from the root user to llmuser introduces specific filesystem ownership constraints.^1^ The Docker daemon fundamentally requires root privileges to bind to host network ports, meaning that process trees will persistently display the docker-proxy process running as root.^1^ The orchestration agent must recognize this as normal system behavior rather than a security breach.^1^

To isolate the internal container logic, the systemd service files must explicitly declare User=llmuser.^1^ Furthermore, when migrating historical database volumes from /root to /home/llmuser/, the filesystem ownership metadata remains preserved as root.^1^ The agent must proactively execute chown -R llmuser:llmuser \<directory\> on all migrated volumes; failure to do so results in silent \"Permission Denied\" startup errors that cause the systemd daemon to place the service in a failed state.^1^

### Kernel-Level Memory Map Tuning for Java Services

Heavy Java-based indexing services, specifically the SonarQube backend and its underlying Elasticsearch engine, require direct manipulation of Linux kernel parameters.^1^ By default, Arch Linux imposes strict limits on the number of memory-mapped areas a process may possess, which is insufficient for the memory-mapped file structures utilized by vector search engines and large-scale code analyzers.^1^

If the agent attempts to initialize SonarQube without kernel modifications, Elasticsearch will experience an instantaneous Out-Of-Memory (OOM) kernel panic during the bootstrap sequence.^1^ The architecture mandates the creation of an explicit sysctl drop-in file to permanently alter the virtual memory mapping limits.

| **Configuration File Path**     | **Target Parameter** | **Required Value** | **Execution Rationale**                                                                      |
|---------------------------------|----------------------|--------------------|----------------------------------------------------------------------------------------------|
| /etc/sysctl.d/99-sonarqube.conf | vm.max_map_count     | 262144             | Provides sufficient memory-mapped file limits for Elasticsearch, preventing boot crashes.^1^ |

## Python Sandboxing and Strict Dependency Pinning

The AI inference stack relies heavily on Python-based machine learning frameworks.^1^ However, Arch Linux\'s commitment to bleeding-edge package distribution introduces a fundamental architectural conflict.^1^ Arch Linux natively distributes the latest major Python releases (e.g., Python 3.14+), while highly optimized matrix multiplication libraries, most notably numba and the vLLM engine itself, lack compilation support for the newest Python C-API structures.^1^

Attempting to install the vllm package via the global pacman repository or the Arch User Repository (AUR) on an incompatible Python version results in catastrophic wheel build failures during the compilation of numba and PyTorch CUDA extensions.^1^

### The uv Virtual Environment Paradigm

To bypass the global OS package manager and guarantee a reproducible build state, the system utilizes the uv package manager---a highly optimized Rust-based Python environment resolver.^1^ The agent must construct a hermetically sealed Python sandbox, forcing the utilization of a stabilized Python version (Python 3.12) to ensure perfect compatibility with the vLLM inference engine.^1^

The exact dependency management sequence is strictly defined as follows:

1.  **Repository Synchronization:** sudo pacman -Syu uv updates the system mirrors and installs the uv package manager without disrupting the global Python interpreter.^1^

2.  **Sandbox Generation:** uv venv \--python 3.12 explicitly pulls the Python 3.12 binaries and constructs a virtual environment within the /home/llmuser/vLLM/.venv directory.^1^

3.  **Engine Installation:** Within the activated environment, the agent executes uv pip install vllm \--torch-backend auto to resolve the PyTorch backend, automatically detecting the presence of NVIDIA CUDA toolkits and compiling the appropriate flash-attention kernels.^1^

Before loading massive multi-billion parameter models, the agent must verify hardware detection across the PCIe bus by executing a Python inline script: python -c \"import torch; print(torch.cuda.device_count())\". This validates that PyTorch correctly addresses the dual-GPU topology.^1^

## Inference Engine Architecture: vLLM and IBM Granite

The inference infrastructure has been modernized by replacing monolithic, single-file executable architectures (such as Ollama or LM Studio) with the vLLM serving engine.^1^ vLLM was explicitly chosen for its PagedAttention memory management, Continuous Batching algorithms, and native support for Dynamic Low-Rank Adaptation (LoRA) modules.^1^ This backend operates as the primary cognitive engine for the Roo-Code orchestration agent, processing complex source code analysis and generating Abstract Syntax Tree (AST) modifications.^1^

### VRAM Mathematics and Tensor Parallelism

The hardware topology operates on an asymmetric dual-GPU configuration, specifically utilizing an RTX 3080 Ti (12GB VRAM) paired with an RTX A2000 (12GB VRAM), yielding a total theoretical capacity of 24GB.^1^ Loading an 8-billion or 30-billion parameter model (such as ibm-granite/granite-4.1-8b-instruct) across fragmented memory buses requires mathematically precise tensor parallelism.^1^

The vLLM launch configuration utilizes the parameter \--tensor-parallel-size 2 to distribute the matrix multiplication operations perfectly across both rendering devices.^1^ However, memory allocation must be strictly bounded to prevent the AI stack from starving the host operating system. By default, vLLM utilizes a greedy allocation strategy, attempting to reserve ![](media/image3.png){width="0.3697922134733158in" height="0.24036417322834647in"} of all available VRAM for its Key-Value (KV) cache.^1^ In a WSL2 or desktop-rendered environment, background OS consumption will immediately trigger a hard crash.^1^

To stabilize the system, the architecture enforces a strict memory ceiling via the \--gpu-memory-utilization 0.8 parameter.^1^ This limits the engine to exactly ![](media/image2.png){width="0.3697922134733158in" height="0.24036417322834647in"} of the physical VRAM, providing a ![](media/image1.png){width="0.3697922134733158in" height="0.24036417322834647in"} buffer for system rendering.^1^ The available KV cache is dynamically calculated to support massive context windows, up to the hardware-limited \--max-model-len 32768 tokens.^1^ To further insulate the stack from Out-Of-Memory (OOM) states when processing massive codebase repositories, the parameter \--cpu-offload-gb 10 forces the engine to page inactive tensor blocks directly into the system\'s DDR4/DDR5 RAM.^1^

### Dynamic LoRA Mounting and Granite Switch Architecture

The chosen intelligence model, IBM Granite 4.1, utilizes a \"multi-adapter\" framework known as Granite Switch.^1^ Instead of baking task-specific capabilities into the foundational weights, specialized Retrieval-Augmented Generation (RAG) behaviors---such as hallucination detection, citation generation, and precise answerability scoring---are injected dynamically at runtime via LoRA adapters.^1^

The launch sequence is encapsulated within the envUP.sh script, which the agent executes via cd \~/vLLM &&./envUP.sh.^1^ The internal shell logic executes the following structured vLLM serving command:

| **Command Parameter** | **Argument**                                                 | **Architectural Function**                                                                             |
|-----------------------|--------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| vllm serve            | \"ibm-granite/granite-4.1-8b-instruct\"                      | Initializes the OpenAI-compatible API server using the foundational Granite model.^1^                  |
| \--enable-lora        | (Boolean Flag)                                               | Activates the PagedAttention subsystem required to multiplex LoRA weights alongside the base model.^1^ |
| \--lora-modules       | \"rag_adapter=ibm-granite/granite-4.1-8b-instruct-rag-lora\" | Dynamically mounts the IBM-specific RAG adapter, binding it to the rag_adapter alias.^1^               |

The vLLM engine exposes this configuration locally on http://localhost:8000/v1.^1^ When configuring the Roo-Code VSCode extension, the agent must be bound to the rag_adapter model ID and utilize IBM\'s specific control tokens (e.g., \<think\>, \<cite\>) within its system prompts to correctly invoke the intrinsic RAG behaviors.^1^

## Retrieval-Augmented Generation (RAG) and Qdrant Vector Intelligence

To enable autonomous data discovery, persistent codebase memory, and deep context mapping, the architecture integrates the Qdrant vector database via the specialized Qdrant Sentinel Model Context Protocol (MCP) server.^16^ The RAG pipeline relies on high-dimensional mathematical embeddings to map the semantic topology of the codebase, allowing the AI agent to query historical commits, API definitions, and complex module dependencies prior to executing file modifications.^16^

### Qdrant Sentinel MCP and Dimension Enforcement

The Qdrant Sentinel MCP server functions as a universal embedding proxy, seamlessly integrating with the vLLM OpenAI-compatible API to generate dense vector embeddings of the source code.^16^ A critical architectural priority is the maintenance of search integrity through strict dimension enforcement.^16^ In poorly configured vector environments, mixing embedding models (e.g., switching from a 1024-dimension to a 1536-dimension model) results in catastrophic data corruption known as destructive zero-padding.^16^ The Sentinel MCP server prevents this by automatically detecting and locking the embedding dimensions upon the initialization of a new Qdrant collection, providing zero-configuration safety for the orchestration agent.^16^

### Agentic Non-Linear RAG Workflows

Standard Retrieval-Augmented Generation pipelines follow a rigid, linear path: a query is received, documents are retrieved, and a response is generated.^18^ If the retrieved context is insufficient, the LLM hallucinates or fails.^18^

This stack utilizes an Agentic RAG architecture, fundamentally breaking the linear flow.^18^ The Roo-Code agent is granted the freedom to take multiple non-linear steps.^18^ Through the Qdrant MCP server, the agent possesses access to introspection tools such as qdrant_list_collections and qdrant_scroll.^16^ The agent evaluates its initial prompt; if it determines the context window lacks necessary programmatic definitions, it autonomously executes a vector search, retrieves the relevant source files from the Qdrant database, appends them to its context, and then proceeds with code generation.^16^

## Codebase Architecture and TypeScript Agentic Mapping

For the AI agent to operate autonomously without destroying the build pipeline, it must possess a rigorous understanding of the repository hierarchy, dependency structures, and type-checking strictures.^1^ The target repository utilizes a modular TypeScript and Webpack scaffold (specifically the AFNM Mod Template), rendering React and Material UI components.^1^

### Core Directory Topology and Execution Zones

The agent must restrict its modifications to specific execution zones. The directory map is highly specialized, separating source code from automation scripts and static localization matrices.^1^

| **Directory / File Path** | **Architectural Function**                     | **AI Agent Interaction Rules and Restrictions**                                                                |
|---------------------------|------------------------------------------------|----------------------------------------------------------------------------------------------------------------|
| src/mod.ts                | Bootstrap entry point and metadata definition. | Treated as read-only state reference. The agent modifies this file only during autonomous version bumps.^1^    |
| src/modContent/index.ts   | Primary runtime entry point.                   | The core modification zone for gameplay logic, UI wiring, and API hooks. High-frequency edit target.^1^        |
| src/global.d.ts           | Shared typings registry.                       | The agent must extend window.modAPI declarations here to pass strict type checks.^1^                           |
| scripts/                  | Automation and CI/CD tooling.                  | Contains runtime:oracle and copy-translations.js. Execution targets for validation pipelines.^1^               |
| translations/             | Localization matrices (e.g., en.json).         | The staging area for string key extraction. Regenerates template.json during builds.^1^                        |
| .agents/skills/           | Workflow-specific skill files.                 | The agent is authorized to self-heal and update these rules dynamically if documentation drift is detected.^1^ |

### Maximum Strictness TypeScript Compiler Configuration

The agent is mathematically bound by a heavily fortified tsconfig.json configuration.^1^ This file acts as the ultimate authority on code formatting, logic validation, and memory safety, strictly defining how the compiler transforms the /src directory into the final /dist output.^1^ Designed under the https://json.schemastore.org/tsconfig schema, the compiler options target ES2022 and utilize NodeNext for modern module resolution.^1^

The agent must navigate a web of uncompromising strictness parameters designed to prevent human and LLM-induced errors ^1^:

1.  **Core Type Safety:** The strict: true directive serves as the baseline, strictly forbidding variables from defaulting to the any type (noImplicitAny) and demanding explicit handling of all nullable states via strictNullChecks.^1^

2.  **Runtime Defensive Measures:** The architecture enforces noUncheckedIndexedAccess. When the agent accesses an array or object via an index signature, the compiler dynamically appends undefined to the expected type, forcing the agent to write defensive runtime boundary checks.^1^ Furthermore, exactOptionalPropertyTypes prevents the agent from lazily assigning explicit undefined values to optional properties.^1^

3.  **Logic and Dead Code Elimination:** The compiler strictly prevents logic fall-through in switch statements (noFallthroughCasesInSwitch) and enforces deterministic return paths for all functions (noImplicitReturns).^1^ The agent is absolutely forbidden from leaving dead code in the repository; settings like noUnusedLocals, noUnusedParameters, and allowUnreachableCode: false will immediately crash the build if unreferenced variables are detected.^1^

4.  **Object-Oriented Integrity:** When dealing with class inheritance, the noImplicitOverride flag requires the agent to utilize the override keyword explicitly, preventing accidental shadowing of base class methods.^1^

Any code generated by the agent that violates these constraints will trigger a rejection during the mandatory bun run typecheck validation loop.^1^

### The ModAPI Fallback Ladder and State Interaction Constraints

When interacting with external application states or injecting React components, the agent must strictly adhere to the \"ModAPI Fallback Ladder,\" a prioritized sequence of state access methods designed to prevent deterministic desynchronization.^1^

1.  **Tier 1 (Read/Subscribe):** This is the safest interaction layer. The agent must use window.modAPI.getGameStateSnapshot() to obtain read-only memory clones.^1^ For reactivity, it must bind event listeners via window.modAPI.subscribe().^1^

2.  **Tier 2 (Official UI Injection):** When generating user interfaces, the agent must execute registerOptionsUI() for rendering settings panels, or use injectUI() for precise localized DOM affordances.^1^

3.  **Tier 3 (Lifecycle Hooks):** State mutations may only be triggered during designated lifecycle events (e.g., onBeforeCombat or onGenerateExploreEvents).^1^ The agent must be aware that onGenerateExploreEvents fires before weight-expansion, requiring precise mathematical handling.^1^

4.  **Tier 4 (Raw Store Read-Only):** Only when the snapshot fails may the agent access window.gameStore. This Redux store is strictly read-only. Hooks such as onReduxAction and onReduxActionPayload are flagged as extreme hazards and must be kept deterministic, fast, and completely free of network or UI side effects.^1^

5.  **Tier 5 (DOM Scraping):** Direct React Fiber interaction or raw DOM scraping is expressly forbidden under core safety protocols, used only as an absolute last resort.^1^

Additionally, the architecture expressly forbids the bundling of externalized dependencies. React, ReactDOM, and Material UI (@mui/material) packages are provided dynamically by the host runtime; the agent must configure Webpack to treat these as externals to prevent monolithic bundle bloating.^1^ Persistent configuration state must always be serialized into numeric global flags (setGlobalFlag()) rather than isolated JSON files.^1^

## AI Orchestration and Roo-Code .roomodes Configuration {#ai-orchestration-and-roo-code-.roomodes-configuration}

The Roo-Code orchestration engine dictates how autonomous agents interact with the workspace.^19^ The system configuration is stored in .roomodes files within the project root, structured using strict JSON or YAML schemas validated against https://www.schemastore.org/roomodes.json.^20^ These configuration files define the distinct personas, tool access permissions, and behavioral boundaries for individual agent sub-routines.^22^

To partition cognitive load efficiently and avoid exhausting the 32k token context window, the architecture relies on highly specialized modes.^19^

### Defining the Orchestrator and Specialized Agents

The JSON schema architecture for the project-specific .roomodes file is defined as follows, establishing the core permissions boundary ^22^:

JSON

{  
\"customModes\":,  
\"customInstructions\": \"When a complex issue is detected, break it into logical subtasks. Call \`new_task\` to delegate to Architect, Code, or Debug modes.\"  
},  
{  
\"slug\": \"think\",  
\"name\": \"Think\",  
\"roleDefinition\": \"A specialized reasoning engine. Analyze tasks, list edge cases, and return a markdown-structured plan.\",  
\"groups\": \[\"read\"\],  
\"customInstructions\": \"Output only the reasoning plan using headings. Do NOT write final code. This reduces inference costs by preventing rapid code-iteration loops.\"  
},  
{  
\"slug\": \"architect\",  
\"name\": \"Architect\",  
\"roleDefinition\": \"An experienced technical leader handling system design, codebase mapping, and abstract syntax modifications.\",  
\"groups\":,  
\"customInstructions\": \"Draft extensive implementation plans using the standard context-map format before delegating to the Code mode.\"  
},  
{  
\"slug\": \"debug\",  
\"name\": \"Debug\",  
\"roleDefinition\": \"An expert problem solver specializing in systematic troubleshooting, utilizing Sentry stack traces and SonarQube rule violations.\",  
\"groups\": \[\"read\", \"edit\", \"command\", \"mcp\"\],  
\"customInstructions\": \"Always run \`bun run runtime:oracle\` to verify runtime parity. Trust the terminal grep output over theoretical documentation. Fix any discovered documentation drift immediately.\"  
}  
\]  
}

The configuration relies on exact tool group authorizations.^22^ The read group allows codebase inspection, edit allows filesystem modification (with regex-based constraints for safety), command allows terminal execution (essential for the bun run build pipelines), and mcp permits access to the external Model Context Protocol servers.^19^

By utilizing the \"Think\" mode, the Orchestrator forces the LLM to output pure markdown-structured reasoning without generating immediate code. This pre-planning phase dramatically reduces token inference costs and aligns the agent\'s thought process with the predefined 81-stage Destiny Matrix logic before any physical edits are executed on the AST.^1^

## The Autonomous Self-Healing Loop: Sentry Telemetry and Ingestion

The pinnacle of this DevOps architecture is the closed-loop, autonomous self-healing mechanism. By continuously feeding telemetry and static analysis data back into the Roo-Code agent via the Model Context Protocol, the system achieves Level 2 Continuous AI.^5^ The agent autonomously detects production errors, executes deep root cause analysis, generates standard-compliant patches, and verifies the resolution without human intervention.^5^

### Sentry MCP Configuration and Production Telemetry

When a production error occurs, the self-hosted Sentry instance (running as sentry.service on port 9000) captures the stack trace, breadcrumbs, and environment data.^1^ The agent accesses this data through the Sentry MCP server, configured globally in the VSCode mcp_settings.json file.^27^

The required JSON configuration for integrating the Sentry MCP server utilizes the stdio transport layer, connecting the agent directly to the API endpoint ^28^:

JSON

{  
\"mcpServers\": {  
\"sentry\": {  
\"command\": \"npx\",  
\"args\":,  
\"env\": {  
\"SENTRY_ACCESS_TOKEN\": \"YOUR_ORG_ACCESS_TOKEN\",  
\"EMBEDDED_AGENT_PROVIDER\": \"openai\",  
\"OPENAI_API_KEY\": \"sk-local-vllm-proxy-key\"  
}  
}  
}  
}

Upon encountering a 302 Redirect Loop error (often caused by stale sentrysid cookies) or an undefined property exception within a React Native component, the Orchestrator agent invokes the MCP tools.^1^ Using natural language queries (e.g., \"What\'s the root cause of issue PROJECT-123\"), the agent triggers the search_events or search_issues MCP endpoints.^28^ The MCP server translates these queries into Sentry\'s specific query syntax, pulling the exact line numbers, variables, and session replay logs responsible for the crash.^26^

The agent analyzes this data to formulate a hypothesis. If it detects a missing backend API payload, it can verify the infer_ip or infer_user_agent JSON ingestion settings to ensure the telemetry pipeline is accurately reporting the client state.^26^

## Static Verification and SonarQube Agentic Analysis

Once the Debug agent formulates a hypothesis and modifies the codebase, the proposed Abstract Syntax Tree modification must pass the SonarQube verification phase. The AI is strictly barred from merging untested \"vibe-coded\" solutions.^14^ Instead, the system enforces spec-driven development using a localized SonarQube container running on port 9000.^1^

### SonarQube MCP JSON Integration

The SonarQube MCP Server allows the agent to read static analysis violations directly into its context window, ensuring that all code adheres to security and complexity quality gates.^31^

The MCP integration is defined by the following JSON configuration ^34^:

JSON

{  
\"mcpServers\": {  
\"sonarqube\": {  
\"command\": \"docker\",  
\"args\": \[  
\"run\",  
\"-i\",  
\"\--rm\",  
\"mcp/sonarqube\"  
\],  
\"env\": {  
\"SONARQUBE_URL\": \"http://127.0.0.1:9000\",  
\"SONARQUBE_USER_TOKEN\": \"YOUR_SONAR_TOKEN\",  
\"SONARQUBE_TOOLSETS\": \"analysis,issues,measures,projects,rules,security-hotspots\"  
}  
}  
}  
}

The agent executes a local bash script (scripts/sonar-scan.sh), which runs the Docker-based scanner across the src/ directory and compiles the output into a structured sonar-report.json file.^14^ The SonarQube MCP tools (such as search_my_sonarqube_projects and search_sonar_issues_in_projects) parse this JSON file, exposing the exact file path, line number, severity metric, and specific rule ID violated by the newly generated code.^14^

Functioning as a Remediation Agent, the LLM addresses well-defined, deterministic issues---such as hardcoded secrets, null pointer risks, and common security anti-patterns---without hallucinating non-existent architecture flaws.^6^ The agent loops through the read-analyze-remediate-verify cycle until the SonarQube quality gate registers a flawless status.^7^

## Operational Directives and Validation Pipelines

The complete workflow execution follows a strict evidentiary protocol mandated by the AI architecture guidelines, prioritizing concrete system state evidence over conversational theory.^1^

1.  **Pre-commit Evidence Loop:** Prior to finalizing any task, the agent must invoke the bun run typecheck and bun run build commands.^1^ Any strictness violations detected by the TypeScript compiler trigger an immediate rollback to the Debug mode.

2.  **Runtime Oracle Verification:** To prevent hallucination based on outdated or aspirational documentation, the agent runs bun run runtime:oracle.^1^ If the prose within the reference documentation conflicts with the raw output of bun run runtime:grep \-- \"\<symbol\>\", the agent is mathematically constrained to trust the terminal output representing the installed game runtime.^1^

3.  **Documentation Stewardship:** The agent possesses standing permission to act as a knowledge steward.^1^ If it identifies stale, inaccurate, or misleading prose within the .agents/skills/\* architecture while resolving a SonarQube error, it executes a self-healing patch to update the repository documentation simultaneously, ensuring the context map never degrades.^1^

This highly structured, cross-verified environment guarantees that human developers possess a robust local deployment, while providing the Roo-Code orchestration engine with the deterministic APIs, clear execution boundaries, and telemetry loops necessary for advanced autonomous software engineering.

#### Works cited

1.  vllm-setup.md.txt

2.  How to Build Your Own Remote Code Agent with RooCode (for Cloud Workflows) - Medium, accessed on May 9, 2026, [[https://medium.com/@justinduy/how-to-build-your-own-remote-code-agent-with-roocode-for-cloud-workflows-0db9027cff51]{.underline}](https://medium.com/@justinduy/how-to-build-your-own-remote-code-agent-with-roocode-for-cloud-workflows-0db9027cff51)

3.  From WSL to bare-metal Linux \| Adolfo Ochagavía, accessed on May 9, 2026, [[https://ochagavia.nl/blog/from-wsl-to-bare-metal-linux/]{.underline}](https://ochagavia.nl/blog/from-wsl-to-bare-metal-linux/)

4.  I like WSL but there\'s nothing better than using Linux on bare metal - XDA Developers, accessed on May 9, 2026, [[https://www.xda-developers.com/why-dual-boot-linux-vs-wsl/]{.underline}](https://www.xda-developers.com/why-dual-boot-linux-vs-wsl/)

5.  Automated Error Analysis with Sentry MCP - Continue Docs, accessed on May 9, 2026, [[https://docs.continue.dev/guides/sentry-mcp-error-monitoring]{.underline}](https://docs.continue.dev/guides/sentry-mcp-error-monitoring)

6.  Beyond finding issues: Join the SonarQube Remediation Agent Beta \| Sonar, accessed on May 9, 2026, [[https://www.sonarsource.com/blog/join-the-sonarqube-remediation-agent-beta]{.underline}](https://www.sonarsource.com/blog/join-the-sonarqube-remediation-agent-beta)

7.  Agentic Workflow Demo: Use SonarQube to Verify & Review AI Code - YouTube, accessed on May 9, 2026, [[https://www.youtube.com/watch?v=4RMi-72Pmfs]{.underline}](https://www.youtube.com/watch?v=4RMi-72Pmfs)

8.  An Actually Productive Arch Linux Setup - DEV Community, accessed on May 9, 2026, [[https://dev.to/kurealnum/an-actually-productive-arch-linux-setup-2d62]{.underline}](https://dev.to/kurealnum/an-actually-productive-arch-linux-setup-2d62)

9.  AUR (en) - python-vllm-bin - Arch Linux, accessed on May 9, 2026, [[https://aur.archlinux.org/packages/python-vllm-bin?all_deps=1]{.underline}](https://aur.archlinux.org/packages/python-vllm-bin?all_deps=1)

10. GPU - vLLM, accessed on May 9, 2026, [[https://docs.vllm.ai/en/stable/getting_started/installation/gpu/]{.underline}](https://docs.vllm.ai/en/stable/getting_started/installation/gpu/)

11. I\'m having a really weird issue with NVIDIA drivers on Arch Linux and I\'m kinda stuck. : r/archlinux - Reddit, accessed on May 9, 2026, [[https://www.reddit.com/r/archlinux/comments/1ssv73m/im_having_a_really_weird_issue_with_nvidia/]{.underline}](https://www.reddit.com/r/archlinux/comments/1ssv73m/im_having_a_really_weird_issue_with_nvidia/)

12. Replace Incorrect Packages which are Dependencies - Unix & Linux Stack Exchange, accessed on May 9, 2026, [[https://unix.stackexchange.com/questions/244762/replace-incorrect-packages-which-are-dependencies]{.underline}](https://unix.stackexchange.com/questions/244762/replace-incorrect-packages-which-are-dependencies)

13. Is WSL enough to replace bare-metal linux? : r/linuxquestions - Reddit, accessed on May 9, 2026, [[https://www.reddit.com/r/linuxquestions/comments/12pokps/is_wsl_enough_to_replace_baremetal_linux/]{.underline}](https://www.reddit.com/r/linuxquestions/comments/12pokps/is_wsl_enough_to_replace_baremetal_linux/)

14. Adding SonarQube to an AI-Assisted Development Workflow - DEV Community, accessed on May 9, 2026, [[https://dev.to/camptocamp-geo/adding-sonarqube-to-an-ai-assisted-development-workflow-3k0h]{.underline}](https://dev.to/camptocamp-geo/adding-sonarqube-to-an-ai-assisted-development-workflow-3k0h)

15. \[Installation\]: vllm on NVIDIA jetson AGX orin · Issue \#5640 - GitHub, accessed on May 9, 2026, [[https://github.com/vllm-project/vllm/issues/5640]{.underline}](https://github.com/vllm-project/vllm/issues/5640)

16. Qdrant2: Universal MCP Server for AI Agents & RAG, accessed on May 9, 2026, [[https://mcpmarket.com/server/qdrant2]{.underline}](https://mcpmarket.com/server/qdrant2)

17. Qdrant x LlamaIndex \| Advanced RAG Patters and Agent Workflows - YouTube, accessed on May 9, 2026, [[https://www.youtube.com/watch?v=ytWskQWsAA4]{.underline}](https://www.youtube.com/watch?v=ytWskQWsAA4)

18. What is Agentic RAG? Building Agents with Qdrant, accessed on May 9, 2026, [[https://qdrant.tech/articles/agentic-rag/]{.underline}](https://qdrant.tech/articles/agentic-rag/)

19. Using Modes \| Roo Code Documentation, accessed on May 9, 2026, [[https://docs.roocode.com/basic-usage/using-modes]{.underline}](https://docs.roocode.com/basic-usage/using-modes)

20. Customizing Modes \| Roo Code Documentation, accessed on May 9, 2026, [[https://docs.roocode.com/features/custom-modes]{.underline}](https://docs.roocode.com/features/custom-modes)

21. \[BUG\] .roomodes doesn\'t align with published JSON schema · Issue \#11790 · RooCodeInc/Roo-Code - GitHub, accessed on May 9, 2026, [[https://github.com/RooCodeInc/Roo-Code/issues/11790]{.underline}](https://github.com/RooCodeInc/Roo-Code/issues/11790)

22. Creating Custom Modes in Roo Code: Quick Start, accessed on May 9, 2026, [[https://ai.rundatarun.io/AI+Systems+%26+Architecture/custom-modes-quick-start]{.underline}](https://ai.rundatarun.io/AI+Systems+%26+Architecture/custom-modes-quick-start)

23. Roo Code Workflow: Build a Free, Always-On LLM-Powered Dev Assistant, accessed on May 9, 2026, [[https://dev.to/livecodelife/roo-code-workflow-build-a-free-always-on-llm-powered-dev-assistant-5692]{.underline}](https://dev.to/livecodelife/roo-code-workflow-build-a-free-always-on-llm-powered-dev-assistant-5692)

24. SonarQube Agentic Analysis: The Safety Net for AI Coding Agents - YouTube, accessed on May 9, 2026, [[https://www.youtube.com/watch?v=UC2jQsSAPuE]{.underline}](https://www.youtube.com/watch?v=UC2jQsSAPuE)

25. Set Up AI Agent Monitoring \| Sentry for Connect, accessed on May 9, 2026, [[https://docs.sentry.io/platforms/javascript/guides/connect/ai-agent-monitoring/]{.underline}](https://docs.sentry.io/platforms/javascript/guides/connect/ai-agent-monitoring/)

26. Cookbook: Debugging & Monitoring Recipes - Sentry, accessed on May 9, 2026, [[https://sentry.io/cookbook/]{.underline}](https://sentry.io/cookbook/)

27. Using MCP in Roo Code, accessed on May 9, 2026, [[https://docs.roocode.com/features/mcp/using-mcp-in-roo]{.underline}](https://docs.roocode.com/features/mcp/using-mcp-in-roo)

28. GitHub - getsentry/sentry-mcp: An MCP server for interacting with Sentry via LLMs., accessed on May 9, 2026, [[https://github.com/getsentry/sentry-mcp]{.underline}](https://github.com/getsentry/sentry-mcp)

29. Sentry MCP Server, accessed on May 9, 2026, [[https://docs.sentry.io/ai/mcp/]{.underline}](https://docs.sentry.io/ai/mcp/)

30. Logs - Sentry Developer Documentation, accessed on May 9, 2026, [[https://develop.sentry.dev/sdk/telemetry/logs/]{.underline}](https://develop.sentry.dev/sdk/telemetry/logs/)

31. MCP Server \| SonarQube Server - Sonar Documentation, accessed on May 9, 2026, [[https://docs.sonarsource.com/sonarqube-server/ai-capabilities/sonarqube-mcp-server]{.underline}](https://docs.sonarsource.com/sonarqube-server/ai-capabilities/sonarqube-mcp-server)

32. MCP Server: Agentic Code Assurance for AI Agents - Sonar, accessed on May 9, 2026, [[https://www.sonarsource.com/products/sonarqube/mcp-server/]{.underline}](https://www.sonarsource.com/products/sonarqube/mcp-server/)

33. Tools \| SonarQube MCP server - Sonar Documentation, accessed on May 9, 2026, [[https://docs.sonarsource.com/sonarqube-mcp-server/using/tools]{.underline}](https://docs.sonarsource.com/sonarqube-mcp-server/using/tools)

34. Build your MCP Server \| SonarQube MCP server - Sonar Documentation, accessed on May 9, 2026, [[https://docs.sonarsource.com/sonarqube-mcp-server/build-and-configure/build]{.underline}](https://docs.sonarsource.com/sonarqube-mcp-server/build-and-configure/build)

35. SonarQube AI Remediation Agent & Closed Loop Verification \| Sonar, accessed on May 9, 2026, [[https://www.sonarsource.com/products/sonarqube/remediation-agent/]{.underline}](https://www.sonarsource.com/products/sonarqube/remediation-agent/)
