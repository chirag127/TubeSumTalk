"""
TubeSumTalk Backend Test Script

This script tests the backend API by sending a request to summarize a YouTube video.
"""

import requests
import sys
import json

def test_summarize_api(video_id):
    """
    Test the /summarize endpoint with a YouTube video ID.
    
    Args:
        video_id: The YouTube video ID to summarize
    """
    url = "http://localhost:8000/summarize"
    
    payload = {
        "video_id": video_id,
        "max_length": 300
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    print(f"Sending request to summarize video: {video_id}")
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        
        # Check if the request was successful
        if response.status_code == 200:
            result = response.json()
            print("\nSummary Result:")
            print(json.dumps(result, indent=2))
            
            if result.get("summary"):
                print("\nSummary:")
                print(result["summary"])
            else:
                print("\nNo summary available.")
                
            if result.get("error"):
                print(f"\nError: {result['error']}")
        else:
            print(f"Error: Received status code {response.status_code}")
            print(response.text)
    
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    # Check if a video ID was provided
    if len(sys.argv) > 1:
        video_id = sys.argv[1]
    else:
        # Use a default video ID if none was provided
        video_id = "dQw4w9WgXcQ"  # Rick Astley - Never Gonna Give You Up
        print(f"No video ID provided, using default: {video_id}")
    
    test_summarize_api(video_id)
