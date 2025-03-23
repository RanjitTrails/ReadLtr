import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/api.tsx";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  
  // Check if current location is in the documentation section
  const isDocsPage = ['/overview', '/setup', '/configuration', '/deployment', '/faq'].includes(location);
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold text-slate-900">Self-Host Omnivore</h1>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/library">
                  <a className="text-slate-600 hover:text-primary transition-colors">My Library</a>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={logout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <a className="text-slate-600 hover:text-primary transition-colors">Login</a>
                </Link>
                <Link href="/register">
                  <a className="text-slate-600 hover:text-primary transition-colors">Register</a>
                </Link>
              </>
            )}
            
            <a 
              href="https://github.com/omnivore-app/omnivore" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-slate-600 hover:text-primary transition-colors flex items-center"
            >
              <svg className="h-6 w-6 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
              </svg>
              <span className="hidden md:inline">GitHub Repository</span>
            </a>
          </div>
        </div>
        
        {isDocsPage && (
          <div className="border-t border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <Link href="/overview">
                <a className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${location === '/overview' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  Overview
                </a>
              </Link>
              <Link href="/setup">
                <a className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${location === '/setup' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  Setup
                </a>
              </Link>
              <Link href="/configuration">
                <a className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${location === '/configuration' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  Configuration
                </a>
              </Link>
              <Link href="/deployment">
                <a className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${location === '/deployment' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  Deployment
                </a>
              </Link>
              <Link href="/faq">
                <a className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${location === '/faq' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                  FAQ
                </a>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
