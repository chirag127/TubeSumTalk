// Global variables
let sidebar = null;
let currentVideoId = null;
let sidebarIframe = null;

// Initialize when the page loads
init();

/**
 * Initialize the extension
 */
function init() {
  // Listen for YouTube navigation (SPA)
  observeUrlChanges();
  
  // Initial check for YouTube video
  checkForYouTubeVideo();
  
  // Listen for messages from the sidebar iframe
  window.addEventListener('message', handleSidebarMessages);
  
  // Listen for messages from the background script
  chrome.runtime.onMessage.addListener(handleBackgroundMessages);
}

/**
 * Observe URL changes for YouTube SPA navigation
 */
function observeUrlChanges() {
  let lastUrl = location.href;
  
  // Create a new observer
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      checkForYouTubeVideo();
    }
  });
  
  // Start observing
  observer.observe(document, { subtree: true, childList: true });
}

/**
 * Check if the current page is a YouTube video
 */
function checkForYouTubeVideo() {
  // Check if we're on a YouTube watch page
  if (location.hostname.includes('youtube.com') && location.pathname === '/watch') {
    const videoId = new URLSearchParams(location.search).get('v');
    
    if (videoId && videoId !== currentVideoId) {
      currentVideoId = videoId;
      console.log('YouTube video detected:', videoId);
      
      // Wait for video player to load
      waitForElement('video').then(() => {
        // Get video title
        const title = document.querySelector('h1.title')?.textContent || '';
        
        // Create or update sidebar
        createSidebar(videoId, title);
      });
    }
  } else {
    // Not a YouTube video page, remove sidebar if it exists
    removeSidebar();
    currentVideoId = null;
  }
}

/**
 * Wait for an element to appear in the DOM
 * 
 * @param {string} selector - CSS selector
 * @returns {Promise<Element>} - The found element
 */
function waitForElement(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

/**
 * Create the sidebar for the current video
 * 
 * @param {string} videoId - YouTube video ID
 * @param {string} title - Video title
 */
function createSidebar(videoId, title) {
  // Remove existing sidebar if it exists
  removeSidebar();
  
  // Create sidebar container
  sidebar = document.createElement('div');
  sidebar.id = 'tubesumtalk-sidebar';
  sidebar.className = 'tubesumtalk-sidebar';
  
  // Create iframe for the sidebar content
  sidebarIframe = document.createElement('iframe');
  sidebarIframe.src = chrome.runtime.getURL('sidebar.html');
  sidebarIframe.id = 'tubesumtalk-iframe';
  sidebarIframe.className = 'tubesumtalk-iframe';
  sidebar.appendChild(sidebarIframe);
  
  // Add sidebar to the page
  document.body.appendChild(sidebar);
  
  // Extract transcript when iframe is loaded
  sidebarIframe.onload = () => {
    // Send video info to sidebar
    sidebarIframe.contentWindow.postMessage({
      action: 'videoInfo',
      videoId,
      title
    }, '*');
    
    // Extract transcript
    extractTranscript().then(transcript => {
      if (transcript) {
        sidebarIframe.contentWindow.postMessage({
          action: 'transcript',
          transcript
        }, '*');
      }
    });
  };
}

/**
 * Remove the sidebar from the page
 */
function removeSidebar() {
  if (sidebar) {
    sidebar.remove();
    sidebar = null;
    sidebarIframe = null;
  }
}

/**
 * Extract the transcript from the YouTube video
 * 
 * @returns {Promise<string>} - The video transcript
 */
async function extractTranscript() {
  try {
    // Wait for transcript button to appear
    const transcriptButton = await waitForElement('.ytp-subtitles-button');
    
    // Check if video has captions
    if (!transcriptButton || transcriptButton.getAttribute('aria-pressed') === 'false') {
      console.log('No captions available for this video');
      return null;
    }
    
    // Try to find transcript in window object (from YouTube's data)
    if (window.ytInitialPlayerResponse) {
      const playerResponse = window.ytInitialPlayerResponse;
      
      // Look for captions track in the player response
      if (playerResponse.captions && 
          playerResponse.captions.playerCaptionsTracklistRenderer && 
          playerResponse.captions.playerCaptionsTracklistRenderer.captionTracks) {
        
        const captionTracks = playerResponse.captions.playerCaptionsTracklistRenderer.captionTracks;
        
        if (captionTracks && captionTracks.length > 0) {
          // Get the first caption track (usually the default one)
          const captionTrack = captionTracks[0];
          
          // Fetch the transcript
          const response = await fetch(captionTrack.baseUrl);
          const xmlText = await response.text();
          
          // Parse the XML
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
          
          // Extract text from XML
          const textElements = xmlDoc.getElementsByTagName('text');
          let transcript = '';
          
          for (let i = 0; i < textElements.length; i++) {
            transcript += textElements[i].textContent + ' ';
          }
          
          return transcript.trim();
        }
      }
    }
    
    // Alternative method: look for transcript in the page
    const transcriptElements = document.querySelectorAll('.ytd-transcript-segment-renderer');
    
    if (transcriptElements && transcriptElements.length > 0) {
      let transcript = '';
      
      transcriptElements.forEach(element => {
        transcript += element.textContent + ' ';
      });
      
      return transcript.trim();
    }
    
    // If we can't find the transcript, return null
    console.log('Could not extract transcript');
    return null;
  } catch (error) {
    console.error('Error extracting transcript:', error);
    return null;
  }
}

/**
 * Handle messages from the sidebar iframe
 * 
 * @param {MessageEvent} event - Message event
 */
function handleSidebarMessages(event) {
  // Verify the message source
  if (event.source !== sidebarIframe?.contentWindow) return;
  
  const { action } = event.data;
  
  switch (action) {
    case 'closeSidebar':
      removeSidebar();
      break;
      
    case 'summarize':
      // Extract transcript if not already done
      if (!event.data.transcript) {
        extractTranscript().then(transcript => {
          if (transcript) {
            sidebarIframe.contentWindow.postMessage({
              action: 'transcript',
              transcript
            }, '*');
          }
        });
      }
      break;
      
    default:
      break;
  }
}

/**
 * Handle messages from the background script
 * 
 * @param {Object} message - Message object
 * @param {Object} sender - Sender information
 * @param {Function} sendResponse - Response function
 */
function handleBackgroundMessages(message, sender, sendResponse) {
  // Handle any messages from background script if needed
}
