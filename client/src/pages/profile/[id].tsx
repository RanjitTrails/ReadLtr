import { useState, useEffect } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, 
  Globe, 
  Link as LinkIcon, 
  Twitter, 
  Users, 
  BookOpen, 
  Bookmark,
  Heart,
  Share2,
  MessageSquare,
  Grid,
  List as ListIcon,
  ExternalLink
} from 'lucide-react';
import { 
  getPublicProfile, 
  getFollowers, 
  getFollowing, 
  isFollowing, 
  followUser, 
  unfollowUser,
  getUserCollections,
  getPublicArticles
} from '@/lib/socialService';
import { useAuth } from '@/lib/api';
import ArticleCard from '@/components/ArticleCard';
import CollectionCard from '@/components/social/CollectionCard';

export default function ProfilePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('articles');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  
  const isOwnProfile = user?.id === id;
  
  // Fetch profile data
  const { 
    data: profile, 
    isLoading: profileLoading, 
    error: profileError 
  } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => getPublicProfile(id as string),
    enabled: !!id
  });
  
  // Fetch follow status
  const { 
    data: followStatus, 
    isLoading: followStatusLoading 
  } = useQuery({
    queryKey: ['followStatus', id],
    queryFn: () => isFollowing(id as string),
    enabled: !!id && !!user && !isOwnProfile
  });
  
  // Fetch followers
  const { 
    data: followers = [], 
    isLoading: followersLoading 
  } = useQuery({
    queryKey: ['followers', id],
    queryFn: () => getFollowers(id as string),
    enabled: !!id
  });
  
  // Fetch following
  const { 
    data: following = [], 
    isLoading: followingLoading 
  } = useQuery({
    queryKey: ['following', id],
    queryFn: () => getFollowing(id as string),
    enabled: !!id
  });
  
  // Fetch collections
  const { 
    data: collections = [], 
    isLoading: collectionsLoading 
  } = useQuery({
    queryKey: ['collections', id],
    queryFn: () => getUserCollections(id as string),
    enabled: !!id
  });
  
  // Fetch public articles
  const { 
    data: articles = [], 
    isLoading: articlesLoading 
  } = useQuery({
    queryKey: ['publicArticles', id],
    queryFn: () => getPublicArticles(20),
    enabled: !!id
  });
  
  // Follow mutation
  const followMutation = useMutation({
    mutationFn: followUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followStatus', id] });
      queryClient.invalidateQueries({ queryKey: ['followers', id] });
    }
  });
  
  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: unfollowUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followStatus', id] });
      queryClient.invalidateQueries({ queryKey: ['followers', id] });
    }
  });
  
  const handleFollowToggle = () => {
    if (followStatus) {
      unfollowMutation.mutate(id as string);
    } else {
      followMutation.mutate(id as string);
    }
  };
  
  // Loading state
  if (profileLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-4" />
              <Skeleton className="h-16 w-full mb-4" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  // Error state
  if (profileError || !profile) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-8 px-4 text-center">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-8">
            <User className="w-16 h-16 mx-auto mb-4 text-zinc-500" />
            <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
            <p className="text-zinc-400 mb-6">
              This profile doesn't exist or is not public.
            </p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Profile header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <Avatar className="w-24 h-24 border-2 border-zinc-700">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.name || 'User'} />
            <AvatarFallback className="bg-blue-600 text-white text-xl">
              {profile.name?.charAt(0) || profile.display_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
              <h1 className="text-2xl font-bold">
                {profile.display_name || profile.name || 'User'}
              </h1>
              
              {!isOwnProfile && user && (
                <Button 
                  variant={followStatus ? "outline" : "default"}
                  size="sm"
                  onClick={handleFollowToggle}
                  disabled={followMutation.isPending || unfollowMutation.isPending}
                  className="w-28"
                >
                  {followMutation.isPending || unfollowMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      {followStatus ? 'Unfollowing' : 'Following'}
                    </span>
                  ) : (
                    <span>{followStatus ? 'Unfollow' : 'Follow'}</span>
                  )}
                </Button>
              )}
              
              {isOwnProfile && (
                <Link href="/settings/profile">
                  <Button variant="outline" size="sm">
                    Edit Profile
                  </Button>
                </Link>
              )}
            </div>
            
            {profile.bio && (
              <p className="text-zinc-300 mb-4">{profile.bio}</p>
            )}
            
            <div className="flex flex-wrap gap-4 mb-4 text-sm text-zinc-400">
              {profile.is_public && (
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>Public Profile</span>
                </div>
              )}
              
              {profile.website && (
                <a 
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
                >
                  <LinkIcon className="h-4 w-4" />
                  <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              )}
              
              {profile.twitter_username && (
                <a 
                  href={`https://twitter.com/${profile.twitter_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-zinc-200 transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                  <span>@{profile.twitter_username}</span>
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              )}
            </div>
            
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4 text-zinc-500" />
                <span className="font-medium">{articles.length}</span>
                <span className="text-zinc-500">articles</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-zinc-500" />
                <span className="font-medium">{profile.follower_count || followers.length}</span>
                <span className="text-zinc-500">followers</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-zinc-500" />
                <span className="font-medium">{profile.following_count || following.length}</span>
                <span className="text-zinc-500">following</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="articles" className="px-4">
                <BookOpen className="h-4 w-4 mr-2" />
                Articles
              </TabsTrigger>
              <TabsTrigger value="collections" className="px-4">
                <Bookmark className="h-4 w-4 mr-2" />
                Collections
              </TabsTrigger>
              <TabsTrigger value="likes" className="px-4">
                <Heart className="h-4 w-4 mr-2" />
                Likes
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={viewMode === 'list' ? 'bg-zinc-800' : ''}
                onClick={() => setViewMode('list')}
              >
                <ListIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={viewMode === 'grid' ? 'bg-zinc-800' : ''}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <TabsContent value="articles" className="mt-0">
            {articlesLoading ? (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="p-4 border border-zinc-800 rounded-lg">
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <BookOpen className="h-12 w-12 mx-auto text-zinc-700 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Public Articles</h3>
                <p className="text-zinc-500 max-w-md mx-auto">
                  {isOwnProfile 
                    ? "You haven't made any articles public yet. Share your knowledge with the world!"
                    : "This user hasn't made any articles public yet."}
                </p>
                {isOwnProfile && (
                  <Button className="mt-4" variant="outline" asChild>
                    <Link href="/settings/sharing">Make Articles Public</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {articles.map((article) => (
                  <ArticleCard 
                    key={article.id} 
                    article={article} 
                    viewMode={viewMode}
                    showTags
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="collections" className="mt-0">
            {collectionsLoading ? (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="p-4 border border-zinc-800 rounded-lg">
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : collections.length === 0 ? (
              <div className="text-center py-12 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <Bookmark className="h-12 w-12 mx-auto text-zinc-700 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Collections</h3>
                <p className="text-zinc-500 max-w-md mx-auto">
                  {isOwnProfile 
                    ? "You haven't created any collections yet. Collections help you organize your articles."
                    : "This user hasn't created any public collections yet."}
                </p>
                {isOwnProfile && (
                  <Button className="mt-4" variant="outline" asChild>
                    <Link href="/collections/new">Create Collection</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {collections.map((collection) => (
                  <CollectionCard 
                    key={collection.id} 
                    collection={collection}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="likes" className="mt-0">
            <div className="text-center py-12 bg-zinc-900/50 rounded-lg border border-zinc-800">
              <Heart className="h-12 w-12 mx-auto text-zinc-700 mb-4" />
              <h3 className="text-lg font-medium mb-2">Likes Coming Soon</h3>
              <p className="text-zinc-500 max-w-md mx-auto">
                We're working on making liked articles and collections visible on profiles.
                Check back soon!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
