/**
 * TubeSumTalk Widget
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

        // Find the secondary column (related videos section)
        const secondarySection =
            document.querySelector("#secondary") ||
            document.querySelector("#secondary-inner");

        if (!secondarySection) {
            console.error("Could not find secondary section to inject widget");
            return null;
        }

        // Insert widget at the top of the secondary section
        secondarySection.insertBefore(
            this.widgetElement,
            secondarySection.firstChild
        );

        // Set up event listeners
        this.setupEventListeners();

        // Load TTS settings
        await this.loadTTSSettings();

        // Populate voice select
        const voiceSelect = this.widgetElement.querySelector(
            "#tubesumtalk-voice-select"
        );
        if (voiceSelect) {
            await populateVoiceSelect(voiceSelect);
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
                chrome.storage.sync.set({ ttsRate: rate });
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
                chrome.storage.sync.set({ ttsVoice: voiceSelect.value });
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

        // Use the original markdown text stored in the data attribute
        const summaryElement = this.widgetElement.querySelector(
            "#tubesumtalk-summary"
        );
        if (summaryElement) {
            // Get the scrollable container
            const scrollContainer = this.widgetElement.querySelector(
                ".tubesumtalk-summary-container"
            );

            // Pass null as the first parameter since the TTS utility will get the text from the container
            // Pass the scrollable container as an option
            togglePlayPause(null, {
                ...this.ttsSettings,
                scrollContainer: scrollContainer,
            });
        } else {
            // Fallback to using the stored summary
            togglePlayPause(this.summary, this.ttsSettings);
        }
    }

    // Show settings popup
    showSettingsPopup() {
        // Create popup
        const popup = document.createElement("div");
        popup.className = "tubesumtalk-settings-popup";

        // Add popup HTML
        popup.innerHTML = `
      <div class="tubesumtalk-settings-content">
        <h3>TTS Settings</h3>

        <div class="tubesumtalk-setting">
          <label for="tubesumtalk-settings-voice">Voice:</label>
          <select id="tubesumtalk-settings-voice" class="tubesumtalk-voice-select">
            <option value="default">Default Voice</option>
          </select>
        </div>

        <div class="tubesumtalk-setting">
          <label for="tubesumtalk-settings-speed">Speed (0.5x - 16x):</label>
          <input type="range" id="tubesumtalk-settings-speed" class="tubesumtalk-speed-slider"
                min="0.5" max="16" step="0.5" value="${this.ttsSettings.rate}">
          <span id="tubesumtalk-settings-speed-value">${this.ttsSettings.rate.toFixed(
              1
          )}×</span>
        </div>

        <div class="tubesumtalk-setting">
          <label for="tubesumtalk-settings-pitch">Pitch:</label>
          <input type="range" id="tubesumtalk-settings-pitch" class="tubesumtalk-speed-slider"
                min="0.5" max="2" step="0.1" value="${this.ttsSettings.pitch}">
          <span id="tubesumtalk-settings-pitch-value">${this.ttsSettings.pitch.toFixed(
              1
          )}</span>
        </div>

        <div class="tubesumtalk-setting-buttons">
          <button id="tubesumtalk-settings-save" class="tubesumtalk-save">Save</button>
          <button id="tubesumtalk-settings-cancel" class="tubesumtalk-cancel">Cancel</button>
        </div>
      </div>
    `;

        // Add to page
        document.body.appendChild(popup);

        // Populate voice options
        const voiceSelect = popup.querySelector("#tubesumtalk-settings-voice");
        populateVoiceSelect(voiceSelect);

        // Set current values
        voiceSelect.value = this.ttsSettings.voice;

        // Add event listeners
        const speedSlider = popup.querySelector("#tubesumtalk-settings-speed");
        const speedValue = popup.querySelector(
            "#tubesumtalk-settings-speed-value"
        );
        speedSlider.addEventListener("input", () => {
            const rate = parseFloat(speedSlider.value);
            speedValue.textContent = `${rate.toFixed(1)}×`;
        });

        const pitchSlider = popup.querySelector("#tubesumtalk-settings-pitch");
        const pitchValue = popup.querySelector(
            "#tubesumtalk-settings-pitch-value"
        );
        pitchSlider.addEventListener("input", () => {
            const pitch = parseFloat(pitchSlider.value);
            pitchValue.textContent = pitch.toFixed(1);
        });

        // Save button
        const saveButton = popup.querySelector("#tubesumtalk-settings-save");
        saveButton.addEventListener("click", () => {
            // Update settings
            this.ttsSettings.voice = voiceSelect.value;
            this.ttsSettings.rate = parseFloat(speedSlider.value);
            this.ttsSettings.pitch = parseFloat(pitchSlider.value);

            // Update UI
            const mainVoiceSelect = this.widgetElement.querySelector(
                "#tubesumtalk-voice-select"
            );
            const mainSpeedSlider = this.widgetElement.querySelector(
                "#tubesumtalk-speed-slider"
            );
            const mainSpeedValue = this.widgetElement.querySelector(
                "#tubesumtalk-speed-value"
            );

            if (mainVoiceSelect) mainVoiceSelect.value = this.ttsSettings.voice;
            if (mainSpeedSlider) mainSpeedSlider.value = this.ttsSettings.rate;
            if (mainSpeedValue)
                mainSpeedValue.textContent = `${this.ttsSettings.rate.toFixed(
                    1
                )}×`;

            // Save settings
            chrome.storage.sync.set({
                ttsVoice: this.ttsSettings.voice,
                ttsRate: this.ttsSettings.rate,
                ttsPitch: this.ttsSettings.pitch,
            });

            // Close popup
            popup.remove();
        });

        // Cancel button
        const cancelButton = popup.querySelector(
            "#tubesumtalk-settings-cancel"
        );
        cancelButton.addEventListener("click", () => {
            popup.remove();
        });
    }

    // Load TTS settings
    async loadTTSSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(
                ["ttsVoice", "ttsRate", "ttsPitch"],
                (result) => {
                    if (result.ttsVoice)
                        this.ttsSettings.voice = result.ttsVoice;
                    if (result.ttsRate) this.ttsSettings.rate = result.ttsRate;
                    if (result.ttsPitch)
                        this.ttsSettings.pitch = result.ttsPitch;

                    // Update UI
                    const speedSlider = this.widgetElement.querySelector(
                        "#tubesumtalk-speed-slider"
                    );
                    const speedValue = this.widgetElement.querySelector(
                        "#tubesumtalk-speed-value"
                    );

                    if (speedSlider) speedSlider.value = this.ttsSettings.rate;
                    if (speedValue)
                        speedValue.textContent = `${this.ttsSettings.rate.toFixed(
                            1
                        )}×`;

                    resolve();
                }
            );
        });
    }

    // Set video details
    setVideoDetails(details) {
        this.videoDetails = details;
    }

    // Set summary
    setSummary(summary) {
        // Store both the original markdown and the parsed HTML
        this.summary = summary;
        this.originalMarkdown = summary;

        const summaryElement = this.widgetElement.querySelector(
            "#tubesumtalk-summary"
        );
        if (summaryElement) {
            // Parse markdown to HTML
            const htmlContent = this.parseMarkdown(summary);
            summaryElement.innerHTML = htmlContent;

            // Store the original markdown as a data attribute for easy access
            summaryElement.setAttribute("data-original-markdown", summary);
        }
    }

    // Parse markdown to HTML
    parseMarkdown(markdown) {
        if (!markdown) return "";

        // Replace bullet points
        let html = markdown.replace(/^\s*[-*+]\s+(.+)$/gm, "<li>$1</li>");

        // Wrap lists in <ul> tags
        html = html.replace(/<li>(.+?)<\/li>\n*(?=<li>|$)/gs, "<li>$1</li>");
        if (html.includes("<li>")) {
            html = "<ul>" + html + "</ul>";
        }

        // Replace headers
        html = html.replace(/^\s*#{1,6}\s+(.+)$/gm, (match, p1) => {
            const level = match.trim().indexOf(" ");
            return `<h${level}>${p1}</h${level}>`;
        });

        // Replace bold text
        html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

        // Replace italic text
        html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

        // Replace links
        html = html.replace(
            /\[(.+?)\]\((.+?)\)/g,
            '<a href="$2" target="_blank">$1</a>'
        );

        // Replace paragraphs
        html = html.replace(/^(?!<[uo]l>|<li>|<h\d>)(.+)$/gm, "<p>$1</p>");

        return html;
    }

    // Show error
    showError(message) {
        const summaryElement = this.widgetElement.querySelector(
            "#tubesumtalk-summary"
        );
        if (summaryElement) {
            summaryElement.innerHTML = `
            <div class="tubesumtalk-error">
                <div class="tubesumtalk-error-icon">⚠️</div>
                <div>${message}</div>
            </div>`;
        }
    }

    // Show loading
    showLoading() {
        const summaryElement = this.widgetElement.querySelector(
            "#tubesumtalk-summary"
        );
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
