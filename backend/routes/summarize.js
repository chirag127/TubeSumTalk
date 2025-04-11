/**
 * /summarize route: Accepts { videoId } and returns AI-generated summary.
 */
const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const ytdlpService = require('../services/ytdlpService');

router.post('/', async (req, res) => {
  const { videoId } = req.body;
  if (!videoId) {
    return res.status(400).json({ error: 'Missing videoId' });
  }
  try {
    const transcript = await ytdlpService.fetchTranscript(videoId);
    const summary = await geminiService.summarizeTranscript(transcript);
    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Summarization failed' });
  }
});

module.exports = router;