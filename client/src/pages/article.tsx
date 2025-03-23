import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Bookmark, Archive, Share, Tag, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ArticleContent from "@/components/article/ArticleContent";
import { type Article } from "@shared/schema";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function ArticlePage() {
  const [_, params] = useRoute<{ id: string }>("/article/:id");
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("reader");
  
  const articleId = params?.id ? parseInt(params.id) : null;
  
  const { data: article, isLoading, error } = useQuery({
    queryKey: [`/api/articles/${articleId}`],
    enabled: !!articleId,
  });
  
  const archiveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", `/api/articles/${articleId}`, {
        isArchived: !article.isArchived,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${articleId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({
        title: article.isArchived ? "Article unarchived" : "Article archived",
        description: article.isArchived ? "The article has been moved to your library." : "The article has been archived.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to archive article: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("DELETE", `/api/articles/${articleId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Article deleted",
        description: "The article has been permanently deleted.",
      });
      window.location.href = "/library";
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete article: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="mb-4">
            <Link href="/library">
              <a className="text-slate-600 hover:text-primary flex items-center">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Library
              </a>
            </Link>
          </div>
          
          <Card className="w-full max-w-4xl mx-auto">
            <CardContent className="p-8">
              <Skeleton className="h-10 w-3/4 mb-6" />
              <Skeleton className="h-6 w-1/3 mb-10" />
              
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="mb-4">
            <Link href="/library">
              <a className="text-slate-600 hover:text-primary flex items-center">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Library
              </a>
            </Link>
          </div>
          
          <Card className="w-full max-w-4xl mx-auto">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Article Not Found</h2>
              <p className="text-slate-600 mb-6">
                The article you're looking for might have been deleted or doesn't exist.
              </p>
              <Link href="/library">
                <Button>
                  Go to Library
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/library">
            <a className="text-slate-600 hover:text-primary flex items-center">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Library
            </a>
          </Link>
        </div>
        
        <Card className="w-full max-w-4xl mx-auto mb-6">
          <div className="border-b border-gray-200">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full bg-transparent justify-start border-b-0 p-0">
                <TabsTrigger value="reader" className="py-3 px-4">
                  Reader View
                </TabsTrigger>
                <TabsTrigger value="original" className="py-3 px-4">
                  Original Article
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <CardContent className="p-8">
            {activeTab === "reader" ? (
              <ArticleContent article={article} />
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-600 mb-6">
                  To view the original article, you can visit the source website.
                </p>
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
                >
                  Visit Original Article
                </a>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="w-full max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
            >
              {article.isArchived ? (
                <>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Unarchive
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(article.url);
                toast({
                  title: "Link copied",
                  description: "The article link has been copied to your clipboard.",
                });
              }}
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
