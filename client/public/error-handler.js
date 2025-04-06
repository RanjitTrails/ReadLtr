/**
 * ReadLtr Error Handler
 *
 * This script runs before the main application to handle any potential errors
 * that might prevent the application from loading properly.
 */

(function() {
  console.log('ReadLtr error handler initialized');

  // Block medium.js script loading
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    if (tagName.toLowerCase() === 'script') {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if (name === 'src' && value && value.includes('medium')) {
          console.warn('Blocked loading of medium script:', value);
          return element;
        }
        return originalSetAttribute.call(this, name, value);
      };
    }
    return element;
  };

  // Define all possible Medium.js functions as no-ops
  window.U1 = function() { return {}; };
  window.S_ = function() { return {}; };
  window.medium = window.medium || { noConflict: function() { return {}; } };

  // Intercept script loading
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes) {
        mutation.addedNodes.forEach(function(node) {
          if (node.tagName === 'SCRIPT' && node.src && node.src.includes('medium')) {
            console.warn('Removing medium script:', node.src);
            node.parentNode.removeChild(node);
          }
        });
      }
    });
  });

  // Start observing the document
  observer.observe(document, {
    childList: true,
    subtree: true
  });

  // Define a global error handler for third-party script errors
  window.addEventListener('error', function(event) {
    // Check if the error is from medium.js
    if (event.filename && event.filename.includes('medium')) {
      console.warn('Blocked error from medium.js:', event.message);
      event.preventDefault();
      event.stopPropagation();
      return true; // Prevent the error from propagating
    }

    // Check for the specific U1 error
    if (event.message && (event.message.includes('U1 is not a function') || event.message.includes('S_'))) {
      console.warn('Blocked Medium-related function error:', event.message);
      event.preventDefault();
      event.stopPropagation();
      return true; // Prevent the error from propagating
    }
  }, true); // Use capture phase to intercept before other handlers

  // Define a global unhandled promise rejection handler
  window.addEventListener('unhandledrejection', function(event) {
    // Check if the rejection is related to medium.js
    if (event.reason && event.reason.stack &&
        (event.reason.stack.includes('medium') ||
         (event.reason.message && event.reason.message.includes('U1')))) {
      console.warn('Blocked unhandled promise rejection from medium.js:', event.reason);
      event.preventDefault();
      event.stopPropagation();
      return true; // Prevent the rejection from propagating
    }
  }, true); // Use capture phase to intercept before other handlers

  // Set a timeout to check if the app has loaded
  setTimeout(function() {
    // Check if the app has loaded by looking for a specific element
    const appLoaded = document.querySelector('.app-loaded');
    if (!appLoaded) {
      console.warn('Application may not have loaded properly, showing error container');
      const errorContainer = document.getElementById('error-container');
      if (errorContainer) {
        errorContainer.style.display = 'block';
      }
    }
  }, 10000); // 10 seconds

  console.log('ReadLtr error handler setup complete');
})();
