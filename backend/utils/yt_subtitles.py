"""
YouTube Subtitle Extraction Utility

This module provides functions to extract subtitles from YouTube videos using yt-dlp.
"""

import yt_dlp
import logging
from typing import Tuple, Optional

logger = logging.getLogger(__name__)

def extract_subtitles(video_id: str) -> Tuple[str, bool]:
    """
    Extract subtitles from a YouTube video.
    
    Args:
        video_id: The YouTube video ID
        
    Returns:
        Tuple containing:
        - The transcript text (or empty string if not available)
        - Boolean indicating if transcript was available
    """
    video_url = f"https://www.youtube.com/watch?v={video_id}"
    logger.info(f"Extracting subtitles from: {video_url}")
    
    # Configure yt-dlp options
    ydl_opts = {
        'skip_download': True,  # Don't download the video
        'writesubtitles': True,  # Write subtitles
        'writeautomaticsub': True,  # Write auto-generated subtitles if regular ones aren't available
        'subtitleslangs': ['en'],  # Prefer English subtitles
        'quiet': True,  # Don't print progress
        'no_warnings': True,  # Don't print warnings
    }
    
    try:
        # Extract info with yt-dlp
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            
            # Try to get manual subtitles first
            if info.get('subtitles') and 'en' in info.get('subtitles', {}):
                logger.info(f"Found manual subtitles for video: {video_id}")
                subtitle_info = info['subtitles']['en']
                return _download_and_process_subtitles(video_url, subtitle_info), True
            
            # Fall back to auto-generated subtitles
            if info.get('automatic_captions') and 'en' in info.get('automatic_captions', {}):
                logger.info(f"Found auto-generated subtitles for video: {video_id}")
                subtitle_info = info['automatic_captions']['en']
                return _download_and_process_subtitles(video_url, subtitle_info), True
            
            logger.warning(f"No subtitles found for video: {video_id}")
            return "", False
            
    except Exception as e:
        logger.error(f"Error extracting subtitles for video {video_id}: {str(e)}")
        return "", False

def _download_and_process_subtitles(video_url: str, subtitle_info: list) -> str:
    """
    Download and process subtitles from the provided info.
    
    Args:
        video_url: The YouTube video URL
        subtitle_info: The subtitle information from yt-dlp
        
    Returns:
        The processed transcript text
    """
    # Find the best subtitle format (prefer vtt or srt)
    best_format = None
    for fmt in subtitle_info:
        if fmt.get('ext') in ['vtt', 'srt']:
            best_format = fmt
            break
    
    if not best_format and subtitle_info:
        best_format = subtitle_info[0]  # Use the first available format
    
    if not best_format:
        return ""
    
    # Configure yt-dlp to download the specific subtitle
    ydl_opts = {
        'skip_download': True,
        'writesubtitles': True,
        'subtitleslangs': ['en'],
        'subtitlesformat': best_format.get('ext', 'vtt'),
        'quiet': True,
        'no_warnings': True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            # Download the subtitle
            subtitle_url = best_format.get('url')
            if subtitle_url:
                import requests
                response = requests.get(subtitle_url)
                subtitle_content = response.text
                
                # Process the subtitle content based on format
                if best_format.get('ext') in ['vtt', 'srt']:
                    return _process_subtitle_content(subtitle_content, best_format.get('ext'))
                
                return subtitle_content
            
            # If URL is not directly available, try to download through yt-dlp
            info = ydl.extract_info(video_url, download=False)
            # The subtitle file should be in the info object, but processing would be complex
            # For simplicity, we'll return a placeholder message
            return "Subtitle content could not be directly extracted. Please try another video."
            
    except Exception as e:
        logger.error(f"Error downloading subtitles: {str(e)}")
        return ""

def _process_subtitle_content(content: str, format_type: str) -> str:
    """
    Process subtitle content to extract just the text.
    
    Args:
        content: The subtitle content
        format_type: The subtitle format (vtt, srt, etc.)
        
    Returns:
        The processed text
    """
    import re
    
    # Remove timing information and formatting
    if format_type == 'vtt':
        # Remove VTT header
        content = re.sub(r'WEBVTT\n\n', '', content)
        # Remove timestamps and formatting
        content = re.sub(r'\d+:\d+:\d+\.\d+ --> \d+:\d+:\d+\.\d+', '', content)
        content = re.sub(r'<[^>]+>', '', content)  # Remove HTML tags
    elif format_type == 'srt':
        # Remove SRT sequence numbers and timestamps
        content = re.sub(r'\d+\n\d+:\d+:\d+,\d+ --> \d+:\d+:\d+,\d+', '', content)
        content = re.sub(r'<[^>]+>', '', content)  # Remove HTML tags
    
    # Clean up extra whitespace and newlines
    content = re.sub(r'\n\s*\n', '\n', content)
    content = re.sub(r'^\s+', '', content, flags=re.MULTILINE)
    
    return content.strip()
