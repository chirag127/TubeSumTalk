/**
 * TubeSumTalk Backend Server
 * Express.js server that communicates with the Gemini API
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const {
    generateSummary,
    generateAnswer,
    generateSuggestedQuestions,
} = require("./api/gemini");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(
    cors({
        origin: "*", // Allow all origins for testing
        credentials: true,
    })
);

// Routes
app.post("/summarize", async (req, res) => {
    try {
        console.log("Received summarize request");

        const {
            videoId,
            transcript,
            title,
            summaryType = "bullet",
            summaryLength = "medium",
            apiKey,
        } = req.body;

        // Validate required fields
        if (!transcript) {
            console.error("Missing transcript in request");
            return res
                .status(400)
                .json({ error: "Missing transcript in request" });
        }

        if (!apiKey) {
            console.error("Missing API key in request");
            return res
                .status(400)
                .json({ error: "Missing API key in request" });
        }

        console.log("Processing request for video:", videoId);
        console.log("Title:", title);
        console.log("Transcript length:", transcript.length);
        console.log("Summary type:", summaryType);
        console.log("Summary length:", summaryLength);

        const summary = await generateSummary(
            title,
            transcript,
            summaryType,
            summaryLength,
            apiKey
        );
        console.log("Summary generated successfully");

        return res.json({ summary });
    } catch (error) {
        console.error("Error generating summary:", error);
        return res
            .status(500)
            .json({ error: error.message || "Failed to generate summary" });
    }
});

// Q&A endpoint
app.post("/ask", async (req, res) => {
    try {
        console.log("Received Q&A request");

        const { transcript, question, apiKey } = req.body;

        // Validate required fields
        if (!transcript) {
            console.error("Missing transcript in request");
            return res
                .status(400)
                .json({ error: "Missing transcript in request" });
        }

        if (!question) {
            console.error("Missing question in request");
            return res
                .status(400)
                .json({ error: "Missing question in request" });
        }

        if (!apiKey) {
            console.error("Missing API key in request");
            return res
                .status(400)
                .json({ error: "Missing API key in request" });
        }

        console.log("Processing question:", question);
        console.log("Transcript length:", transcript.length);

        const answer = await generateAnswer(transcript, question, apiKey);
        console.log("Answer generated successfully");

        return res.json({ answer });
    } catch (error) {
        console.error("Error generating answer:", error);
        return res
            .status(500)
            .json({ error: error.message || "Failed to generate answer" });
    }
});

// Suggested questions endpoint
app.post("/suggested-questions", async (req, res) => {
    try {
        console.log("Received suggested questions request");

        const { transcript, apiKey } = req.body;

        // Validate required fields
        if (!transcript) {
            console.error("Missing transcript in request");
            return res
                .status(400)
                .json({ error: "Missing transcript in request" });
        }

        if (!apiKey) {
            console.error("Missing API key in request");
            return res
                .status(400)
                .json({ error: "Missing API key in request" });
        }

        console.log("Transcript length:", transcript.length);

        const questions = await generateSuggestedQuestions(transcript, apiKey);
        console.log(
            "Suggested questions generated successfully:",
            questions.length
        );

        return res.json({ questions });
    } catch (error) {
        console.error("Error generating suggested questions:", error);
        return res
            .status(500)
            .json({
                error:
                    error.message || "Failed to generate suggested questions",
            });
    }
});

app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

// Start server
app.listen(PORT, () => {
    console.log(`TubeSumTalk backend server running on port ${PORT}`);
});
