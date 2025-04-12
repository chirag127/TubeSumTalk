const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

// Check if API key is provided
if (!process.env.GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set in environment variables');
}

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-lite",
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

/**
 * Generate a summary of a YouTube video transcript
 * @param {string} title - The title of the video
 * @param {string} transcript - The transcript of the video
 * @returns {Promise<string>} The generated summary
 */
async function generateSummary(title, transcript) {
  try {
    // Truncate transcript if it's too long (Gemini has token limits)
    const maxTranscriptLength = 30000;
    const truncatedTranscript = transcript.length > maxTranscriptLength 
      ? transcript.substring(0, maxTranscriptLength) + "... (transcript truncated due to length)"
      : transcript;

    const promptTemplate = `You are provided the title and transcript of a Youtube video in triple quotes.
Summarize the video transcript in 5 bullet points in English.
Title: """${title || 'Unknown Title'}"""
Transcript: """${truncatedTranscript}"""`;

    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(promptTemplate);
    return result.response.text();
  } catch (error) {
    console.error('Error in Gemini API:', error);
    throw new Error(`Failed to generate summary with Gemini API: ${error.message}`);
  }
}

module.exports = {
  generateSummary
};
