import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ToasterProvider } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "./lib/api.tsx";
import { OfflineProvider } from "./contexts/OfflineContext";
import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { addSampleArticles } from "./lib/sampleArticles";
import { toast } from "@/components/ui/toast";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import List from "@/pages/list";
import Favorites from "@/pages/favorites";
import Archive from "@/pages/archive";
import Tags from "@/pages/tags";
import Article from "@/pages/article";
import Settings from "@/pages/settings";
import Help from "@/pages/help";
import SaveArticle from "@/pages/save";
import MobileAppPage from "@/pages/mobile";
import Bookmarklet from "@/components/browser-extension/Bookmarklet";
import ChromeExtension from "@/components/browser-extension/ChromeExtension";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import WelcomeScreen from "@/components/onboarding/WelcomeScreen";
import OnboardingDashboard from "@/components/onboarding/OnboardingDashboard";
import Layout from "@/components/Layout";
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

  return (
    <>
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
        <Route path="/later" component={React.lazy(() => import('./pages/later'))} />
        <Route path="/highlights" component={React.lazy(() => import('./pages/highlights'))} />
        <Route path="/tags" component={Tags} />
        <Route path="/tags/:tag" component={Tags} />
        <Route path="/article/:id" component={Article} />
        <Route path="/settings" component={Settings} />
        <Route path="/help" component={Help} />
        <Route path="/save" component={SaveArticle} />
        <Route path="/mobile" component={MobileAppPage} />

        {/* List routes for different content types */}
        <Route path="/list/articles">
          {() => {
            const ArticlesPage = React.lazy(() => import('./pages/list/articles'));
            return (
              <React.Suspense fallback={<div>Loading...</div>}>
                <ArticlesPage />
              </React.Suspense>
            );
          }}
        </Route>
        <Route path="/list/books">
          {() => {
            const BooksPage = React.lazy(() => import('./pages/list/books'));
            return (
              <React.Suspense fallback={<div>Loading...</div>}>
                <BooksPage />
              </React.Suspense>
            );
          }}
        </Route>
        <Route path="/list/emails">
          {() => {
            const EmailsPage = React.lazy(() => import('./pages/list/emails'));
            return (
              <React.Suspense fallback={<div>Loading...</div>}>
                <EmailsPage />
              </React.Suspense>
            );
          }}
        </Route>
        <Route path="/list/pdfs">
          {() => {
            const PDFsPage = React.lazy(() => import('./pages/list/pdfs'));
            return (
              <React.Suspense fallback={<div>Loading...</div>}>
                <PDFsPage />
              </React.Suspense>
            );
          }}
        </Route>
        <Route path="/list/tweets">
          {() => {
            const TweetsPage = React.lazy(() => import('./pages/list/tweets'));
            return (
              <React.Suspense fallback={<div>Loading...</div>}>
                <TweetsPage />
              </React.Suspense>
            );
          }}
        </Route>
        <Route path="/list/videos">
          {() => {
            const VideosPage = React.lazy(() => import('./pages/list/videos'));
            return (
              <React.Suspense fallback={<div>Loading...</div>}>
                <VideosPage />
              </React.Suspense>
            );
          }}
        </Route>
        <Route path="/list/tags">
          {() => {
            const TagsListPage = React.lazy(() => import('./pages/list/tags'));
            return (
              <React.Suspense fallback={<div>Loading...</div>}>
                <TagsListPage />
              </React.Suspense>
            );
          }}
        </Route>

        {/* Analytics routes */}
        <Route path="/analytics">
          {() => {
            const AnalyticsDashboard = React.lazy(() => import('./pages/analytics/index'));
            return (
              <React.Suspense fallback={<div>Loading...</div>}>
                <AnalyticsDashboard />
              </React.Suspense>
            );
          }}
        </Route>

        {/* Social features routes */}
        <Route path="/profile/:id">
          {({ id }) => {
            const ProfilePage = React.lazy(() => import('./pages/profile/[id]'));
            return (
              <React.Suspense fallback={<div>Loading...</div>}>
                <ProfilePage />
              </React.Suspense>
            );
          }}
        </Route>

        <Route path="/collections">
          {() => {
            const CollectionsPage = React.lazy(() => import('./pages/collections/index'));
            return (
              <React.Suspense fallback={<div>Loading...</div>}>
                <CollectionsPage />
              </React.Suspense>
            );
          }}
        </Route>

        <Route path="/collections/new">
          {() => {
            const NewCollectionPage = React.lazy(() => import('./pages/collections/new'));
            return (
              <React.Suspense fallback={<div>Loading...</div>}>
                <NewCollectionPage />
              </React.Suspense>
            );
          }}
        </Route>

        <Route path="/shared/article/:id">
          {({ id }) => {
            const SharedArticlePage = React.lazy(() => import('./pages/shared/article/[id]'));
            return (
              <React.Suspense fallback={<div>Loading...</div>}>
                <SharedArticlePage />
              </React.Suspense>
            );
          }}
        </Route>

        <Route path="/extensions/bookmarklet">
          {() => (
            <div className="container mx-auto p-4 py-8">
              <h1 className="text-2xl font-bold mb-6">Browser Extensions</h1>
              <Bookmarklet />
            </div>
          )}
        </Route>
        <Route path="/extensions/chrome">
          {() => (
            <div className="container mx-auto p-4 py-8">
              <h1 className="text-2xl font-bold mb-6">Browser Extensions</h1>
              <ChromeExtension />
            </div>
          )}
        </Route>

        <Route path="/onboarding">
          {() => (
            <Layout>
              <div className="max-w-3xl mx-auto py-8">
                <OnboardingDashboard />
              </div>
            </Layout>
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  const [isRecoveringSession, setIsRecoveringSession] = useState(true);

  // Recover session on app start
  useEffect(() => {
    const recoverSession = async () => {
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          console.log('Session recovered successfully');
        }
      } catch (error) {
        console.error('Session recovery error:', error);
      } finally {
        setIsRecoveringSession(false);
      }
    };

    recoverSession();
  }, []);

  // Show loading state while recovering session
  if (isRecoveringSession) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OfflineProvider>
          <ToasterProvider>
            <Router />
          </ToasterProvider>
        </OfflineProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
