*STACK-SETUP-B-Sentry.md*
# (DRAFT)
# Appendix B: Installing Sentry on Arch WSL
 - Integrating a self-hosted Sentry instance into your AI-agentic stack allows Roo Code and your local LLMs to actively map stack traces, analyze mock crash reports, and maintain source context natively on your machine, without relying on external cloud services.
 - Because Sentry consists of multiple microservices, deploying it via Docker within your Arch WSL environment is the most reliable approach for an airgapped or local-only workflow.
---
## 1.0 - System Preparation
 - Sentry is a robust platform (utilizing Kafka, Redis, ClickHouse, and Postgres). It requires sufficient resources to run smoothly.
 - Ensure your `%USERPROFILE%\.wslconfig` file on your Windows host allocates enough memory to WSL (we recommend at least `memory=8GB` to `12GB`) before starting.
### Install the required Docker dependencies if you haven't already:
```bash
sudo pacman -S docker docker-compose
sudo systemctl enable --now docker
# (Recommended)
sudo usermod -aG docker aiuser
```
---
## 2.0 - Deploying Self-Hosted Sentry
 - Sentry provides an official self-hosted repository containing all necessary Docker Compose configurations and installation scripts.
 - Create a directory for the deployment and clone the repository:
```bash
mkdir -p ~/sentry-self-hosted
cd ~/sentry-self-hosted
git clone https://github.com/getsentry/self-hosted.git .
```
### Run the installation script. This will pull the required Docker images and set up the internal databases.
```bash
./install.sh
```
> [!NOTE]
> During the installation, you will be prompted to create an initial user account (email and password). Keep these credentials safe, as they will be your admin login.
> If you are not prompted for uname/pass, begin troubleshooting.
### Sentry will now be accessible from your Windows host browser at `http://localhost:9000`.
> [!NOTE]
> Both Sentry and Sonar's default port is 9000, to deconflict, Sonar will be configured on 9001 in Appendix C.
---
## 3.0 - Generating the Sentry Auth Token
 - To allow Roo Code and your MCP servers to interact with Sentry via CLI or API, you must generate an Organization Auth Token.
 - Navigate to `http://localhost:9000` in your Windows browser and log in.
 - Navigate to **Settings > Auth Tokens** (under your Organization or Developer settings).
 - Create a new token. Crucially, ensure it has the `org:ci` scope (this is required for uploading code mappings and debug files).
 - Copy this token. You will inject it into your `mcp.json` file as the `SENTRY_AUTH_TOKEN` environment variable.
---
## 4.0 - Installing the Sentry CLI
 - The sentry-cli tool is critical for your AI agent to push mock events, manage source context, and upload code mappings autonomously.
 - Run the following command in your Arch WSL terminal to install it:
```bash
curl -sL https://sentry.io/get-cli/ | bash
```
### 4.1 - Configuring the CLI ( `.sentryclirc` )
 - While our MCP environment variables handle authentication for Roo Code, it is best practice to also configure the CLI locally for your aiuser so you can run manual tests without typing out long URL flags.
 - Create a `~/.sentryclirc` file:
```bash
touch ~/.sentryclirc
nano ~/.sentryclirc
```
 - Add your Configuration:
```ini
# .sentryclirc
[defaults]
url = http://localhost:9000/
org = <YOUR_ORG_SLUG>
project = <YOUR_PROJECT_SLUG>

[auth]
token = <YOUR_GENERATED_TOKEN>
```
---
## 5.0 - Installing the SDK in your Project
 - While the `sentry-cli` handles source maps and configuration autonomously, your actual application (or mod) needs the Sentry SDK to capture and transmit runtime errors to your local lab.
 - Ensure you are using `bun` (the primary runtime for this stack) rather than `npm` to maintain dependency consistency.
 - Navigate to your project root in WSL and install the Node SDK:
```bash
bun add @sentry/node
```
 - You can now initialize Sentry in your index.ts or test files:
