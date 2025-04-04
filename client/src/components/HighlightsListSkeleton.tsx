import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

interface HighlightsListSkeletonProps {
  count?: number;
}

export default function HighlightsListSkeleton({ count = 5 }: HighlightsListSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array(count).fill(0).map((_, i) => (
        <Card key={i} className="overflow-hidden border-zinc-800 bg-zinc-900">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="border-l-4 border-yellow-500 pl-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
