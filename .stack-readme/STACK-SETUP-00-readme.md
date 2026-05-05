*STACK-SETUP-00-readme.md*
# (DRAFT)
# Use the `STACK-SETUP-[step]-[name].md` files to help build your environment

---

 - [STACK SETUP README (this document)](./STACK-SETUP-00-readme.md)
 - [Step 1: Environment Setup (Arch-Headless-WSL & IDE)](./STACK-SETUP-01-ENV.md)
 - [Step 2: LM Studio, MCP Configuration, and Dual-Brain Setup](./STACK-SETUP-02-LMStudio-MCP.md)
 - [Step 3: Workflow Operations and Git Tooling](./STACK-SETUP-03-Workflow-Git.md)
 - [Appendix A: Custom MCP Server Configurations (LM Studio)](./STACK-SETUP-A-MCP-config.md)
 - [Appendix B: Installing Sentinel on Arch WSL](./STACK-SETUP-B-Sentinel.md)
 - [Appendix C: Installing SonarQube on Arch WSL](./STACK-SETUP-C-SonarQube.md)

---

# Suggested Reading and Official Resources

To fully master and troubleshoot this AI-agentic development stack, it is highly recommended to familiarize yourself with the official documentation of the underlying technologies and project-specific guides.

Below is a curated list of reference links categorized by their role in your environment.

## 1. Environment & Operating System
* **[Windows Subsystem for Linux (WSL) Documentation](https://learn.microsoft.com/en-us/windows/wsl/)**: Microsoft's official guide on WSL architecture, network bridging (crucial for LM Studio API access), and resource configuration (`.wslconfig`).
* **[Arch Linux Wiki](https://wiki.archlinux.org/)**: The definitive resource for Arch Linux package management (`pacman`), system configuration, and user permissions.
* **[ArchWSL GitHub Repository](https://github.com/yuk7/ArchWSL)**: The community project used to run Arch Linux on WSL. Check here for specific WSL-to-Arch integration issues.

## 2. AI Inference & Orchestration
* **[LM Studio Documentation](https://lmstudio.ai/docs)**: Guides on local server configuration, CORS settings, GPU offloading, and handling API requests across the WSL boundary on port 1234.
* **[Model Context Protocol (MCP) Specification](https://modelcontextprotocol.io/)**: The standard for connecting AI models to external tools. Essential for building custom `mcp-server.ts` scripts that execute inside Arch via `wsl.exe`.
* **[Roo Code (Roo-Cline) GitHub](https://github.com/RooVetGit/Roo-Cline)**: Useful for understanding the Dual-Brain architecture (Draft vs. Main model), auto-approval settings, and prompt engineering.

## 3. Runtimes & Workflow Tooling
* **[Bun Documentation](https://bun.sh/docs)**: The incredibly fast JavaScript/TypeScript runtime used in this stack for dependency management, the validation sequence, and script execution.
* **[Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0/)**: The standard format AI models must use when executing autonomous git operations to ensure a clean project history.

## 4. Security, Analysis & Containerization
* **[Docker Documentation](https://docs.docker.com/)**: Official guides for managing Docker daemon and containers within the Arch Linux environment.
* **[SonarQube Official Documentation](https://docs.sonarsource.com/sonarqube/latest/)**: Comprehensive guides on static code analysis. Note that in this project, SonarQube is strictly mapped to port 9001 to prevent conflicts.
* **[SonarLint for VSCode](https://docs.sonarsource.com/sonarlint/vs-code/)**: Instructions for binding your local IDE to your Dockerized SonarQube backend on localhost:9001 for real-time error highlighting.
* **[Axway Sentinel Documentation](https://docs.axway.com/)**: Official portal for configuring and managing Sentinel instances in Dockerized environments. Sentinel must remain on port 9000.

## 5. AFNM Modding & Project Architecture
* **[AFNM Mod Builder README](../Mod-Builder-README.md)**: The foundational guide for the Auspicious-Days scaffold, detailing the required workflow and validation sequence (e.g. bun run release:validate).
* **[Supplementary Guide](../SUPPLEMENTARY_GUIDE.md)**: The definitive strategy guide outlining architectural choices, AFNM runtime truths, and the ModAPI fallback ladder.
* **[ModAPI Quick Reference](../docs/reference/MODAPI_QUICK_REFERENCE.md)**: The cheat sheet for every available hook, action, and utility in the live game runtime.

---

Developed by the Auspicious-Days Contributor Circle.