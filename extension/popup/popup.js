/**
 * TubeSumTalk Popup Script (Modular Version)
 */

// Import utility modules
import settingsManager from '../utils/settings.js';
import ttsService from '../utils/tts.js';
import uiService from '../utils/ui.js';

/**
 * Initialize the popup UI
 */
function initPopup() {
    // Get elements
    const summaryTypeSelect = document.getElementById("summary-type");
    const summaryLengthSelect = document.getElementById("summary-length");
    const voiceSelect = document.getElementById("tts-voice");
    const speedSlider = document.getElementById("tts-speed");
    const speedValue = document.getElementById("tts-speed-value");
    const pitchSlider = document.getElementById("tts-pitch");
    const pitchValue = document.getElementById("tts-pitch-value");
    const saveButton = document.getElementById("save-settings");
    const resetButton = document.getElementById("reset-settings");

    // Populate voice options
    populateVoices();

    // Load settings
    loadSettings();

    // Add event listeners
    setupEventListeners();

    /**
     * Populate voice options in the select dropdown
     */
    function populateVoices() {
        // Get available voices
        const voices = ttsService.getVoices();

        if (voices.length === 0) {
            // If voices aren't loaded yet, wait for them
            window.speechSynthesis.onvoiceschanged = populateVoices;
            return;
        }

        // Clear existing options
        voiceSelect.innerHTML = '<option value="default">Default Voice</option>';

        // Add voices to select
        voices.forEach((voice) => {
            const option = document.createElement("option");
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
    }

    /**
     * Load settings from storage
     */
    async function loadSettings() {
        try {
            // Get all settings
            const settings = await settingsManager.getAll();

            // Set summary type
            if (settings.summaryType) {
                summaryTypeSelect.value = settings.summaryType;
            }

            // Set summary length
            if (settings.summaryLength) {
                summaryLengthSelect.value = settings.summaryLength;
            }

            // Set TTS voice
            if (settings.ttsVoice !== "default") {
                voiceSelect.value = settings.ttsVoice;
            }

            // Set TTS speed
            speedSlider.value = settings.ttsRate;
            speedValue.textContent = `${parseFloat(speedSlider.value).toFixed(1)}×`;

            // Set TTS pitch
            pitchSlider.value = settings.ttsPitch;
            pitchValue.textContent = parseFloat(pitchSlider.value).toFixed(1);
        } catch (error) {
            console.error("Error loading settings:", error);
            showError("Failed to load settings. Please try again.");
        }
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Speed slider
        speedSlider.addEventListener("input", () => {
            const rate = parseFloat(speedSlider.value);
            speedValue.textContent = `${rate.toFixed(1)}×`;
        });

        // Pitch slider
        pitchSlider.addEventListener("input", () => {
            const pitch = parseFloat(pitchSlider.value);
            pitchValue.textContent = pitch.toFixed(1);
        });

        // Save button
        saveButton.addEventListener("click", saveSettings);

        // Reset button
        resetButton.addEventListener("click", resetSettings);
    }

    /**
     * Save settings to storage
     */
    async function saveSettings() {
        try {
            // Save settings
            await settingsManager.save({
                summaryType: summaryTypeSelect.value,
                summaryLength: summaryLengthSelect.value,
                ttsVoice: voiceSelect.value,
                ttsRate: parseFloat(speedSlider.value),
                ttsPitch: parseFloat(pitchSlider.value),
            });

            // Show saved message
            showSuccess("Settings saved successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            showError("Failed to save settings. Please try again.");
        }
    }

    /**
     * Reset settings to defaults
     */
    async function resetSettings() {
        try {
            // Reset settings
            await settingsManager.reset();

            // Reload settings
            await loadSettings();

            // Show success message
            showSuccess("Settings reset to defaults!");
        } catch (error) {
            console.error("Error resetting settings:", error);
            showError("Failed to reset settings. Please try again.");
        }
    }

    /**
     * Show success message
     * @param {string} message - Success message
     */
    function showSuccess(message) {
        // Save original text
        const originalText = saveButton.textContent;

        // Show success message
        saveButton.textContent = message;
        saveButton.classList.add("success");

        // Reset after 2 seconds
        setTimeout(() => {
            saveButton.textContent = originalText;
            saveButton.classList.remove("success");
        }, 2000);
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    function showError(message) {
        // Create error element
        const errorElement = document.createElement("div");
        errorElement.className = "error-message";
        errorElement.textContent = message;

        // Add to page
        document.querySelector(".popup-container").appendChild(errorElement);

        // Remove after 3 seconds
        setTimeout(() => {
            errorElement.remove();
        }, 3000);
    }

    /**
     * Check if we're on a YouTube video page
     */
    function checkYouTubeVideo() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            const isYouTubeVideo = currentTab.url && currentTab.url.match(/^https:\/\/www\.youtube\.com\/watch\?v=.+/);

            if (isYouTubeVideo) {
                // Show message that we're on a YouTube video
                const popupContainer = document.querySelector('.popup-container');
                const statusMessage = uiService.createElement('div', {
                    className: 'status-message'
                }, [
                    uiService.createElement('div', { className: 'status-icon' }, '✓'),
                    uiService.createElement('div', { className: 'status-text' }, [
                        uiService.createElement('strong', {}, 'Active on this page'),
                        uiService.createElement('p', {}, 'TubeSumTalk is running on this YouTube video.')
                    ])
                ]);

                // Insert at the top
                popupContainer.insertBefore(statusMessage, popupContainer.firstChild);
            }
        });
    }

    // Check if we're on a YouTube video page
    checkYouTubeVideo();
}

// Initialize the popup when the DOM is loaded
document.addEventListener("DOMContentLoaded", initPopup);
