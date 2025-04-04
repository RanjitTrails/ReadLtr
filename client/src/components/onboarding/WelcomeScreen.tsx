import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Bookmark, Tag, Star, Archive, Search, Share, Info } from 'lucide-react';
import { useAuth } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { startTour } from './OnboardingTour';
import { toast } from '@/components/ui/toast';

export default function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('welcome');

  const handleStartTour = async () => {
    // Mark the user as having seen the welcome screen
    if (user) {
      await supabase
        .from('profiles')
        .update({
          has_seen_welcome: true,
          onboarding_step: 25 // Starting the tour
        })
        .eq('id', user.id);
    }

    // Close the welcome screen
    onComplete();

    // Start the guided tour with the user ID
    startTour(user?.id);

    // Show notification about sample articles
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('has_sample_articles')
        .eq('id', user.id)
        .single();

      if (data?.has_sample_articles) {
        toast({
          title: 'Sample Articles Added',
          description: 'We\'ve added some sample articles to help you get started.',
          variant: 'default'
        });
      }
    }
  };

  const handleSkip = async () => {
    // Mark the user as having seen the welcome screen
    if (user) {
      await supabase
        .from('profiles')
        .update({
          has_seen_welcome: true,
          onboarding_step: 10 // Skipped the tour
        })
        .eq('id', user.id);

      // Show notification about sample articles
      const { data } = await supabase
        .from('profiles')
        .select('has_sample_articles')
        .eq('id', user.id)
        .single();

      if (data?.has_sample_articles) {
        setTimeout(() => {
          toast({
            title: 'Sample Articles Added',
            description: 'We\'ve added some sample articles to help you get started.',
            variant: 'default'
          });
        }, 1000); // Delay to avoid showing immediately after welcome screen closes
      }
    }

    // Close the welcome screen
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-500" />
            Welcome to ReadLtr
          </CardTitle>
          <CardDescription>
            Your personal read-it-later app for saving and organizing web content
          </CardDescription>
        </CardHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="welcome">Welcome</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="getStarted">Get Started</TabsTrigger>
          </TabsList>

          <TabsContent value="welcome" className="p-4">
            <div className="text-center py-6">
              <h3 className="text-xl font-medium mb-4">Welcome to ReadLtr!</h3>
              <p className="mb-4">
                ReadLtr helps you save articles, blog posts, and other web content to read when you have time.
              </p>
              <div className="flex justify-center">
                <img
                  src="/welcome-illustration.svg"
                  alt="Welcome illustration"
                  className="w-64 h-64 opacity-90"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="features" className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Bookmark className="h-5 w-5 text-blue-500" />}
                title="Save Articles"
                description="Save articles from any website with one click using our browser extension."
              />
              <FeatureCard
                icon={<BookOpen className="h-5 w-5 text-green-500" />}
                title="Distraction-Free Reading"
                description="Enjoy a clean, focused reading experience without ads or clutter."
              />
              <FeatureCard
                icon={<Tag className="h-5 w-5 text-purple-500" />}
                title="Organize with Tags"
                description="Categorize your articles with tags for easy organization and retrieval."
              />
              <FeatureCard
                icon={<Star className="h-5 w-5 text-yellow-500" />}
                title="Favorite Articles"
                description="Mark your favorite articles to find them quickly later."
              />
              <FeatureCard
                icon={<Archive className="h-5 w-5 text-red-500" />}
                title="Archive Read Content"
                description="Keep your reading list clean by archiving articles you've finished."
              />
              <FeatureCard
                icon={<Search className="h-5 w-5 text-indigo-500" />}
                title="Powerful Search"
                description="Find any saved article quickly with our powerful search feature."
              />
            </div>
          </TabsContent>

          <TabsContent value="getStarted" className="p-4">
            <div className="space-y-4">
              <h3 className="text-xl font-medium">Getting Started</h3>
              <p>
                Let's set up your account and show you how to use ReadLtr effectively.
              </p>

              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-blue-500" />
                  Step 1: Save your first article
                </h4>
                <p className="text-zinc-400 text-sm">
                  Go to the "Save" page and enter a URL to save your first article.
                </p>
              </div>

              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-purple-500" />
                  Step 2: Organize with tags
                </h4>
                <p className="text-zinc-400 text-sm">
                  Add tags to your articles to keep them organized by topic or priority.
                </p>
              </div>

              <div className="bg-zinc-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Share className="h-4 w-4 text-green-500" />
                  Step 3: Install browser extension
                </h4>
                <p className="text-zinc-400 text-sm">
                  Install our browser extension to save articles with one click from any website.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <CardFooter className="flex justify-between border-t border-zinc-800 p-4">
          <Button variant="outline" onClick={handleSkip}>
            Skip
          </Button>

          <div className="flex gap-2">
            {activeTab !== 'welcome' && (
              <Button
                variant="ghost"
                onClick={() => setActiveTab(activeTab === 'features' ? 'welcome' : 'features')}
              >
                Back
              </Button>
            )}

            {activeTab !== 'getStarted' ? (
              <Button
                onClick={() => setActiveTab(activeTab === 'welcome' ? 'features' : 'getStarted')}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleStartTour}>
                Start Tour
              </Button>
            )}
          </div>

          <div className="text-center mt-4 text-sm text-zinc-400">
            You can always access the <a href="/onboarding" className="text-blue-400 hover:underline">onboarding dashboard</a> later
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-zinc-800 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h4 className="font-medium">{title}</h4>
      </div>
      <p className="text-zinc-400 text-sm">{description}</p>
    </div>
  );
}
