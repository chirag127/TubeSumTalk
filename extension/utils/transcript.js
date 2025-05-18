/**
 * Utility functions for extracting YouTube transcripts
 */

// Get available transcript languages for a YouTube video
async function getTranscriptLanguages() {
    try {
        // Get the transcript data from YouTube's ytInitialPlayerResponse
        const transcriptData = await getTranscriptData();

        if (!transcriptData || !transcriptData.captionTracks) {
            throw new Error("No transcript data found");
        }

        // Extract language info
        return transcriptData.captionTracks.map((track) => ({
            code: track.languageCode,
            name: track.name.simpleText,
            url: track.baseUrl,
        }));
    } catch (error) {
        console.error("Error getting transcript languages:", error);
        throw error;
    }
}

// Get transcript data from YouTube's ytInitialPlayerResponse
async function getTranscriptData() {
    console.log("Getting transcript data...");

    // Try to get the data from the window object
    if (
        window.ytInitialPlayerResponse &&
        window.ytInitialPlayerResponse.captions &&
        window.ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer
    ) {
        console.log("Found transcript data in window.ytInitialPlayerResponse");

        // Make a deep copy of the caption tracks to avoid reference issues
        const captionTracks = JSON.parse(
            JSON.stringify(
                window.ytInitialPlayerResponse.captions
                    .playerCaptionsTracklistRenderer.captionTracks
            )
        );

        return {
            captionTracks: captionTracks,
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

    // Try to find transcript data in the page source
    console.log("Trying to find transcript data in page source...");
    try {
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
                        data.captions.playerCaptionsTracklistRenderer
                            .captionTracks
                    ) {
                        console.log(`Found transcript data in ${container}`);
                        return {
                            captionTracks:
                                data.captions.playerCaptionsTracklistRenderer
                                    .captionTracks,
                        };
                    }
                } catch (e) {
                    console.error(`Error parsing ${container}:`, e);
                }
            }
        }
    } catch (error) {
        console.error(
            "Error searching page source for transcript data:",
            error
        );
    }

    // If we still can't find the transcript data, wait a bit and try again
    // This helps with YouTube's dynamic loading
    if (document.readyState !== "complete") {
        console.log("Page not fully loaded, waiting before retrying...");
        return new Promise((resolve, reject) => {
            window.addEventListener("load", async () => {
                try {
                    // Try again after page is fully loaded
                    console.log(
                        "Page loaded, retrying transcript data extraction"
                    );
                    const data = await getTranscriptData();
                    resolve(data);
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    console.error("Could not find transcript data");
    throw new Error("Could not find transcript data");
}

// Get transcript for a specific language
async function getTranscript(url) {
    try {
        // Add a cache-busting parameter to the URL to ensure we get fresh data
        const cacheBustUrl =
            url + (url.includes("?") ? "&" : "?") + "_t=" + Date.now();
        console.log("Fetching transcript with cache-busting URL");

        const response = await fetch(cacheBustUrl, {
            cache: "no-store", // Force bypassing the browser cache
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
            },
        });

        if (response.status !== 200) {
            throw new Error(
                `Bad response fetching transcript: ${response.status}`
            );
        }

        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "text/xml");
        const textElements = xml.getElementsByTagName("text");

        if (textElements.length === 0) {
            return [];
        }

        const transcript = [
            {
                timestamp: parseInt(textElements[0].getAttribute("start")),
                text: "",
            },
        ];

        let sentenceCount = 0;

        for (const element of textElements) {
            const text = element.innerHTML.replace(/\r?\n|\r/g, " ").trim();
            const timestamp = parseInt(element.getAttribute("start"));
            const lastSegment = transcript[transcript.length - 1];
            const textLength = lastSegment.text.length;
            const wordCount = lastSegment.text.split(" ").length;

            if (textLength >= 500 || wordCount >= 100 || sentenceCount >= 3) {
                transcript.push({
                    timestamp,
                    text,
                });
                sentenceCount = 0;
                continue;
            }

            lastSegment.text += " " + text;

            if (text[text.length - 1] === ".") {
                sentenceCount++;
            }
        }

        // Clean up HTML entities
        for (const segment of transcript) {
            segment.text =
                new DOMParser().parseFromString(segment.text, "text/html")
                    .documentElement.textContent || "";
        }

        return transcript;
    } catch (error) {
        console.error("Error getting transcript:", error);
        throw error;
    }
}

// Get video details (title, author, videoId)
function getVideoDetails(forceRefresh = false) {
    // Get video ID from URL - handle both standard watch URLs and livestream URLs
    let videoId;

    // Check if this is a livestream URL (format: /live/VIDEO_ID)
    const liveMatch = window.location.pathname.match(/\/live\/([^\/\?]+)/);
    if (liveMatch && liveMatch[1]) {
        videoId = liveMatch[1];
        console.log("Detected livestream URL, extracted video ID:", videoId);
    } else {
        // Standard watch URL (format: /watch?v=VIDEO_ID)
        const urlParams = new URLSearchParams(window.location.search);
        videoId = urlParams.get("v");
    }

    console.log(
        "Getting details for video ID:",
        videoId,
        "force refresh:",
        forceRefresh
    );

    // If forcing refresh, try to get the most up-to-date data
    if (forceRefresh) {
        // Try to get the current video element
        const videoElement = document.querySelector("video.html5-main-video");
        if (videoElement) {
            console.log(
                "Found video element, current time:",
                videoElement.currentTime
            );
        }
    }

    // Try to get video details from YouTube's ytInitialPlayerResponse
    try {
        // For forced refresh, try to get the most up-to-date data from the page
        if (forceRefresh) {
            // Try to get data from the player directly
            try {
                // This approach tries to access the YouTube player API
                const player = document.querySelector("#movie_player");
                if (player && player.getVideoData) {
                    const playerData = player.getVideoData();
                    console.log(
                        "Found video details from player API:",
                        playerData
                    );
                    if (playerData && playerData.video_id) {
                        return {
                            videoId: playerData.video_id,
                            title:
                                playerData.title ||
                                document.title.replace(" - YouTube", ""),
                            author: playerData.author || "Unknown Author",
                        };
                    }
                }
            } catch (playerError) {
                console.error("Error getting data from player:", playerError);
            }
        }

        // Try the standard approach with ytInitialPlayerResponse
        if (
            window.ytInitialPlayerResponse &&
            window.ytInitialPlayerResponse.videoDetails
        ) {
            const videoDetails = window.ytInitialPlayerResponse.videoDetails;
            console.log(
                "Found video details in ytInitialPlayerResponse:",
                videoDetails.title
            );

            return {
                videoId: videoDetails.videoId,
                title: videoDetails.title,
                author: videoDetails.author,
            };
        }
    } catch (error) {
        console.error(
            "Error getting video details from ytInitialPlayerResponse:",
            error
        );
    }

    // Fallback to DOM selectors if ytInitialPlayerResponse is not available
    console.log("Falling back to DOM selectors for video details");

    // Get video title - try multiple selectors to handle YouTube's DOM structure
    let title = "Unknown Title";
    const titleSelectors = [
        "h1.title", // Old selector
        "h1.ytd-watch-metadata", // Another possible selector
        "#title h1", // Another possible selector
        "#title", // Another possible selector
        "ytd-watch-metadata h1", // Another possible selector
        "h1.style-scope.ytd-watch-metadata", // More specific selector
        "#above-the-fold #title", // Another possible selector
        "#primary-inner #title", // Another possible selector
    ];

    for (const selector of titleSelectors) {
        const titleElement = document.querySelector(selector);
        if (titleElement && titleElement.textContent.trim()) {
            title = titleElement.textContent.trim();
            console.log(`Found title using selector: ${selector}`);
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
                console.log("Found title using h1 element search");
                break;
            }
        }

        // Try to extract from page title
        if (title === "Unknown Title" && document.title) {
            // YouTube titles are usually in the format "Title - YouTube"
            const pageTitle = document.title.replace(" - YouTube", "").trim();
            if (pageTitle) {
                title = pageTitle;
                console.log("Found title from page title:", title);
            }
        }
    }

    console.log("Video title:", title);

    // Get video author
    let author = "Unknown Author";
    const authorSelectors = [
        "#owner-name a", // Old selector
        "#channel-name", // Another possible selector
        "#owner #channel-name", // Another possible selector
        "ytd-channel-name", // Another possible selector
        "ytd-video-owner-renderer #channel-name", // More specific selector
        "#above-the-fold #channel-name", // Another possible selector
        "#primary-inner #channel-name", // Another possible selector
    ];

    for (const selector of authorSelectors) {
        const authorElement = document.querySelector(selector);
        if (authorElement && authorElement.textContent.trim()) {
            author = authorElement.textContent.trim();
            console.log(`Found author using selector: ${selector}`);
            break;
        }
    }

    console.log("Video author:", author);

    return {
        videoId,
        title,
        author,
    };
}
