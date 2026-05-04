*STACK-SETUP-C-SonarQube.md*
# (DRAFT)
# Appendix C: Installing SonarQube via Docker on Arch WSL
Integrating SonarQube into your AI-agentic stack provides an excellent automated safety net. While Roo Code and your local LLMs write the code, SonarQube acts as a strict static analyzer to instantly catch hallucinations, code smells, and security vulnerabilities before they are merged.
Using Docker is the cleanest way to run SonarQube, as it isolates the Java environment and dependencies from your core development tools.

## 1.0 - System Preparation

SonarQube uses an embedded Elasticsearch instance, which requires a higher virtual memory allocation than WSL provides by default. This requirement applies even when running it inside a Docker container.
Open your Arch WSL terminal and temporarily increase the memory map limit:

```bash
sudo sysctl -w vm.max_map_count=2621444
```
> [!NOTE]
> To make this persistent across WSL reboots, create a configuration file:
> `echo "vm.max_map_count=262144" | sudo tee /etc/sysctl.d/99-sonarqube.conf`

## 2.0 - Install Docker and Docker Compose
Install the Docker engine and Docker Compose plugin using the Arch package manager.

```bash
# Install Docker and Docker Compose
sudo pacman -S docker docker-compose

# Enable and start the Docker service
sudo systemctl enable --now docker

# Add your user to the docker group to run commands without sudo
sudo usermod -aG docker aiuser
```

> [!NOTE]
> Running `systemctl` requires systemd to be enabled in WSL2. If you encounter an error, ensure you have `systemd=true` under the `[boot]` section of `/etc/wsl.conf` and restart WSL.
> (Log out and back in, or run `newgrp docker`, for the group changes to take effect).

## 3.0 - Deploying SonarQube
We will use a `docker-compose.yml` file to define the SonarQube service and mount persistent volumes so your scanning data survives container restarts.
Create a directory for your SonarQube deployment:
```bash
mkdir -p ~/sonarqube
cd ~/sonarqube
```
Create a docker-compose.yml file:
`nano docker-compose.yml`
Paste the following configuration:
```yaml
services:
  sonarqube:
    image: sonarqube:community
    container_name: sonarqube
    ports:
      - "9001:9000" # Mapped to 9001 on the host to avoid Sentinel conflict
    environment:
      - SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_extensions:/opt/sonarqube/extensions
      - sonarqube_logs:/opt/sonarqube/logs
    restart: unless-stopped

volumes:
  sonarqube_data:
  sonarqube_extensions:
  sonarqube_logs:
```
Start the SonarQube container in detached mode
```bash
docker-compose up -d
```
You can monitor the startup logs to see when it becomes fully operational:
```bash
docker logs -f sonarqube
```

## 4.0 Connecting VSCode (SonarLint)

Once the Docker container logs indicate SonarQube is "up and running", it will be accessible on port `9001`. Because of the WSL internal network bridge, your Windows host can access this locally.
Open your web browser on Windows and navigate to `http://localhost:9001 `.
Log in with the default credentials (Username: `admin`, Password: `admin`) and follow the prompts to change your password.
In VSCode, open the Extensions panel (`Ctrl+Shift+X`) and install SonarLint.
Open the VSCode Command Palette (`Ctrl+Shift+P`), type SonarLint: Connect to SonarQube, and follow the prompts to bind your local project to the server running at `http://localhost:9001`.
Now, as Roo Code generates TypeScript files via your local LM Studio models, SonarLint will highlight issues in real-time right inside your VSCode editor, powered by the local, containerized SonarQube backend.

## 5.0 # Running a Local SonarQube Scan (VSCode Terminal)

Once your SonarQube instance is running on `localhost:9001`, you can trigger manual scans directly from your VSCode integrated terminal. This is useful for testing specific scripts, such as `/src/test.ts`, before setting up automated scanning or `sonar-project.properties` files.

### 5.1 - Generate a SonarQube Token

Before scanning, you need an authentication token from your local SonarQube server.
 - 1. Navigate to `http://localhost:9001` in your Windows browser.
 - 2. Log in (default is usually `admin` / `admin`).
 - 3. Click your profile icon (top right) > **My Account** > **Security**.
 - 4. Generate a new User Token (e.g., named `local-terminal-scan`) and copy the generated string.

### 5.2 - Install the SonarScanner CLI

Since our stack utilizes `bun` as the primary runtime, the easiest way to run the scanner for a TypeScript project is by installing the NPM-based SonarQube scanner globally.
Run the following command in your VSCode terminal (connected to Arch WSL):

```bash
bun add -g sonarqube-scanner
```

### 5.3 - Execute the scan on a specific File
You can run a scan targeting just your test script by passing the configuration arguments inline.
In your VSCode terminal, ensure you are in the root of your project (e.g. `~/ai-workflow`), then run the following command. Replace `YOUR_GENERATED_TOKEN` with the token you copied in Step 1.

