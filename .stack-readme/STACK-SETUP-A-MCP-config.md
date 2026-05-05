*STACK-SETUP-A-MCP-config*
# (DRAFT)
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

# Example: Arch-Bridged `mcp-server.ts`
This is an example of a custom MCP server written in TypeScript. It is designed to be executed by Bun inside your Arch WSL environment via LM Studio's `wsl.exe` bridge. 
This specific server exposes a tool called `get_arch_system_info`, which runs native Linux commands (`uname` and `free`) to prove the AI is interacting directly with the Arch environment.
## 1. Install Dependencies
Before running the server, you need to install the official MCP SDK inside your Arch WSL project directory:
```bash
cd ~/ai-workflow
bun add @modelcontextprotocol/sdk
```
## 2. Create `mcp-server.ts`
Create a file named `mcp-server.ts` in your project root (e.g. `~/ai-workflow/mcp-server.ts`) and paste the following code:

```TypeScript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Initialize the MCP Server
const server = new Server(
  {
    name: "arch-wsl-tools",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define the available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_arch_system_info",
        description: "Retrieves OS and memory metrics directly from the Arch Linux WSL environment.",
        inputSchema: {
          type: "object",
          properties: {}, // No inputs required for this specific tool
        },
      },
    ],
  };
});

// Handle tool execution requests from the AI Model
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_arch_system_info") {
    try {
      // Execute native Arch Linux commands
      const { stdout } = await execAsync("uname -sr && free -m");
      
      return {
        content: [
          {
            type: "text",
            text: `Arch WSL System Info:\n${stdout}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Command failed: ${String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }
  
  throw new Error(`Tool not recognized: ${request.params.name}`);
});

// Start the server using stdio transport (required for LM Studio/WSL integration)
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Note: All logging must use console.error when using stdio transport, 
  // because console.log would corrupt the JSON-RPC communication channel.
  console.error("Arch WSL MCP Server is actively listening on stdio.");
}

run().catch((error) => {
  console.error("Fatal error in MCP server:", error);
  process.exit(1);
});
```

## 3. How It Works with LM Studio
 - LM Studio (on Windows) reads your mcp.json configuration.
 - It executes: `wsl.exe -d archlinux -- /home/aiuser/.bun/bin/bun run /home/aiuser/ai-workflow/mcp-server.ts`
 - The AI model decides to use the `get_arch_system_info` tool.
 - LM Studio sends a JSON-RPC request over `stdin` through the WSL bridge.
 - The Bun script intercepts the request, runs the native Linux `uname` and `free` commands, and sends the result back over `stdout`.
 - The model reads the output and formulates a response for you.

---
 - [STACK SETUP README](/.STACK-SETUP-00-readme.md)
 - [Step 1: Environment Setup (Arch-Headless-WSL & IDE)](./STACK-SETUP-01-ENV.md)
 - [Step 2: LM Studio, MCP Configuration, and Dual-Brain Setup](./STACK-SETUP-02-LMStudio-MCP.md)
 - [Step 3: Workflow Operations and Git Tooling](./STACK-SETUP-03-Workflow-Git.md)
 - ### [Appendix A: Custom MCP Server Configurations (LM Studio)](./STACK-SETUP-A-MCP-config.md)
 - [Appendix B: Installing Sentry on Arch WSL](./STACK-SETUP-B-Sentry.md)
 - [Appendix C: Installing SonarQube on Arch WSL](./STACK-SETUP-C-SonarQube.md)nfig.md)
---
Developed by the Auspicious-Days Contributor Circle.
