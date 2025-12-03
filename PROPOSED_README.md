# VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension

A cutting-edge browser extension leveraging Google Gemini to provide concise summaries, interactive Q&A, and text-to-speech capabilities for YouTube videos, revolutionizing how users consume video content.

---

## 🚀 Live Demo & Badges

[![Build Status](https://img.shields.io/github/actions/workflow/status/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension/ci.yml?style=flat-square)](https://github.com/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension/actions/workflows/ci.yml)
[![Code Coverage](https://img.shields.io/codecov/c/github/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension?style=flat-square)](https://codecov.io/github/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension)
[![Tech Stack](https://img.shields.io/badge/tech-stack-JavaScript%2C%20WebExtensions%2C%20Gemini-blue?style=flat-square)](https://github.com/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension)
[![Lint/Format](https://img.shields.io/badge/lint--format-Biome-f8c551?style=flat-square)](https://biomejs.dev/)
[![License](https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey?style=flat-square)](https://github.com/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension/blob/main/LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension?style=flat-square)](https://github.com/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension)

---
Star ⭐ this Repo

---

## 🌳 Project Architecture

ascii
.
├── public/
│   ├── icons/
│   │   ├── icon16.png
│   │   └── icon48.png
│   └── manifest.json
├── src/
│   ├── api/
│   │   └── geminiService.js
│   ├── components/
│   │   ├── SummaryDisplay.js
│   │   └── VideoPlayerOverlay.js
│   ├── content/
│   │   ├── contentScript.js
│   │   └── styles.css
│   ├── background/
│   │   └── background.js
│   ├── popup/
│   │   ├── Popup.js
│   │   └── popup.html
│   ├── utils/
│   │   └── textToSpeech.js
│   └── index.js
├── .gitignore
├── AGENTS.md
├── badges.yml
├── CONTRIBUTING.md
├── LICENSE
├── .eslintrc.js
├── .prettierrc.js
├── package.json
├── README.md
├── ISSUE_TEMPLATE/
│   └── bug_report.md
├── PULL_REQUEST_TEMPLATE.md
├── SECURITY.md
├── .github/workflows/ci.yml
└── vite.config.js


---

## 📚 Table of Contents

*   [🚀 Live Demo & Badges](#-live-demo--badges)
*   [🌳 Project Architecture](#-project-architecture)
*   [📚 Table of Contents](#-table-of-contents)
*   [✨ Features](#-features)
*   [🛠️ Tech Stack & Architecture](#️-tech-stack--architecture)
*   [⚙️ AI Agent Directives](#️-ai-agent-directives)
*   [🚀 Getting Started](#-getting-started)
*   [📦 Development Setup](#-development-setup)
*   [📜 Contributing](#-contributing)
*   [🛡️ Security](#-security)
*   [⚖️ License](#️-license)

---

## ✨ Features

*   **AI-Powered Summarization:** Utilizes Google Gemini to generate concise, human-readable summaries of YouTube videos.
*   **Interactive Q&A:** Ask questions about the video content and receive AI-generated answers.
*   **Text-to-Speech:** Listen to video summaries with natural-sounding text-to-speech.
*   **Seamless Integration:** Operates as a non-intrusive browser extension, enhancing the YouTube viewing experience.

---

## 🛠️ Tech Stack & Architecture

*   **Core Language:** JavaScript
*   **Extension Framework:** WebExtensions API compatible (Chrome, Firefox, etc.)
*   **Build Tool:** Vite (for efficient bundling and development server)
*   **AI Integration:** Google Gemini API (`gemini-3-pro` for optimal performance).
*   **Styling:** CSS / Tailwind CSS (if integrated)
*   **Architecture:** Inspired by Feature-Sliced Design (FSD) for extensions, ensuring modularity, maintainability, and scalability.
    *   **`public/`:** Static assets and manifest file.
    *   **`src/api/`:** Handles all external API communication (Gemini).
    *   **`src/components/`:** Reusable UI components.
    *   **`src/content/`:** Scripts injected into web pages (YouTube).
    *   **`src/background/`:** Persistent background scripts for managing extension state and events.
    *   **`src/popup/`:** The main UI presented when the extension icon is clicked.
    *   **`src/utils/`:** Helper functions (e.g., text-to-speech logic).
*   **Linting & Formatting:** Biome (ultra-fast, modern linter and formatter).
*   **Testing:** Vitest (for unit and integration tests) and Playwright (for end-to-end testing).

---

## ⚙️ AI Agent Directives

<details>
<summary>Expand for AI Agent Directives</summary>

### SYSTEM: APEX TECHNICAL AUTHORITY & ELITE ARCHITECT (DECEMBER 2025 EDITION)

#### 1. IDENTITY & PRIME DIRECTIVE
*   **Role:** Senior Principal Software Architect, Master Technical Copywriter with **40+ years of elite industry experience**.
*   **Context:** Current Date is **December 2025**. Building for the 2026 standard.
*   **Output Standard:** **EXECUTION-ONLY**. No plans, only executed code, updated docs, and applied fixes.
*   **Philosophy:** "Zero-Defect, High-Velocity, Future-Proof."

#### 2. INPUT PROCESSING & COGNITION
*   **Speech-to-Text Interpretation:** **STRICTLY FORBIDDEN** from executing literal typos. Infer technical intent based on project context. Use `README.md` as the Single Source of Truth (SSOT).
*   **Mandatory MCP Instrumentation:** Use `linkup`/`brave` for research (December 2025 Industry Standards, Security Threats, 2026 UI Trends). Use `docfork` to verify external API signatures. Engage `clear-thought-two` for complex flow architecture.

#### 3. CONTEXT-AWARE APEX TECH STACKS (LATE 2025 STANDARDS)
*   **Project Type:** This repository is a **Web Extension** leveraging **JavaScript**.
*   **PRIMARY SCENARIO A: WEB / APP / EXTENSION (TypeScript/JavaScript)**
    *   **Stack:** **JavaScript** (ES2020+), Vite 7 (Rolldown), WebExtensions API, Google Gemini API.
    *   **State Management:** Leverage standard browser extension APIs or minimal state management libraries as appropriate.
    *   **UI Framework:** Utilize vanilla JS or lightweight frameworks/libraries where performance is critical.
    *   **Lint/Test:** **Biome** (Linter/Formatter) and **Vitest** (Unit/Integration Testing), **Playwright** (E2E Testing).
    *   **Architecture:** Feature-Sliced Design (FSD) principles adapted for browser extensions.

#### 4. APEX NAMING CONVENTION (THE "STAR VELOCITY" ENGINE)
*   **Format:** `<Product-Name>-<Primary-Function>-<Platform>-<Type>`
*   **Rules:** Title-Case-With-Hyphens, 3-10 words, high-volume keywords. No numbers, emojis, underscores, or generic words without qualifiers.
*   **Archival Protocol:** If `action` is "ARCHIVE", retain descriptive naming. Rename to `Archived-<Product>-<Function>-<Platform>-<Type>` and update all metadata professionally.

#### 5. THE README REPLICATION PROTOCOL (THE ULTIMATE ARTIFACT)
*   **Sections:** Visual Authority (Logo, Badges), Structural Clarity (BLUF, Architecture Diagram, ToC), AI Agent Directives (`<details>` block), Development Standards (Setup, Scripts, Principles).
*   **Badges:** `flat-square` style, `chirag127` username, specific badges: Build Status, Code Coverage, Tech Stack, Lint/Format, License, GitHub Stars.

#### 6. DYNAMIC URL & BADGE PROTOCOL
*   **Base URL:** `https://github.com/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension`
*   **Consistency:** All links and badges MUST use the new repository name. Never use the old/original name.
*   **AGENTS.md Customization:** Content must be adapted to the specific repository's tech stack (JavaScript/WebExtensions) while retaining core Apex principles.

</details>

---

## 🚀 Getting Started

This project is a browser extension. The primary way to interact with it is through your web browser.

### Installation (Development)

1.  **Clone the repository:**
    bash
    git clone https://github.com/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension.git
    cd VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension
    

2.  **Install dependencies:**
    bash
    npm install
    

3.  **Build for development:**
    bash
    npm run dev
    
    This command will typically output a `dist` or `build` folder containing the extension files.

4.  **Load the extension in your browser:**
    *   **Chrome:** Go to `chrome://extensions/`, enable "Developer mode", click "Load unpacked", and select the `dist` folder.
    *   **Firefox:** Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select the `dist/manifest.json` file.

---

## 📦 Development Setup

*   **Node.js:** Ensure you have Node.js version 18 or higher installed.
*   **Package Manager:** npm (comes with Node.js). We use `npm` for managing dependencies and scripts.

### Key Scripts

| Script        | Description                                                    |
| :------------ | :------------------------------------------------------------- |
| `npm install` | Installs all project dependencies.                             |
| `npm run dev` | Starts the Vite development server and builds the extension.   |
| `npm run build` | Creates a production-ready build of the extension in the `dist` folder. |
| `npm run lint` | Runs Biome to check for linting errors and formatting issues.  |
| `npm run format`| Runs Biome to format the code according to the defined style.   |
| `npm run test` | Executes unit and integration tests using Vitest.              |
| `npm run test:e2e` | Executes end-to-end tests using Playwright.                  |

---

## 📜 Contributing

Contributions are welcome! Please follow these guidelines:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix.
3.  **Make your changes** and ensure they follow the project's coding standards.
4.  **Add tests** for any new functionality.
5.  **Ensure linters and tests pass** (`npm run lint`, `npm test`).
6.  **Submit a Pull Request** with a clear description of your changes.

See the [CONTRIBUTING.md](https://github.com/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension/blob/main/.github/CONTRIBUTING.md) file for more details.

---

## 🛡️ Security

We take security seriously. If you discover any security vulnerabilities, please report them responsibly.

*   Please do **not** create a public GitHub issue for security vulnerabilities.
*   Instead, follow the instructions in the [SECURITY.md](https://github.com/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension/blob/main/.github/SECURITY.md) file.

---

## ⚖️ License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)**.

See the [LICENSE](https://github.com/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension/blob/main/LICENSE) file for full details.
