STACK-SETUP-01-ENV.md v0.1
# (DRAFT) Step 1: Environment Setup (Arch-Headless-WSL & IDE) (DRAFT)

This section covers the foundational setup of our AI-agentic development stack. It utilizes a headless Arch Linux 
environment running on Windows Subsystem for Linux (WSL2), optimized for high-precision 
TypeScript modding and local LLM inference.

## 1. Architecture Overview

Before building, ensure your host system aligns with our hardware and virtualization profile:
* **Operating System:** Arch Linux (Rolling Release) running atop WSL2.
* **Virtualization:** x86_64 VM with internal network bridging (crucial for local LLM communication).
* **Hardware Profile:** Optimized for local inference with AVX2 support and high-speed VRAM allocation.
* **IDE & Orchestrator:** VS Code with the Roo Code extension.ion.

## 2.0 - Installing WSL and Arch Linux via PowerShell

You can install the Windows Subsystem for Linux (WSL) and Arch Linux directly from the PowerShell command line using the official Microsoft repository.

2.1. - **Open PowerShell as Administrator.**

   Right-click the Start menu and select **Windows PowerShell (Admin)** or **Terminal (Admin)**.

2.2. - **Install WSL and Arch Linux:**

   Run the following command to install WSL and the official Arch Linux distribution simultaneously.
   ```pwsh
   wsl --install -d archlinuxunch
   ```

_Note: Wait for the installation to complete. You may need to restart your computer if WSL was not previously enabled on your system._

2.3 - **Set WSL 2 as default**

   ```pwsh
   wsl --set-default-version 2
   ```

2.4 - **Verify and Start the WSL Instance:**

   ```pwsh
   # List installed distributions to confirm archlinux is registered
   wsl --list --verbose

   # Start the Arch instance
   wsl -d archlinux
   ```

## 3. Base System & Package Management

   Upon your first login to the Arch WSL instance, you will be operating as the `root` user. You must initialize the package manager (`pacman`), update the keyring, 
   and install essential baseline tools. 
      *(Note: It is best practice to install `bun` after creating your non-root user, as the `bun` installation script targets the current user's home directory).*
      
   ```bash
   # Initialize and populate the pacman keyring
   pacman-key --init
   pacman-key --populate archlinux

   # Update the archlinux-keyring first to prevent signature errors on fresh installs
   pacman -Sy archlinux-keyring --noconfirm

   # Update all system packages
   pacman -Su --noconfirm

   # Install base development tools, git, and networking utilities
   # (Press Enter to accept all defaults if prompted by base-devel)
   pacman -S base-devel git wget curl unzip --needed
   ```

### 3.1 - Setting up a Non-Root User **(Recommended)**

   Running AI workflows and development tools as root is dangerous and can cause permission issues. 
   Create a standard user account and switch to it before installing user-level tools like bun.
   
   ```bash
  # Create a new user (replace 'aiuser' with your preferred username)
      useradd -m -G wheel -s /bin/bash aiuser
      passwd aiuser

   # Allow users in the 'wheel' group to use sudo
      EDITOR=nano visudo 
   # (Uncomment the line: %wheel ALL=(ALL:ALL) ALL)

   # Switch to the new user account
      su - aiuser
   ```

> [!NOTE]
> To make this user the default when launching WSL, open a Windows PowerShell prompt and run: `Arch.exe config --default-user aiuser`

### 3.2 - Installing the Runtime (Bun)

   Now that you are operating as your standard user, install bun (our primary runtime and project manager).
   ```bash
   # Install bun to the user's home directory
   curl -fsSL https://bun.sh/install | bash

   # Reload your bash profile to add bun to your PATH
   source ~/.bashrc
   ```

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
   # Create a project directory, or clone one from git, and CD into that location
   # e.g.:
   mkdir -p ~/ai-workflow
   cd ~/ai-workflow
   code .
   ```

   > [!NOTE]
   >*Executing code . for the first time will automatically download and install the VSCode WSL Server within your Arch environment, then open the project connected to your host's VSCode UI. Ensure you have the "WSL" extension installed in VSCode on Windows.*

4.3. Install the Orchestrator (Roo Code)

Once VSCode is open and connected to WSL 
(verified by the green remote indicator in the bottom-left corner):
 - Open the VSCode Extensions panel (Ctrl+Shift+X).
 - Search for Roo Code.
 - Click Install. If prompted, select Install in WSL: archlinux to ensure the extension runs natively within your Linux environment where your code and tools reside.

## 5. Network Bridging (Preparation for Local AI)

To ensure Roo Code running inside WSL can communicate with local inference tools (like LM Studio) running on the Windows host without encountering `ECONNREFUSED` errors, you must use the internal virtual network bridge IP, rather than `localhost`.

Find your Windows host IP address from inside WSL by checking `/etc/resolv.conf`. The `nameserver` IP acts as the default gateway back to your Windows machine:

```bash
cat /etc/resolv.conf | grep nameserver
```

> [!NOTE]
> Take note of this IP address (e.g., 172.x.x.x). You will use it in Step 2 to point Roo Code's API requests to your host's LM Studio instance (e.g., http://172.x.x.x:1234/v1).
> Important: For this bridge to work, ensure that LM Studio on your host is configured to bind to 0.0.0.0 (or the specific WSL adapter IP) and that your Windows Firewall allows inbound connections on the LM Studio port (default 1234).

---
[Step 1: Environment Setup (Arch-Headless-WSL & IDE)](./STACK-SETUP-01-ENV.md)
[Step 2: LM Studio, MCP Configuration, and Dual-Brain Setup](/.STACK-SETUP-02-LMStudio-MCP.md)
[Step 3: STACK-SETUP-03-Workflow-Git.md](./STACK-SETUP-03-Workflow-Git.md)
[Appendix A: Supplementary Guide: Custom MCP Server Configurations (LM Studio)](./STACK-SETUP-A-MCP-config.md)
---
Developed by the Auspicious-Days Contributor Circle.

