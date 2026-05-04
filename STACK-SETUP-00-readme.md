*STACK-SETUP-00-readme.md*
# (DRAFT)
# Use the `STACK-SETUP-[step]-[name].md` files to help build your environment

---

 - [Step 1: Environment Setup (Arch-Headless-WSL & IDE)](./STACK-SETUP-01-ENV.md)
 - [Step 2: LM Studio, MCP Configuration, and Dual-Brain Setup](./STACK-SETUP-02-LMStudio-MCP.md)
 - [Step 3: Workflow Operations and Git Tooling](./STACK-SETUP-03-Workflow-Git.md)
 - [Appendix A: Custom MCP Server Configurations (LM Studio)](./STACK-SETUP-A-MCP-config.md)
 - [Appendix B: Installing Sentinel on Arch WSL](./STACK-SETUP-B-Sentinel.md)
 - [Appendix C: Installing SonarQube on Arch WSL](./STACK-SETUP-C-SonarQube.md)

---

# Suggested Reading and Official Resources

To fully master and troubleshoot this AI-agentic development stack, it is highly recommended to familiarize yourself with the official documentation of the underlying technologies. 

Below is a curated list of reference links categorized by their role in your environment.

## 1. Environment & Operating System
*   **[Windows Subsystem for Linux (WSL) Documentation](https://learn.microsoft.com/en-us/windows/wsl/)**: Microsoft's official guide on WSL architecture, network bridging, and resource configuration (`.wslconfig`).
*   **[Arch Linux Wiki](https://wiki.archlinux.org/)**: The definitive resource for Arch Linux package management (`pacman`), system configuration, and user permissions.
*   **[ArchWSL GitHub Repository](https://github.com/yuk7/ArchWSL)**: The community project used to run Arch Linux on WSL. Check here for specific WSL-to-Arch integration issues.

## 2. AI Inference & Orchestration
*   **[LM Studio Documentation](https://lmstudio.ai/docs)**: Guides on local server configuration, CORS settings, GPU offloading, and handling OpenAI-compatible API requests.
*   **[Model Context Protocol (MCP) Specification](https://modelcontextprotocol.io/)**: The official standard for connecting AI models to external tools, file systems, and APIs. Essential for building custom `mcp-server.ts` scripts.
*   **[Roo Code (Roo-Cline) GitHub](https://github.com/RooVetGit/Roo-Cline)**: The official repository for the Roo Code VSCode extension. Useful for understanding the "Dual-Brain" architecture, auto-approval settings, and prompt engineering for the orchestrator.

## 3. Runtimes & Workflow Tooling
*   **[Bun Documentation](https://bun.sh/docs)**: The incredibly fast JavaScript/TypeScript runtime used in this stack. Covers dependency management, script execution, and test running.
*   **[Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0/)**: The standard format your AI models should use when executing autonomous `git commit` commands to ensure a clean, machine-readable project history.

## 4. Security, Analysis & Containerization
*   **[Docker Documentation](https://docs.docker.com/)**: Official guides for managing Docker daemon, containers, and `docker-compose` networks within a Linux environment.
*   **[SonarQube Official Documentation](https://docs.sonarsource.com/sonarqube/latest/)**: Comprehensive guides on static code analysis, quality gates, and configuring the `sonar-project.properties` file.
*   **[SonarLint for VSCode](https://docs.sonarsource.com/sonarlint/vs-code/)**: Instructions for binding your local IDE to your Dockerized SonarQube backend for real-time error highlighting.
*   **[Axway Sentinel Documentation](https://docs.axway.com/)**: Official Axway portal for configuring, deploying, and managing Sentinel instances in Dockerized and air-gapped environments.
extension.

---
   
Developed by the Auspicious-Days Contributor Circle.
