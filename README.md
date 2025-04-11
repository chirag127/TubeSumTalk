# TubeSumTalk

A browser extension that summarizes YouTube videos and reads the summary aloud with word-by-word highlighting in a sidebar.

## Features

-   **Video Summarization**: Get concise summaries of YouTube videos using Gemini 2.0 Flash Lite AI.
-   **Read Aloud**: Listen to the summary with text-to-speech and follow along with word-by-word highlighting.
-   **Adjustable Voice**: Control the speed and pitch of the text-to-speech voice.
-   **Collapsible Sidebar**: Easily toggle the sidebar on and off while watching videos.
-   **Cross-Browser Support**: Works on Chrome, Edge, and Firefox.

## Project Structure

```
TubeSumTalk/
├── extension/
│   ├── manifest.json
│   ├── content.js
│   ├── sidebar.html
│   ├── sidebar.css
│   ├── sidebar.js
│   ├── background.js
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
├── backend/
│   ├── main.py
│   ├── utils/
│   │   ├── yt_subtitles.py
│   │   └── gemini_api.py
│   └── requirements.txt
└── README.md
```

## Setup Instructions

### Backend Setup

1. Create a `.env` file in the `backend` directory with your Gemini API key:

    ```
    GEMINI_API_KEY=your_api_key_here
    ```

2. Install the required Python packages:

    ```bash
    cd backend
    pip install -r requirements.txt
    ```

3. Run the FastAPI server:
    ```bash
    cd backend
    uvicorn main:app --reload
    ```

### Extension Setup

1. Generate icons for the extension:

    - Open `extension/icons/create_icons.html` in a browser
    - Click "Generate Icons" and save the generated icons as `icon16.png`, `icon48.png`, and `icon128.png` in the `extension/icons` directory

2. Load the extension in your browser:
    - **Chrome/Edge**:
        - Go to `chrome://extensions/` or `edge://extensions/`
        - Enable "Developer mode"
        - Click "Load unpacked" and select the `extension` directory
    - **Firefox**:
        - Go to `about:debugging#/runtime/this-firefox`
        - Click "Load Temporary Add-on" and select any file in the `extension` directory

## Usage

1. Navigate to any YouTube video
2. Click the TubeSumTalk icon (📝) on the right side of the page to open the sidebar
3. Click "Summarize" to generate a summary of the video
4. Once the summary is generated, click "Read Aloud" to have it read to you with word highlighting
5. Use the speed and pitch controls to adjust the voice to your preference

## Development

### Backend Development

The backend is built with FastAPI and handles:

-   Extracting subtitles from YouTube videos using yt-dlp
-   Generating summaries using Gemini 2.0 Flash Lite
-   Serving the summaries to the browser extension

### Extension Development

The extension consists of:

-   A content script that injects the sidebar into YouTube pages
-   A background script that handles communication with the backend
-   A sidebar UI that displays the summary and provides the read-aloud functionality

## License

MIT

## Author

Chirag Singhal
