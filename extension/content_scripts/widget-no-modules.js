/**
 * TubeSumTalk Widget (Non-Modular Version)
 * Handles the widget UI and functionality in the related videos section
 */

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
        this.widgetElement = document.createElement("div");
        this.widgetElement.id = "tubesumtalk-widget";
        this.widgetElement.className = "tubesumtalk-widget";

        // Add widget HTML
        this.widgetElement.innerHTML = this.getWidgetHTML();

        // Insert widget at the top of the secondary section
        const inserted = this.insertIntoSecondaryColumn(this.widgetElement);
        
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
                this.saveTtsSettings({ ttsRate: rate });
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
                this.saveTtsSettings({ ttsVoice: voiceSelect.value });
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
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
            // Pause TTS
            window.speechSynthesis.pause();
            
            // Update button
            if (playPauseButton) {
                playPauseButton.innerHTML = "▶";
                playPauseButton.setAttribute("aria-label", "Play");
                playPauseButton.title = "Play";
            }
        } else if (window.speechSynthesis.paused) {
            // Resume TTS
            window.speechSynthesis.resume();
            
            // Update button
            if (playPauseButton) {
                playPauseButton.innerHTML = "⏸";
                playPauseButton.setAttribute("aria-label", "Pause");
                playPauseButton.title = "Pause";
            }
        } else {
            // Get the text to speak
            const text = summaryElement.textContent || this.summary;
            
            // Create utterance
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set voice
            if (this.ttsSettings.voice !== 'default') {
                const voices = window.speechSynthesis.getVoices();
                const voice = voices.find(v => v.name === this.ttsSettings.voice);
                if (voice) {
                    utterance.voice = voice;
                }
            }
            
            // Set rate and pitch
            utterance.rate = this.ttsSettings.rate;
            utterance.pitch = this.ttsSettings.pitch;
            
            // Start speaking
            window.speechSynthesis.speak(utterance);
            
            // Update button
            if (playPauseButton) {
                playPauseButton.innerHTML = "⏸";
                playPauseButton.setAttribute("aria-label", "Pause");
                playPauseButton.title = "Pause";
            }
            
            // Set up end event
            utterance.onend = () => {
                // Update button
                if (playPauseButton) {
                    playPauseButton.innerHTML = "▶";
                    playPauseButton.setAttribute("aria-label", "Play");
                    playPauseButton.title = "Play";
                }
            };
        }
    }

    // Show settings popup
    showSettingsPopup() {
        // Create modal container
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'tubesumtalk-settings-popup';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'tubesumtalk-settings-content';
        
        // Add title
        const title = document.createElement('h3');
        title.textContent = 'TTS Settings';
        modalContent.appendChild(title);
        
        // Add voice setting
        const voiceSetting = document.createElement('div');
        voiceSetting.className = 'tubesumtalk-setting';
        
        const voiceLabel = document.createElement('label');
        voiceLabel.setAttribute('for', 'tubesumtalk-settings-voice');
        voiceLabel.textContent = 'Voice:';
        
        const voiceSelect = document.createElement('select');
        voiceSelect.id = 'tubesumtalk-settings-voice';
        voiceSelect.className = 'tubesumtalk-voice-select';
        
        const defaultOption = document.createElement('option');
        defaultOption.value = 'default';
        defaultOption.textContent = 'Default Voice';
        voiceSelect.appendChild(defaultOption);
        
        voiceSetting.appendChild(voiceLabel);
        voiceSetting.appendChild(voiceSelect);
        modalContent.appendChild(voiceSetting);
        
        // Add speed setting
        const speedSetting = document.createElement('div');
        speedSetting.className = 'tubesumtalk-setting';
        
        const speedLabel = document.createElement('label');
        speedLabel.setAttribute('for', 'tubesumtalk-settings-speed');
        speedLabel.textContent = 'Speed (0.5x - 16x):';
        
        const speedContainer = document.createElement('div');
        speedContainer.className = 'range-container';
        
        const speedSlider = document.createElement('input');
        speedSlider.type = 'range';
        speedSlider.id = 'tubesumtalk-settings-speed';
        speedSlider.className = 'tubesumtalk-speed-slider';
        speedSlider.min = '0.5';
        speedSlider.max = '16';
        speedSlider.step = '0.5';
        speedSlider.value = this.ttsSettings.rate;
        
        const speedValue = document.createElement('span');
        speedValue.id = 'tubesumtalk-settings-speed-value';
        speedValue.textContent = `${this.ttsSettings.rate.toFixed(1)}×`;
        
        speedContainer.appendChild(speedSlider);
        speedContainer.appendChild(speedValue);
        speedSetting.appendChild(speedLabel);
        speedSetting.appendChild(speedContainer);
        modalContent.appendChild(speedSetting);
        
        // Add pitch setting
        const pitchSetting = document.createElement('div');
        pitchSetting.className = 'tubesumtalk-setting';
        
        const pitchLabel = document.createElement('label');
        pitchLabel.setAttribute('for', 'tubesumtalk-settings-pitch');
        pitchLabel.textContent = 'Pitch:';
        
        const pitchContainer = document.createElement('div');
        pitchContainer.className = 'range-container';
        
        const pitchSlider = document.createElement('input');
        pitchSlider.type = 'range';
        pitchSlider.id = 'tubesumtalk-settings-pitch';
        pitchSlider.className = 'tubesumtalk-speed-slider';
        pitchSlider.min = '0.5';
        pitchSlider.max = '2';
        pitchSlider.step = '0.1';
        pitchSlider.value = this.ttsSettings.pitch;
        
        const pitchValue = document.createElement('span');
        pitchValue.id = 'tubesumtalk-settings-pitch-value';
        pitchValue.textContent = this.ttsSettings.pitch.toFixed(1);
        
        pitchContainer.appendChild(pitchSlider);
        pitchContainer.appendChild(pitchValue);
        pitchSetting.appendChild(pitchLabel);
        pitchSetting.appendChild(pitchContainer);
        modalContent.appendChild(pitchSetting);
        
        // Add buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'tubesumtalk-setting-buttons';
        
        const saveButton = document.createElement('button');
        saveButton.className = 'tubesumtalk-save';
        saveButton.textContent = 'Save';
        
        const cancelButton = document.createElement('button');
        cancelButton.className = 'tubesumtalk-cancel';
        cancelButton.textContent = 'Cancel';
        
        buttonContainer.appendChild(saveButton);
        buttonContainer.appendChild(cancelButton);
        modalContent.appendChild(buttonContainer);
        
        // Add modal content to overlay
        modalOverlay.appendChild(modalContent);
        
        // Add overlay to body
        document.body.appendChild(modalOverlay);
        
        // Populate voice options
        this.populateVoiceSelect(voiceSelect);
        
        // Set current values
        voiceSelect.value = this.ttsSettings.voice;
        
        // Add event listeners
        speedSlider.addEventListener('input', () => {
            const rate = parseFloat(speedSlider.value);
            speedValue.textContent = `${rate.toFixed(1)}×`;
        });
        
        pitchSlider.addEventListener('input', () => {
            const pitch = parseFloat(pitchSlider.value);
            pitchValue.textContent = pitch.toFixed(1);
        });
        
        saveButton.addEventListener('click', () => {
            // Update settings
            this.ttsSettings.voice = voiceSelect.value;
            this.ttsSettings.rate = parseFloat(speedSlider.value);
            this.ttsSettings.pitch = parseFloat(pitchSlider.value);
            
            // Update UI
            const mainVoiceSelect = this.widgetElement.querySelector('#tubesumtalk-voice-select');
            const mainSpeedSlider = this.widgetElement.querySelector('#tubesumtalk-speed-slider');
            const mainSpeedValue = this.widgetElement.querySelector('#tubesumtalk-speed-value');
            
            if (mainVoiceSelect) mainVoiceSelect.value = this.ttsSettings.voice;
            if (mainSpeedSlider) mainSpeedSlider.value = this.ttsSettings.rate;
            if (mainSpeedValue) mainSpeedValue.textContent = `${this.ttsSettings.rate.toFixed(1)}×`;
            
            // Save settings
            this.saveTtsSettings({
                ttsVoice: this.ttsSettings.voice,
                ttsRate: this.ttsSettings.rate,
                ttsPitch: this.ttsSettings.pitch
            });
            
            // Close modal
            modalOverlay.remove();
        });
        
        cancelButton.addEventListener('click', () => {
            // Close modal
            modalOverlay.remove();
        });
    }

    // Populate voice select dropdown
    populateVoiceSelect(selectElement) {
        // Get available voices
        const voices = window.speechSynthesis.getVoices();
        
        // If voices aren't loaded yet, wait for them
        if (voices.length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                this.populateVoiceSelect(selectElement);
            };
            return;
        }
        
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
        return new Promise((resolve) => {
            chrome.storage.sync.get(['ttsVoice', 'ttsRate', 'ttsPitch'], (settings) => {
                // Update settings with defaults if needed
                this.ttsSettings.voice = settings.ttsVoice || 'default';
                this.ttsSettings.rate = settings.ttsRate || 1.0;
                this.ttsSettings.pitch = settings.ttsPitch || 1.0;
                
                // Update UI
                const speedSlider = this.widgetElement.querySelector("#tubesumtalk-speed-slider");
                const speedValue = this.widgetElement.querySelector("#tubesumtalk-speed-value");
                
                if (speedSlider) speedSlider.value = this.ttsSettings.rate;
                if (speedValue) speedValue.textContent = `${this.ttsSettings.rate.toFixed(1)}×`;
                
                resolve(settings);
            });
        });
    }

    // Save TTS settings
    saveTtsSettings(settings) {
        chrome.storage.sync.set(settings);
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
            // Parse markdown to HTML
            const html = this.parseMarkdown(summary);
            
            // Set the HTML content
            summaryElement.innerHTML = html;
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

    // Parse markdown text to HTML
    parseMarkdown(markdown) {
        if (!markdown) return '';
        
        // Replace headers
        let html = markdown
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Replace bold and italic
        html = html
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>');
        
        // Replace lists
        html = html
            .replace(/^\s*\n\* (.*)/gim, '<ul>\n<li>$1</li>')
            .replace(/^\* (.*)/gim, '<li>$1</li>')
            .replace(/<\/li>\s*\n\* (.*)/gim, '</li>\n<li>$1</li>')
            .replace(/<\/li>\s*\n<\/ul>\s*\n\* (.*)/gim, '</li>\n</ul>\n<ul>\n<li>$1</li>')
            .replace(/<\/li>\s*\n<\/ul>/gim, '</li>\n</ul>');
        
        // Replace numbered lists
        html = html
            .replace(/^\s*\n\d+\. (.*)/gim, '<ol>\n<li>$1</li>')
            .replace(/^\d+\. (.*)/gim, '<li>$1</li>')
            .replace(/<\/li>\s*\n\d+\. (.*)/gim, '</li>\n<li>$1</li>')
            .replace(/<\/li>\s*\n<\/ol>\s*\n\d+\. (.*)/gim, '</li>\n</ol>\n<ol>\n<li>$1</li>')
            .replace(/<\/li>\s*\n<\/ol>/gim, '</li>\n</ol>');
        
        // Replace links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>');
        
        // Replace paragraphs
        html = html.replace(/^\s*(\n)?(.+)/gim, function(m) {
            return /\<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>' + m + '</p>';
        });
        
        // Replace line breaks
        html = html.replace(/\n/gim, '<br>');
        
        return html;
    }

    // Insert element at the top of YouTube's secondary column (related videos section)
    insertIntoSecondaryColumn(element) {
        const secondaryColumn = document.querySelector('#secondary') || document.querySelector('#secondary-inner');
        
        if (!secondaryColumn) {
            console.error('Could not find secondary column to inject element');
            return false;
        }
        
        secondaryColumn.insertBefore(element, secondaryColumn.firstChild);
        return true;
    }
}
