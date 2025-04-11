/**
 * Express.js server for YouTube Video Summarizer + Read Aloud Sidebar
 * Handles /summarize and /transcript endpoints.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const summarizeRoute = require('./routes/summarize');
const transcriptRoute = require('./routes/transcript');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/summarize', summarizeRoute);
app.use('/transcript', transcriptRoute);

app.get('/', (req, res) => {
  res.send('YouTube Video Summarizer Backend is running.');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});