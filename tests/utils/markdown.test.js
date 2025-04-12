/**
 * Unit tests for the Markdown Parser module
 */

import markdownParser from '../../extension/utils/markdown.js';

// Mock document methods
global.document = {
    createElement: jest.fn(),
    createElementNS: jest.fn(),
    createTextNode: jest.fn(),
};

describe('Markdown Parser', () => {
    test('parse converts markdown to HTML', () => {
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
        const html = markdownParser.parse(markdown);

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

    test('parse returns empty string for empty input', () => {
        // Parse empty markdown
        const html = markdownParser.parse('');

        // Check that empty string is returned
        expect(html).toBe('');
    });

    test('parse returns empty string for null input', () => {
        // Parse null markdown
        const html = markdownParser.parse(null);

        // Check that empty string is returned
        expect(html).toBe('');
    });

    test('parseWithHighlighting extracts words for highlighting', () => {
        // Mock document methods
        const mockDiv = {
            innerHTML: '',
            childNodes: [],
        };
        document.createElement.mockReturnValue(mockDiv);

        // Test markdown
        const markdown = `# Test Heading

This is a test paragraph with some words.`;

        // Parse markdown with highlighting
        const result = markdownParser.parseWithHighlighting(markdown);

        // Check that HTML is generated
        expect(result.html).toContain('tubesumtalk-word');
        expect(result.html).toContain('id="tubesumtalk-word-0"');

        // Check that words are extracted
        expect(result.words).toContain('Test');
        expect(result.words).toContain('Heading');
        expect(result.words).toContain('This');
        expect(result.words).toContain('is');
        expect(result.words).toContain('a');
        expect(result.words).toContain('test');
        expect(result.words).toContain('paragraph');
        expect(result.words).toContain('with');
        expect(result.words).toContain('some');
        expect(result.words).toContain('words.');

        // Check that original HTML is included
        expect(result.originalHtml).toBeDefined();

        // Check that plain text is included
        expect(result.plainText).toBeDefined();
    });
});
