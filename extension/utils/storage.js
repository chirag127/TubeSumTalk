/**
 * Storage Utility Module
 * Handles storage of user preferences and data
 */

class StorageService {
  /**
   * Get a value from storage
   * @param {string|Array} keys - Key or array of keys to get
   * @returns {Promise<Object>} - Object with requested values
   */
  async get(keys) {
    return new Promise((resolve) => {
      chrome.storage.sync.get(keys, (result) => {
        resolve(result);
      });
    });
  }

  /**
   * Set values in storage
   * @param {Object} items - Object with key-value pairs to set
   * @returns {Promise<void>} - Promise that resolves when values are set
   */
  async set(items) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(items, () => {
        resolve();
      });
    });
  }

  /**
   * Remove values from storage
   * @param {string|Array} keys - Key or array of keys to remove
   * @returns {Promise<void>} - Promise that resolves when values are removed
   */
  async remove(keys) {
    return new Promise((resolve) => {
      chrome.storage.sync.remove(keys, () => {
        resolve();
      });
    });
  }

  /**
   * Clear all values from storage
   * @returns {Promise<void>} - Promise that resolves when storage is cleared
   */
  async clear() {
    return new Promise((resolve) => {
      chrome.storage.sync.clear(() => {
        resolve();
      });
    });
  }

  /**
   * Get all values from storage
   * @returns {Promise<Object>} - Object with all values
   */
  async getAll() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(null, (result) => {
        resolve(result);
      });
    });
  }

  /**
   * Get user preferences
   * @returns {Promise<Object>} - Object with user preferences
   */
  async getPreferences() {
    return this.get([
      'summaryType',
      'summaryLength',
      'ttsVoice',
      'ttsRate',
      'ttsPitch'
    ]).then(result => {
      return {
        summaryType: result.summaryType || 'bullet',
        summaryLength: result.summaryLength || 'medium',
        ttsVoice: result.ttsVoice || 'default',
        ttsRate: result.ttsRate || 1.0,
        ttsPitch: result.ttsPitch || 1.0
      };
    });
  }

  /**
   * Save user preferences
   * @param {Object} preferences - Object with user preferences
   * @returns {Promise<void>} - Promise that resolves when preferences are saved
   */
  async savePreferences(preferences) {
    return this.set({
      summaryType: preferences.summaryType,
      summaryLength: preferences.summaryLength,
      ttsVoice: preferences.ttsVoice,
      ttsRate: preferences.ttsRate,
      ttsPitch: preferences.ttsPitch
    });
  }
}

// Export as singleton
const storageService = new StorageService();
export default storageService;
