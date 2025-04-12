// Global variables
let videoId = null;
let videoTitle = null;
let videoTranscript = null;
let summary = null;
let isSummarizing = false;
let ttsUtterance = null;
let ttsVoices = [];
let currentHighlightedWord = null;
let ttsSettings = {
  rate: 1.0,
  pitch: 1.0,
  voice: null
};

// DOM elements
const elements = {
  videoTitle: document.getElementById('video-title'),
  loadingContainer: document.getElementById('loading-container'),
  noTranscriptContainer: document.getElementById('no-transcript-container'),
  summaryContent: document.getElementById('summary-content'),
  summaryText: document.getElementById('summary-text'),
  ttsControls: document.getElementById('tts-controls'),
  playBtn: document.getElementById('play-btn'),
  pauseBtn: document.getElementById('pause-btn'),
  stopBtn: document.getElementById('stop-btn'),
  rateSlider: document.getElementById('rate-slider'),
  rateValue: document.getElementById('rate-value'),
  voiceSelect: document.getElementById('voice-select'),
  closeBtn: document.getElementById('close-btn'),
  retryBtn: document.getElementById('retry-btn'),
  settingsBtn: document.getElementById('settings-btn')
};

// Initialize the sidebar
document.addEventListener('DOMContentLoaded', init);

/**
 * Initialize the sidebar
 */
function init() {
  // Set up event listeners
  setupEventListeners();
  
  // Initialize TTS
  initTTS();
  
  // Load settings
  loadSettings();
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
  // Close button
  elements.closeBtn.addEventListener('click', closeSidebar);
  
  // Retry button
  elements.retryBtn.addEventListener('click', retryTranscriptExtraction);
  
  // TTS controls
  elements.playBtn.addEventListener('click', startTTS);
  elements.pauseBtn.addEventListener('click', pauseTTS);
  elements.stopBtn.addEventListener('click', stopTTS);
  
  // TTS settings
  elements.rateSlider.addEventListener('input', updateTTSRate);
  elements.voiceSelect.addEventListener('change', updateTTSVoice);
  
  // Settings button
  elements.settingsBtn.addEventListener('click', openSettings);
  
  // Listen for messages from the content script
  window.addEventListener('message', handleContentScriptMessages);
}

/**
 * Initialize Text-to-Speech
 */
function initTTS() {
  if ('speechSynthesis' in window) {
    // Get available voices
    speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  } else {
    console.error('Text-to-Speech not supported in this browser');
  }
}

/**
 * Load available TTS voices
 */
function loadVoices() {
  ttsVoices = speechSynthesis.getVoices();
  
  // Clear voice select
  elements.voiceSelect.innerHTML = '';
  
  // Add voices to select
  ttsVoices.forEach((voice, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `${voice.name} (${voice.lang})`;
    elements.voiceSelect.appendChild(option);
  });
  
  // Select default voice (if saved in settings)
  if (ttsSettings.voice) {
    const voiceIndex = ttsVoices.findIndex(voice => voice.name === ttsSettings.voice);
    if (voiceIndex >= 0) {
      elements.voiceSelect.value = voiceIndex;
    }
  }
}

/**
 * Load user settings
 */
function loadSettings() {
  chrome.storage.sync.get(['config'], (result) => {
    if (result.config && result.config.ttsSettings) {
      ttsSettings = result.config.ttsSettings;
      
      // Update UI
      elements.rateSlider.value = ttsSettings.rate;
      elements.rateValue.textContent = `${ttsSettings.rate}x`;
    }
  });
}

/**
 * Save user settings
 */
function saveSettings() {
  chrome.storage.sync.get(['config'], (result) => {
    const config = result.config || {};
    config.ttsSettings = ttsSettings;
    
    chrome.storage.sync.set({ config });
  });
}

/**
 * Handle messages from the content script
 * 
 * @param {MessageEvent} event - Message event
 */
function handleContentScriptMessages(event) {
  const { action } = event.data;
  
  switch (action) {
    case 'videoInfo':
      videoId = event.data.videoId;
      videoTitle = event.data.title;
      elements.videoTitle.textContent = videoTitle;
      break;
      
    case 'transcript':
      videoTranscript = event.data.transcript;
      if (videoTranscript) {
        // Show loading state
        showLoading('Generating summary...');
        
        // Request summary from background script
        requestSummary();
      } else {
        showNoTranscript();
      }
      break;
      
    default:
      break;
  }
}

/**
 * Request summary from background script
 */
function requestSummary() {
  if (!videoId || !videoTranscript || isSummarizing) return;
  
  isSummarizing = true;
  
  chrome.runtime.sendMessage({
    action: 'summarize',
    videoId,
    title: videoTitle,
    transcript: videoTranscript
  }, response => {
    isSummarizing = false;
    
    if (response && response.success) {
      summary = response.summary;
      showSummary();
    } else {
      showError(response?.error || 'Failed to generate summary');
    }
  });
}

