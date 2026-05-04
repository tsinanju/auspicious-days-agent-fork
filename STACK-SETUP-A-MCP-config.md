**STACK-SETUP-A-MCP-config**
# Appendix A: Supplementary Guide: Custom MCP Server Configurations (LM Studio)
 - The Model Context Protocol (MCP) enables your local models to securely interact with external tools, APIs, and the local file system. In this architecture, MCP configuration is handled directly within **LM Studio** on the Windows host, rather than inside the VSCode extension. This centralized approach allows any connected client (like Roo Code) to access the same toolset.

## 1.0 - Locating the MCP Configuration in LM Studio
**LM Studio manages MCP servers via its built-in developer tools.**
 - 1.1 - Open **LM Studio** on your Windows host.
 - 1.2 - Navigate to the **Developer** tab or the dedicated **MCP** section in the left sidebar.
 - 1.3 - Look for the option to **Add New MCP Server** or edit the raw MCP configuration file (typically `mcp_settings.json` or managed via the UI).

## 2.0 - Generalized Configuration Structure (Stdio)
Because LM Studio is running on Windows, but your development environment is in Arch WSL, you have two main approaches for configuring local (stdio) tools: Host-Level Tools and WSL-Bridged Tools.

### Option A: Standard Host-Level MCP
If the tool runs directly on your Windows host (e.g., a standard Node.js/Bun MCP server installed on Windows):

```json
{
  "mcpServers": {
    "github-integration": {
      "command": "npx.cmd",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your_token_here"
      }
    }
  }
}
```

### Option B: Bridging MCP to Arch WSL (Advanced)
If you want LM Studio to execute tools specifically inside your headless Arch Linux environment, you must use the Windows wsl.exe command to pass instructions across the boundary.

```json
{
  "mcpServers": {
    "arch-system-tools": {
      "command": "wsl.exe",
      "args": [
        "-d",
        "archlinux",
        "--",
        "/home/aiuser/.bun/bin/bun",
        "run",
        "/home/aiuser/ai-workflow/mcp-server.ts"
      ],
      "env": {
        "CUSTOM_ENV_VAR": "value"
      }
    }
  }
}
```

## 3.0 - Best Practices for LM Studio MCP Integration
- **Use Windows Executable Extensions:** When calling runtimes installed on Windows (like Node or Bun), ensure you use the .cmd or .exe extension (e.g., npx.cmd instead of npx), as LM Studio uses Windows standard input/output.
 - **Absolute Paths:** Always use absolute paths for scripts, especially when passing arguments through wsl.exe into the Linux environment.
 - **Model Tool Support:** Not all local models handle function-calling and MCP well. Ensure your designated Draft/Reasoning Model (configured in Step 2) is specifically fine-tuned for tool use (e.g., Qwen-2.5-Coder or specific Instruct/Tool models).

## 4.0 - Validating the Tool Connection
 - Save your MCP configuration and ensure the servers show as "Connected" or "Active" in the LM Studio UI.
 - Start the LM Studio Local Server (ensure the port is exposed to 0.0.0.0 as done in Step 2).
 - Open Roo Code in VSCode (inside WSL).
 - Because Roo Code connects to LM Studio via the OpenAI-compatible API, LM Studio will automatically expose the configured MCP tools to Roo Code.
 - In the Roo Code chat, ask: What tools do you currently have access to? The model should list the tools you just configured in LM Studio.

---
[Step 2: LM Studio, MCP Configuration, and Dual-Brain Setup](./step-2-lmstudio-mcp.md)
[Appendix A: Supplementary Guide: Custom MCP Server Configurations (LM Studio)](./STACK-SETUP-A-MCP-config.md)
---
Developed by the Auspicious-Days Contributor Circle.
