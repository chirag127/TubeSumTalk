/**
 * Gemini API Integration
 * Handles communication with the Gemini 2.0 Flash Lite API
 */

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize the Google Generative AI with API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate a summary of a YouTube video transcript using Gemini 2.0 Flash Lite
 *
 * @param {string} title - The title of the video
 * @param {string} transcript - The transcript of the video
 * @returns {Promise<string>} The generated summary
 */
async function generateSummary(title, transcript) {
    try {
        // Check if API key is set
        if (!process.env.GEMINI_API_KEY) {
            throw new Error(
                "GEMINI_API_KEY is not set in environment variables"
            );
        }

        console.log("Creating Gemini model...");
        // Create the model
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-lite",
        });

        // Create the prompt
        const prompt = `You are provided the title and transcript of a Youtube video in triple quotes.
Summarize the video transcript in 5 bullet points.
Title: """${title}"""
Transcript: """${transcript}"""
`;

        // Generate the summary
        const generationConfig = {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 1024,
        };

        console.log("Sending request to Gemini API...");
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig,
        });

        console.log("Received response from Gemini API");
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // More detailed error message
        if (error.message && error.message.includes("API key")) {
            throw new Error(
                "Invalid or missing Gemini API key. Please check your environment variables."
            );
        } else {
            throw new Error(
                "Failed to generate summary: " +
                    (error.message || "Unknown error")
            );
        }
    }
}

module.exports = {
    generateSummary,
};
