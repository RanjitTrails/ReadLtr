import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getArticleRecommendations, 
  markRecommendationAsRead, 
  dismissRecommendation 
} from '@/lib/analyticsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sparkles, 
  BookOpen, 
  ExternalLink, 
  X, 
  ThumbsUp, 
  Clock 
} from 'lucide-react';
import { Link } from 'wouter';
import { toast } from '@/components/ui/use-toast';

/**
 * Recommendations Component
 * 
 * Displays article recommendations based on reading history and interests
 */
export default function Recommendations() {
  const queryClient = useQueryClient();
  
  // Fetch article recommendations
  const { data: recommendations = [], isLoading } = useQuery({
    queryKey: ['articleRecommendations'],
    queryFn: () => getArticleRecommendations(5),
    refetchOnWindowFocus: false,
  });
  
  // Mark recommendation as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markRecommendationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articleRecommendations'] });
    },
  });
  
  // Dismiss recommendation mutation
  const dismissMutation = useMutation({
    mutationFn: dismissRecommendation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articleRecommendations'] });
      toast({
        title: 'Recommendation dismissed',
        description: 'We won\'t show this recommendation again.',
      });
    },
  });
  
  // Handle saving a recommendation
  const handleSaveRecommendation = (recommendation: any) => {
    // Navigate to save page with the URL
    window.location.href = `/save?url=${encodeURIComponent(recommendation.article.url)}`;
    
    // Mark as read
    markAsReadMutation.mutate(recommendation.id);
  };
  
  // Handle dismissing a recommendation
  const handleDismiss = (id: string) => {
    dismissMutation.mutate(id);
  };
  
  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Recommended for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-16 w-16 rounded-md flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          Recommended for You
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <div className="text-center py-6 text-zinc-500">
            <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No recommendations available yet.</p>
            <p className="text-sm">Keep reading to get personalized recommendations.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((recommendation) => (
              <div
                key={recommendation.id}
                className="flex gap-3 p-3 border border-zinc-800 rounded-lg hover:bg-zinc-800/50 transition-colors"
              >
                {recommendation.article.image_url ? (
                  <img
                    src={recommendation.article.image_url}
                    alt={recommendation.article.title}
                    className="h-16 w-16 object-cover rounded-md flex-shrink-0"
                  />
                ) : (
                  <div className="h-16 w-16 bg-zinc-800 rounded-md flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-6 w-6 text-zinc-500" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-sm line-clamp-2">
                      {recommendation.article.title}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-zinc-500 hover:text-zinc-300 -mr-1 -mt-1 flex-shrink-0"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDismiss(recommendation.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {recommendation.reason && (
                    <p className="text-xs text-zinc-500 mt-1">
                      {recommendation.reason}
                    </p>
                  )}
                  
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleSaveRecommendation(recommendation);
                      }}
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    
                    {recommendation.article.read_time && (
                      <div className="flex items-center text-xs text-zinc-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {recommendation.article.read_time} min
                      </div>
                    )}
                    
                    <a
                      href={recommendation.article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-xs text-zinc-500 hover:text-zinc-300 flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsReadMutation.mutate(recommendation.id);
                      }}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Original
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
