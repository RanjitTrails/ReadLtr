import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Article } from '@shared/schema';
import { 
  ArrowLeft, 
  Heart, 
  Bookmark, 
  Share2, 
  ExternalLink,
  Clock,
  Calendar,
  User,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '@/lib/api';
import { 
  likeArticle, 
  unlikeArticle, 
  hasLikedArticle,
  incrementShareCount,
  getShareableLink
} from '@/lib/socialService';
import { toast } from '@/components/ui/use-toast';
import CommentSection from '@/components/social/CommentSection';

export default function SharedArticlePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  
  // Fetch article
  const { 
    data: article, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['sharedArticle', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*, profile:profiles(*)')
        .eq('id', id)
        .eq('is_public', true)
        .single();
      
      if (error) throw error;
      return data as Article & { profile: any };
    },
    enabled: !!id
  });
  
  // Check if user has liked this article
  const { 
    data: isLiked = false,
    refetch: refetchLikeStatus
  } = useQuery({
    queryKey: ['articleLiked', id],
    queryFn: () => hasLikedArticle(id as string),
    enabled: !!id && !!user
  });
  
  // Increment view count
  useEffect(() => {
    if (article?.id) {
      const incrementViewCount = async () => {
        await supabase.rpc('increment_view_count', {
          article_id: article.id
        });
      };
      
      incrementViewCount();
    }
  }, [article?.id]);
  
  // Handle like/unlike
  const handleLikeToggle = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like articles."
      });
      return;
    }
    
    try {
      if (isLiked) {
        await unlikeArticle(id as string);
      } else {
        await likeArticle(id as string);
      }
      refetchLikeStatus();
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  
  // Handle share
  const handleShare = async () => {
    const shareUrl = getShareableLink(id as string);
    
    if (navigator.share) {
      navigator.share({
        title: article?.title || 'Shared Article',
        text: article?.excerpt || `Check out this article: ${article?.title}`,
        url: shareUrl
      }).then(() => {
        incrementShareCount(id as string);
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast({
          title: "Link copied",
          description: "Article link copied to clipboard"
        });
        incrementShareCount(id as string);
      });
    }
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    
    try {
      const date = new Date(dateString);
      return format(date, 'MMMM d, yyyy');
    } catch (e) {
      return "";
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="mb-8">
            <Skeleton className="h-8 w-32 mb-8" />
            <Skeleton className="h-10 w-3/4 mb-4" />
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          
          <div className="space-y-4">
            {Array(10).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !article) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 text-center bg-zinc-900 rounded-lg border border-zinc-800">
          <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
          <p className="text-zinc-400 mb-6">
            This article doesn't exist or is not public.
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Back button */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4"
            asChild
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        {/* Article header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
          
          {/* Author and metadata */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10 border border-zinc-800">
                <AvatarImage src={article.profile?.avatar_url} alt={article.profile?.name || 'User'} />
                <AvatarFallback className="bg-blue-600">
                  {article.profile?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <Link href={`/profile/${article.profile?.id}`}>
                  <a className="text-sm font-medium hover:text-blue-400 transition-colors">
                    {article.profile?.name || article.profile?.display_name || 'User'}
                  </a>
                </Link>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
              {article.published_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.published_date)}</span>
                </div>
              )}
              
              {article.read_time && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{article.read_time} min read</span>
                </div>
              )}
              
              {article.author && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>By {article.author}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Article image */}
          {article.image_url && (
            <div className="mb-6">
              <img 
                src={article.image_url} 
                alt={article.title} 
                className="w-full h-auto max-h-96 object-cover rounded-lg"
              />
            </div>
          )}
          
          {/* Article excerpt */}
          {article.excerpt && (
            <div className="mb-6 text-lg text-zinc-300 italic border-l-4 border-zinc-700 pl-4">
              {article.excerpt}
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mb-8 border-b border-zinc-800 pb-6">
            <Button
              variant="outline"
              size="sm"
              className={`gap-2 ${isLiked ? 'text-red-500 border-red-500/30' : ''}`}
              onClick={handleLikeToggle}
            >
              <Heart className="h-4 w-4" />
              <span>{isLiked ? 'Liked' : 'Like'}</span>
              {article.like_count > 0 && (
                <span className="bg-zinc-800 px-1.5 py-0.5 rounded-full text-xs ml-1">
                  {article.like_count}
                </span>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Comments</span>
              {article.comment_count > 0 && (
                <span className="bg-zinc-800 px-1.5 py-0.5 rounded-full text-xs ml-1">
                  {article.comment_count}
                </span>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              asChild
            >
              <a 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Original</span>
              </a>
            </Button>
            
            {user && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 ml-auto"
                asChild
              >
                <Link href={`/save?url=${encodeURIComponent(article.url)}`}>
                  <Bookmark className="h-4 w-4" />
                  <span>Save to My List</span>
                </Link>
              </Button>
            )}
          </div>
        </header>
        
        {/* Article content */}
        <div className="prose prose-invert prose-zinc max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: article.content || '' }} />
        </div>
        
        {/* Comments section */}
        {showComments && (
          <CommentSection articleId={article.id} />
        )}
      </div>
    </div>
  );
}
