# 📅 Auspicious Days

> *"The Dao is hidden in all things, especially the turning of the calendar."*

**Auspicious Days** weaves the ancient art of numerology into your cultivation journey. By calculating the numerological alignment of the current in-game date, this mod places your character on a traditional **81-stage destiny matrix**, where time itself becomes a resource to be mastered.

## ✨ Features

* **Shifting Fates:** Your luck fluctuates daily based on six tiers of fortune, ranging from **'Very Auspicious' (大吉)** to **'Very Inauspicious' (大凶)**, driven entirely by the cosmic alignment of the date.
* **Heavenly Crafting:** The heavens do not favor the impatient. Time your artifact forging and alchemy with favorable calendar cycles to significantly increase yields and success rates.
* **Dynamic Destinies:** The world responds to your alignment. This system introduces passive buffs and unpredictable karmic effects tied to your current position within the numerological cycle.

---

### 🚀 Development Status: MVP
**Current Version:** `v0.1.3a`  
This project is currently in a **Proof of Concept** state. The core numerological engine is functional, currently undergoing balance passes and feature expansion.

---

# 🛠️ Technical Stack & Environment

This repository utilizes a sophisticated AI-agentic development loop optimized for high-precision TypeScript modding and automated verification.

## 💻 Host Architecture
* **Operating System:** Arch Linux (Rolling Release) running atop WSL2.
* **Virtualization:** x86_64 Virtual Machine with internal network bridging for local LLM communication.
* **Hardware Profile:** Optimized for local inference with AVX2 support and high-speed VRAM allocation for 7B-parameter models.
* **Package Management:** `pacman` (System) and `bun` (Runtime/Project).

## 🧠 Core AI Engine
* **LLM:** Qwen 2.5 Coder 7B Instruct (Local inference via LM Studio).
* **Parameters:** 32k Context Window | 0.1 Temperature (Deterministic Mode).
* **Orchestrator:** Roo Code (VS Code Extension).
* **Networking:** Internal WSL2 virtual network bridge to resolve `ECONNREFUSED` during cross-environment API calls.

## ⚖️ Governance: Dual-Brain Architecture

### 1. Global Laws (`.roo/rules-code/`)
*Prioritized injection (00-05) ensuring the agent respects project-wide constraints before generating code.*
* `00-AGENTS.md`: Project Layout & Core Logic.
* `01-QWEN.md`: Behavioral tuning for local 7B-parameter model inference.
* `02-typescript-afnm.md`: Strict ModAPI safety patterns.
* `03-pre-commit-validation.md`: Mandatory quality gates.
* `04-typescript-best-practices.md`: Project-specific coding standards.
* `05-conventional-git.md`: Standardized commit and history logging.

### 2. On-Demand Skills (`.roo/skills/`)
*Modular task-oriented capabilities pulled into memory only when needed.*
* **afnm-modding:** Engine-specific hooks and lifecycle orientation.
* **agent-browser:** Headless Chromium control via CDP for DOM inspection.
* **dogfood:** Automated exploratory testing and bug hunting.
* **systematic-debugging:** Evidence-based debugging using Sentry traces.

## 🔍 Quality Assurance Stack

| Tool | Usage | Integration |
| :--- | :--- | :--- |
| **Sentry** | Error Evidence | Analyzes crash traces via `systematic-debugging` skill. |
| **Sonar** | Quality Gate | Enforces "Code Smell" and Security standards in validation loops. |
| **Runtime Oracle** | Truth Verification | `bun run runtime:oracle` verifies live game APIs against static docs. |
| **Agent-Browser** | Visual Evidence | Drives Chromium to capture screenshots/video of UI components. |

## 📜 Essential Standards
1.  **ModAPI Safety:** All hooks MUST use `window.modAPI?.hooks` optional chaining to prevent engine crashes.
2.  **Evidence Before Claims:** No feature is considered "done" until it passes the `typecheck` -> `build` -> `runtime:oracle` cycle.
3.  **Lean Repository:** Project avoids bundling generic dependencies (React/MUI) to ensure runtime compatibility with the host engine.

---
*Developed by the Auspicious-Days Contributor Circle.*