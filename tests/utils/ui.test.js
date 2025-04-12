/**
 * Unit tests for the UI Service module
 */

import uiService from '../../extension/utils/ui.js';

// Mock document methods
global.document = {
    createElement: jest.fn(),
    createElementNS: jest.fn(),
    createTextNode: jest.fn(),
    body: {
        appendChild: jest.fn(),
    },
};

// Mock Node
global.Node = {
    TEXT_NODE: 3,
    ELEMENT_NODE: 1,
};

describe('UI Service', () => {
    beforeEach(() => {
        // Reset mocks
        document.createElement.mockReset();
        document.createElementNS.mockReset();
        document.createTextNode.mockReset();
        document.body.appendChild.mockReset();
    });

    test('createElement creates an element with attributes and children', () => {
        // Mock document.createElement to return an element
        const mockElement = {
            className: '',
            style: {},
            setAttribute: jest.fn(),
            addEventListener: jest.fn(),
            appendChild: jest.fn(),
            textContent: '',
        };
        document.createElement.mockReturnValue(mockElement);

        // Mock document.createTextNode to return a text node
        const mockTextNode = { textContent: 'Text content' };
        document.createTextNode.mockReturnValue(mockTextNode);

        // Call createElement with attributes and children
        const element = uiService.createElement('div', {
            className: 'test-class',
            style: { color: 'red' },
            onClick: () => {},
            'data-test': 'test',
        }, ['Text content', null]);

        // Check that document.createElement was called with the correct tag
        expect(document.createElement).toHaveBeenCalledWith('div');

        // Check that attributes were set correctly
        expect(element.className).toBe('test-class');
        expect(element.style.color).toBe('red');
        expect(element.addEventListener).toHaveBeenCalled();
        expect(element.setAttribute).toHaveBeenCalledWith('data-test', 'test');

        // Check that children were added correctly
        expect(document.createTextNode).toHaveBeenCalledWith('Text content');
        expect(element.appendChild).toHaveBeenCalledWith(mockTextNode);
    });

    test('createElement sets textContent for string children', () => {
        // Mock document.createElement to return an element
        const mockElement = {
            className: '',
            style: {},
            setAttribute: jest.fn(),
            addEventListener: jest.fn(),
            appendChild: jest.fn(),
            textContent: '',
        };
        document.createElement.mockReturnValue(mockElement);

        // Call createElement with a string child
        const element = uiService.createElement('div', {}, 'Text content');

        // Check that textContent was set correctly
        expect(element.textContent).toBe('Text content');
    });

    test('createElement appends Node children', () => {
        // Mock document.createElement to return an element
        const mockElement = {
            className: '',
            style: {},
            setAttribute: jest.fn(),
            addEventListener: jest.fn(),
            appendChild: jest.fn(),
            textContent: '',
        };
        document.createElement.mockReturnValue(mockElement);

        // Create a mock Node child
        const mockNodeChild = { nodeType: 1 };

        // Call createElement with a Node child
        const element = uiService.createElement('div', {}, mockNodeChild);

        // Check that appendChild was called with the Node child
        expect(element.appendChild).toHaveBeenCalledWith(mockNodeChild);
    });

    test('createButton creates a button element', () => {
        // Mock createElement to return a button element
        const mockButton = { type: 'button' };
        jest.spyOn(uiService, 'createElement').mockReturnValue(mockButton);

        // Call createButton
        const button = uiService.createButton('Button text', () => {}, { className: 'test-class' });

        // Check that createElement was called with the correct parameters
        expect(uiService.createElement).toHaveBeenCalledWith('button', {
            className: 'test-class',
            onClick: expect.any(Function),
        }, 'Button text');

        // Check that the returned button is correct
        expect(button).toBe(mockButton);
    });

    test('createIconButton creates a button with an SVG icon', () => {
        // Mock createSvgIcon to return an SVG element
        const mockSvg = { id: 'svg-icon' };
        jest.spyOn(uiService, 'createSvgIcon').mockReturnValue(mockSvg);

        // Mock createElement to return a button element
        const mockButton = { type: 'button' };
        jest.spyOn(uiService, 'createElement').mockReturnValue(mockButton);

        // Call createIconButton
        const button = uiService.createIconButton('M0 0h24v24H0z', () => {}, 'Icon button', { className: 'test-class' });

        // Check that createSvgIcon was called with the correct parameters
        expect(uiService.createSvgIcon).toHaveBeenCalledWith('M0 0h24v24H0z', 24, 24);

        // Check that createElement was called with the correct parameters
        expect(uiService.createElement).toHaveBeenCalledWith('button', {
            className: 'icon-button',
            'aria-label': 'Icon button',
            title: 'Icon button',
            onClick: expect.any(Function),
            className: 'test-class',
        }, mockSvg);

        // Check that the returned button is correct
        expect(button).toBe(mockButton);
    });

    test('createSvgIcon creates an SVG icon', () => {
        // Mock document.createElementNS to return SVG elements
        const mockSvg = {
            setAttribute: jest.fn(),
            appendChild: jest.fn(),
        };
        const mockPath = {
            setAttribute: jest.fn(),
        };
        document.createElementNS
            .mockReturnValueOnce(mockSvg)
            .mockReturnValueOnce(mockPath);

        // Call createSvgIcon
        const svg = uiService.createSvgIcon('M0 0h24v24H0z', 24, 24, { className: 'test-class' });

        // Check that document.createElementNS was called with the correct parameters
        expect(document.createElementNS).toHaveBeenCalledWith('http://www.w3.org/2000/svg', 'svg');
        expect(document.createElementNS).toHaveBeenCalledWith('http://www.w3.org/2000/svg', 'path');

        // Check that attributes were set correctly
        expect(mockSvg.setAttribute).toHaveBeenCalledWith('width', 24);
        expect(mockSvg.setAttribute).toHaveBeenCalledWith('height', 24);
        expect(mockSvg.setAttribute).toHaveBeenCalledWith('viewBox', '0 0 24 24');
        expect(mockSvg.setAttribute).toHaveBeenCalledWith('fill', 'none');
        expect(mockSvg.setAttribute).toHaveBeenCalledWith('className', 'test-class');
        expect(mockPath.setAttribute).toHaveBeenCalledWith('d', 'M0 0h24v24H0z');
        expect(mockPath.setAttribute).toHaveBeenCalledWith('fill', 'currentColor');

        // Check that path was appended to SVG
        expect(mockSvg.appendChild).toHaveBeenCalledWith(mockPath);

        // Check that the returned SVG is correct
        expect(svg).toBe(mockSvg);
    });

    test('parseMarkdown converts markdown to HTML', () => {
        // Test markdown
        const markdown = `# Heading 1
## Heading 2
### Heading 3

This is a paragraph with **bold** and *italic* text.

* List item 1
* List item 2
* List item 3

1. Numbered item 1
2. Numbered item 2
3. Numbered item 3

[Link text](https://example.com)`;

        // Parse markdown
        const html = uiService.parseMarkdown(markdown);

        // Check that headings are converted
        expect(html).toContain('<h1>Heading 1</h1>');
        expect(html).toContain('<h2>Heading 2</h2>');
        expect(html).toContain('<h3>Heading 3</h3>');

        // Check that bold and italic are converted
        expect(html).toContain('<strong>bold</strong>');
        expect(html).toContain('<em>italic</em>');

        // Check that lists are converted
        expect(html).toContain('<ul>');
        expect(html).toContain('<li>List item 1</li>');
        expect(html).toContain('<li>List item 2</li>');
        expect(html).toContain('<li>List item 3</li>');
        expect(html).toContain('</ul>');

        // Check that numbered lists are converted
        expect(html).toContain('<ol>');
        expect(html).toContain('<li>Numbered item 1</li>');
        expect(html).toContain('<li>Numbered item 2</li>');
        expect(html).toContain('<li>Numbered item 3</li>');
        expect(html).toContain('</ol>');

        // Check that links are converted
        expect(html).toContain('<a href="https://example.com" target="_blank">Link text</a>');
    });

    test('parseMarkdown returns empty string for empty input', () => {
        // Parse empty markdown
        const html = uiService.parseMarkdown('');

        // Check that empty string is returned
        expect(html).toBe('');
    });

    test('parseMarkdown returns empty string for null input', () => {
        // Parse null markdown
        const html = uiService.parseMarkdown(null);

        // Check that empty string is returned
        expect(html).toBe('');
    });

    test('findYouTubeElements returns YouTube elements', () => {
        // Mock document.querySelector to return elements
        document.querySelector
            .mockReturnValueOnce({ id: 'player-container' }) // playerContainer
            .mockReturnValueOnce({ id: 'primary' }) // primaryColumn
            .mockReturnValueOnce({ id: 'secondary' }) // secondaryColumn
            .mockReturnValueOnce(null) // secondaryColumn (fallback)
            .mockReturnValueOnce({ className: 'html5-main-video' }) // videoPlayer
            .mockReturnValueOnce({ textContent: 'Video Title' }) // videoTitle
            .mockReturnValueOnce(null) // videoTitle (fallback)
            .mockReturnValueOnce({ textContent: 'Channel Name' }) // videoChannel
            .mockReturnValueOnce(null) // videoChannel (fallback)
            .mockReturnValueOnce({ id: 'related' }) // relatedVideos
            .mockReturnValueOnce({ id: 'comments' }); // comments

        // Call findYouTubeElements
        const elements = uiService.findYouTubeElements();

        // Check that document.querySelector was called with the correct selectors
        expect(document.querySelector).toHaveBeenCalledWith('#player-container');
        expect(document.querySelector).toHaveBeenCalledWith('#primary');
        expect(document.querySelector).toHaveBeenCalledWith('#secondary');
        expect(document.querySelector).toHaveBeenCalledWith('#secondary-inner');
        expect(document.querySelector).toHaveBeenCalledWith('video.html5-main-video');
        expect(document.querySelector).toHaveBeenCalledWith('h1.title');
        expect(document.querySelector).toHaveBeenCalledWith('h1.ytd-watch-metadata');
        expect(document.querySelector).toHaveBeenCalledWith('#owner-name a');
        expect(document.querySelector).toHaveBeenCalledWith('#channel-name');
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

    test('insertIntoSecondaryColumn inserts element into secondary column', () => {
        // Create mock element
        const element = { id: 'test-element' };

        // Create mock secondary column
        const secondaryColumn = {
            firstChild: { id: 'first-child' },
            insertBefore: jest.fn(),
        };

        // Mock findYouTubeElements to return the secondary column
        jest.spyOn(uiService, 'findYouTubeElements').mockReturnValueOnce({
            secondaryColumn,
        });

        // Call insertIntoSecondaryColumn
        const result = uiService.insertIntoSecondaryColumn(element);

        // Check that insertBefore was called with the correct parameters
        expect(secondaryColumn.insertBefore).toHaveBeenCalledWith(element, secondaryColumn.firstChild);

        // Check that the result is true
        expect(result).toBe(true);
    });

    test('insertIntoSecondaryColumn returns false if secondary column not found', () => {
        // Create mock element
        const element = { id: 'test-element' };

        // Mock findYouTubeElements to return null for secondary column
        jest.spyOn(uiService, 'findYouTubeElements').mockReturnValueOnce({
            secondaryColumn: null,
        });

        // Mock console.error
        console.error = jest.fn();

        // Call insertIntoSecondaryColumn
        const result = uiService.insertIntoSecondaryColumn(element);

        // Check that console.error was called
        expect(console.error).toHaveBeenCalledWith('Could not find secondary column to inject element');

        // Check that the result is false
        expect(result).toBe(false);
    });
});