/**
 * Show loading state
 * 
 * @param {string} message - Loading message
 */
function showLoading(message = 'Loading...') {
  elements.loadingContainer.querySelector('p').textContent = message;
  elements.loadingContainer.classList.remove('hidden');
  elements.noTranscriptContainer.classList.add('hidden');
  elements.summaryContent.classList.add('hidden');
  elements.ttsControls.classList.add('hidden');
}

/**
 * Show no transcript message
 */
function showNoTranscript() {
  elements.loadingContainer.classList.add('hidden');
  elements.noTranscriptContainer.classList.remove('hidden');
  elements.summaryContent.classList.add('hidden');
  elements.ttsControls.classList.add('hidden');
}

/**
 * Show error message
 * 
 * @param {string} error - Error message
 */
function showError(error) {
  elements.loadingContainer.classList.add('hidden');
  elements.summaryContent.classList.remove('hidden');
  elements.ttsControls.classList.add('hidden');
  
  elements.summaryText.innerHTML = `
    <div class="error-message">
      <p>Error: ${error}</p>
      <button id="retry-summary-btn" class="action-button">Retry</button>
    </div>
  `;
  
  document.getElementById('retry-summary-btn').addEventListener('click', requestSummary);
}

/**
 * Show summary
 */
function showSummary() {
  elements.loadingContainer.classList.add('hidden');
  elements.noTranscriptContainer.classList.add('hidden');
  elements.summaryContent.classList.remove('hidden');
  elements.ttsControls.classList.remove('hidden');
  
  // Format summary for display and TTS
  const formattedSummary = formatSummaryForDisplay(summary);
  elements.summaryText.innerHTML = formattedSummary;
}

/**
 * Format summary for display and TTS
 * 
 * @param {string} summary - Raw summary text
 * @returns {string} - Formatted HTML
 */
function formatSummaryForDisplay(summary) {
  // Split into paragraphs
  const paragraphs = summary.split('\n').filter(p => p.trim());
  
  // Format each paragraph
  const formattedParagraphs = paragraphs.map(paragraph => {
    // Check if it's a bullet point
    if (paragraph.startsWith('- ') || paragraph.startsWith('• ')) {
      return `<li>${paragraph.substring(2)}</li>`;
    }
    
    // Regular paragraph
    return `<p>${paragraph}</p>`;
  });
  
  // Join paragraphs
  let html = formattedParagraphs.join('');
  
  // Wrap bullet points in a list if needed
  if (formattedParagraphs.some(p => p.startsWith('<li>'))) {
    html = html.replace(/<li>/g, '<ul><li>').replace(/<\/li><li>/g, '</li><li>').replace(/<\/li><p>/g, '</li></ul><p>').replace(/<\/p><li>/g, '</p><ul><li>').replace(/<\/li>$/, '</li></ul>');
  }
  
  // Add word spans for TTS highlighting
  html = addWordSpans(html);
  
  return html;
}

/**
 * Add word spans for TTS highlighting
 * 
 * @param {string} html - HTML content
 * @returns {string} - HTML with word spans
 */
function addWordSpans(html) {
  // Parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, 'text/html');
  const container = doc.body.firstChild;
  
  // Process text nodes
  const textNodes = [];
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  
  let node;
  while (node = walker.nextNode()) {
    textNodes.push(node);
  }
  
  // Add word spans to each text node
  let wordIndex = 0;
  textNodes.forEach(textNode => {
    const words = textNode.textContent.split(/\s+/);
    const fragment = document.createDocumentFragment();
    
    words.forEach((word, i) => {
      if (word) {
        const span = document.createElement('span');
        span.className = 'tts-word';
        span.dataset.index = wordIndex++;
        span.textContent = word;
        fragment.appendChild(span);
        
        if (i < words.length - 1) {
          fragment.appendChild(document.createTextNode(' '));
        }
      }
    });
    
    textNode.parentNode.replaceChild(fragment, textNode);
  });
  
  return container.innerHTML;
}

/**
 * Start Text-to-Speech
 */
function startTTS() {
  if (!summary) return;
  
  // Stop any existing speech
  stopTTS();
  
  // Create new utterance
  ttsUtterance = new SpeechSynthesisUtterance(summary);
  
  // Set voice
  const selectedVoiceIndex = elements.voiceSelect.value;
  if (selectedVoiceIndex && ttsVoices[selectedVoiceIndex]) {
    ttsUtterance.voice = ttsVoices[selectedVoiceIndex];
  }
  
  // Set rate and pitch
  ttsUtterance.rate = ttsSettings.rate;
  ttsUtterance.pitch = ttsSettings.pitch;
  
  // Set up word boundary event for highlighting
  ttsUtterance.onboundary = handleTTSBoundary;
  
  // Set up other events
  ttsUtterance.onstart = handleTTSStart;
  ttsUtterance.onpause = handleTTSPause;
  ttsUtterance.onresume = handleTTSResume;
  ttsUtterance.onend = handleTTSEnd;
  ttsUtterance.onerror = handleTTSError;
  
  // Start speaking
  speechSynthesis.speak(ttsUtterance);
}

