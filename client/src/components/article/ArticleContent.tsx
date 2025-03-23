import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Article } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { User, Calendar, Globe } from "lucide-react";

interface ArticleContentProps {
  article: Article;
}

export default function ArticleContent({ article }: ArticleContentProps) {
  const [readingProgress, setReadingProgress] = useState(article.readingProgress || 0);

  // Update reading progress
  const progressMutation = useMutation({
    mutationFn: async (progress: number) => {
      return await apiRequest("PATCH", `/api/articles/${article.id}`, {
        readingProgress: progress,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/articles/${article.id}`] });
    },
  });

  // Calculate and update reading progress based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.offsetHeight;
      const winHeight = window.innerHeight;
      const scrollPercent = scrollTop / (docHeight - winHeight);
      const progress = Math.min(Math.round(scrollPercent * 100), 100);
      
      // Only update if progress has increased
      if (progress > readingProgress) {
        setReadingProgress(progress);
        
        // Debounce the API call
        if (progress % 5 === 0) { // Update every 5% to avoid too many requests
          progressMutation.mutate(progress);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      
      // Save final progress when component unmounts
      if (readingProgress > article.readingProgress) {
        progressMutation.mutate(readingProgress);
      }
    };
  }, [article.id, article.readingProgress, readingProgress]);

  // Mark as read when reaching 90% of the article
  useEffect(() => {
    if (readingProgress >= 90 && !article.readAt) {
      apiRequest("PATCH", `/api/articles/${article.id}`, {
        readAt: new Date().toISOString(),
      });
    }
  }, [article.id, article.readAt, readingProgress]);

  const formattedDate = article.savedAt 
    ? formatDistanceToNow(new Date(article.savedAt), { addSuffix: true }) 
    : "Recently";

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
    <article className="prose prose-slate max-w-none">
      <h1 className="text-slate-900 mb-4">{article.title}</h1>
      
      <div className="flex flex-wrap items-center text-sm text-slate-500 mb-8 gap-y-2">
        {article.author && (
          <div className="flex items-center mr-6">
            <User className="h-4 w-4 mr-1" />
            <span>{article.author}</span>
          </div>
        )}
        
        <div className="flex items-center mr-6">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{formattedDate}</span>
        </div>
        
        <div className="flex items-center">
          <Globe className="h-4 w-4 mr-1" />
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {getHostname(article.url)}
          </a>
        </div>
      </div>
      
      {article.content ? (
        <div dangerouslySetInnerHTML={{ __html: article.content }} />
      ) : (
        <div className="text-slate-600 italic">
          <p>The article content is not available.</p>
          <p>You can view the original article by clicking on the source link above.</p>
        </div>
      )}
      
      <div className="fixed bottom-4 right-4 bg-white shadow-md rounded-full px-3 py-1 text-xs flex items-center border">
        <div className="h-2 w-12 bg-slate-200 rounded-full mr-2">
          <div 
            className="h-2 bg-primary rounded-full transition-all" 
            style={{ width: `${readingProgress}%` }}
          />
        </div>
        <span>{readingProgress}%</span>
      </div>
    </article>
  );
}
