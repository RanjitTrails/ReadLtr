import { useState, useCallback } from "react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import ArticleCard from "@/components/ArticleCard";
import { Button } from "@/components/ui/button";
import {
  Filter,
  List,
  Grid,
  SortAsc,
  ChevronDown,
  Clock,
  CalendarDays,
  BookOpen,
  CircleSlash,
  Check,
  Sparkles
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getArticles, ArticleFilters } from "@/lib/articleService";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ViewMode = "list" | "grid";
type SortOption = "newest" | "oldest" | "title" | "readTime" | "domain";
type FilterOption = "all" | "unread" | "today" | "week" | "month";

export default function ListPage() {
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  const [showAI, setShowAI] = useState(false);
  
  // API query params
  const [filters, setFilters] = useState<ArticleFilters>({});
  
  // Query articles with filters
  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ["articles", filters],
    queryFn: () => getArticles(filters),
  });
  
  // Update filters based on filter option
  const updateFilters = useCallback((option: FilterOption) => {
    setFilterOption(option);
    
    const newFilters: ArticleFilters = {};
    
    // Clear previous filters
    if (option === "all") {
      setFilters({});
      return;
    }
    
    // Handle read status
    if (option === "unread") {
      newFilters.readStatus = false;
    }
    
    // Handle time-based filters
    if (["today", "week", "month"].includes(option)) {
      const now = new Date();
      let startDate = new Date();
      
      if (option === "today") {
        startDate.setHours(0, 0, 0, 0);
      } else if (option === "week") {
        startDate.setDate(now.getDate() - 7);
      } else if (option === "month") {
        startDate.setMonth(now.getMonth() - 1);
      }
      
      newFilters.dateAdded = {
        start: startDate.toISOString(),
        end: now.toISOString()
      };
    }
    
    setFilters(newFilters);
  }, []);
  
  // Sort articles based on sort option
  const sortedArticles = [...(articles || [])].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.date_added || 0).getTime() - new Date(a.date_added || 0).getTime();
      case "oldest":
        return new Date(a.date_added || 0).getTime() - new Date(b.date_added || 0).getTime();
      case "title":
        return (a.title || "").localeCompare(b.title || "");
      case "readTime":
        return (b.read_time || 0) - (a.read_time || 0);
      case "domain":
        return (a.domain || "").localeCompare(b.domain || "");
      default:
        return 0;
    }
  });
  
  // AI-recommended articles
  const recommendedArticles = showAI ? sortedArticles.slice(0, 3) : [];
  const remainingArticles = showAI ? sortedArticles.slice(3) : sortedArticles;
  
  // Loading skeletons
  const renderSkeletons = () => {
    return Array(5).fill(0).map((_, i) => (
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
    <div className="py-8 px-4 w-full max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold text-white">Your Reading List</h1>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 md:flex-none gap-2">
                <Filter size={16} />
                <span>{filterOption === "all" ? "All Articles" : 
                  filterOption === "unread" ? "Unread" : 
                  filterOption === "today" ? "Today" : 
                  filterOption === "week" ? "This Week" : 
                  "This Month"}
                </span>
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter Articles</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem 
                checked={filterOption === "all"}
                onCheckedChange={() => updateFilters("all")}
              >
                All Articles
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem 
                checked={filterOption === "unread"}
                onCheckedChange={() => updateFilters("unread")}
              >
                <CircleSlash className="mr-2 h-4 w-4" />
                <span>Unread</span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Time</DropdownMenuLabel>
              <DropdownMenuCheckboxItem 
                checked={filterOption === "today"}
                onCheckedChange={() => updateFilters("today")}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                <span>Added Today</span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem 
                checked={filterOption === "week"}
                onCheckedChange={() => updateFilters("week")}
              >
                <Clock className="mr-2 h-4 w-4" />
                <span>Added This Week</span>
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem 
                checked={filterOption === "month"}
                onCheckedChange={() => updateFilters("month")}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Added This Month</span>
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SortAsc size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy("newest")}>
                {sortBy === "newest" && <Check className="mr-2 h-4 w-4" />}
                <span className={sortBy === "newest" ? "font-medium" : ""}>Newest First</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("oldest")}>
                {sortBy === "oldest" && <Check className="mr-2 h-4 w-4" />}
                <span className={sortBy === "oldest" ? "font-medium" : ""}>Oldest First</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("title")}>
                {sortBy === "title" && <Check className="mr-2 h-4 w-4" />}
                <span className={sortBy === "title" ? "font-medium" : ""}>Title</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("readTime")}>
                {sortBy === "readTime" && <Check className="mr-2 h-4 w-4" />}
                <span className={sortBy === "readTime" ? "font-medium" : ""}>Read Time</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("domain")}>
                {sortBy === "domain" && <Check className="mr-2 h-4 w-4" />}
                <span className={sortBy === "domain" ? "font-medium" : ""}>Domain</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* View mode toggle */}
          <Tabs value={viewMode} onValueChange={(value: string) => setViewMode(value as ViewMode)}>
            <TabsList>
              <TabsTrigger value="list">
                <List size={16} />
              </TabsTrigger>
              <TabsTrigger value="grid">
                <Grid size={16} />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* AI toggle */}
      <div className="mb-6">
        <Button 
          variant={showAI ? "default" : "outline"} 
          className={`gap-2 ${showAI ? "bg-blue-600 hover:bg-blue-700" : ""}`}
          onClick={() => setShowAI(!showAI)}
        >
          <Sparkles size={16} className={showAI ? "text-yellow-300" : ""} />
          <span>AI Recommendations</span>
        </Button>
      </div>
      
      {/* Error state */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-md mb-6">
          <p className="font-medium">Error loading articles</p>
          <p className="text-sm mt-1">There was a problem fetching your articles.</p>
        </div>
      )}
      
      {/* Loading state */}
      {isLoading && (
        <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
          {renderSkeletons()}
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && articles.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
            <BookOpen size={24} className="text-zinc-400" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No articles found</h3>
          <p className="text-zinc-400 max-w-md mb-6">
            {filterOption !== "all" 
              ? "Try changing your filters to see more articles." 
              : "Start by adding your first article to your reading list."}
          </p>
          <Link href="/save">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <span>Add Article</span>
            </Button>
          </Link>
        </div>
      )}
      
      {/* AI recommendations */}
      {!isLoading && showAI && recommendedArticles.length > 0 && (
        <>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-yellow-300" />
              <span>Recommended for you</span>
            </h2>
            <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {recommendedArticles.map((article) => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  viewMode={viewMode}
                  showTags
                  highlight
                />
              ))}
            </div>
          </div>
          
          <div className="my-6">
            <h2 className="text-lg font-semibold text-white mb-4">All Articles</h2>
          </div>
        </>
      )}
      
      {/* Article list */}
      {!isLoading && remainingArticles.length > 0 && (
        <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
          {remainingArticles.map((article) => (
            <ArticleCard 
              key={article.id} 
              article={article} 
              viewMode={viewMode}
              showTags
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      {content}
    </Layout>
  );
} 