/**
 * TubeSumTalk - Content Script
 * 
 * This script is injected into YouTube video pages and is responsible for:
 * 1. Detecting when a YouTube video page is loaded
 * 2. Injecting the sidebar into the page
 * 3. Handling communication between the sidebar and the background script
 */

// Configuration
const API_BASE_URL = 'http://localhost:8000'; // Change this to your deployed backend URL in production
const SIDEBAR_WIDTH = '350px';

// State
let sidebarInjected = false;
let sidebarFrame = null;
let currentVideoId = null;

/**
 * Extract the video ID from the current URL
 * @returns {string|null} The video ID or null if not found
 */
function getYouTubeVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
}

/**
 * Create and inject the sidebar iframe
 */
function injectSidebar() {
    if (sidebarInjected) return;
    
    // Create the sidebar container
    const sidebarContainer = document.createElement('div');
    sidebarContainer.id = 'tubesumtalk-sidebar-container';
    sidebarContainer.style.position = 'fixed';
    sidebarContainer.style.top = '0';
    sidebarContainer.style.right = '0';
    sidebarContainer.style.width = SIDEBAR_WIDTH;
    sidebarContainer.style.height = '100%';
    sidebarContainer.style.zIndex = '9999';
    sidebarContainer.style.transform = 'translateX(100%)';
    sidebarContainer.style.transition = 'transform 0.3s ease-in-out';
    
    // Create the toggle button
    const toggleButton = document.createElement('div');
    toggleButton.id = 'tubesumtalk-toggle-button';
    toggleButton.innerHTML = '📝';
    toggleButton.title = 'Toggle TubeSumTalk Sidebar';
    toggleButton.style.position = 'fixed';
    toggleButton.style.top = '70px';
    toggleButton.style.right = '0';
    toggleButton.style.width = '40px';
    toggleButton.style.height = '40px';
    toggleButton.style.backgroundColor = '#ff0000';
    toggleButton.style.color = 'white';
    toggleButton.style.borderRadius = '5px 0 0 5px';
    toggleButton.style.display = 'flex';
    toggleButton.style.justifyContent = 'center';
    toggleButton.style.alignItems = 'center';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.zIndex = '10000';
    toggleButton.style.fontSize = '20px';
    
    // Create the iframe
    sidebarFrame = document.createElement('iframe');
    sidebarFrame.id = 'tubesumtalk-sidebar-frame';
    sidebarFrame.style.width = '100%';
    sidebarFrame.style.height = '100%';
    sidebarFrame.style.border = 'none';
    sidebarFrame.style.backgroundColor = 'white';
    sidebarFrame.style.boxShadow = '-5px 0 15px rgba(0, 0, 0, 0.2)';
    
    // Load the sidebar HTML
    const sidebarURL = chrome.runtime.getURL('sidebar.html');
    sidebarFrame.src = sidebarURL;
    
    // Add the iframe to the container
    sidebarContainer.appendChild(sidebarFrame);
    
    // Add the container and toggle button to the page
    document.body.appendChild(sidebarContainer);
    document.body.appendChild(toggleButton);
    
    // Add event listener to the toggle button
    toggleButton.addEventListener('click', toggleSidebar);
    
    sidebarInjected = true;
    
    // Wait for the iframe to load
    sidebarFrame.addEventListener('load', () => {
        // Send the current video ID to the sidebar
        const videoId = getYouTubeVideoId();
        if (videoId) {
            sendMessageToSidebar({
                action: 'setVideoId',
                videoId: videoId
            });
        }
    });
}

/**
 * Toggle the sidebar visibility
 */
function toggleSidebar() {
    const sidebarContainer = document.getElementById('tubesumtalk-sidebar-container');
    if (sidebarContainer) {
        if (sidebarContainer.style.transform === 'translateX(100%)') {
            sidebarContainer.style.transform = 'translateX(0)';
        } else {
            sidebarContainer.style.transform = 'translateX(100%)';
        }
    }
}

/**
 * Send a message to the sidebar iframe
 * @param {Object} message The message to send
 */
function sendMessageToSidebar(message) {
    if (sidebarFrame && sidebarFrame.contentWindow) {
        sidebarFrame.contentWindow.postMessage({
            source: 'tubesumtalk-content',
            ...message
        }, '*');
    }
}

/**
 * Handle messages from the sidebar iframe
 * @param {MessageEvent} event The message event
 */
function handleSidebarMessage(event) {
    // Ensure the message is from our sidebar
    if (event.source !== sidebarFrame?.contentWindow) return;
    if (!event.data || event.data.source !== 'tubesumtalk-sidebar') return;
    
    const message = event.data;
    
    switch (message.action) {
        case 'getSummary':
            // Forward the request to the background script
            chrome.runtime.sendMessage({
                action: 'getSummary',
                videoId: message.videoId
            });
            break;
            
        case 'toggleSidebar':
            toggleSidebar();
            break;
    }
}

/**
 * Handle messages from the background script
 * @param {Object} message The message
 * @param {Object} sender The sender information
 * @param {Function} sendResponse The response callback
 */
function handleBackgroundMessage(message, sender, sendResponse) {
    if (message.action === 'summaryResult') {
        // Forward the summary result to the sidebar
        sendMessageToSidebar({
            action: 'summaryResult',
            result: message.result
        });
    }
}

/**
 * Initialize the content script
 */
function initialize() {
    // Check if we're on a YouTube video page
    if (window.location.hostname.includes('youtube.com') && window.location.pathname === '/watch') {
        // Get the video ID
        const videoId = getYouTubeVideoId();
        if (videoId) {
            currentVideoId = videoId;
            
            // Inject the sidebar
            injectSidebar();
            
            // Listen for messages from the sidebar
            window.addEventListener('message', handleSidebarMessage);
            
            // Listen for messages from the background script
            chrome.runtime.onMessage.addListener(handleBackgroundMessage);
        }
    }
}

/**
 * Handle URL changes (for YouTube's SPA navigation)
 */
function handleURLChange() {
    const videoId = getYouTubeVideoId();
    
    // If we're on a video page and the video ID has changed
    if (videoId && videoId !== currentVideoId) {
        currentVideoId = videoId;
        
        // If the sidebar is already injected, just update the video ID
        if (sidebarInjected) {
            sendMessageToSidebar({
                action: 'setVideoId',
                videoId: videoId
            });
        } else {
            // Otherwise, inject the sidebar
            injectSidebar();
        }
    }
}

// Initialize when the page loads
initialize();

// Listen for URL changes (YouTube is a SPA)
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        handleURLChange();
    }
}).observe(document, { subtree: true, childList: true });
