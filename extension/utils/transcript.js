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
    // Try to get the data from the window object
    if (
        window.ytInitialPlayerResponse &&
        window.ytInitialPlayerResponse.captions &&
        window.ytInitialPlayerResponse.captions.playerCaptionsTracklistRenderer
    ) {
        return {
            captionTracks:
                window.ytInitialPlayerResponse.captions
                    .playerCaptionsTracklistRenderer.captionTracks,
        };
    }

    // If not found in window object, try to extract from script tags
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

    throw new Error("Could not find transcript data");
}

// Get transcript for a specific language
async function getTranscript(url) {
    try {
        const response = await fetch(url);

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
function getVideoDetails() {
    // Get video ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get("v");

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
