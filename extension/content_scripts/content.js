/**
 * TubeSumTalk Content Script (Modular Version)
 * Detects YouTube video pages and initializes the widget
 */

// Import utility modules
import youtubeService from '../utils/youtube.js';
import apiService from '../utils/api.js';
import settingsManager from '../utils/settings.js';
import markdownParser from '../utils/markdown.js';

// State
let widget = null;
let currentVideoId = null;
let isProcessing = false;

/**
 * Main initialization function
 * Called when the page loads or when navigation occurs
 */
async function init() {
  // Check if we're on a YouTube video page
  if (!youtubeService.isVideoPage()) {
    return;
  }

  // Get video details
  const videoDetails = youtubeService.getVideoDetails();
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
  if (videoDetails.videoId === currentVideoId && widget) {
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

  // Set video details in widget
  widget.setVideoDetails(videoDetails);

  // Show loading state
  widget.showLoading();

  // Prevent multiple simultaneous processing
  if (isProcessing) {
    return;
  }

  isProcessing = true;

  try {
    // Get available transcript languages
    const languages = await getTranscriptLanguages();

    if (!languages || languages.length === 0) {
      widget.showError("No transcript available for this video.");
      isProcessing = false;
      return;
    }

    // Default to English or first available language
    const defaultLanguage =
      languages.find((lang) => lang.code === "en") || languages[0];

    // Get transcript for the selected language
    const transcript = await getTranscript(defaultLanguage.url);

    if (!transcript || transcript.length === 0) {
      widget.showError(
        "Failed to get transcript. Please try another video."
      );
      isProcessing = false;
      return;
    }

    // Combine transcript segments into a single text
    const transcriptText = transcript.map((item) => item.text).join(" ");

    // Get summary settings
    const settings = await settingsManager.getSummarySettings();
    
    console.log("Using summary settings:", settings);

    try {
      // Get summary from API
      const summary = await apiService.getSummary(
        videoDetails.videoId,
        transcriptText,
        videoDetails.title,
        settings.summaryType,
        settings.summaryLength
      );
      
      // Display summary in widget
      widget.setSummary(summary);
    } catch (error) {
      console.error("Error getting summary:", error);
      widget.showError(error.message || "Failed to generate summary. Please try again.");
    } finally {
      isProcessing = false;
    }
  } catch (error) {
    console.error("Error processing video:", error);
    widget.showError("An error occurred while processing the video.");
    isProcessing = false;
  }
}

/**
 * Handle messages from background script
 */
function handleMessages() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (
      message.action === "updateSummary" &&
      message.videoId === currentVideoId
    ) {
      if (widget) {
        widget.setSummary(message.summary);
      }
      sendResponse({ success: true });
    }

    // Return true to indicate we'll send a response asynchronously
    return true;
  });
}

/**
 * Initialize the content script
 */
function initialize() {
  // Initialize on page load
  init();

  // Listen for YouTube navigation events
  youtubeService.onNavigate(init);

  // Listen for messages from background script
  handleMessages();
}

// Start the content script
initialize();
