import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserTopicInterests, updateTopicInterest } from '@/lib/analyticsService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Hash, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/use-toast';
import { useState } from 'react';

/**
 * Topic Interests Component
 * 
 * Displays and manages user's topic interests
 */
export default function TopicInterests() {
  const [newTopic, setNewTopic] = useState('');
  const [newInterestLevel, setNewInterestLevel] = useState([50]);
  const queryClient = useQueryClient();
  
  // Fetch user topic interests
  const { data: topics = [], isLoading } = useQuery({
    queryKey: ['topicInterests'],
    queryFn: getUserTopicInterests,
    refetchOnWindowFocus: false,
  });
  
  // Update topic interest mutation
  const updateInterestMutation = useMutation({
    mutationFn: ({ topic, interestLevel }: { topic: string; interestLevel: number }) =>
      updateTopicInterest(topic, interestLevel),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['topicInterests'] });
      toast({
        title: 'Interest updated',
        description: 'Your topic interest has been updated successfully.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update interest. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Handle adding a new topic
  const handleAddTopic = () => {
    if (!newTopic.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a topic name.',
        variant: 'destructive',
      });
      return;
    }
    
    updateInterestMutation.mutate({
      topic: newTopic.trim(),
      interestLevel: newInterestLevel[0] / 100,
    });
    
    setNewTopic('');
    setNewInterestLevel([50]);
  };
  
  // Handle updating interest level
  const handleUpdateInterest = (topic: string, interestLevel: number) => {
    updateInterestMutation.mutate({
      topic,
      interestLevel: interestLevel / 100,
    });
  };
  
  if (isLoading) {
    return (
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Topic Interests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
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
          <Hash className="h-5 w-5" />
          Topic Interests
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Add new topic */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Add a new topic..."
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                className="bg-zinc-800 border-zinc-700"
              />
              <Button onClick={handleAddTopic} disabled={updateInterestMutation.isPending}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="pt-2">
              <div className="flex justify-between text-sm text-zinc-400 mb-1">
                <span>Low Interest</span>
                <span>High Interest</span>
              </div>
              <Slider
                value={newInterestLevel}
                onValueChange={setNewInterestLevel}
                max={100}
                step={1}
                className="py-1"
              />
            </div>
          </div>
          
          {/* Topic list */}
          {topics.length === 0 ? (
            <div className="text-center py-6 text-zinc-500">
              <Hash className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>You haven't set any topic interests yet.</p>
              <p className="text-sm">Add topics you're interested in to get better recommendations.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topics.map((topic) => (
                <div key={topic.id} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 mr-2 text-blue-400" />
                      <span className="font-medium">{topic.topic}</span>
                    </div>
                    <span className="text-sm text-zinc-400">
                      {Math.round(topic.interest_level * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[Math.round(topic.interest_level * 100)]}
                    onValueChange={(value) => {
                      if (value[0] !== Math.round(topic.interest_level * 100)) {
                        handleUpdateInterest(topic.topic, value[0]);
                      }
                    }}
                    max={100}
                    step={1}
                    className="py-1"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
