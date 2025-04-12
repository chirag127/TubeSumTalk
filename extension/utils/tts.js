/**
 * Utility functions for text-to-speech with word highlighting
 */

// TTS state
let currentUtterance = null;
let isPlaying = false;

// Speak text with word highlighting
function speakWithHighlighting(_, options = {}) {
    // Stop any current speech
    stopSpeaking();

    // Get the summary container
    const container = document.getElementById("tubesumtalk-summary");

    if (!container) {
        console.error("Summary container not found");
        return;
    }

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

    // Set rate (speed) with support for up to 16x
    utterance.rate = options.rate || 1.0;
    // Note: The Web Speech API might have limitations on the maximum rate
    // Some browsers might cap it at lower values

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

                // Scroll to the word if needed
                wordSpan.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
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
    const playPauseButton = document.getElementById("tubesumtalk-play-pause");
    if (playPauseButton) {
        playPauseButton.textContent = isPlaying ? "⏸" : "▶";
        playPauseButton.setAttribute(
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
