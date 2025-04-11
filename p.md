Here’s a complete **Product Requirements Document (PRD)** for your YouTube Summarizer + Read-Aloud browser extension:

---

# 📄 Product Requirements Document (PRD)
## Project Name: **TubeSumTalk**
**Description**: A browser extension that summarizes YouTube videos and reads the summary aloud with word-by-word highlighting in a sidebar.

---

## 🧩 1. Goals
- Allow users to view a concise summary of any YouTube video in a sidebar.
- Provide a “Read Aloud” feature for the summary with real-time word-by-word highlighting.
- Work across Chrome, Edge, and Firefox.

---

## 🖥️ 2. Functional Requirements

### 🔹 2.1 Sidebar UI
- Inject a collapsible sidebar into YouTube video pages.
- Sidebar contains:
  - Video title and thumbnail.
  - Summary content.
  - “Summarize” button.
  - “Read Aloud” button with pause/play control.
  - Voice speed & pitch settings (optional).

### 🔹 2.2 Summarization Flow
- On clicking “Summarize”, the extension:
  - Extracts video ID.
  - Sends request to backend with video URL/ID.
  - Backend uses `yt-dlp` to extract subtitles (or auto-generates them if missing).
  - Summarization is handled by Gemini 2.0 Flash Lite via FastAPI.
  - Summary is returned and displayed in the sidebar.

### 🔹 2.3 Read-Aloud Flow
- Clicking “Read Aloud”:
  - Uses Web Speech API (TTS) to read the summary.
  - Highlights the current word being spoken using `range.getBoundingClientRect()` or DOM span-wrapping.
  - Supports pause/resume functionality.

---

## 🛠️ 3. Technical Requirements

### ✅ 3.1 Frontend (Browser Extension)
- **Tech**: Manifest V3, HTML, CSS, JavaScript
- **Browser Support**: Chrome, Edge, Firefox
- **Key Components**:
  - `content.js`: Inject sidebar and handle DOM interaction.
  - `sidebar.html`: Layout of the sidebar.
  - `sidebar.js`: Logic for fetching summary, handling TTS, highlighting.
  - `background.js`: Optional for long-lived communication.

### ✅ 3.2 Backend (FastAPI)
- **Tech**: Python + FastAPI
- **Endpoints**:
  - `POST /summarize`: Accepts YouTube URL or video ID, returns summary.
    - Uses `yt-dlp` to extract subtitles.
    - Converts to transcript text.
    - Sends to Gemini 2.0 Flash Lite for summarization.
- **AI Provider**: Gemini 2.0 Flash Lite API (OpenRouter or Google endpoint)

### ✅ 3.3 Project Structure
```
project-root/
├── extension/
│   ├── manifest.json
│   ├── content.js
│   ├── sidebar.html
│   ├── sidebar.css
│   └── sidebar.js
├── backend/
│   ├── main.py
│   ├── utils/
│   │   ├── yt_subtitles.py
│   │   └── gemini_api.py
│   └── requirements.txt
```

---

## 📦 4. Non-Functional Requirements
- Response time: Summary generation ≤ 10 seconds.
- Sidebar UI must be responsive and minimal.
- Should gracefully handle videos without subtitles (notify the user).
- TTS voice should default to a natural English voice.

---

## 🧪 5. Testing & QA
- Unit tests for `yt_subtitles.py` and `gemini_api.py`.
- Manual tests across Chrome, Edge, and Firefox.
- Edge cases:
  - Videos without subtitles.
  - Long videos (handle transcript length via chunking).

---

## 🚀 6. other Enhancements
- Allow summary export (PDF, Markdown).
- Add support for multi-language subtitles.
- Allow choosing between short, medium, and detailed summaries.
- Add a transcript viewer with jump-to-timestamp.


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

Use the web search if any help is needed in the implementation of this browser extension. Also use the sequential thinking mcp server wherever possible
