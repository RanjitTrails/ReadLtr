import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toast';
import { useOffline } from '@/contexts/OfflineContext';
import {
  getAllCachedArticles,
  clearOfflineData,
  getPendingArticles
} from '@/lib/offlineStorage';

// Import our component panels
import OfflineSettingsPanel from '@/components/offline/OfflineSettingsPanel';
import StorageUsagePanel from '@/components/offline/StorageUsagePanel';
import CachedArticlesPanel from '@/components/offline/CachedArticlesPanel';
import PendingChangesPanel from '@/components/offline/PendingChangesPanel';

/**
 * Offline Settings Page
 *
 * Allows users to manage offline mode settings and cached content
 */
export default function OfflineSettings() {
  const { online, hasPendingChanges, pendingChangesCount, syncPendingChanges } = useOffline();
  const [enableOfflineMode, setEnableOfflineMode] = useState(true);
  const [autoDownloadArticles, setAutoDownloadArticles] = useState(false);
  const [maxOfflineArticles, setMaxOfflineArticles] = useState(50);
  const [cachedArticles, setCachedArticles] = useState<any[]>([]);
  const [pendingArticles, setPendingArticles] = useState<any[]>([]);
  const [storageUsage, setStorageUsage] = useState({ used: 0, total: 0, percentage: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Load cached articles and storage info
  useEffect(() => {
    loadCachedArticles();
    loadStorageInfo();
    loadPendingArticles();

    // Load settings from localStorage
    const savedSettings = localStorage.getItem('offlineSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setEnableOfflineMode(settings.enableOfflineMode ?? true);
      setAutoDownloadArticles(settings.autoDownloadArticles ?? false);
      setMaxOfflineArticles(settings.maxOfflineArticles ?? 50);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    const settings = {
      enableOfflineMode,
      autoDownloadArticles,
      maxOfflineArticles
    };
    localStorage.setItem('offlineSettings', JSON.stringify(settings));
  }, [enableOfflineMode, autoDownloadArticles, maxOfflineArticles]);

  // Load cached articles
  const loadCachedArticles = async () => {
    try {
      const articles = await getAllCachedArticles();
      setCachedArticles(articles);
    } catch (error) {
      console.error('Failed to load cached articles:', error);
    }
  };

  // Load pending articles
  const loadPendingArticles = async () => {
    try {
      const articles = await getPendingArticles();
      setPendingArticles(articles);
    } catch (error) {
      console.error('Failed to load pending articles:', error);
    }
  };

  // Load storage usage information
  const loadStorageInfo = async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const total = estimate.quota || 0;
        const percentage = total > 0 ? Math.round((used / total) * 100) : 0;

        setStorageUsage({
          used: Math.round(used / (1024 * 1024)), // Convert to MB
          total: Math.round(total / (1024 * 1024)), // Convert to MB
          percentage
        });
      }
    } catch (error) {
      console.error('Failed to get storage estimate:', error);
    }
  };

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

    setIsLoading(true);

    try {
      // Get recent articles
      const { data: articles } = await getArticles({ limit: maxOfflineArticles });

      if (!articles || articles.length === 0) {
        toast({
          title: 'No articles to download',
          description: 'There are no articles in your library to download.',
          variant: 'destructive',
        });
        setIsLoading(false);
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

      // Refresh the cached articles list
      loadCachedArticles();
      loadStorageInfo();
    } catch (error) {
      console.error('Failed to download articles:', error);
      toast({
        title: 'Download failed',
        description: 'Failed to download articles for offline use.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear offline cache
  const clearOfflineCache = async () => {
    if (!confirm('Are you sure you want to clear all offline data? This will remove all cached articles and pending changes.')) {
      return;
    }

    setIsClearing(true);

    try {
      await clearOfflineData();

      toast({
        title: 'Offline data cleared',
        description: 'All cached articles and pending changes have been removed.',
        variant: 'default',
      });

      // Refresh the lists
      loadCachedArticles();
      loadPendingArticles();
      loadStorageInfo();
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      toast({
        title: 'Clear failed',
        description: 'Failed to clear offline data.',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  // Sync pending changes
  const handleSyncChanges = async () => {
    setIsSyncing(true);

    try {
      await syncPendingChanges();

      // Refresh the lists after a short delay
      setTimeout(() => {
        loadPendingArticles();
        loadCachedArticles();
      }, 1000);
    } catch (error) {
      console.error('Failed to sync changes:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Format bytes to human-readable size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Offline Mode</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Configure how ReadLtr works when you're offline.
        </p>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="cached">Cached Articles</TabsTrigger>
          <TabsTrigger value="pending">Pending Changes</TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <OfflineSettingsPanel
            enableOfflineMode={enableOfflineMode}
            setEnableOfflineMode={setEnableOfflineMode}
            autoDownloadArticles={autoDownloadArticles}
            setAutoDownloadArticles={setAutoDownloadArticles}
            maxOfflineArticles={maxOfflineArticles}
            setMaxOfflineArticles={setMaxOfflineArticles}
            onClearCache={clearOfflineCache}
            isLoading={isLoading}
            isClearing={isClearing}
          />

          <StorageUsagePanel
            storageUsage={storageUsage}
            cachedArticlesCount={cachedArticles.length}
            pendingChangesCount={pendingArticles.length}
          />
        </TabsContent>

        {/* Cached Articles Tab */}
        <TabsContent value="cached" className="space-y-4">
          <CachedArticlesPanel
            cachedArticles={cachedArticles}
            onDownloadArticles={downloadArticlesForOffline}
            onClearCache={clearOfflineCache}
            isLoading={isLoading}
            isClearing={isClearing}
            enableOfflineMode={enableOfflineMode}
            online={online}
          />
        </TabsContent>

        {/* Pending Changes Tab */}
        <TabsContent value="pending" className="space-y-4">
          <PendingChangesPanel
            pendingArticles={pendingArticles}
            onSyncChanges={handleSyncChanges}
            isSyncing={isSyncing}
            online={online}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
