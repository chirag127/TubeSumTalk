import yt_dlp
import json
import logging
from typing import Dict, Optional, List, Any

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class YouTubeSubtitleExtractor:
    """Class to extract subtitles from YouTube videos using yt-dlp."""
    
    def __init__(self):
        """Initialize the subtitle extractor."""
        self.ydl_opts = {
            'skip_download': True,
            'writesubtitles': True,
            'writeautomaticsub': True,
            'subtitleslangs': ['en'],
            'subtitlesformat': 'json3',
            'quiet': True,
            'no_warnings': True,
        }
    
    def extract_video_info(self, video_url: str) -> Dict[str, Any]:
        """
        Extract video information including title and thumbnail.
        
        Args:
            video_url: YouTube video URL or ID
            
        Returns:
            Dictionary containing video information
        """
        # If only video ID is provided, construct the full URL
        if not video_url.startswith('http'):
            video_url = f'https://www.youtube.com/watch?v={video_url}'
            
        info_opts = {
            'skip_download': True,
            'quiet': True,
            'no_warnings': True,
        }
        
        try:
            with yt_dlp.YoutubeDL(info_opts) as ydl:
                info = ydl.extract_info(video_url, download=False)
                return {
                    'title': info.get('title', 'Unknown Title'),
                    'thumbnail': info.get('thumbnail', ''),
                    'duration': info.get('duration', 0),
                    'channel': info.get('channel', 'Unknown Channel'),
                    'video_id': info.get('id', '')
                }
        except Exception as e:
            logger.error(f"Error extracting video info: {str(e)}")
            return {
                'title': 'Unknown Title',
                'thumbnail': '',
                'duration': 0,
                'channel': 'Unknown Channel',
                'video_id': ''
            }
    
    def extract_subtitles(self, video_url: str) -> Optional[str]:
        """
        Extract subtitles from a YouTube video.
        
        Args:
            video_url: YouTube video URL or ID
            
        Returns:
            Extracted transcript as a string, or None if extraction fails
        """
        # If only video ID is provided, construct the full URL
        if not video_url.startswith('http'):
            video_url = f'https://www.youtube.com/watch?v={video_url}'
        
        try:
            subtitles_data = []
            
            def process_subtitles(info_dict):
                # Check if subtitles are available
                if info_dict.get('requested_subtitles') and 'en' in info_dict.get('requested_subtitles'):
                    # Get the subtitle file path
                    subtitle_file = info_dict['requested_subtitles']['en'].get('filepath', '')
                    if subtitle_file:
                        try:
                            with open(subtitle_file, 'r', encoding='utf-8') as f:
                                subtitle_data = json.load(f)
                                # Extract text from events
                                if 'events' in subtitle_data:
                                    for event in subtitle_data['events']:
                                        if 'segs' in event:
                                            for seg in event['segs']:
                                                if 'utf8' in seg:
                                                    subtitles_data.append(seg['utf8'])
                        except Exception as e:
                            logger.error(f"Error processing subtitle file: {str(e)}")
            
            # Configure yt-dlp to process subtitles
            ydl_opts = self.ydl_opts.copy()
            ydl_opts['postprocessor_hooks'] = [process_subtitles]
            
            # Extract subtitles
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([video_url])
            
            # Join all subtitle segments into a single string
            transcript = ' '.join(subtitles_data)
            
            # If no subtitles were found, return None
            if not transcript:
                logger.warning(f"No subtitles found for video: {video_url}")
                return None
                
            return transcript
            
        except Exception as e:
            logger.error(f"Error extracting subtitles: {str(e)}")
            return None
    
    def extract_subtitles_with_info(self, video_url: str) -> Dict[str, Any]:
        """
        Extract both subtitles and video information.
        
        Args:
            video_url: YouTube video URL or ID
            
        Returns:
            Dictionary containing video information and transcript
        """
        video_info = self.extract_video_info(video_url)
        transcript = self.extract_subtitles(video_url)
        
        return {
            **video_info,
            'transcript': transcript,
            'has_subtitles': transcript is not None
        }


# Example usage
if __name__ == "__main__":
    extractor = YouTubeSubtitleExtractor()
    result = extractor.extract_subtitles_with_info("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    print(f"Video Title: {result['title']}")
    print(f"Has Subtitles: {result['has_subtitles']}")
    if result['has_subtitles']:
        print(f"Transcript (first 100 chars): {result['transcript'][:100]}...")
