import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  Bookmark,
  Globe,
  Lock,
  Image,
  Loader2
} from 'lucide-react';
import { createCollection } from '@/lib/socialService';
import { toast } from '@/components/ui/toast';

export default function NewCollectionPage() {
  const [, navigate] = useLocation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');

  // Create collection mutation
  const createMutation = useMutation({
    mutationFn: createCollection,
    onSuccess: (data) => {
      toast({
        title: "Collection created",
        description: "Your new collection has been created successfully."
      });
      navigate(`/collections/${data?.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create collection. Please try again.",
        variant: "destructive"
      });
      console.error('Error creating collection:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Collection name is required.",
        variant: "destructive"
      });
      return;
    }

    createMutation.mutate({
      name,
      description: description || undefined,
      is_public: isPublic,
      cover_image_url: coverImageUrl || undefined
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/collections')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Collections
          </Button>

          <h1 className="text-2xl font-bold text-white">Create New Collection</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Collection Name</Label>
            <Input
              id="name"
              placeholder="Enter collection name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-zinc-900 border-zinc-800"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe what this collection is about"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-zinc-900 border-zinc-800 min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImage">Cover Image URL (optional)</Label>
            <Input
              id="coverImage"
              placeholder="https://example.com/image.jpg"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              className="bg-zinc-900 border-zinc-800"
            />
            {coverImageUrl && (
              <div className="mt-2 relative h-32 bg-zinc-800 rounded-md overflow-hidden">
                <img
                  src={coverImageUrl}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/600x400/1f1f23/3f3f46?text=Invalid+Image+URL';
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
            <Label htmlFor="public" className="flex items-center gap-2">
              {isPublic ? (
                <>
                  <Globe className="h-4 w-4 text-blue-400" />
                  <span>Public Collection</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 text-zinc-400" />
                  <span>Private Collection</span>
                </>
              )}
            </Label>
          </div>

          {isPublic && (
            <div className="bg-blue-950/30 border border-blue-900 rounded-md p-4 text-sm text-blue-200">
              <p>
                <strong>Public collections are visible to everyone.</strong> Anyone can view the articles in this collection,
                but only you can add or remove articles.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/collections')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || !name.trim()}
              className="gap-2"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" />
                  Create Collection
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
