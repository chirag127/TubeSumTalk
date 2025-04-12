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
 * @param {string} summaryType - The type of summary to generate (bullet, brief, detailed, key-points, chapter)
 * @param {string} summaryLength - The length of the summary (short, medium, long)
 * @returns {Promise<string>} The generated summary
 */
async function generateSummary(
    title,
    transcript,
    summaryType = "bullet",
    summaryLength = "medium"
) {
    try {
        console.log("Generating summary for video:", title);
        console.log("gemini api key:", process.env.GEMINI_API_KEY);

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

        // Create the prompt based on summary type and length
        let promptInstructions = "";
        let outputLength = "";

        // Determine output format based on summary type
        switch (summaryType) {
            case "brief":
                promptInstructions =
                    "Create a brief summary of the video in paragraph form.";
                break;
            case "detailed":
                promptInstructions =
                    "Create a detailed summary of the video covering all main points discussed.";
                break;
            case "key-points":
                promptInstructions =
                    "Extract the key points from the video in a numbered list format.";
                break;
            case "chapter":
                promptInstructions =
                    "Create chapter markers with timestamps and brief descriptions for the main sections of the video.";
                break;
            case "bullet":
            default:
                promptInstructions =
                    "Summarize the video transcript in bullet points.";
                break;
        }

        // Determine output length
        switch (summaryLength) {
            case "short":
                outputLength =
                    "Keep the summary concise, around 3-5 points or 1-2 paragraphs.";
                break;
            case "long":
                outputLength =
                    "Provide a comprehensive summary with 8-10 points or 4-5 paragraphs.";
                break;
            case "medium":
            default:
                outputLength =
                    "Aim for a medium-length summary with 5-7 points or 2-3 paragraphs.";
                break;
        }

        // Create the prompt
        const prompt = `You are provided the title and transcript of a Youtube video in triple quotes.

${promptInstructions}
${outputLength}

Format the output as markdown text.

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
