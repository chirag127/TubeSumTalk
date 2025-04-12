// Default configuration
const DEFAULT_CONFIG = {
  apiUrl: 'http://localhost:3000/api',
  ttsSettings: {
    rate: 1.0,
    pitch: 1.0,
    voice: null // Will be set dynamically
  }
};

// Initialize extension settings
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['config'], (result) => {
    if (!result.config) {
      chrome.storage.sync.set({ config: DEFAULT_CONFIG });
      console.log('Initialized default configuration');
    }
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'summarize') {
    summarizeVideo(request.videoId, request.title, request.transcript)
      .then(summary => {
        sendResponse({ success: true, summary });
      })
      .catch(error => {
        console.error('Summarization error:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Required for async sendResponse
  }
});

/**
 * Calls the backend API to summarize a video transcript
 * 
 * @param {string} videoId - YouTube video ID
 * @param {string} title - Video title
 * @param {string} transcript - Video transcript
 * @returns {Promise<string>} - Summary text
 */
async function summarizeVideo(videoId, title, transcript) {
  try {
    // Get API URL from settings
    const { config } = await chrome.storage.sync.get(['config']);
    const apiUrl = config?.apiUrl || DEFAULT_CONFIG.apiUrl;
    
    // Call the API
    const response = await fetch(`${apiUrl}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoId, title, transcript }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to summarize video');
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Error summarizing video:', error);
    throw error;
  }
}
