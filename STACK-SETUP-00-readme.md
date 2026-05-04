*STACK-SETUP-00-readme.md*
# (DRAFT)
# Use the `STACK-SETUP-[step]-[name].md` files to help build your environment

---

 - [Step 1: Environment Setup (Arch-Headless-WSL & IDE)](./STACK-SETUP-01-ENV.md)
 - [Step 2: LM Studio, MCP Configuration, and Dual-Brain Setup](./STACK-SETUP-02-LMStudio-MCP.md)
 - [Step 3: Workflow Operations and Git Tooling](./STACK-SETUP-03-Workflow-Git.md)
 - [Appendix A: Custom MCP Server Configurations (LM Studio)](./STACK-SETUP-A-MCP-config.md)
 - [Appendix B: Installing Sentinel on Arch WSL](./STACK-SETUP-B-Sentinel.md)
 - [Appendix C: Installing SonarQube on Arch WSL](./STACK-SETUP-C-SonarQube.md)

---

# Suggested Reading
## 01 ENV
## 02 LMStudio, MCP
## 03 Workflow, GIT
## A MCP Configuration

## B - Axway Sentinel 
For advanced configuration, troubleshooting, and volume management, refer to the official Axway and Docker documentation below.

### Axway Sentinel 4.2.0 (DOCKER)
 - [All Sentinel 4.2.0 Documentation](https://docs.axway.com/search?labelkey=prod-sentinel-420&labelkey=ct-category&sort.field=title&sort.value=asc)**: Main search hub for all Sentinel 4.2.0 guides and release notes.
 - **[Installation Guide (PDF)](https://docs.axway.com/bundle/Sentinel_420_InstallationGuide_allOS_en_PDF)**: Full offline-friendly PDF of the installation guide.
 - **[Sentinel Normal Installation in Docker (.env Configuration)](https://docs.axway.com/bundle/Sentinel_420_InstallationGuide_allOS_en_HTML5/page/Content/InstallationGuide/docker/Sentinel_Normal_Installation_in_Docker.htm#Configuration)**: Detailed reference for all available `.env` configuration parameters.
 - **[Advanced Docker Customization Recommendations](https://docs.axway.com/bundle/Sentinel_420_InstallationGuide_allOS_en_HTML5/page/Content/InstallationGuide/docker/Docker_recommandations.htm)**: Best practices for tuning and customizing the Sentinel Docker image.
 - **[Volume Management in Docker Compose](https://docs.axway.com/bundle/Sentinel_420_InstallationGuide_allOS_en_HTML5/page/Content/InstallationGuide/docker/volume_management.htm)**: Instructions on how to properly persist, backup, and manage Sentinel data volumes.

### Docker Air-Gapped Resources
 - **[Air-Gapped Containers (Docker Docs)](https://docs.docker.com/enterprise/security/hardened-desktop/air-gapped-containers/)**: Official Docker documentation on managing and securing air-gapped container deployments.
iner deployments.

## C - SonarQube (DOCKER)
 - **[SonarQube Official Documentation](https://docs.sonarsource.com/)** - Main landing page for all SonarQube guides and references.
 - **[Server Installation and Setup From Docker Image](https://docs.sonarsource.com/sonarqube-server/server-installation/from-docker-image)** - Detailed breakdown of Docker-specific environment variables and volume mappings.
 - **[SonarQube for IDE](https://docs.sonarsource.com/sonarqube-for-vs-code)** - Guides on configuring rule sets, bindings, and troubleshooting the IDE extension.

---
   
Developed by the Auspicious-Days Contributor Circle.
