/**
 * TubeSumTalk Content Script
 * Detects YouTube video pages and initializes the sidebar and widget
 */

// Constants
const YOUTUBE_VIDEO_REGEX = /^https:\/\/www\.youtube\.com\/watch\?v=.+/;

// State
let widget = null;
let sidebar = null;
let currentVideoId = null;
let isProcessing = false;
let currentTranscript = null;

// Main initialization function
async function init() {
    // Check if we're on a YouTube video page
    if (!YOUTUBE_VIDEO_REGEX.test(window.location.href)) {
        return;
    }

    // Initialize theme detection
    if (window.TubeSumTalkTheme) {
        window.TubeSumTalkTheme.initTheme();
    }

    // Get video details
    const videoDetails = getVideoDetails();
    console.log("Video details:", videoDetails);

    // If no video ID, exit
    if (!videoDetails.videoId) {
        console.error("No video ID found");
        return;
    }

    // If no title, use a default title
    if (!videoDetails.title || videoDetails.title === "Unknown Title") {
        console.warn("No title found, using default title");
        videoDetails.title = "YouTube Video " + videoDetails.videoId;
    }

    // If we've already processed this video, don't do it again
    if (videoDetails.videoId === currentVideoId && widget && sidebar) {
        return;
    }

    // Update current video ID
    currentVideoId = videoDetails.videoId;

    // If widget doesn't exist, create it
    if (!widget) {
        widget = await new TubeSumTalkWidget().init();
        if (!widget) {
            console.error("Failed to initialize widget");
            return;
        }
    }

    // If sidebar doesn't exist, create it
    if (!sidebar) {
        sidebar = await new TubeSumTalkSidebar().init();
        if (!sidebar) {
            console.error("Failed to initialize sidebar");
            return;
        }
    }

    // Set video details in widget and sidebar
    widget.setVideoDetails(videoDetails);
    sidebar.setVideoDetails(videoDetails);

    // Show loading state
    widget.showLoading();
    sidebar.showLoading();

    // Prevent multiple simultaneous processing
    if (isProcessing) {
        return;
    }

    isProcessing = true;

    try {
        // Get available transcript languages
        const languages = await getTranscriptLanguages();

        if (!languages || languages.length === 0) {
            const errorMessage = "No transcript available for this video.";
            widget.showError(errorMessage);
            sidebar.showError(errorMessage);
            isProcessing = false;
            return;
        }

        // Default to English or first available language
        const defaultLanguage =
            languages.find((lang) => lang.code === "en") || languages[0];

        // Get transcript for the selected language
        const transcript = await getTranscript(defaultLanguage.url);

        if (!transcript || transcript.length === 0) {
            const errorMessage =
                "Failed to get transcript. Please try another video.";
            widget.showError(errorMessage);
            sidebar.showError(errorMessage);
            isProcessing = false;
            return;
        }

        // Combine transcript segments into a single text
        const transcriptText = transcript.map((item) => item.text).join(" ");

        // Store transcript for later use (e.g., Q&A)
        currentTranscript = transcriptText;

        // Get summary settings
        chrome.storage.sync.get(
            ["summaryType", "summaryLength"],
            (settings) => {
                const summaryType = settings.summaryType || "bullet";
                const summaryLength = settings.summaryLength || "medium";

                console.log("Using summary settings:", {
                    summaryType,
                    summaryLength,
                });

                // Send message to background script to get summary
                chrome.runtime.sendMessage(
                    {
                        action: "summarize",
                        videoId: videoDetails.videoId,
                        transcript: transcriptText,
                        title: videoDetails.title,
                        summaryType: summaryType,
                        summaryLength: summaryLength,
                    },
                    (response) => {
                        isProcessing = false;

                        if (response && response.success) {
                            // Display summary in widget and sidebar
                            widget.setSummary(response.summary);
                            sidebar.setSummary(response.summary);
                        } else {
                            // Display error
                            const errorMessage =
                                response?.error ||
                                "Failed to generate summary. Please try again.";
                            widget.showError(errorMessage);
                            sidebar.showError(errorMessage);
                        }
                    }
                );
            }
        );
    } catch (error) {
        console.error("Error processing video:", error);
        const errorMessage = "An error occurred while processing the video.";
        widget.showError(errorMessage);
        sidebar.showError(errorMessage);
        isProcessing = false;
    }
}

// Function to ask a question about the video
function askQuestion(question) {
    if (!currentTranscript) {
        console.error("No transcript available for Q&A");
        return Promise.reject(
            new Error("No transcript available for this video.")
        );
    }

    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                action: "askQuestion",
                transcript: currentTranscript,
                question: question,
            },
            (response) => {
                if (response && response.success) {
                    resolve(response.answer);
                } else {
                    reject(
                        new Error(
                            response?.error ||
                                "Failed to get answer. Please try again."
                        )
                    );
                }
            }
        );
    });
}

// Initialize on page load
init();

// Listen for YouTube navigation events
window.addEventListener("yt-navigate-finish", init);

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (
        message.action === "updateSummary" &&
        message.videoId === currentVideoId
    ) {
        if (widget) {
            widget.setSummary(message.summary);
        }
        if (sidebar) {
            sidebar.setSummary(message.summary);
        }
        sendResponse({ success: true });
    }

    // Return true to indicate we'll send a response asynchronously
    return true;
});

// Make askQuestion function available to sidebar and widget
window.TubeSumTalk = {
    askQuestion,
};
