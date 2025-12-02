# TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension

[![Build Status](https://img.shields.io/github/actions/workflow/status/chirag127/TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension/ci.yml?style=flat-square)](https://github.com/chirag127/TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension/actions/workflows/ci.yml)
[![Coverage](https://img.shields.io/codecov/c/github/chirag127/TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension?style=flat-square)](https://codecov.io/gh/chirag127/TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension)
[![License](https://img.shields.io/badge/License-CC%20BY--NC%204.0-orange?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/chirag127/TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension?style=flat-square)](https://github.com/chirag127/TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension/stargazers)

<p align="center">
  <a href="https://github.com/chirag127/TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension" style="text-decoration: none;">
    ⭐ Star ⭐ this Repo
  </a>
</p>

---

## 💎 Blazing Fast Video Intelligence

TubeSumTalk is an advanced browser extension leveraging the **Google Gemini API** to instantaneously generate comprehensive, context-aware summaries of any YouTube video, complete with dynamic Text-to-Speech narration and interactive Q&A capabilities.

This project enforces **FAANG-level standards** for frontend performance and AI integration reliability within the constraints of a modern browser extension environment.

## 🏗️ Architectural Overview

This project follows a **Feature-Sliced Design (FSD)** pattern adapted for browser extensions, separating concerns into layers: `shared` (utilities, types), `entities` (core business logic, API wrappers), `features` (user interactions, specific functionalities like TTS/Q&A), and `pages` (content scripts/popup UI).

mermaid
graph TD
    A[YouTube Page Context] -->|Fetch Transcript| B(Content Script Layer);
    B -->|API Call (Secure)| C{Extension Background Service Worker};
    C -->|Gemini Processing| D[External AI Service (Gemini API)];
    D -->|Return Summary/Q&A| C;
    C -->|Inject DOM| B;
    B --> E(UI Layer: Popup / Injected Panel);
    E -->|TTS Playback| F[Native Browser TTS Engine];

    subgraph Frontend Logic
        E
        B
    end
    subgraph Core Services
        C
        D
    end


## 📜 Table of Contents

1.  [💎 Blazing Fast Video Intelligence](#-blazing-fast-video-intelligence)
2.  [🏗️ Architectural Overview](#-architectural-overview)
3.  [📜 Table of Contents](#-%EF%B8%8F-table-of-contents)
4.  [⚡ Core Features](#-⚡-core-features)
5.  [🛠️ Technology Stack (Apex Toolchain 2026)](#-🛠️-technology-stack-apex-toolchain-2026)
6.  [🤖 AI Agent Directives (System Alignment)](#--ai-agent-directives-system-alignment)
7.  [🚀 Development & Setup](#-🚀-development--setup)
8.  [⚖️ License](#-⚖️-license)

## ⚡ Core Features

*   **Instant Summarization:** One-click generation of video summaries using the latest Gemini models.
*   **Customizable Output:** Define required summary length (e.g., 3 bullet points, 500 words) or focus (e.g., technical deep dive, high-level overview).
*   **Narrative TTS:** Read the generated summary aloud using high-fidelity browser Text-to-Speech, synchronized with UI highlighting.
*   **Interactive Q&A:** Ask follow-up questions against the video content directly within the extension interface.
*   **Strict Compliance:** Built strictly using modern browser standards (Manifest V3 compliant).

## 🛠️ Technology Stack (Apex Toolchain 2026)

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| Language | **TypeScript 5.x (Strict Mode)** | Uncompromising type safety and maintainability. |
| Build Tool | **Vite 7 / WXT** | Fastest possible dev server and optimized production build for extensions. |
| Linter/Formatter | **Biome** | Unified, high-speed linting, formatting, and code organization. |
| State Management | **Signals (Preact/Solid Adaptable)** | Minimal overhead state management suitable for browser extensions. |
| API Calls | **Fetch API (Native)** | Leveraging native browser capabilities for maximum context performance. |
| Testing | **Vitest (Unit) / Playwright (E2E)** | Rapid, isolated unit testing and robust end-to-end scenario validation. |

## 🤖 AI Agent Directives (System Alignment)

<details>
<summary>Click to view the System Alignment & Architectural Mandates</summary>

# SYSTEM: APEX TECHNICAL AUTHORITY & ELITE ARCHITECT (DECEMBER 2025 EDITION)

## 1. IDENTITY & PRIME DIRECTIVE
**Role:** You are a Senior Principal Software Architect and Master Technical Copywriter with **40+ years of elite industry experience**. You operate with absolute precision, enforcing FAANG-level standards and the wisdom of "Managing the Unmanageable."
**Context:** Current Date is **December 2025**. You are building for the 2026 standard.
**Output Standard:** Deliver **EXECUTION-ONLY** results. No plans, no "reporting"—only executed code, updated docs, and applied fixes.
**Philosophy:** "Zero-Defect, High-Velocity, Future-Proof."

---

## 2. INPUT PROCESSING & COGNITION
*   **SPEECH-TO-TEXT INTERPRETATION PROTOCOL:**
    *   **Context:** User inputs may contain phonetic errors (homophones, typos).
    *   **Semantic Correction:** **STRICTLY FORBIDDEN** from executing literal typos. You must **INFER** technical intent based on the project context.
    *   **Logic Anchor:** Treat the `README.md` as the **Single Source of Truth (SSOT)**.
*   **MANDATORY MCP INSTRUMENTATION:**
    *   **No Guessing:** Do not hallucinate APIs. 
    *   **Research First:** Use `linkup`/`brave` to search for **December 2025 Industry Standards**, **Security Threats**, and **2026 UI Trends**.
    *   **Validation:** Use `docfork` to verify *every* external API signature.
    *   **Reasoning:** Engage `clear-thought-two` to architect complex flows *before* writing code.

---

## 3. CONTEXT-AWARE APEX TECH STACKS (LATE 2025 STANDARDS)
**Directives:** Detect the project type and apply the corresponding **Apex Toolchain**. This repository leverages a modern extension stack.

*   **PRIMARY SCENARIO: WEB / APP / EXTENSION (TypeScript)**
    *   **Stack:** This project utilizes **TypeScript 5.x (Strict)**, **Vite 7** with a **WXT** configuration (for Manifest V3 optimization), and **Biome** for linting/formatting.
    *   **Architecture:** Adheres strictly to **Feature-Sliced Design (FSD)**, ensuring clean separation between shared utilities, UI components, core extension logic (Service Worker), and page interactions (Content Scripts).
    *   **State:** Adopts **Signals** (or equivalent reactive primitives) for low-overhead state propagation across the extension boundaries.
    *   **AI Integration:** All interactions with the **Google Gemini API** must be routed through the Service Worker to protect API keys and manage rate limits robustly. Payload structures must be strongly typed using Interfaces defined in `shared/types`.

*   **VERIFICATION MANDATES:**
    *   **TypeScript Check:** Ensure all configurations (`tsconfig.json`) enforce `strict: true`.
    *   **Biome Verification:** Run `biome check --error-on-warnings` before commit.
    *   **E2E Validation:** Playwright scenarios must cover popup initialization, API key handling, and successful DOM injection.

</details>

## 🚀 Development & Setup

Follow these steps to establish the Zero-Defect development environment.

1.  **Clone Repository & Navigate:**
    bash
git clone https://github.com/chirag127/TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension.git
cd TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension


2.  **Install Dependencies (using npm/uv standard):
    bash
npm install
# Or if using uv/pip for supporting Python tools (if any):
# uv sync


3.  **Verification & Linting:
    bash
# Run linter and formatter check
npm run lint:check
# Run unit tests
npm run test


4.  **Running in Development Mode:
    bash
# Start the development server, often watching for file changes
npm run dev


### Scripts Table

| Script Command | Description | Verification Standard |
| :--- | :--- | :--- |
| `npm run dev` | Starts Vite dev server for hot module replacement (HMR). | Must load extension without errors. |
| `npm run build` | Generates production-ready, optimized extension bundles. | Output must conform to Manifest V3 structure. |
| `npm run lint` | Executes Biome for formatting and linting checks. | Zero warnings/errors required for merge. |
| `npm run test` | Executes Vitest unit tests across core modules. | Coverage must exceed 85% baseline. |
| `npm run test:e2e` | Runs Playwright end-to-end scenarios. | Validates UX flow and API interactions. |

### Development Principles

*   **SOLID:** Adhere rigorously to Single Responsibility Principle, especially when isolating Gemini prompts.
*   **DRY:** Abstraction layers must be used for redundant DOM manipulation or repetitive API interaction patterns.
*   **YAGNI:** Only implement features that are explicitly defined or immediately necessary; avoid speculative generalization.

## ⚖️ License

This repository is protected under the **Creative Commons Attribution-NonCommercial 4.0 International License**. See the [LICENSE](LICENSE) file for details.
