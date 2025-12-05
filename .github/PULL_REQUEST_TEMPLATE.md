# Pull Request Template

**This template guides the submission of Pull Requests to ensure quality, maintainability, and alignment with project standards.**

## 1. PR Checklist

Before submitting your Pull Request, please ensure you have reviewed and completed the following:

*   [ ] **New Feature Branch:** My changes are based on a new branch (`feature/short-description` or `fix/issue-number`).
*   [ ] **Code Style & Linting:** Code adheres to the project's established style guide and passes all linter checks (e.g., Ruff for Python, Prettier/ESLint for JS/TS).
*   [ ] **Testing:** All new and existing tests pass. Unit tests are included for new functionality.
*   [ ] **Documentation:** Relevant documentation (README, code comments) has been updated to reflect the changes.
*   [ ] **Security:** No new security vulnerabilities have been introduced. Sensitive information is not hardcoded.
*   [ ] **Dependencies:** If new dependencies were added, they have been vetted and added to the appropriate lock file.
*   [ ] **Meaningful Commits:** Commit messages are clear, concise, and follow conventional commit standards (e.g., `feat:`, `fix:`, `docs:`, `refactor:`, `test:`).
*   [ ] **Rebased:** The branch has been rebased onto the latest `main` branch.
*   [ ] **Self-Review:** I have reviewed my own code at least once before submitting.

## 2. Description of Changes

*   **What was changed?**
    *   (Clearly and concisely describe the main purpose of this PR. What problem does it solve? What feature does it add?)
*   **Why was this change necessary?**
    *   (Explain the rationale behind the changes. Link to any relevant issues or discussions.)
*   **How was this change implemented?**
    *   (Briefly explain the technical approach taken.)

## 3. Related Issues

*   (Link to any GitHub Issues that this PR addresses, e.g., `Closes #123`, `Fixes #456`)

## 4. Screenshots/Recordings (if applicable for UI/UX changes)

*   (Include before/after screenshots or short GIF recordings to demonstrate UI changes.)

## 5. Additional Context

*   (Provide any other context that might be helpful for reviewers, such as potential side effects, performance considerations, or areas that require extra attention.)

--- 

**Reviewers:** Please focus on the following aspects:

*   Code correctness and logic.
*   Adherence to architectural patterns (see AGENTS.md for directives).
*   Test coverage and effectiveness.
*   Clarity of code and documentation.
*   Potential performance bottlenecks or security concerns.
