/**
 * /transcript/:videoId route: Returns raw transcript for a YouTube video.
 */
const express = require('express');
const router = express.Router();
const ytdlpService = require('../services/ytdlpService');

router.get('/:videoId', async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    return res.status(400).json({ error: 'Missing videoId' });
  }
  try {
    const transcript = await ytdlpService.fetchTranscript(videoId);
    res.json({ transcript });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Transcript fetch failed' });
  }
});

module.exports = router;