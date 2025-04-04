import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ToasterProvider } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "./lib/api.tsx";
import { OfflineProvider } from "./contexts/OfflineContext";
import React, { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { addSampleArticles } from "./lib/sampleArticles";
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
          await addSampleArticles(user.id);

          // Update profile to mark sample articles as added
          await supabase
            .from('profiles')
            .update({ has_sample_articles: true })
            .eq('id', user.id);
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
        <Route path="/tags" component={Tags} />
        <Route path="/tags/:tag" component={Tags} />
        <Route path="/article/:id" component={Article} />
        <Route path="/settings" component={Settings} />
        <Route path="/help" component={Help} />
        <Route path="/save" component={SaveArticle} />
        <Route path="/mobile" component={MobileAppPage} />

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
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
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
