import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { FileText, Clock } from 'lucide-react';

interface StorageUsagePanelProps {
  storageUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cachedArticlesCount: number;
  pendingChangesCount: number;
}

/**
 * Storage Usage Panel Component
 * 
 * Displays information about storage usage for offline content
 */
export default function StorageUsagePanel({
  storageUsage,
  cachedArticlesCount,
  pendingChangesCount
}: StorageUsagePanelProps) {
  return (
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
              <p className="text-sm font-medium">{cachedArticlesCount}</p>
              <p className="text-xs text-zinc-500">Cached Articles</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-900/20 rounded-full">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium">{pendingChangesCount}</p>
              <p className="text-xs text-zinc-500">Pending Changes</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
