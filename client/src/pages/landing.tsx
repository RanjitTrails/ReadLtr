import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth';
import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  
  // If user is already logged in, redirect to the library
  React.useEffect(() => {
    if (user) {
      navigate('/library');
    }
  }, [user, navigate]);

  async function handleSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    
    const form = event.currentTarget;
    const email = form.email.value;
    const password = form.password.value;
    
    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      navigate('/library');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in.');
    } finally {
      setIsLoading(false);
    }
  }
  
  async function handleSignUp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    
    const form = event.currentTarget;
    const email = form.email.value;
    const password = form.password.value;
    const name = form.name.value;
    
    try {
      await signUp(email, password, name);
      toast.success('Account created! Welcome to ReadLtr.');
      navigate('/library');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster />
      <header className="border-b">
        <Container>
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="ReadLtr Logo" 
                className="w-8 h-8"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">
                ReadLtr
              </span>
            </div>
            <nav className="flex items-center gap-4">
              <Link to="/features" className="text-sm font-medium hover:underline">
                Features
              </Link>
              <Link to="/pricing" className="text-sm font-medium hover:underline">
                Pricing
              </Link>
              <Link to="/blog" className="text-sm font-medium hover:underline">
                Blog
              </Link>
            </nav>
          </div>
        </Container>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-20">
          <Container>
            <div className="grid gap-8 md:grid-cols-2 md:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Save articles for later, read anywhere
                </h1>
                <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  ReadLtr helps you save articles, blog posts, and anything else you find on the web, so you can read them later—distraction-free, on any device, even offline.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <a href="#get-started">
                    <Button className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700">
                      Get Started
                    </Button>
                  </a>
                  <a href="#features">
                    <Button variant="outline">Learn More</Button>
                  </a>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <img
                  src="/hero-image.png"
                  alt="ReadLtr App Preview"
                  width={550}
                  height={400}
                  className="rounded-lg shadow-lg border border-gray-200 dark:border-gray-800"
                />
              </div>
            </div>
          </Container>
        </section>
        <section className="py-12 bg-gray-50 dark:bg-gray-900" id="features">
          <Container>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tighter">
                All the features you need
              </h2>
              <p className="text-gray-500 md:text-xl/relaxed mt-2">
                Everything designed to provide the best reading experience
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
                    <path d="M8 7h6"></path>
                    <path d="M8 11h8"></path>
                    <path d="M8 15h5"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Clean Reading Experience</h3>
                <p className="text-gray-500 mt-2">
                  Articles are presented in a clean, customizable view without ads or distractions.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400">
                    <path d="M3 2v5"></path>
                    <path d="M7 2v5"></path>
                    <path d="M10 7h10a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h3"></path>
                    <path d="M5 12h14"></path>
                    <path d="M5 16h14"></path>
                    <path d="M5 20h7"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Organize with Tags</h3>
                <p className="text-gray-500 mt-2">
                  Add custom tags to organize your reading list just the way you want.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600 dark:text-amber-400">
                    <path d="M14 12a4 4 0 0 0-8 0Z"></path>
                    <path d="M14 4a8 8 0 0 1 0 16"></path>
                    <path d="M6 19v2"></path>
                    <path d="M18 7v4"></path>
                    <path d="M18 3v2"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Read Offline</h3>
                <p className="text-gray-500 mt-2">
                  Articles are available offline on all your devices for reading anytime.
                </p>
              </div>
            </div>
          </Container>
        </section>
        <section className="py-12 md:py-20" id="get-started">
          <Container>
            <div className="mx-auto max-w-md space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">Start reading smarter</h2>
                <p className="text-gray-500">
                  Sign up for free and start saving articles today
                </p>
              </div>
              <div className="border rounded-lg p-6 shadow-sm">
                <Tabs defaultValue="signin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" placeholder="you@example.com" required type="email" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password">Password</Label>
                          <Link to="/forgot-password" className="text-sm text-amber-600 hover:underline">
                            Forgot password?
                          </Link>
                        </div>
                        <Input id="password" name="password" required type="password" />
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                    </form>
                  </TabsContent>
                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" placeholder="John Smith" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-signup">Email</Label>
                        <Input id="email-signup" name="email" placeholder="you@example.com" required type="email" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-signup">Password</Label>
                        <Input id="password-signup" name="password" required type="password" minLength={8} />
                        <p className="text-xs text-gray-500">Must be at least 8 characters</p>
                      </div>
                      <Button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700" disabled={isLoading}>
                        {isLoading ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </Container>
        </section>
        <section className="py-12 bg-gray-50 dark:bg-gray-900">
          <Container>
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Ready to simplify your reading?</h2>
              <p className="text-gray-500 mx-auto max-w-[600px]">
                Join thousands of readers who use ReadLtr to save and organize articles from around the web
              </p>
              <div className="flex justify-center gap-4">
                <Button className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700">
                  Get Started for Free
                </Button>
                <Link to="/demo">
                  <Button variant="outline">View Demo</Button>
                </Link>
              </div>
              <div className="flex justify-center gap-4 mt-6">
                <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium hover:underline">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="4"></circle>
                    <line x1="21.17" y1="8" x2="12" y2="8"></line>
                    <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
                    <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
                  </svg>
                  Chrome Extension
                </a>
                <a href="https://addons.mozilla.org" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium hover:underline">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                  Firefox Add-on
                </a>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <footer className="border-t py-6">
        <Container>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="ReadLtr Logo" 
                className="w-6 h-6"
              />
              <span className="text-sm font-medium">ReadLtr</span>
              <span className="text-sm text-gray-500">© 2023</span>
            </div>
            <div className="flex gap-4">
              <Link to="/privacy" className="text-sm text-gray-500 hover:underline">Privacy</Link>
              <Link to="/terms" className="text-sm text-gray-500 hover:underline">Terms</Link>
              <Link to="/contact" className="text-sm text-gray-500 hover:underline">Contact</Link>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
} 