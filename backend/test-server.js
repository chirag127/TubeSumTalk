/**
 * Test script for TubeSumTalk backend server
 * Tests the server endpoints with sample data
 */

const fetch = require('node-fetch');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:8000';
const API_KEY = process.env.TEST_API_KEY || 'your_api_key_here';

// Sample data
const sampleData = {
    videoId: 'sample123',
    title: 'How to Build a Simple Web Application',
    transcript: `
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
    `,
    summaryType: 'bullet',
    summaryLength: 'medium',
    question: 'What files do we need to create for the web application?'
};

// Test health endpoint
async function testHealth() {
    try {
        console.log(`Testing health endpoint at ${API_BASE_URL}/health...`);
        
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        
        console.log('Health check response:', data);
        
        if (response.ok && data.status === 'ok') {
            console.log('✅ Health check passed');
            return true;
        } else {
            console.error('❌ Health check failed');
            return false;
        }
    } catch (error) {
        console.error('Error testing health endpoint:', error);
        return false;
    }
}

// Test summarize endpoint
async function testSummarize() {
    try {
        console.log(`\nTesting summarize endpoint at ${API_BASE_URL}/summarize...`);
        
        const response = await fetch(`${API_BASE_URL}/summarize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                videoId: sampleData.videoId,
                transcript: sampleData.transcript,
                title: sampleData.title,
                summaryType: sampleData.summaryType,
                summaryLength: sampleData.summaryLength,
                apiKey: API_KEY
            })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            console.error('❌ Summarize test failed');
            return false;
        }
        
        const data = await response.json();
        console.log('Summary response:', data.summary ? 'Received summary' : 'No summary');
        
        if (data.summary) {
            console.log('Summary excerpt:', data.summary.substring(0, 100) + '...');
            console.log('✅ Summarize test passed');
            return true;
        } else {
            console.error('❌ Summarize test failed - No summary returned');
            return false;
        }
    } catch (error) {
        console.error('Error testing summarize endpoint:', error);
        return false;
    }
}

// Test ask endpoint
async function testAsk() {
    try {
        console.log(`\nTesting ask endpoint at ${API_BASE_URL}/ask...`);
        
        const response = await fetch(`${API_BASE_URL}/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                transcript: sampleData.transcript,
                question: sampleData.question,
                apiKey: API_KEY
            })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            console.error('❌ Ask test failed');
            return false;
        }
        
        const data = await response.json();
        console.log('Answer response:', data.answer ? 'Received answer' : 'No answer');
        
        if (data.answer) {
            console.log('Answer excerpt:', data.answer.substring(0, 100) + '...');
            console.log('✅ Ask test passed');
            return true;
        } else {
            console.error('❌ Ask test failed - No answer returned');
            return false;
        }
    } catch (error) {
        console.error('Error testing ask endpoint:', error);
        return false;
    }
}

// Run all tests
async function runTests() {
    console.log('🧪 Starting TubeSumTalk backend server tests');
    console.log('API Base URL:', API_BASE_URL);
    console.log('API Key:', API_KEY ? 'Provided' : 'Not provided');
    
    if (API_KEY === 'your_api_key_here') {
        console.error('⚠️ Please set your API key in the TEST_API_KEY environment variable or in this file.');
        process.exit(1);
    }
    
    let allPassed = true;
    
    // Test health endpoint
    const healthPassed = await testHealth();
    allPassed = allPassed && healthPassed;
    
    // Test summarize endpoint
    const summarizePassed = await testSummarize();
    allPassed = allPassed && summarizePassed;
    
    // Test ask endpoint
    const askPassed = await testAsk();
    allPassed = allPassed && askPassed;
    
    // Print summary
    console.log('\n📋 Test Summary:');
    console.log(`Health Check: ${healthPassed ? '✅ Passed' : '❌ Failed'}`);
    console.log(`Summarize: ${summarizePassed ? '✅ Passed' : '❌ Failed'}`);
    console.log(`Ask: ${askPassed ? '✅ Passed' : '❌ Failed'}`);
    console.log(`Overall: ${allPassed ? '✅ All tests passed' : '❌ Some tests failed'}`);
    
    // Exit with appropriate code
    process.exit(allPassed ? 0 : 1);
}

// Run the tests
runTests();
