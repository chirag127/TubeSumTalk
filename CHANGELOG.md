# Changelog

All notable changes to the TubeSumTalk extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2023-05-13

### Added
- Support for YouTube livestream URLs (format: https://www.youtube.com/live/[video-id])
- Updated URL detection regex to recognize both standard video and livestream URLs
- Modified video ID extraction to handle livestream URL format

## [1.0.3] - 2023-05-01

### Fixed
- Improved video change detection for better reliability
- Fixed the "Refresh for Current Video" button functionality

## [1.0.2] - 2023-04-15

### Added
- Text-to-speech functionality in the Q&A panel
- Refresh button in the Q&A panel to regenerate answers

### Fixed
- Word highlighting now properly works in the Q&A panel

## [1.0.1] - 2023-04-01

### Added
- Support for different summary types (bullet points, brief, detailed, key points, chapter markers)
- Support for different summary lengths (short, medium, long)

### Fixed
- Various UI improvements and bug fixes

## [1.0.0] - 2023-03-15

### Added
- Initial release of TubeSumTalk
- YouTube video summarization using Gemini 2.0 Flash Lite
- Text-to-speech with word highlighting
- Q&A functionality based on video transcript
- Settings for voice, speed, and pitch
- Dark mode support
