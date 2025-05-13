/**
 * TubeSumTalk Sidebar
 * Handles the sidebar UI and functionality
 */

class TubeSumTalkSidebar {
    constructor() {
        this.sidebarElement = null;
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

    // Initialize the sidebar
    async init() {
        // Create sidebar element
        this.sidebarElement = document.createElement("div");
        this.sidebarElement.id = "tubesumtalk-sidebar";
        this.sidebarElement.className = "tubesumtalk-sidebar";

        // Add sidebar HTML
        this.sidebarElement.innerHTML = this.getSidebarHTML();

        // Inject sidebar into page
        document.body.appendChild(this.sidebarElement);

        // Set up event listeners
        this.setupEventListeners();

        // Load TTS settings
        await this.loadTTSSettings();

        // Populate voice select
        const voiceSelect = this.sidebarElement.querySelector(
            "#tubesumtalk-voice-select"
        );
        if (voiceSelect) {
            await populateVoiceSelect(voiceSelect);
        }

        // Return the sidebar instance
        return this;
    }

    // Get sidebar HTML
    getSidebarHTML() {
        return `
      <div class="tubesumtalk-header">
        <h3>
          <img src="${chrome.runtime.getURL(
              "icons/icon48.png"
          )}" alt="TubeSumTalk">
          TubeSumTalk
        </h3>
        <button id="tubesumtalk-toggle" class="tubesumtalk-toggle" aria-label="Toggle sidebar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
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
            <button id="tubesumtalk-generate" class="tubesumtalk-button">Generate</button>
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
            <label for="tubesumtalk-settings-pitch">Pitch:</label>
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

      <div id="tubesumtalk-resize-handle" class="tubesumtalk-resize-handle"></div>
    `;
    }

    // Set up event listeners
    setupEventListeners() {
        // Toggle sidebar
        const toggleButton = this.sidebarElement.querySelector(
            "#tubesumtalk-toggle"
        );
        if (toggleButton) {
            toggleButton.addEventListener("click", () => this.toggleSidebar());
        }

        // Tab switching
        const tabs = this.sidebarElement.querySelectorAll(".tubesumtalk-tab");
        tabs.forEach((tab) => {
            tab.addEventListener("click", (event) => {
                // Remove active class from all tabs and panels
                tabs.forEach((t) =>
                    t.classList.remove("tubesumtalk-tab-active")
                );
                const panels =
                    this.sidebarElement.querySelectorAll(".tubesumtalk-panel");
                panels.forEach((p) =>
                    p.classList.remove("tubesumtalk-panel-active")
                );

                // Add active class to clicked tab
                event.target.classList.add("tubesumtalk-tab-active");

                // Get panel ID from tab ID
                const panelId = event.target.id.replace("-tab", "-panel");
                const panel = this.sidebarElement.querySelector(`#${panelId}`);
                if (panel) {
                    panel.classList.add("tubesumtalk-panel-active");
                }
            });
        });

        // Generate summary button
        const generateButton = this.sidebarElement.querySelector(
            "#tubesumtalk-generate"
        );
        if (generateButton) {
            generateButton.addEventListener("click", () =>
                this.generateSummary()
            );
        }

        // Summary type and length selects
        const summaryTypeSelect = this.sidebarElement.querySelector(
            "#tubesumtalk-summary-type"
        );
        const summaryLengthSelect = this.sidebarElement.querySelector(
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
        const playPauseButton = this.sidebarElement.querySelector(
            "#tubesumtalk-play-pause"
        );
        if (playPauseButton) {
            playPauseButton.addEventListener("click", () =>
                this.togglePlayPause()
            );
        }

        // Play/pause TTS for Q&A
        const qaPlayPauseButton = this.sidebarElement.querySelector(
            "#tubesumtalk-qa-play-pause"
        );
        if (qaPlayPauseButton) {
            qaPlayPauseButton.addEventListener("click", () =>
                this.toggleQAPlayPause()
            );
        }

        // Speed slider
        const speedSlider = this.sidebarElement.querySelector(
            "#tubesumtalk-speed-slider"
        );
        const speedValue = this.sidebarElement.querySelector(
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
        const pitchSlider = this.sidebarElement.querySelector(
            "#tubesumtalk-pitch-slider"
        );
        const pitchValue = this.sidebarElement.querySelector(
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
        const voiceSelect = this.sidebarElement.querySelector(
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
        const askButton = this.sidebarElement.querySelector("#tubesumtalk-ask");
        const questionInput = this.sidebarElement.querySelector(
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
        const apiKeyInput = this.sidebarElement.querySelector(
            "#tubesumtalk-api-key"
        );
        const showApiKeyButton = this.sidebarElement.querySelector(
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
        const saveSettingsButton = this.sidebarElement.querySelector(
            "#tubesumtalk-save-settings"
        );
        const settingsStatus = this.sidebarElement.querySelector(
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

        // Resize handle
        const resizeHandle = this.sidebarElement.querySelector(
            "#tubesumtalk-resize-handle"
        );
        if (resizeHandle) {
            this.setupResizeHandling(resizeHandle);
        }
    }

    // Toggle sidebar visibility
    toggleSidebar() {
        this.isCollapsed = !this.isCollapsed;

        if (this.isCollapsed) {
            this.sidebarElement.classList.add("tubesumtalk-collapsed");
        } else {
            this.sidebarElement.classList.remove("tubesumtalk-collapsed");
        }
    }

    // Toggle play/pause TTS for summary
    togglePlayPause() {
        if (!this.summary) {
            return;
        }

        // Use the original markdown text stored in the data attribute
        const summaryElement = this.sidebarElement.querySelector(
            "#tubesumtalk-summary"
        );
        if (summaryElement) {
            // Pass null as the first parameter since the TTS utility will get the text from the container
            togglePlayPause(null, this.ttsSettings);
        } else {
            // Fallback to using the stored summary
            togglePlayPause(this.summary, this.ttsSettings);
        }
    }

    // Toggle play/pause TTS for Q&A
    toggleQAPlayPause() {
        const answerElement = this.sidebarElement.querySelector(
            "#tubesumtalk-answer"
        );

        if (
            !answerElement ||
            answerElement.querySelector(".tubesumtalk-placeholder")
        ) {
            return;
        }

        // Get the scrollable container
        const scrollContainer = this.sidebarElement.querySelector(
            ".tubesumtalk-qa-container"
        );

        // Get the play/pause button for Q&A
        const qaPlayPauseButton = this.sidebarElement.querySelector(
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

        console.log("Starting TTS for Q&A content in sidebar");

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
        if (!this.videoDetails || !window.currentTranscript) {
            this.showError("No video or transcript available.");
            return;
        }

        // Show loading state
        this.showLoading();

        // Get summary settings
        const summaryTypeSelect = this.sidebarElement.querySelector(
            "#tubesumtalk-summary-type"
        );
        const summaryLengthSelect = this.sidebarElement.querySelector(
            "#tubesumtalk-summary-length"
        );

        const summaryType = summaryTypeSelect
            ? summaryTypeSelect.value
            : "bullet";
        const summaryLength = summaryLengthSelect
            ? summaryLengthSelect.value
            : "medium";

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
                    // Display summary
                    this.setSummary(response.summary);
                } else {
                    // Display error
                    this.showError(
                        response?.error ||
                            "Failed to generate summary. Please try again."
                    );
                }
            }
        );
    }

    // Ask a question about the video
    askQuestion(question) {
        if (this.isProcessingQuestion) {
            return;
        }

        this.isProcessingQuestion = true;

        // Show loading state
        const answerElement = this.sidebarElement.querySelector(
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

    // Set up resize handling
    setupResizeHandling(resizeHandle) {
        let startX, startWidth;

        const startResize = (e) => {
            startX = e.clientX;
            startWidth = parseInt(
                getComputedStyle(this.sidebarElement).width,
                10
            );
            document.addEventListener("mousemove", resize);
            document.addEventListener("mouseup", stopResize);
            e.preventDefault();
        };

        const resize = (e) => {
            const width = startWidth - (e.clientX - startX);
            if (width > 200 && width < 600) {
                this.sidebarElement.style.width = `${width}px`;
            }
        };

        const stopResize = () => {
            document.removeEventListener("mousemove", resize);
            document.removeEventListener("mouseup", stopResize);

            // Save width preference
            const width = parseInt(
                getComputedStyle(this.sidebarElement).width,
                10
            );
            chrome.storage.sync.set({ sidebarWidth: width });
        };

        resizeHandle.addEventListener("mousedown", startResize);
    }

    // Load TTS settings
    async loadTTSSettings() {
        return new Promise((resolve) => {
            chrome.storage.sync.get(
                ["ttsVoice", "ttsRate", "ttsPitch", "sidebarWidth"],
                (result) => {
                    if (result.ttsVoice)
                        this.ttsSettings.voice = result.ttsVoice;
                    if (result.ttsRate) this.ttsSettings.rate = result.ttsRate;
                    if (result.ttsPitch)
                        this.ttsSettings.pitch = result.ttsPitch;

                    // Update UI
                    const speedSlider = this.sidebarElement.querySelector(
                        "#tubesumtalk-speed-slider"
                    );
                    const speedValue = this.sidebarElement.querySelector(
                        "#tubesumtalk-speed-value"
                    );

                    if (speedSlider) speedSlider.value = this.ttsSettings.rate;
                    if (speedValue)
                        speedValue.textContent = `${this.ttsSettings.rate.toFixed(
                            1
                        )}×`;

                    // Set sidebar width if saved
                    if (result.sidebarWidth) {
                        this.sidebarElement.style.width = `${result.sidebarWidth}px`;
                    }

                    resolve();
                }
            );
        });
    }

    // Set video details
    setVideoDetails(details) {
        this.videoDetails = details;

        const titleElement = this.sidebarElement.querySelector(
            "#tubesumtalk-video-title"
        );
        if (titleElement && details.title) {
            titleElement.textContent = details.title;
        }
    }

    // Set summary
    setSummary(summary) {
        // Store both the original markdown and the parsed HTML
        this.summary = summary;
        this.originalMarkdown = summary;

        const summaryElement = this.sidebarElement.querySelector(
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
        const summaryElement = this.sidebarElement.querySelector(
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
        const summaryElement = this.sidebarElement.querySelector(
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
