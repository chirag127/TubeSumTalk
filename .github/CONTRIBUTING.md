# 🤝 Contribution Guidelines for TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension

As an Apex Technical Authority project, contributions to `TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension` are held to the highest standards of engineering excellence, architectural integrity, and future-proofing. We enforce a **Zero-Defect, High-Velocity** workflow.

## 1. Core Principles

All contributions must adhere to the foundational mandates outlined in the `AGENTS.md` file, emphasizing **SOLID**, **DRY**, and **YAGNI** principles. We prioritize maintainability and performance, given this is a real-time browser extension.

## 2. Development Environment Setup

Before submitting a Pull Request (PR), ensure your local environment mirrors the required stack:

1.  **Fork the Repository:** Create your own fork of `https://github.com/chirag127/TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension`.
2.  **Clone:** Clone your fork locally.
    bash
    git clone https://github.com/chirag127/TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension.git
    cd TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension
    
3.  **Dependency Management (JavaScript/Vite Standard 2025):**
    bash
    npm install
    
4.  **Linting & Formatting Check:** Ensure all code passes static analysis checks *before* commit.
    bash
    npm run lint
    npm run format:check
    
5.  **Testing:** Run local tests to confirm no regressions.
    bash
    npm run test
    

## 3. The Submission Workflow

We utilize the **Feature-Branch Workflow** combined with strict PR templates.

### A. Branching Strategy

*   All work must be done on a feature branch, named descriptively (e.g., `feat/tts-volume-control` or `fix/gemini-timeout-handling`).
*   **NEVER** commit directly to `main` or `develop`.

### B. Pull Request (PR) Requirements

Every PR **MUST**:

1.  **Reference the Issue:** Link the PR to the relevant GitHub Issue using keywords (e.g., `Closes #123`).
2.  **Use the Template:** Fill out the entire **PULL_REQUEST_TEMPLATE.md** provided in `.github/PULL_REQUEST_TEMPLATE.md`.
3.  **Self-Review:** Thoroughly review your own changes against the Architectural Checklist in the PR template before requesting a review.
4.  **Pass CI:** Ensure the GitHub Actions workflow (`ci.yml`) runs and passes all checks (Build, Test, Lint) on the server *before* requesting human review.

## 4. Code Standards & Architectural Review

### Language & Quality

*   **JavaScript/TypeScript:** Adhere strictly to the defined **Biome** configuration for linting and formatting. Prefer immutability where practical.
*   **AI Interaction:** All interactions with the Google Gemini API must be wrapped in robust `try...catch` blocks with exponential backoff where applicable, logging failures as per our error handling strategy.
*   **State Management:** Given this is an extension, state must be managed efficiently between background scripts and the content/popup UIs (e.g., using `chrome.storage` correctly).

### Review Process

*   **Automated Gate:** Build, Test, and Lint (CI) must pass (Status: Green).
*   **Peer Review:** A maintainer will review the logic, architecture, security implications (especially regarding browser permissions and API keys), and adherence to the Apex Principles.

## 5. Reporting Issues and Security Vulnerabilities

### Non-Security Bugs

Use the standard issue template located at `.github/ISSUE_TEMPLATE/bug_report.md`.

### Security Vulnerabilities (Immediate Action)

If you discover a security vulnerability, **DO NOT** open a public issue.

1.  Follow the guidelines detailed in **`.github/SECURITY.md`**.
2.  Contact the maintainer (`chirag127`) privately via email or GitHub direct message.

--- 

*Thank you for contributing to the future of intelligent productivity tools.*