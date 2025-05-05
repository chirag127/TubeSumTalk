/**
 * Gemini API Integration
 * Handles communication with the Gemini 2.5 Flash Preview API
 */

const { GoogleGenAI } = require("@google/genai");

/**
 * Generate a summary of a YouTube video transcript using Gemini 2.5 Flash Preview
 *
 * @param {string} title - The title of the video
 * @param {string} transcript - The transcript of the video
 * @param {string} summaryType - The type of summary to generate (bullet, brief, detailed, key-points, chapter)
 * @param {string} summaryLength - The length of the summary (short, medium, long)
 * @param {string} apiKey - The user's Gemini API key
 * @returns {Promise<string>} The generated summary
 */
async function generateSummary(
    title,
    transcript,
    summaryType = "bullet",
    summaryLength = "medium",
    apiKey
) {
    try {
        console.log("Generating summary for video:", title);

        // Check if API key is provided
        if (!apiKey) {
            throw new Error("API key is required");
        }

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
        const inputText = `You are provided the title and transcript of a Youtube video in triple quotes.

${promptInstructions}
${outputLength}

Format the output as markdown text.

Title: """${title}"""
Transcript: """${transcript}"""
`;

        // Initialize the Gemini API with the user's API key
        const ai = new GoogleGenAI({
            apiKey: apiKey,
        });

        const config = {
            responseMimeType: "text/plain",
        };

        const model = "gemini-2.5-flash-preview-04-17";

        const contents = [
            {
                role: "user",
                parts: [
                    {
                        text: inputText,
                    },
                ],
            },
        ];

        console.log("Sending request to Gemini API...");

        let fullResponse = "";
        const response = await ai.models.generateContentStream({
            model,
            config,
            contents,
        });

        for await (const chunk of response) {
            fullResponse += chunk.text;
        }

        console.log("Received response from Gemini API");
        return fullResponse;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // More detailed error message
        if (error.message && error.message.includes("API key")) {
            throw new Error(
                "Invalid Gemini API key. Please check your API key and try again."
            );
        } else {
            throw new Error(
                "Failed to generate summary: " +
                    (error.message || "Unknown error")
            );
        }
    }
}

/**
 * Generate an answer to a question about a YouTube video transcript using Gemini 2.5 Flash Preview
 *
 * @param {string} transcript - The transcript of the video
 * @param {string} question - The user's question about the video
 * @param {string} apiKey - The user's Gemini API key
 * @returns {Promise<string>} The generated answer
 */
async function generateAnswer(transcript, question, apiKey) {
    try {
        console.log("Generating answer for question:", question);

        // Check if API key is provided
        if (!apiKey) {
            throw new Error("API key is required");
        }

        // Create the prompt
        const inputText = `You are provided with a YouTube video transcript and a question about the video.
Please answer the question based only on the information in the transcript.
Format your answer as markdown text.

Question: """${question}"""
Transcript: """${transcript}"""
`;

        // Initialize the Gemini API with the user's API key
        const ai = new GoogleGenAI({
            apiKey: apiKey,
        });

        const config = {
            responseMimeType: "text/plain",
        };

        const model = "gemini-2.5-flash-preview-04-17";

        const contents = [
            {
                role: "user",
                parts: [
                    {
                        text: inputText,
                    },
                ],
            },
        ];

        console.log("Sending request to Gemini API...");

        let fullResponse = "";
        const response = await ai.models.generateContentStream({
            model,
            config,
            contents,
        });

        for await (const chunk of response) {
            fullResponse += chunk.text;
        }

        console.log("Received response from Gemini API");
        return fullResponse;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // More detailed error message
        if (error.message && error.message.includes("API key")) {
            throw new Error(
                "Invalid Gemini API key. Please check your API key and try again."
            );
        } else {
            throw new Error(
                "Failed to generate answer: " +
                    (error.message || "Unknown error")
            );
        }
    }
}

module.exports = {
    generateSummary,
    generateAnswer,
};
