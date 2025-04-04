import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, ExternalLink } from 'lucide-react';

interface Highlight {
  id: string;
  text: string;
  articleId: string;
  articleTitle: string;
  createdAt: string;
  color?: string;
}

interface HighlightsListProps {
  highlights: Highlight[];
}

export default function HighlightsList({ highlights }: HighlightsListProps) {
  return (
    <div className="space-y-4">
      {highlights.map((highlight) => (
        <Card key={highlight.id} className="overflow-hidden border-zinc-800 bg-zinc-900">
          <CardContent className="p-0">
            <div className="p-4">
              <blockquote className="border-l-4 border-yellow-500 pl-4 italic text-zinc-300">
                {highlight.text}
              </blockquote>
              
              <div className="mt-4 flex items-center justify-between text-sm text-zinc-400">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <Link href={`/article/${highlight.articleId}`}>
                    <a className="hover:text-blue-400 hover:underline">
                      {highlight.articleTitle}
                    </a>
                  </Link>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span>{new Date(highlight.createdAt).toLocaleDateString()}</span>
                  <Link href={`/article/${highlight.articleId}#highlight-${highlight.id}`}>
                    <a className="flex items-center space-x-1 text-blue-400 hover:underline">
                      <span>View in context</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
