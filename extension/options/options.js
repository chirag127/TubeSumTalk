/**
 * TubeSumTalk Options Page
 * Allows users to configure their API key and default settings
 */

// DOM elements
const apiKeyInput = document.getElementById('apiKey');
const showApiKeyButton = document.getElementById('showApiKey');
const summaryTypeSelect = document.getElementById('summaryType');
const summaryLengthSelect = document.getElementById('summaryLength');
const ttsVoiceSelect = document.getElementById('ttsVoice');
const ttsRateInput = document.getElementById('ttsRate');
const ttsRateValue = document.getElementById('ttsRateValue');
const ttsPitchInput = document.getElementById('ttsPitch');
const ttsPitchValue = document.getElementById('ttsPitchValue');
const saveButton = document.getElementById('saveButton');
const statusElement = document.getElementById('status');

// Load settings from storage
function loadSettings() {
    chrome.storage.sync.get(
        ['apiKey', 'summaryType', 'summaryLength', 'ttsVoice', 'ttsRate', 'ttsPitch'],
        (result) => {
            // Set API key
            if (result.apiKey) {
                apiKeyInput.value = result.apiKey;
            }
            
            // Set summary type
            if (result.summaryType) {
                summaryTypeSelect.value = result.summaryType;
            }
            
            // Set summary length
            if (result.summaryLength) {
                summaryLengthSelect.value = result.summaryLength;
            }
            
            // Set TTS rate
            if (result.ttsRate) {
                ttsRateInput.value = result.ttsRate;
                ttsRateValue.textContent = `${result.ttsRate}x`;
            }
            
            // Set TTS pitch
            if (result.ttsPitch) {
                ttsPitchInput.value = result.ttsPitch;
                ttsPitchValue.textContent = result.ttsPitch;
            }
            
            // Populate voice select and set selected voice
            populateVoiceSelect(result.ttsVoice);
        }
    );
}

// Populate voice select dropdown
function populateVoiceSelect(selectedVoice = 'default') {
    // Clear existing options except default
    while (ttsVoiceSelect.options.length > 1) {
        ttsVoiceSelect.remove(1);
    }
    
    // Get available voices
    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length > 0) {
        addVoiceOptions(voices, selectedVoice);
    } else {
        // If voices aren't loaded yet, wait for them
        window.speechSynthesis.onvoiceschanged = () => {
            const voices = window.speechSynthesis.getVoices();
            addVoiceOptions(voices, selectedVoice);
        };
    }
}

// Add voice options to select
function addVoiceOptions(voices, selectedVoice) {
    voices.forEach((voice) => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})`;
        ttsVoiceSelect.appendChild(option);
    });
    
    // Set selected voice if available
    if (selectedVoice && selectedVoice !== 'default') {
        // Find the voice in the list
        const voiceOption = Array.from(ttsVoiceSelect.options).find(
            option => option.value === selectedVoice
        );
        
        if (voiceOption) {
            ttsVoiceSelect.value = selectedVoice;
        }
    }
}

// Save settings to storage
function saveSettings() {
    const settings = {
        apiKey: apiKeyInput.value.trim(),
        summaryType: summaryTypeSelect.value,
        summaryLength: summaryLengthSelect.value,
        ttsVoice: ttsVoiceSelect.value,
        ttsRate: parseFloat(ttsRateInput.value),
        ttsPitch: parseFloat(ttsPitchInput.value)
    };
    
    chrome.storage.sync.set(settings, () => {
        // Show success message
        statusElement.textContent = 'Settings saved!';
        statusElement.className = 'status success';
        
        // Clear status after 3 seconds
        setTimeout(() => {
            statusElement.textContent = '';
            statusElement.className = 'status';
        }, 3000);
    });
}

// Toggle API key visibility
function toggleApiKeyVisibility() {
    if (apiKeyInput.type === 'password') {
        apiKeyInput.type = 'text';
        showApiKeyButton.textContent = '🔒';
    } else {
        apiKeyInput.type = 'password';
        showApiKeyButton.textContent = '👁️';
    }
}

// Update rate value display
function updateRateValue() {
    ttsRateValue.textContent = `${ttsRateInput.value}x`;
}

// Update pitch value display
function updatePitchValue() {
    ttsPitchValue.textContent = ttsPitchInput.value;
}

// Event listeners
document.addEventListener('DOMContentLoaded', loadSettings);
saveButton.addEventListener('click', saveSettings);
showApiKeyButton.addEventListener('click', toggleApiKeyVisibility);
ttsRateInput.addEventListener('input', updateRateValue);
ttsPitchInput.addEventListener('input', updatePitchValue);
