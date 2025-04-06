import React from 'react';

/**
 * Basic App component with slightly more functionality
 *
 * This version includes a basic layout and navigation but avoids complex dependencies
 */
function App() {
  // Mark app as loaded
  React.useEffect(() => {
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.classList.add('app-loaded');
    }
    console.log('Basic app fully loaded');
  }, []);

  // Simple state for navigation
  const [currentPage, setCurrentPage] = React.useState('home');

  // Simple navigation handler
  const navigate = (page: string) => {
    setCurrentPage(page);
    console.log(`Navigated to ${page} page`);
  };

  // Render the appropriate page content based on the current page
  const renderPageContent = () => {
    switch (currentPage) {
      case 'home':
        return (
          <div className="p-4 bg-zinc-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Home Page</h2>
            <p className="mb-4">Welcome to ReadLtr, your personal read-it-later app.</p>
            <p>This is a basic version of the application with minimal functionality.</p>
          </div>
        );
      case 'articles':
        return (
          <div className="p-4 bg-zinc-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Articles</h2>
            <p className="mb-4">Your saved articles would appear here.</p>
            <div className="border border-zinc-700 p-3 rounded-lg mb-2">
              <h3 className="font-medium">Sample Article 1</h3>
              <p className="text-zinc-400 text-sm">This is a sample article description.</p>
            </div>
            <div className="border border-zinc-700 p-3 rounded-lg">
              <h3 className="font-medium">Sample Article 2</h3>
              <p className="text-zinc-400 text-sm">This is another sample article description.</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-4 bg-zinc-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Settings</h2>
            <p className="mb-4">Application settings would appear here.</p>
            <div className="flex items-center justify-between mb-2">
              <span>Dark Mode</span>
              <button className="bg-blue-600 px-3 py-1 rounded">Enabled</button>
            </div>
            <div className="flex items-center justify-between">
              <span>Notifications</span>
              <button className="bg-zinc-600 px-3 py-1 rounded">Disabled</button>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 bg-zinc-800 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
            <p>The page you're looking for doesn't exist.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 p-4">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">ReadLtr - Basic Mode</h1>
        <p className="text-zinc-400">This is a basic version of the application with minimal functionality.</p>
      </header>

      <nav className="mb-6">
        <ul className="flex space-x-4">
          <li>
            <button
              onClick={() => navigate('home')}
              className={`px-4 py-2 rounded ${currentPage === 'home' ? 'bg-blue-600' : 'bg-zinc-800'}`}
            >
              Home
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate('articles')}
              className={`px-4 py-2 rounded ${currentPage === 'articles' ? 'bg-blue-600' : 'bg-zinc-800'}`}
            >
              Articles
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate('settings')}
              className={`px-4 py-2 rounded ${currentPage === 'settings' ? 'bg-blue-600' : 'bg-zinc-800'}`}
            >
              Settings
            </button>
          </li>
        </ul>
      </nav>

      <main>
        {renderPageContent()}
      </main>

      <footer className="mt-8 pt-4 border-t border-zinc-800 text-zinc-500 text-sm">
        <p>ReadLtr - Basic Mode - {new Date().toLocaleString()}</p>
        <p className="mt-1">
          <a href="/" className="text-blue-400 hover:underline">Switch to Full Mode</a>
          {' | '}
          <a href="/?minimal=true" className="text-blue-400 hover:underline">Switch to Minimal Mode</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
