import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { AlertCircle, BookOpen, Server, GitBranch, Layers } from "lucide-react";

export default function Overview() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Self-Hosting Omnivore</h2>
          <p className="text-slate-600 mb-4">
            Omnivore is an open-source read-it-later application that allows you to save articles, newsletters, and other content from across the web. With the official service shutting down, this guide will help you set up and deploy your own self-hosted instance.
          </p>
          
          <div className="bg-amber-50 border-l-4 border-warning p-4 my-6">
            <div className="flex items-start">
              <AlertCircle className="h-6 w-6 text-warning mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-800 font-medium">Important Notice</p>
                <p className="text-sm text-amber-700 mt-1">
                  According to <a href="https://blog.omnivore.app/p/details-on-omnivore-shutting-down" className="underline hover:text-amber-800">Omnivore's shutdown announcement</a>, the official service is closing on June 1, 2024. By self-hosting, you can continue using the application beyond this date.
                </p>
              </div>
            </div>
          </div>
          
          <h3 className="text-xl font-semibold text-slate-900 mt-6">Prerequisites</h3>
          <ul className="list-disc list-inside text-slate-600 mt-2 space-y-2">
            <li>Git installed on your local machine</li>
            <li>Docker and Docker Compose</li>
            <li>Basic command line knowledge</li>
            <li>A server for deployment (VPS, home server, etc.)</li>
            <li>Domain name (optional but recommended)</li>
          </ul>
          
          <h3 className="text-xl font-semibold text-slate-900 mt-6">Project Structure</h3>
          <p className="text-slate-600 mt-2">
            Omnivore consists of several components:
          </p>
          <ul className="list-disc list-inside text-slate-600 mt-2 space-y-1">
            <li>Backend API server (GraphQL)</li>
            <li>Web application frontend</li>
            <li>Database (PostgreSQL)</li>
            <li>Search engine (Typesense)</li>
            <li>File storage (S3-compatible)</li>
          </ul>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-xl font-semibold text-slate-900 mb-4">Self-Hosting Process Overview</h3>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-lg font-medium text-gray-900">Setup Steps</span>
            </div>
          </div>
          
          <div className="mt-6 grid gap-6 lg:grid-cols-4 md:grid-cols-2">
            {/* Step 1 */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-full bg-primary p-2 text-white">
                  <span className="text-sm font-semibold">1</span>
                </div>
                <h4 className="ml-3 text-lg font-medium text-slate-900">Clone Repository</h4>
              </div>
              <p className="mt-3 text-sm text-slate-600">Fork and clone the Omnivore repository to your personal Git account</p>
            </div>
            
            {/* Step 2 */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-full bg-primary p-2 text-white">
                  <span className="text-sm font-semibold">2</span>
                </div>
                <h4 className="ml-3 text-lg font-medium text-slate-900">Configure Environment</h4>
              </div>
              <p className="mt-3 text-sm text-slate-600">Set up environment variables and configuration files</p>
            </div>
            
            {/* Step 3 */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-full bg-primary p-2 text-white">
                  <span className="text-sm font-semibold">3</span>
                </div>
                <h4 className="ml-3 text-lg font-medium text-slate-900">Build Application</h4>
              </div>
              <p className="mt-3 text-sm text-slate-600">Build and prepare the application for deployment</p>
            </div>
            
            {/* Step 4 */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-full bg-primary p-2 text-white">
                  <span className="text-sm font-semibold">4</span>
                </div>
                <h4 className="ml-3 text-lg font-medium text-slate-900">Deploy</h4>
              </div>
              <p className="mt-3 text-sm text-slate-600">Deploy the application to your server and set up access</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <Link href="/setup">
              <a className="text-primary hover:underline font-medium">Continue to Setup Guide →</a>
            </Link>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
