# TubeSumTalk

## Overview

TubeSumTalk is a browser extension that automatically summarizes YouTube videos and displays the summary in a sidebar. It also features a "Read Aloud" function that speaks the summary with real-time word highlighting.

## Features

-   **Auto-detection**: Automatically detects when you're watching a YouTube video
-   **AI Summarization**: Uses Gemini 2.0 Flash Lite to generate concise summaries
-   **Read Aloud**: Text-to-speech with real-time word highlighting
-   **Customizable**: Adjust reading speed and voice
-   **Cross-browser**: Works on Chrome, Edge, and Firefox

## Project Structure

```
project-root/
│
├── extension/                   # Browser extension frontend
│   ├── manifest.json            # Extension configuration
│   ├── background.js            # Background service worker
│   ├── content.js               # Injects UI and manages DOM interactions
│   ├── sidebar.html             # Sidebar container
│   ├── sidebar.js               # Handles summary display, TTS
│   ├── styles.css               # Sidebar styling
│   └── icons/                   # Extension icons
│
├── backend/                     # Backend server
│   ├── server.js                # Express.js server
│   ├── routes/
│   │   └── summarize.js         # Summarization endpoint
│   ├── services/
│   │   └── geminiService.js     # Gemini 2.0 Flash Lite wrapper
│   └── .env                     # Environment variables
│
├── scripts/                     # Utility scripts
│   └── generate-icons.js        # Generate extension icons from SVG
│
├── README.md                    # Project documentation
└── package.json                 # Project configuration
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:

    ```
    cd backend
    ```

2. Install dependencies:

    ```
    npm install
    ```

3. Create a `.env` file from the example:

    ```
    cp .env.example .env
    ```

4. Add your Gemini API key to the `.env` file:

    ```
    GEMINI_API_KEY=your_api_key_here
    ```

5. Start the backend server:
    ```
    npm start
    ```

### Extension Setup

1. Navigate to the extension directory:

    ```
    cd extension
    ```

2. Generate the extension icons:

    ```
    npm run build
    ```

3. Load the extension in your browser:
    - Chrome/Edge: Go to `chrome://extensions/`, enable "Developer mode", click "Load unpacked", and select the `extension` folder
    - Firefox: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select any file in the `extension` folder

## Usage

1. Visit any YouTube video page
2. The TubeSumTalk sidebar will automatically appear on the right side
3. The extension will extract the video transcript and generate a summary
4. Click the "Read Aloud" button to have the summary read to you with word highlighting
5. Adjust the reading speed and voice using the controls at the bottom of the sidebar

## Development

### Backend Development

The backend is built with Express.js and uses the Gemini 2.0 Flash Lite API for summarization. To run the backend in development mode with auto-restart:

```
cd backend
npm run dev
```

### Extension Development

After making changes to the extension, you'll need to reload it in your browser:

-   Chrome/Edge: Go to the extensions page and click the refresh icon on the extension
-   Firefox: Go to the debugging page, click "Reload" on the extension

## License

MIT
