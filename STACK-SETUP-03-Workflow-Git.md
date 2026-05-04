*STACK-SETUP-03-Workflow-Git.md*
# (DRAFT) Step 3: Workflow Operations and Git Tooling (DRAFT)
  *Initialize Roo Code: Open the Roo Code extension sidebar in VSCode and verify that it successfully connects to the LM Studio API endpoint.*

## 1.0 - Daily Startup Routine

Whenever you begin a development session, follow these steps to initialize the environment:
 - 1.1 -  **Start LM Studio:** Open LM Studio on your Windows host and start the Local Server. Ensure both your Main and Draft models are loaded into memory.
 - 1.2 -  **Launch the Arch WSL Environment:** Open PowerShell and type `Arch.exe`, or launch your WSL profile from Windows Terminal.
 - 1.3 **Open the Project in VSCode:**

   ```bash
   cd ~/ai-workflow
   code .
   ```
   
## 2.0 - Agentic Workflow with Roo Code
  Roo Code is designed to operate semi-autonomously using the "Dual-Brain" architecture set up in Step 2.
 - **Task Delegation:** When you assign a task (e.g., "Refactor the authentication module"), Roo Code uses the Draft/Tool model to read files, search the codebase, and plan the architecture.
 - **Code Generation:** Once the plan is established, Roo Code seamlessly switches to the Main model to generate the complex logic.
 - **Execution & Testing:** Roo Code will use its terminal permissions to run bun scripts (like bun run build or bun test) to verify its own work.

## 3.0 - Git Tooling and Version Control
  Because an AI agent can write code rapidly, strict version control practices are required to track changes and easily revert if the model hallucinates or breaks functionality.

### 3.1 - Branching Strategy

 ```bash
 git checkout -b feature/auth-refactor
 ```

### 3.2 - Autonomous Commits (Use Carefully, or require approval)
  Roo Code can be configured to commit its own changes upon completing a sub-task. It will use the Conventional Commits standard 
  (e.g., feat: update login validation, fix: resolve type error in user schema).
 - **Review Prompt:** It is highly recommended to leave Roo Code's "Require approval for terminal commands" setting enabled for git commit and git push operations so you can review the diffs before they are permanently recorded.

### 3.3 - Reverting AI Mistakes

  ```bash
  # Discard all unstaged changes made by the AI
  git restore .

  # Or, reset the branch to the last known good commit
  git reset --hard HEAD~1
  ```

## 4.0 - Project Management With Bun
Your Arch WSL environment is equipped with bun, an ultra-fast all-in-one JavaScript runtime. When instructing Roo Code to manage dependencies or run scripts, ensure it uses bun instead of npm or yarn.
 - Install dependencies: bun install
 - Run scripts: bun run <script-name>
 - Execute TypeScript files directly: bun run index.ts

---
[Step 1: Environment Setup (Arch-Headless-WSL & IDE)](./STACK-SETUP-01-ENV.md)
[Step 2: LM Studio, MCP Configuration, and Dual-Brain Setup](/.STACK-SETUP-02-LMStudio-MCP.md)
[Step 3: STACK-SETUP-03-Workflow-Git.md](./STACK-SETUP-03-Workflow-Git.md)
[Appendix A: Supplementary Guide: Custom MCP Server Configurations (LM Studio)](./STACK-SETUP-A-MCP-config.md)
---
Developed by the Auspicious-Days Contributor Circle.
