/**
 * Test script for TubeSumTalk backend
 * Tests the Gemini API integration with the Gemini 1.5 Flash model
 */

require("dotenv").config();
const { generateSummary, generateAnswer } = require("./api/gemini");

// Sample transcript
const transcript = `
In this video, I'm going to show you how to build a simple web application using HTML, CSS, and JavaScript.
First, we'll create the HTML structure for our application.
Then, we'll add some CSS to style our application.
Finally, we'll add JavaScript to make our application interactive.
Let's get started by creating a new HTML file called index.html.
In this file, we'll add the basic HTML structure.
Next, we'll create a CSS file called styles.css.
In this file, we'll add some basic styles for our application.
Finally, we'll create a JavaScript file called script.js.
In this file, we'll add some code to make our application interactive.
And that's it! We've created a simple web application using HTML, CSS, and JavaScript.
`;

// Sample title
const title = "How to Build a Simple Web Application";

// Sample API key (replace with your own)
const apiKey = process.env.TEST_API_KEY || "your_api_key_here";

// Test summary generation
async function testSummary() {
    try {
        console.log("Testing summary generation...");

        // Test different summary types and lengths
        const summaryTypes = [
            "bullet",
            "brief",
            "detailed",
            "key-points",
            "chapter",
        ];
        const summaryLengths = ["short", "medium", "long"];

        // Test one combination
        const summaryType = summaryTypes[0]; // bullet
        const summaryLength = summaryLengths[1]; // medium

        console.log(`Generating ${summaryLength} ${summaryType} summary...`);
        console.log("Using model: gemini-1.5-flash");

        const summary = await generateSummary(
            title,
            transcript,
            summaryType,
            summaryLength,
            apiKey
        );

        console.log("Summary generated successfully:");
        console.log(summary);

        if (!summary || summary.trim() === "") {
            throw new Error("Generated summary is empty");
        }

        return summary;
    } catch (error) {
        console.error("Error testing summary generation:", error);
        throw error;
    }
}

// Test Q&A
async function testQA() {
    try {
        console.log("\nTesting Q&A...");

        const question =
            "What files do we need to create for the web application?";

        console.log(`Asking question: "${question}"`);
        console.log("Using model: gemini-1.5-flash");

        const answer = await generateAnswer(transcript, question, apiKey);

        console.log("Answer generated successfully:");
        console.log(answer);

        if (!answer || answer.trim() === "") {
            throw new Error("Generated answer is empty");
        }

        return answer;
    } catch (error) {
        console.error("Error testing Q&A:", error);
        throw error;
    }
}

// Run tests
async function runTests() {
    if (apiKey === "your_api_key_here") {
        console.error(
            "Please set your API key in the TEST_API_KEY environment variable or in this file."
        );
        return;
    }

    console.log("Testing with Gemini 1.5 Flash model");
    console.log("API Key:", apiKey ? "Provided" : "Not provided");

    try {
        await testSummary();
        await testQA();
        console.log("\n✅ All tests completed successfully!");
    } catch (error) {
        console.error("\n❌ Tests failed:", error);
        process.exit(1);
    }
}

runTests();
