/**
 * YouTube Utility Module
 * Provides utilities for interacting with YouTube's DOM structure
 */

class YouTubeService {
  /**
   * Find YouTube elements in the page
   * @returns {Object} - Object with YouTube elements
   */
  findElements() {
    return {
      // Main sections
      playerContainer: document.querySelector('#player-container'),
      primaryColumn: document.querySelector('#primary'),
      secondaryColumn: document.querySelector('#secondary') || document.querySelector('#secondary-inner'),
      
      // Video elements
      videoPlayer: document.querySelector('video.html5-main-video'),
      videoTitle: document.querySelector('h1.title') || document.querySelector('h1.ytd-watch-metadata'),
      videoChannel: document.querySelector('#owner-name a') || document.querySelector('#channel-name'),
      
      // Related videos section
      relatedVideos: document.querySelector('#related'),
      
      // Comments section
      comments: document.querySelector('#comments')
    };
  }

  /**
   * Get video details from the current page
   * @returns {Object} - Video details (videoId, title, channelName)
   */
  getVideoDetails() {
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
   * Insert element at the top of YouTube's secondary column (related videos section)
   * @param {HTMLElement} element - Element to insert
   * @returns {boolean} - True if successful, false otherwise
   */
  insertIntoSecondaryColumn(element) {
    const secondaryColumn = this.findElements().secondaryColumn;
    
    if (!secondaryColumn) {
      console.error('Could not find secondary column to inject element');
      return false;
    }
    
    secondaryColumn.insertBefore(element, secondaryColumn.firstChild);
    return true;
  }

  /**
   * Check if current page is a YouTube video page
   * @returns {boolean} - True if on a YouTube video page
   */
  isVideoPage() {
    const regex = /^https?:\/\/(www\.)?youtube\.com\/watch\?v=.+/;
    return regex.test(window.location.href);
  }

  /**
   * Listen for YouTube navigation events
   * @param {Function} callback - Function to call when navigation occurs
   */
  onNavigate(callback) {
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
}

// Export as singleton
const youtubeService = new YouTubeService();
export default youtubeService;
