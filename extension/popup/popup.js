/**
 * TubeSumTalk Popup Script
 */

document.addEventListener("DOMContentLoaded", () => {
    // Get elements
    const summaryTypeSelect = document.getElementById("summary-type");
    const summaryLengthSelect = document.getElementById("summary-length");
    const voiceSelect = document.getElementById("tts-voice");
    const speedSlider = document.getElementById("tts-speed");
    const speedValue = document.getElementById("tts-speed-value");
    const pitchSlider = document.getElementById("tts-pitch");
    const pitchValue = document.getElementById("tts-pitch-value");
    const saveButton = document.getElementById("save-settings");

    // Populate voice options
    populateVoices();

    // Get current settings
    chrome.runtime.sendMessage({ action: "getSettings" }, (response) => {
        // Set summary type
        if (response.summaryType) {
            summaryTypeSelect.value = response.summaryType;
        }

        // Set summary length
        if (response.summaryLength) {
            summaryLengthSelect.value = response.summaryLength;
        }

        // Set TTS voice
        if (response.ttsVoice !== "default") {
            voiceSelect.value = response.ttsVoice;
        }

        // Set TTS speed
        speedSlider.value = response.ttsRate || 1.0;
        speedValue.textContent = `${parseFloat(speedSlider.value).toFixed(1)}×`;

        // Set TTS pitch
        pitchSlider.value = response.ttsPitch || 1.0;
        pitchValue.textContent = parseFloat(pitchSlider.value).toFixed(1);
    });

    // Add event listeners
    speedSlider.addEventListener("input", () => {
        const rate = parseFloat(speedSlider.value);
        speedValue.textContent = `${rate.toFixed(1)}×`;
    });

    pitchSlider.addEventListener("input", () => {
        const pitch = parseFloat(pitchSlider.value);
        pitchValue.textContent = pitch.toFixed(1);
    });

    saveButton.addEventListener("click", () => {
        // Save settings
        chrome.runtime.sendMessage(
            {
                action: "saveSettings",
                summaryType: summaryTypeSelect.value,
                summaryLength: summaryLengthSelect.value,
                ttsVoice: voiceSelect.value,
                ttsRate: parseFloat(speedSlider.value),
                ttsPitch: parseFloat(pitchSlider.value),
            },
            () => {
                // Show saved message
                saveButton.textContent = "Saved!";
                setTimeout(() => {
                    saveButton.textContent = "Save Settings";
                }, 2000);
            }
        );
    });

    // Function to populate voice options
    function populateVoices() {
        // Get available voices
        const voices = window.speechSynthesis.getVoices();

        if (voices.length === 0) {
            // If voices aren't loaded yet, wait for them
            window.speechSynthesis.onvoiceschanged = populateVoices;
            return;
        }

        // Clear existing options
        voiceSelect.innerHTML =
            '<option value="default">Default Voice</option>';

        // Add voices to select
        voices.forEach((voice) => {
            const option = document.createElement("option");
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
    }
});
