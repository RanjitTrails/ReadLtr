import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getArticles } from '@/lib/articleService';
import ArticleList from '@/components/ArticleList';
import ArticleListSkeleton from '@/components/ArticleListSkeleton';

export default function PDFsList() {
  const { data: articles, isLoading, error } = useQuery({
    queryKey: ['articles', 'pdfs'],
    queryFn: () => getArticles({ contentType: 'pdfs' }),
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Saved PDFs</h1>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <FileIcon className="h-5 w-5 text-red-500" />
              <CardTitle>PDFs</CardTitle>
            </div>
            <CardDescription>
              PDF documents you've saved to read later
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ArticleListSkeleton count={5} />
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                <p>Error loading PDFs</p>
                <p className="text-sm">{(error as Error).message}</p>
              </div>
            ) : articles && articles.length > 0 ? (
              <ArticleList articles={articles} />
            ) : (
              <div className="text-center py-10 text-zinc-500">
                <p>No saved PDFs</p>
                <p className="text-sm mt-2">
                  Save PDF documents to read later
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
