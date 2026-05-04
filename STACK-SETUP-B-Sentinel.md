*STACK-SETUP-B-Sentinel.md*
# (DRAFT)
# Appendix B: Setting Up Sentinel (Air-Gapped Docker Installation)
This guide covers the installation and configuration of the Axway Sentinel Docker image in an offline/air-gapped environment. This assumes you have already downloaded the official Docker deployment package from the Axway Repository or Support Site.

> [!IMPORTANT]
> **Port Allocation Warning:** Sentinel services commonly utilize port `9000`. If you are proceeding to the SonarQube installation after this, you **must** ensure SonarQube is mapped to port `9001` (as outlined in Appendix B) to prevent port collisions on your Windows host.

## 1.0 Prerequisites & System Preparation

Before proceeding with the deployment, you must create a dedicated user for Sentinel to ensure proper file permissions inside and outside the container.

Inside your Arch WSL terminal, create the `sentinel` user with the specific UID and GID of `1001`:

```bash
# Create the sentinel group and user
sudo groupadd -g 1001 sentinel
sudo useradd -u 1001 -g 1001 -m -s /bin/bash sentinel
```

## 2.0 Unpack and Set Permissions
Extract your downloaded Sentinel Docker deployment package into your project directory.
Before starting the container, you must grant the `sentinel` user ownership of the mounted volumes to prevent permission denied errors, and clear out any residual buffer data.
```bash
cd ~/path/to/sentinel-deployment

# Grant recursive ownership to the sentinel UID/GID
sudo chown -R 1001:1001 mounts/

# Verify the directory contents and permissions
ls -ltra
```
(Note: Ensure that the buffer and broadcast directories within the `samples/mount` folder are cleared to avoid conflicts from residual data).

## 3.0 Configure the Environment (`.env`)
The `.env` file at the root of the deployment directory contains crucial parameters for the database, image tags, and networking.

Open the `.env` file and configure it for your local environment:
```env
# Docker Image Configuration
IMAGE_NAME=sentinel-docker-snapshot.artifactory-ptx.ecd.axway.int/sentinel
IMAGE_TAG=Sentinel_4.2.0_SP36_allOS_BNXXXXX  # Update with your specific version

# Database Configuration
SNTL_DB_TYPE="DB_TYPE"
SNTL_DB_HOST="DB_HOST"
SNTL_DB_PORT="DB_PORT"
SNTL_DB_NAME="DB_NAME"
SNTL_DB_USER="DB_USER"

# Server Configuration
SNTL_SERVER_RMI_NAME="localhost"
```

## 4.0 - Managing the Docker Container
With the permissions set and the .env file configured, you can use Docker Compose to manage the Sentinel lifecycle.

**Starting Sentinel**
To start Sentinel in detached mode (running in the background):
```bash
docker compose -f docker-compose.yml up -d
```

**Stopping Sentinel**
To gracefully stop the Sentinel services without destroying the container:
```bash
docker compose -f docker-compose.yml stop
```

**Removing the Container**
To completely stop and remove the container (useful when resetting the environment, but retains mounted volume data):
```bash
docker compose -f docker-compose.yml down
```

## 5.0 - Upgrading or Downgrading Sentinel
Because Sentinel is containerized, upgrading or downgrading simply involves changing the target image tag and recreating the container.
 - Stop and remove the current container:
```bash
docker compose -f docker-compose.yml down
```
 - Update the .env file:
   - Change the `IMAGE_TAG` variable to the new (or older) version you wish to deploy (e.g., `IMAGE_TAG=Sentinel_4.2.0_SPXX_allOS_BNXXXXX`).
 - Spin up the new version:

   ```bash
   docker compose -f docker-compose.yml up -d
   ```
Note: Rolling back from a Dockerized environment to a non-containerized standard installation requires manually exporting your data, reinstalling Sentinel via RPM/DEB, and restoring the configurations.

## 6.0 Official Documentation & Configuration Resources
For advanced configuration, troubleshooting, and volume management, refer to the official Axway and Docker documentation below.

### Axway Sentinel 
For advanced configuration, troubleshooting, and volume management, refer to the official Axway and Docker documentation below.

### Axway Sentinel 4.2.0 Guides
 - [All Sentinel 4.2.0 Documentation](https://docs.axway.com/search?labelkey=prod-sentinel-420&labelkey=ct-category&sort.field=title&sort.value=asc)**: Main search hub for all Sentinel 4.2.0 guides and release notes.
 - **[Installation Guide (PDF)](https://docs.axway.com/bundle/Sentinel_420_InstallationGuide_allOS_en_PDF)**: Full offline-friendly PDF of the installation guide.
 - **[Sentinel Normal Installation in Docker (.env Configuration)](https://docs.axway.com/bundle/Sentinel_420_InstallationGuide_allOS_en_HTML5/page/Content/InstallationGuide/docker/Sentinel_Normal_Installation_in_Docker.htm#Configuration)**: Detailed reference for all available `.env` configuration parameters.
 - **[Advanced Docker Customization Recommendations](https://docs.axway.com/bundle/Sentinel_420_InstallationGuide_allOS_en_HTML5/page/Content/InstallationGuide/docker/Docker_recommandations.htm)**: Best practices for tuning and customizing the Sentinel Docker image.
 - **[Volume Management in Docker Compose](https://docs.axway.com/bundle/Sentinel_420_InstallationGuide_allOS_en_HTML5/page/Content/InstallationGuide/docker/volume_management.htm)**: Instructions on how to properly persist, backup, and manage Sentinel data volumes.

### Docker Air-Gapped Resources
 - **[Air-Gapped Containers (Docker Docs)](https://docs.docker.com/enterprise/security/hardened-desktop/air-gapped-containers/)**: Official Docker documentation on managing and securing air-gapped container deployments.
iner deployments.
  
---

 - [Step 1: Environment Setup (Arch-Headless-WSL & IDE)](./STACK-SETUP-01-ENV.md)
 - [Step 2: LM Studio, MCP Configuration, and Dual-Brain Setup](./STACK-SETUP-02-LMStudio-MCP.md)
 - [Step 3: Workflow Operations and Git Tooling](./STACK-SETUP-03-Workflow-Git.md)
 - [Appendix A: Custom MCP Server Configurations (LM Studio)](./STACK-SETUP-A-MCP-config.md)
 - [Appendix B: Installing Sentinel on Arch WSL](./STACK-SETUP-B-Sentinel.md)
 - [Appendix C: Installing SonarQube on Arch WSL](./STACK-SETUP-C-SonarQube.md)

---

Developed by the Auspicious-Days Contributor Circle.
