# YouTube Video Summarizer + Read Aloud Sidebar Extension

## Overview

A browser extension for Chrome, Edge, and Firefox that summarizes YouTube videos using AI and displays the summary in a sidebar. Includes a "Read Aloud" feature with word-by-word highlighting.

## Features

- Auto-detects YouTube video pages and fetches video transcript.
- Summarizes video using Gemini 2.0 Flash Lite via backend.
- Sidebar UI with summary, TTS controls, and settings.
- Read Aloud with real-time word highlighting.
- Settings for TTS (voice, speed, pitch) saved in browser sync storage.
- Works on Chrome, Edge, and Firefox.

## Project Structure

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

## Setup

### Backend

1. `cd backend`
2. `npm install`
3. Create `.env` with your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
4. Start server: `node server.js`

### Extension

1. Load `extension/` as an unpacked extension in your browser.
2. Configure backend API URL in `extension/utils/config.js` if needed.

## Usage

- Visit any YouTube video page.
- Click the extension icon or wait for the sidebar to appear.
- View the summary and use the Read Aloud feature.

## License

MIT
