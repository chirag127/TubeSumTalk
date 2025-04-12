/**
 * TubeSumTalk Background Service Worker
 * Handles communication between content scripts and the backend API
 */

// Constants
const API_BASE_URL = "https://tubesumtalk.onrender.com";

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
        chrome.storage.sync.get(
            ["summaryType", "summaryLength", "ttsVoice", "ttsRate", "ttsPitch"],
            (result) => {
                sendResponse({
                    summaryType: result.summaryType || "bullet",
                    summaryLength: result.summaryLength || "medium",
                    ttsVoice: result.ttsVoice || "default",
                    ttsRate: result.ttsRate || 1.0,
                    ttsPitch: result.ttsPitch || 1.0,
                });
            }
        );

        // Return true to indicate we'll send a response asynchronously
        return true;
    }

    if (message.action === "saveSettings") {
        chrome.storage.sync.set(
            {
                summaryType: message.summaryType,
                summaryLength: message.summaryLength,
                ttsVoice: message.ttsVoice,
                ttsRate: message.ttsRate,
                ttsPitch: message.ttsPitch,
            },
            () => {
                sendResponse({ success: true });
            }
        );

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
        console.log(
            `Sending request to backend API at ${API_BASE_URL}/summarize`
        );
        console.log("Request data:", {
            videoId,
            title,
            transcriptLength: transcript.length,
            summaryType,
            summaryLength,
        });

        const response = await fetch(`${API_BASE_URL}/summarize`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                videoId,
                transcript,
                title,
                summaryType,
                summaryLength,
            }),
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
            let errorMessage = `API error: ${response.status}`;

            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
            } catch (e) {
                console.error("Failed to parse error response:", e);
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log("Received summary from API");

        // Return the summary as is - it will be parsed as markdown in the sidebar
        return data.summary;
    } catch (error) {
        console.error("Error calling API:", error);
        throw error;
    }
}
