import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HardDrive, Download, Trash2, Loader2 } from 'lucide-react';
import { Article } from '@shared/schema';

interface CachedArticlesPanelProps {
  cachedArticles: Article[];
  onDownloadArticles: () => void;
  onClearCache: () => void;
  isLoading: boolean;
  isClearing: boolean;
  enableOfflineMode: boolean;
  online: boolean;
}

/**
 * Cached Articles Panel Component
 * 
 * Displays a list of articles cached for offline reading
 */
export default function CachedArticlesPanel({
  cachedArticles,
  onDownloadArticles,
  onClearCache,
  isLoading,
  isClearing,
  enableOfflineMode,
  online
}: CachedArticlesPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cached Articles</CardTitle>
        <CardDescription>
          Articles available for offline reading.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {cachedArticles.length === 0 ? (
          <div className="text-center py-8">
            <HardDrive className="mx-auto h-12 w-12 text-zinc-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Cached Articles</h3>
            <p className="text-zinc-500 mb-4">
              You don't have any articles cached for offline reading.
            </p>
            <Button
              onClick={onDownloadArticles}
              disabled={isLoading || !enableOfflineMode || !online}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Articles
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-zinc-500">
                {cachedArticles.length} articles cached
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onClearCache}
                disabled={isClearing}
              >
                {isClearing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {cachedArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-3 bg-zinc-900 rounded-md border border-zinc-800"
                >
                  <div className="truncate flex-1">
                    <p className="font-medium truncate">{article.title}</p>
                    <p className="text-xs text-zinc-500 truncate">
                      {article.domain || new URL(article.url).hostname}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {article.read_time && (
                      <span className="text-xs bg-zinc-800 px-2 py-1 rounded-full">
                        {article.read_time} min
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
