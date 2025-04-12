/**
 * TubeSumTalk Content Script (Non-Modular Version)
 * Detects YouTube video pages and initializes the widget
 */

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
  if (!isYouTubeVideoPage()) {
    return;
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
  if (videoDetails.videoId === currentVideoId && widget) {
    return;
  }

  // Update current video ID
  currentVideoId = videoDetails.videoId;

  // If widget doesn't exist, create it
  if (!widget) {
    widget = new TubeSumTalkWidget();
    await widget.init();
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

    // Get summary settings from storage
    chrome.storage.sync.get(['summaryType', 'summaryLength'], async (settings) => {
      const summaryType = settings.summaryType || 'bullet';
      const summaryLength = settings.summaryLength || 'medium';
      
      console.log("Using summary settings:", { summaryType, summaryLength });

      try {
        // Send message to background script to get summary
        chrome.runtime.sendMessage({
          action: 'summarize',
          videoId: videoDetails.videoId,
          transcript: transcriptText,
          title: videoDetails.title,
          summaryType,
          summaryLength
        }, (response) => {
          if (response && response.success) {
            // Display summary in widget
            widget.setSummary(response.summary);
          } else {
            // Show error
            widget.showError(response?.error || "Failed to generate summary. Please try again.");
          }
          isProcessing = false;
        });
      } catch (error) {
        console.error("Error getting summary:", error);
        widget.showError(error.message || "Failed to generate summary. Please try again.");
        isProcessing = false;
      }
    });
  } catch (error) {
    console.error("Error processing video:", error);
    widget.showError("An error occurred while processing the video.");
    isProcessing = false;
  }
}

/**
 * Check if current page is a YouTube video page
 * @returns {boolean} - True if on a YouTube video page
 */
function isYouTubeVideoPage() {
  const regex = /^https?:\/\/(www\.)?youtube\.com\/watch\?v=.+/;
  return regex.test(window.location.href);
}

/**
 * Get video details from the current page
 * @returns {Object} - Video details (videoId, title, channelName)
 */
function getVideoDetails() {
  try {
    // Get video ID from URL
    const urlParams = new URLSearchParams(window.location.href.split('?')[1]);
    const videoId = urlParams.get('v');

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
          break;
        }
      }
    }

    // Get channel name
    let channelName = "Unknown Channel";
    const channelSelectors = [
      "#owner-name a", // Old selector
      "#channel-name", // Another possible selector
      "#owner #channel-name", // Another possible selector
      "ytd-channel-name", // Another possible selector
      "ytd-video-owner-renderer #channel-name", // More specific selector
    ];

    for (const selector of channelSelectors) {
      const channelElement = document.querySelector(selector);
      if (channelElement && channelElement.textContent.trim()) {
        channelName = channelElement.textContent.trim();
        break;
      }
    }

    return {
      videoId,
      title,
      channelName,
    };
  } catch (error) {
    console.error('Error getting video details:', error);
    return {
      videoId: null,
      title: 'Unknown Title',
      channelName: 'Unknown Channel',
    };
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
 * Listen for YouTube navigation events
 * @param {Function} callback - Function to call when navigation occurs
 */
function onYouTubeNavigate(callback) {
  if (typeof callback !== 'function') {
    throw new Error('Callback must be a function');
  }
  
  // Listen for YouTube's custom navigation event
  window.addEventListener('yt-navigate-finish', callback);
  
  // Also listen for URL changes (fallback)
  let lastUrl = window.location.href;
  
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      callback();
    }
  });
  
  observer.observe(document, { subtree: true, childList: true });
  
  return {
    stop: () => {
      window.removeEventListener('yt-navigate-finish', callback);
      observer.disconnect();
    }
  };
}

/**
 * Initialize the content script
 */
function initialize() {
  // Initialize on page load
  init();

  // Listen for YouTube navigation events
  onYouTubeNavigate(init);

  // Listen for messages from background script
  handleMessages();
}

// Start the content script
initialize();
