import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/lib/api.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Link } from "wouter";
import { PlusCircle, Search, BookOpen, Archive, Tag, AlertCircle } from "lucide-react";
import ArticleCard from "@/components/article/ArticleCard";
import { type Article } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Library() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("unread");
  const [searchQuery, setSearchQuery] = useState("");
  const [addingUrl, setAddingUrl] = useState("");
  const [isAddingArticle, setIsAddingArticle] = useState(false);
  
  // Fetch articles
  const { data: articles, isLoading, error } = useQuery<Article[]>({
    queryKey: ['/api/articles'],
    enabled: isAuthenticated,
  });
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Sign in to view your library</h2>
              <p className="text-slate-600 mb-6">
                You need to sign in or create an account to save and read articles.
              </p>
              <div className="flex justify-center space-x-4">
                <Link href="/login">
                  <Button>Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline">Register</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  // Add article function
  const handleAddArticle = async () => {
    if (!addingUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsAddingArticle(true);
      
      // Clean the URL and validate it's a proper URL
      let url = addingUrl.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      // Basic URL validation
      try {
        new URL(url);
      } catch {
        throw new Error("Invalid URL format");
      }
      
      // Add article by URL
      await apiRequest({
        url: '/api/articles',
        method: 'POST',
        body: {
          url,
          title: url, // We'll use the URL as title initially, the backend can update this after parsing
          content: '',
          description: '',
        }
      });
      
      toast({
        title: "Article added",
        description: "The article has been added to your library",
      });
      
      // Reset and refetch
      setAddingUrl("");
      window.location.reload(); // Simple refetch for now
    } catch (error) {
      toast({
        title: "Error adding article",
        description: error instanceof Error ? error.message : "Failed to add article",
        variant: "destructive",
      });
    } finally {
      setIsAddingArticle(false);
    }
  };
  
  // Filter articles based on active tab and search query
  const filteredArticles = articles ? articles.filter((article: Article) => {
    // First filter by tab
    if (activeTab === "unread" && article.isArchived) return false;
    if (activeTab === "archived" && !article.isArchived) return false;
    
    // Then by search query if it exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        article.title.toLowerCase().includes(query) ||
        (article.description && article.description.toLowerCase().includes(query)) ||
        (article.author && article.author.toLowerCase().includes(query))
      );
    }
    
    return true;
  }) : [];
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-slate-900">Your Library</h1>
          
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search articles..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Input
                placeholder="Paste article URL..."
                value={addingUrl}
                onChange={(e) => setAddingUrl(e.target.value)}
                className="w-full"
              />
              <Button 
                onClick={handleAddArticle}
                disabled={isAddingArticle || !addingUrl.trim()}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="unread" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Unread
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center">
              <Archive className="h-4 w-4 mr-2" />
              Archived
            </TabsTrigger>
            <TabsTrigger value="labels" className="flex items-center">
              <Tag className="h-4 w-4 mr-2" />
              Labels
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="unread">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-slate-600">Loading your articles...</p>
              </div>
            ) : error ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-slate-900">Failed to load articles</h3>
                    <p className="text-slate-600">Please try again later</p>
                  </div>
                </CardContent>
              </Card>
            ) : filteredArticles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Your reading list is empty</h3>
                  <p className="text-slate-600 mb-6">Add your first article by pasting a URL above</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article: Article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="archived">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-slate-600">Loading your archived articles...</p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Archive className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No archived articles</h3>
                  <p className="text-slate-600">Articles you archive will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article: Article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="labels">
            <Card>
              <CardContent className="py-12 text-center">
                <Tag className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Label feature coming soon</h3>
                <p className="text-slate-600">Organize your articles with custom labels</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
