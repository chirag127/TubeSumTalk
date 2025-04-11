/**
 * TubeSumTalk - Background Script
 * 
 * This script runs in the background and is responsible for:
 * 1. Handling communication between content scripts and the backend API
 * 2. Storing and retrieving data from the browser's storage
 */

// Configuration
const API_BASE_URL = 'http://localhost:8000'; // Change this to your deployed backend URL in production

// Cache for storing summaries to avoid repeated API calls
const summaryCache = new Map();

/**
 * Fetch a summary for a YouTube video from the backend API
 * @param {string} videoId The YouTube video ID
 * @returns {Promise<Object>} The summary result
 */
async function fetchSummary(videoId) {
    try {
        // Check if the summary is already in the cache
        if (summaryCache.has(videoId)) {
            console.log(`Using cached summary for video ${videoId}`);
            return summaryCache.get(videoId);
        }
        
        console.log(`Fetching summary for video ${videoId}`);
        
        // Construct the video URL
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // Make the API request
        const response = await fetch(`${API_BASE_URL}/summarize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                video_url: videoUrl
            })
        });
        
        // Parse the response
        const result = await response.json();
        
        // Cache the result
        summaryCache.set(videoId, result);
        
        // Also store in chrome.storage for persistence
        chrome.storage.local.set({
            [`summary_${videoId}`]: {
                result,
                timestamp: Date.now()
            }
        });
        
        return result;
    } catch (error) {
        console.error('Error fetching summary:', error);
        return {
            error: `Failed to fetch summary: ${error.message}`
        };
    }
}

/**
 * Handle messages from content scripts
 * @param {Object} message The message
 * @param {Object} sender The sender information
 * @param {Function} sendResponse The response callback
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'getSummary') {
        const videoId = message.videoId;
        
        // Check if we have the summary in storage first
        chrome.storage.local.get([`summary_${videoId}`], async (data) => {
            const storedData = data[`summary_${videoId}`];
            
            // If we have stored data and it's less than 24 hours old, use it
            if (storedData && (Date.now() - storedData.timestamp < 24 * 60 * 60 * 1000)) {
                console.log(`Using stored summary for video ${videoId}`);
                
                // Send the result back to the content script
                chrome.tabs.sendMessage(sender.tab.id, {
                    action: 'summaryResult',
                    result: storedData.result
                });
                
                return;
            }
            
            // Otherwise, fetch a new summary
            const result = await fetchSummary(videoId);
            
            // Send the result back to the content script
            chrome.tabs.sendMessage(sender.tab.id, {
                action: 'summaryResult',
                result
            });
        });
        
        // Return true to indicate that we will respond asynchronously
        return true;
    }
});

/**
 * Handle extension installation or update
 */
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('TubeSumTalk extension installed');
    } else if (details.reason === 'update') {
        console.log(`TubeSumTalk extension updated from ${details.previousVersion} to ${chrome.runtime.getManifest().version}`);
    }
});
