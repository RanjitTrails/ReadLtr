import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ToasterProvider } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "./lib/api.tsx";
import { OfflineProvider } from "./contexts/OfflineContext";
import React, { useEffect, useState, Suspense, lazy } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { supabase } from "./lib/supabase";
import { addSampleArticles } from "./lib/sampleArticles";
import { toast } from "@/components/ui/toast";

// Eagerly loaded components (critical for initial render)
import Layout from "@/components/Layout";

// Lazily loaded components
const NotFound = lazy(() => import("@/pages/not-found"));
const Home = lazy(() => import("@/pages/home"));
const Login = lazy(() => import("@/pages/login"));
const Register = lazy(() => import("@/pages/register"));
const List = lazy(() => import("@/pages/list"));
const Favorites = lazy(() => import("@/pages/favorites"));
const Archive = lazy(() => import("@/pages/archive"));
const Tags = lazy(() => import("@/pages/tags"));
const Article = lazy(() => import("@/pages/article"));
const Settings = lazy(() => import("@/pages/settings"));
const Help = lazy(() => import("@/pages/help"));
const SaveArticle = lazy(() => import("@/pages/save"));
const MobileAppPage = lazy(() => import("@/pages/mobile"));
const Bookmarklet = lazy(() => import("@/components/browser-extension/Bookmarklet"));
const ChromeExtension = lazy(() => import("@/components/browser-extension/ChromeExtension"));
const ForgotPassword = lazy(() => import("@/pages/forgot-password"));
const ResetPassword = lazy(() => import("@/pages/reset-password"));
const WelcomeScreen = lazy(() => import("@/components/onboarding/WelcomeScreen"));
const OnboardingDashboard = lazy(() => import("@/components/onboarding/OnboardingDashboard"));
import "@/components/onboarding/onboarding.css";

