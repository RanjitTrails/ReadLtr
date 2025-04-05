import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { ToasterProvider } from '@/components/ui/toaster';

/**
 * Simple App component
 * 
 * This is a minimal version of the App component that should work
 * even if there are issues with other components
 */
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToasterProvider>
        <div className="min-h-screen bg-zinc-900 text-zinc-100 p-4">
          <div className="max-w-4xl mx-auto">
            <header className="py-6">
              <h1 className="text-3xl font-bold text-blue-500">ReadLtr</h1>
              <p className="text-zinc-400 mt-2">Your personal read-it-later app</p>
            </header>
            
            <main className="mt-8">
              <div className="bg-zinc-800 rounded-lg p-6 shadow-lg">
                <h2 className="text-xl font-semibold mb-4">Welcome to ReadLtr</h2>
                <p className="mb-4">
                  The application is now loading in simplified mode. This indicates that there might be
                  some issues with the full version of the app.
                </p>
                <p className="text-zinc-400 text-sm">
                  We're working on fixing these issues. In the meantime, you can try refreshing the page
                  or clearing your browser cache.
                </p>
                
                <div className="mt-6 flex gap-4">
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
                  >
                    Refresh Page
                  </button>
                  <a 
                    href="/test.html"
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded text-white"
                  >
                    Test Page
                  </a>
                </div>
              </div>
            </main>
          </div>
        </div>
      </ToasterProvider>
    </QueryClientProvider>
  );
};

export default App;
