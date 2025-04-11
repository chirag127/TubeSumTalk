"""
TubeSumTalk Backend - FastAPI Server

This server provides an API for extracting subtitles from YouTube videos
and generating summaries using Gemini 2.0 Flash Lite.
"""

import os
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import logging

from utils.yt_subtitles import extract_subtitles
from utils.gemini_api import summarize_text

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(
    title="TubeSumTalk API",
    description="API for summarizing YouTube videos using Gemini 2.0 Flash Lite",
    version="1.0.0",
)

# Add CORS middleware to allow requests from the browser extension
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SummarizeRequest(BaseModel):
    video_id: str
    max_length: Optional[int] = 500

class SummarizeResponse(BaseModel):
    video_id: str
    summary: str
    transcript_available: bool
    error: Optional[str] = None

@app.get("/")
async def root():
    """Root endpoint to check if the API is running."""
    return {"message": "TubeSumTalk API is running"}

@app.post("/summarize", response_model=SummarizeResponse)
async def summarize_video(request: SummarizeRequest):
    """
    Summarize a YouTube video by extracting its subtitles and using Gemini 2.0 Flash Lite.
    
    Args:
        request: SummarizeRequest containing the video_id and optional max_length
        
    Returns:
        SummarizeResponse containing the summary and metadata
    """
    try:
        logger.info(f"Summarizing video: {request.video_id}")
        
        # Extract subtitles from YouTube video
        transcript_text, transcript_available = extract_subtitles(request.video_id)
        
        if not transcript_available:
            logger.warning(f"No transcript available for video: {request.video_id}")
            return SummarizeResponse(
                video_id=request.video_id,
                summary="No subtitles available for this video. Unable to generate summary.",
                transcript_available=False,
                error="No subtitles available"
            )
        
        # Generate summary using Gemini 2.0 Flash Lite
        summary = summarize_text(transcript_text, max_length=request.max_length)
        
        return SummarizeResponse(
            video_id=request.video_id,
            summary=summary,
            transcript_available=True
        )
    
    except Exception as e:
        logger.error(f"Error summarizing video {request.video_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
