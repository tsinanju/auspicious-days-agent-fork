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
