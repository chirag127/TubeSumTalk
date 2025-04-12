/**
 * Unit tests for the Settings Manager module
 */

import settingsManager from '../../extension/utils/settings.js';

// Mock chrome.storage.sync
global.chrome = {
    storage: {
        sync: {
            get: jest.fn(),
            set: jest.fn(),
        },
    },
};

describe('Settings Manager', () => {
    beforeEach(() => {
        // Reset mocks
        chrome.storage.sync.get.mockReset();
        chrome.storage.sync.set.mockReset();
    });

    test('getAll returns all settings with defaults', async () => {
        // Mock chrome.storage.sync.get to return some settings
        chrome.storage.sync.get.mockImplementation((keys, callback) => {
            callback({
                summaryType: 'paragraph',
                ttsRate: 2.0,
            });
        });

        // Call getAll
        const settings = await settingsManager.getAll();

        // Check that chrome.storage.sync.get was called with null
        expect(chrome.storage.sync.get).toHaveBeenCalledWith(null, expect.any(Function));

        // Check that the returned settings include defaults for missing values
        expect(settings).toEqual({
            summaryType: 'paragraph',
            summaryLength: 'medium',
            ttsVoice: 'default',
            ttsRate: 2.0,
            ttsPitch: 1.0,
            darkMode: false,
            autoExpand: true,
        });
    });

    test('get returns specific settings with defaults', async () => {
        // Mock chrome.storage.sync.get to return some settings
        chrome.storage.sync.get.mockImplementation((keys, callback) => {
            callback({
                ttsRate: 2.0,
            });
        });

        // Call get with specific keys
        const settings = await settingsManager.get(['ttsRate', 'ttsPitch']);

        // Check that chrome.storage.sync.get was called with the correct keys
        expect(chrome.storage.sync.get).toHaveBeenCalledWith(['ttsRate', 'ttsPitch'], expect.any(Function));

        // Check that the returned settings include defaults for missing values
        expect(settings).toEqual({
            ttsRate: 2.0,
            ttsPitch: 1.0,
        });
    });

    test('save saves settings', async () => {
        // Mock chrome.storage.sync.set to call the callback
        chrome.storage.sync.set.mockImplementation((settings, callback) => {
            callback();
        });

        // Call save with settings
        await settingsManager.save({
            summaryType: 'paragraph',
            ttsRate: 2.0,
        });

        // Check that chrome.storage.sync.set was called with the correct settings
        expect(chrome.storage.sync.set).toHaveBeenCalledWith({
            summaryType: 'paragraph',
            ttsRate: 2.0,
        }, expect.any(Function));
    });

    test('reset resets settings to defaults', async () => {
        // Mock chrome.storage.sync.set to call the callback
        chrome.storage.sync.set.mockImplementation((settings, callback) => {
            callback();
        });

        // Call reset
        await settingsManager.reset();

        // Check that chrome.storage.sync.set was called with the default settings
        expect(chrome.storage.sync.set).toHaveBeenCalledWith({
            summaryType: 'bullet',
            summaryLength: 'medium',
            ttsVoice: 'default',
            ttsRate: 1.0,
            ttsPitch: 1.0,
            darkMode: false,
            autoExpand: true,
        }, expect.any(Function));
    });

    test('reset resets specific settings to defaults', async () => {
        // Mock chrome.storage.sync.set to call the callback
        chrome.storage.sync.set.mockImplementation((settings, callback) => {
            callback();
        });

        // Call reset with specific keys
        await settingsManager.reset(['ttsRate', 'ttsPitch']);

        // Check that chrome.storage.sync.set was called with the default settings for the specified keys
        expect(chrome.storage.sync.set).toHaveBeenCalledWith({
            ttsRate: 1.0,
            ttsPitch: 1.0,
        }, expect.any(Function));
    });

    test('getSummarySettings returns summary settings', async () => {
        // Mock chrome.storage.sync.get to return some settings
        chrome.storage.sync.get.mockImplementation((keys, callback) => {
            callback({
                summaryType: 'paragraph',
                summaryLength: 'long',
            });
        });

        // Call getSummarySettings
        const settings = await settingsManager.getSummarySettings();

        // Check that chrome.storage.sync.get was called with the correct keys
        expect(chrome.storage.sync.get).toHaveBeenCalledWith(['summaryType', 'summaryLength'], expect.any(Function));

        // Check that the returned settings are correct
        expect(settings).toEqual({
            summaryType: 'paragraph',
            summaryLength: 'long',
        });
    });

    test('getTtsSettings returns TTS settings', async () => {
        // Mock chrome.storage.sync.get to return some settings
        chrome.storage.sync.get.mockImplementation((keys, callback) => {
            callback({
                ttsVoice: 'Google US English',
                ttsRate: 2.0,
                ttsPitch: 1.5,
            });
        });

        // Call getTtsSettings
        const settings = await settingsManager.getTtsSettings();

        // Check that chrome.storage.sync.get was called with the correct keys
        expect(chrome.storage.sync.get).toHaveBeenCalledWith(['ttsVoice', 'ttsRate', 'ttsPitch'], expect.any(Function));

        // Check that the returned settings are correct
        expect(settings).toEqual({
            ttsVoice: 'Google US English',
            ttsRate: 2.0,
            ttsPitch: 1.5,
        });
    });

    test('saveSummarySettings saves summary settings', async () => {
        // Mock chrome.storage.sync.set to call the callback
        chrome.storage.sync.set.mockImplementation((settings, callback) => {
            callback();
        });

        // Call saveSummarySettings
        await settingsManager.saveSummarySettings({
            summaryType: 'paragraph',
            summaryLength: 'long',
        });

        // Check that chrome.storage.sync.set was called with the correct settings
        expect(chrome.storage.sync.set).toHaveBeenCalledWith({
            summaryType: 'paragraph',
            summaryLength: 'long',
        }, expect.any(Function));
    });

    test('saveTtsSettings saves TTS settings', async () => {
        // Mock chrome.storage.sync.set to call the callback
        chrome.storage.sync.set.mockImplementation((settings, callback) => {
            callback();
        });

        // Call saveTtsSettings
        await settingsManager.saveTtsSettings({
            ttsVoice: 'Google US English',
            ttsRate: 2.0,
            ttsPitch: 1.5,
        });

        // Check that chrome.storage.sync.set was called with the correct settings
        expect(chrome.storage.sync.set).toHaveBeenCalledWith({
            ttsVoice: 'Google US English',
            ttsRate: 2.0,
            ttsPitch: 1.5,
        }, expect.any(Function));
    });
});
