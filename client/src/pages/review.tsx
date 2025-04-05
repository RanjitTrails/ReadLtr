import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, BookOpen, ArrowRight, Check, X, ThumbsUp, ThumbsDown } from 'lucide-react';
import { getHighlightsForReview, recordReviewResponse } from '@/lib/spacedRepetition';
import { Link } from 'wouter';
import { toast } from '@/components/ui/toast';

export default function ReviewPage() {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Fetch highlights for review
  const { data: highlights, isLoading, error } = useQuery({
    queryKey: ['highlights', 'review'],
    queryFn: getHighlightsForReview,
  });

  // Reset state when highlights change
  useEffect(() => {
    setCurrentIndex(0);
    setShowAnswer(false);
    setIsCompleted(false);
  }, [highlights]);

  // Current highlight
  const currentHighlight = highlights && highlights.length > 0 ? highlights[currentIndex] : null;

  // Handle "Show Answer" button click
  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  // Handle quality rating
  const handleRateQuality = async (quality: number) => {
    if (!currentHighlight) return;

    try {
      await recordReviewResponse(currentHighlight.id, quality);
      
      // Move to next highlight or complete
      if (currentIndex < highlights!.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        setIsCompleted(true);
        // Invalidate queries to refresh the review count
        queryClient.invalidateQueries({ queryKey: ['highlights', 'review'] });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record your response',
        variant: 'destructive',
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Daily Review</h1>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-500" />
                <CardTitle>Spaced Repetition</CardTitle>
              </div>
              <CardDescription>
                Review your highlights to remember what you've read
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Daily Review</h1>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-500" />
                <CardTitle>Spaced Repetition</CardTitle>
              </div>
              <CardDescription>
                Review your highlights to remember what you've read
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 text-red-500">
                <p>Error loading highlights for review</p>
                <p className="text-sm">{(error as Error).message}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // No highlights to review
  if (!highlights || highlights.length === 0) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Daily Review</h1>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-500" />
                <CardTitle>Spaced Repetition</CardTitle>
              </div>
              <CardDescription>
                Review your highlights to remember what you've read
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 text-zinc-500">
                <p>No highlights to review today</p>
                <p className="text-sm mt-2">
                  Highlights will appear here when they're due for review
                </p>
                <div className="mt-6">
                  <Link href="/highlights">
                    <Button variant="outline" className="mr-2">
                      View All Highlights
                    </Button>
                  </Link>
                  <Link href="/list">
                    <Button>
                      Read Something New
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Review completed
  if (isCompleted) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Daily Review</h1>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-500" />
                <CardTitle>Review Complete!</CardTitle>
              </div>
              <CardDescription>
                You've reviewed all your highlights for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mb-4">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-medium mb-2">Great job!</h3>
                <p className="text-zinc-500 mb-6">
                  You've reviewed {highlights.length} highlight{highlights.length !== 1 ? 's' : ''} today.
                  Come back tomorrow for more reviews.
                </p>
                <div className="flex justify-center gap-4">
                  <Link href="/highlights">
                    <Button variant="outline">
                      View All Highlights
                    </Button>
                  </Link>
                  <Link href="/list">
                    <Button>
                      Read Something New
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Review in progress
  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Daily Review</h1>
          <div className="text-sm text-zinc-500">
            {currentIndex + 1} of {highlights.length}
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <CardTitle>Spaced Repetition</CardTitle>
            </div>
            <CardDescription>
              Try to recall the context of this highlight
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <blockquote className="border-l-4 border-purple-500 pl-4 italic text-zinc-300 py-2">
                "{currentHighlight?.text}"
              </blockquote>

              {showAnswer ? (
                <div className="space-y-4">
                  <div className="p-4 bg-zinc-800 rounded-md">
                    <div className="flex items-center mb-2">
                      <BookOpen className="h-4 w-4 mr-2 text-blue-400" />
                      <h3 className="font-medium">From article:</h3>
                    </div>
                    <Link href={`/article/${currentHighlight?.articleId}`}>
                      <a className="text-blue-400 hover:underline">
                        {currentHighlight?.article?.title || 'Unknown Article'}
                      </a>
                    </Link>
                  </div>

                  {currentHighlight?.note && (
                    <div className="p-4 bg-zinc-800 rounded-md">
                      <h3 className="font-medium mb-2">Your note:</h3>
                      <p className="text-zinc-300">{currentHighlight.note}</p>
                    </div>
                  )}

                  <div className="pt-4">
                    <h3 className="font-medium mb-3">How well did you remember this?</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        variant="outline" 
                        className="border-red-500 text-red-500 hover:bg-red-500/10"
                        onClick={() => handleRateQuality(1)}
                      >
                        <ThumbsDown className="h-4 w-4 mr-2" />
                        Not at all
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                        onClick={() => handleRateQuality(3)}
                      >
                        <span className="mr-2">😐</span>
                        Somewhat
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-green-500 text-green-500 hover:bg-green-500/10"
                        onClick={() => handleRateQuality(5)}
                      >
                        <ThumbsUp className="h-4 w-4 mr-2" />
                        Perfectly
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center py-8">
                  <Button size="lg" onClick={handleShowAnswer}>
                    Show Answer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t border-zinc-800 pt-4 flex justify-between">
            <div className="text-sm text-zinc-500">
              Reviewing helps you remember what you've read
            </div>
            <div className="flex items-center">
              <Link href={`/article/${currentHighlight?.articleId}`}>
                <Button variant="ghost" size="sm">
                  View Article
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
