import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Archive, Calendar, User, Globe } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { toast } from "@/components/ui/toast";
import { type Article } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface ArticleCardProps {
  article: Article;
}

export default function ArticleCard({ article }: ArticleCardProps) {

  const formattedDate = article.savedAt
    ? formatDistanceToNow(new Date(article.savedAt), { addSuffix: true })
    : "Recently";

  const archiveMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PATCH", `/api/articles/${article.id}`, {
        isArchived: !article.isArchived,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles'] });
      toast({
        title: article.isArchived ? "Article unarchived" : "Article archived",
        description: article.isArchived ? "The article has been moved to your library." : "The article has been archived.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update article: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleArchive = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    archiveMutation.mutate();
  };

  // Extract hostname from URL for display
  const getHostname = (url: string) => {
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace(/^www\./, '');
    } catch (e) {
      return url;
    }
  };

  return (
    <Link href={`/article/${article.id}`}>
      <a className="block h-full">
        <Card className="h-full flex flex-col transition-shadow hover:shadow-md">
          <CardContent className="pt-6 flex-grow">
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-slate-900 line-clamp-2 mb-2">
                {article.title}
              </h3>
            </div>

            {article.description && (
              <p className="text-sm text-slate-600 line-clamp-3 mb-4">
                {article.description}
              </p>
            )}

            <div className="flex flex-wrap gap-y-2 text-xs text-slate-500 mt-auto">
              {article.author && (
                <div className="flex items-center mr-4">
                  <User className="h-3 w-3 mr-1" />
                  <span className="line-clamp-1">{article.author}</span>
                </div>
              )}

              <div className="flex items-center mr-4">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{formattedDate}</span>
              </div>

              <div className="flex items-center">
                <Globe className="h-3 w-3 mr-1" />
                <span className="line-clamp-1">{getHostname(article.url)}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pt-2 pb-4 px-6 border-t flex justify-between">
            <div className="flex items-center text-xs text-slate-500">
              {article.readingProgress > 0 ? (
                <div className="flex items-center">
                  <div className="h-2 w-16 bg-slate-200 rounded-full mr-2">
                    <div
                      className="h-2 bg-primary rounded-full"
                      style={{ width: `${article.readingProgress}%` }}
                    />
                  </div>
                  <span>{article.readingProgress}%</span>
                </div>
              ) : (
                <span>Not started</span>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleArchive}
              disabled={archiveMutation.isPending}
              className="h-8 px-2"
            >
              {article.isArchived ? (
                <Bookmark className="h-4 w-4" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
            </Button>
          </CardFooter>
        </Card>
      </a>
    </Link>
  );
}
