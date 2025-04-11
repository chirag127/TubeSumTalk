/**
 * TubeSumTalk - Sidebar Script
 * 
 * This script handles the sidebar functionality, including:
 * 1. Displaying video information
 * 2. Requesting and displaying summaries
 * 3. Text-to-speech with word highlighting
 */

// DOM Elements
const closeButton = document.getElementById('close-button');
const videoThumbnail = document.getElementById('video-thumbnail');
const videoTitle = document.getElementById('video-title');
const videoChannel = document.getElementById('video-channel');
const summarizeButton = document.getElementById('summarize-button');
const readAloudButton = document.getElementById('read-aloud-button');
const ttsControls = document.querySelector('.tts-controls');
const voiceSpeed = document.getElementById('voice-speed');
const voiceSpeedValue = document.getElementById('voice-speed-value');
const voicePitch = document.getElementById('voice-pitch');
const voicePitchValue = document.getElementById('voice-pitch-value');
const loadingIndicator = document.getElementById('loading-indicator');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const summaryContent = document.getElementById('summary-content');

// State
let currentVideoId = null;
let currentSummary = null;
let isSpeaking = false;
let speechSynthesis = window.speechSynthesis;
let speechUtterance = null;

/**
 * Initialize the sidebar
 */
function initialize() {
    // Add event listeners
    closeButton.addEventListener('click', closeSidebar);
    summarizeButton.addEventListener('click', requestSummary);
    readAloudButton.addEventListener('click', toggleReadAloud);
    
    // Set up TTS controls
    voiceSpeed.addEventListener('input', updateVoiceSpeed);
    voicePitch.addEventListener('input', updateVoicePitch);
    
    // Listen for messages from the content script
    window.addEventListener('message', handleContentMessage);
}

/**
 * Close the sidebar
 */
function closeSidebar() {
    // Send a message to the content script to close the sidebar
    window.parent.postMessage({
        source: 'tubesumtalk-sidebar',
        action: 'toggleSidebar'
    }, '*');
}

/**
 * Request a summary for the current video
 */
function requestSummary() {
    if (!currentVideoId) {
        showError('No video ID found');
        return;
    }
    
    // Show loading indicator
    loadingIndicator.style.display = 'flex';
    errorMessage.style.display = 'none';
    summaryContent.innerHTML = '';
    readAloudButton.disabled = true;
    
    // Send a message to the content script to request the summary
    window.parent.postMessage({
        source: 'tubesumtalk-sidebar',
        action: 'getSummary',
        videoId: currentVideoId
    }, '*');
}

/**
 * Toggle the read aloud functionality
 */
function toggleReadAloud() {
    if (isSpeaking) {
        stopSpeaking();
    } else {
        startSpeaking();
    }
}

/**
 * Start reading the summary aloud
 */
function startSpeaking() {
    if (!currentSummary || isSpeaking) return;
    
    // Prepare the text for TTS by wrapping each word in a span
    const words = currentSummary.split(/\s+/);
    summaryContent.innerHTML = words.map((word, index) => 
        `<span class="word" data-index="${index}">${word}</span>`
    ).join(' ');
    
    // Create a new utterance
    speechUtterance = new SpeechSynthesisUtterance(currentSummary);
    
    // Set the voice (use the first available voice)
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
        // Try to find an English voice
        const englishVoice = voices.find(voice => voice.lang.startsWith('en-'));
        if (englishVoice) {
            speechUtterance.voice = englishVoice;
        } else {
            speechUtterance.voice = voices[0];
        }
    }
    
    // Set the rate and pitch
    speechUtterance.rate = parseFloat(voiceSpeed.value);
    speechUtterance.pitch = parseFloat(voicePitch.value);
    
    // Add event listeners for word boundaries
    speechUtterance.onboundary = handleWordBoundary;
    speechUtterance.onend = handleSpeechEnd;
    
    // Start speaking
    speechSynthesis.speak(speechUtterance);
    isSpeaking = true;
    
    // Update the button text
    readAloudButton.textContent = 'Pause';
    
    // Show the TTS controls
    ttsControls.style.display = 'block';
}

/**
 * Stop reading the summary aloud
 */
function stopSpeaking() {
    if (!isSpeaking) return;
    
    // Stop speaking
    speechSynthesis.cancel();
    isSpeaking = false;
    
    // Update the button text
    readAloudButton.textContent = 'Read Aloud';
    
    // Remove all highlighting
    const highlightedWords = document.querySelectorAll('.highlighted-word');
    highlightedWords.forEach(word => {
        word.classList.remove('highlighted-word');
    });
}

/**
 * Handle word boundary events during speech
 * @param {Event} event The boundary event
 */
