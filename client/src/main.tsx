import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Debug mode
const urlParams = new URLSearchParams(window.location.search);
const isDebugMode = urlParams.has('debug');

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);

  if (isDebugMode) {
    // In debug mode, show errors on screen
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

// Log environment information in debug mode
if (isDebugMode) {
  console.log('Debug mode enabled');
  console.log('Environment variables:', {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || 'not set',
    VITE_API_URL: import.meta.env.VITE_API_URL || 'not set',
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  });
}

// Register service worker for offline support
// Using a more defensive approach to prevent blocking the main thread
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered with scope:', registration.scope);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      // Continue loading the app even if service worker fails
    }
  }
};

// Register service worker after the app has loaded
window.addEventListener('load', () => {
  setTimeout(registerServiceWorker, 1000);
});

createRoot(document.getElementById("root")!).render(<App />);
