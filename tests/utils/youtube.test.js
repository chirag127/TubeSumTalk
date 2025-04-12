/**
 * Unit tests for the YouTube Service module
 */

import youtubeService from '../../extension/utils/youtube.js';

// Mock document methods
global.document = {
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(),
};

// Mock window methods
global.window = {
    location: {
        href: 'https://www.youtube.com/watch?v=videoId',
    },
    addEventListener: jest.fn(),
};

// Mock MutationObserver
global.MutationObserver = class {
    constructor(callback) {
        this.callback = callback;
    }
    observe() {}
    disconnect() {}
};

describe('YouTube Service', () => {
    beforeEach(() => {
        // Reset mocks
        document.querySelector.mockReset();
        document.querySelectorAll.mockReset();
        window.addEventListener.mockReset();
    });

    test('findElements returns YouTube elements', () => {
        // Mock document.querySelector to return elements
        document.querySelector
            .mockReturnValueOnce({ id: 'player-container' }) // playerContainer
            .mockReturnValueOnce({ id: 'primary' }) // primaryColumn
            .mockReturnValueOnce({ id: 'secondary' }) // secondaryColumn
            .mockReturnValueOnce({ className: 'html5-main-video' }) // videoPlayer
            .mockReturnValueOnce({ textContent: 'Video Title' }) // videoTitle
            .mockReturnValueOnce({ textContent: 'Channel Name' }) // videoChannel
            .mockReturnValueOnce({ id: 'related' }) // relatedVideos
            .mockReturnValueOnce({ id: 'comments' }); // comments

        // Call findElements
        const elements = youtubeService.findElements();

        // Check that document.querySelector was called with the correct selectors
        expect(document.querySelector).toHaveBeenCalledWith('#player-container');
        expect(document.querySelector).toHaveBeenCalledWith('#primary');
        expect(document.querySelector).toHaveBeenCalledWith('#secondary');
        expect(document.querySelector).toHaveBeenCalledWith('video.html5-main-video');
        expect(document.querySelector).toHaveBeenCalledWith('h1.title');
        expect(document.querySelector).toHaveBeenCalledWith('#owner-name a');
        expect(document.querySelector).toHaveBeenCalledWith('#related');
        expect(document.querySelector).toHaveBeenCalledWith('#comments');

        // Check that the returned elements are correct
        expect(elements.playerContainer).toEqual({ id: 'player-container' });
        expect(elements.primaryColumn).toEqual({ id: 'primary' });
        expect(elements.secondaryColumn).toEqual({ id: 'secondary' });
        expect(elements.videoPlayer).toEqual({ className: 'html5-main-video' });
        expect(elements.videoTitle).toEqual({ textContent: 'Video Title' });
        expect(elements.videoChannel).toEqual({ textContent: 'Channel Name' });
        expect(elements.relatedVideos).toEqual({ id: 'related' });
        expect(elements.comments).toEqual({ id: 'comments' });
    });

    test('getVideoDetails returns video details', () => {
        // Mock document.querySelector to return elements
        document.querySelector
            .mockReturnValueOnce({ textContent: 'Video Title' }) // videoTitle
            .mockReturnValueOnce({ textContent: 'Channel Name' }); // videoChannel

        // Call getVideoDetails
        const details = youtubeService.getVideoDetails();

        // Check that the returned details are correct
        expect(details.videoId).toBe('videoId');
        expect(details.title).toBe('Video Title');
        expect(details.channelName).toBe('Channel Name');
    });

    test('insertIntoSecondaryColumn inserts element into secondary column', () => {
        // Create mock element
        const element = { id: 'test-element' };

        // Create mock secondary column
        const secondaryColumn = {
            firstChild: { id: 'first-child' },
            insertBefore: jest.fn(),
        };

        // Mock findElements to return the secondary column
        jest.spyOn(youtubeService, 'findElements').mockReturnValueOnce({
            secondaryColumn,
        });

        // Call insertIntoSecondaryColumn
        const result = youtubeService.insertIntoSecondaryColumn(element);

        // Check that insertBefore was called with the correct parameters
        expect(secondaryColumn.insertBefore).toHaveBeenCalledWith(element, secondaryColumn.firstChild);

        // Check that the result is true
        expect(result).toBe(true);
    });

    test('insertIntoSecondaryColumn returns false if secondary column not found', () => {
        // Create mock element
        const element = { id: 'test-element' };

        // Mock findElements to return null for secondary column
        jest.spyOn(youtubeService, 'findElements').mockReturnValueOnce({
            secondaryColumn: null,
        });

        // Mock console.error
        console.error = jest.fn();

        // Call insertIntoSecondaryColumn
        const result = youtubeService.insertIntoSecondaryColumn(element);

        // Check that console.error was called
        expect(console.error).toHaveBeenCalledWith('Could not find secondary column to inject element');

        // Check that the result is false
        expect(result).toBe(false);
    });

    test('isVideoPage returns true for YouTube video page', () => {
        // Call isVideoPage
        const result = youtubeService.isVideoPage();

        // Check that the result is true
        expect(result).toBe(true);
    });

    test('isVideoPage returns false for non-YouTube video page', () => {
        // Save original window.location.href
        const originalHref = window.location.href;

        // Set window.location.href to a non-YouTube video page
        window.location.href = 'https://www.youtube.com/';

        // Call isVideoPage
        const result = youtubeService.isVideoPage();

        // Check that the result is false
        expect(result).toBe(false);

        // Restore original window.location.href
        window.location.href = originalHref;
    });

    test('onNavigate adds event listeners', () => {
        // Create mock callback
        const callback = jest.fn();

        // Call onNavigate
        const result = youtubeService.onNavigate(callback);

        // Check that window.addEventListener was called with the correct parameters
        expect(window.addEventListener).toHaveBeenCalledWith('yt-navigate-finish', callback);

        // Check that the result has a stop method
        expect(result.stop).toBeInstanceOf(Function);
    });

    test('onNavigate throws error for non-function callback', () => {
        // Call onNavigate with non-function callback and expect it to throw an error
        expect(() => youtubeService.onNavigate('not a function')).toThrow('Callback must be a function');
    });
});
