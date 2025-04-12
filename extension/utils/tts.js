/**
 * Utility functions for text-to-speech with word highlighting
 */

// TTS state
let currentUtterance = null;
let isPlaying = false;

// Speak text with word highlighting
function speakWithHighlighting(text, options = {}) {
    // Stop any current speech
    stopSpeaking();

    // Split text into words and create spans
    const words = text.split(" ");
    const container = document.getElementById("tubesumtalk-summary");

    if (!container) {
        console.error("Summary container not found");
        return;
    }

    container.innerHTML = "";

    words.forEach((word, index) => {
        const span = document.createElement("span");
        span.textContent = word + " ";
        span.id = `tubesumtalk-word-${index}`;
        span.className = "tubesumtalk-word";
        container.appendChild(span);
    });

    // Extract plain text if HTML content is provided
    const plainText = text.replace(/<[^>]*>/g, "");

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(plainText);
    currentUtterance = utterance;

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
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
}

// Stop speaking
function stopSpeaking() {
    if (currentUtterance) {
        window.speechSynthesis.cancel();
        isPlaying = false;
        updatePlayPauseButton();

        // Remove highlight
        const highlighted = document.querySelector(".tubesumtalk-highlighted");
        if (highlighted) {
            highlighted.classList.remove("tubesumtalk-highlighted");
        }
    }
}

// Toggle play/pause
function togglePlayPause(text, options = {}) {
    if (isPlaying) {
        stopSpeaking();
    } else {
        speakWithHighlighting(text, options);
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
