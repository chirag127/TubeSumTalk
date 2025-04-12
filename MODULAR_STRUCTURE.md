# TubeSumTalk Modular Structure

This document provides an overview of the modular structure of the TubeSumTalk extension.

## Overview

The TubeSumTalk extension has been refactored to use a modular architecture, with each module responsible for a specific functionality. This makes the codebase more maintainable, testable, and extensible.

## Modular Files

The following files have been created or updated to support the modular architecture:

### Utility Modules

- **API Service** (`extension/utils/api.js`): Handles communication with the backend API
- **Transcript Service** (`extension/utils/transcript.js`): Extracts YouTube video transcripts
- **TTS Service** (`extension/utils/tts.js`): Handles text-to-speech functionality with word highlighting
- **Storage Service** (`extension/utils/storage.js`): Manages user preferences and data
- **UI Service** (`extension/utils/ui.js`): Provides common UI utilities
- **YouTube Service** (`extension/utils/youtube.js`): Interacts with YouTube's DOM structure
- **Settings Manager** (`extension/utils/settings.js`): Manages user settings and preferences
- **Markdown Parser** (`extension/utils/markdown.js`): Parses markdown to HTML for better summary display

### Content Scripts

- **Widget** (`extension/content_scripts/widget-modular.js`): UI component for displaying summaries
- **Content Script** (`extension/content_scripts/content-modular.js`): Main content script that coordinates between modules

### Background Service Worker

- **Service Worker** (`extension/background/service-worker-modular.js`): Handles API communication and manages extension state

### Popup UI

- **Popup Script** (`extension/popup/popup-modular.js`): Handles the extension popup UI

### Manifest

- **Manifest** (`extension/manifest-modular.json`): Updated manifest file to use the modular structure

### Tests

- **Settings Tests** (`tests/utils/settings.test.js`): Unit tests for the Settings Manager module
- **Markdown Tests** (`tests/utils/markdown.test.js`): Unit tests for the Markdown Parser module
- **API Tests** (`tests/utils/api.test.js`): Unit tests for the API Service module
- **YouTube Tests** (`tests/utils/youtube.test.js`): Unit tests for the YouTube Service module
- **UI Tests** (`tests/utils/ui.test.js`): Unit tests for the UI Service module

## Migration Guide

See the [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) file for instructions on how to migrate from the original structure to the modular structure.

## Benefits of the Modular Structure

- **Separation of Concerns**: Each module is responsible for a specific functionality
- **Maintainability**: Easier to understand, debug, and maintain
- **Testability**: Easier to write unit tests for individual modules
- **Extensibility**: Easier to add new features or modify existing ones
- **Reusability**: Modules can be reused in other parts of the application or in other projects

## How to Use the Modular Structure

To use the modular structure, you need to:

1. Replace the original files with the modular versions:
   - `extension/manifest.json` → `extension/manifest-modular.json`
   - `extension/content_scripts/content.js` → `extension/content_scripts/content-modular.js`
   - `extension/content_scripts/widget.js` → `extension/content_scripts/widget-modular.js`
   - `extension/background/service-worker.js` → `extension/background/service-worker-modular.js`
   - `extension/popup/popup.js` → `extension/popup/popup-modular.js`

2. Install the development dependencies:
   ```bash
   npm install
   ```

3. Run the tests:
   ```bash
   npm test
   ```

## Future Improvements

- Add more unit tests for the remaining modules
- Add integration tests for the extension
- Add end-to-end tests for the extension
- Add documentation for each module
- Add TypeScript support
- Add ESLint and Prettier for code quality
- Add CI/CD pipeline for automated testing and deployment
