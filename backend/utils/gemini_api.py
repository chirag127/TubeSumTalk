import os
import logging
import google.generativeai as genai
from typing import Dict, Optional, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiSummarizer:
    """Class to interact with Gemini 2.0 Flash Lite API for summarization."""
    
    def __init__(self):
        """Initialize the Gemini API client."""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.warning("GEMINI_API_KEY not found in environment variables")
            
        # Configure the Gemini API
        genai.configure(api_key=api_key)
        
        # Set the model configuration
        self.model = genai.GenerativeModel(
            model_name="gemini-2.0-flash-lite",
            generation_config={
                "temperature": 0.2,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 4096,
                "response_mime_type": "text/plain",
            }
        )
    
    def chunk_text(self, text: str, max_chunk_size: int = 30000) -> list:
        """
        Split text into chunks to handle long transcripts.
        
        Args:
            text: The text to chunk
            max_chunk_size: Maximum size of each chunk in characters
            
        Returns:
            List of text chunks
        """
        if not text:
            return []
            
        # Split by sentences to avoid cutting in the middle of a sentence
        sentences = text.replace('. ', '.|').split('|')
        
        chunks = []
        current_chunk = ""
        
        for sentence in sentences:
            # If adding this sentence would exceed the max chunk size, start a new chunk
            if len(current_chunk) + len(sentence) > max_chunk_size and current_chunk:
                chunks.append(current_chunk)
                current_chunk = sentence
            else:
                current_chunk += sentence
        
        # Add the last chunk if it's not empty
        if current_chunk:
            chunks.append(current_chunk)
            
        return chunks
    
    def summarize_transcript(self, transcript: str, video_info: Dict[str, Any]) -> Optional[str]:
        """
        Summarize a YouTube video transcript using Gemini 2.0 Flash Lite.
        
        Args:
            transcript: The video transcript text
            video_info: Dictionary containing video metadata
            
        Returns:
            Summarized text or None if summarization fails
        """
        if not transcript:
            logger.error("No transcript provided for summarization")
            return None
            
        try:
            # Chunk the transcript if it's too long
            chunks = self.chunk_text(transcript)
            
            if not chunks:
                logger.error("Failed to chunk transcript")
                return None
                
            # If there's only one chunk, summarize it directly
            if len(chunks) == 1:
                return self._generate_summary(chunks[0], video_info)
                
            # If there are multiple chunks, summarize each chunk and then combine
            chunk_summaries = []
            for i, chunk in enumerate(chunks):
                logger.info(f"Summarizing chunk {i+1}/{len(chunks)}")
                chunk_summary = self._generate_summary(
                    chunk, 
                    video_info,
                    is_chunk=True,
                    chunk_info=f"Part {i+1} of {len(chunks)}"
                )
                if chunk_summary:
                    chunk_summaries.append(chunk_summary)
            
            # Combine chunk summaries and generate a final summary
            if chunk_summaries:
                combined_text = "\n\n".join(chunk_summaries)
                return self._generate_final_summary(combined_text, video_info)
            
            return None
            
        except Exception as e:
            logger.error(f"Error during summarization: {str(e)}")
            return None
    
    def _generate_summary(self, text: str, video_info: Dict[str, Any], is_chunk: bool = False, chunk_info: str = "") -> Optional[str]:
        """
        Generate a summary for a text chunk using Gemini.
        
        Args:
            text: The text to summarize
            video_info: Dictionary containing video metadata
            is_chunk: Whether this is a chunk of a larger transcript
            chunk_info: Information about the chunk (e.g., "Part 1 of 3")
            
        Returns:
            Summary text or None if generation fails
        """
        try:
            # Create the prompt
            title = video_info.get('title', 'Unknown Video')
            channel = video_info.get('channel', 'Unknown Channel')
            
            chunk_context = f" for {chunk_info}" if is_chunk else ""
            
            prompt = f"""
            You are an expert YouTube video summarizer. Your task is to create a concise, informative summary{chunk_context} of the following YouTube video transcript.
            
            Video Title: {title}
            Channel: {channel}
            
            Transcript:
            {text}
            
            Please provide a clear, well-structured summary that captures the main points, key insights, and important details from the video.
            The summary should be comprehensive yet concise, focusing on the most valuable information.
            Use bullet points where appropriate to organize information.
            
            Summary:
            """
            
            # Generate the summary
            response = self.model.generate_content(prompt)
            
            if response and hasattr(response, 'text'):
                return response.text.strip()
            return None
            
        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            return None
    
    def _generate_final_summary(self, combined_summaries: str, video_info: Dict[str, Any]) -> Optional[str]:
        """
        Generate a final summary from combined chunk summaries.
        
        Args:
            combined_summaries: Text containing all chunk summaries
            video_info: Dictionary containing video metadata
            
        Returns:
            Final summary text or None if generation fails
        """
        try:
            # Create the prompt for final summary
            title = video_info.get('title', 'Unknown Video')
            channel = video_info.get('channel', 'Unknown Channel')
            
            prompt = f"""
            You are an expert YouTube video summarizer. Your task is to create a final, cohesive summary of the following YouTube video based on these partial summaries.
            
            Video Title: {title}
            Channel: {channel}
            
            Partial Summaries:
            {combined_summaries}
            
            Please provide a clear, well-structured final summary that integrates all the partial summaries into a cohesive whole.
            The summary should be comprehensive yet concise, focusing on the most valuable information.
            Use bullet points where appropriate to organize information.
            Eliminate any redundancies from the partial summaries.
            
            Final Summary:
            """
            
            # Generate the final summary
            response = self.model.generate_content(prompt)
            
            if response and hasattr(response, 'text'):
                return response.text.strip()
            return None
            
        except Exception as e:
            logger.error(f"Error generating final summary: {str(e)}")
            return None


# Example usage
if __name__ == "__main__":
    summarizer = GeminiSummarizer()
    test_transcript = "This is a test transcript. It contains information about a video that needs to be summarized."
    test_video_info = {
        "title": "Test Video",
        "channel": "Test Channel"
    }
    summary = summarizer.summarize_transcript(test_transcript, test_video_info)
    print(f"Summary: {summary}")
