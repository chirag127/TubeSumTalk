#!/usr/bin/env python3
"""
Alternative script to create PNG icons manually without external dependencies.
This script creates simple red circle icons with a play button and text bubble.
"""

import os
from PIL import Image, ImageDraw

def create_icon(size, output_path):
    """Create a simple icon at the specified size."""
    # Create a new image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw red circle background
    draw.ellipse([(0, 0), (size, size)], fill=(255, 0, 0, 255))
    
    # Draw play button triangle (white)
    triangle_size = size * 0.4
    draw.polygon([
        (size/2 + triangle_size/2, size/2),
        (size/2 - triangle_size/4, size/2 - triangle_size/2),
        (size/2 - triangle_size/4, size/2 + triangle_size/2)
    ], fill=(255, 255, 255, 255))
    
    # Draw text bubble (white circle)
    bubble_radius = size * 0.2
    bubble_x = size * 0.7
    bubble_y = size * 0.3
    draw.ellipse(
        [(bubble_x - bubble_radius, bubble_y - bubble_radius), 
         (bubble_x + bubble_radius, bubble_y + bubble_radius)], 
        fill=(255, 255, 255, 255)
    )
    
    # Draw text lines in bubble (red)
    line_width = size * 0.1
    line_height = size * 0.05
    line_x = bubble_x - line_width/2
    line_y1 = bubble_y - line_height
    line_y2 = bubble_y + line_height
    
    draw.rectangle([(line_x, line_y1), (line_x + line_width, line_y1 + line_height)], fill=(255, 0, 0, 255))
    draw.rectangle([(line_x, line_y2), (line_x + line_width, line_y2 + line_height)], fill=(255, 0, 0, 255))
    
    # Save the image
    img.save(output_path)
    print(f"Created: {output_path} ({size}x{size})")

def main():
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Sizes to create
    sizes = [16, 48, 128]
    
    # Create each size
    for size in sizes:
        output_path = os.path.join(script_dir, f'icon{size}.png')
        create_icon(size, output_path)
    
    print("Icon creation complete!")

if __name__ == "__main__":
    main()
