/**
 * Gemini API Integration
 * Handles communication with the Gemini API
 */

const { GoogleGenAI } = require("@google/genai");

/**
 * Generate a summary of a YouTube video transcript using Gemini API
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

        // Configuration for the Gemini API
        const config = {
            // Note: responseMimeType is not supported in Gemini 2.0 Flash Lite
            // We'll handle the response formatting in our code
        };

        // Use the latest Gemini model
        // Using gemini-1.5-flash for better performance and reliability
        const model = "gemini-1.5-flash";

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

        console.log("Sending request to Gemini API using model:", model);

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

        // Ensure the response is properly formatted
        if (!fullResponse || fullResponse.trim() === "") {
            throw new Error("Received empty response from Gemini API");
        }

        return fullResponse;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // More detailed error message
        if (error.message && error.message.includes("API key")) {
            throw new Error(
                "Invalid Gemini API key. Please check your API key and try again."
            );
        } else if (error.message && error.message.includes("404")) {
            throw new Error(
                "Model not found. The Gemini model may be unavailable or incorrect. Please check your API key permissions."
            );
        } else if (error.message && error.message.includes("429")) {
            throw new Error(
                "Rate limit exceeded. Please try again later or check your API quota."
            );
        } else if (error.message && error.message.includes("400")) {
            throw new Error(
                "Bad request. The transcript might be too long or contain invalid characters."
            );
        } else {
            console.error("Detailed error:", error);
            throw new Error(
                "Failed to generate summary: " +
                    (error.message || "Unknown error")
            );
        }
    }
}

/**
 * Generate an answer to a question about a YouTube video transcript using Gemini API
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
If the transcript doesn't contain information to answer the question, clearly state that.

Question: """${question}"""
Transcript: """${transcript}"""
`;

        // Initialize the Gemini API with the user's API key
        const ai = new GoogleGenAI({
            apiKey: apiKey,
        });

        // Configuration for the Gemini API
        const config = {
            // Note: responseMimeType is not supported in Gemini 2.0 Flash Lite
            // We'll handle the response formatting in our code
        };

        // Use the latest Gemini model
        // Using gemini-1.5-flash for better performance and reliability
        const model = "gemini-1.5-flash";

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

        console.log("Sending request to Gemini API using model:", model);

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

        // Ensure the response is properly formatted
        if (!fullResponse || fullResponse.trim() === "") {
            throw new Error("Received empty response from Gemini API");
        }

        return fullResponse;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        // More detailed error message
        if (error.message && error.message.includes("API key")) {
            throw new Error(
                "Invalid Gemini API key. Please check your API key and try again."
            );
        } else if (error.message && error.message.includes("404")) {
            throw new Error(
                "Model not found. The Gemini model may be unavailable or incorrect. Please check your API key permissions."
            );
        } else if (error.message && error.message.includes("429")) {
            throw new Error(
                "Rate limit exceeded. Please try again later or check your API quota."
            );
        } else if (error.message && error.message.includes("400")) {
            throw new Error(
                "Bad request. The question or transcript might contain invalid characters."
            );
        } else {
            console.error("Detailed error:", error);
            throw new Error(
                "Failed to generate answer: " +
                    (error.message || "Unknown error")
            );
        }
    }
}

/**
 * Generate suggested questions about a YouTube video transcript using Gemini API
 *
 * @param {string} transcript - The transcript of the video
 * @param {string} apiKey - The user's Gemini API key
 * @returns {Promise<string[]>} The generated suggested questions
 */
