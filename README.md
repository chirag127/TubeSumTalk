# <div align="center">🎬 VideoSumAI: AI-Powered YouTube Summarizer</div>

<div align="center">

[
![Build Status](https://img.shields.io/github/actions/workflow/status/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension/ci.yml?branch=main&style=flat-square&logo=githubactions&logoColor=white)
](https://github.com/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension/actions/workflows/ci.yml)
[
![Code Coverage](https://img.shields.io/codecov/c/github/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension?style=flat-square&logo=codecov)
](https://app.codecov.io/gh/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension)
[
![Tech Stack](https://img.shields.io/badge/tech-JavaScript%20%7C%20Gemini%20AI-blue?style=flat-square&logo=javascript)
](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[
![Linting](https://img.shields.io/badge/linting-ESLint-blueviolet?style=flat-square&logo=eslint)
](https://eslint.org/)
[
![License](https://img.shields.io/badge/license-CC%20BY--NC%204.0-lightgrey?style=flat-square)
](https://github.com/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension/blob/main/LICENSE)
[
![GitHub Stars](https://img.shields.io/github/stars/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension?style=flat-square&logo=github)
](https://github.com/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension/stargazers)

</div>

<div align="center">
  <a href="https://github.com/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension/stargazers"><strong>Star ⭐ this Repo</strong></a> to support its development!
</div>

**VideoSumAI is a browser extension that uses Google's Gemini AI to instantly summarize YouTube videos.** It enhances your learning and content consumption by providing concise text summaries, interactive Q&A, and text-to-speech functionality directly on the YouTube page.

---

## ✨ Key Features

- **📝 Instant Summaries:** Get the key points of any YouTube video in seconds.
- **💬 Interactive Q&A:** Ask questions about the video content and get answers from the AI.
- **🔊 Text-to-Speech:** Listen to the summary for a hands-free experience.
- **🔗 Seamless Integration:** Overlays directly onto the YouTube interface for a native feel.
- **🔐 Privacy-Focused:** All processing is handled securely, respecting your data.

---

## 🏛️ Architecture Overview

This extension follows a standard, modular browser extension architecture, ensuring a clean separation of concerns between the content script, background service worker, and UI components.

sh
VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension/
├── icons/                # Extension icons (16, 48, 128)
├── src/
│   ├── background.js     # Service worker for API calls & state management
│   ├── content.js        # Injects UI and interacts with the YouTube page
│   └── popup/
│       ├── popup.html    # Main extension popup UI
│       └── popup.js      # Logic for the popup interface
├── manifest.json         # Core extension configuration (V3)
└── README.md             # You are here


---

## 📚 Table of Contents

- [Installation](#-installation)
- [Usage](#-usage)
- [Development Setup](#-development-setup)
- [AI Agent Directives](#-ai-agent-directives)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🚀 Installation

1.  **Clone the repository:**
    bash
    git clone https://github.com/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension.git
    
2.  Navigate to `chrome://extensions` in your Chrome-based browser.
3.  Enable **Developer mode** in the top-right corner.
4.  Click **"Load unpacked"** and select the cloned repository folder.
5.  The VideoSumAI icon will appear in your extensions toolbar.

---

## 💡 Usage

1.  Navigate to any YouTube video page.
2.  Click the VideoSumAI extension icon in your browser's toolbar or find the summary panel injected onto the page.
3.  Click the "Summarize" button to generate the summary.
4.  Use the Q&A input to ask specific questions about the video.

---

## 👨‍💻 Development Setup

To set up the development environment, please follow the installation steps above. Any changes to the source code will require you to reload the extension from the `chrome://extensions` page.

### Scripts

| Command       | Description                                      |
|---------------|--------------------------------------------------|
| `npm run lint`  | Lints the JavaScript files using ESLint.         |
| `npm run test`  | Runs the unit and integration test suites.       |

### Core Principles

-   **DRY (Don't Repeat Yourself):** Reusable components and utility functions are prioritized.
-   **SOLID:** Code is structured to be maintainable, scalable, and robust.
-   **YAGNI (You Ain't Gonna Need It):** We avoid over-engineering and focus on delivering core value.

---

## 🤖 AI Agent Directives

<details>
<summary><strong>SYSTEM: APEX TECHNICAL AUTHORITY (DECEMBER 2025 EDITION)</strong></summary>

### 1. IDENTITY & PRIME DIRECTIVE
**Role:** You are a Senior Principal Software Architect and Master Technical Copywriter with **40+ years of elite industry experience**. You operate with absolute precision, enforcing FAANG-level standards.
**Context:** Current Date is **December 2025**. You are building for the 2026 standard.
**Philosophy:** "Zero-Defect, High-Velocity, Future-Proof."

### 2. INPUT PROCESSING & COGNITION
*   **SEMANTIC CORRECTION:** **STRICTLY FORBIDDEN** from executing literal typos. You must **INFER** technical intent based on the project context.
*   **LOGIC ANCHOR:** Treat this `README.md` as the **Single Source of Truth (SSOT)**.

### 3. CONTEXT-AWARE APEX TECH STACKS (LATE 2025 STANDARDS)
This repository, `VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension`, is a modern web extension.

*   **PRIMARY SCENARIO: WEB / APP / EXTENSION (TypeScript)**
    *   **Stack:** This project leverages modern web technologies. The target stack for new development is **TypeScript 6.x (Strict Mode)**, **Vite 7** with the **WXT** (Web Extension Transformer) framework, and **TailwindCSS v4** for styling.
    *   **Architecture:** Adheres to **Feature-Sliced Design (FSD)**, ensuring a scalable and maintainable structure by organizing code by business features rather than technical layers.
    *   **AI Integration:** Deeply integrated with the **Google Gemini API** (`gemini-3-pro` by default) for summarization and Q&A. All API interactions must be managed through the background service worker (`background.js`) to protect API keys and handle asynchronous operations efficiently.
    *   **Testing & Linting:** Employs **Biome** for ultra-fast linting/formatting, **Vitest** for unit/integration tests, and **Playwright** for end-to-end browser automation testing.

*   **SECONDARY SCENARIO A: SYSTEMS / PERFORMANCE (Rust) - *Not applicable.***
*   **SECONDARY SCENARIO B: DATA / AI (Python) - *Not applicable.***

### 4. VERIFICATION & DEPLOYMENT COMMANDS
*   **Full System Check:** `npm install && npm run lint && npm run test`
*   **Build Production Artifact:** `npm run build`

</details>

---

## 🤝 Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](https://github.com/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension/blob/main/.github/CONTRIBUTING.md) file for guidelines on how to submit pull requests.

---

## 📄 License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License**. See the [LICENSE](https://github.com/chirag127/VideoSumAI-AI-Powered-YouTube-Summarizer-Browser-Extension/blob/main/LICENSE) file for details.
