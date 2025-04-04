import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Loader2, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { useOffline } from '@/contexts/OfflineContext';
import { getArticles } from '@/lib/articleService';

interface OfflineSettingsPanelProps {
  enableOfflineMode: boolean;
  setEnableOfflineMode: (value: boolean) => void;
  autoDownloadArticles: boolean;
  setAutoDownloadArticles: (value: boolean) => void;
  maxOfflineArticles: number;
  setMaxOfflineArticles: (value: number) => void;
  onClearCache: () => void;
  isLoading: boolean;
  isClearing: boolean;
}

/**
 * Offline Settings Panel Component
 *
 * Displays and manages offline mode settings
 */
export default function OfflineSettingsPanel({
  enableOfflineMode,
  setEnableOfflineMode,
  autoDownloadArticles,
  setAutoDownloadArticles,
  maxOfflineArticles,
  setMaxOfflineArticles,
  onClearCache,
  isLoading,
  isClearing
}: OfflineSettingsPanelProps) {
  const { online } = useOffline();

  // Download articles for offline use
  const downloadArticlesForOffline = async () => {
    if (!online) {
      toast({
        title: 'Cannot download articles',
        description: 'You need to be online to download articles for offline use.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Get recent articles
      const { data: articles } = await getArticles({ limit: maxOfflineArticles });

      if (!articles || articles.length === 0) {
        toast({
          title: 'No articles to download',
          description: 'There are no articles in your library to download.',
          variant: 'destructive',
        });
        return;
      }

      // Cache each article
      let successCount = 0;
      for (const article of articles) {
        try {
          // This will use the cacheArticle function internally
          await getArticles({ id: article.id });
          successCount++;
        } catch (error) {
          console.error(`Failed to cache article ${article.id}:`, error);
        }
      }

      toast({
        title: 'Articles downloaded',
        description: `Successfully downloaded ${successCount} articles for offline use.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Failed to download articles:', error);
      toast({
        title: 'Download failed',
        description: 'Failed to download articles for offline use.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Offline Access</CardTitle>
        <CardDescription>
          Configure how ReadLtr behaves when you're offline.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="enable-offline" className="flex flex-col space-y-1">
            <span>Enable offline mode</span>
            <span className="font-normal text-xs text-zinc-500">
              Allow reading articles when you're offline
            </span>
          </Label>
          <Switch
            id="enable-offline"
            checked={enableOfflineMode}
            onCheckedChange={setEnableOfflineMode}
          />
        </div>

        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="auto-download" className="flex flex-col space-y-1">
            <span>Auto-download articles</span>
            <span className="font-normal text-xs text-zinc-500">
              Automatically download articles for offline reading
            </span>
          </Label>
          <Switch
            id="auto-download"
            checked={autoDownloadArticles}
            onCheckedChange={setAutoDownloadArticles}
            disabled={!enableOfflineMode}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-articles">Maximum articles to cache ({maxOfflineArticles})</Label>
          <input
            id="max-articles"
            type="range"
            min="10"
            max="200"
            step="10"
            value={maxOfflineArticles}
            onChange={(e) => setMaxOfflineArticles(parseInt(e.target.value))}
            disabled={!enableOfflineMode}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-zinc-500">
            <span>10</span>
            <span>100</span>
            <span>200</span>
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-4">
          <Button
            onClick={downloadArticlesForOffline}
            disabled={isLoading || !enableOfflineMode || !online}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Articles for Offline Use
              </>
            )}
          </Button>

          <Button
            variant="destructive"
            onClick={onClearCache}
            disabled={isClearing}
            className="w-full"
          >
            {isClearing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Offline Cache
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
