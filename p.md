
**TubeSumTalk - Product Requirements Document (PRD)**

**Document Version:** 1.0
**Last Updated:** 2024-07-26
**Owner:** Chirag Singhal
**Status:** Final
**Prepared for:** AI Code Assistant (augment code assistant)
**Prepared by:** Chirag Singhal

---

**1. Introduction & Overview**

*   **1.1. Purpose**
    *   This document outlines the requirements for TubeSumTalk, a browser extension designed to enhance the YouTube viewing experience by providing AI-powered video summaries, text-to-speech playback with visual feedback, and direct Q&A capabilities based on video transcripts. It serves as the primary specification for the AI development agent.
*   **1.2. Problem Statement**
    *   Users often spend significant time watching YouTube videos to find specific information or determine relevance. Sifting through long videos can be inefficient. Additionally, users may prefer auditory consumption of summaries or benefit from visual aids while listening. There's also a need to quickly ask questions about the video content without re-watching segments.
*   **1.3. Vision / High-Level Solution**
    *   TubeSumTalk aims to make YouTube consumption more efficient and accessible. It will operate as a browser extension that automatically analyzes video transcripts to provide various summary formats via Gemini AI. It will offer text-to-speech functionality with real-time highlighting and allow users to ask specific questions about the video content, leveraging their own Gemini API key for AI interactions via a dedicated backend.

**2. Goals & Objectives**

*   **2.1. Business Goals**
    *   Provide a valuable tool for YouTube users to enhance productivity and accessibility.
    *   Create a seamless and intuitive user experience within the YouTube interface.
    *   Empower users by allowing them to use their own AI API keys.
*   **2.2. Product Goals**
    *   Deliver accurate and concise video summaries in multiple formats and lengths.
    *   Provide clear and customizable text-to-speech playback of summaries.
    *   Enable users to ask questions about the video transcript and receive AI-generated answers.
    *   Ensure reliable performance across supported browsers (Chrome, Edge, Firefox).
    *   Maintain user privacy and security, especially concerning API keys.
    *   Achieve a high-quality, production-ready state with thorough testing and documentation.
*   **2.3. Success Metrics (KPIs)**
    *   Number of active installations.
    *   Frequency of summary generation and Q&A usage per user session.
    *   User satisfaction ratings (via browser extension store reviews).
    *   Low error rates reported through extension monitoring (if implemented).
    *   Successful completion rate of summary generation and Q&A requests.

**3. Scope**