async function generateSuggestedQuestions(transcript, apiKey) {
    try {
        console.log("Generating suggested questions for video transcript");

        // Check if API key is provided
        if (!apiKey) {
            throw new Error("API key is required");
        }

        // Create the prompt
        const inputText = `You are provided with a YouTube video transcript.
Please generate 3-5 interesting and relevant questions that a viewer might want to ask about this video content.
The questions should be diverse and cover different aspects of the content.
Format your response as a JSON array of strings, with each string being a question.
Example format: ["Question 1?", "Question 2?", "Question 3?"]

Transcript: """${transcript}"""
`;

        // Initialize the Gemini API with the user's API key
        const ai = new GoogleGenAI({
            apiKey: apiKey,
        });

        // Configuration for the Gemini API
        const config = {
            // Note: responseMimeType is not supported in Gemini 2.0 Flash Lite
            // We'll handle the response formatting in our code
        };

        // Use the latest Gemini model
        // Using gemini-1.5-flash for better performance and reliability
        const model = "gemini-1.5-flash";

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

        console.log("Sending request to Gemini API using model:", model);

        let fullResponse = "";
        const response = await ai.models.generateContentStream({
            model,
            config,
            contents,
        });

        // Process the response stream directly, matching the pattern used in generateAnswer
        for await (const chunk of response) {
            fullResponse += chunk.text;
        }

        console.log("Received response from Gemini API");

        // Ensure the response is not empty
        if (!fullResponse || fullResponse.trim() === "") {
            throw new Error("Received empty response from Gemini API");
        }

        // Parse the response as JSON
        try {
            // Clean up the response to ensure it's valid JSON
            let cleanedResponse = fullResponse.trim();

            // If the response is wrapped in ```json and ```, remove them
            if (cleanedResponse.startsWith("```json")) {
                cleanedResponse = cleanedResponse.replace(
                    /```json\n|\n```/g,
                    ""
                );
            } else if (cleanedResponse.startsWith("```")) {
                cleanedResponse = cleanedResponse.replace(/```\n|\n```/g, "");
            }

            // Parse the JSON
            let questions;
            try {
                questions = JSON.parse(cleanedResponse);
            } catch (jsonError) {
                console.error("JSON parse error:", jsonError);
                console.log("Attempted to parse:", cleanedResponse);
                throw new Error(
                    "Failed to parse JSON response: " + jsonError.message
                );
            }

            // Ensure we have an array of strings
            if (Array.isArray(questions) && questions.length > 0) {
                return questions;
            } else {
                console.error("Invalid questions format:", questions);
                throw new Error(
                    "Invalid response format - expected array of questions"
                );
            }
        } catch (parseError) {
            console.error("Error parsing suggested questions:", parseError);
            console.log("Full response:", fullResponse);

            // Fallback 1: Try to extract questions using regex if JSON parsing fails
            try {
                // Look for questions in quotes or numbered lists
                const questionRegex = /"([^"]+\?)"|\d+\.\s+(.+\?)/g;
                const matches = [...fullResponse.matchAll(questionRegex)];

                if (matches.length > 0) {
                    console.log(
                        "Extracted questions using regex:",
                        matches.length
                    );
                    return matches.map((match) => match[1] || match[2]);
                }

                // Try another pattern - look for any sentence ending with a question mark
                const simpleQuestionRegex = /([^.!?]+\?)/g;
                const simpleMatches = [
                    ...fullResponse.matchAll(simpleQuestionRegex),
                ];

                if (simpleMatches.length > 0) {
                    console.log(
                        "Extracted questions using simple regex:",
                        simpleMatches.length
                    );
                    return simpleMatches
                        .map((match) => match[1].trim())
                        .filter((q) => q.length > 10);
                }
            } catch (regexError) {
                console.error(
                    "Error extracting questions with regex:",
                    regexError
                );
            }

            // If all else fails, return a default set of questions
            console.log("Using default questions as fallback");
            return [
                "What are the main topics covered in this video?",
                "What are the key points discussed in this video?",
                "Can you summarize the main arguments presented?",
                "What evidence is provided to support the claims in this video?",
                "What conclusions does the video reach?",
            ];
        }

        // This line should never be reached due to the return statements above,
        // but we'll keep it as an extra safeguard
        console.log(
            "Warning: Reached end of function without returning questions"
        );
        return fullResponse;
    } catch (error) {
        console.error(
            "Error calling Gemini API for suggested questions:",
            error
        );
        // More detailed error message
        if (error.message && error.message.includes("API key")) {
            throw new Error(
                "Invalid Gemini API key. Please check your API key and try again."
            );
        } else if (error.message && error.message.includes("404")) {
            throw new Error(
                "Model not found. The Gemini model may be unavailable or incorrect. Please check your API key permissions."
            );
        } else if (error.message && error.message.includes("429")) {
            throw new Error(
                "Rate limit exceeded. Please try again later or check your API quota."
            );
        } else if (error.message && error.message.includes("400")) {
            throw new Error(
                "Bad request. The transcript might be too long or contain invalid characters."
            );
        } else {
            console.error("Detailed error:", error);
            throw new Error(
                "Failed to generate suggested questions: " +
                    (error.message || "Unknown error")
            );
        }
    }
}

module.exports = {
    generateSummary,
    generateAnswer,
    generateSuggestedQuestions,
};
