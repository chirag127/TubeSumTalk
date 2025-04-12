/**
 * TubeSumTalk Widget (Modular Version)
 * Handles the widget UI and functionality in the related videos section
 */

// Import utility modules
import youtubeService from '../utils/youtube.js';
import uiService from '../utils/ui.js';
import ttsService from '../utils/tts.js';
import settingsManager from '../utils/settings.js';
import markdownParser from '../utils/markdown.js';

class TubeSumTalkWidget {
    constructor() {
        this.widgetElement = null;
        this.isCollapsed = false;
        this.summary = "";
        this.videoDetails = null;
        this.ttsSettings = {
            voice: "default",
            rate: 1.0,
            pitch: 1.0,
        };
    }

    // Initialize the widget
    async init() {
        // Create widget element
        this.widgetElement = uiService.createElement("div", {
            id: "tubesumtalk-widget",
            className: "tubesumtalk-widget"
        });

        // Add widget HTML
        this.widgetElement.innerHTML = this.getWidgetHTML();

        // Insert widget at the top of the secondary section
        const inserted = youtubeService.insertIntoSecondaryColumn(this.widgetElement);
        
        if (!inserted) {
            console.error("Could not find secondary section to inject widget");
            return null;
        }

        // Set up event listeners
        this.setupEventListeners();

        // Load TTS settings
        await this.loadTTSSettings();

        // Populate voice select
        const voiceSelect = this.widgetElement.querySelector(
            "#tubesumtalk-voice-select"
        );
        if (voiceSelect) {
            this.populateVoiceSelect(voiceSelect);
        }

        // Return the widget instance
        return this;
    }

    // Get widget HTML
    getWidgetHTML() {
        return `
      <div class="tubesumtalk-header">
        <h3>
          <img src="${chrome.runtime.getURL(
              "icons/icon48.png"
          )}" alt="TubeSumTalk">
          TubeSumTalk
        </h3>
        <button id="tubesumtalk-toggle" class="tubesumtalk-toggle" aria-label="Toggle widget" title="Toggle widget">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div class="tubesumtalk-content">
        <div class="tubesumtalk-summary-container">
          <div id="tubesumtalk-summary" class="tubesumtalk-summary">
            <div class="tubesumtalk-loading">
              <div class="tubesumtalk-spinner"></div>
              <div>Loading summary...</div>
            </div>
          </div>
        </div>

        <div class="tubesumtalk-controls">
          <button id="tubesumtalk-play-pause" class="tubesumtalk-play-pause" aria-label="Play">▶</button>

          <select id="tubesumtalk-voice-select" class="tubesumtalk-voice-select" aria-label="Select voice">
            <option value="default">Default Voice</option>
          </select>

          <div class="tubesumtalk-speed-container">
            <input type="range" id="tubesumtalk-speed-slider" class="tubesumtalk-speed-slider"
                  min="0.5" max="16" step="0.5" value="1" aria-label="Speech rate">
            <span id="tubesumtalk-speed-value" class="tubesumtalk-speed-value">1.0×</span>
          </div>

          <button id="tubesumtalk-settings" class="tubesumtalk-settings" aria-label="Settings">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.14 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.65 2.57 9.61 2.81L9.25 5.35C8.66 5.59 8.12 5.91 7.63 6.29L5.24 5.33C5.02 5.26 4.77 5.33 4.65 5.55L2.74 8.87C2.62 9.07 2.66 9.34 2.86 9.48L4.88 11.06C4.84 11.36 4.8 11.69 4.8 12C4.8 12.31 4.82 12.64 4.86 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 18.09 8.65 18.41 9.24 18.65L9.6 21.19C9.65 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.4 21.19L14.76 18.65C15.35 18.41 15.89 18.09 16.38 17.71L18.77 18.67C18.99 18.74 19.24 18.67 19.36 18.45L21.28 15.13C21.39 14.91 21.34 14.66 21.16 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    `;
    }

