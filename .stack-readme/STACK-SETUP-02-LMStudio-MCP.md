*STACK-SETUP-02-LMStudio-MCP.md*
# (DRAFT)
# Step 2: LM Studio, MCP Configuration, and "Dual-Brain" Setup

This section covers configuring local LLM inference via LM Studio on your Windows host, setting up the Model Context Protocol (MCP), and establishing a "Dual-Brain" architecture in Roo Code.

## 1.0 LM Studio Installation & Server Setup

1.1. **Install LM Studio:** Download and install [LM Studio](https://lmstudio.ai/) on your Windows host system.
1.2. **Download Models:**
   * **Main Model (Heavy Lifter):** Search for and download a primary coding model that supports a large context window and strong coding capabilities (e.g., Llama 3, Qwen 2.5, DeepSeek Coder, or similar).
   * **Draft/Reasoning Model (Tool User):** Download a smaller, highly responsive model specifically tuned for function-calling, tool usage, and reasoning to handle rapid system tasks.
1.3. **Configure the Local Server:**
   * Navigate to the **Local Server** tab (server icon) in the left sidebar of LM Studio.
   * Ensure the **Port** is set (default is `1234`).
   * **Crucial for WSL:** Change the **Bind to** setting to `0.0.0.0` or your specific Windows network adapter IP to allow incoming connections from the WSL VM.
   * Enable **CORS** (Cross-Origin Resource Sharing).
   * Start the server.

> [!NOTE]
> You may get a Windows Firewall prompt when starting the server. You must allow access for LM Studio so it can communicate across the WSL internal network bridge.

## 2.0 Setting Context Parameters

To ensure the models can handle large repositories, codebase indexing, and complex reasoning traces, adjust the parameters in LM Studio's server settings before loading the models:

* **Context Length:** Adjust this to match your model's maximum supported context window (e.g., `8192`, `32768`, etc.) while keeping your hardware's available VRAM limits in mind.
* **GPU Offload:** Maximize the layers offloaded to your GPU (set to `Max` or input the highest layer count possible) for optimal inference speed.

## 3.0 Configuring Roo Code (Dual-Brain Architecture)

The "Dual-Brain" setup separates complex coding tasks from rapid tool execution and planning, optimizing your workflow and reducing compute overhead.

3.1. **Open Roo Code Settings:** In VSCode (running via WSL), open the Roo Code extension settings.
3.2. **Configure API Provider:** Set the API provider to `OpenAI Compatible`.
3.3. **Connect to Host (WSL Bridge):**
   * Use the Windows host IP identified in Step 1 (the `nameserver` from `/etc/resolv.conf`) for the Base URL.
   * Format: `http://<YOUR_WINDOWS_IP>:1234/v1`
3.4. **Assign Models:**
   * **Primary Model:** Enter the exact identifier for your main model (as displayed in the LM Studio local server console) into the main model input field.
   * **Tool/Draft Model:** Navigate to the advanced or draft model settings in Roo Code. Specify your smaller reasoning/tool-use model here to handle system commands and file reads quickly.

## 4.0 MCP (Model Context Protocol) Integration

MCP allows Roo Code to interface securely with external tools, scripts, and system resources within your Arch Linux environment.

3.1. **Initialize MCP:** Navigate to the MCP configuration section in Roo Code (managed via the sidebar or configuration file).
3.2. **Tool Permissions:** Ensure Roo Code is granted explicit permissions to execute terminal commands (`bash`), manage version control (`git`), and perform file operations using the models.
3.3. **Verify Connectivity:**
   * Open the Roo Code chat interface in VSCode.
   * Ask the assistant to execute a simple terminal command (e.g., `Please run 'pwd' and 'ls -la' in the terminal`).
   * Verify that the draft model successfully utilizes the terminal tool, reaches out to LM Studio over the WSL bridge, and returns the correct directory listing from your Arch filesystem.

> [!NOTE]
> 
> [MCP.json Example](./environment-examples/MCP.example.json)

---
 - [STACK SETUP README](./STACK-SETUP-00-readme.md)
 - [Step 1: Environment Setup (Arch-Headless-WSL & IDE)](./STACK-SETUP-01-ENV.md)
 - ### -> [Step 2: LM Studio, MCP Configuration, and Dual-Brain Setup](./STACK-SETUP-02-LMStudio-MCP.md)
 - [Step 3: Workflow Operations and Git Tooling](./STACK-SETUP-03-Workflow-Git.md)
 - [Appendix A: Custom MCP Server Configurations (LM Studio)](./STACK-SETUP-A-MCP-config.md)
 - [Appendix B: Installing Sentry on Arch WSL](./STACK-SETUP-B-Sentry.md)
 - [Appendix C: Installing SonarQube on Arch WSL](./STACK-SETUP-C-SonarQube.md)
---
Developed by the Auspicious-Days Contributor Circle.le.
