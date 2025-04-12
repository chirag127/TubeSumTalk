# Migration Guide: Original to Modular Structure

This guide explains how to migrate from the original TubeSumTalk structure to the new modular structure.

## Overview

The modular structure separates concerns into distinct modules, making the codebase more maintainable and extensible. Each module is responsible for a specific functionality, and modules communicate with each other through well-defined interfaces.

## Migration Steps

### 1. Update the Manifest File

Replace the original `manifest.json` with the new `manifest-modular.json`:

```bash
cp extension/manifest-modular.json extension/manifest.json
```

### 2. Use the New Content Script

The new content script (`content-modular.js`) uses the modular structure. To use it:

```bash
# Rename the original content script as a backup
mv extension/content_scripts/content.js extension/content_scripts/content-original.js

# Rename the modular content script
mv extension/content_scripts/content-modular.js extension/content_scripts/content.js
```

### 3. Update Import Statements

If you've created custom modules or components, update their import statements to use the new modular structure:

```javascript
// Original
// No imports, global functions and variables

// New modular approach
import youtubeService from '../utils/youtube.js';
import apiService from '../utils/api.js';
import settingsManager from '../utils/settings.js';
import markdownParser from '../utils/markdown.js';
```

### 4. Replace Direct Function Calls with Module Calls

Replace direct function calls with calls to the appropriate module:

```javascript
// Original
const videoDetails = getVideoDetails();

// New modular approach
const videoDetails = youtubeService.getVideoDetails();
```

```javascript
// Original
chrome.storage.sync.get(['summaryType', 'summaryLength'], (settings) => {
  // Use settings
});

// New modular approach
const settings = await settingsManager.getSummarySettings();
// Use settings
```

### 5. Replace Direct API Calls with API Service Calls

Replace direct API calls with calls to the API service:

```javascript
// Original
chrome.runtime.sendMessage({
  action: 'summarize',
  videoId: videoDetails.videoId,
  transcript: transcriptText,
  title: videoDetails.title,
  summaryType: summaryType,
  summaryLength: summaryLength,
}, (response) => {
  // Handle response
});

// New modular approach
try {
  const summary = await apiService.getSummary(
    videoDetails.videoId,
    transcriptText,
    videoDetails.title,
    settings.summaryType,
    settings.summaryLength
  );
  // Handle summary
} catch (error) {
  // Handle error
}
```

### 6. Replace Direct DOM Manipulation with UI Service Calls

Replace direct DOM manipulation with calls to the UI service:

```javascript
// Original
const element = document.createElement('div');
element.className = 'my-class';
element.textContent = 'Hello, world!';

// New modular approach
const element = uiService.createElement('div', {
  className: 'my-class'
}, 'Hello, world!');
```

## Benefits of the Modular Structure

- **Separation of Concerns**: Each module is responsible for a specific functionality
- **Maintainability**: Easier to understand, debug, and maintain
- **Testability**: Easier to write unit tests for individual modules
- **Extensibility**: Easier to add new features or modify existing ones
- **Reusability**: Modules can be reused in other parts of the application or in other projects

## Module Documentation

For detailed documentation of each module, see the [README.md](README.md) file.
