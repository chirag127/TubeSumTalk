/**
 * Markdown Parser Module
 * Handles parsing of markdown text to HTML
 */

class MarkdownParser {
  /**
   * Parse markdown text to HTML
   * @param {string} markdown - Markdown text
   * @returns {string} - HTML string
   */
  parse(markdown) {
    if (!markdown) return '';
    
    // Replace headers
    let html = markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Replace bold and italic
    html = html
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>');
    
    // Replace lists
    html = html
      .replace(/^\s*\n\* (.*)/gim, '<ul>\n<li>$1</li>')
      .replace(/^\* (.*)/gim, '<li>$1</li>')
      .replace(/<\/li>\s*\n\* (.*)/gim, '</li>\n<li>$1</li>')
      .replace(/<\/li>\s*\n<\/ul>\s*\n\* (.*)/gim, '</li>\n</ul>\n<ul>\n<li>$1</li>')
      .replace(/<\/li>\s*\n<\/ul>/gim, '</li>\n</ul>');
    
    // Replace numbered lists
    html = html
      .replace(/^\s*\n\d+\. (.*)/gim, '<ol>\n<li>$1</li>')
      .replace(/^\d+\. (.*)/gim, '<li>$1</li>')
      .replace(/<\/li>\s*\n\d+\. (.*)/gim, '</li>\n<li>$1</li>')
      .replace(/<\/li>\s*\n<\/ol>\s*\n\d+\. (.*)/gim, '</li>\n</ol>\n<ol>\n<li>$1</li>')
      .replace(/<\/li>\s*\n<\/ol>/gim, '</li>\n</ol>');
    
    // Replace links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>');
    
    // Replace paragraphs
    html = html.replace(/^\s*(\n)?(.+)/gim, function(m) {
      return /\<(\/)?(h\d|ul|ol|li|blockquote|pre|img)/.test(m) ? m : '<p>' + m + '</p>';
    });
    
    // Replace line breaks
    html = html.replace(/\n/gim, '<br>');
    
    return html;
  }

  /**
   * Parse markdown text to HTML with word highlighting support
   * @param {string} markdown - Markdown text
   * @returns {Object} - Object with HTML string and word elements for highlighting
   */
  parseWithHighlighting(markdown) {
    if (!markdown) return { html: '', words: [] };
    
    // First, convert markdown to HTML
    const html = this.parse(markdown);
    
    // Create a temporary container to extract text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Extract readable text while preserving structure
    let readableText = '';
    const extractTextFromNode = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        readableText += node.textContent + ' ';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Add extra spaces or line breaks for certain elements
        if (node.tagName === 'LI') readableText += '• ';
        if (
          node.tagName === 'P' ||
          node.tagName === 'LI' ||
          node.tagName === 'H1' ||
          node.tagName === 'H2' ||
          node.tagName === 'H3' ||
          node.tagName === 'H4'
        ) {
          Array.from(node.childNodes).forEach(extractTextFromNode);
          readableText += '\n';
        } else {
          Array.from(node.childNodes).forEach(extractTextFromNode);
        }
      }
    };
    
    // Extract text from the HTML content
    Array.from(tempDiv.childNodes).forEach(extractTextFromNode);
    
    // Clean up the text (remove extra spaces, etc.)
    readableText = readableText.replace(/\s+/g, ' ').trim();
    
    // Split the readable text into words for highlighting
    const words = readableText.split(' ').filter((word) => word.trim() !== '');
    
    // Create HTML with word spans
    let highlightableHtml = '';
    words.forEach((word, index) => {
      highlightableHtml += `<span id="tubesumtalk-word-${index}" class="tubesumtalk-word">${word} </span>`;
    });
    
    return {
      html: highlightableHtml,
      words,
      originalHtml: html,
      plainText: readableText
    };
  }
}

// Export as singleton
const markdownParser = new MarkdownParser();
export default markdownParser;
