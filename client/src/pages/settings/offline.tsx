import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { 
  Wifi, 
  WifiOff, 
  Download, 
  Trash2, 
  RefreshCw, 
  HardDrive, 
  Clock, 
  FileText,
  Loader2
} from 'lucide-react';
import { useOffline } from '@/contexts/OfflineContext';
import { 
  getAllCachedArticles, 
  clearOfflineData, 
  getPendingArticles 
} from '@/lib/offlineStorage';
import { getArticles } from '@/lib/articleService';

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
                  onClick={clearOfflineCache}
                  disabled={isClearing || cachedArticles.length === 0}
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
          
          <Card>
            <CardHeader>
              <CardTitle>Storage Usage</CardTitle>
              <CardDescription>
                View how much storage is being used by offline content.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Used: {storageUsage.used} MB</span>
                  <span>Total: {storageUsage.total} MB</span>
                </div>
                <Progress value={storageUsage.percentage} className="h-2" />
                <p className="text-xs text-zinc-500">
                  {storageUsage.percentage}% of available storage used
                </p>
              </div>
              
              <div className="pt-2 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-900/20 rounded-full">
                    <FileText className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{cachedArticles.length}</p>
                    <p className="text-xs text-zinc-500">Cached Articles</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-900/20 rounded-full">
                    <Clock className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{pendingArticles.length}</p>
                    <p className="text-xs text-zinc-500">Pending Changes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Cached Articles Tab */}
        <TabsContent value="cached" className="space-y-4">
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
                    onClick={downloadArticlesForOffline}
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
                      onClick={clearOfflineCache}
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
        </TabsContent>
        
        {/* Pending Changes Tab */}
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Changes</CardTitle>
              <CardDescription>
                Changes made while offline that will sync when you're back online.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingArticles.length === 0 ? (
                <div className="text-center py-8">
                  <WifiOff className="mx-auto h-12 w-12 text-zinc-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Pending Changes</h3>
                  <p className="text-zinc-500">
                    All your changes have been synchronized with the server.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-zinc-500">
                      {pendingArticles.length} pending changes
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSyncChanges}
                      disabled={isSyncing || !online}
                    >
                      {isSyncing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                    {pendingArticles.map((article) => (
                      <div
                        key={article.id}
                        className="flex items-center justify-between p-3 bg-zinc-900 rounded-md border border-zinc-800"
                      >
                        <div className="truncate flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{article.title}</p>
                            <span className="text-xs bg-amber-900/30 text-amber-300 px-2 py-0.5 rounded-full">
                              Pending
                            </span>
                          </div>
                          <p className="text-xs text-zinc-500 truncate">
                            {article.domain || new URL(article.url).hostname}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-2">
                    <Button
                      onClick={handleSyncChanges}
                      disabled={isSyncing || !online}
                      className="w-full"
                    >
                      {isSyncing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Sync Changes Now
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