    // Set up event listeners
    setupEventListeners() {
        // Toggle widget
        const toggleButton = this.widgetElement.querySelector(
            "#tubesumtalk-toggle"
        );
        if (toggleButton) {
            toggleButton.addEventListener("click", () => this.toggleWidget());
        }

        // Play/pause TTS
        const playPauseButton = this.widgetElement.querySelector(
            "#tubesumtalk-play-pause"
        );
        if (playPauseButton) {
            playPauseButton.addEventListener("click", () =>
                this.togglePlayPause()
            );
        }

        // Speed slider
        const speedSlider = this.widgetElement.querySelector(
            "#tubesumtalk-speed-slider"
        );
        const speedValue = this.widgetElement.querySelector(
            "#tubesumtalk-speed-value"
        );
        if (speedSlider && speedValue) {
            speedSlider.addEventListener("input", () => {
                const rate = parseFloat(speedSlider.value);
                speedValue.textContent = `${rate.toFixed(1)}×`;
                this.ttsSettings.rate = rate;

                // Save setting
                settingsManager.saveTtsSettings({ ttsRate: rate });
            });
        }

        // Voice selection
        const voiceSelect = this.widgetElement.querySelector(
            "#tubesumtalk-voice-select"
        );
        if (voiceSelect) {
            voiceSelect.addEventListener("change", () => {
                this.ttsSettings.voice = voiceSelect.value;

                // Save setting
                settingsManager.saveTtsSettings({ ttsVoice: voiceSelect.value });
            });
        }

        // Settings button
        const settingsButton = this.widgetElement.querySelector(
            "#tubesumtalk-settings"
        );
        if (settingsButton) {
            settingsButton.addEventListener("click", () =>
                this.showSettingsPopup()
            );
        }
    }

    // Toggle widget visibility
    toggleWidget() {
        this.isCollapsed = !this.isCollapsed;

        if (this.isCollapsed) {
            this.widgetElement.classList.add("tubesumtalk-collapsed");
            // Change the toggle button icon to indicate expand action
            const toggleButton = this.widgetElement.querySelector(
                "#tubesumtalk-toggle"
            );
            if (toggleButton) {
                toggleButton.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" fill="currentColor"/>
                </svg>
                `;
                toggleButton.setAttribute("aria-label", "Expand widget");
                toggleButton.title = "Expand widget";
            }
        } else {
            this.widgetElement.classList.remove("tubesumtalk-collapsed");
            // Change the toggle button icon back to collapse icon
            const toggleButton = this.widgetElement.querySelector(
                "#tubesumtalk-toggle"
            );
            if (toggleButton) {
                toggleButton.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z" fill="currentColor"/>
                </svg>
                `;
                toggleButton.setAttribute("aria-label", "Collapse widget");
                toggleButton.title = "Collapse widget";
            }
        }
    }

    // Toggle play/pause TTS
    togglePlayPause() {
        if (!this.summary) {
            return;
        }

        const summaryElement = this.widgetElement.querySelector(
            "#tubesumtalk-summary"
        );
        if (!summaryElement) return;

        // Get the scrollable container
        const scrollContainer = this.widgetElement.querySelector(
            ".tubesumtalk-summary-container"
        );

        // Get the play/pause button
        const playPauseButton = this.widgetElement.querySelector(
            "#tubesumtalk-play-pause"
        );

        // Check if TTS is already playing
        if (ttsService.isPlaying) {
            // Pause TTS
            ttsService.pause();
            
            // Update button
            if (playPauseButton) {
                playPauseButton.innerHTML = "▶";
                playPauseButton.setAttribute("aria-label", "Play");
                playPauseButton.title = "Play";
            }
        } else {
            // Apply TTS settings
            ttsService.setVoice(this.ttsSettings.voice);
            ttsService.setRate(this.ttsSettings.rate);
            ttsService.setPitch(this.ttsSettings.pitch);
            
            // Set up word highlighting
            ttsService.onHighlight((wordIndex) => {
                // Clear previous highlighting
                const words = summaryElement.querySelectorAll('.tubesumtalk-word');
                words.forEach(word => word.classList.remove('tubesumtalk-highlighted'));
                
                // Highlight current word
                if (wordIndex >= 0 && wordIndex < words.length) {
                    words[wordIndex].classList.add('tubesumtalk-highlighted');
                }
            });
            
            // Set up scrolling
            if (scrollContainer) {
                ttsService.onScroll((wordIndex) => {
                    const words = summaryElement.querySelectorAll('.tubesumtalk-word');
                    if (wordIndex >= 0 && wordIndex < words.length) {
                        const word = words[wordIndex];
                        const wordTop = word.offsetTop;
                        const containerHeight = scrollContainer.clientHeight;
                        
                        // Scroll to keep the current word in view
                        scrollContainer.scrollTop = wordTop - (containerHeight / 2);
                    }
                });
            }
            
            // Set up end callback
            ttsService.onEnd(() => {
                // Update button
                if (playPauseButton) {
                    playPauseButton.innerHTML = "▶";
                    playPauseButton.setAttribute("aria-label", "Play");
                    playPauseButton.title = "Play";
                }
            });
            
            // Get the text to speak
            const text = summaryElement.getAttribute("data-plain-text") || this.summary;
            
            // Start speaking
            ttsService.speak(text);
            
            // Update button
            if (playPauseButton) {
                playPauseButton.innerHTML = "⏸";
                playPauseButton.setAttribute("aria-label", "Pause");
                playPauseButton.title = "Pause";
            }
        }
    }

