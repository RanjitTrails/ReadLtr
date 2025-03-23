
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { BookmarkIcon, SunIcon, MoonIcon, FolderIcon } from 'lucide-react';

interface Props {
  article: Article;
  onUpdate?: (article: Article) => void;
}

export default function ArticleContent({ article, onUpdate }: Props) {
  const { fetch } = useAuth();
  const contentRef = useRef<HTMLDivElement>(null);
  const [readingProgress, setReadingProgress] = useState(article.readingProgress || 0);
  const [isDarkMode, setIsDarkMode] = useState(article.darkMode || false);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      
      const element = contentRef.current;
      const totalHeight = element.scrollHeight - element.clientHeight;
      const progress = Math.round((element.scrollTop / totalHeight) * 100);
      
      if (progress !== readingProgress) {
        setReadingProgress(progress);
        updateProgress(progress, element.scrollTop);
      }
    };

    const content = contentRef.current;
    if (content) {
      content.addEventListener('scroll', handleScroll);
      content.scrollTop = article.lastReadPosition || 0;
    }

    return () => {
      if (content) {
        content.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const updateProgress = async (progress: number, position: number) => {
    try {
      const response = await fetch(`/api/articles/${article.id}/progress`, {
        method: 'POST',
        body: JSON.stringify({ progress, lastReadPosition: position }),
      });
      
      if (response.ok && onUpdate) {
        const updatedArticle = await response.json();
        onUpdate(updatedArticle);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const handleHighlight = async () => {
    if (!selectedText) return;
    
    try {
      const response = await fetch(`/api/articles/${article.id}/highlights`, {
        method: 'POST',
        body: JSON.stringify({ highlight: selectedText }),
      });
      
      if (response.ok && onUpdate) {
        const updatedArticle = await response.json();
        onUpdate(updatedArticle);
      }
      setSelectedText('');
    } catch (error) {
      console.error('Failed to save highlight:', error);
    }
  };

  const toggleDarkMode = async () => {
    try {
      const response = await fetch(`/api/articles/${article.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ darkMode: !isDarkMode }),
      });
      
      if (response.ok) {
        setIsDarkMode(!isDarkMode);
        if (onUpdate) {
          const updatedArticle = await response.json();
          onUpdate(updatedArticle);
        }
      }
    } catch (error) {
      console.error('Failed to toggle dark mode:', error);
    }
  };

  return (
    <article className="max-w-3xl mx-auto p-4">
      <div className="sticky top-0 bg-white dark:bg-slate-900 p-4 z-10">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
            {isDarkMode ? <SunIcon /> : <MoonIcon />}
          </Button>
          {selectedText && (
            <Button onClick={handleHighlight}>
              <BookmarkIcon className="mr-2 h-4 w-4" />
              Highlight
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full flex-grow">
            <div 
              className="h-2 bg-primary rounded-full transition-all" 
              style={{ width: `${readingProgress}%` }}
            />
          </div>
          <span>{readingProgress}%</span>
        </div>
      </div>

      <div 
        ref={contentRef}
        className={`prose dark:prose-invert max-w-none mt-8 ${isDarkMode ? 'dark' : ''}`}
        style={{ maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}
        onMouseUp={() => setSelectedText(window.getSelection()?.toString() || '')}
        dangerouslySetInnerHTML={{ __html: article.content || '' }}
      />

      {article.highlights && article.highlights.length > 0 && (
        <div className="mt-8 p-4 bg-primary/5 rounded-lg">
          <h3 className="font-semibold mb-4">Highlights</h3>
          <ul className="space-y-2">
            {article.highlights.map((highlight, i) => (
              <li key={i} className="pl-4 border-l-2 border-primary">
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
