import React from 'react';
import { Article } from '@/lib/articleService';
import ArticleCard from './ArticleCard';

interface ArticleListProps {
  articles: Article[];
  viewMode?: 'list' | 'grid';
  showTags?: boolean;
}

/**
 * Renders a list of articles
 */
export default function ArticleList({ 
  articles, 
  viewMode = 'list', 
  showTags = true 
}: ArticleListProps) {
  if (!articles || articles.length === 0) {
    return (
      <div className="text-center py-10 text-zinc-500">
        <p>No articles found</p>
      </div>
    );
  }

  return (
    <div className={
      viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
        : "space-y-4"
    }>
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          viewMode={viewMode}
          showTags={showTags}
        />
      ))}
    </div>
  );
}
