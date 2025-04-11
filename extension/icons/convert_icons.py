#!/usr/bin/env python3
"""
Script to convert SVG icon to multiple PNG sizes for browser extension.
Uses Inkscape command line to convert SVG to PNG.
"""

import os
import subprocess
import sys

def check_inkscape_installed():
    """Check if Inkscape is installed."""
    try:
        # Try to run inkscape with version flag
        subprocess.run(['inkscape', '--version'],
                      stdout=subprocess.PIPE,
                      stderr=subprocess.PIPE,
                      check=True)
        return True
    except (subprocess.SubprocessError, FileNotFoundError):
        return False

def convert_svg_to_png(svg_path, output_path, size):
    """Convert SVG to PNG at specified size using Inkscape."""
    try:
        # Construct the Inkscape command
        cmd = [
            'inkscape',
            '--export-filename=' + output_path,
            '-w', str(size),
            '-h', str(size),
            svg_path
        ]

        # Run the command
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        print(f"Created: {output_path} ({size}x{size})")
        return True
    except subprocess.SubprocessError as e:
        print(f"Error converting {svg_path} to {output_path}: {e}")
        return False

def main():
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # SVG source file
    svg_path = os.path.join(script_dir, 'icon.svg')

    # Check if SVG file exists
    if not os.path.exists(svg_path):
        print(f"Error: SVG file not found at {svg_path}")
        return

    # Check if Inkscape is installed
    if not check_inkscape_installed():
        print("Error: Inkscape is not installed or not in PATH.")
        print("Please install Inkscape from https://inkscape.org/")
        return

    # Sizes to convert to
    sizes = [16, 48, 128]

    # Convert to each size
    success = True
    for size in sizes:
        output_path = os.path.join(script_dir, f'icon{size}.png')
        if not convert_svg_to_png(svg_path, output_path, size):
            success = False

    if success:
        print("Conversion complete!")
    else:
        print("Conversion completed with errors.")

if __name__ == "__main__":
    main()
