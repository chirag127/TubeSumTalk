/**
 * TubeSumTalk Content Script
 * Detects YouTube video pages and initializes the sidebar and widget
 * Tracks video changes and updates the summary accordingly
 */

// Constants
const YOUTUBE_VIDEO_REGEX = /^https:\/\/www\.youtube\.com\/watch\?v=.+/;
const VIDEO_CHECK_INTERVAL = 2000; // Check for video changes every 2 seconds

// State
let widget = null;
let currentVideoId = null;
let isProcessing = false;
let currentTranscript = null;
let videoCheckInterval = null;
let lastCheckedUrl = null;

/**
 * Main initialization function
 * Sets up the extension and initializes video monitoring
 */
async function init() {
    console.log("TubeSumTalk initializing...");

    // Check if we're on a YouTube video page
    if (!YOUTUBE_VIDEO_REGEX.test(window.location.href)) {
        console.log("Not a YouTube video page, exiting");
        return;
    }

    // Initialize theme detection
    if (window.TubeSumTalkTheme) {
        window.TubeSumTalkTheme.initTheme();
    }

    // Initialize the widget if it doesn't exist
    if (!widget) {
        widget = await new TubeSumTalkWidget().init();
        if (!widget) {
            console.error("Failed to initialize widget");
            return;
        }
        console.log("Widget initialized successfully");
    }

    // Start monitoring for video changes
    startVideoMonitoring();

    // Process the current video
    processCurrentVideo();
}

/**
 * Start monitoring for video changes
 * This handles both URL changes and in-page video changes
 */
function startVideoMonitoring() {
    // Clear any existing interval
    if (videoCheckInterval) {
        clearInterval(videoCheckInterval);
    }

    // Store the current URL
    lastCheckedUrl = window.location.href;

    // Set up interval to check for video changes
    videoCheckInterval = setInterval(() => {
        // Check if URL has changed
        if (window.location.href !== lastCheckedUrl) {
            console.log("URL changed, processing new video");
            lastCheckedUrl = window.location.href;

            // Check if we're still on a YouTube video page
            if (YOUTUBE_VIDEO_REGEX.test(window.location.href)) {
                processCurrentVideo();
            }
            return;
        }

        // Check if video ID has changed without URL change (e.g., through YouTube's navigation)
        const videoDetails = getVideoDetails();
        if (videoDetails.videoId && videoDetails.videoId !== currentVideoId) {
            console.log(
                "Video changed without URL change, processing new video"
            );
            processCurrentVideo();
        }
    }, VIDEO_CHECK_INTERVAL);

    console.log("Video monitoring started");
}

/**
 * Process the current video
 * Gets video details, transcript, and generates summary
 * @param {boolean} forceRefresh - Whether to force refresh even if video ID hasn't changed
 */
