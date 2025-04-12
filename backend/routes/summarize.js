const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');

/**
 * POST /api/summarize
 * Summarizes a YouTube video transcript
 * 
 * Request body:
 * {
 *   videoId: string,
 *   title: string,
 *   transcript: string
 * }
 * 
 * Response:
 * {
 *   summary: string
 * }
 */
router.post('/summarize', async (req, res, next) => {
  try {
    const { videoId, title, transcript } = req.body;
    
    if (!videoId || !transcript) {
      return res.status(400).json({ 
        error: 'VideoId and transcript are required',
        details: 'Please provide both the YouTube video ID and its transcript'
      });
    }

    console.log(`Generating summary for video: ${videoId}`);
    const summary = await geminiService.generateSummary(title, transcript);
    
    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    
    if (error.message.includes('API key')) {
      return res.status(401).json({ error: 'API key error', details: error.message });
    }
    
    next(error);
  }
});

module.exports = router;
