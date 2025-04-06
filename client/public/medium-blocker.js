/**
 * Medium.js Blocker
 *
 * This script specifically targets and blocks Medium.js from loading
 * and prevents related errors from breaking the application.
 */

(function() {
  console.log('Medium.js blocker initialized');

  // Define Medium.js functions to prevent errors
  window.U1 = function() { return {}; };
  window.UI = function() { return {}; }; // Add UI function
  window.S_ = function() { return {}; };
  window.medium = window.medium || {
    noConflict: function() { return {}; },
    getBreakingNews: function() { return {}; },
    getTopStories: function() { return {}; },
    getLatestPosts: function() { return {}; },
    init: function() { return {}; }
  };

  // Block any script with "medium" in the URL
  const blockMediumScripts = function() {
    // Override document.createElement to intercept script creation
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
      const element = originalCreateElement.call(document, tagName);
      if (tagName.toLowerCase() === 'script') {
        const originalSetAttribute = element.setAttribute;
        element.setAttribute = function(name, value) {
          if (name === 'src' && value && value.toLowerCase().includes('medium')) {
            console.warn('Blocked medium script from loading:', value);
            return element;
          }
          return originalSetAttribute.call(this, name, value);
        };
      }
      return element;
    };

    // Override appendChild to prevent adding medium scripts
    const originalAppendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function(node) {
      if (node.tagName === 'SCRIPT' && node.src && node.src.toLowerCase().includes('medium')) {
        console.warn('Blocked medium script from being appended:', node.src);
        return node; // Return the node without appending it
      }
      return originalAppendChild.call(this, node);
    };

    // Override insertBefore to prevent adding medium scripts
    const originalInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function(node, referenceNode) {
      if (node.tagName === 'SCRIPT' && node.src && node.src.toLowerCase().includes('medium')) {
        console.warn('Blocked medium script from being inserted:', node.src);
        return node; // Return the node without inserting it
      }
      return originalInsertBefore.call(this, node, referenceNode);
    };
  };

  // Call the function to block Medium scripts
  blockMediumScripts();

  // Add a specific error handler for Medium.js errors
  window.addEventListener('error', function(event) {
    // Check if the error is from medium.js
    if (event.filename && event.filename.toLowerCase().includes('medium')) {
      console.warn('Blocked error from medium.js:', event.message);
      event.preventDefault();
      event.stopPropagation();
      return true; // Prevent the error from propagating
    }

    // Check for specific Medium.js errors
    if (event.message && (
        event.message.includes('U1 is not a function') ||
        event.message.includes('UI is not a function') ||
        event.message.includes('S_') ||
        event.message.includes('medium')
      )) {
      console.warn('Blocked Medium-related function error:', event.message);
      event.preventDefault();
      event.stopPropagation();
      return true; // Prevent the error from propagating
    }

    // Check for TrustedHTML errors
    if (event.message && event.message.includes('TrustedHTML')) {
      console.warn('TrustedHTML error detected in medium-blocker:', event.message);
      // Try to create a policy if it doesn't exist
      if (window.trustedTypes && window.trustedTypes.createPolicy && !window.readltrPolicy) {
        try {
          window.readltrPolicy = window.trustedTypes.createPolicy('readltr-html', {
            createHTML: (string) => string
          });
          console.log('TrustedTypes policy created in medium-blocker');
        } catch (e) {
          console.error('Failed to create TrustedTypes policy in medium-blocker:', e);
        }
      }
    }
  }, true); // Use capture phase to intercept before other handlers

  console.log('Medium.js blocker setup complete');
})();
