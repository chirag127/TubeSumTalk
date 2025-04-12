/**
 * API Utility Module
 * Handles all API communication for the extension
 */

class ApiService {
  constructor(baseUrl = 'https://tubesumtalk.onrender.com') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get summary for a YouTube video
   * @param {string} videoId - YouTube video ID
   * @param {string} transcript - Video transcript
   * @param {string} title - Video title
   * @param {string} summaryType - Type of summary (brief, detailed, bullet)
   * @param {string} summaryLength - Length of summary (short, medium, long)
   * @returns {Promise<string>} - Markdown formatted summary
   */
  async getSummary(videoId, transcript, title, summaryType = 'bullet', summaryLength = 'medium') {
    try {
      console.log(`Sending request to backend API at ${this.baseUrl}/summarize`);
      console.log('Request data:', {
        videoId,
        title,
        transcriptLength: transcript.length,
        summaryType,
        summaryLength,
      });

      const response = await fetch(`${this.baseUrl}/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId,
          transcript,
          title,
          summaryType,
          summaryLength,
        }),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        let errorMessage = `API error: ${response.status}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Received summary from API');

      return data.summary;
    } catch (error) {
      console.error('Error calling API:', error);
      throw error;
    }
  }
}

// Export as singleton
const apiService = new ApiService();
export default apiService;
