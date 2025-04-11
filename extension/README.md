# TubeSumTalk Extension

This is the browser extension for TubeSumTalk, which summarizes YouTube videos and reads the summary aloud with word-by-word highlighting.

## Features

-   Inject a sidebar into YouTube video pages
-   Extract video information and send to the backend for summarization
-   Display the summary in the sidebar
-   Read the summary aloud with word-by-word highlighting
-   Adjust voice speed and pitch

## Setup

1. Generate the extension icons:

    ```bash
    cd icons
    python create_manual_icons.py
    ```

    This will create the required icon files (icon16.png, icon48.png, icon128.png).

2. Load the extension in your browser:
    - **Chrome/Edge**:
        - Go to `chrome://extensions/` or `edge://extensions/`
        - Enable "Developer mode"
        - Click "Load unpacked" and select the `extension` directory
    - **Firefox**:
        - Go to `about:debugging#/runtime/this-firefox`
        - Click "Load Temporary Add-on" and select any file in the `extension` directory

## Configuration

The extension is configured to connect to a local backend server by default. If you want to use a different backend server, you need to update the `API_BASE_URL` in the following files:

-   `content.js`
-   `background.js`

Change the value from `http://localhost:8000` to your deployed backend URL.

### Backend Server

The extension requires a backend server to function properly. You can use either:

1. The Flask API server (recommended):

    ```bash
    cd backend
    python main_flask.py
    ```

2. The standalone script (for testing):
    ```bash
    cd backend
    python summarize_video.py https://www.youtube.com/watch?v=VIDEO_ID
    ```

## Usage

1. Navigate to any YouTube video
2. Click the TubeSumTalk icon (📝) on the right side of the page to open the sidebar
3. Click "Summarize" to generate a summary of the video
4. Once the summary is generated, click "Read Aloud" to have it read to you with word highlighting
5. Use the speed and pitch controls to adjust the voice to your preference

## Development

### Files

-   `manifest.json`: Extension configuration
-   `content.js`: Injects the sidebar into YouTube pages
-   `sidebar.html`: HTML structure of the sidebar
-   `sidebar.css`: Styles for the sidebar
-   `sidebar.js`: JavaScript for the sidebar functionality
-   `background.js`: Background script for communication with the backend

### Testing

To test the extension:

1. Make sure the backend server is running
2. Load the extension in your browser
3. Navigate to a YouTube video
4. Open the sidebar and click "Summarize"

## License

MIT
