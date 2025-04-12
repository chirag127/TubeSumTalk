/**
 * UI Utility Module
 * Provides common UI utilities for the extension
 */

class UiService {
  /**
   * Create an element with attributes and children
   * @param {string} tag - HTML tag name
   * @param {Object} attributes - Element attributes
   * @param {Array|string|Node} children - Child elements or text content
   * @returns {HTMLElement} - Created element
   */
  createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.entries(value).forEach(([prop, val]) => {
          element.style[prop] = val;
        });
      } else if (key.startsWith('on') && typeof value === 'function') {
        element.addEventListener(key.substring(2).toLowerCase(), value);
      } else {
        element.setAttribute(key, value);
      }
    });
    
    // Add children
    if (children) {
      if (Array.isArray(children)) {
        children.forEach(child => {
          if (child) {
            element.appendChild(
              typeof child === 'string' || typeof child === 'number'
                ? document.createTextNode(child)
                : child
            );
          }
        });
      } else if (typeof children === 'string' || typeof children === 'number') {
        element.textContent = children;
      } else if (children instanceof Node) {
        element.appendChild(children);
      }
    }
    
    return element;
  }

  /**
   * Create a button element
   * @param {string} text - Button text
   * @param {Function} onClick - Click handler
   * @param {Object} attributes - Additional attributes
   * @returns {HTMLButtonElement} - Button element
   */
  createButton(text, onClick, attributes = {}) {
    return this.createElement('button', {
      ...attributes,
      onClick
    }, text);
  }

  /**
   * Create a select element with options
   * @param {Array} options - Array of option objects {value, text, selected}
   * @param {Function} onChange - Change handler
   * @param {Object} attributes - Additional attributes
   * @returns {HTMLSelectElement} - Select element
   */
  createSelect(options, onChange, attributes = {}) {
    const select = this.createElement('select', {
      ...attributes,
      onChange
    });
    
    options.forEach(option => {
      const optionElement = this.createElement('option', {
        value: option.value,
        selected: option.selected
      }, option.text);
      
      select.appendChild(optionElement);
    });
    
    return select;
  }

  /**
   * Create a range input element
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @param {number} step - Step value
   * @param {number} value - Current value
   * @param {Function} onChange - Change handler
   * @param {Object} attributes - Additional attributes
   * @returns {HTMLInputElement} - Range input element
   */
  createRange(min, max, step, value, onChange, attributes = {}) {
    return this.createElement('input', {
      type: 'range',
      min,
      max,
      step,
      value,
      onChange,
      ...attributes
    });
  }

  /**
   * Create a labeled input
   * @param {string} labelText - Label text
   * @param {HTMLElement} input - Input element
   * @param {Object} attributes - Additional attributes for the container
   * @returns {HTMLDivElement} - Container with label and input
   */
  createLabeledInput(labelText, input, attributes = {}) {
    const label = this.createElement('label', {}, labelText);
    return this.createElement('div', {
      className: 'input-group',
      ...attributes
    }, [label, input]);
  }

  /**
   * Show a loading spinner
   * @param {HTMLElement} container - Container element
   * @param {string} message - Loading message
   * @returns {HTMLElement} - Loading element
   */
  showLoading(container, message = 'Loading...') {
    const loadingElement = this.createElement('div', {
      className: 'loading-container'
    }, [
      this.createElement('div', { className: 'loading-spinner' }),
      this.createElement('div', { className: 'loading-message' }, message)
    ]);
    
    container.innerHTML = '';
    container.appendChild(loadingElement);
    
    return loadingElement;
  }

  /**
   * Show an error message
   * @param {HTMLElement} container - Container element
   * @param {string} message - Error message
   * @returns {HTMLElement} - Error element
   */
  showError(container, message) {
    const errorElement = this.createElement('div', {
      className: 'error-container'
    }, [
      this.createElement('div', { className: 'error-icon' }, '⚠️'),
      this.createElement('div', { className: 'error-message' }, message)
    ]);
    
    container.innerHTML = '';
    container.appendChild(errorElement);
    
    return errorElement;
  }

  /**
   * Parse markdown text to HTML
   * @param {string} markdown - Markdown text
   * @returns {string} - HTML string
   */
  parseMarkdown(markdown) {
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
}

// Export as singleton
const uiService = new UiService();
export default uiService;
