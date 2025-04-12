Here's the full **Product Requirements Document (PRD)** for your **YouTube Video Summarizer + Read Aloud right colomn Extension**:

---

# **Product Requirements Document (PRD)**
**Product Name:** YouTube Video Summarizer + Read Aloud right colomn
**Platform:** Browser Extension (Chrome, Edge, Firefox)
**Owner:** chirag127
**Last Updated:** April 11, 2025

---

## **1. Overview**

The **YouTube Video Summarizer + Read Aloud right colomn Extension** is a browser extension that automatically summarizes YouTube videos and displays the summary in a right colomn on the video page. Additionally, it offers a "Read Aloud" feature that speaks the summary out loud with real-time, word-by-word highlighting.

---

## **2. Goals**

- Summarize YouTube videos using AI.
- Display summary in a non-intrusive right colomn.
- Provide a Read Aloud feature with word-level highlighting.
- Support multiple browsers: Chrome, Edge, Firefox.
- Maintain fast, smooth UX with secure AI processing.

---

## **3. Features**

### **3.1. Auto Summary Generation**
- Automatically detect when a user is on a YouTube video page.
- Extract the transcript and video title and send it to the backend for summarization.
- Send transcript to **Gemini 2.0 Flash Lite** via backend for summarization.
- Display the summary in the extension's right colomn.

### **3.2. right colomn UI**
- Toggleable right colomn on the right of the YouTube video.
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
  - Injects right colomn into YouTube pages.
  - Detects video URL change (YouTube uses SPA routing).
- Background service worker:
  - Handles messaging and API calls.
- right colomn HTML + CSS + JS:
  - UI/UX for summary and TTS controls.
  - Calls backend for summary.
  - TTS and word-by-word highlight rendering.

### **4.2. Backend (backend/)**
- **Express.js API Server**
  - `/summarize`: Accepts YouTube video ID and video title and text(transcript) calls Gemini API to summarize.
- **Gemini 2.0 Flash Lite API Integration**
  - Used to generate AI summary.

---

## **5. Project Structure**

```
project-root/
│
├── extension/                   # Browser extension frontend
│   ├── manifest.json
│make the code as modular as possible

├── backend/                     # Backend server
│   └── .env
│make the code as modular as possible

├── README.md
└── package.json
```

make the code as modular and reusable as possible

---

## **6. User Flow**

1. User visits a YouTube video page.
2. Content script detects video URL.
3. right colomn is injected into the page.
4. Request is sent to the backend with the video ID.
5. Backend fetches transcript and generates summary.
6. Summary is displayed in the right colomn.
7. User clicks “Read Aloud” → TTS starts and highlights each word as it's spoken.
8. there will be a pop up for the user to select the voice and speed of the TTS.

---

## **7. APIs**

### **Frontend → Backend**
- `POST /summarize`
  - `body: { videoId: string, transcript: string, title: string }`

### **Backend → Gemini**
- `POST /v1/generate`
  - `prompt: Transcript text`
  - `model: gemini-2.0-flash-lite`

---

## **8. Non-Functional Requirements**

- Responsive, fast-loading right colomn (under 1s for render).
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
| right colomn UI and TTS           | Day 2–3         |
| Backend APIs (Gemini)| Day 4–5         |
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


Take the reference from the below following code to how to extract the transcript from youtube video.
/**
 * Utility functions for extracting YouTube transcripts
 */

// Get available transcript languages for a YouTube video
async function getTranscriptLanguages() {
    try {
        // Get the transcript data from YouTube's ytInitialPlayerResponse
        const transcriptData = await getTranscriptData();

        if (!transcriptData || !transcriptData.captionTracks) {
            throw new Error("No transcript data found");
        }

        // Extract language info
        return transcriptData.captionTracks.map((track) => ({
            code: track.languageCode,
            name: track.name.simpleText,
            url: track.baseUrl,
        }));
    } catch (error) {
        console.error("Error getting transcript languages:", error);
        throw error;
    }
}

