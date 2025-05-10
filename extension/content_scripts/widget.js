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
        this.isProcessingQuestion = false;
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
        <div class="tubesumtalk-tabs">
          <button id="tubesumtalk-summary-tab" class="tubesumtalk-tab tubesumtalk-tab-active">Summary</button>
          <button id="tubesumtalk-qa-tab" class="tubesumtalk-tab">Q&A</button>
          <button id="tubesumtalk-settings-tab" class="tubesumtalk-tab">Settings</button>
        </div>

        <div id="tubesumtalk-summary-panel" class="tubesumtalk-panel tubesumtalk-panel-active">
          <div id="tubesumtalk-video-title" class="tubesumtalk-video-title"></div>

          <div class="tubesumtalk-summary-options">
            <div class="tubesumtalk-select-group">
              <label for="tubesumtalk-summary-type">Type:</label>
              <select id="tubesumtalk-summary-type">
                <option value="bullet">Bullet Points</option>
                <option value="brief">Brief</option>
                <option value="detailed">Detailed</option>
                <option value="key-points">Key Points</option>
                <option value="chapter">Chapter Markers</option>
              </select>
            </div>
            <div class="tubesumtalk-select-group">
              <label for="tubesumtalk-summary-length">Length:</label>
              <select id="tubesumtalk-summary-length">
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
            <div class="tubesumtalk-button-group">
              <button id="tubesumtalk-refresh" class="tubesumtalk-icon-button" title="Refresh for current video">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
                </svg>
              </button>
              <button id="tubesumtalk-generate" class="tubesumtalk-button">Generate</button>
            </div>
          </div>

          <div class="tubesumtalk-summary-container">
            <div id="tubesumtalk-summary" class="tubesumtalk-summary">
              <div class="tubesumtalk-loading">
                <div class="tubesumtalk-spinner"></div>
                <div>Loading summary...</div>
              </div>
            </div>
          </div>

          <div class="tubesumtalk-tts-controls">
            <button id="tubesumtalk-play-pause" class="tubesumtalk-play-pause" aria-label="Play">▶</button>

            <select id="tubesumtalk-voice-select" class="tubesumtalk-voice-select" aria-label="Select voice">
              <option value="default">Default Voice</option>
            </select>

            <div class="tubesumtalk-speed-container">
              <input type="range" id="tubesumtalk-speed-slider" class="tubesumtalk-speed-slider"
                    min="0.5" max="16" step="0.1" value="1" aria-label="Speech rate">
              <span id="tubesumtalk-speed-value" class="tubesumtalk-speed-value">1.0×</span>
            </div>
          </div>
        </div>

        <div id="tubesumtalk-qa-panel" class="tubesumtalk-panel">
          <div class="tubesumtalk-qa-form">
            <textarea id="tubesumtalk-question" placeholder="Ask a question about this video..."></textarea>
            <button id="tubesumtalk-ask" class="tubesumtalk-button">Ask</button>
          </div>

          <div class="tubesumtalk-qa-container">
            <div id="tubesumtalk-answer" class="tubesumtalk-answer">
              <p class="tubesumtalk-placeholder">Ask a question about the video content to get an AI-generated answer based on the transcript.</p>
            </div>
          </div>

          <div class="tubesumtalk-tts-controls">
            <button id="tubesumtalk-qa-play-pause" class="tubesumtalk-play-pause" aria-label="Play">▶</button>
          </div>
        </div>

        <div id="tubesumtalk-settings-panel" class="tubesumtalk-panel">
          <div class="tubesumtalk-settings-group">
            <label for="tubesumtalk-api-key">Gemini API Key:</label>
            <div class="tubesumtalk-api-key-input">
              <input type="password" id="tubesumtalk-api-key" placeholder="Enter your Gemini API key">
              <button id="tubesumtalk-show-api-key" class="tubesumtalk-icon-button" title="Show/Hide API Key">👁️</button>
            </div>
            <p class="tubesumtalk-help-text">Get a key from <a href="https://ai.google.dev/" target="_blank">Google AI Studio</a></p>
          </div>

          <div class="tubesumtalk-setting">
            <label for="tubesumtalk-pitch-slider">Pitch:</label>
            <div class="tubesumtalk-range-group">
              <input type="range" id="tubesumtalk-pitch-slider" class="tubesumtalk-slider"
                    min="0" max="2" step="0.1" value="${
                        this.ttsSettings.pitch
                    }">
              <span id="tubesumtalk-pitch-value">${this.ttsSettings.pitch.toFixed(
                  1
              )}</span>
            </div>
          </div>

          <div class="tubesumtalk-settings-actions">
            <button id="tubesumtalk-save-settings" class="tubesumtalk-button">Save Settings</button>
            <span id="tubesumtalk-settings-status" class="tubesumtalk-settings-status"></span>
          </div>
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

        // Tab switching
        const tabs = this.widgetElement.querySelectorAll(".tubesumtalk-tab");
        tabs.forEach((tab) => {
            tab.addEventListener("click", (event) => {
                // Remove active class from all tabs and panels
                tabs.forEach((t) =>
                    t.classList.remove("tubesumtalk-tab-active")
                );
                const panels =
                    this.widgetElement.querySelectorAll(".tubesumtalk-panel");
                panels.forEach((p) =>
                    p.classList.remove("tubesumtalk-panel-active")
                );

                // Add active class to clicked tab
                event.target.classList.add("tubesumtalk-tab-active");

                // Get panel ID from tab ID
                const panelId = event.target.id.replace("-tab", "-panel");
                const panel = this.widgetElement.querySelector(`#${panelId}`);
                if (panel) {
                    panel.classList.add("tubesumtalk-panel-active");
                }
            });
        });

        // Generate summary button
        const generateButton = this.widgetElement.querySelector(
            "#tubesumtalk-generate"
        );
        if (generateButton) {
            generateButton.addEventListener("click", () =>
                this.generateSummary()
            );
        }

        // Refresh button for current video
        const refreshButton = this.widgetElement.querySelector(
            "#tubesumtalk-refresh"
        );
        if (refreshButton) {
            refreshButton.addEventListener("click", () =>
                this.refreshSummary()
            );
        }

        // Summary type and length selects
        const summaryTypeSelect = this.widgetElement.querySelector(
            "#tubesumtalk-summary-type"
        );
        const summaryLengthSelect = this.widgetElement.querySelector(
            "#tubesumtalk-summary-length"
        );

        if (summaryTypeSelect && summaryLengthSelect) {
            // Load saved settings
            chrome.storage.sync.get(
                ["summaryType", "summaryLength"],
                (result) => {
                    if (result.summaryType) {
                        summaryTypeSelect.value = result.summaryType;
                    }
                    if (result.summaryLength) {
                        summaryLengthSelect.value = result.summaryLength;
                    }
                }
            );

            // Save settings when changed
            summaryTypeSelect.addEventListener("change", () => {
                chrome.storage.sync.set({
                    summaryType: summaryTypeSelect.value,
                });
            });

            summaryLengthSelect.addEventListener("change", () => {
                chrome.storage.sync.set({
                    summaryLength: summaryLengthSelect.value,
                });
            });
        }

        // Play/pause TTS for summary
        const playPauseButton = this.widgetElement.querySelector(
            "#tubesumtalk-play-pause"
        );
        if (playPauseButton) {
            playPauseButton.addEventListener("click", () =>
                this.togglePlayPause()
            );
        }

        // Play/pause TTS for Q&A
        const qaPlayPauseButton = this.widgetElement.querySelector(
            "#tubesumtalk-qa-play-pause"
        );
        if (qaPlayPauseButton) {
            qaPlayPauseButton.addEventListener("click", () =>
                this.toggleQAPlayPause()
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

        // Pitch slider
        const pitchSlider = this.widgetElement.querySelector(
            "#tubesumtalk-pitch-slider"
        );
        const pitchValue = this.widgetElement.querySelector(
            "#tubesumtalk-pitch-value"
        );
        if (pitchSlider && pitchValue) {
            pitchSlider.addEventListener("input", () => {
                const pitch = parseFloat(pitchSlider.value);
                pitchValue.textContent = pitch.toFixed(1);
                this.ttsSettings.pitch = pitch;

                // Save setting
                chrome.storage.sync.set({ ttsPitch: pitch });
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

        // Ask question button
        const askButton = this.widgetElement.querySelector("#tubesumtalk-ask");
        const questionInput = this.widgetElement.querySelector(
            "#tubesumtalk-question"
        );

        if (askButton && questionInput) {
            askButton.addEventListener("click", () => {
                const question = questionInput.value.trim();
                if (question) {
                    this.askQuestion(question);
                }
            });

            // Also submit on Enter key (but allow Shift+Enter for new lines)
            questionInput.addEventListener("keydown", (event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    const question = questionInput.value.trim();
                    if (question) {
                        this.askQuestion(question);
                    }
                }
            });
        }

        // API key input and show/hide button
        const apiKeyInput = this.widgetElement.querySelector(
            "#tubesumtalk-api-key"
        );
        const showApiKeyButton = this.widgetElement.querySelector(
            "#tubesumtalk-show-api-key"
        );

        if (apiKeyInput && showApiKeyButton) {
            // Load saved API key
            chrome.storage.sync.get(["apiKey"], (result) => {
                if (result.apiKey) {
                    apiKeyInput.value = result.apiKey;
                }
            });

            // Toggle API key visibility
            showApiKeyButton.addEventListener("click", () => {
                if (apiKeyInput.type === "password") {
                    apiKeyInput.type = "text";
                    showApiKeyButton.textContent = "🔒";
                } else {
                    apiKeyInput.type = "password";
                    showApiKeyButton.textContent = "👁️";
                }
            });
        }

        // Save settings button
        const saveSettingsButton = this.widgetElement.querySelector(
            "#tubesumtalk-save-settings"
        );
        const settingsStatus = this.widgetElement.querySelector(
            "#tubesumtalk-settings-status"
        );

        if (saveSettingsButton && apiKeyInput && settingsStatus) {
            saveSettingsButton.addEventListener("click", () => {
                const apiKey = apiKeyInput.value.trim();

                chrome.storage.sync.set({ apiKey }, () => {
                    settingsStatus.textContent = "Settings saved!";
                    settingsStatus.className =
                        "tubesumtalk-settings-status tubesumtalk-success";

                    setTimeout(() => {
                        settingsStatus.textContent = "";
                        settingsStatus.className =
                            "tubesumtalk-settings-status";
                    }, 3000);
                });
            });
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

    // Toggle play/pause TTS for summary
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

    // Toggle play/pause TTS for Q&A
    toggleQAPlayPause() {
        const answerElement = this.widgetElement.querySelector(
            "#tubesumtalk-answer"
        );

        if (
            !answerElement ||
            answerElement.querySelector(".tubesumtalk-placeholder")
        ) {
            return;
        }

        // Get the scrollable container
        const scrollContainer = this.widgetElement.querySelector(
            ".tubesumtalk-qa-container"
        );

        // Temporarily set the ID to tubesumtalk-summary for TTS function to work
        const originalId = answerElement.id;
        answerElement.id = "tubesumtalk-summary";

        // Call the global TTS function
        togglePlayPause(null, {
            ...this.ttsSettings,
            scrollContainer: scrollContainer,
        });

        // Restore the original ID
        answerElement.id = originalId;
    }

    // Generate a new summary
    generateSummary() {
        console.log(
            "Generating new summary for video:",
            this.videoDetails?.videoId
        );

        if (!this.videoDetails || !window.currentTranscript) {
            const errorMsg = "No video or transcript available.";
            console.error(errorMsg);
            this.showError(errorMsg);
            return;
        }

        // Show loading state
        this.showLoading();

        // Get summary settings
        const summaryTypeSelect = this.widgetElement.querySelector(
            "#tubesumtalk-summary-type"
        );
        const summaryLengthSelect = this.widgetElement.querySelector(
            "#tubesumtalk-summary-length"
        );

        const summaryType = summaryTypeSelect
            ? summaryTypeSelect.value
            : "bullet";
        const summaryLength = summaryLengthSelect
            ? summaryLengthSelect.value
            : "medium";

        console.log("Requesting summary with settings:", {
            videoId: this.videoDetails.videoId,
            title: this.videoDetails.title,
            summaryType,
            summaryLength,
            transcriptLength: window.currentTranscript.length,
        });

        // Make sure the summary tab is active
        this.activateSummaryTab();

        // Send message to background script to get summary
        chrome.runtime.sendMessage(
            {
                action: "summarize",
                videoId: this.videoDetails.videoId,
                transcript: window.currentTranscript,
                title: this.videoDetails.title,
                summaryType: summaryType,
                summaryLength: summaryLength,
            },
            (response) => {
                if (response && response.success) {
                    console.log("Summary received successfully");
                    // Display summary
                    this.setSummary(response.summary);
                } else {
                    // Display error
                    const errorMsg =
                        response?.error ||
                        "Failed to generate summary. Please try again.";
                    console.error("Summary error:", errorMsg);
                    this.showError(errorMsg);
                }
            }
        );
    }

    // Refresh the current video summary
    refreshSummary() {
        console.log("Refreshing summary for current video");

        // If we have a global function to process the current video, use it
        if (window.TubeSumTalk && window.TubeSumTalk.processCurrentVideo) {
            window.TubeSumTalk.processCurrentVideo();
        } else {
            // Fallback to just regenerating the summary
            this.generateSummary();
        }
    }

    // Ask a question about the video
    askQuestion(question) {
        if (this.isProcessingQuestion) {
            return;
        }

        this.isProcessingQuestion = true;

        // Show loading state
        const answerElement = this.widgetElement.querySelector(
            "#tubesumtalk-answer"
        );
        if (answerElement) {
            answerElement.innerHTML = `
        <div class="tubesumtalk-loading">
          <div class="tubesumtalk-spinner"></div>
          <div>Generating answer...</div>
        </div>
      `;
        }

        // Use the global askQuestion function
        window.TubeSumTalk.askQuestion(question)
            .then((answer) => {
                if (answerElement) {
                    // Parse markdown to HTML
                    const htmlContent = this.parseMarkdown(answer);
                    answerElement.innerHTML = htmlContent;

                    // Store the original markdown as a data attribute for easy access
                    answerElement.setAttribute(
                        "data-original-markdown",
                        answer
                    );
                }
            })
            .catch((error) => {
                if (answerElement) {
                    answerElement.innerHTML = `
            <div class="tubesumtalk-error">
              <div class="tubesumtalk-error-icon">⚠️</div>
              <div>${error.message}</div>
            </div>
          `;
                }
            })
            .finally(() => {
                this.isProcessingQuestion = false;
            });
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

        // Update the video title in the widget
        const titleElement = this.widgetElement.querySelector(
            "#tubesumtalk-video-title"
        );
        if (titleElement && details.title) {
            titleElement.textContent = details.title;
            console.log("Updated widget title to:", details.title);
        }
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

            console.log("Summary updated in widget");

            // Make sure the summary tab is active
            this.activateSummaryTab();
        }
    }

    // Activate the summary tab
    activateSummaryTab() {
        // Get all tabs and panels
        const tabs = this.widgetElement.querySelectorAll(".tubesumtalk-tab");
        const panels =
            this.widgetElement.querySelectorAll(".tubesumtalk-panel");

        // Remove active class from all tabs and panels
        tabs.forEach((tab) => tab.classList.remove("tubesumtalk-tab-active"));
        panels.forEach((panel) =>
            panel.classList.remove("tubesumtalk-panel-active")
        );

        // Add active class to summary tab and panel
        const summaryTab = this.widgetElement.querySelector(
            "#tubesumtalk-summary-tab"
        );
        const summaryPanel = this.widgetElement.querySelector(
            "#tubesumtalk-summary-panel"
        );

        if (summaryTab) {
            summaryTab.classList.add("tubesumtalk-tab-active");
        }

        if (summaryPanel) {
            summaryPanel.classList.add("tubesumtalk-panel-active");
        }
    }

    // Parse markdown to HTML
    parseMarkdown(markdown) {
        if (!markdown) return "";

        // Simple markdown parser
        let html = markdown
            // Headers
            .replace(/^### (.*$)/gim, "<h3>$1</h3>")
            .replace(/^## (.*$)/gim, "<h2>$1</h2>")
            .replace(/^# (.*$)/gim, "<h1>$1</h1>")
            // Bold
            .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
            .replace(/__(.*?)__/gim, "<strong>$1</strong>")
            // Italic
            .replace(/\*(.*?)\*/gim, "<em>$1</em>")
            .replace(/_(.*?)_/gim, "<em>$1</em>")
            // Links
            .replace(
                /\[(.*?)\]\((.*?)\)/gim,
                '<a href="$2" target="_blank">$1</a>'
            )
            // Unordered lists
            .replace(/^\* (.*$)/gim, "<li>$1</li>")
            .replace(/^- (.*$)/gim, "<li>$1</li>")
            // Ordered lists
            .replace(/^\d+\. (.*$)/gim, "<li>$1</li>")
            // Code blocks
            .replace(/```([\s\S]*?)```/gim, "<pre><code>$1</code></pre>")
            // Inline code
            .replace(/`(.*?)`/gim, "<code>$1</code>");

        // Process lists
        const listItemRegex = /<li>.*?<\/li>/g;
        const listItems = html.match(listItemRegex);

        if (listItems) {
            // Group consecutive list items
            let inList = false;
            let processedHtml = html;

            // Replace consecutive list items with proper list structure
            processedHtml = processedHtml.replace(
                /<li>(.*?)<\/li>/g,
                (match, content) => {
                    if (!inList) {
                        inList = true;
                        return `<ul><li>${content}</li>`;
                    } else {
                        return `<li>${content}</li>`;
                    }
                }
            );

            // Close any open lists
            if (inList) {
                processedHtml += "</ul>";
            }

            html = processedHtml;
        }

        // Wrap non-tagged content in paragraphs
        const lines = html.split("\n");
        let result = "";

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine && !trimmedLine.startsWith("<")) {
                result += `<p>${trimmedLine}</p>\n`;
            } else {
                result += line + "\n";
            }
        }

        return result;
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
