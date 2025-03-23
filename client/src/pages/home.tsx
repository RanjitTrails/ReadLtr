import { Link } from "wouter";
import { useAuth } from "@/lib/api.tsx";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Server, GitBranch, Gift } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-slate-900 sm:text-5xl md:text-6xl">
                Self-Host Your Own
                <span className="block text-primary">Read-It-Later App</span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-slate-600">
                Keep your reading list private and take control of your data with this
                self-hosted version of Omnivore.
              </p>
              <div className="mt-10 flex justify-center gap-4">
                {user ? (
                  <Link href="/library">
                    <Button size="lg" className="px-8">
                      Go to My Library
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <Button size="lg" className="px-8">
                        Get Started
                      </Button>
                    </Link>
                    <Link href="/overview">
                      <Button variant="outline" size="lg">
                        Learn More
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Features */}
        <div className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
              Key Features
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Save Articles</h3>
                    <p className="text-slate-600">
                      Save articles, newsletters, and pages from anywhere on the web
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                      <GitBranch className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Open Source</h3>
                    <p className="text-slate-600">
                      Fully open-source code that you can modify and extend
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                      <Server className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Self-Hosted</h3>
                    <p className="text-slate-600">
                      Complete control over your data with your own server
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 mb-4">
                      <Gift className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">Free Forever</h3>
                    <p className="text-slate-600">
                      No subscriptions or hidden fees, just free and open software
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        
        {/* Getting Started Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900">
                Ready to Start?
              </h2>
              <p className="mt-4 text-lg text-slate-600">
                Follow our step-by-step guide to set up your own Omnivore instance
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 rounded-full bg-primary p-2 text-white">
                    <span className="text-sm font-semibold">1</span>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-slate-900">Clone Repository</h3>
                </div>
                <p className="text-slate-600">
                  Fork and clone the Omnivore repository to your personal Git account
                </p>
                <div className="mt-4">
                  <Link href="/setup">
                    <a className="text-primary hover:underline font-medium">Learn more →</a>
                  </Link>
                </div>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 rounded-full bg-primary p-2 text-white">
                    <span className="text-sm font-semibold">2</span>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-slate-900">Configure</h3>
                </div>
                <p className="text-slate-600">
                  Set up environment variables and configure the application for your server
                </p>
                <div className="mt-4">
                  <Link href="/configuration">
                    <a className="text-primary hover:underline font-medium">Learn more →</a>
                  </Link>
                </div>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 rounded-full bg-primary p-2 text-white">
                    <span className="text-sm font-semibold">3</span>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-slate-900">Deploy</h3>
                </div>
                <p className="text-slate-600">
                  Deploy the application to your server and start using it right away
                </p>
                <div className="mt-4">
                  <Link href="/deployment">
                    <a className="text-primary hover:underline font-medium">Learn more →</a>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-center">
              <Link href="/overview">
                <Button size="lg">
                  Get Started Guide
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
