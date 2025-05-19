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
        this.processingTimers = {
            summary: null,
            qa: null,
        };
        this.processingStartTime = {
            summary: 0,
            qa: 0,
        };
        this.cancelRequested = false;
        this.isProcessingQuestion = false;
        this.lastQuestion = ""; // Store the last question asked
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
            <div class="tubesumtalk-button-group">
              <button id="tubesumtalk-qa-reload" class="tubesumtalk-icon-button" title="Reload Q&A for current video">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
                </svg>
              </button>
              <button id="tubesumtalk-qa-refresh" class="tubesumtalk-icon-button" title="Refresh answer for current question">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
                </svg>
              </button>
              <button id="tubesumtalk-ask" class="tubesumtalk-button">Ask</button>
            </div>
          </div>

          <div class="tubesumtalk-qa-container">
            <div id="tubesumtalk-answer" class="tubesumtalk-answer">
              <p class="tubesumtalk-placeholder">Ask a question about the video content to get an AI-generated answer based on the transcript.</p>
            </div>
          </div>

          <div class="tubesumtalk-suggested-questions">
            <div class="tubesumtalk-suggested-header">
              <h4>Suggested Questions</h4>
              <button id="tubesumtalk-refresh-suggestions" class="tubesumtalk-icon-button" title="Refresh suggested questions">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <div id="tubesumtalk-suggested-list" class="tubesumtalk-suggested-list">
              <p class="tubesumtalk-placeholder">Click "Refresh" to generate suggested questions based on the video content.</p>
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

        // Q&A refresh button
        const qaRefreshButton = this.widgetElement.querySelector(
            "#tubesumtalk-qa-refresh"
        );
        if (qaRefreshButton) {
            qaRefreshButton.addEventListener("click", () => {
                this.refreshAnswer();
            });
        }

        // Q&A reload button
        const qaReloadButton = this.widgetElement.querySelector(
            "#tubesumtalk-qa-reload"
        );
        if (qaReloadButton) {
            qaReloadButton.addEventListener("click", () => {
                this.reloadQA();
            });
        }

        // Refresh suggested questions button
        const refreshSuggestionsButton = this.widgetElement.querySelector(
            "#tubesumtalk-refresh-suggestions"
        );
        if (refreshSuggestionsButton) {
            refreshSuggestionsButton.addEventListener("click", () => {
                this.loadSuggestedQuestions();
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

        // Get the play/pause button for Q&A
        const qaPlayPauseButton = this.widgetElement.querySelector(
            "#tubesumtalk-qa-play-pause"
        );

        // Check if TTS is already playing
        const isSpeaking = window.speechSynthesis.speaking;

        // If speaking, stop it first
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            if (qaPlayPauseButton) {
                qaPlayPauseButton.textContent = "▶";
                qaPlayPauseButton.setAttribute("aria-label", "Play");
            }
            return;
        }

        // Get the original markdown content if available
        const originalMarkdown = answerElement.getAttribute(
            "data-original-markdown"
        );

        // Create a temporary container for the answer content
        const tempContainer = document.createElement("div");
        tempContainer.id = "tubesumtalk-summary"; // This ID is required for the TTS function

        // Use the original HTML content from the answer element
        tempContainer.innerHTML = answerElement.innerHTML;

        // Position the temporary container off-screen but keep it in the DOM
        tempContainer.style.position = "absolute";
        tempContainer.style.left = "-9999px";
        tempContainer.style.top = "-9999px";
        tempContainer.style.opacity = "0";
        tempContainer.style.pointerEvents = "none";
        document.body.appendChild(tempContainer);

        // Store a reference to the temporary container in the window object
        // so it can be accessed and removed when TTS is done
        window.tubesumtalkQATempContainer = tempContainer;

        console.log("Starting TTS for Q&A content");

        // Call the global TTS function with the Q&A specific options
        togglePlayPause(null, {
            ...this.ttsSettings,
            scrollContainer: scrollContainer,
            qaMode: true,
            qaElement: answerElement,
            originalContent: originalMarkdown || answerElement.innerHTML,
        });

        // Update the play button state
        if (qaPlayPauseButton) {
            qaPlayPauseButton.textContent = "⏸";
            qaPlayPauseButton.setAttribute("aria-label", "Pause");
        }
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

        // Reset cancel flag
        this.cancelRequested = false;

        // Show loading state with timer
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
                // Check if the request was cancelled
                if (this.cancelRequested) {
                    console.log("Summary generation was cancelled by user");
                    return;
                }

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

        // Show loading state with timer
        this.showLoading();

        // Reset cancel flag
        this.cancelRequested = false;

        // Clear any cached transcript data to force a fresh fetch
        window.currentTranscript = null;

        // Force refresh of YouTube's player response data to get fresh transcript
        window.ytInitialPlayerResponse = null;

        // If we have a global function to process the current video, use it
        // Pass true to force refresh even if video ID hasn't changed
        if (window.TubeSumTalk && window.TubeSumTalk.processCurrentVideo) {
            window.TubeSumTalk.processCurrentVideo(true);
        } else {
            // Fallback to just regenerating the summary
            this.generateSummary();
        }
    }

    // Ask a question about the video
    askQuestion(question) {
        if (this.isProcessingQuestion || this.cancelRequested) {
            return;
        }

        // Store the question for potential refresh later
        this.lastQuestion = question;

        this.isProcessingQuestion = true;
        this.cancelRequested = false;

        // Get transcript length for estimation
        const transcriptLength = window.currentTranscript
            ? window.currentTranscript.length
            : 0;

        // Show loading state with timer
        this.showQALoading(transcriptLength);

        // Use the global askQuestion function
        window.TubeSumTalk.askQuestion(question)
            .then((answer) => {
                // Clear the processing timer
                this.clearProcessingTimer("qa");

                const answerElement = this.widgetElement.querySelector(
                    "#tubesumtalk-answer"
                );

                if (answerElement && !this.cancelRequested) {
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
                // Only show error if not cancelled by user
                if (!this.cancelRequested) {
                    this.showError(error.message, "qa");
                }
            })
            .finally(() => {
                this.isProcessingQuestion = false;
            });
    }

    // Refresh the current answer
    refreshAnswer() {
        console.log("Refreshing answer for last question");

        if (!this.lastQuestion) {
            console.log("No previous question to refresh");
            this.showError(
                "Please ask a question first before refreshing.",
                "qa"
            );
            return;
        }

        if (this.isProcessingQuestion || this.cancelRequested) {
            console.log("Already processing a question, cannot refresh now");
            this.showError(
                "Already processing a question. Please wait a moment and try again.",
                "qa"
            );
            return;
        }

        // Show the question in the input field
        const questionInput = this.widgetElement.querySelector(
            "#tubesumtalk-question"
        );
        if (questionInput) {
            questionInput.value = this.lastQuestion;
        }

        // Re-ask the same question
        this.askQuestion(this.lastQuestion);
    }

    // Reload the Q&A functionality
    reloadQA() {
        console.log("Reloading Q&A for current video");

        // Clear any previous answers
        const answerElement = this.widgetElement.querySelector(
            "#tubesumtalk-answer"
        );
        if (answerElement) {
            answerElement.innerHTML = `
            <p class="tubesumtalk-placeholder">Ask a question about the video content to get an AI-generated answer based on the transcript.</p>
            `;
        }

        // Clear the question input
        const questionInput = this.widgetElement.querySelector(
            "#tubesumtalk-question"
        );
        if (questionInput) {
            questionInput.value = "";
        }

        // Reset state
        this.lastQuestion = "";
        this.isProcessingQuestion = false;
        this.cancelRequested = false;

        // Clear the suggested questions
        const suggestedList = this.widgetElement.querySelector(
            "#tubesumtalk-suggested-list"
        );
        if (suggestedList) {
            suggestedList.innerHTML = `
            <p class="tubesumtalk-placeholder">Click "Refresh" to generate suggested questions based on the video content.</p>
            `;
        }

        // Force refresh the transcript data
        if (window.TubeSumTalk && window.TubeSumTalk.processCurrentVideo) {
            window.TubeSumTalk.processCurrentVideo(true);
        }

        // Show a success message
        this.showMessage(
            "Q&A reloaded successfully. Transcript data refreshed.",
            "qa"
        );
    }

    // Load suggested questions
    loadSuggestedQuestions() {
        console.log("Loading suggested questions");

        // Show loading state with timer
        const suggestedList = this.widgetElement.querySelector(
            "#tubesumtalk-suggested-list"
        );
        if (suggestedList) {
            suggestedList.innerHTML = `
            <div class="tubesumtalk-loading">
              <div class="tubesumtalk-spinner-container">
                <div class="tubesumtalk-spinner tubesumtalk-pulse"></div>
                <div class="tubesumtalk-timer tubesumtalk-timer-suggested" role="timer" aria-label="Processing time: 0 seconds">0s</div>
              </div>
              <div class="tubesumtalk-loading-text">
                <div class="tubesumtalk-loading-message tubesumtalk-message-suggested">Generating suggested questions...</div>
                <div class="tubesumtalk-loading-estimate tubesumtalk-estimate-suggested">This may take a few moments</div>
              </div>
              <button class="tubesumtalk-cancel-button tubesumtalk-cancel-suggested" aria-label="Cancel suggested questions generation">
                <span>Cancel</span>
              </button>
            </div>
            `;

            // Add event listener to the cancel button
            const cancelButton = suggestedList.querySelector(
                ".tubesumtalk-cancel-suggested"
            );
            if (cancelButton) {
                cancelButton.addEventListener("click", () => {
                    this.cancelSuggestedQuestions();
                });
            }

            // Start the timer
            this.startProcessingTimer("suggested");
        }

        // Check if we have a transcript
        if (!window.currentTranscript) {
            this.showError(
                "No transcript available. Cannot generate suggested questions.",
                "suggested"
            );
            return;
        }

        // Use the global getSuggestedQuestions function
        if (window.TubeSumTalk && window.TubeSumTalk.getSuggestedQuestions) {
            window.TubeSumTalk.getSuggestedQuestions()
                .then((questions) => {
                    console.log("Suggested questions received:", questions);
                    this.displaySuggestedQuestions(questions);
                })
                .catch((error) => {
                    console.error("Error getting suggested questions:", error);
                    this.showError(error.message, "suggested");
                });
        } else {
            this.showError(
                "Suggested questions functionality not available.",
                "suggested"
            );
        }
    }

    // Display suggested questions
    displaySuggestedQuestions(questions) {
        const suggestedList = this.widgetElement.querySelector(
            "#tubesumtalk-suggested-list"
        );
        if (!suggestedList) return;

        if (!questions || questions.length === 0) {
            suggestedList.innerHTML = `
            <p class="tubesumtalk-placeholder">No suggested questions available. Try refreshing.</p>
            `;
            return;
        }

        // Create HTML for suggested questions
        let html = "";
        questions.forEach((question, index) => {
            html += `
            <div class="tubesumtalk-suggested-question" data-question="${this.escapeHtml(
                question
            )}">
                ${this.escapeHtml(question)}
            </div>
            `;
        });

        // Update the suggested list
        suggestedList.innerHTML = html;

        // Add click event listeners to the suggested questions
        const questionElements = suggestedList.querySelectorAll(
            ".tubesumtalk-suggested-question"
        );
        questionElements.forEach((element) => {
            element.addEventListener("click", () => {
                const question = element.getAttribute("data-question");
                if (question) {
                    // Set the question in the input field
                    const questionInput = this.widgetElement.querySelector(
                        "#tubesumtalk-question"
                    );
                    if (questionInput) {
                        questionInput.value = question;

                        // Automatically process the question (similar to clicking the "Ask" button)
                        console.log(
                            "Auto-processing suggested question:",
                            question
                        );
                        this.askQuestion(question);
                    }
                }
            });
        });
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
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

        // Load suggested questions automatically when a new video is loaded
        // We'll do this with a slight delay to ensure the transcript is loaded
        setTimeout(() => {
            if (window.currentTranscript) {
                this.loadSuggestedQuestions();
            }
        }, 2000);
    }

    // Set summary
    setSummary(summary) {
        // Store both the original markdown and the parsed HTML
        this.summary = summary;
        this.originalMarkdown = summary;

        // Clear the processing timer
        this.clearProcessingTimer("summary");

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
    showError(message, type = "summary") {
        // Clear the processing timer
        this.clearProcessingTimer(type);

        if (type === "summary") {
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
        } else if (type === "qa") {
            const answerElement = this.widgetElement.querySelector(
                "#tubesumtalk-answer"
            );
            if (answerElement) {
                answerElement.innerHTML = `
                <div class="tubesumtalk-error">
                    <div class="tubesumtalk-error-icon">⚠️</div>
                    <div>${message}</div>
                </div>`;
            }

            // Reset the processing flag
            this.isProcessingQuestion = false;
        } else if (type === "suggested") {
            const suggestedList = this.widgetElement.querySelector(
                "#tubesumtalk-suggested-list"
            );
            if (suggestedList) {
                suggestedList.innerHTML = `
                <div class="tubesumtalk-error">
                    <div class="tubesumtalk-error-icon">⚠️</div>
                    <div>${message}</div>
                </div>`;
            }
        }
    }

    // Show success message
    showMessage(message, type = "summary") {
        if (type === "summary") {
            const summaryElement = this.widgetElement.querySelector(
                "#tubesumtalk-summary"
            );
            if (summaryElement) {
                summaryElement.innerHTML = `
                <div class="tubesumtalk-success-message">
                    <div class="tubesumtalk-success-icon">✓</div>
                    <div>${message}</div>
                </div>`;
            }
        } else if (type === "qa") {
            const answerElement = this.widgetElement.querySelector(
                "#tubesumtalk-answer"
            );
            if (answerElement) {
                answerElement.innerHTML = `
                <div class="tubesumtalk-success-message">
                    <div class="tubesumtalk-success-icon">✓</div>
                    <div>${message}</div>
                </div>`;
            }
        } else if (type === "suggested") {
            const suggestedList = this.widgetElement.querySelector(
                "#tubesumtalk-suggested-list"
            );
            if (suggestedList) {
                suggestedList.innerHTML = `
                <div class="tubesumtalk-success-message">
                    <div class="tubesumtalk-success-icon">✓</div>
                    <div>${message}</div>
                </div>`;
            }
        }
    }

    // Start a processing timer
    startProcessingTimer(type, transcriptLength = 0) {
        // Clear any existing timer
        this.clearProcessingTimer(type);

        // Set the start time
        this.processingStartTime[type] = Date.now();
        this.cancelRequested = false;

        // Calculate estimated completion time (1 second per 1000 characters)
        const estimatedSeconds =
            type === "qa" ? Math.max(5, Math.ceil(transcriptLength / 1000)) : 0;

        // Create timer element
        const timerElement = document.querySelector(
            `.tubesumtalk-timer-${type}`
        );
        if (timerElement) {
            timerElement.textContent = "0s";
            timerElement.setAttribute(
                "aria-label",
                `Processing time: 0 seconds`
            );
        }

        // Update estimate element
        const estimateElement = document.querySelector(
            `.tubesumtalk-estimate-${type}`
        );
        if (estimateElement && type === "qa" && estimatedSeconds > 0) {
            estimateElement.textContent = `Estimated time: ~${estimatedSeconds} seconds`;
            estimateElement.setAttribute(
                "aria-label",
                `Estimated completion time: approximately ${estimatedSeconds} seconds`
            );
        }

        // Start the timer interval
        this.processingTimers[type] = setInterval(() => {
            const elapsedSeconds = Math.floor(
                (Date.now() - this.processingStartTime[type]) / 1000
            );

            // Update the timer display
            const timerElement = document.querySelector(
                `.tubesumtalk-timer-${type}`
            );
            if (timerElement) {
                timerElement.textContent = `${elapsedSeconds}s`;
                timerElement.setAttribute(
                    "aria-label",
                    `Processing time: ${elapsedSeconds} seconds`
                );
            }

            // Show warning if taking too long (over 60 seconds)
            if (elapsedSeconds > 60) {
                const messageElement = document.querySelector(
                    `.tubesumtalk-message-${type}`
                );
                if (messageElement) {
                    if (type === "summary") {
                        messageElement.textContent =
                            "Still generating summary... (taking longer than usual)";
                    } else if (type === "qa") {
                        messageElement.textContent =
                            "Still processing your question... (taking longer than usual)";
                    } else if (type === "suggested") {
                        messageElement.textContent =
                            "Still generating suggested questions... (taking longer than usual)";
                    }
                }
            }
        }, 1000);
    }

    // Clear a processing timer
    clearProcessingTimer(type) {
        if (this.processingTimers[type]) {
            clearInterval(this.processingTimers[type]);
            this.processingTimers[type] = null;
        }
    }

    // Handle cancel request
    handleCancelRequest(type) {
        this.cancelRequested = true;

        // Update the UI to show cancellation is in progress
        const messageElement = document.querySelector(
            `.tubesumtalk-message-${type}`
        );
        if (messageElement) {
            messageElement.textContent = "Cancelling request...";
        }

        // Hide the cancel button
        const cancelButton = document.querySelector(
            `.tubesumtalk-cancel-${type}`
        );
        if (cancelButton) {
            cancelButton.style.display = "none";
        }

        // For summary, we'll try to abort by refreshing the widget
        if (type === "summary") {
            // Clear the timer
            this.clearProcessingTimer(type);

            // Show a message
            const summaryElement = this.widgetElement.querySelector(
                "#tubesumtalk-summary"
            );
            if (summaryElement) {
                summaryElement.innerHTML = `
                <div class="tubesumtalk-placeholder">
                    <p>Request cancelled. Click "Generate Summary" to try again.</p>
                </div>
                `;
            }
        }

        // For Q&A, we'll update the answer area
        if (type === "qa") {
            // Clear the timer
            this.clearProcessingTimer(type);

            // Show a message
            const answerElement = this.widgetElement.querySelector(
                "#tubesumtalk-answer"
            );
            if (answerElement) {
                answerElement.innerHTML = `
                <div class="tubesumtalk-placeholder">
                    <p>Request cancelled. Please try asking another question.</p>
                </div>
                `;
            }

            // Reset the processing flag
            this.isProcessingQuestion = false;
        }

        // For suggested questions, we'll update the suggested questions area
        if (type === "suggested") {
            // Clear the timer
            this.clearProcessingTimer(type);

            // Show a message
            const suggestedList = this.widgetElement.querySelector(
                "#tubesumtalk-suggested-list"
            );
            if (suggestedList) {
                suggestedList.innerHTML = `
                <div class="tubesumtalk-placeholder">
                    <p>Request cancelled. Click "Refresh" to try again.</p>
                </div>
                `;
            }
        }
    }

    // Cancel suggested questions generation
    cancelSuggestedQuestions() {
        console.log("Cancelling suggested questions generation");
        this.handleCancelRequest("suggested");
    }

    // Show loading with timer for summary
    showLoading() {
        const summaryElement = this.widgetElement.querySelector(
            "#tubesumtalk-summary"
        );
        if (summaryElement) {
            summaryElement.innerHTML = `
        <div class="tubesumtalk-loading">
          <div class="tubesumtalk-spinner-container">
            <div class="tubesumtalk-spinner tubesumtalk-pulse"></div>
            <div class="tubesumtalk-timer tubesumtalk-timer-summary" role="timer" aria-label="Processing time: 0 seconds">0s</div>
          </div>
          <div class="tubesumtalk-loading-text">
            <div class="tubesumtalk-loading-message tubesumtalk-message-summary">Generating summary...</div>
            <div class="tubesumtalk-loading-estimate tubesumtalk-estimate-summary">This may take a few moments</div>
          </div>
          <button class="tubesumtalk-cancel-button tubesumtalk-cancel-summary" aria-label="Cancel summary generation">
            <span>Cancel</span>
          </button>
        </div>
      `;

            // Start the timer
            this.startProcessingTimer("summary");

            // Add event listener to the cancel button
            const cancelButton = summaryElement.querySelector(
                ".tubesumtalk-cancel-summary"
            );
            if (cancelButton) {
                cancelButton.addEventListener("click", () =>
                    this.handleCancelRequest("summary")
                );
            }
        }
    }

    // Show loading with timer for Q&A
    showQALoading(transcriptLength) {
        const answerElement = this.widgetElement.querySelector(
            "#tubesumtalk-answer"
        );
        if (answerElement) {
            answerElement.innerHTML = `
        <div class="tubesumtalk-loading">
          <div class="tubesumtalk-spinner-container">
            <div class="tubesumtalk-spinner tubesumtalk-pulse"></div>
            <div class="tubesumtalk-timer tubesumtalk-timer-qa" role="timer" aria-label="Processing time: 0 seconds">0s</div>
          </div>
          <div class="tubesumtalk-loading-text">
            <div class="tubesumtalk-loading-message tubesumtalk-message-qa">Processing your question...</div>
            <div class="tubesumtalk-loading-estimate tubesumtalk-estimate-qa">Estimating completion time...</div>
          </div>
          <button class="tubesumtalk-cancel-button tubesumtalk-cancel-qa" aria-label="Cancel question processing">
            <span>Cancel</span>
          </button>
        </div>
      `;

            // Start the timer with transcript length for estimation
            this.startProcessingTimer("qa", transcriptLength);

            // Add event listener to the cancel button
            const cancelButton = answerElement.querySelector(
                ".tubesumtalk-cancel-qa"
            );
            if (cancelButton) {
                cancelButton.addEventListener("click", () =>
                    this.handleCancelRequest("qa")
                );
            }
        }
    }
}
