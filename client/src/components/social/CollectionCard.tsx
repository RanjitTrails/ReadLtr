import { useState } from 'react';
import { Link } from 'wouter';
import { formatDistanceToNow } from 'date-fns';
import { Collection } from '@shared/schema';
import { 
  Bookmark, 
  Heart, 
  Share2, 
  MoreHorizontal,
  Eye,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  likeCollection, 
  unlikeCollection, 
  hasLikedCollection,
  getShareableCollectionLink,
  deleteCollection
} from '@/lib/socialService';
import { useAuth } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/use-toast';

interface CollectionCardProps {
  collection: Collection;
}

export default function CollectionCard({ collection }: CollectionCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isOwner = user?.id === collection.user_id;
  
  // Check if user has liked this collection
  const { data: isLiked = false } = useQuery({
    queryKey: ['collectionLiked', collection.id],
    queryFn: () => hasLikedCollection(collection.id),
    enabled: !!user
  });
  
  // Like/unlike mutations
  const likeMutation = useMutation({
    mutationFn: likeCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectionLiked', collection.id] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    }
  });
  
  const unlikeMutation = useMutation({
    mutationFn: unlikeCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectionLiked', collection.id] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
    }
  });
  
  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      toast({
        title: "Collection deleted",
        description: "Your collection has been deleted successfully."
      });
    }
  });
  
  const handleLikeToggle = () => {
    if (isLiked) {
      unlikeMutation.mutate(collection.id);
    } else {
      likeMutation.mutate(collection.id);
    }
  };
  
  const handleShare = () => {
    const shareUrl = getShareableCollectionLink(collection.id);
    
    if (navigator.share) {
      navigator.share({
        title: collection.name,
        text: collection.description || `Check out this collection: ${collection.name}`,
        url: shareUrl
      }).catch(err => {
        console.error('Error sharing:', err);
      });
    } else {
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast({
          title: "Link copied",
          description: "Collection link copied to clipboard"
        });
      });
    }
  };
  
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
      deleteMutation.mutate(collection.id);
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'recently';
    }
  };
  
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden group hover:border-zinc-700 transition-colors">
      {/* Collection cover */}
      <div className="h-32 bg-zinc-800 relative">
        {collection.cover_image_url ? (
          <img 
            src={collection.cover_image_url} 
            alt={collection.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <Bookmark className="h-12 w-12 text-zinc-700" />
          </div>
        )}
        
        {/* Public/private badge */}
        {collection.is_public ? (
          <div className="absolute top-2 left-2 bg-blue-900/80 text-blue-100 text-xs px-2 py-1 rounded-full flex items-center">
            <Eye className="h-3 w-3 mr-1" />
            Public
          </div>
        ) : (
          <div className="absolute top-2 left-2 bg-zinc-800/80 text-zinc-300 text-xs px-2 py-1 rounded-full flex items-center">
            Private
          </div>
        )}
      </div>
      
      {/* Collection content */}
      <div className="p-4">
        <Link href={`/collections/${collection.id}`}>
          <a className="block">
            <h3 className="font-medium text-lg text-white mb-1 hover:text-blue-400 transition-colors">
              {collection.name}
            </h3>
          </a>
        </Link>
        
        {collection.description && (
          <p className="text-zinc-400 text-sm mb-3 line-clamp-2">
            {collection.description}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center">
              <BookOpen className="h-3 w-3 mr-1" />
              {collection.article_count} articles
            </span>
            
            <span className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {collection.view_count} views
            </span>
          </div>
          
          <span>
            {collection.created_at && formatDate(collection.created_at)}
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isLiked ? 'text-red-500' : 'text-zinc-400 hover:text-white'}`}
              onClick={handleLikeToggle}
              disabled={!user || likeMutation.isPending || unlikeMutation.isPending}
            >
              <Heart size={15} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-zinc-400 hover:text-white"
              onClick={handleShare}
            >
              <Share2 size={15} />
            </Button>
            
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-400 hover:text-white"
                  >
                    <MoreHorizontal size={15} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/collections/${collection.id}/edit`}>
                      <a className="cursor-pointer">Edit collection</a>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-500 focus:text-red-500"
                    onClick={handleDelete}
                  >
                    Delete collection
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          <div className="flex items-center text-sm">
            <Heart className="h-3 w-3 mr-1 text-red-500" />
            <span>{collection.like_count}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
