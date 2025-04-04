import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getArticles } from '@/lib/articleService';
import ArticleList from '@/components/ArticleList';
import ArticleListSkeleton from '@/components/ArticleListSkeleton';

export default function ReadLater() {
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['articles', 'later'],
    queryFn: () => getArticles({ filter: 'later' }),
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Read Later</h1>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <CardTitle>Read Later</CardTitle>
            </div>
            <CardDescription>
              Articles you've saved to read later
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ArticleListSkeleton count={5} />
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                <p>Error loading articles</p>
                <p className="text-sm">{(error as Error).message}</p>
              </div>
            ) : articles && articles.length > 0 ? (
              <ArticleList articles={articles} />
            ) : (
              <div className="text-center py-10 text-zinc-500">
                <p>No articles saved for later reading</p>
                <p className="text-sm mt-2">
                  Save articles to read when you have more time
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