    // Show settings popup
    showSettingsPopup() {
        // Create modal using UI service
        const settingsContent = uiService.createElement('div', {}, [
            uiService.createElement('h3', {}, 'TTS Settings'),
            
            // Voice setting
            uiService.createElement('div', { className: 'tubesumtalk-setting' }, [
                uiService.createElement('label', { for: 'tubesumtalk-settings-voice' }, 'Voice:'),
                uiService.createElement('select', { 
                    id: 'tubesumtalk-settings-voice', 
                    className: 'tubesumtalk-voice-select' 
                }, [
                    uiService.createElement('option', { value: 'default' }, 'Default Voice')
                ])
            ]),
            
            // Speed setting
            uiService.createElement('div', { className: 'tubesumtalk-setting' }, [
                uiService.createElement('label', { for: 'tubesumtalk-settings-speed' }, 'Speed (0.5x - 16x):'),
                uiService.createElement('div', { className: 'range-container' }, [
                    uiService.createElement('input', { 
                        type: 'range',
                        id: 'tubesumtalk-settings-speed',
                        className: 'tubesumtalk-speed-slider',
                        min: '0.5',
                        max: '16',
                        step: '0.5',
                        value: this.ttsSettings.rate
                    }),
                    uiService.createElement('span', { 
                        id: 'tubesumtalk-settings-speed-value' 
                    }, `${this.ttsSettings.rate.toFixed(1)}×`)
                ])
            ]),
            
            // Pitch setting
            uiService.createElement('div', { className: 'tubesumtalk-setting' }, [
                uiService.createElement('label', { for: 'tubesumtalk-settings-pitch' }, 'Pitch:'),
                uiService.createElement('div', { className: 'range-container' }, [
                    uiService.createElement('input', { 
                        type: 'range',
                        id: 'tubesumtalk-settings-pitch',
                        className: 'tubesumtalk-speed-slider',
                        min: '0.5',
                        max: '2',
                        step: '0.1',
                        value: this.ttsSettings.pitch
                    }),
                    uiService.createElement('span', { 
                        id: 'tubesumtalk-settings-pitch-value' 
                    }, this.ttsSettings.pitch.toFixed(1))
                ])
            ])
        ]);
        
        // Create modal
        const modal = uiService.createModal('TTS Settings', settingsContent, [
            { text: 'Save', primary: true, onClick: () => this.saveSettings(modal) },
            { text: 'Cancel', primary: false }
        ], { className: 'tubesumtalk-settings-popup' });
        
        // Populate voice options
        const voiceSelect = modal.querySelector("#tubesumtalk-settings-voice");
        this.populateVoiceSelect(voiceSelect);
        
        // Set current values
        voiceSelect.value = this.ttsSettings.voice;
        
        // Add event listeners
        const speedSlider = modal.querySelector("#tubesumtalk-settings-speed");
        const speedValue = modal.querySelector("#tubesumtalk-settings-speed-value");
        speedSlider.addEventListener("input", () => {
            const rate = parseFloat(speedSlider.value);
            speedValue.textContent = `${rate.toFixed(1)}×`;
        });
        
        const pitchSlider = modal.querySelector("#tubesumtalk-settings-pitch");
        const pitchValue = modal.querySelector("#tubesumtalk-settings-pitch-value");
        pitchSlider.addEventListener("input", () => {
            const pitch = parseFloat(pitchSlider.value);
            pitchValue.textContent = pitch.toFixed(1);
        });
    }
    
