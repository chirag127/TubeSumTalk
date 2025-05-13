/**
 * Utility functions for text-to-speech with word highlighting
 * Supports speeds up to 16x through custom rate handling
 */

// TTS state
let currentUtterance = null;
let isPlaying = false;
let customPlaybackRate = 1.0;
let utteranceQueue = [];
let isCustomRateActive = false;

// Speak text with word highlighting
function speakWithHighlighting(_, options = {}) {
    // Stop any current speech
    stopSpeaking();

    // Get the summary container
    const container = document.getElementById("tubesumtalk-summary");

    // Get the scrollable container (summary-container or qa-container)
    const scrollContainer =
        options.scrollContainer ||
        (container
            ? container.closest(".tubesumtalk-summary-container")
            : null);

    if (!container) {
        console.error("Summary container not found");
        return;
    }

    // Track if we're in Q&A mode
    const isQAMode = options.qaMode === true;

    console.log("Speaking with highlighting, Q&A mode:", isQAMode);

    // Store the original HTML content
    const originalHTML = container.innerHTML;

    // Create a temporary container with the original HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = originalHTML;

    // Extract readable text from HTML while preserving structure
    // This will convert HTML to plain text but keep the structure for reading
    let readableText = "";
    const extractTextFromNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
            readableText += node.textContent + " ";
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Add extra spaces or line breaks for certain elements
            if (node.tagName === "LI") readableText += "• ";
            if (
                node.tagName === "P" ||
                node.tagName === "LI" ||
                node.tagName === "H1" ||
                node.tagName === "H2" ||
                node.tagName === "H3" ||
                node.tagName === "H4"
            ) {
                Array.from(node.childNodes).forEach(extractTextFromNode);
                readableText += "\n";
            } else {
                Array.from(node.childNodes).forEach(extractTextFromNode);
            }
        }
    };

    // Extract text from the HTML content
    Array.from(tempDiv.childNodes).forEach(extractTextFromNode);

    // Clean up the text (remove extra spaces, etc.)
    readableText = readableText.replace(/\s+/g, " ").trim();

    // Create a new container for the word spans
    container.innerHTML = "";

    // Split the readable text into words for highlighting
    const words = readableText.split(" ").filter((word) => word.trim() !== "");

    // Create spans for each word
    words.forEach((word, index) => {
        const span = document.createElement("span");
        span.textContent = word + " ";
        span.id = `tubesumtalk-word-${index}`;
        span.className = "tubesumtalk-word";
        container.appendChild(span);
    });

    // Create utterance with the readable text
    const utterance = new SpeechSynthesisUtterance(readableText);
    currentUtterance = utterance;

    // Store original HTML for restoration later
    utterance._originalHTML = originalHTML;

    // Set voice, rate, pitch from options or defaults
    const voices = window.speechSynthesis.getVoices();

    if (options.voice && options.voice !== "default") {
        const selectedVoice = voices.find(
            (voice) => voice.name === options.voice
        );
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
    }

    // Handle playback rate (supporting up to 16x)
    const requestedRate = options.rate || 1.0;
    customPlaybackRate = requestedRate;

    // Web Speech API typically limits rate to 0.1-10, so we'll use a custom approach for higher rates
    if (requestedRate > 10) {
        // Use maximum browser-supported rate (typically 10)
        utterance.rate = 10;
        isCustomRateActive = true;
    } else {
        utterance.rate = requestedRate;
        isCustomRateActive = false;
    }

    utterance.pitch = options.pitch || 1.0;

    // Word boundary event
    utterance.onboundary = (event) => {
        if (event.name === "word") {
            // Remove previous highlight
            const highlighted = document.querySelector(
                ".tubesumtalk-highlighted"
            );
            if (highlighted) {
                highlighted.classList.remove("tubesumtalk-highlighted");
            }

            // Calculate word index based on character index
            // This is an approximation and may need adjustment
            const text = utterance.text;
            const charIndex = event.charIndex;

            // Find the word at the current character index
            let wordCount = 0;
            let currentIndex = 0;

            while (currentIndex < charIndex && currentIndex < text.length) {
                // Skip spaces
                while (
                    currentIndex < text.length &&
                    text[currentIndex] === " "
                ) {
                    currentIndex++;
                }

                // Skip non-spaces (i.e., a word)
                while (
                    currentIndex < text.length &&
                    text[currentIndex] !== " "
                ) {
                    currentIndex++;
                }

                wordCount++;
            }

            // Adjust word count (0-based index)
            wordCount = Math.max(0, wordCount - 1);

            // Add highlight to current word
            const wordSpan = document.getElementById(
                `tubesumtalk-word-${wordCount}`
            );

            if (wordSpan) {
                wordSpan.classList.add("tubesumtalk-highlighted");

                // Scroll to the word within the container if needed
                if (scrollContainer) {
                    // Calculate position for scrolling within container
                    const containerRect =
                        scrollContainer.getBoundingClientRect();
                    const wordRect = wordSpan.getBoundingClientRect();

                    // Check if word is outside visible area of container
                    const isAbove = wordRect.top < containerRect.top;
                    const isBelow = wordRect.bottom > containerRect.bottom;

                    if (isAbove || isBelow) {
                        // Calculate the scroll position to center the word
                        const scrollTop =
                            wordRect.top +
                            scrollContainer.scrollTop -
                            containerRect.top -
                            containerRect.height / 2 +
                            wordRect.height / 2;

                        // Smooth scroll to the word
                        scrollContainer.scrollTo({
                            top: scrollTop,
                            behavior: "smooth",
                        });
                    }
                }
            } else if (isQAMode && options.qaElement) {
                // For Q&A mode, we need to highlight in the actual answer element
                // Since we're using a temporary container for TTS
                console.log(
                    "Highlighting word in Q&A mode, word count:",
                    wordCount
                );

                try {
                    // First, remove any existing highlights in the Q&A element
                    const existingHighlights =
                        options.qaElement.querySelectorAll(
                            ".tubesumtalk-highlighted"
                        );
                    existingHighlights.forEach((el) => {
                        // Replace the highlighted span with its text content
                        const textNode = document.createTextNode(
                            el.textContent
                        );
                        el.parentNode.replaceChild(textNode, el);
                    });

                    // Normalize the DOM to merge adjacent text nodes
                    options.qaElement.normalize();

                    // Find all text nodes in the Q&A element
                    const textNodes = [];
                    const walker = document.createTreeWalker(
                        options.qaElement,
                        NodeFilter.SHOW_TEXT,
                        null,
                        false
                    );

                    let node;
                    while ((node = walker.nextNode())) {
                        if (node.textContent.trim()) {
                            textNodes.push(node);
                        }
                    }

                    if (textNodes.length === 0) {
                        console.warn("No text nodes found in Q&A element");
                        return;
                    }

                    // Find the word in the text nodes
                    let wordIndex = wordCount;
                    let targetNode = null;
                    let targetOffset = 0;
                    let targetWord = "";

                    // Get all words from all text nodes
                    const allWords = [];
                    for (const node of textNodes) {
                        const nodeWords = node.textContent
                            .split(/\s+/)
                            .filter((w) => w.trim());
                        allWords.push(...nodeWords);
                    }

                    // Make sure we don't go out of bounds
                    if (wordIndex >= allWords.length) {
                        wordIndex = allWords.length - 1;
                    }

                    // Get the target word
                    targetWord = allWords[wordIndex];

                    if (!targetWord) {
                        console.warn(
                            "Target word not found at index:",
                            wordIndex
                        );
                        return;
                    }

                    console.log(
                        "Target word:",
                        targetWord,
                        "at index:",
                        wordIndex
                    );

                    // Find which text node contains this word
                    let currentWordCount = 0;
                    for (const node of textNodes) {
                        const nodeText = node.textContent;
                        const nodeWords = nodeText
                            .split(/\s+/)
                            .filter((w) => w.trim());

                        if (currentWordCount + nodeWords.length > wordIndex) {
                            // This node contains our target word
                            targetNode = node;
                            const wordInNodeIndex =
                                wordIndex - currentWordCount;

                            // Find the offset of this word in the node text
                            let currentOffset = 0;
                            for (let i = 0; i < wordInNodeIndex; i++) {
                                const wordToFind = nodeWords[i];
                                const nextIndex = nodeText.indexOf(
                                    wordToFind,
                                    currentOffset
                                );
                                if (nextIndex >= 0) {
                                    currentOffset =
                                        nextIndex + wordToFind.length;
                                }
                            }

                            // Find the target word in the node text
                            targetOffset = nodeText.indexOf(
                                targetWord,
                                currentOffset
                            );
                            break;
                        }

                        currentWordCount += nodeWords.length;
                    }

                    // If we found the node containing the word, create a highlight
                    if (targetNode && targetOffset >= 0) {
                        const range = document.createRange();
                        const wordEnd = targetNode.textContent.indexOf(
                            " ",
                            targetOffset + 1
                        );
                        const endOffset =
                            wordEnd > 0
                                ? wordEnd
                                : targetOffset + targetWord.length;

                        range.setStart(targetNode, targetOffset);
                        range.setEnd(targetNode, endOffset);

                        // Create highlight span
                        const span = document.createElement("span");
                        span.className = "tubesumtalk-highlighted";
                        range.surroundContents(span);

                        // Scroll to the highlighted word
                        if (scrollContainer) {
                            const spanRect = span.getBoundingClientRect();
                            const containerRect =
                                scrollContainer.getBoundingClientRect();

                            // Check if word is outside visible area
                            const isAbove = spanRect.top < containerRect.top;
                            const isBelow =
                                spanRect.bottom > containerRect.bottom;

                            if (isAbove || isBelow) {
                                const scrollTop =
                                    spanRect.top +
                                    scrollContainer.scrollTop -
                                    containerRect.top -
                                    containerRect.height / 2 +
                                    spanRect.height / 2;

                                scrollContainer.scrollTo({
                                    top: scrollTop,
                                    behavior: "smooth",
                                });
                            }
                        }
                    } else {
                        console.warn(
                            "Could not find target node or offset for word:",
                            targetWord
                        );
                    }
                } catch (e) {
                    console.error("Error highlighting word in Q&A mode:", e);
                }
            }
        }
    };

    // Start/end events
    utterance.onstart = () => {
        isPlaying = true;
        updatePlayPauseButton();
    };

    utterance.onend = () => {
        isPlaying = false;
        updatePlayPauseButton();

        // Remove highlight
        const highlighted = document.querySelector(".tubesumtalk-highlighted");
        if (highlighted) {
            highlighted.classList.remove("tubesumtalk-highlighted");
        }

        // Restore the original HTML content
        const container = document.getElementById("tubesumtalk-summary");
        if (container && utterance._originalHTML) {
            container.innerHTML = utterance._originalHTML;
        }

        // Update the Q&A play button if in Q&A mode
        if (isQAMode) {
            const qaPlayPauseButton = document.getElementById(
                "tubesumtalk-qa-play-pause"
            );
            if (qaPlayPauseButton) {
                qaPlayPauseButton.textContent = "▶";
                qaPlayPauseButton.setAttribute("aria-label", "Play");
            }

            // Clean up the temporary container if it exists
            if (window.tubesumtalkQATempContainer) {
                console.log("Cleaning up temporary Q&A container");
                try {
                    document.body.removeChild(
                        window.tubesumtalkQATempContainer
                    );
                } catch (e) {
                    console.error("Error removing temporary Q&A container:", e);
                }
                window.tubesumtalkQATempContainer = null;
            }
        }
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
}

