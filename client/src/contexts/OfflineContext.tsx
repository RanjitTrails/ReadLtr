import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  isOnline,
  registerConnectivityListeners,
  unregisterConnectivityListeners,
  getPendingArticles
} from '@/lib/offlineStorage';
import { toast } from '@/components/ui/toast';

interface OfflineContextType {
  online: boolean;
  hasPendingChanges: boolean;
  pendingChangesCount: number;
  syncPendingChanges: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

interface OfflineProviderProps {
  children: ReactNode;
}

export function OfflineProvider({ children }: OfflineProviderProps) {
  const [online, setOnline] = useState<boolean>(isOnline());
  const [hasPendingChanges, setHasPendingChanges] = useState<boolean>(false);
  const [pendingChangesCount, setPendingChangesCount] = useState<number>(0);

  // Handle online status change
  const handleOnline = () => {
    setOnline(true);
    toast({
      title: 'You are back online',
      description: hasPendingChanges
        ? 'Your offline changes will be synchronized.'
        : 'You can now access all features.',
      variant: 'default',
    });

    // Trigger sync if there are pending changes
    if (hasPendingChanges) {
      syncPendingChanges();
    }
  };

  // Handle offline status change
  const handleOffline = () => {
    setOnline(false);
    toast({
      title: 'You are offline',
      description: 'Some features may be limited. Your changes will be saved locally.',
      variant: 'destructive',
    });
  };

  // Check for pending changes
  const checkPendingChanges = async () => {
    try {
      const pendingArticles = await getPendingArticles();
      const hasPending = pendingArticles.length > 0;
      setHasPendingChanges(hasPending);
      setPendingChangesCount(pendingArticles.length);
    } catch (error) {
      console.error('Failed to check pending changes:', error);
    }
  };

  // Sync pending changes with the server
  const syncPendingChanges = async () => {
    if (!online) {
      toast({
        title: 'Cannot sync',
        description: 'You are offline. Changes will sync automatically when you reconnect.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Register for sync with service worker
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-articles');
        await registration.sync.register('sync-highlights');
        await registration.sync.register('sync-notes');

        toast({
          title: 'Syncing changes',
          description: 'Your offline changes are being synchronized.',
          variant: 'default',
        });

        // Check again after a delay to update UI
        setTimeout(() => {
          checkPendingChanges();
        }, 2000);
      } else {
        // Fallback for browsers without background sync
        // This would need to implement manual sync logic
        toast({
          title: 'Sync not supported',
          description: 'Your browser does not support background sync.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to sync pending changes:', error);
      toast({
        title: 'Sync failed',
        description: 'Failed to synchronize your changes. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  // Set up event listeners and check for pending changes
  useEffect(() => {
    registerConnectivityListeners(handleOnline, handleOffline);
    checkPendingChanges();

    // Set up periodic checks for pending changes
    const intervalId = setInterval(checkPendingChanges, 30000); // Check every 30 seconds

    return () => {
      unregisterConnectivityListeners(handleOnline, handleOffline);
      clearInterval(intervalId);
    };
  }, []);

  // Listen for changes in online status to update pending changes
  useEffect(() => {
    if (online) {
      checkPendingChanges();
    }
  }, [online]);

  const value = {
    online,
    hasPendingChanges,
    pendingChangesCount,
    syncPendingChanges,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}
