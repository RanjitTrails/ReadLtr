import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WifiOff, RefreshCw, Loader2 } from 'lucide-react';
import { Article } from '@shared/schema';

interface PendingChangesPanelProps {
  pendingArticles: Article[];
  onSyncChanges: () => void;
  isSyncing: boolean;
  online: boolean;
}

/**
 * Pending Changes Panel Component
 * 
 * Displays a list of changes made while offline that will sync when back online
 */
export default function PendingChangesPanel({
  pendingArticles,
  onSyncChanges,
  isSyncing,
  online
}: PendingChangesPanelProps) {
  return (
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
                onClick={onSyncChanges}
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
                onClick={onSyncChanges}
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
  );
}