// Stop speaking
function stopSpeaking() {
    if (currentUtterance) {
        // Store the original HTML before canceling
        const originalHTML = currentUtterance._originalHTML;

        window.speechSynthesis.cancel();
        isPlaying = false;
        updatePlayPauseButton();

        // Remove highlight
        const highlighted = document.querySelector(".tubesumtalk-highlighted");
        if (highlighted) {
            highlighted.classList.remove("tubesumtalk-highlighted");
        }

        // Restore the original HTML content
        if (originalHTML) {
            const container = document.getElementById("tubesumtalk-summary");
            if (container) {
                container.innerHTML = originalHTML;
            }
        }

        // Clean up the temporary Q&A container if it exists
        if (window.tubesumtalkQATempContainer) {
            console.log("Cleaning up temporary Q&A container on stop");
            try {
                document.body.removeChild(window.tubesumtalkQATempContainer);
            } catch (e) {
                console.error("Error removing temporary Q&A container:", e);
            }
            window.tubesumtalkQATempContainer = null;
        }
    }
}

// Toggle play/pause
function togglePlayPause(_, options = {}) {
    if (isPlaying) {
        stopSpeaking();
    } else {
        // We don't need to pass the text as the function will get it from the container
        speakWithHighlighting(null, options);
    }
}