```bash
sonar-scanner \
  -Dsonar.projectKey=local-ai-workflow \
  -Dsonar.sources=src/test.ts \
  -Dsonar.host.url=http://localhost:9001 \
  -Dsonar.token=YOUR_GENERATED_TOKEN
```
Explanation of Flags:
`-Dsonar.projectKey`: A unique identifier for your project. If it doesn't exist yet, SonarQube will automatically create the dashboard for it during the scan.
`-Dsonar.sources`: Restricts the analysis to the specific file or directory you want to test (e.g. `src/test.ts`). To scan the whole project later, you would use `.`
`-Dsonar.host.url`: Points the scanner to your local Dockerized SonarQube instance running on port 9001.
`-Dsonar.token`: Authenticates the scanner with the server.

### 5.4 Review the Results
Once the execution completes, the terminal will output an `EXECUTION SUCCESS` message along with a direct URL to the analysis report.
`Ctrl+Click` (or `Cmd+Click`) the link in the VSCode terminal to open it in your Windows browser and review the static analysis, code smells, or vulnerabilities detected in your `test.ts` file.

## 6.0 - Configuring a Full Project Scan (`sonar-project.properties`)
### 6.1 - Create the Configuration File

Ensure you are in the root directory of your project (e.g. `~/ai-workflow`) inside your Arch WSL terminal, and create the file:
```bash
touch sonar-project.properties
```
### 6.2 - Define the Properties
```properties
# Example Properties Configuration
# Required Metadata
sonar.projectKey=ai-workflow-local
sonar.projectName=AI Workflow Stack
sonar.projectVersion=1.0

# Point to your local SonarQube instance (Port 9001 to avoid Sentinel conflict)
sonar.host.url=http://localhost:9001

# Path to your source code directory
sonar.sources=src

# Explicitly exclude dependencies, compiled output, and test files from the main analysis
sonar.exclusions=node_modules/**, dist/**, build/**, **/*.test.ts, **/*.spec.ts

# Language and Encoding
sonar.sourceEncoding=UTF-8

# (Optional) If you have a separate folder for tests, uncomment and define it here:
# sonar.tests=tests
# sonar.test.inclusions=**/*.test.ts, **/*.spec.ts
```
> [!NOTE]
> Security Best Practice: Never hardcode your `sonar.token` inside the `sonar-project.properties` file, especially since this file will be tracked by Git. Always pass the token dynamically at runtime.

### 6.3 - Execute the Full Project Scan
With the configuration file in place, the `sonar-scanner` command no longer needs long inline arguments for paths and project keys. It will automatically detect the `sonar-project.properties` file in the directory it is run from.
Run the following command in your VSCode terminal, replacing the placeholder with your actual User Token generated in the previous step:
```bash
sonar-scanner -Dsonar.token=YOUR_GENERATED_TOKEN
```

### 6.4 Autamating with Bun (Optional)
To make this workflow even smoother, you can add the scan command to your project's `package.json` (which `bun` fully supports).
Open your `package.json` and add a script entry:
```json
  "scripts": {
    "scan": "sonar-scanner -Dsonar.token=$SONAR_TOKEN"
  }
```
Now, as long as you have exported your token to your Arch environment variables (`export SONAR_TOKEN="your_token_here"`), you can run a full project scan at any time by simply typing:
```bash
bun run scan
```

## A - Sonar Qube Resources
 - [SonarQube Official Documentation](https://docs.sonarsource.com/) - Main landing page for all SonarQube guides and references.
 - [Server Installation and Setup From Docker Image](https://docs.sonarsource.com/sonarqube-server/server-installation/from-docker-image) - Detailed breakdown of Docker-specific environment variables and volume mappings.
 - [SonarQube for IDE](https://docs.sonarsource.com/sonarqube-for-vs-code) - Guides on configuring rule sets, bindings, and troubleshooting the IDE extension.

---

 - [Step 1: Environment Setup (Arch-Headless-WSL & IDE)](./STACK-SETUP-01-ENV.md)
 - [Step 2: LM Studio, MCP Configuration, and Dual-Brain Setup](./STACK-SETUP-02-LMStudio-MCP.md)
 - [Step 3: Workflow Operations and Git Tooling](./STACK-SETUP-03-Workflow-Git.md)
 - [Appendix A: Custom MCP Server Configurations (LM Studio)](./STACK-SETUP-A-MCP-config.md)
 - [Appendix B: Installing Sentinel on Arch WSL](./STACK-SETUP-B-Sentinel.md)
 - [Appendix C: Installing SonarQube on Arch WSL](./STACK-SETUP-C-SonarQube.md)

---

Developed by the Auspicious-Days Contributor Circle.
