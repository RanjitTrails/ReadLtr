import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Hash } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllTags } from '@/lib/articleService';
import { Link } from 'wouter';
import { Badge } from '@/components/ui/badge';

export default function TagsList() {
  const { data: tags, isLoading, error } = useQuery({
    queryKey: ['tags'],
    queryFn: getAllTags,
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tags</h1>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Hash className="h-5 w-5 text-purple-500" />
              <CardTitle>All Tags</CardTitle>
            </div>
            <CardDescription>
              Browse your content by tags
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array(12).fill(0).map((_, i) => (
                  <div key={i} className="h-8 bg-zinc-800 animate-pulse rounded-md"></div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                <p>Error loading tags</p>
                <p className="text-sm">{(error as Error).message}</p>
              </div>
            ) : tags && tags.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <Link key={tag.id} href={`/tags/${tag.name}`}>
                    <a>
                      <Badge variant="outline" className="px-3 py-1 text-sm hover:bg-zinc-800 cursor-pointer">
                        <Hash className="h-3 w-3 mr-1" />
                        {tag.name}
                        {tag.count && (
                          <span className="ml-1 text-xs bg-zinc-800 px-1.5 py-0.5 rounded-full">
                            {tag.count}
                          </span>
                        )}
                      </Badge>
                    </a>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-zinc-500">
                <p>No tags yet</p>
                <p className="text-sm mt-2">
                  Add tags to your articles to organize your content
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
