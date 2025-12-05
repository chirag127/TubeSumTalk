# TubeSumTalk: AI-Powered YouTube Video Summarizer Browser Extension

<p align="center">
  <a href="https://github.com/chirag127/TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension">
    <img src="https://raw.githubusercontent.com/chirag127/asset-host/main/images/tubesumtalk/tubesumtalk-hero-banner-logo.png" alt="TubeSumTalk Hero Banner">
  </a>
</p>

<p align="center">
    <a href="https://github.com/chirag127/TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/chirag127/TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension/ci.yml?branch=main&style=flat-square&logo=githubactions&logoColor=white" alt="Build Status"></a>
    <a href="https://github.com/chirag127/TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg?style=flat-square" alt="License"></a>
    <img src="https://img.shields.io/badge/TypeScript-Strict-blue.svg?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/Vite-5.x-purple.svg?style=flat-square&logo=vite&logoColor=white" alt="Vite">
    <img src="https://img.shields.io/badge/WXT-Latest-orange.svg?style=flat-square" alt="WXT Framework">
    <img src="https://img.shields.io/badge/Gemini_API-1.5_Pro-blueviolet.svg?style=flat-square&logo=google-gemini&logoColor=white" alt="Gemini API">
    <img src="https://img.shields.io/badge/Linted_with-Biome-informational.svg?style=flat-square&logo=biome&logoColor=white" alt="Biome Linter">
</p>

<p align="center">
    <a href="https://github.com/chirag127/TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension/stargazers"><strong>Star ⭐ this Repo</strong></a> if you find it useful! It helps us grow and improve.
</p>

---

**TubeSumTalk** is an intelligent browser extension that leverages the Google Gemini 1.5 Pro API to deliver instant, high-quality summaries of any YouTube video. It transforms passive viewing into active learning with features like text-to-speech audio playback and interactive Q&A, directly within your browser.

This tool is engineered for students, researchers, and professionals who need to extract key insights from video content with maximum efficiency, saving hours of viewing time.

## ✨ Key Features

-   **🧠 AI-Powered Summaries:** Get concise, accurate summaries of YouTube videos in seconds using Google's state-of-the-art Gemini 1.5 Pro model.
-   **🗣️ Text-to-Speech (TTS):** Listen to summaries on the go with high-quality, natural-sounding audio playback.
-   **💬 Interactive Q&A:** Ask questions about the video content and receive instant, context-aware answers from the AI.
-   **🚀 High Performance:** Built with TypeScript and Vite for a fast, responsive, and reliable user experience.
-   **🌐 Cross-Browser Support:** Packaged with WXT for easy deployment to Chrome, Firefox, and other WebExtension-compatible browsers.
-   **🎨 Modern UI:** A clean, intuitive interface that integrates seamlessly with the YouTube experience.

## 🏛️ Architecture Overview

This repository follows the **Feature-Sliced Design (FSD)** methodology to ensure a scalable, maintainable, and logically organized codebase. The modular structure is optimized for browser extension development.

sh
. (root)
├── .github/          # GitHub Actions, issue templates, PR templates
├── .vscode/          # VSCode settings and recommended extensions
├── assets/           # Static assets like icons and images
├── entrypoints/      # Extension entry points (popup, content scripts, background)
│   ├── background.ts # Background service worker for API calls
│   ├── content.ts    # Injects UI into YouTube pages
│   └── popup/        # UI components and logic for the extension popup
├── features/         # Individual, self-contained features
│   ├── generateSummary/ # Logic for fetching and displaying summaries
│   ├── interactiveQA/   # Q&A feature implementation
│   └── textToSpeech/    # TTS audio playback logic
├── shared/           # Shared utilities, APIs, UI components, and types
│   ├── api/          # Gemini API client
│   ├── ui/           # Reusable UI components (buttons, loaders)
│   └── utils/        # Helper functions
├── wxt.config.ts     # WXT framework configuration
├── package.json      # Project dependencies and scripts
└── tsconfig.json     # TypeScript configuration


## 📋 Table of Contents