function Router() {
  const [location] = useLocation();
  const { user, isLoading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  // Check if user needs to see the welcome screen
  useEffect(() => {
    if (user && !isLoading) {
      const checkOnboardingStatus = async () => {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_seen_welcome, has_sample_articles')
          .eq('id', user.id)
          .single();

        // If user hasn't seen welcome screen, show it
        if (profile && !profile.has_seen_welcome) {
          setShowWelcome(true);
        }

        // If user doesn't have sample articles, add them
        if (profile && !profile.has_sample_articles) {
          try {
            // Add sample articles
            const addedCount = await addSampleArticles(user.id);

            // Update profile to mark sample articles as added
            await supabase
              .from('profiles')
              .update({
                has_sample_articles: true,
                onboarding_step: Math.max(profile.onboarding_step || 0, 5) // At least reached step 5
              })
              .eq('id', user.id);

            // Only show notification if not showing welcome screen
            // (welcome screen will show its own notification)
            if (!showWelcome && addedCount > 0) {
              setTimeout(() => {
                toast({
                  title: 'Sample Content Added',
                  description: `We've added ${addedCount} sample articles to help you get started.`,
                  variant: 'default'
                });
              }, 1500);
            }
          } catch (error) {
            console.error('Failed to add sample articles:', error);
          }
        }

        // Update last login time
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', user.id);
      };

      checkOnboardingStatus();
    }
  }, [user, isLoading]);

  // Loading fallback component
  const LoadingFallback = () => (
    <div className="flex items-center justify-center h-screen bg-zinc-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        {showWelcome && <WelcomeScreen onComplete={() => setShowWelcome(false)} />}

        <Switch>
          <Route path="/" component={Home} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/list" component={List} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/archive" component={Archive} />
          <Route path="/later" component={lazy(() => import('./pages/later'))} />
          <Route path="/highlights" component={lazy(() => import('./pages/highlights'))} />
          <Route path="/tags" component={Tags} />
          <Route path="/tags/:tag" component={Tags} />
          <Route path="/article/:id" component={Article} />
          <Route path="/settings" component={Settings} />
          <Route path="/help" component={Help} />
          <Route path="/save" component={SaveArticle} />
          <Route path="/mobile" component={MobileAppPage} />

        {/* List routes for different content types */}
        <Route path="/list/articles" component={lazy(() => import('./pages/list/articles'))} />
        <Route path="/list/books" component={lazy(() => import('./pages/list/books'))} />
        <Route path="/list/emails" component={lazy(() => import('./pages/list/emails'))} />
        <Route path="/list/pdfs" component={lazy(() => import('./pages/list/pdfs'))} />
        <Route path="/list/tweets" component={lazy(() => import('./pages/list/tweets'))} />
        <Route path="/list/videos" component={lazy(() => import('./pages/list/videos'))} />
        <Route path="/list/tags" component={lazy(() => import('./pages/list/tags'))} />

        {/* Analytics routes */}
        <Route path="/analytics" component={lazy(() => import('./pages/analytics/index'))} />

        {/* Social features routes */}
        <Route path="/profile/:id" component={({ id }) => {
          const ProfilePage = lazy(() => import('./pages/profile/[id]'));
          return <ProfilePage id={id} />;
        }} />

        <Route path="/collections" component={lazy(() => import('./pages/collections/index'))} />
        <Route path="/collections/new" component={lazy(() => import('./pages/collections/new'))} />

        <Route path="/shared/article/:id" component={({ id }) => {
          const SharedArticlePage = lazy(() => import('./pages/shared/article/[id]'));
          return <SharedArticlePage id={id} />;
        }} />

        <Route path="/extensions/bookmarklet" component={() => (
          <div className="container mx-auto p-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Browser Extensions</h1>
            <Bookmarklet />
          </div>
        )} />

        <Route path="/extensions/chrome" component={() => (
          <div className="container mx-auto p-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Browser Extensions</h1>
            <ChromeExtension />
          </div>
        )} />

        <Route path="/onboarding" component={() => (
          <Layout>
            <div className="max-w-3xl mx-auto py-8">
              <OnboardingDashboard />
            </div>
          </Layout>
        )} />

        <Route component={NotFound} />
      </Switch>
      </Suspense>
    </>
  );
}

function App() {
  const [isRecoveringSession, setIsRecoveringSession] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Recover session on app start
  useEffect(() => {
    const recoverSession = async () => {
      try {
        console.log('Attempting to recover session...');
        // Check for existing session
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session recovery error from Supabase:', sessionError);
          throw sessionError;
        }

        if (data?.session) {
          console.log('Session recovered successfully');
        } else {
          console.log('No existing session found');
        }
      } catch (error) {
        console.error('Session recovery error:', error);
        // Don't set error state here to allow the app to continue without a session
      } finally {
        setIsRecoveringSession(false);
      }
    };

    // Add a timeout to ensure we don't get stuck in loading state
    const timeoutId = setTimeout(() => {
      console.warn('Session recovery timed out');
      setIsRecoveringSession(false);
    }, 5000); // 5 second timeout

    recoverSession().finally(() => clearTimeout(timeoutId));

    return () => clearTimeout(timeoutId);
  }, []);

  // Show loading state while recovering session
  if (isRecoveringSession) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If there's an error, show it
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900 p-4 text-center">
        <div className="max-w-md w-full bg-zinc-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-400 mb-4">Application Error</h2>
          <p className="text-zinc-300 mb-4">
            We're sorry, but there was an error loading the application.
          </p>
          <div className="bg-zinc-900 p-3 rounded mb-4 overflow-auto max-h-32 text-left">
            <p className="text-red-300 text-sm font-mono">
              {error.message || 'Unknown error'}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  // Add a useEffect to mark the app as loaded
  useEffect(() => {
    // Add a class to the root element to indicate the app has loaded
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.classList.add('app-loaded');
    }

    // Log that the app has fully loaded
    console.log('App fully loaded and rendered');
  }, []);

  // Wrap everything in error boundaries for better error handling
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <AuthProvider>
            <ErrorBoundary>
              <OfflineProvider>
                <ErrorBoundary>
                  <ToasterProvider>
                    <ErrorBoundary>
                      <Router />
                    </ErrorBoundary>
                  </ToasterProvider>
                </ErrorBoundary>
              </OfflineProvider>
            </ErrorBoundary>
          </AuthProvider>
        </ErrorBoundary>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
