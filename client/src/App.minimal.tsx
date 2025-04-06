import React from 'react';

/**
 * Minimal App component for debugging
 *
 * This is a stripped-down version of the App component that only renders a basic UI
 * without any complex functionality or dependencies.
 */
function App() {
  // Mark app as loaded
  React.useEffect(() => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.classList.add('app-loaded');
    }
    console.log('Minimal app fully loaded');
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 p-4">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">ReadLtr - Minimal Mode</h1>
        <p className="text-zinc-400">This is a minimal version of the application for debugging purposes.</p>
      </header>

      <main>
        <div className="bg-zinc-800 p-4 rounded-lg mb-4">
          <h2 className="text-xl font-semibold mb-2">Application Status</h2>
          <p>The minimal version of the application is running successfully.</p>
        </div>

        <div className="bg-zinc-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>React is loaded and working</li>
            <li>Basic styling is applied</li>
            <li>No external dependencies are being used</li>
          </ul>
        </div>
      </main>

      <footer className="mt-8 pt-4 border-t border-zinc-800 text-zinc-500 text-sm">
        <p>ReadLtr - Minimal Mode - {new Date().toLocaleString()}</p>
      </footer>
    </div>
  );
}

export default App;
