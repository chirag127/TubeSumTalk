/**
 * Theme utility functions for TubeSumTalk
 * Detects YouTube's theme and adapts the extension UI accordingly
 */

// Function to detect YouTube's theme
function detectYouTubeTheme() {
    // Check if the body has the dark theme class
    const isDarkTheme = document.documentElement.getAttribute('dark') === 'true' || 
                        document.documentElement.getAttribute('theme') === 'dark' ||
                        document.body.classList.contains('dark-theme');
    
    return isDarkTheme ? 'dark' : 'light';
}

// Function to apply theme to TubeSumTalk elements
function applyTheme(theme) {
    const tubeSumTalkElements = document.querySelectorAll('.tubesumtalk-widget, .tubesumtalk-sidebar');
    
    tubeSumTalkElements.forEach(element => {
        if (theme === 'dark') {
            element.classList.add('tubesumtalk-dark-theme');
            element.classList.remove('tubesumtalk-light-theme');
        } else {
            element.classList.add('tubesumtalk-light-theme');
            element.classList.remove('tubesumtalk-dark-theme');
        }
    });
}

// Function to initialize theme detection and apply theme
function initTheme() {
    // Apply theme on load
    const currentTheme = detectYouTubeTheme();
    applyTheme(currentTheme);
    
    // Create a MutationObserver to watch for theme changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (
                mutation.type === 'attributes' && 
                (mutation.attributeName === 'dark' || 
                 mutation.attributeName === 'theme' || 
                 mutation.attributeName === 'class')
            ) {
                const newTheme = detectYouTubeTheme();
                applyTheme(newTheme);
            }
        });
    });
    
    // Start observing the document for theme changes
    observer.observe(document.documentElement, { 
        attributes: true,
        attributeFilter: ['dark', 'theme', 'class']
    });
    
    observer.observe(document.body, { 
        attributes: true,
        attributeFilter: ['class']
    });
    
    return observer;
}

// Export functions
window.TubeSumTalkTheme = {
    detectYouTubeTheme,
    applyTheme,
    initTheme
};