/**
 * Handle TTS boundary event (word highlighting)
 * 
 * @param {SpeechSynthesisEvent} event - TTS event
 */
function handleTTSBoundary(event) {
  if (event.name !== 'word') return;
  
  // Remove previous highlight
  if (currentHighlightedWord) {
    currentHighlightedWord.classList.remove('tts-highlight');
  }
  
  // Find the word to highlight
  const wordIndex = Math.floor(event.charIndex / 5); // Approximate mapping
  const wordElement = document.querySelector(`.tts-word[data-index="${wordIndex}"]`);
  
  if (wordElement) {
    wordElement.classList.add('tts-highlight');
    currentHighlightedWord = wordElement;
    
    // Scroll to the word if needed
    wordElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

/**
 * Handle TTS start event
 */
function handleTTSStart() {
  elements.playBtn.classList.add('hidden');
  elements.pauseBtn.classList.remove('hidden');
}

/**
 * Handle TTS pause event
 */
function handleTTSPause() {
  elements.playBtn.classList.remove('hidden');
  elements.pauseBtn.classList.add('hidden');
}

/**
 * Handle TTS resume event
 */
function handleTTSResume() {
  elements.playBtn.classList.add('hidden');
  elements.pauseBtn.classList.remove('hidden');
}

/**
 * Handle TTS end event
 */
function handleTTSEnd() {
  // Remove highlight
  if (currentHighlightedWord) {
    currentHighlightedWord.classList.remove('tts-highlight');
    currentHighlightedWord = null;
  }
  
  elements.playBtn.classList.remove('hidden');
  elements.pauseBtn.classList.add('hidden');
}

/**
 * Handle TTS error event
 * 
 * @param {SpeechSynthesisEvent} event - TTS event
 */
function handleTTSError(event) {
  console.error('TTS error:', event);
  
  elements.playBtn.classList.remove('hidden');
  elements.pauseBtn.classList.add('hidden');
}

/**
 * Pause Text-to-Speech
 */
function pauseTTS() {
  if (speechSynthesis.speaking) {
    speechSynthesis.pause();
    
    elements.playBtn.classList.remove('hidden');
    elements.pauseBtn.classList.add('hidden');
  }
}

/**
 * Resume Text-to-Speech
 */
function resumeTTS() {
  if (speechSynthesis.paused) {
    speechSynthesis.resume();
    
    elements.playBtn.classList.add('hidden');
    elements.pauseBtn.classList.remove('hidden');
  }
}

/**
 * Stop Text-to-Speech
 */
function stopTTS() {
  speechSynthesis.cancel();
  
  // Remove highlight
  if (currentHighlightedWord) {
    currentHighlightedWord.classList.remove('tts-highlight');
    currentHighlightedWord = null;
  }
  
  elements.playBtn.classList.remove('hidden');
  elements.pauseBtn.classList.add('hidden');
}

/**
 * Update TTS rate
 */
function updateTTSRate() {
  const rate = parseFloat(elements.rateSlider.value);
  elements.rateValue.textContent = `${rate.toFixed(1)}x`;
  
  ttsSettings.rate = rate;
  saveSettings();
  
  // Update current utterance if speaking
  if (ttsUtterance && speechSynthesis.speaking) {
    // Need to restart with new rate
    const currentPaused = speechSynthesis.paused;
    stopTTS();
    startTTS();
    
    if (currentPaused) {
      pauseTTS();
    }
  }
}

/**
 * Update TTS voice
 */
function updateTTSVoice() {
  const selectedVoiceIndex = elements.voiceSelect.value;
  if (selectedVoiceIndex && ttsVoices[selectedVoiceIndex]) {
    ttsSettings.voice = ttsVoices[selectedVoiceIndex].name;
    saveSettings();
    
    // Update current utterance if speaking
    if (ttsUtterance && speechSynthesis.speaking) {
      // Need to restart with new voice
      const currentPaused = speechSynthesis.paused;
      stopTTS();
      startTTS();
      
      if (currentPaused) {
        pauseTTS();
      }
    }
  }
}

/**
 * Open settings page
 */
function openSettings() {
  chrome.runtime.openOptionsPage();
}

/**
 * Close the sidebar
 */
function closeSidebar() {
  // Stop TTS if playing
  stopTTS();
  
  // Send message to content script
  window.parent.postMessage({ action: 'closeSidebar' }, '*');
}

/**
 * Retry transcript extraction
 */
function retryTranscriptExtraction() {
  showLoading('Extracting transcript...');
  
  // Send message to content script
  window.parent.postMessage({ action: 'summarize' }, '*');
}