// Get transcript data from YouTube's ytInitialPlayerResponse
async function getTranscriptData() {
    // Try to get the data from the window object
    if (
        window.ytInitialPlayerResponse &&
        window.ytInitialPlayerResponse.captions &&
        window.ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer
    ) {
        return {
            captionTracks:
                window.ytInitialPlayerResponse.captions
                    .playerCaptionsTracklistRenderer.captionTracks,
        };
    }

    // If not found in window object, try to extract from script tags
    for (const script of document.querySelectorAll("script")) {
        const text = script.textContent;
        if (text && text.includes("ytInitialPlayerResponse")) {
            try {
                const jsonStr = text
                    .split("ytInitialPlayerResponse = ")[1]
                    .split(";var")[0];
                const data = JSON.parse(jsonStr);

                if (
                    data.captions &&
                    data.captions.playerCaptionsTracklistRenderer
                ) {
                    return {
                        captionTracks:
                            data.captions.playerCaptionsTracklistRenderer
                                .captionTracks,
                    };
                }
            } catch (error) {
                console.error("Error parsing script content:", error);
            }
        }
    }

    throw new Error("Could not find transcript data");
}

// Get transcript for a specific language
async function getTranscript(url) {
    try {
        const response = await fetch(url);

        if (response.status !== 200) {
            throw new Error(
                `Bad response fetching transcript: ${response.status}`
            );
        }

        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");
        const textElements = xml.getElementsByTagName("text");

        if (textElements.length === 0) {
            return [];
        }

        const transcript = [
            {
                timestamp: parseInt(textElements[0].getAttribute("start")),
                text: "",
            },
        ];

        let sentenceCount = 0;

        for (const element of textElements) {
            const text = element.innerHTML.replace(/\r?\n|\r/g, " ").trim();
            const timestamp = parseInt(element.getAttribute("start"));
            const lastSegment = transcript[transcript.length - 1];
            const textLength = lastSegment.text.length;
            const wordCount = lastSegment.text.split(" ").length;

            if (textLength >= 500 || wordCount >= 100 || sentenceCount >= 3) {
                transcript.push({
                    timestamp,
                    text,
                });
                sentenceCount = 0;
                continue;
            }

            lastSegment.text += " " + text;

            if (text[text.length - 1] === ".") {
                sentenceCount++;
            }
        }

        // Clean up HTML entities
        for (const segment of transcript) {
            segment.text =
                new DOMParser().parseFromString(segment.text, "text/html")
                    .documentElement.textContent || "";
        }

        return transcript;
    } catch (error) {
        console.error("Error getting transcript:", error);
        throw error;
    }
}

// Get video details (title, author, videoId)
function getVideoDetails() {
    // Get video ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get("v");

    // Get video title - try multiple selectors to handle YouTube's DOM structure
    let title = "Unknown Title";
    const titleSelectors = [
        "h1.title", // Old selector
        "h1.ytd-watch-metadata", // Another possible selector
        "#title h1", // Another possible selector
        "#title", // Another possible selector
        "ytd-watch-metadata h1", // Another possible selector
        "h1.style-scope.ytd-watch-metadata", // More specific selector
    ];

    for (const selector of titleSelectors) {
        const titleElement = document.querySelector(selector);
        if (titleElement && titleElement.textContent.trim()) {
            title = titleElement.textContent.trim();
            console.log(`Found title using selector: ${selector}`);
            break;
        }
    }

    // If still not found, try a more generic approach
    if (title === "Unknown Title") {
        // Try to find any h1 element
        const h1Elements = document.querySelectorAll("h1");
        for (const h1 of h1Elements) {
            if (h1.textContent.trim() && h1.offsetHeight > 0) {
                // Check if visible
                title = h1.textContent.trim();
                console.log("Found title using h1 element search");
                break;
            }
        }
    }

    console.log("Video title:", title);

    // Get video author
    let author = "Unknown Author";
    const authorSelectors = [
        "#owner-name a", // Old selector
        "#channel-name", // Another possible selector
        "#owner #channel-name", // Another possible selector
        "ytd-channel-name", // Another possible selector
        "ytd-video-owner-renderer #channel-name", // More specific selector
    ];

    for (const selector of authorSelectors) {
        const authorElement = document.querySelector(selector);
        if (authorElement && authorElement.textContent.trim()) {
            author = authorElement.textContent.trim();
            console.log(`Found author using selector: ${selector}`);
            break;
        }
    }

    console.log("Video author:", author);

    return {
        videoId,
        title,
        author,
    };
}
