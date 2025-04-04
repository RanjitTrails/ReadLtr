import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookMarked } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getHighlights } from '@/lib/articleService';
import HighlightsList from '@/components/HighlightsList';
import HighlightsListSkeleton from '@/components/HighlightsListSkeleton';

export default function Highlights() {
  const { data: highlights, isLoading, error } = useQuery({
    queryKey: ['highlights'],
    queryFn: getHighlights,
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Highlights</h1>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <BookMarked className="h-5 w-5 text-yellow-500" />
              <CardTitle>Your Highlights</CardTitle>
            </div>
            <CardDescription>
              Text you've highlighted while reading
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <HighlightsListSkeleton count={5} />
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                <p>Error loading highlights</p>
                <p className="text-sm">{(error as Error).message}</p>
              </div>
            ) : highlights && highlights.length > 0 ? (
              <HighlightsList highlights={highlights} />
            ) : (
              <div className="text-center py-10 text-zinc-500">
                <p>No highlights yet</p>
                <p className="text-sm mt-2">
                  Highlight text while reading to save important passages
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
