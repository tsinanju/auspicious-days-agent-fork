# System Prompt Optimization
### BLUF: To support both CLI commands and API calls with strict token authentication across an Arch Linux WSL boundary, the most secure method is to inject the tokens as environment variables directly into the MCP execution block.
 - This ensures the CLIs authenticate automatically, and it allows the LLM to make authenticated API calls (via curl or fetch) using the environment variables without the LLM needing to know or print the actual plaintext tokens in your chat history.
 - Here is exactly how to structure the mcp.json to handle this dual-interface, highly-authenticated Arch Linux setup.
---
### To make sure Roo Code understands this complex network architecture, you should add a brief rule to your Custom Instructions/System Prompt for the project.
 - Something like this ensures the model prioritizes JSON formatting and uses the tokens correctly:
```json
{
  "mcpServers": {
    "command-execution-suite": {
      "command": "npx",
      "args": [
        "-y",
        "@smithery/cli@latest",
        "run",
        "@modelcontextprotocol/server-command-execution"
      ],
      "env": {
        "ALLOWED_COMMANDS": "sonar,sentry-cli,curl,wsl,docker,npm,tsc,git",
        
        "SONAR_HOST_URL": "http://localhost:9001",
        "SONAR_TOKEN": "<REDACTED_SONAR_TOKEN>",
        
        "SENTRY_URL": "http://localhost:9000/",
        "SENTRY_AUTH_TOKEN": "<REDACTED_SENTRY_TOKEN>",
        "SENTRY_ORG": "<YOUR_ORG_SLUG>",
        "SENTRY_PROJECT": "<YOUR_PROJECT_SLUG>"
      }
    },
    "local-fetch-api": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
```
---
### To make sure Roo Code understands this complex network architecture, you should add a brief rule to your Custom Instructions/System Prompt for the project.
 - Something like this ensures the model prioritizes JSON formatting and uses the tokens correctly:
> ### TypeScript Strictness Rules
> You are operating in a "Maximum Strictness" TypeScript environment (ES2022, NodeNext). You MUST adhere to the following rules to prevent compilation errors:
>
> 1. **Unchecked Indexed Access**: `noUncheckedIndexedAccess` is TRUE. Array and Record lookups return `T | undefined`. You MUST check for undefined or use optional chaining before accessing properties of an indexed item.
> 2. **Index Signatures**: `noPropertyAccessFromIndexSignature` is TRUE. You MUST use bracket notation (e.g., `myRecord['dynamicKey']`) instead of dot notation for index signatures.
> 3. **Optional Properties**: `exactOptionalPropertyTypes` is TRUE. Do not explicitly assign `undefined` to optional properties. Omit the key entirely if it has no value.
> 4. **No Dead Code**: `noUnusedLocals`, `noUnusedParameters`, and `noImplicitReturns` are TRUE. Clean up all unused imports and variables before finishing a task. All code paths must return a value.
> 5. **Typing**: `noImplicitAny` is TRUE. Never use `any`. Use precise types, `unknown`, or generic constraints.
data structures in strict `JSON`."
---
### How the LLM Uses This Setup (CLI vs. API)
- Because both tools are running on Arch Linux via WSL, but your MCP server is running via Windows `npx`, the AI now has two distinct, secure pathways to interact with the databases and logs.

| Interaction Type | Tool Used | How the Authentication Works | Example AI Prompt / Action |
|:---|:---|:---|:---|
| **Sonar CLI** | `run_command` | The CLI automatically reads `SONAR_TOKEN` and `SONAR_HOST_URL` from the environment. | *"Run `sonar verify --file index.ts` to check for bugs."* |
| **Sentry CLI** | `run_command` | The CLI automatically reads `SENTRY_AUTH_TOKEN` and the URL/Org mapping from the environment. | *"Run `sentry-cli code-mappings upload mappings.json`."* |
| **Sentry API (Secure)** | `run_command` (via `curl`) | The AI uses the `$SENTRY_AUTH_TOKEN` environment variable inside the `curl` command. The actual secret is never printed. | *"Run `curl -H \"Authorization: Bearer $SENTRY_AUTH_TOKEN\" http://localhost:9000/api/0/projects/org/proj/issues/` to read the latest crashes."* |
| **Cross-Platform Arch** | `run_command` (via `wsl`) | If a command must run *natively* inside Arch rather than through the Windows CLI bridge. | *"Run `wsl -d archlinux docker logs sentry-web` to check the database status."* |
---
Developed by the Auspicious-Days Contributor Circle.
