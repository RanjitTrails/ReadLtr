import { useOffline } from '@/contexts/OfflineContext';
import { Wifi, WifiOff, CloudOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  className?: string;
}

/**
 * Offline Status Indicator
 * 
 * Displays the current online/offline status and pending changes
 */
export default function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const { online, hasPendingChanges, pendingChangesCount, syncPendingChanges } = useOffline();

  // If online and no pending changes, don't show anything
  if (online && !hasPendingChanges) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 text-sm rounded-md',
        online
          ? 'bg-amber-900/20 text-amber-300 border border-amber-800/50'
          : 'bg-red-900/20 text-red-300 border border-red-800/50',
        className
      )}
    >
      {online ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>
            {pendingChangesCount} pending change{pendingChangesCount !== 1 ? 's' : ''}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-amber-800/50"
            onClick={() => syncPendingChanges()}
            title="Sync now"
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>You're offline</span>
          {hasPendingChanges && (
            <span className="bg-red-800/50 px-1.5 py-0.5 rounded-full text-xs flex items-center gap-1">
              <CloudOff className="h-3 w-3" />
              {pendingChangesCount}
            </span>
          )}
        </>
      )}
    </div>
  );
}
