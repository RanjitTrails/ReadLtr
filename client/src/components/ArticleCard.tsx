import { Link } from "wouter";
import { formatDistanceToNow, format } from "date-fns";
import { Article } from "@/lib/articleService";
import {
  Heart,
  Archive,
  ExternalLink,
  Clock,
  Tag as TagIcon,
  Bookmark,
  Share2,
  CheckCircle2,
  MoreHorizontal,
  MessageSquare,
  Globe,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toggleFavorite, toggleArchive } from "@/lib/articleService";
import {
  likeArticle,
  unlikeArticle,
  hasLikedArticle,
  makeArticlePublic,
  makeArticlePrivate,
  incrementShareCount,
  getShareableLink
} from "@/lib/socialService";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/api";

export interface ArticleCardProps {
  article: Article;
  viewMode: "list" | "grid";
  showTags?: boolean;
  highlight?: boolean;
}

export default function ArticleCard({ article, viewMode, showTags = false, highlight = false }: ArticleCardProps) {
  const { user } = useAuth();
  const isOwner = user?.id === article.user_id;

  // Check if user has liked this article
  const { data: isLiked = false } = useQuery({
    queryKey: ['articleLiked', article.id],
    queryFn: () => hasLikedArticle(article.id),
    enabled: !!user
  });

  // Toggle favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: toggleFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });

  // Toggle archive mutation
  const archiveMutation = useMutation({
    mutationFn: toggleArchive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });

  // Like/unlike mutations
  const likeMutation = useMutation({
    mutationFn: likeArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articleLiked', article.id] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    }
  });

  const unlikeMutation = useMutation({
    mutationFn: unlikeArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articleLiked', article.id] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    }
  });

  // Public/private mutations
  const makePublicMutation = useMutation({
    mutationFn: makeArticlePublic,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast({
        title: "Article made public",
        description: "Others can now view this article."
      });
    }
  });

  const makePrivateMutation = useMutation({
    mutationFn: makeArticlePrivate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast({
        title: "Article made private",
        description: "This article is now private."
      });
    }
  });

  // Share count mutation
  const incrementShareMutation = useMutation({
    mutationFn: incrementShareCount
  });

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    favoriteMutation.mutate(article.id);
  };

  const handleToggleArchive = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    archiveMutation.mutate(article.id);
  };

  const handleLikeToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like articles."
      });
      return;
    }

    if (isLiked) {
      unlikeMutation.mutate(article.id);
    } else {
      likeMutation.mutate(article.id);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const shareUrl = getShareableLink(article.id);

    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.excerpt || `Check out this article: ${article.title}`,
        url: shareUrl
      }).then(() => {
        incrementShareMutation.mutate(article.id);
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast({
          title: "Link copied",
          description: "Article link copied to clipboard"
        });
        incrementShareMutation.mutate(article.id);
      });
    }
  };

  const handleTogglePublic = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (article.is_public) {
      makePrivateMutation.mutate(article.id);
    } else {
      makePublicMutation.mutate(article.id);
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  // Format domain
  const formatDomain = (url?: string) => {
    if (!url) return "";
    try {
      const domain = new URL(url).hostname.replace(/^www\./, '');
      return domain;
    } catch (e) {
      return "";
    }
  };

  return (
    <Link href={`/article/${article.id}`}>
      <a className="block outline-none">
        <article
          className={`group relative overflow-hidden transition-all ${
            highlight
              ? "bg-blue-900/20 hover:bg-blue-900/30 border border-blue-800/50"
              : "bg-zinc-900 hover:bg-zinc-800/70 border border-zinc-800"
          } rounded-lg ${
            viewMode === "grid" ? "h-full flex flex-col" : ""
          }`}
        >
          {/* Read progress bar */}
          {article.read_progress && article.read_progress > 0 && article.read_progress < 100 && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-700">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${article.read_progress}%` }}
              />
            </div>
          )}

          {/* Card content */}
          <div className="flex flex-col p-4">
            {/* Article image */}
            {article.image_url && viewMode === "grid" && (
              <div className="mb-3 -mx-4 -mt-4">
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-32 object-cover"
                />
              </div>
            )}

            {/* Metadata and title */}
            <div className="flex items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                  {formatDomain(article.url) && (
                    <span>{formatDomain(article.url)}</span>
                  )}
                  {article.date_added && (
                    <>
                      <span>•</span>
                      <span>{formatDate(article.date_added)}</span>
                    </>
                  )}
                  {article.read_time && (
                    <>
                      <span>•</span>
                      <span className="flex items-center">
                        <Clock size={12} className="mr-1" />
                        {article.read_time} min
                      </span>
                    </>
                  )}
                </div>

                <h3 className={`font-medium text-white leading-snug ${
                  viewMode === "grid" ? "text-base line-clamp-2" : "text-lg"
                }`}>
                  {article.title}
                </h3>
              </div>

              {article.is_read && (
                <div className="shrink-0 ml-3 bg-blue-500/10 p-1 rounded-full">
                  <CheckCircle2 size={16} className="text-blue-500" />
                </div>
              )}
            </div>

            {/* Excerpt */}
            {article.excerpt && (
              <p className={`text-sm text-zinc-400 ${
                viewMode === "grid" ? "line-clamp-2 text-xs" : "line-clamp-2"
              } mb-3`}>
                {article.excerpt}
              </p>
            )}

            {/* Tags and actions */}
            <div className="flex items-center justify-between mt-auto pt-2">
              {showTags && article.tags && article.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {article.tags.slice(0, 3).map((tag: string) => (
                    <span
                      key={tag}
                      className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {article.tags.length > 3 && (
                    <span className="text-xs text-zinc-500">+{article.tags.length - 3}</span>
                  )}
                </div>
              ) : (
                <div>{/* Empty div to maintain flex layout */}</div>
              )}

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity article-actions">
                {/* Favorite button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${article.is_favorite ? 'text-yellow-500' : 'text-zinc-400 hover:text-white'}`}
                  onClick={handleToggleFavorite}
                  aria-label={article.is_favorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Bookmark size={15} />
                </Button>

                {/* Like button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 ${isLiked ? 'text-red-500' : 'text-zinc-400 hover:text-white'}`}
                  onClick={handleLikeToggle}
                  aria-label={isLiked ? "Unlike" : "Like"}
                >
                  <Heart size={15} />
                  {article.like_count > 0 && (
                    <span className="absolute -top-1 -right-1 text-xs bg-zinc-800 rounded-full px-1 min-w-[16px] text-center">
                      {article.like_count}
                    </span>
                  )}
                </Button>

                {/* Archive button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-white"
                  onClick={handleToggleArchive}
                  aria-label={article.is_archived ? "Unarchive" : "Archive"}
                >
                  <Archive size={15} />
                </Button>

                {/* Share button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-white"
                  onClick={handleShare}
                  aria-label="Share"
                >
                  <Share2 size={15} />
                </Button>

                {/* Public/private toggle (only for owner) */}
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${article.is_public ? 'text-blue-500' : 'text-zinc-400 hover:text-white'}`}
                    onClick={handleTogglePublic}
                    aria-label={article.is_public ? "Make private" : "Make public"}
                  >
                    {article.is_public ? <Globe size={15} /> : <Lock size={15} />}
                  </Button>
                )}

                {/* Original link */}
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center text-sm font-medium rounded-md h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Open original"
                >
                  <ExternalLink size={15} />
                </a>
              </div>
            </div>
          </div>
        </article>
      </a>
    </Link>
  );
}