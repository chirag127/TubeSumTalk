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
│   ├── icons/                   # Extension icons
│   ├── content_scripts/         # Content scripts for YouTube pages
│   │   ├── content.js           # Main content script
│   │   ├── sidebar.js           # Sidebar functionality
│   │   └── sidebar.css          # Sidebar styling
│   ├── background/              # Background service worker
│   │   └── service-worker.js    # Handles API communication
│   ├── popup/                   # Extension popup
│   │   ├── popup.html           # Popup HTML
│   │   ├── popup.js             # Popup functionality
│   │   └── popup.css            # Popup styling
│   └── utils/                   # Utility functions
│       ├── transcript.js        # Transcript extraction
│       └── tts.js               # Text-to-speech functionality
│
├── backend/                     # Backend server
│   ├── server.js                # Express.js server
│   ├── api/                     # API endpoints and Gemini integration
│   │   └── gemini.js            # Gemini 2.0 Flash Lite wrapper
│   ├── package.json             # Node.js dependencies
│   └── .env                     # Environment variables
│
├── README.md                    # Project documentation
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

The backend is built with Express.js and Node.js, and integrates with the Gemini 2.0 Flash Lite API for summarization. To run the backend in development mode with auto-restart:

```
cd backend
npm run dev
```

To modify the backend:

1. Update the API endpoints in `backend/server.js`
2. Modify the Gemini integration in `backend/api/gemini.js`
3. Restart the server to apply changes

### Extension Development

The extension is built with vanilla JavaScript and follows the Manifest V3 specification. To modify the extension:

1. Update the content scripts in `extension/content_scripts/`
2. Modify the background service worker in `extension/background/`
3. Update the popup UI in `extension/popup/`

After making changes to the extension, you'll need to reload it in your browser:

-   Chrome/Edge: Go to the extensions page and click the refresh icon on the extension
-   Firefox: Go to the debugging page, click "Reload" on the extension

## License

MIT