// Update play/pause button
function updatePlayPauseButton() {
    // Update the main summary play/pause button
    const playPauseButton = document.getElementById("tubesumtalk-play-pause");
    if (playPauseButton) {
        playPauseButton.textContent = isPlaying ? "⏸" : "▶";
        playPauseButton.setAttribute(
            "aria-label",
            isPlaying ? "Pause" : "Play"
        );
    }

    // Also update the Q&A play/pause button
    const qaPlayPauseButton = document.getElementById(
        "tubesumtalk-qa-play-pause"
    );
    if (qaPlayPauseButton) {
        qaPlayPauseButton.textContent = isPlaying ? "⏸" : "▶";
        qaPlayPauseButton.setAttribute(
            "aria-label",
            isPlaying ? "Pause" : "Play"
        );
    }
}

// Get available voices
function getAvailableVoices() {
    return new Promise((resolve) => {
        const voices = window.speechSynthesis.getVoices();

        if (voices.length > 0) {
            resolve(voices);
        } else {
            // If voices aren't loaded yet, wait for them
            window.speechSynthesis.onvoiceschanged = () => {
                resolve(window.speechSynthesis.getVoices());
            };
        }
    });
}

// Populate voice select dropdown
async function populateVoiceSelect(selectElement) {
    const voices = await getAvailableVoices();

    // Clear existing options
    selectElement.innerHTML = '<option value="default">Default Voice</option>';

    // Add voices to select
    voices.forEach((voice) => {
        const option = document.createElement("option");
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})`;
        selectElement.appendChild(option);
    });

    // Get saved voice preference
    chrome.storage.sync.get(["ttsVoice"], (result) => {
        if (result.ttsVoice && result.ttsVoice !== "default") {
            selectElement.value = result.ttsVoice;
        }
    });
}
