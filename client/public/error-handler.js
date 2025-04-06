/**
 * ReadLtr Error Handler
 * 
 * This script runs before the main application to handle any potential errors
 * that might prevent the application from loading properly.
 */

(function() {
  console.log('ReadLtr error handler initialized');

  // Define a global error handler for third-party script errors
  window.addEventListener('error', function(event) {
    // Check if the error is from medium.js
    if (event.filename && event.filename.includes('medium.js')) {
      console.warn('Blocked error from medium.js:', event.message);
      event.preventDefault();
      event.stopPropagation();
      return true; // Prevent the error from propagating
    }

    // Check for the specific U1 error
    if (event.message && event.message.includes('U1 is not a function')) {
      console.warn('Blocked U1 function error:', event.message);
      event.preventDefault();
      event.stopPropagation();
      return true; // Prevent the error from propagating
    }
  }, true); // Use capture phase to intercept before other handlers

  // Define U1 as a no-op function if it doesn't exist
  // This prevents the "U1 is not a function" error
  window.U1 = window.U1 || function() {};

  // Define a global unhandled promise rejection handler
  window.addEventListener('unhandledrejection', function(event) {
    // Check if the rejection is related to medium.js
    if (event.reason && event.reason.stack && event.reason.stack.includes('medium.js')) {
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