```TypeScript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: "http://<YOUR_KEY>@127.0.0.1:9000/1",
  tracesSampleRate: 1.0,
});
```
---
## 6.0 - Agentic Workflows (Code Mappings & Events)
 - With Sentry running on port `9000` and the CLI authenticated, your AI agent can now perform advanced debugging tasks natively.
### 6.1 - Uploading Code Mappings
 - Code mappings link stack trace paths to your local TypeScript source code paths, allowing Sentry to show the exact lines of code that caused a crash. Roo Code can manage this autonomously using a `mappings.json` file.
 - Example `mappings.json`:
```json
[
  {
    "stackRoot": "src/",
    "sourceRoot": "ai-workflow/src/"
  }
]
```
 - The AI can upload or update these mappings at any time by running:
```bash
sentry-cli code-mappings upload ./mappings.json
```
### 6.2 - Using a Mock Script for Event Verification 
 - If the AI writes a complex JSON payload or state modifier, it can generate a mock crash report and push it directly to Sentry to verify the data structure and ensure the code mappings are working.
```bash
sentry-cli send-event ./mock-crash.json
```
### 6.3 - Using Test Script for Event Verification
 - A test script has been provided in [/scripts/test-SentryCrashReport.ts](./scripts/test-SentryCrashReport.ts)
 - A try-catch-wrapped test script has been provided in [/scripts/test-SentryCrashReport-tryCatch.ts](/scripts/test-SentryCrashReport-tryCatch.ts)
```bash
bun run ./.stack-readme/scripts/[script-name].ts
```
---
## 7.0 - Testing an Agentic Tool Call with Sentry
 - Now that Sentry is running locally, your SDK is installed, and the MCP environment is configured, you can test if your AI agent (Roo Code) can autonomously interact with the Sentry API.
 - To verify that the "Dual-Brain" setup can trigger an error and validate it using secure tool calls, open the Roo Code chat interface and paste the following prompt:
> **Test Prompt for Roo Code:**
> "I have a test script at `test-SentryCrashReport.ts`. Please perform the following steps:
> 1. Use your terminal tool to execute the script using `bun run test-SentryCrashReport.ts`.
> 2. Once the script completes, use the `run_command` tool to execute a `curl` request to the local Sentry API to verify the event was logged. 
> 3. Use the `$SENTRY_AUTH_TOKEN` environment variable for the Bearer token. The endpoint to check is `http://localhost:9000/api/0/projects/<YOUR_ORG_SLUG>/<YOUR_PROJECT_SLUG>/events/`.
> 4. Read the JSON response and confirm if the 'Codestral Test' error was successfully recorded in the database."
### What to Expect:
 - **Execution:** The AI will use the **Terminal** tool to run the `bun` command and observe the intentional crash output.
 - **Tool Invocation:** It will use the **Command Execution** MCP tool to fire a secure `curl` request to your airgapped Sentry lab without exposing your plaintext token.
 - **Reasoning & Validation:** The model will parse the raw JSON response from Sentry and confidently report back that the error tracking loop is fully operational.
---
# A - Sentry Resources
 - [Sentry Self-Hosted Documentation](https://develop.sentry.dev/self-hosted/) - Official guide on the self-hosted Docker deployment architecture.
 - [Sentry CLI Documentation](https://docs.sentry.io/cli/) - Comprehensive reference for CLI commands, event sending, and code mappings.
---
 - [Step 1: Environment Setup (Arch-Headless-WSL & IDE)](./STACK-SETUP-01-ENV.md)
 - [Step 2: LM Studio, MCP Configuration, and Dual-Brain Setup](./STACK-SETUP-02-LMStudio-MCP.md)
 - [Step 3: Workflow Operations and Git Tooling](./STACK-SETUP-03-Workflow-Git.md)
 - [Appendix A: Custom MCP Server Configurations (LM Studio)](./STACK-SETUP-A-MCP-config.md)
 - ### -> [Appendix B: Installing Sentry on Arch WSL](./STACK-SETUP-B-Sentry.md)
 - [Appendix C: Installing SonarQube on Arch WSL](./STACK-SETUP-C-SonarQube.md)
---

Developed by the Auspicious-Days Contributor Circle.
