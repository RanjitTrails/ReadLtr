import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, ExternalLink, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Highlight {
  id: string;
  text: string;
  articleId: string;
  articleTitle: string;
  createdAt: string;
  color: string;
  note?: string;
}

interface HighlightsListProps {
  highlights: Highlight[];
}

export default function HighlightsList({ highlights }: HighlightsListProps) {
  // Format date
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return new Date(dateString).toLocaleDateString();
    }
  };

  // Get border color class based on highlight color
  const getBorderColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      yellow: 'border-yellow-500',
      blue: 'border-blue-500',
      green: 'border-green-500',
      pink: 'border-pink-500',
      purple: 'border-purple-500'
    };
    return colorMap[color] || 'border-yellow-500';
  };

  return (
    <div className="space-y-4">
      {highlights.map((highlight) => (
        <Card key={highlight.id} className="overflow-hidden border-zinc-800 bg-zinc-900">
          <CardContent className="p-0">
            <div className="p-4">
              <blockquote className={`border-l-4 ${getBorderColorClass(highlight.color)} pl-4 italic text-zinc-300`}>
                {highlight.text}
              </blockquote>

              {highlight.note && (
                <div className="mt-3 ml-4 pl-4 border-l border-zinc-700 text-zinc-400">
                  <div className="flex items-center mb-1 text-xs">
                    <MessageSquare className="h-3 w-3 mr-1" />
                    <span>Note</span>
                  </div>
                  <p className="text-sm">{highlight.note}</p>
                </div>
              )}

              <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-zinc-400">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <Link href={`/article/${highlight.articleId}`}>
                    <a className="hover:text-blue-400 hover:underline">
                      {highlight.articleTitle}
                    </a>
                  </Link>
                </div>

                <div className="flex items-center space-x-2">
                  <span>{formatDate(highlight.createdAt)}</span>
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