    // Save settings from modal
    saveSettings(modal) {
        const voiceSelect = modal.querySelector("#tubesumtalk-settings-voice");
        const speedSlider = modal.querySelector("#tubesumtalk-settings-speed");
        const pitchSlider = modal.querySelector("#tubesumtalk-settings-pitch");
        
        // Update settings
        this.ttsSettings.voice = voiceSelect.value;
        this.ttsSettings.rate = parseFloat(speedSlider.value);
        this.ttsSettings.pitch = parseFloat(pitchSlider.value);
        
        // Update UI
        const mainVoiceSelect = this.widgetElement.querySelector("#tubesumtalk-voice-select");
        const mainSpeedSlider = this.widgetElement.querySelector("#tubesumtalk-speed-slider");
        const mainSpeedValue = this.widgetElement.querySelector("#tubesumtalk-speed-value");
        
        if (mainVoiceSelect) mainVoiceSelect.value = this.ttsSettings.voice;
        if (mainSpeedSlider) mainSpeedSlider.value = this.ttsSettings.rate;
        if (mainSpeedValue) mainSpeedValue.textContent = `${this.ttsSettings.rate.toFixed(1)}×`;
        
        // Save settings
        settingsManager.saveTtsSettings({
            ttsVoice: this.ttsSettings.voice,
            ttsRate: this.ttsSettings.rate,
            ttsPitch: this.ttsSettings.pitch
        });
    }

    // Populate voice select dropdown
    populateVoiceSelect(selectElement) {
        // Get available voices
        const voices = ttsService.getVoices();
        
        // Clear existing options except default
        while (selectElement.options.length > 1) {
            selectElement.remove(1);
        }
        
        // Add voices to select
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            selectElement.appendChild(option);
        });
    }

    // Load TTS settings
    async loadTTSSettings() {
        try {
            // Get TTS settings
            const settings = await settingsManager.getTtsSettings();
            
            // Update settings
            this.ttsSettings.voice = settings.ttsVoice;
            this.ttsSettings.rate = settings.ttsRate;
            this.ttsSettings.pitch = settings.ttsPitch;
            
            // Update UI
            const speedSlider = this.widgetElement.querySelector("#tubesumtalk-speed-slider");
            const speedValue = this.widgetElement.querySelector("#tubesumtalk-speed-value");
            
            if (speedSlider) speedSlider.value = this.ttsSettings.rate;
            if (speedValue) speedValue.textContent = `${this.ttsSettings.rate.toFixed(1)}×`;
            
            return settings;
        } catch (error) {
            console.error('Error loading TTS settings:', error);
            return this.ttsSettings;
        }
    }

    // Set video details
    setVideoDetails(details) {
        this.videoDetails = details;
    }

    // Set summary
    setSummary(summary) {
        // Store the original markdown
        this.summary = summary;
        
        const summaryElement = this.widgetElement.querySelector("#tubesumtalk-summary");
        if (summaryElement) {
            // Parse markdown to HTML with word highlighting
            const parsedContent = markdownParser.parseWithHighlighting(summary);
            
            // Set the HTML content
            summaryElement.innerHTML = parsedContent.html;
            
            // Store the original markdown and plain text as data attributes
            summaryElement.setAttribute("data-original-markdown", summary);
            summaryElement.setAttribute("data-plain-text", parsedContent.plainText);
        }
    }

    // Show error
    showError(message) {
        const summaryElement = this.widgetElement.querySelector("#tubesumtalk-summary");
        if (summaryElement) {
            summaryElement.innerHTML = `<div class="tubesumtalk-error">${message}</div>`;
        }
    }

    // Show loading
    showLoading() {
        const summaryElement = this.widgetElement.querySelector("#tubesumtalk-summary");
        if (summaryElement) {
            summaryElement.innerHTML = `
        <div class="tubesumtalk-loading">
          <div class="tubesumtalk-spinner"></div>
          <div>Loading summary...</div>
        </div>
      `;
        }
    }
}

// Export the widget class
export default TubeSumTalkWidget;
