/**
 * Settings Manager Module
 * Handles storage and retrieval of user preferences
 */

class SettingsManager {
  constructor() {
    // Default settings
    this.defaults = {
      // Summary settings
      summaryType: 'bullet',
      summaryLength: 'medium',
      
      // TTS settings
      ttsVoice: 'default',
      ttsRate: 1.0,
      ttsPitch: 1.0,
      
      // UI settings
      darkMode: false,
      autoExpand: true
    };
  }

  /**
   * Get all settings
   * @returns {Promise<Object>} - All settings
   */
  async getAll() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(null, (result) => {
        // Merge with defaults for any missing settings
        const settings = { ...this.defaults, ...result };
        resolve(settings);
      });
    });
  }

  /**
   * Get specific settings
   * @param {string|Array} keys - Key or array of keys to get
   * @returns {Promise<Object>} - Requested settings
   */
  async get(keys) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, (result) => {
        // If keys is a string, return just that value
        if (typeof keys === 'string') {
          resolve(result[keys] !== undefined ? result[keys] : this.defaults[keys]);
        } else {
          // Otherwise merge with defaults for any missing settings
          const settings = {};
          
          // If keys is an array, only include those keys
          if (Array.isArray(keys)) {
            keys.forEach(key => {
              settings[key] = result[key] !== undefined ? result[key] : this.defaults[key];
            });
          } else {
            // If keys is null or undefined, include all settings
            Object.keys(this.defaults).forEach(key => {
              settings[key] = result[key] !== undefined ? result[key] : this.defaults[key];
            });
          }
          
          resolve(settings);
        }
      });
    });
  }

  /**
   * Save settings
   * @param {Object} settings - Settings to save
   * @returns {Promise<void>} - Promise that resolves when settings are saved
   */
  async save(settings) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(settings, () => {
        resolve();
      });
    });
  }

  /**
   * Reset settings to defaults
   * @param {string|Array} keys - Key or array of keys to reset (if null, reset all)
   * @returns {Promise<void>} - Promise that resolves when settings are reset
   */
  async reset(keys = null) {
    const resetSettings = {};
    
    if (keys === null) {
      // Reset all settings
      Object.keys(this.defaults).forEach(key => {
        resetSettings[key] = this.defaults[key];
      });
    } else if (Array.isArray(keys)) {
      // Reset specific keys
      keys.forEach(key => {
        if (this.defaults[key] !== undefined) {
          resetSettings[key] = this.defaults[key];
        }
      });
    } else if (typeof keys === 'string') {
      // Reset a single key
      if (this.defaults[keys] !== undefined) {
        resetSettings[keys] = this.defaults[keys];
      }
    }
    
    return this.save(resetSettings);
  }

  /**
   * Get summary settings
   * @returns {Promise<Object>} - Summary settings
   */
  async getSummarySettings() {
    return this.get(['summaryType', 'summaryLength']);
  }

  /**
   * Get TTS settings
   * @returns {Promise<Object>} - TTS settings
   */
  async getTtsSettings() {
    return this.get(['ttsVoice', 'ttsRate', 'ttsPitch']);
  }

  /**
   * Save summary settings
   * @param {Object} settings - Summary settings to save
   * @returns {Promise<void>} - Promise that resolves when settings are saved
   */
  async saveSummarySettings(settings) {
    const validSettings = {};
    
    if (settings.summaryType !== undefined) {
      validSettings.summaryType = settings.summaryType;
    }
    
    if (settings.summaryLength !== undefined) {
      validSettings.summaryLength = settings.summaryLength;
    }
    
    return this.save(validSettings);
  }

  /**
   * Save TTS settings
   * @param {Object} settings - TTS settings to save
   * @returns {Promise<void>} - Promise that resolves when settings are saved
   */
  async saveTtsSettings(settings) {
    const validSettings = {};
    
    if (settings.ttsVoice !== undefined) {
      validSettings.ttsVoice = settings.ttsVoice;
    }
    
    if (settings.ttsRate !== undefined) {
      validSettings.ttsRate = parseFloat(settings.ttsRate);
    }
    
    if (settings.ttsPitch !== undefined) {
      validSettings.ttsPitch = parseFloat(settings.ttsPitch);
    }
    
    return this.save(validSettings);
  }
}

// Export as singleton
const settingsManager = new SettingsManager();
export default settingsManager;