async function processCurrentVideo(forceRefresh = false) {
    console.log("Processing video, force refresh:", forceRefresh);

    // Force refresh of YouTube's player response data
    if (forceRefresh) {
        console.log("Forcing refresh of video data");
        // Clear any cached data
        window.ytInitialPlayerResponse = null;
    }

    // Get video details - pass forceRefresh to ensure fresh data
    const videoDetails = getVideoDetails(forceRefresh);
    console.log("Processing video:", videoDetails);

    // If no video ID, exit
    if (!videoDetails.videoId) {
        console.error("No video ID found");
        if (widget) {
            widget.showError(
                "Could not detect video ID. Please try again or reload the page."
            );
        }
        return;
    }

    // If no title, use a default title
    if (!videoDetails.title || videoDetails.title === "Unknown Title") {
        console.warn("No title found, using default title");
        videoDetails.title = "YouTube Video " + videoDetails.videoId;
    }

    // If we've already processed this video and not forcing refresh, don't do it again
    if (!forceRefresh && videoDetails.videoId === currentVideoId && widget) {
        console.log(
            "Video already processed, skipping (use refresh button to force)"
        );
        return;
    }

    // Update current video ID
    currentVideoId = videoDetails.videoId;
    console.log("Current video ID updated to:", currentVideoId);

    // Set video details in widget
    widget.setVideoDetails(videoDetails);

    // Show loading state
    widget.showLoading();

    // Prevent multiple simultaneous processing
    if (isProcessing) {
        console.log("Already processing a video, waiting");
        // If we're forcing a refresh, show a message to the user
        if (forceRefresh && widget) {
            widget.showError(
                "Already processing a video. Please wait a moment and try again."
            );
        }
        return;
    }

    isProcessing = true;

    // If this is a forced refresh, clear any cached transcript data
    if (forceRefresh) {
        console.log("Forcing refresh of transcript data");
        currentTranscript = null;
        window.currentTranscript = null;
    }

    try {
        // Get available transcript languages
        console.log("Getting transcript languages...");
        const languages = await getTranscriptLanguages();

        if (!languages || languages.length === 0) {
            const errorMessage = "No transcript available for this video.";
            console.error(errorMessage);
            widget.showError(errorMessage);
            isProcessing = false;
            return;
        }

        // Default to English or first available language
        const defaultLanguage =
            languages.find((lang) => lang.code === "en") || languages[0];
        console.log("Using language:", defaultLanguage.name);

        // Get transcript for the selected language
        console.log("Getting transcript...");
        const transcript = await getTranscript(defaultLanguage.url);

        if (!transcript || transcript.length === 0) {
            const errorMessage =
                "Failed to get transcript. Please try another video.";
            console.error(errorMessage);
            widget.showError(errorMessage);
            isProcessing = false;
            return;
        }

        // Combine transcript segments into a single text
        const transcriptText = transcript.map((item) => item.text).join(" ");
        console.log("Transcript retrieved, length:", transcriptText.length);

        // Store transcript for later use (e.g., Q&A)
        currentTranscript = transcriptText;
        window.currentTranscript = transcriptText; // Make available globally

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
                console.log("Requesting summary from backend...");
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
                            console.log("Summary received successfully");
                            // Display summary in widget
                            widget.setSummary(response.summary);
                        } else {
                            // Display error
                            const errorMessage =
                                response?.error ||
                                "Failed to generate summary. Please try again.";
                            console.error("Summary error:", errorMessage);
                            widget.showError(errorMessage);
                        }
                    }
                );
            }
        );
    } catch (error) {
        console.error("Error processing video:", error);
        const errorMessage = "An error occurred while processing the video.";
        widget.showError(errorMessage);
        isProcessing = false;
    }
}

/**
 * Ask a question about the current video
 * @param {string} question - The question to ask
 * @returns {Promise<string>} - The answer from the Gemini API
 */
function askQuestion(question) {
    if (!currentTranscript) {
        console.error("No transcript available for Q&A");
        return Promise.reject(
            new Error("No transcript available for this video.")
        );
    }

    console.log("Asking question:", question);
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
            {
                action: "askQuestion",
                transcript: currentTranscript,
                question: question,
            },
            (response) => {
                if (response && response.success) {
                    console.log("Answer received successfully");
                    resolve(response.answer);
                } else {
                    const errorMessage =
                        response?.error ||
                        "Failed to get answer. Please try again.";
                    console.error("Q&A error:", errorMessage);
                    reject(new Error(errorMessage));
                }
            }
        );
    });
}

/**
 * Clean up resources when the extension is unloaded
 */
function cleanup() {
    if (videoCheckInterval) {
        clearInterval(videoCheckInterval);
        videoCheckInterval = null;
    }

    // Additional cleanup if needed
    console.log("TubeSumTalk cleanup complete");
}

// Initialize on page load
init();

// Listen for YouTube navigation events
window.addEventListener("yt-navigate-finish", () => {
    console.log("YouTube navigation event detected");
    init();
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (
        message.action === "updateSummary" &&
        message.videoId === currentVideoId
    ) {
        console.log("Received summary update for current video");
        if (widget) {
            widget.setSummary(message.summary);
        }
        sendResponse({ success: true });
    } else if (message.action === "refreshVideo") {
        console.log("Received refresh request");
        // Pass true to force refresh even if the video ID hasn't changed
        processCurrentVideo(true);
        sendResponse({ success: true });
    }

    // Return true to indicate we'll send a response asynchronously
    return true;
});

// Clean up when the window is unloaded
window.addEventListener("unload", cleanup);

// Make functions available to sidebar and widget
window.TubeSumTalk = {
    askQuestion,
    processCurrentVideo,
};
