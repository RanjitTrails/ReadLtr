import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Debug and minimal modes
const urlParams = new URLSearchParams(window.location.search);
const isDebugMode = urlParams.has('debug');
const isMinimalMode = import.meta.env.VITE_MINIMAL_MODE === 'true' || urlParams.has('minimal');

// Log configuration
console.log('ReadLtr initializing...');
console.log('Debug mode:', isDebugMode ? 'enabled' : 'disabled');
console.log('Minimal mode:', isMinimalMode ? 'enabled' : 'disabled');
console.log('Environment:', import.meta.env.MODE);

// Simple fallback component
const SimpleFallback = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#09090b',
      color: '#f1f5f9',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <h1 style={{ color: '#3b82f6', marginBottom: '20px' }}>ReadLtr</h1>
      <p>The application loaded successfully!</p>
      <p>This is a minimal version to diagnose deployment issues.</p>
      <div style={{ marginTop: '20px' }}>
        <a
          href="/test.html"
          style={{
            display: 'inline-block',
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 500,
            marginRight: '10px'
          }}
        >
          Test Page
        </a>
        <a
          href="/"
          style={{
            display: 'inline-block',
            backgroundColor: '#1f2937',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 500
          }}
        >
          Try Full App
        </a>
      </div>
      {isDebugMode && (
        <div style={{
          marginTop: '40px',
          padding: '15px',
          backgroundColor: '#1f2937',
          borderRadius: '8px',
          maxWidth: '600px',
          textAlign: 'left'
        }}>
          <h2 style={{ color: '#60a5fa', marginTop: 0 }}>Debug Information</h2>
          <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
            {JSON.stringify({
              userAgent: navigator.userAgent,
              windowSize: `${window.innerWidth}x${window.innerHeight}`,
              timestamp: new Date().toISOString(),
              env: {
                VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'not set',
                VITE_API_URL: import.meta.env.VITE_API_URL || 'not set',
                MODE: import.meta.env.MODE,
                DEV: import.meta.env.DEV,
                PROD: import.meta.env.PROD,
              }
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error || event.message);

  // Update the error message in the DOM
  const errorMessage = document.getElementById('error-message');
  const errorContainer = document.getElementById('error-container');

  if (errorMessage && errorContainer) {
    errorMessage.textContent = `Error: ${event.error?.message || event.message || 'Unknown error'}`;
    errorContainer.style.display = 'block';
  }

  // In debug mode, show detailed error
  if (isDebugMode) {
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.bottom = '0';
    errorDiv.style.left = '0';
    errorDiv.style.right = '0';
    errorDiv.style.padding = '10px';
    errorDiv.style.background = 'rgba(255, 0, 0, 0.8)';
    errorDiv.style.color = 'white';
    errorDiv.style.zIndex = '9999';
    errorDiv.style.fontFamily = 'monospace';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.maxHeight = '50vh';
    errorDiv.style.overflow = 'auto';
    errorDiv.textContent = `Error: ${event.error?.message || event.message}\nStack: ${event.error?.stack || 'No stack trace'}`;
    document.body.appendChild(errorDiv);
  }
});

try {
  // Try to render the app
  const rootElement = document.getElementById('root');
  if (rootElement) {
    // Always render the SimpleFallback in minimal mode or if requested via URL
    if (isMinimalMode) {
      createRoot(rootElement).render(<SimpleFallback />);
      console.log('Minimal app rendered successfully');
    } else {
      // Try to dynamically import the simplified App component first
      import('./App.simple')
        .then((module) => {
          const SimpleApp = module.default;
          createRoot(rootElement).render(<SimpleApp />);
          console.log('Simple app rendered successfully');

          // After the simple app is rendered, try to load the full app
          setTimeout(() => {
            console.log('Attempting to load full app...');
            import('./App')
              .then((fullModule) => {
                const FullApp = fullModule.default;
                console.log('Full app loaded successfully, but not rendering it yet');
                // We don't render the full app yet, just log that it loaded
              })
              .catch((error) => {
                console.error('Failed to load full app:', error);
              });
          }, 2000);
        })
        .catch((error) => {
          console.error('Failed to load simple app, falling back to minimal version:', error);
          createRoot(rootElement).render(<SimpleFallback />);
        });
    }
  } else {
    console.error('Root element not found');
  }
} catch (error) {
  console.error('Failed to render app:', error);

  // Try to show a basic error message directly in the DOM
  try {
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');

    if (errorContainer && errorMessage) {
      errorContainer.style.display = 'block';
      errorMessage.textContent = `Critical error: ${error instanceof Error ? error.message : String(error)}`;
    }
  } catch (domError) {
    // Last resort - alert
    console.error('Failed to show error in DOM:', domError);
  }
}
