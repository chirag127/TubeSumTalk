from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import logging
import os
import time
from dotenv import load_dotenv

# Import custom modules
from utils.yt_subtitles import YouTubeSubtitleExtractor
from utils.gemini_api import GeminiSummarizer

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="TubeSumTalk API",
    description="API for summarizing YouTube videos and reading them aloud",
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

# Initialize the YouTube subtitle extractor and Gemini summarizer
subtitle_extractor = YouTubeSubtitleExtractor()
summarizer = GeminiSummarizer()

# Define request models
class SummarizeRequest(BaseModel):
    video_url: str = Field(..., description="YouTube video URL or video ID")


# Define response models
class SummarizeResponse(BaseModel):
    video_id: str = Field(..., description="YouTube video ID")
    title: str = Field(..., description="Video title")
    thumbnail: str = Field(..., description="Video thumbnail URL")
    channel: str = Field(..., description="Channel name")
    summary: Optional[str] = Field(None, description="Video summary")
    error: Optional[str] = Field(None, description="Error message if any")


@app.get("/")
async def root():
    """Root endpoint to check if the API is running."""
    return {"message": "TubeSumTalk API is running"}


@app.post("/summarize", response_model=SummarizeResponse)
async def summarize_video(request: SummarizeRequest):
    """
    Summarize a YouTube video.
    
    Args:
        request: SummarizeRequest containing the video URL or ID
        
    Returns:
        SummarizeResponse containing the video information and summary
    """
    video_url = request.video_url
    
    try:
        # Log the request
        logger.info(f"Received summarization request for video: {video_url}")
        
        # Start timing
        start_time = time.time()
        
        # Extract video information and subtitles
        logger.info("Extracting video information and subtitles...")
        video_data = subtitle_extractor.extract_subtitles_with_info(video_url)
        
        # Check if subtitles were found
        if not video_data.get('has_subtitles'):
            logger.warning(f"No subtitles found for video: {video_url}")
            return SummarizeResponse(
                video_id=video_data.get('video_id', ''),
                title=video_data.get('title', 'Unknown Title'),
                thumbnail=video_data.get('thumbnail', ''),
                channel=video_data.get('channel', 'Unknown Channel'),
                error="No subtitles found for this video"
            )
        
        # Generate summary using Gemini
        logger.info("Generating summary...")
        transcript = video_data.get('transcript', '')
        summary = summarizer.summarize_transcript(transcript, video_data)
        
        # Calculate elapsed time
        elapsed_time = time.time() - start_time
        logger.info(f"Summarization completed in {elapsed_time:.2f} seconds")
        
        # Return the response
        return SummarizeResponse(
            video_id=video_data.get('video_id', ''),
            title=video_data.get('title', 'Unknown Title'),
            thumbnail=video_data.get('thumbnail', ''),
            channel=video_data.get('channel', 'Unknown Channel'),
            summary=summary
        )
        
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware to log all requests."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"Request {request.method} {request.url.path} processed in {process_time:.4f} seconds")
    return response


if __name__ == "__main__":
    import uvicorn
    
    # Get port from environment variable or use default
    port = int(os.getenv("PORT", 8000))
    
    # Run the FastAPI app
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
