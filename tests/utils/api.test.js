/**
 * Unit tests for the API Service module
 */

import apiService from '../../extension/utils/api.js';

// Mock fetch
global.fetch = jest.fn();
global.console = {
    log: jest.fn(),
    error: jest.fn(),
};

describe('API Service', () => {
    beforeEach(() => {
        // Reset mocks
        fetch.mockReset();
        console.log.mockReset();
        console.error.mockReset();
    });

    test('getBaseUrl returns the base URL', () => {
        // Get base URL
        const baseUrl = apiService.getBaseUrl();

        // Check that the base URL is correct
        expect(baseUrl).toBe('https://tubesumtalk.onrender.com');
    });

    test('setBaseUrl sets the base URL', () => {
        // Set base URL
        apiService.setBaseUrl('https://example.com');

        // Check that the base URL is set
        expect(apiService.getBaseUrl()).toBe('https://example.com');

        // Reset base URL
        apiService.setBaseUrl('https://tubesumtalk.onrender.com');
    });

    test('get makes a GET request', async () => {
        // Mock fetch to return a successful response
        fetch.mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValueOnce({ data: 'test' }),
        });

        // Call get
        const result = await apiService.get('/test', { param: 'value' });

        // Check that fetch was called with the correct URL and options
        expect(fetch).toHaveBeenCalledWith(
            'https://tubesumtalk.onrender.com/test?param=value',
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        // Check that the result is correct
        expect(result).toEqual({ data: 'test' });
    });

    test('get throws an error for non-OK response', async () => {
        // Mock fetch to return a non-OK response
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
        });

        // Call get and expect it to throw an error
        await expect(apiService.get('/test')).rejects.toThrow('API error: 404');
    });

    test('post makes a POST request', async () => {
        // Mock fetch to return a successful response
        fetch.mockResolvedValueOnce({
            ok: true,
            json: jest.fn().mockResolvedValueOnce({ data: 'test' }),
        });

        // Call post
        const result = await apiService.post('/test', { data: 'test' });

        // Check that fetch was called with the correct URL and options
        expect(fetch).toHaveBeenCalledWith(
            'https://tubesumtalk.onrender.com/test',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: 'test' }),
            }
        );

        // Check that the result is correct
        expect(result).toEqual({ data: 'test' });
    });

    test('post throws an error for non-OK response', async () => {
        // Mock fetch to return a non-OK response
        fetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: jest.fn().mockResolvedValueOnce({ error: 'Server error' }),
        });

        // Call post and expect it to throw an error
        await expect(apiService.post('/test')).rejects.toThrow('Server error');
    });

    test('getSummary calls post with the correct parameters', async () => {
        // Mock post to return a successful response
        const postSpy = jest.spyOn(apiService, 'post').mockResolvedValueOnce({
            summary: 'Test summary',
        });

        // Call getSummary
        const result = await apiService.getSummary(
            'videoId',
            'transcript',
            'title',
            'bullet',
            'medium'
        );

        // Check that post was called with the correct parameters
        expect(postSpy).toHaveBeenCalledWith('/summarize', {
            videoId: 'videoId',
            transcript: 'transcript',
            title: 'title',
            summaryType: 'bullet',
            summaryLength: 'medium',
        });

        // Check that the result is correct
        expect(result).toBe('Test summary');

        // Restore the original post method
        postSpy.mockRestore();
    });

    test('checkHealth calls get with the correct parameters', async () => {
        // Mock get to return a successful response
        const getSpy = jest.spyOn(apiService, 'get').mockResolvedValueOnce({
            status: 'ok',
        });

        // Call checkHealth
        const result = await apiService.checkHealth();

        // Check that get was called with the correct parameters
        expect(getSpy).toHaveBeenCalledWith('/health');

        // Check that the result is correct
        expect(result).toEqual({ status: 'ok' });

        // Restore the original get method
        getSpy.mockRestore();
    });
});
