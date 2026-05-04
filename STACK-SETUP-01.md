# (DRAFT) Step 1: Environment Setup (Arch-Headless-WSL & IDE)

This section covers the foundational setup of our AI-agentic development stack. It utilizes a headless Arch Linux environment running on Windows Subsystem for Linux (WSL2), optimized for high-precision TypeScript modding and local LLM inference.

## 1. Architecture Overview

Before building, ensure your host system aligns with our hardware and virtualization profile:
* **Operating System:** Arch Linux (Rolling Release) running atop WSL2.
* **Virtualization:** x86_64 VM with internal network bridging (crucial for local LLM communication).
* **Hardware Profile:** Optimized for local inference with AVX2 support and high-speed VRAM allocation for 7B-parameter models.
* **IDE & Orchestrator:** VS Code with the Roo Code extension.ion.

## 2.0 - Installing WSL and Arch Linux via PowerShell

You can install the Windows Subsystem for Linux (WSL) and Arch Linux directly from the PowerShell command line using the official Microsoft repository.

2.1. - **Open PowerShell as Administrator.**
   Right-click the Start menu and select **Windows PowerShell (Admin)** or **Terminal (Admin)**.

2.2. - **Install WSL and Arch Linux:**
   Run the following command to install WSL and the official Arch Linux distribution simultaneously.
   ```powershell
   wsl --install -d archlinuxunch.
```
_Note: Wait for the installation to complete. You may need to restart your computer if WSL was not previously enabled on your system._

2.3 - **Set WSL 2 as default**
```powershell
wsl --set-default-version 2
```

## 3. Base System & Package Management

Initialize the package manager (`pacman`) and install the essential baseline tools, including Git and `bun` (our primary runtime/project manager).

```bash
# Initialize pacman keyring
pacman-key --init
pacman-key --populate archlinux

# Update system packages
pacman -Syu

# Install base development tools, git, and networking utilities
pacman -S base-devel git wget curl unzip

# Install bun (Runtime/Project Manager)
curl -fsSL https://bun.sh/install | bash
```

### Setting up a Non-Root User (Recommended)
It is highly recommended to run your AI workflows under a standard user account to prevent unintended system-wide mutations.

```bash
# Create a new user (replace 'aiuser' with your preferred username)
useradd -m -G wheel -s /bin/bash aiuser
passwd aiuser

# Allow users in the 'wheel' group to use sudo
EDITOR=nano visudo 
# (Uncomment the line: %wheel ALL=(ALL:ALL) ALL)

# Switch to the new user
su - aiuser
```

> [!NOTE]
> To make this user the default when launching WSL, open a Windows PowerShell prompt and run: `Arch.exe config --default-user aiuser`

## 4. Connecting VSCode, Roo Code, and Git

With the headless Arch environment running, connect your VSCode instance directly to the Linux filesystem.

4.1. **Configure Git (Conventional Commits):**
   Inside your Arch terminal, set up your global Git configuration so that Roo Code and your local tools track history correctly.
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

4.2. **Launch VSCode:**
   Navigate to your project directory inside WSL, and launch VSCode directly from the terminal.
   ```bash
   mkdir -p ~/ai-workflow
   cd ~/ai-workflow
   code .
   ```
   *This command installs the VSCode WSL Server in Arch and opens the project in your host's VSCode interface.*

4.3. **Install the Orchestrator:**
   * Open the VSCode Extensions panel (`Ctrl+Shift+X`).
   * Search for and install **Roo Code**.

## 5. Network Bridging (Preparation for Local AI)

To ensure Roo Code can communicate with local inference tools (like LM Studio running on the Windows host) without encountering `ECONNREFUSED` errors, verify your WSL internal network bridge.

Find your Windows host IP address from inside WSL by checking `/etc/resolv.conf`:
```bash
cat /etc/resolv.conf | grep nameserver
```

> [!NOTE]
> Take note of this IP address. You will use it in Step 2 to point Roo Code's API requests to your host's LM Studio instance.

---
**Next Step:** [Step 2: LM Studio, MCP Configuration, and Dual-Brain Setup](./step-2-lmstudio-mcp.md)

