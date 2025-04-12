/**
 * TubeSumTalk Backend Server
 * Express.js server that communicates with the Gemini API
 */

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { generateSummary } = require("./api/gemini");

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
        console.log("Received request body:", req.body);

        const { videoId, transcript, title } = req.body;

        // More detailed validation
        if (!videoId) {
            console.error("Missing videoId in request");
            return res
                .status(400)
                .json({ error: "Missing videoId in request" });
        }

        if (!title) {
            console.error("Missing title in request");
            return res.status(400).json({ error: "Missing title in request" });
        }

        if (!transcript) {
            console.error("Missing transcript in request");
            return res
                .status(400)
                .json({ error: "Missing transcript in request" });
        }

        console.log("Processing request for video:", videoId);
        console.log("Title:", title);
        console.log("Transcript length:", transcript.length);

        const summary = await generateSummary(title, transcript);
        console.log("Summary generated successfully");

        return res.json({ summary });
    } catch (error) {
        console.error("Error generating summary:", error);
        return res
            .status(500)
            .json({ error: error.message || "Failed to generate summary" });
    }
});

app.get("/health", (_, res) => {
    res.json({ status: "ok" });
});

// Start server
app.listen(PORT, () => {
    console.log(`TubeSumTalk backend server running on port ${PORT}`);
});
