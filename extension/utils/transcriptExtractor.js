/**
 * Transcript Extractor Utility
 * Provides multiple methods to extract YouTube video transcripts with fallbacks
 */

// Store the last successful extraction method for optimization
let lastSuccessfulMethod = null;

/**
 * Main function to extract transcript using multiple methods with fallbacks
 * @returns {Promise<Object>} Object containing success status and transcript or error
 */
async function extractTranscript() {
  console.log('YouTube Transcript Q&A: Extracting transcript...');
  
  // Try methods in order, starting with the last successful method if available
  const methods = [
    extractFromPlayerResponse,
    extractFromScriptTags,
    extractFromPageSource,
    extractFromUI
  ];
  
  // If we have a last successful method, try it first
  if (lastSuccessfulMethod) {
    console.log(`Trying last successful method first: ${lastSuccessfulMethod.name}`);
    try {
      const result = await lastSuccessfulMethod();
      if (result.success) {
        return result;
      }
    } catch (error) {
      console.log(`Last successful method failed: ${error.message}`);
    }
  }
  
  // Try each method in sequence until one succeeds
  for (const method of methods) {
    if (method === lastSuccessfulMethod) continue; // Skip if we already tried it
    
    console.log(`Trying extraction method: ${method.name}`);
    try {
      const result = await method();
      if (result.success) {
        lastSuccessfulMethod = method;
        return result;
      }
    } catch (error) {
      console.log(`Method ${method.name} failed: ${error.message}`);
    }
  }
  
  // If all methods fail, return error
  return { 
    success: false, 
    error: 'Could not extract transcript using any available method' 
  };
}

/**
 * Extract transcript from YouTube's ytInitialPlayerResponse object
 * @returns {Promise<Object>} Object containing success status and transcript or error
 */
