/**
 * TubeSumTalk Background Service Worker (Modular Version)
 * Handles communication between content scripts and the backend API
 */

// Import utility modules
import apiService from '../utils/api.js';
import settingsManager from '../utils/settings.js';

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "summarize") {
        summarizeVideo(
            message.videoId,
            message.transcript,
            message.title,
            message.summaryType,
            message.summaryLength
        )
            .then((summary) => {
                sendResponse({ success: true, summary });

                // Also send to any open tabs with the same video
                chrome.tabs.query({}, (tabs) => {
                    tabs.forEach((tab) => {
                        if (tab.id !== sender.tab.id) {
                            chrome.tabs
                                .sendMessage(tab.id, {
                                    action: "updateSummary",
                                    videoId: message.videoId,
                                    summary,
                                })
                                .catch(() => {
                                    // Ignore errors (tab might not have content script)
                                });
                        }
                    });
                });
            })
            .catch((error) => {
                console.error("Error summarizing video:", error);
                sendResponse({ success: false, error: error.message });
            });

        // Return true to indicate we'll send a response asynchronously
        return true;
    }

    if (message.action === "getSettings") {
        // Use the settings manager to get settings
        settingsManager.getAll().then(settings => {
            sendResponse(settings);
        }).catch(error => {
            console.error("Error getting settings:", error);
            sendResponse({
                summaryType: "bullet",
                summaryLength: "medium",
                ttsVoice: "default",
                ttsRate: 1.0,
                ttsPitch: 1.0,
            });
        });

        // Return true to indicate we'll send a response asynchronously
        return true;
    }

    if (message.action === "saveSettings") {
        // Use the settings manager to save settings
        settingsManager.save({
            summaryType: message.summaryType,
            summaryLength: message.summaryLength,
            ttsVoice: message.ttsVoice,
            ttsRate: message.ttsRate,
            ttsPitch: message.ttsPitch,
        }).then(() => {
            sendResponse({ success: true });
        }).catch(error => {
            console.error("Error saving settings:", error);
            sendResponse({ success: false, error: error.message });
        });

        // Return true to indicate we'll send a response asynchronously
        return true;
    }
});

// Function to call the backend API
async function summarizeVideo(
    videoId,
    transcript,
    title,
    summaryType = "bullet",
    summaryLength = "medium"
) {
    try {
        // Use the API service to get the summary
        return await apiService.getSummary(
            videoId,
            transcript,
            title,
            summaryType,
            summaryLength
        );
    } catch (error) {
        console.error("Error calling API:", error);
        throw error;
    }
}

// Initialize the service worker
function initialize() {
    console.log("TubeSumTalk background service worker initialized");
    
    // Check API health
    apiService.checkHealth().then(health => {
        console.log("API health check:", health);
    }).catch(error => {
        console.error("API health check failed:", error);
    });
}

// Start the service worker
initialize();