-   [Getting Started](#-getting-started)
    -   [Prerequisites](#prerequisites)
    -   [Installation](#installation)
-   [Development](#-development)
    -   [Available Scripts](#available-scripts)
-   [🤖 AI Agent Directives](#-ai-agent-directives)
-   [Contributing](#-contributing)
-   [License](#-license)

## 🚀 Getting Started

### Prerequisites

-   **Node.js:** v20.x or higher
-   **pnpm:** v9.x or higher (for dependency management)
-   **Google Gemini API Key:** Obtain a key from [Google AI Studio](https://ai.google.dev/).

### Installation

1.  **Clone the repository:**
    sh
    git clone https://github.com/chirag127/TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension.git
    cd TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension
    

2.  **Install dependencies:**
    sh
    pnpm install
    

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and add your Gemini API key:
    env
    VITE_GEMINI_API_KEY="YOUR_API_KEY_HERE"
    

4.  **Load the extension in your browser (Developer Mode):**
    -   Run the development server:
        sh
        pnpm dev
        
    -   Open Chrome/Firefox and navigate to the extensions page (`chrome://extensions` or `about:addons`).
    -   Enable "Developer mode".
    -   Click "Load unpacked" and select the `dist` directory generated in the project root.

## 💻 Development

This project is built using a modern toolchain to ensure code quality, consistency, and a smooth development workflow.

### Available Scripts

| Script       | Description                                                 |
| :----------- | :---------------------------------------------------------- |
| `pnpm dev`   | Starts the development server with hot-reloading.           |
| `pnpm build` | Compiles and bundles the extension for production.          |
| `pnpm zip`   | Builds and packages the extension into a `.zip` file.       |
| `pnpm lint`  | Runs the Biome linter to check for code quality issues.     |
| `pnpm format`| Formats the codebase using Biome.                           |
| `pnpm test`  | Executes unit tests using Vitest.                           |

---

## 🤖 AI Agent Directives

<details>
<summary><strong>Expand for AI Development Protocol (2026 Standard)</strong></summary>

### SYSTEM: APEX TECHNICAL AUTHORITY & ELITE ARCHITECT (DECEMBER 2025 EDITION)

#### 1. IDENTITY & PRIME DIRECTIVE
**Role:** You are a Senior Principal Software Architect with **40+ years of elite industry experience**. You operate with absolute precision, enforcing FAANG-level standards.
**Context:** Current Date is **December 2025**. You are building for the 2026 standard.
**Philosophy:** "Zero-Defect, High-Velocity, Future-Proof."

#### 2. CONTEXT-AWARE APEX TECH STACKS (LATE 2025 STANDARDS)
This repository, `TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension`, is a **TypeScript-based Browser Extension**.

-   **PRIMARY SCENARIO: WEB / APP / EXTENSION (TypeScript)**
    -   **Stack:** This project leverages **TypeScript 6.x (Strict Mode)**, **Vite 7 (with Rolldown)** for lightning-fast builds, and **WXT** as the primary framework for building a robust, cross-browser Web Extension.
    -   **UI & Styling:** Utilizes **TailwindCSS v4** for utility-first styling. Components are built with modern web standards in mind.
    -   **Architecture:** Adheres to **Feature-Sliced Design (FSD)**. All new functionality must be encapsulated within the `features/` directory, with shared logic, types, and utilities residing in `shared/`. This ensures modularity and scalability.
    -   **AI Integration:** Deeply integrated with the **Google Gemini API** (`gemini-1.5-pro` model). All API interactions must be routed through the client defined in `shared/api/gemini.ts` and include robust error handling, request cancellation, and timeout mechanisms.
    -   **State Management:** For complex state, utilize **Signals** (the standardized, native approach in 2025) for reactive and performant state management. Avoid legacy state managers.

#### 3. DEVELOPMENT & VERIFICATION PROTOCOL
-   **Linting & Formatting:** **Biome** is the single source of truth for code quality. All code must pass Biome checks before merging. Execute `pnpm format && pnpm lint` locally.
-   **Testing:** All new features must be accompanied by unit tests. **Vitest** is the designated testing framework. E2E tests are implemented with **Playwright** to simulate user interactions and verify extension behavior in a real browser environment.
-   **Commit Hygiene:** Adhere to the **Conventional Commits** specification. Commits must be atomic and prefixed (e.g., `feat:`, `fix:`, `docs:`).
-   **Core Principles:** All code must follow **SOLID**, **DRY**, and **YAGNI** principles. Write code that is self-documenting, maintainable, and easy to refactor.

</details>

## 🙏 Contributing

Contributions are welcome! Please read the [CONTRIBUTING.md](https://github.com/chirag127/TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension/blob/main/.github/CONTRIBUTING.md) file for guidelines on how to contribute to this project. We appreciate bug reports, feature requests, and pull requests.

## 📜 License

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International License** - see the [LICENSE](https://github.com/chirag127/TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension/blob/main/LICENSE) file for details.
