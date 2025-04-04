import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Bookmark, 
  Tag, 
  Share2, 
  Settings, 
  Search,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { startTour } from './OnboardingTour';
import { toast } from '@/components/ui/toast';
import { useNavigate } from 'react-router-dom';

interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
  action: () => void;
}

interface OnboardingProfile {
  id: string;
  has_seen_welcome: boolean;
  has_completed_tour: boolean;
  has_sample_articles: boolean;
  has_created_tag: boolean;
  has_saved_article: boolean;
  has_completed_onboarding: boolean;
  onboarding_step: number;
}

/**
 * Onboarding Dashboard Component
 * 
 * Provides a comprehensive dashboard for users to complete their onboarding
 * with progress tracking and guided tasks
 */
export default function OnboardingDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  
  // Fetch user profile and onboarding status
  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('id, has_seen_welcome, has_completed_tour, has_sample_articles, has_created_tag, has_saved_article, has_completed_onboarding, onboarding_step')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        setProfile(data);
        
        // Calculate progress
        if (data) {
          const tasks = [
            data.has_seen_welcome,
            data.has_completed_tour,
            data.has_sample_articles,
            data.has_created_tag,
            data.has_saved_article
          ];
          
          const completedTasks = tasks.filter(Boolean).length;
          const progressPercentage = Math.round((completedTasks / tasks.length) * 100);
          setProgress(progressPercentage);
          
          // If all tasks are completed but onboarding is not marked as complete
          if (progressPercentage === 100 && !data.has_completed_onboarding) {
            completeOnboarding();
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [user]);
  
  // Mark onboarding as complete
  const completeOnboarding = async () => {
    if (!user || !profile) return;
    
    try {
      await supabase
        .from('profiles')
        .update({ 
          has_completed_onboarding: true,
          onboarding_step: 100
        })
        .eq('id', user.id);
      
      // Update local state
      setProfile({
        ...profile,
        has_completed_onboarding: true,
        onboarding_step: 100
      });
      
      // Show completion message
      toast({
        title: 'Onboarding Complete!',
        description: 'You\'ve completed all onboarding tasks. Enjoy using ReadLtr!',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };
  
  // Start the guided tour
  const handleStartTour = () => {
    if (!user) return;
    startTour(user.id);
  };
  
  // Navigate to add article page
  const handleAddArticle = () => {
    navigate('/add');
  };
  
  // Navigate to tags page
  const handleManageTags = () => {
    navigate('/tags');
  };
  
  // Navigate to settings page
  const handleSettings = () => {
    navigate('/settings');
  };
  
  // Define onboarding tasks
  const tasks: OnboardingTask[] = [
    {
      id: 'welcome',
      title: 'Welcome to ReadLtr',
      description: 'Get introduced to the app and its features',
      icon: <BookOpen className="h-5 w-5 text-blue-500" />,
      completed: profile?.has_seen_welcome || false,
      action: () => {} // Already completed during signup
    },
    {
      id: 'tour',
      title: 'Take the Guided Tour',
      description: 'Learn how to use the app with a step-by-step guide',
      icon: <Search className="h-5 w-5 text-purple-500" />,
      completed: profile?.has_completed_tour || false,
      action: handleStartTour
    },
    {
      id: 'sample',
      title: 'Explore Sample Articles',
      description: 'Browse through sample articles to see how the app works',
      icon: <BookOpen className="h-5 w-5 text-green-500" />,
      completed: profile?.has_sample_articles || false,
      action: () => navigate('/') // Go to home page to see sample articles
    },
    {
      id: 'save',
      title: 'Save Your First Article',
      description: 'Add an article to your reading list',
      icon: <Bookmark className="h-5 w-5 text-amber-500" />,
      completed: profile?.has_saved_article || false,
      action: handleAddArticle
    },
    {
      id: 'tag',
      title: 'Create a Tag',
      description: 'Organize your articles with tags',
      icon: <Tag className="h-5 w-5 text-red-500" />,
      completed: profile?.has_created_tag || false,
      action: handleManageTags
    }
  ];
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
      </div>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Getting Started with ReadLtr</span>
          {progress === 100 && (
            <span className="text-sm bg-green-900/30 text-green-400 px-2 py-1 rounded-full flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Complete
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Complete these tasks to get the most out of ReadLtr
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Your progress</span>
            <span>{progress}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        {/* Tasks list */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <div 
              key={task.id}
              className={`p-4 rounded-lg border flex items-start gap-4 ${
                task.completed 
                  ? 'bg-green-900/10 border-green-900/20' 
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="mt-1">
                {task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-zinc-500" />
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium flex items-center gap-2">
                  {task.icon}
                  {task.title}
                  {task.completed && (
                    <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full">
                      Completed
                    </span>
                  )}
                </h3>
                <p className="text-sm text-zinc-400 mt-1">{task.description}</p>
              </div>
              
              {!task.completed && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={task.action}
                  className="mt-1"
                >
                  Start
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t border-zinc-800 pt-6">
        <Button variant="outline" onClick={handleSettings}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
        
        {progress < 100 ? (
          <Button onClick={() => navigate('/')}>
            Continue to App
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button variant="default" onClick={() => navigate('/')}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            All Tasks Complete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
