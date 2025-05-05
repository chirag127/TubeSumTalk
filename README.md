# 📘 TubeSumTalk

![TubeSumTalk Logo](https://raw.githubusercontent.com/chirag127/TubeSumTalk/main/extension/icons/icon128.png)

## ✨ Description

TubeSumTalk is a browser extension that automatically summarizes YouTube videos and reads the summaries aloud with word-by-word highlighting. It uses Google Gemini 2.5 Flash Preview AI to generate concise summaries from video transcripts, saving you time and helping you decide if a video is worth watching in full. You can also ask questions about the video content and get AI-generated answers based on the transcript.

## 🚀 Live Demo

Visit our website: [https://chirag127.github.io/TubeSumTalk/](https://chirag127.github.io/TubeSumTalk/)

## 🛠️ Tech Stack / Tools Used

-   **Frontend**: JavaScript, HTML5, CSS3
-   **Browser APIs**: Chrome Extension API, Web Speech API
-   **Backend**: Node.js, Express.js
-   **AI**: Google Gemini 2.5 Flash Preview
-   **Version Control**: Git, GitHub

## 📦 Installation Instructions

### Extension Installation

1. Clone this repository or download it as a ZIP file
2. Extract the contents if you downloaded a ZIP file
3. Open your browser's extension page:
    - Chrome: `chrome://extensions/`
    - Edge: `edge://extensions/`
    - Firefox: `about:addons`
4. Enable "Developer mode" (usually a toggle in the top-right corner)
5. Click "Load unpacked" (Chrome/Edge) or "Load Temporary Add-on" (Firefox)
6. Select the `extension` directory from the downloaded repository

### Backend Server Setup

1. Navigate to the `backend` directory
2. Create a `.env` file with the following content:
    ```
    PORT=8000
    ```
    Note: You don't need to provide a Gemini API key in the .env file as users will provide their own API keys through the extension.
3. Install dependencies:
    ```
    npm install
    ```
4. Start the server:
    ```
    npm start
    ```

## 🔧 Usage

1. Navigate to any YouTube video page
2. The TubeSumTalk sidebar will automatically appear on the right side of the video
3. The extension will extract the transcript and generate a summary
4. Click the play button to have the summary read aloud with word highlighting
5. Use the settings to customize the TTS voice, speed, and pitch
6. Switch to the Q&A tab to ask questions about the video content
7. Go to the Settings tab to enter your Gemini API key (required for summarization and Q&A)
8. Choose different summary types (Bullet Points, Brief, Detailed, Key Points, Chapter Markers) and lengths (Short, Medium, Long)

## 🧪 Features

-   **AI-Powered Summaries**: Automatically generates concise summaries of YouTube videos
-   **Multiple Summary Types**: Choose between bullet points, brief, detailed, key points, and chapter markers
-   **Adjustable Length**: Select your preferred summary length (short, medium, or long)
-   **Q&A Capability**: Ask questions about the video content and get AI-generated answers
-   **Text-to-Speech**: Listen to summaries with adjustable playback speed (up to 16x) and voice selection
-   **Word Highlighting**: Follow along with real-time word-by-word highlighting as the summary is read aloud
-   **Markdown Formatting**: Summaries are displayed with proper markdown formatting for better readability
-   **Theme Adaptation**: Automatically adapts to YouTube's light or dark theme
-   **Customizable UI**: Resize the sidebar to your preferred width
-   **User API Keys**: Use your own Gemini API key for privacy and control
-   **Persistent Settings**: Your preferences are saved between sessions

## 📸 Screenshots

![TubeSumTalk Screenshot](https://raw.githubusercontent.com/chirag127/TubeSumTalk/main/screenshots/screenshot1.png)

## 🙌 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🪪 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
