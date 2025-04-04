import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getArticleComments,
  addComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
  hasLikedComment
} from '@/lib/socialService';
import { useAuth } from '@/lib/api';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  Reply,
  Edit,
  Trash2,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { Link } from 'wouter';

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');

  // Fetch comments
  const {
    data: comments = [],
    isLoading: commentsLoading
  } = useQuery({
    queryKey: ['comments', articleId],
    queryFn: () => getArticleComments(articleId),
    enabled: !!articleId
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: addComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
      queryClient.invalidateQueries({ queryKey: ['sharedArticle', articleId] });
      setNewComment('');
      toast({
        title: "Comment added",
        description: "Your comment has been added successfully."
      });
    }
  });

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string, content: string }) =>
      updateComment(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
      setEditingCommentId(null);
      setEditedContent('');
      toast({
        title: "Comment updated",
        description: "Your comment has been updated successfully."
      });
    }
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
      queryClient.invalidateQueries({ queryKey: ['sharedArticle', articleId] });
      toast({
        title: "Comment deleted",
        description: "Your comment has been deleted successfully."
      });
    }
  });

  // Like comment mutation
  const likeCommentMutation = useMutation({
    mutationFn: likeComment,
    onSuccess: (_, commentId) => {
      queryClient.invalidateQueries({ queryKey: ['commentLiked', commentId] });
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
    }
  });

  // Unlike comment mutation
  const unlikeCommentMutation = useMutation({
    mutationFn: unlikeComment,
    onSuccess: (_, commentId) => {
      queryClient.invalidateQueries({ queryKey: ['commentLiked', commentId] });
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
    }
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add a comment."
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment.",
        variant: "destructive"
      });
      return;
    }

    addCommentMutation.mutate({
      article_id: articleId,
      content: newComment.trim()
    });
  };

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingCommentId(commentId);
    setEditedContent(currentContent);
  };

  const handleUpdateComment = (commentId: string) => {
    if (!editedContent.trim()) {
      toast({
        title: "Empty comment",
        description: "Please enter a comment.",
        variant: "destructive"
      });
      return;
    }

    updateCommentMutation.mutate({
      commentId,
      content: editedContent.trim()
    });
  };

  const handleDeleteComment = (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like comments."
      });
      return;
    }

    const isLiked = await hasLikedComment(commentId);

    if (isLiked) {
      unlikeCommentMutation.mutate(commentId);
    } else {
      likeCommentMutation.mutate(commentId);
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
    <div className="border-t border-zinc-800 pt-8">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        Comments {comments.length > 0 && `(${comments.length})`}
      </h2>

      {/* Add comment form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex gap-4">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.name || 'User'} />
              <AvatarFallback className="bg-blue-600">
                {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-3 bg-zinc-900 border-zinc-800 min-h-[100px]"
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={addCommentMutation.isPending || !newComment.trim()}
                  className="gap-2"
                >
                  {addCommentMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-4 w-4" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-8 text-center">
          <p className="text-zinc-400 mb-3">
            Sign in to join the conversation
          </p>
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
        </div>
      )}

      {/* Comments list */}
      {commentsLoading ? (
        <div className="space-y-6">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 bg-zinc-900/50 rounded-lg border border-zinc-800">
          <MessageSquare className="h-12 w-12 mx-auto text-zinc-700 mb-4" />
          <h3 className="text-lg font-medium mb-2">No Comments Yet</h3>
          <p className="text-zinc-500 max-w-md mx-auto">
            Be the first to share your thoughts on this article.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={comment.profile?.avatar_url} alt={comment.profile?.name || 'User'} />
                <AvatarFallback className="bg-blue-600">
                  {comment.profile?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link href={`/profile/${comment.profile?.id}`}>
                    <a className="font-medium hover:text-blue-400 transition-colors">
                      {comment.profile?.name || comment.profile?.display_name || 'User'}
                    </a>
                  </Link>

                  <span className="text-xs text-zinc-500">
                    {formatDate(comment.created_at)}
                  </span>

                  {comment.created_at !== comment.updated_at && (
                    <span className="text-xs text-zinc-600 italic">
                      (edited)
                    </span>
                  )}
                </div>

                {editingCommentId === comment.id ? (
                  <div className="mb-2">
                    <Textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="mb-2 bg-zinc-900 border-zinc-800"
                    />

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCommentId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateComment(comment.id)}
                        disabled={updateCommentMutation.isPending}
                        className="gap-1"
                      >
                        {updateCommentMutation.isPending ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Edit className="h-3 w-3" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-300 mb-2">{comment.content}</p>
                )}

                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <button
                    className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
                    onClick={() => handleLikeComment(comment.id)}
                  >
                    <Heart className={`h-3.5 w-3.5 ${comment.like_count > 0 ? 'text-red-500 fill-red-500' : ''}`} />
                    <span>{comment.like_count > 0 ? comment.like_count : 'Like'}</span>
                  </button>

                  {user?.id === comment.user_id && !editingCommentId && (
                    <>
                      <button
                        className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
                        onClick={() => handleEditComment(comment.id, comment.content)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>

                      <button
                        className="flex items-center gap-1 hover:text-red-400 transition-colors"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
