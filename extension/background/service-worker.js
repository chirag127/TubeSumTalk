/**
 * TubeSumTalk Background Service Worker
 * Handles communication between content scripts and the backend API
 */

// Constants
// const API_BASE_URL = "https://tubesumtalk.onrender.com";
const API_BASE_URL = "http://localhost:8000";

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "summarize") {
        // Get API key from storage
        chrome.storage.sync.get(["apiKey"], (result) => {
            if (!result.apiKey) {
                sendResponse({
                    success: false,
                    error: "No API key found. Please add your Gemini API key in the extension settings.",
                });
                return;
            }

            summarizeVideo(
                message.videoId,
                message.transcript,
                message.title,
                message.summaryType,
                message.summaryLength,
                result.apiKey
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
        });

        // Return true to indicate we'll send a response asynchronously
        return true;
    }

    if (message.action === "askQuestion") {
        // Get API key from storage
        chrome.storage.sync.get(["apiKey"], (result) => {
            if (!result.apiKey) {
                sendResponse({
                    success: false,
                    error: "No API key found. Please add your Gemini API key in the extension settings.",
                });
                return;
            }

            askQuestion(message.transcript, message.question, result.apiKey)
                .then((answer) => {
                    sendResponse({ success: true, answer });
                })
                .catch((error) => {
                    console.error("Error asking question:", error);
                    sendResponse({ success: false, error: error.message });
                });
        });

        // Return true to indicate we'll send a response asynchronously
        return true;
    }

    if (message.action === "getSettings") {
        chrome.storage.sync.get(
            [
                "apiKey",
                "summaryType",
                "summaryLength",
                "ttsVoice",
                "ttsRate",
                "ttsPitch",
                "sidebarWidth",
            ],
            (result) => {
                sendResponse({
                    apiKey: result.apiKey || "",
                    summaryType: result.summaryType || "bullet",
                    summaryLength: result.summaryLength || "medium",
                    ttsVoice: result.ttsVoice || "default",
                    ttsRate: result.ttsRate || 1.0,
                    ttsPitch: result.ttsPitch || 1.0,
                    sidebarWidth: result.sidebarWidth || 320,
                });
            }
        );

        // Return true to indicate we'll send a response asynchronously
        return true;
    }

    if (message.action === "saveSettings") {
        const settings = {
            summaryType: message.summaryType,
            summaryLength: message.summaryLength,
            ttsVoice: message.ttsVoice,
            ttsRate: message.ttsRate,
            ttsPitch: message.ttsPitch,
        };

        // Only update API key if provided
        if (message.apiKey !== undefined) {
            settings.apiKey = message.apiKey;
        }

        // Only update sidebar width if provided
        if (message.sidebarWidth !== undefined) {
            settings.sidebarWidth = message.sidebarWidth;
        }

        chrome.storage.sync.set(settings, () => {
            sendResponse({ success: true });
        });

        // Return true to indicate we'll send a response asynchronously
        return true;
    }
});

// Function to call the backend API for summarization
async function summarizeVideo(
    videoId,
    transcript,
    title,
    summaryType = "bullet",
    summaryLength = "medium",
    apiKey
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
                apiKey,
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

// Function to call the backend API for Q&A
async function askQuestion(transcript, question, apiKey) {
    try {
        console.log(`Sending request to backend API at ${API_BASE_URL}/ask`);
        console.log("Request data:", {
            question,
            transcriptLength: transcript.length,
        });

        const response = await fetch(`${API_BASE_URL}/ask`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                transcript,
                question,
                apiKey,
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
        console.log("Received answer from API");

        // Return the answer as is - it will be parsed as markdown in the sidebar
        return data.answer;
    } catch (error) {
        console.error("Error calling API:", error);
        throw error;
    }
}