async function extractFromPlayerResponse() {
  try {
    // Get transcript data from ytInitialPlayerResponse
    const transcriptData = await getTranscriptData();
    
    if (!transcriptData || !transcriptData.captionTracks || transcriptData.captionTracks.length === 0) {
      return { success: false, error: 'No caption tracks found in player response' };
    }
    
    // Default to English or first available language
    const captionTracks = transcriptData.captionTracks;
    const defaultTrack = captionTracks.find(track => track.languageCode === 'en') || captionTracks[0];
    
    if (!defaultTrack || !defaultTrack.baseUrl) {
      return { success: false, error: 'No valid caption track URL found' };
    }
    
    // Fetch and parse the transcript XML
    const transcript = await fetchTranscriptFromUrl(defaultTrack.baseUrl);
    
    return { 
      success: true, 
      transcript: transcript,
      method: 'playerResponse'
    };
  } catch (error) {
    console.error('Error extracting transcript from player response:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get transcript data from YouTube's ytInitialPlayerResponse
 * @returns {Promise<Object>} Transcript data object
 */
async function getTranscriptData() {
  console.log("Getting transcript data from ytInitialPlayerResponse...");

  // Try to get the data from the window object
  if (
    window.ytInitialPlayerResponse &&
    window.ytInitialPlayerResponse.captions &&
    window.ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer
  ) {
    console.log("Found transcript data in window.ytInitialPlayerResponse");
    return {
      captionTracks:
        window.ytInitialPlayerResponse.captions
          .playerCaptionsTracklistRenderer.captionTracks,
    };
  }

  // If not found in window object, try to extract from script tags
  console.log("Searching for transcript data in script tags...");
  for (const script of document.querySelectorAll("script")) {
    const text = script.textContent;
    if (text && text.includes("ytInitialPlayerResponse")) {
      try {
        const jsonStr = text
          .split("ytInitialPlayerResponse = ")[1]
          .split(";var")[0];
        const data = JSON.parse(jsonStr);

        if (
          data.captions &&
          data.captions.playerCaptionsTracklistRenderer
        ) {
          console.log("Found transcript data in script tag");
          return {
            captionTracks:
              data.captions.playerCaptionsTracklistRenderer
                .captionTracks,
          };
        }
      } catch (error) {
        console.error("Error parsing script content:", error);
      }
    }
  }

  throw new Error("Could not find transcript data in ytInitialPlayerResponse");
}

/**
 * Extract transcript from script tags in the page
 * @returns {Promise<Object>} Object containing success status and transcript or error
 */
async function extractFromScriptTags() {
  try {
    console.log("Searching for transcript data in script tags...");
    
    // Look for any script tag that might contain caption tracks
    for (const script of document.querySelectorAll("script")) {
      const text = script.textContent;
      if (!text) continue;
      
      // Look for caption data in various formats
      const patterns = [
        /"captionTracks":\s*(\[.*?\])/,
        /captionTracks'?:\s*(\[.*?\])/,
        /"playerCaptionsTracklistRenderer":\s*\{.*?"captionTracks":\s*(\[.*?\])/
      ];
      
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          try {
            const captionTracksJson = match[1].replace(/\\"/g, '"');
            const captionTracks = JSON.parse(captionTracksJson);
            
            if (captionTracks && captionTracks.length > 0) {
              // Default to English or first available language
              const defaultTrack = captionTracks.find(track => 
                track.languageCode === 'en' || 
                (track.name && track.name.simpleText === 'English')
              ) || captionTracks[0];
              
              if (defaultTrack && defaultTrack.baseUrl) {
                const transcript = await fetchTranscriptFromUrl(defaultTrack.baseUrl);
                return { 
                  success: true, 
                  transcript: transcript,
                  method: 'scriptTags'
                };
              }
            }
          } catch (error) {
            console.error("Error parsing caption tracks from script tag:", error);
          }
        }
      }
    }
    
    return { success: false, error: 'No transcript data found in script tags' };
  } catch (error) {
    console.error('Error extracting transcript from script tags:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Extract transcript from the page source using regex
 * @returns {Promise<Object>} Object containing success status and transcript or error
 */
async function extractFromPageSource() {
  try {
    console.log("Trying to find transcript data in page source...");
    
    // Look for any object that might contain caption tracks
    const possibleContainers = [
      'window["ytInitialPlayerResponse"]',
      "ytInitialPlayerResponse",
      "ytPlayerConfig",
    ];

    for (const container of possibleContainers) {
      const regex = new RegExp(`${container}\\s*=\\s*({.*?});`, "s");
      const match = document.documentElement.innerHTML.match(regex);

      if (match && match[1]) {
        try {
          const data = JSON.parse(match[1]);
          if (
            data.captions &&
            data.captions.playerCaptionsTracklistRenderer &&
            data.captions.playerCaptionsTracklistRenderer.captionTracks
          ) {
            console.log(`Found transcript data in ${container}`);
            
            const captionTracks = data.captions.playerCaptionsTracklistRenderer.captionTracks;
            // Default to English or first available language
            const defaultTrack = captionTracks.find(track => track.languageCode === 'en') || captionTracks[0];
            
            if (defaultTrack && defaultTrack.baseUrl) {
              const transcript = await fetchTranscriptFromUrl(defaultTrack.baseUrl);
              return { 
                success: true, 
                transcript: transcript,
                method: 'pageSource'
              };
            }
          }
        } catch (e) {
          console.error(`Error parsing ${container}:`, e);
        }
      }
    }
    
    return { success: false, error: 'No transcript data found in page source' };
  } catch (error) {
    console.error('Error extracting transcript from page source:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Extract transcript from YouTube UI by clicking the transcript button
 * @returns {Promise<Object>} Object containing success status and transcript or error
 */
async function extractFromUI() {
  try {
    // First, check if the transcript button exists
    const transcriptButton = findTranscriptButton();
    if (!transcriptButton) {
      return { success: false, error: 'Transcript button not found in UI' };
    }
    
    // Click the transcript button to open the transcript panel
    transcriptButton.click();
    
    // Wait for the transcript panel to load
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get the transcript text
    const transcriptText = extractTranscriptTextFromUI();
    
    // Close the transcript panel
    const closeButton = document.querySelector('button[aria-label="Close transcript"]');
    if (closeButton) {
      closeButton.click();
    }
    
    if (!transcriptText) {
      return { success: false, error: 'Transcript panel opened but no text found' };
    }
    
    return { 
      success: true, 
      transcript: transcriptText,
      method: 'UI'
    };
  } catch (error) {
    console.error('Error extracting transcript from UI:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Find the transcript button in the YouTube UI
 * @returns {Element|null} The transcript button element or null if not found
 */
function findTranscriptButton() {
  // Try multiple selectors to find the transcript button
  const selectors = [
    // Menu items in the "..." menu
    'ytd-menu-service-item-renderer',
    // Direct transcript button (newer UI)
    'button[aria-label="Show transcript"]',
    // Another possible selector
    'button.ytp-button[data-tooltip-target-id="ytp-transcript-tooltip"]'
  ];
  
  // Try to find the "Show transcript" button using various selectors
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    
    for (const element of elements) {
      const text = element.textContent.trim();
      if (text === 'Show transcript' || text.includes('transcript')) {
        console.log(`Found transcript button using selector: ${selector}`);
        return element;
      }
    }
  }
  
  console.log('Transcript button not found');
  return null;
}

/**
 * Extract transcript text from the YouTube transcript panel
 * @returns {string|null} The transcript text or null if not found
 */
function extractTranscriptTextFromUI() {
  // Try multiple selectors for transcript segments
  const selectors = [
    'yt-formatted-string.segment-text',
    'div.segment-text',
    'div.ytd-transcript-segment-renderer'
  ];
  
  for (const selector of selectors) {
    const segments = document.querySelectorAll(selector);
    if (segments && segments.length > 0) {
      console.log(`Found transcript segments using selector: ${selector}`);
      
      // Combine all segments into a single string
      return Array.from(segments)
        .map(segment => segment.textContent.trim())
        .join(' ');
    }
  }
  
  console.log('No transcript segments found');
  return null;
}

/**
 * Fetch transcript from a caption track URL
 * @param {string} url - The caption track URL
 * @returns {Promise<string>} The transcript text
 */
async function fetchTranscriptFromUrl(url) {
  try {
    const response = await fetch(url);
    
    if (response.status !== 200) {
      throw new Error(`Bad response fetching transcript: ${response.status}`);
    }
    
    const text = await response.text();
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");
    const textElements = xml.getElementsByTagName("text");
    
    if (textElements.length === 0) {
      throw new Error("No text elements found in transcript XML");
    }
    
    // Combine all text elements into a single transcript
    const transcriptText = Array.from(textElements)
      .map(element => {
        // Clean up HTML entities and formatting
        const text = element.innerHTML
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/<[^>]*>/g, '') // Remove any HTML tags
          .replace(/\r?\n|\r/g, ' ') // Replace newlines with spaces
          .trim();
        
        return text;
      })
      .join(' ');
    
    return transcriptText;
  } catch (error) {
    console.error("Error fetching transcript from URL:", error);
    throw error;
  }
}

// Export the main function and helper functions for testing
window.transcriptExtractor = {
  extractTranscript,
  extractFromPlayerResponse,
  extractFromScriptTags,
  extractFromPageSource,
  extractFromUI,
  findTranscriptButton,
  extractTranscriptTextFromUI,
  fetchTranscriptFromUrl
};
