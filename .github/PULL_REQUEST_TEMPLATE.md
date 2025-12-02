# Pull Request Template: Apex Integration Review

**Project:** TubeSumTalk - YouTube Video Summarizer Browser Extension

This template ensures your contribution meets the **Zero-Defect, High-Velocity, Future-Proof** standard mandated by the Apex Technical Authority.

--- 

## 1. Summary of Changes

<!-- Briefly describe the purpose of this PR. Link to any relevant issue using `Closes #<IssueNumber>`. -->

- **Type of Change:** (e.g., Feature, Bug Fix, Refactoring, Documentation, CI/CD)
- **What this PR achieves:** 

---

## 2. Architectural Verification

<!-- Confirm adherence to the established architecture (e.g., FSD, SOLID, DRY). -->

### 2.1. Architectural Compliance Checklist

- [ ] **SOLID Principles Applied:** Are classes/modules single-responsibility? (Especially crucial for API handlers and UI logic).
- [ ] **DRY Enforcement:** Have repeated code segments been abstracted into reusable modules?
- [ ] **State Management Integrity:** If applicable, is state handled immutably and predictably (using Signals/Zustand/etc.)?
- [ ] **Security Review:** Have all new user inputs been sanitized against XSS/CSRF vectors (critical for Browser Extensions)?
- [ ] **AI Interface Robustness:** If Gemini interaction changed, is error handling for API failures (`429`, network timeout) robust?

---

## 3. Code Quality & Testing

<!-- Detail testing performed and adherence to linting standards. -->

### 3.1. Testing Procedures

- [ ] **Unit Tests:** Have new or modified functions been covered by Vitest/Jest unit tests? (Minimum 80% coverage target).
- [ ] **E2E/Integration Tests:** If UI flow changes, have Playwright scenarios been updated or created?
- [ ] **Manual Verification:** (Describe brief manual steps taken to confirm functionality in a real browser environment, e.g., "Tested summary generation on a 30-min video.")

### 3.2. Linting & Formatting

- [ ] **Biome Check:** Did `npx @biomejs/biome check .` pass successfully?
- [ ] **Format Check:** Did `npx @biomejs/biome format --write .` resolve all formatting issues?

---

## 4. Documentation Artifacts

<!-- Changes to documentation must be explicitly called out. -->

- [ ] **README.md Update:** Are the new features/changes reflected in the main README?
- [ ] **AGENTS.md Compliance:** If architecture changed, has the relevant section in `.github/AGENTS.md` been updated to reflect the new stack/patterns?
- [ ] **In-Code Comments:** Are complex sections clearly annotated using JSDoc/TSDoc standards?

---

## 5. Reviewer Notes

<!-- Add specific instructions for the reviewer, areas to focus on, or known limitations of this PR. -->

*Self-Correction Notes:*

<!-- --- -->