*   **3.1. In Scope**
    *   Browser extension compatible with Chrome, Edge, and Firefox.
    *   Automatic detection of YouTube video pages.
    *   Transcript extraction (assuming availability via YouTube).
    *   Integration with a Node.js/Express backend for AI processing.
    *   Backend integration with Google Gemini AI (specifically `gemini-2.5-flash-preview-04-17` using the provided code structure).
    *   Generation of summaries (Bullet points, Brief, Detailed, Key points, Chapter markers) with length options (short, medium, long).
    *   Q&A feature: Sending transcript + user question to the backend, receiving AI answer.
    *   Text-to-Speech (TTS) using Web Speech API (with polyfills for Firefox if necessary).
    *   Real-time word highlighting during TTS playback.
    *   Customizable TTS options (voice, speed [0.5x-16x], pitch).
    *   Persistence of user settings (TTS preferences, sidebar width, API Key).
    *   UI: Collapsible/resizable sidebar integrated into YouTube page, widget in related videos section.
    *   Light/Dark theme support (matching YouTube's theme).
    *   Markdown support for summary display.
    *   User input field for entering their Google Gemini API key within the extension settings.
    *   Secure client-side storage of the user's API key.
    *   Backend handling of API requests to Gemini, using the user-provided key relayed from the extension.
    *   Loading indicators and user-friendly error handling for API calls, transcript fetching, etc.
    *   Well-documented, maintainable, and production-ready code following best practices.
    *   Comprehensive testing (unit, integration, end-to-end).
*   **3.2. Out of Scope**
    *   Support for video platforms other than YouTube.com.
    *   User accounts or authentication beyond the user-provided API key.
    *   Saving/exporting summaries or Q&A history.
    *   Summarization of live streams.
    *   Support for videos without available transcripts.
    *   Providing API keys to users.
    *   Advanced backend features like user management, usage analytics dashboard, centralized billing.
    *   Mobile app version.

**4. User Personas & Scenarios**

*   **4.1. Primary Persona(s)**
    *   **Alex (Student/Researcher):** Needs to quickly understand the content of educational videos or lectures to decide if they are relevant for research or study without watching them entirely. Uses Q&A to find specific facts mentioned.
    *   **Priya (Busy Professional):** Wants to stay updated on industry news or tutorials shared on YouTube but has limited time. Uses summaries and TTS during commutes or breaks.
    *   **Sam (Accessibility User):** Benefits from text-based summaries and TTS with highlighting as an alternative or supplement to video/audio content.
*   **4.2. Key User Scenarios / Use Cases**
    *   **Quick Relevance Check:** User opens a YouTube video, clicks "Generate Brief Summary" in the TubeSumTalk sidebar, reads it, and decides whether to watch the full video.
    *   **Extracting Key Information:** User watches a tutorial, uses "Generate Key Points" to get a quick reference list, and asks "What was the command mentioned for installing the library?" using the Q&A feature.
    *   **Auditory Learning:** User generates a "Detailed Summary" for a long lecture video and uses the TTS feature to listen to it while doing other tasks, adjusting the speed for comprehension.
    *   **Setting Up:** User installs the extension, navigates to settings, enters their Gemini API key, and saves it.
    *   **Customizing Experience:** User adjusts the TTS voice, speed, and pitch to their preference. User resizes the sidebar and the width persists. User switches YouTube to Dark Mode, and the extension UI adapts.

**5. User Stories**

*   **US1:** As a user, I want the extension to automatically detect when I am on a YouTube video page so that I can easily access its features.
*   **US2:** As a user, I want to be able to generate different types of summaries (bullet points, brief, detailed, key points, chapters) so that I can choose the format that best suits my needs.
*   **US3:** As a user, I want to select the desired length (short, medium, long) for the summary so that I can control the level of detail.
*   **US4:** As a user, I want the generated summary to be displayed clearly in a sidebar on the YouTube page.
*   **US5:** As a user, I want to listen to the summary using Text-to-Speech so that I can consume the information audibly.
*   **US6:** As a user, I want to see words highlighted in real-time as they are read aloud so that I can follow along easily.
*   **US7:** As a user, I want to customize the TTS voice, speed, and pitch so that the listening experience is comfortable for me.
*   **US8:** As a user, I want my TTS settings to be saved so that I don't have to configure them every time.
*   **US9:** As a user, I want to input my own Gemini API key in the extension's settings so that I can use the AI features under my own account/quota.
*   **US10:** As a user, I want my API key to be stored securely within the browser extension.
*   **US11:** As a user, I want to ask specific questions about the video's content based on its transcript so that I can find information quickly.
*   **US12:** As a user, I want the extension's UI (sidebar/widget) to support both light and dark themes to match YouTube's appearance.
*   **US13:** As a user, I want to resize the sidebar and have its width saved for future visits.
*   **US14:** As a user, I want to see loading indicators during AI processing and clear error messages if something goes wrong (e.g., no transcript, API error).
*   **US15:** As a user, I want the extension to work reliably on Chrome, Edge, and Firefox.
*   **US16:** As a user, I want summaries presented with markdown formatting for better readability (e.g., bolding, lists).

**6. Functional Requirements (FR)**

*   **6.1. Core Extension Logic**
    *   **FR1.1:** The extension MUST activate automatically on `youtube.com/watch?v=*` URLs.
    *   **FR1.2:** The extension MUST attempt to extract the video transcript upon activation or user request. Handle cases where transcripts are unavailable gracefully.
    *   **FR1.3:** The extension MUST provide a mechanism (e.g., button) to trigger summary generation.
    *   **FR1.4:** The extension MUST provide an input field and button for users to submit questions related to the transcript.
    *   **FR1.5:** The extension MUST send the transcript (or relevant parts) and user request (summary type/length or question) to the backend service.
    *   **FR1.6:** The extension MUST securely retrieve the user-stored API key and include it in requests to the backend.
    *   **FR1.7:** The extension MUST receive the AI-generated summary or answer from the backend.
    *   **FR1.8:** The extension MUST display the received summary/answer in the designated UI area.
    *   **FR1.9:** The extension MUST store user preferences (TTS settings, sidebar width, API key) using appropriate browser storage APIs (e.g., `chrome.storage.local` or `browser.storage.local`).
    *   **FR1.10:** The extension MUST provide a settings interface for managing the API key and TTS preferences.
*   **6.2. AI Interaction (Backend)**
    *   **FR2.1:** The backend MUST expose secure endpoints to receive requests (transcript, request type, parameters, user question, API key) from the extension.
    *   **FR2.2:** The backend MUST interact with the Google Gemini API (`gemini-2.5-flash-preview-04-17`) using the API key provided in the request.
    *   **FR2.3:** The backend MUST use the exact JavaScript code structure provided (see Appendix) for Gemini API interaction, inserting the appropriate input (transcript + prompt for summary/Q&A).
    *   **FR2.4:** The backend MUST construct appropriate prompts for Gemini based on the requested summary type (Bullet points, Brief, Detailed, Key points, Chapter markers), length (short, medium, long), or user question.
    *   **FR2.5:** The backend MUST handle potential errors from the Gemini API (e.g., rate limits, invalid key, content filtering) and return appropriate error responses to the extension.
    *   **FR2.6:** The backend MUST return the AI-generated text (summary or answer) to the extension.
    *   **FR2.7:** The backend MUST be designed for efficient handling of potentially large transcripts and concurrent requests (within the limits of the chosen hosting/architecture).
*   **6.3. User Interface (Extension Frontend)**
    *   **FR3.1:** The extension MUST inject a collapsible sidebar UI element onto the YouTube video page (typically right side).
    *   **FR3.2:** The extension MUST inject a small widget/button in the related videos section as an alternative access point or indicator.
    *   **FR3.3:** The sidebar MUST contain controls for generating summaries (type/length selection), asking questions (input field, submit button), displaying results, and accessing settings.
    *   **FR3.4:** The sidebar MUST be resizable by the user, and the chosen width MUST persist.
    *   **FR3.5:** The UI MUST adapt its color scheme (light/dark) based on YouTube's current theme.
    *   **FR3.6:** The extension MUST display loading indicators while waiting for transcript extraction or AI responses.
    *   **FR3.7:** The extension MUST display clear, user-friendly error messages within the UI if operations fail.
    *   **FR3.8:** Summaries and answers MUST be displayed with Markdown formatting rendered correctly (lists, bolding, etc.).
*   **6.4. Text-to-Speech (Extension Frontend)**
    *   **FR4.1:** The extension MUST provide a "Play" button to initiate TTS for the displayed summary/answer.
    *   **FR4.2:** The extension MUST use the Web Speech API (`speechSynthesis`) for TTS. Polyfills MUST be included if necessary for Firefox compatibility.
    *   **FR4.3:** During TTS playback, the word currently being spoken MUST be visually highlighted in the displayed text.
    *   **FR4.4:** Users MUST be able to select from available system voices.
    *   **FR4.5:** Users MUST be able to adjust playback speed (rate) from 0.5x to 16x.
    *   **FR4.6:** Users MUST be able to adjust the voice pitch.
    *   **FR4.7:** TTS playback MUST be pausable and stoppable.
    *   **FR4.8:** User-selected voice, rate, and pitch settings MUST persist across sessions.

**7. Non-Functional Requirements (NFR)**

*   **7.1. Performance**
    *   **NFR1.1:** Transcript extraction should ideally complete within 2-3 seconds of page load or user request (network dependent).
    *   **NFR1.2:** UI injection and rendering should not noticeably impact YouTube page load performance.
    *   **NFR1.3:** AI summary/Q&A generation time is dependent on Gemini API, but the extension/backend should add minimal overhead (<1 second excluding API time). Loading indicators must be used.
    *   **NFR1.4:** TTS playback should start promptly (<1 second) after clicking play. Highlighting should be synchronised accurately.
*   **7.2. Scalability**
    *   **NFR2.1:** The backend service must be stateless or manage state appropriately to handle multiple concurrent users/requests (consider serverless functions or a scalable Node.js hosting solution).
    *   **NFR2.2:** Backend must handle potential rate limiting from the Gemini API gracefully (e.g., return informative errors to the user). Note: Since users use their own keys, rate limits are per-user.
*   **7.3. Usability**
    *   **NFR3.1:** The extension's UI must be intuitive and easy to use within the context of the YouTube interface.
    *   **NFR3.2:** Controls must be clearly labelled and accessible.
    *   **NFR3.3:** Error messages must be user-friendly and informative.
    *   **NFR3.4:** The extension should feel like a natural part of the YouTube experience.
*   **7.4. Reliability / Availability**
    *   **NFR4.1:** The extension should function correctly across the specified browsers and their recent versions.
    *   **NFR4.2:** The backend service should aim for high availability (e.g., 99.9%).
    *   **NFR4.3:** Graceful handling of edge cases (no transcript, network errors, API errors, YouTube UI changes) is required.
*   **7.5. Security**
    *   **NFR5.1:** The user's Gemini API key MUST be stored securely on the client-side (e.g., using `chrome.storage.local`) and MUST NOT be transmitted or stored unnecessarily. It should only be sent to the dedicated backend over HTTPS for the explicit purpose of making the Gemini API call.
    *   **NFR5.2:** Communication between the extension and the backend MUST use HTTPS.
    *   **NFR5.3:** The backend MUST NOT log or store user API keys.
    *   **NFR5.4:** Implement basic security measures on the backend endpoint (e.g., CORS configuration, input validation) to prevent abuse.
*   **7.6. Accessibility**
    *   **NFR6.1:** UI elements (buttons, controls) should be keyboard accessible and follow basic ARIA guidelines where applicable.
    *   **NFR6.2:** Color contrast in both light and dark themes should meet WCAG AA standards.
    *   **NFR6.3:** The TTS feature itself enhances accessibility.
*   **7.7. Maintainability**
    *   **NFR7.1:** Code MUST be well-documented (comments, READMEs).
    *   **NFR7.2:** Code MUST follow established best practices for JavaScript, Node.js, and browser extension development.
    *   **NFR7.3:** The project structure MUST follow the specified `extension/` and `backend/` separation.
    *   **NFR7.4:** Code should be modular and organized for easy understanding and modification.

**8. UI/UX Requirements & Design**

*   **8.1. Wireframes / Mockups**
    *   *(Placeholder: To be provided or developed. Conceptual description: A vertically collapsible panel on the right, matching YouTube's style. Contains dropdowns/buttons for summary options, a text area for results, TTS controls below the text area, a text input for Q&A, and a settings icon/link. Widget in related videos is a simple branded button/icon).*
*   **8.2. Key UI Elements**
    *   Collapsible Sidebar Panel
    *   Summary Type Selection (Dropdown/Buttons)
    *   Summary Length Selection (Dropdown/Buttons)
    *   "Generate Summary" Button
    *   Summary Display Area (Scrollable Text Area supporting Markdown)
    *   Q&A Input Field
    *   "Ask Question" Button
    *   Q&A Display Area (can reuse/append to summary area)
    *   TTS Controls (Play/Pause/Stop Button, Voice Selector, Speed Slider/Input, Pitch Slider/Input)
    *   Loading Indicator (e.g., spinner)
    *   Error Message Display Area
    *   Settings Access (e.g., Gear Icon)
    *   Settings Panel/Modal (API Key Input, Save Button, TTS Defaults)
    *   Resizable Handle for Sidebar
    *   Related Videos Section Widget/Button
*   **8.3. User Flow Diagrams**
    *   *(Placeholder: To be provided or developed. Key flows: 1. Generating a summary. 2. Asking a question. 3. Playing TTS. 4. Configuring settings/API Key.)*

**9. Data Requirements**

*   **9.1. Data Model**
    *   **Client-Side Storage (`browser.storage.local`):**
        *   `userApiKey`: string (User's Gemini API Key)
        *   `ttsSettings`: object { `voiceURI`: string, `rate`: float (0.5-16), `pitch`: float (0-2) }
        *   `sidebarWidth`: integer (in pixels)
    *   **Data in Transit (Extension <-> Backend):**
        *   Request (Summarize): `{ apiKey: string, transcript: string, type: string, length: string }`
        *   Request (Q&A): `{ apiKey: string, transcript: string, question: string }`
        *   Response (Success): `{ result: string }` (where result is the summary or answer)
        *   Response (Error): `{ error: string }`
*   **9.2. Data Migration**
    *   Not applicable for v1.0 unless upgrading existing storage structure.
*   **9.3. Analytics & Tracking**
    *   Out of scope for v1.0, but backend could be designed to allow anonymous usage counts later if needed (without logging PII or API keys).

**10. Release Criteria**

*   **10.1. Functional Criteria**
    *   All features listed in "In Scope" (Section 3.1) and Functional Requirements (Section 6) are implemented and working correctly.
    *   Extension successfully loads and operates on latest stable versions of Chrome, Edge, and Firefox.
    *   Summary generation works for various video types (with transcripts).
    *   Q&A functionality works as expected.
    *   TTS with highlighting and customization functions correctly.
    *   API key handling is secure and functional.
    *   Settings persistence works reliably.
    *   Light/Dark themes adapt correctly.
    *   Error handling is implemented and user-friendly.
*   **10.2. Non-Functional Criteria**
    *   Performance targets (NFR1.x) are met under typical conditions.
    *   Security requirements (NFR5.x) are implemented and verified (code review, basic testing).
    *   Usability (NFR3.x) is acceptable based on internal review/testing.
    *   Reliability (NFR4.x): No critical bugs or crashes identified during testing.
    *   Accessibility (NFR6.x): Basic checks for keyboard navigation and contrast pass.
    *   Maintainability (NFR7.x): Code is documented, follows structure, adheres to best practices.
*   **10.3. Testing Criteria**
    *   Unit tests cover critical backend logic (API interaction, prompt generation) and frontend utilities (if any).
    *   Integration tests verify communication between extension and backend.
    *   End-to-end tests cover key user scenarios (generating summary, Q&A, TTS playback, settings changes) on all supported browsers.
    *   Manual testing confirms UI/UX, responsiveness, theme switching, and error handling across browsers.
    *   Security review of API key handling.
*   **10.4. Documentation Criteria**
    *   README files for both `extension/` and `backend/` directories detailing setup, build, and deployment instructions.
    *   Code comments explaining complex logic.
    *   This PRD serves as the primary requirements documentation.

**11. Open Issues / Future Considerations**

*   **11.1. Open Issues**
    *   Confirm specific method for robust YouTube transcript extraction (e.g., monitoring network requests, using hidden APIs, content scripts interacting with DOM – needs investigation for reliability against YouTube updates).
    *   Web Speech API compatibility and potential need for polyfills in Firefox needs verification during development.
*   **11.2. Future Enhancements (Post-Launch)**
    *   Support for more languages (summarization and TTS).
    *   Saving/history of summaries and Q&A.
    *   Option to choose different AI models.
    *   Integration with other video platforms.
    *   User accounts for syncing settings/history.
    *   More advanced analytics (opt-in).
    *   Ability to summarize specific sections/chapters of a video.

**12. Appendix & Glossary**

*   **12.1. Glossary**
    *   **AI:** Artificial Intelligence
    *   **API:** Application Programming Interface
    *   **TTS:** Text-to-Speech
    *   **UI:** User Interface
    *   **UX:** User Experience
    *   **Gemini:** Google's family of AI models.
    *   **Web Speech API:** Browser API for speech synthesis and recognition.
    *   **PRD:** Product Requirements Document
*   **12.2. Related Documents**
    *   *(Link to Wireframes/Designs if available)*
*   **12.3. Required Gemini Integration Code (Backend)**
    *   The backend **MUST** use the following structure for interacting with the Gemini API:
    IMPORTANT: use the following code strictly for the gemini integration:
```javascript
// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import {
  GoogleGenAI,
} from '@google/genai';

async function main() {
  const ai = new GoogleGenAI({
  });
  const config = {
    responseMimeType: 'text/plain',
  };
  const model = 'gemini-2.5-flash-preview-04-17';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `INSERT_INPUT_HERE`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  for await (const chunk of response) {
    console.log(chunk.text);
  }
}

main();
```

    ```
    *   **Note to AI Agent:** Ensure robust error handling around this API call. Handle the user's API key securely, passing it directly from the request to the `GoogleGenAI` constructor. Do not store or log the key on the backend. Adapt the function signature and error handling for use within the Node.js/Express framework. Implement logic to construct the `inputText` (prompt) based on the user's specific request (summary type/length or Q&A) and the provided transcript. Choose between `generateContent` (simpler) or `generateContentStream` based on whether streaming responses back to the extension is a requirement (currently PRD implies a single response is sufficient, favouring `generateContent` unless streaming is explicitly desired later).

**13. Document History / Revisions**

*   **Version 1.0 (2024-07-26):** Initial draft based on user description and requirements. Author: Chirag Singhal.
