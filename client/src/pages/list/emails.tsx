import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getArticles } from '@/lib/articleService';
import ArticleList from '@/components/ArticleList';
import ArticleListSkeleton from '@/components/ArticleListSkeleton';

export default function EmailsList() {
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['articles', 'emails'],
    queryFn: () => getArticles({ contentType: 'emails' }),
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Saved Emails</h1>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-blue-500" />
              <CardTitle>Emails</CardTitle>
            </div>
            <CardDescription>
              Emails you've saved to read later
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ArticleListSkeleton count={5} />
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                <p>Error loading emails</p>
                <p className="text-sm">{(error as Error).message}</p>
              </div>
            ) : articles && articles.length > 0 ? (
              <ArticleList articles={articles} />
            ) : (
              <div className="text-center py-10 text-zinc-500">
                <p>No saved emails</p>
                <p className="text-sm mt-2">
                  Save important emails to read later
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
