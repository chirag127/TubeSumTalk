"""
Gemini API Integration

This module provides functions to interact with the Gemini 2.0 Flash Lite API
for text summarization.
"""

import os
import logging
from typing import Optional
import google.generativeai as genai

logger = logging.getLogger(__name__)

# Initialize the Gemini API with the API key from environment variables
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    logger.warning("GEMINI_API_KEY not found in environment variables")

genai.configure(api_key=API_KEY)

def summarize_text(text: str, max_length: Optional[int] = 500) -> str:
    """
    Summarize text using Gemini 2.0 Flash Lite.
    
    Args:
        text: The text to summarize
        max_length: Maximum length of the summary in words
        
    Returns:
        The generated summary
    """
    if not API_KEY:
        return "Error: Gemini API key not configured"
    
    if not text:
        return "Error: No text provided for summarization"
    
    try:
        # Truncate text if it's too long (Gemini has token limits)
        # A rough estimate is that 1 token is about 4 characters
        max_tokens = 30000  # Gemini 2.0 Flash Lite has a context window of 1M tokens, but we'll be conservative
        max_chars = max_tokens * 4
        
        if len(text) > max_chars:
            logger.warning(f"Text too long ({len(text)} chars), truncating to {max_chars} chars")
            text = text[:max_chars]
        
        # Create the prompt for summarization
        prompt = f"""
        Please provide a concise summary of the following YouTube video transcript.
        The summary should be informative, well-structured, and capture the main points and key details.
        Keep the summary to approximately {max_length} words.
        
        TRANSCRIPT:
        {text}
        
        SUMMARY:
        """
        
        # Generate the summary using Gemini 2.0 Flash Lite
        model = genai.GenerativeModel('gemini-2.0-flash-lite')
        response = model.generate_content(
            prompt,
            generation_config={
                "temperature": 0.2,  # Lower temperature for more focused summaries
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 1024,  # Limit output size
            }
        )
        
        # Extract and return the summary text
        if hasattr(response, 'text'):
            return response.text.strip()
        else:
            return "Error: Unable to generate summary"
    
    except Exception as e:
        logger.error(f"Error generating summary: {str(e)}")
        return f"Error generating summary: {str(e)}"
