import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface ArticleListSkeletonProps {
  count?: number;
}

export default function ArticleListSkeleton({ count = 5 }: ArticleListSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array(count).fill(0).map((_, i) => (
        <div key={i} className="flex items-start space-x-4 p-4 border border-zinc-800 rounded-md">
          <Skeleton className="h-16 w-16 rounded-md" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex items-center space-x-2 pt-2">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
