Here's the full **Product Requirements Document (PRD)** for your **YouTube Video Summarizer + Read Aloud Sidebar Extension**:

---

# **Product Requirements Document (PRD)**
**Product Name:** YouTube Video Summarizer + Read Aloud Sidebar
**Platform:** Browser Extension (Chrome, Edge, Firefox)
**Owner:** chirag127
**Last Updated:** April 11, 2025

---

## **1. Overview**

The **YouTube Video Summarizer + Read Aloud Sidebar Extension** is a browser extension that automatically summarizes YouTube videos and displays the summary in a sidebar on the video page. Additionally, it offers a "Read Aloud" feature that speaks the summary out loud with real-time, word-by-word highlighting.

---

## **2. Goals**

- Summarize YouTube videos using AI.
- Display summary in a non-intrusive sidebar.
- Provide a Read Aloud feature with word-level highlighting.
- Support multiple browsers: Chrome, Edge, Firefox.
- Maintain fast, smooth UX with secure AI processing.

---

## **3. Features**

### **3.1. Auto Summary Generation**
- Automatically detect when a user is on a YouTube video page.
- Extract the transcript using **yt-dlp** in the backend.
- Send transcript to **Gemini 2.0 Flash Lite** via backend for summarization.
- Display the summary in the extension's sidebar.

### **3.2. Sidebar UI**
- Toggleable sidebar on the right of the YouTube video.
- Displays:
  - Title of video
  - AI-generated summary
  - "Read Aloud" play/pause buttons
  - Settings icon (for TTS settings)
- Resizable and draggable interface.

### **3.3. Read Aloud with Word Highlighting**
- Reads the summary using the Web Speech API (or fallback to backend TTS).
- Highlights each word as it’s spoken using bounding boxes or inline `<span>` highlights.
- Word sync based on `SpeechSynthesisUtterance.onboundary`.

### **3.4. Compatibility**
- Works on:
  - Chrome
  - Microsoft Edge
  - Firefox (polyfill for Web Speech API if needed)

### **3.5. Settings**
- Playback speed, voice selection, and pitch.
- Save user preferences to `chrome.storage.sync`.

---

## **4. Technical Architecture**

### **4.1. Frontend (extension/)**
- **Manifest V3**
- Content script:
  - Injects sidebar into YouTube pages.
  - Detects video URL change (YouTube uses SPA routing).
- Background service worker:
  - Handles messaging and API calls.
- Sidebar HTML + CSS + JS:
  - UI/UX for summary and TTS controls.
  - Calls backend for summary.
  - TTS and word-by-word highlight rendering.

### **4.2. Backend (backend/)**
- **Express.js API Server**
  - `/summarize`: Accepts YouTube video ID, fetches transcript via yt-dlp, calls Gemini API to summarize.
  - `/transcript`: Optional endpoint for raw transcript.
- **Gemini 2.0 Flash Lite API Integration**
  - Used to generate AI summary.
- **yt-dlp Integration**
  - Fetches subtitles/transcripts (preferably in English).
  - Fallback to auto-generated if needed.

---

## **5. Project Structure**

```
project-root/
│
├── extension/                   # Browser extension frontend
│   ├── manifest.json
│   ├── content.js               # Injects UI and manages DOM interactions
│   ├── sidebar.html             # Sidebar container
│   ├── sidebar.js               # Handles summary display, TTS
│   ├── styles.css               # Sidebar styling
│   └── utils/                   # Utility functions (e.g., storage, debounce)
│
├── backend/                     # Backend server
│   ├── server.js
│   ├── routes/
│   │   ├── summarize.js         # Summarization endpoint
│   │   └── transcript.js        # Transcript fetcher
│   ├── services/
│   │   ├── geminiService.js     # Gemini 2.0 Flash Lite wrapper
│   │   └── ytdlpService.js      # yt-dlp integration
│   └── .env
│
├── README.md
└── package.json
```

---

## **6. User Flow**

1. User visits a YouTube video page.
2. Content script detects video URL.
3. Sidebar is injected into the page.
4. Request is sent to the backend with the video ID.
5. Backend fetches transcript and generates summary.
6. Summary is displayed in the sidebar.
7. User clicks “Read Aloud” → TTS starts and highlights each word as it's spoken.

---

## **7. APIs**

### **Frontend → Backend**
- `POST /summarize`
  - `body: { videoId: string }`
- `GET /transcript/:videoId`

### **Backend → Gemini**
- `POST /v1/generate`
  - `prompt: Transcript text`
  - `model: gemini-2.0-flash-lite`

---

## **8. Non-Functional Requirements**

- Responsive, fast-loading sidebar (under 1s for render).
- Summary returned within ~3s of transcript download.
- Secure backend with rate limiting.
- TTS support in both Chrome and Firefox.

---

## **9. Future Enhancements**

- Support multilingual transcripts and summaries.
- Add "Save Summary" to Notion/Docs.
- Export as audio (MP3).
- Summarization styles: Bullet points, TL;DR, Time-stamped.

---

## **10. Milestones**

| Milestone                     | Timeline        |
|------------------------------|-----------------|
| Project scaffolding           | Day 1           |
| Sidebar UI and TTS           | Day 2–3         |
| Backend APIs (yt-dlp + Gemini)| Day 4–5         |
| Full integration + testing   | Day 6–7         |
| Cross-browser packaging      | Day 8           |
| Deployment and polishing     | Day 9–10        |

---


this following is example code for gemeni 2.0 flash lite api
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const fs = require("node:fs");
const mime = require("mime-types");

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseModalities: [
  ],
  responseMimeType: "text/plain",
};

async function run() {
  const chatSession = model.startChat({
    generationConfig,
    history: [
    ],
  });

  const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
  // TODO: Following code needs to be updated for client-side apps.
  const candidates = result.response.candidates;
  for(let candidate_index = 0; candidate_index < candidates.length; candidate_index++) {
    for(let part_index = 0; part_index < candidates[candidate_index].content.parts.length; part_index++) {
      const part = candidates[candidate_index].content.parts[part_index];
      if(part.inlineData) {
        try {
          const filename = `output_${candidate_index}_${part_index}.${mime.extension(part.inlineData.mimeType)}`;
          fs.writeFileSync(filename, Buffer.from(part.inlineData.data, 'base64'));
          console.log(`Output written to: ${filename}`);
        } catch (err) {
          console.error(err);
        }
      }
    }
  }
  console.log(result.response.text());
}

run();

 use the sequential thinking mcp server wherever possible
