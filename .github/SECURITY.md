# SECURITY POLICY

## Supported Versions

We are committed to providing a secure product. The following versions are actively maintained and receive security updates:

| Version | Supported          |
|---------|--------------------|
| Latest  | :white_check_mark: |

As this is a browser extension, updates are typically pushed automatically to users through their respective browser's extension store once approved. We strive to address security vulnerabilities promptly.

## Reporting a Vulnerability

We appreciate your efforts to responsibly discover and disclose security vulnerabilities in **TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension**. This is an open-source project, and we encourage security researchers to help us improve its security.

If you find a security vulnerability, please follow these steps:

1.  **Do NOT disclose the vulnerability publicly.** Do not create a public issue or post on social media.
2.  **Send an email to `chirag127@users.noreply.github.com`** with the subject line `Security Vulnerability Report`.
3.  In your email, please include:
    *   A detailed description of the vulnerability.
    *   Steps to reproduce the vulnerability.
    *   The affected version(s) (if applicable, though for browser extensions, it's usually the latest).
    *   Any proof-of-concept code or screenshots.
    *   Your recommended mitigation or fix (if you have one).
4.  We will acknowledge your report within **48 hours**. 
5.  We will work to address the vulnerability as quickly as possible and will inform you of our progress. We may also offer public acknowledgement of your contribution once the vulnerability is resolved and a fix is deployed.

## Security Best Practices

As a browser extension relying on AI and external APIs (like Google Gemini), we adhere to the following security principles:

*   **Minimize Permissions:** The extension requests only the necessary permissions to function.
*   **Input Validation:** All user inputs and data fetched from external sources are validated and sanitized.
*   **Secure API Keys:** API keys are managed securely and are not hardcoded directly into client-side code. For browser extensions, this often involves server-side proxies or secure background script handling.
*   **Dependency Management:** We use `uv` for dependency management and regularly scan for known vulnerabilities in our dependencies.
*   **Code Obfuscation (Consideration):** While not a primary security measure, the build process may include steps to make reverse-engineering more difficult, particularly for sensitive parts of the logic.
*   **User Data Privacy:** We are committed to protecting user privacy. Please refer to our `PRIVACY.md` (if applicable) for more details.

This policy is inspired by industry best practices and aims to foster a collaborative approach to security. Thank you for helping keep **TubeSumTalk-YouTube-Video-Summarizer-Browser-Extension** secure!

***

*Last updated: December 2025* (Based on Apex Technical Authority Standards)