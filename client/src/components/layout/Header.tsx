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
            <h1 className="text-xl font-semibold text-slate-900">ReadLtr</h1>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/library">
                  <a className="text-slate-600 hover:text-primary transition-colors flex items-center">
                    <BookOpen className="h-6 w-6 mr-1" />
                    <span className="hidden md:inline">My Reading List</span>
                  </a>
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
