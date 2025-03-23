import { useState } from "react";
import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { getArticles, ArticleFilters } from "@/lib/articleService";
import { formatDistanceToNow } from "date-fns";
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  BookOpen,
  Zap,
  BookMarked,
  Calendar,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import ArticleCard from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const [showAI, setShowAI] = useState(true);
  
  // Get all articles
  const { data: allArticles = [], isLoading: isLoadingAll } = useQuery({
    queryKey: ["articles", "all"],
    queryFn: () => getArticles({}),
  });
  
  // Get recently added articles (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data: recentArticles = [], isLoading: isLoadingRecent } = useQuery({
    queryKey: ["articles", "recent"],
    queryFn: () => getArticles({ 
      dateAdded: {
        start: sevenDaysAgo.toISOString(),
        end: new Date().toISOString()
      }
    }),
  });
  
  // Get favorite articles
  const { data: favoriteArticles = [], isLoading: isLoadingFavorites } = useQuery({
    queryKey: ["articles", "favorites"],
    queryFn: () => getArticles({ favorited: true }),
  });
  
  // Filter for AI recommendations (simulating personalized content)
  const recommendedArticles = showAI ? 
    allArticles
      .filter(article => !article.is_read)
      .sort(() => 0.5 - Math.random()) // Random shuffle for demo purposes
      .slice(0, 3) : 
    [];
  
  // Loading skeletons
  const renderSkeletons = (count = 3) => {
    return Array(count).fill(0).map((_, i) => (
      <div key={i} className="p-4 border border-zinc-800 rounded-lg">
        <div className="space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex justify-between pt-2">
            <Skeleton className="h-4 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    ));
  };

  const content = (
    <div className="py-8 px-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Home</h1>
        
        <Button 
          variant={showAI ? "default" : "outline"} 
          className={`gap-2 ${showAI ? "bg-blue-600 hover:bg-blue-700" : ""}`}
          onClick={() => setShowAI(!showAI)}
        >
          <Sparkles size={16} className={showAI ? "text-yellow-300" : ""} />
          <span>AI Recommendations</span>
        </Button>
      </div>
      
      {/* AI Recommendations */}
      {showAI && recommendedArticles.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Sparkles size={18} className="text-yellow-300" />
              <span>Recommended For You</span>
            </h2>
            <Link href="/list">
              <a className="text-sm text-blue-400 hover:text-blue-300 flex items-center">
                <span>View All</span>
                <ChevronRight size={16} />
              </a>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isLoadingAll ? renderSkeletons(3) : (
              recommendedArticles.map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  viewMode="grid"
                  highlight
                  showTags
                />
              ))
            )}
          </div>
        </div>
      )}
      
      {/* Continue Reading */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <BookOpen size={18} className="text-green-400" />
            <span>Continue Reading</span>
          </h2>
          <Link href="/list?filter=inprogress">
            <a className="text-sm text-blue-400 hover:text-blue-300 flex items-center">
              <span>View All</span>
              <ChevronRight size={16} />
            </a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoadingAll ? renderSkeletons(3) : (
            allArticles
              .filter(article => article.read_progress && article.read_progress > 0 && article.read_progress < 100)
              .slice(0, 3)
              .map(article => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  viewMode="grid"
                />
              ))
          )}
          
          {!isLoadingAll && allArticles.filter(a => a.read_progress && a.read_progress > 0 && a.read_progress < 100).length === 0 && (
            <div className="col-span-3 bg-zinc-900/50 rounded-lg p-6 text-center">
              <p className="text-zinc-400">You don't have any articles in progress. Start reading to see them here.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Recently Added */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock size={18} className="text-blue-400" />
            <span>Recently Added</span>
          </h2>
          <Link href="/list?sort=newest">
            <a className="text-sm text-blue-400 hover:text-blue-300 flex items-center">
              <span>View All</span>
              <ChevronRight size={16} />
            </a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoadingRecent ? renderSkeletons(3) : (
            recentArticles.slice(0, 3).map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                viewMode="grid"
              />
            ))
          )}
          
          {!isLoadingRecent && recentArticles.length === 0 && (
            <div className="col-span-3 bg-zinc-900/50 rounded-lg p-6 text-center">
              <p className="text-zinc-400">No articles added recently. Add some new content to your reading list.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Favorites */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <BookMarked size={18} className="text-red-400" />
            <span>Favorites</span>
          </h2>
          <Link href="/favorites">
            <a className="text-sm text-blue-400 hover:text-blue-300 flex items-center">
              <span>View All</span>
              <ChevronRight size={16} />
            </a>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoadingFavorites ? renderSkeletons(3) : (
            favoriteArticles.slice(0, 3).map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                viewMode="grid"
              />
            ))
          )}
          
          {!isLoadingFavorites && favoriteArticles.length === 0 && (
            <div className="col-span-3 bg-zinc-900/50 rounded-lg p-6 text-center">
              <p className="text-zinc-400">You haven't favorited any articles yet. Mark articles as favorites to see them here.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Reading Stats */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-purple-400" />
          <span>Your Reading Activity</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900 rounded-lg p-5 border border-zinc-800">
            <div className="flex items-center mb-2">
              <BookOpen size={20} className="text-blue-400 mr-2" />
              <h3 className="text-white font-medium">Articles Read</h3>
            </div>
            <p className="text-3xl font-bold text-white">{allArticles.filter(a => a.is_read).length}</p>
            <p className="text-sm text-zinc-400 mt-1">Total articles you've completed</p>
          </div>
          
          <div className="bg-zinc-900 rounded-lg p-5 border border-zinc-800">
            <div className="flex items-center mb-2">
              <Zap size={20} className="text-yellow-400 mr-2" />
              <h3 className="text-white font-medium">Reading Streak</h3>
            </div>
            <p className="text-3xl font-bold text-white">3 days</p>
            <p className="text-sm text-zinc-400 mt-1">Your current reading streak</p>
          </div>
          
          <div className="bg-zinc-900 rounded-lg p-5 border border-zinc-800">
            <div className="flex items-center mb-2">
              <Calendar size={20} className="text-green-400 mr-2" />
              <h3 className="text-white font-medium">This Week</h3>
            </div>
            <p className="text-3xl font-bold text-white">
              {recentArticles.filter(a => a.is_read).length}
            </p>
            <p className="text-sm text-zinc-400 mt-1">Articles read in the last 7 days</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      {content}
    </Layout>
  );
}