function handleWordBoundary(event) {
    // Remove highlighting from all words
    const highlightedWords = document.querySelectorAll('.highlighted-word');
    highlightedWords.forEach(word => {
        word.classList.remove('highlighted-word');
    });
    
    // Calculate the current word index
    const text = event.utterance.text;
    const charIndex = event.charIndex;
    
    // Count words up to the current character index
    const textUpToChar = text.substring(0, charIndex);
    const wordCount = textUpToChar.split(/\s+/).length - 1;
    
    // Highlight the current word
    const wordElements = document.querySelectorAll('.word');
    if (wordCount >= 0 && wordCount < wordElements.length) {
        wordElements[wordCount].classList.add('highlighted-word');
        
        // Scroll to the highlighted word if needed
        wordElements[wordCount].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
}

/**
 * Handle speech end event
 */
function handleSpeechEnd() {
    isSpeaking = false;
    readAloudButton.textContent = 'Read Aloud';
    
    // Remove all highlighting
    const highlightedWords = document.querySelectorAll('.highlighted-word');
    highlightedWords.forEach(word => {
        word.classList.remove('highlighted-word');
    });
}

/**
 * Update the voice speed
 */
function updateVoiceSpeed() {
    const speed = parseFloat(voiceSpeed.value);
    voiceSpeedValue.textContent = speed.toFixed(1);
    
    // Update the current utterance if speaking
    if (isSpeaking && speechUtterance) {
        // We need to restart speech with the new rate
        const currentText = speechUtterance.text;
        stopSpeaking();
        
        // Create a new utterance with the updated rate
        speechUtterance = new SpeechSynthesisUtterance(currentText);
        speechUtterance.rate = speed;
        speechUtterance.pitch = parseFloat(voicePitch.value);
        speechUtterance.onboundary = handleWordBoundary;
        speechUtterance.onend = handleSpeechEnd;
        
        // Start speaking again
        speechSynthesis.speak(speechUtterance);
        isSpeaking = true;
        readAloudButton.textContent = 'Pause';
    }
}

/**
 * Update the voice pitch
 */
function updateVoicePitch() {
    const pitch = parseFloat(voicePitch.value);
    voicePitchValue.textContent = pitch.toFixed(1);
    
    // Update the current utterance if speaking
    if (isSpeaking && speechUtterance) {
        // We need to restart speech with the new pitch
        const currentText = speechUtterance.text;
        stopSpeaking();
        
        // Create a new utterance with the updated pitch
        speechUtterance = new SpeechSynthesisUtterance(currentText);
        speechUtterance.rate = parseFloat(voiceSpeed.value);
        speechUtterance.pitch = pitch;
        speechUtterance.onboundary = handleWordBoundary;
        speechUtterance.onend = handleSpeechEnd;
        
        // Start speaking again
        speechSynthesis.speak(speechUtterance);
        isSpeaking = true;
        readAloudButton.textContent = 'Pause';
    }
}

/**
 * Set the current video ID and update the UI
 * @param {string} videoId The YouTube video ID
 */
function setVideoId(videoId) {
    currentVideoId = videoId;
    
    // Reset the UI
    videoTitle.textContent = 'Loading video information...';
    videoChannel.textContent = '';
    videoThumbnail.src = '';
    summaryContent.innerHTML = '';
    readAloudButton.disabled = true;
    
    // Set the video thumbnail
    videoThumbnail.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    
    // Get the video title from the parent page
    try {
        const parentTitle = window.parent.document.title;
        if (parentTitle) {
            // YouTube titles typically end with " - YouTube"
            const cleanTitle = parentTitle.replace(' - YouTube', '');
            videoTitle.textContent = cleanTitle;
        }
    } catch (error) {
        // If we can't access the parent title (due to cross-origin restrictions),
        // we'll get the title from the API response later
        console.error('Could not access parent title:', error);
    }
}

/**
 * Display a summary in the sidebar
 * @param {Object} result The summary result from the API
 */
function displaySummary(result) {
    // Hide loading indicator
    loadingIndicator.style.display = 'none';
    
    // Check for errors
    if (result.error) {
        showError(result.error);
        return;
    }
    
    // Update video information
    videoTitle.textContent = result.title || 'Unknown Title';
    videoChannel.textContent = result.channel || 'Unknown Channel';
    
    // If there's a thumbnail in the result, use it
    if (result.thumbnail) {
        videoThumbnail.src = result.thumbnail;
    }
    
    // Display the summary
    if (result.summary) {
        currentSummary = result.summary;
        
        // Convert markdown-like formatting to HTML
        const formattedSummary = result.summary
            .replace(/\n\n/g, '<br><br>')
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/- (.*?)(?:<br>|$)/g, '• $1<br>');
        
        summaryContent.innerHTML = formattedSummary;
        
        // Enable the read aloud button
        readAloudButton.disabled = false;
    } else {
        summaryContent.innerHTML = '<p>No summary available.</p>';
        readAloudButton.disabled = true;
    }
}

/**
 * Show an error message
 * @param {string} message The error message
 */
function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'block';
    loadingIndicator.style.display = 'none';
}

/**
 * Handle messages from the content script
 * @param {MessageEvent} event The message event
 */
function handleContentMessage(event) {
    // Ensure the message is from our content script
    if (!event.data || event.data.source !== 'tubesumtalk-content') return;
    
    const message = event.data;
    
    switch (message.action) {
        case 'setVideoId':
            setVideoId(message.videoId);
            break;
            
        case 'summaryResult':
            displaySummary(message.result);
            break;
    }
}

// Initialize the sidebar when the page loads
document.addEventListener('DOMContentLoaded', initialize);

// Initialize speech synthesis voices
if (speechSynthesis) {
    // Chrome needs to wait for the voiceschanged event
    speechSynthesis.onvoiceschanged = () => {
        // This is just to ensure voices are loaded
        speechSynthesis.getVoices();
    };
}
