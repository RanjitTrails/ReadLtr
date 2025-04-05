import { useState, useEffect, useRef, useCallback } from "react";
import { useRoute } from "wouter";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Heart,
  ExternalLink,
  Share2,
  ArrowLeft,
  BookmarkPlus,
  Highlighter,
  MessageSquarePlus,
  ListPlus,
  Maximize,
  Minimize,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Minus,
  Plus,
  BookOpen,
  Monitor,
  X,
  Bookmark,
  BookMarked
} from "lucide-react";
import { getArticleById, toggleFavorite, markAsRead } from "@/lib/articleService";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import ReadingProgressIndicator from "@/components/analytics/ReadingProgressIndicator";
import {
  startReadingSession,
  updateReadingProgress,
  endReadingSession,
  getShareableLink,
  incrementShareCount
} from "@/lib/analyticsService";
import { formatDistanceToNow } from "date-fns";
import HighlightMenu from "@/components/article/HighlightMenu";
import { getHighlightsByArticle, Highlight } from "@/lib/highlightService";
import { toast } from "@/components/ui/toast";

const ArticleDetailPage = () => {
  const [_, params] = useRoute("/article/:id");
  const articleId = params?.id || "";

  const [fullscreen, setFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [fontType, setFontType] = useState<"serif" | "sans-serif">("sans-serif");
  const [showTools, setShowTools] = useState(true);
  const [showHighlightTools, setShowHighlightTools] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Highlighting state
  const [selectedText, setSelectedText] = useState("");
  const [highlightMenuPosition, setHighlightMenuPosition] = useState({ x: 0, y: 0 });
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const lastUpdateRef = useRef<number>(Date.now());
  const isVisibleRef = useRef<boolean>(true);

  // Fetch article details
  const { data: article, isLoading, error } = useQuery({
    queryKey: ['articles', 'detail', articleId],
    queryFn: () => getArticleById(articleId),
    enabled: !!articleId,
  });

  // Fetch highlights for this article
  const { data: articleHighlights } = useQuery({
    queryKey: ['highlights', articleId],
    queryFn: () => getHighlightsByArticle(articleId),
    enabled: !!articleId,
    onSuccess: (data) => {
      setHighlights(data);
    },
  });

  // Toggle favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: toggleFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });

  // Start reading session when component mounts
  useEffect(() => {
    if (!article) return;

    const startSession = async () => {
      const session = await startReadingSession(article.id);
      if (session) {
        setSessionId(session.id);
      }
    };

    startSession();

    // End session when component unmounts
    return () => {
      if (sessionId) {
        endReadingSession(sessionId, readingProgress);
      }
    };
  }, [article]);

  // Track scroll position to calculate reading progress
  useEffect(() => {
    if (!sessionId || !article) return;

    const calculateProgress = () => {
      if (!contentRef.current) return;

      const contentElement = contentRef.current;
      const contentHeight = contentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const scrollTop = window.scrollY;

      // Calculate how much of the content is visible
      const visibleContentHeight = Math.min(
        contentHeight,
        scrollTop + viewportHeight
      ) - Math.max(0, scrollTop);

      // Calculate progress as percentage
      const visiblePercentage = Math.min(
        100,
        Math.max(
          0,
          Math.round((scrollTop + visibleContentHeight) / contentHeight * 100)
        )
      );

      setReadingProgress(visiblePercentage);

      // Update progress in database every 10 seconds
      const now = Date.now();
      if (now - lastUpdateRef.current > 10000) {
        updateReadingProgress(sessionId, visiblePercentage);
        lastUpdateRef.current = now;
      }
    };

    // Calculate initial progress
    calculateProgress();

    // Add scroll event listener
    window.addEventListener('scroll', calculateProgress);
    window.addEventListener('resize', calculateProgress);

    // Track visibility changes
    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';

      // If user returns to the page, update the last update time
      if (isVisibleRef.current) {
        lastUpdateRef.current = Date.now();
      } else {
        // If user leaves the page, update progress
        updateReadingProgress(sessionId, readingProgress);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Periodic updates even when not scrolling
    const intervalId = setInterval(() => {
      if (isVisibleRef.current && sessionId) {
        const now = Date.now();
        if (now - lastUpdateRef.current > 10000) {
          updateReadingProgress(sessionId, readingProgress);
          lastUpdateRef.current = now;
        }
      }
    }, 10000);

    return () => {
      window.removeEventListener('scroll', calculateProgress);
      window.removeEventListener('resize', calculateProgress);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [sessionId, readingProgress, article]);

  // Mark article as read when viewed
  useEffect(() => {
    if (article && !article.is_read) {
      markAsReadMutation.mutate(articleId);
    }
  }, [article, articleId, markAsReadMutation]);

  const handleToggleFavorite = () => {
    favoriteMutation.mutate(articleId);
  };

  const handleToggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  const handleIncreaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 1, 24));
  };

  const handleDecreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 1, 12));
  };

  const handleToggleFontType = () => {
    setFontType((prev) => prev === "serif" ? "sans-serif" : "serif");
  };

  // Handle text selection for highlighting
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();

    if (!selection || selection.isCollapsed) {
      // No text selected or selection collapsed
      if (showHighlightMenu) {
        setShowHighlightMenu(false);
      }
      return;
    }

    const text = selection.toString().trim();
    if (!text || text.length < 2) {
      return;
    }

    // Get selection position for the highlight menu
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    setSelectedText(text);
    setHighlightMenuPosition({
      x: rect.left + (rect.width / 2),
      y: rect.top
    });
    setShowHighlightMenu(true);
  }, [showHighlightMenu]);

  // Handle highlight creation
  const handleHighlightCreated = (highlight: Highlight) => {
    setHighlights((prev) => [...prev, highlight]);
    queryClient.invalidateQueries({ queryKey: ['highlights', articleId] });
  };

  // Apply highlights to the content
  const applyHighlightsToContent = useCallback(() => {
    if (!contentRef.current || !highlights || highlights.length === 0) {
      return;
    }

    // Create a temporary document to work with the content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = article?.content || '';

    // Sort highlights by length (longest first) to avoid nested highlights
    const sortedHighlights = [...highlights].sort((a, b) => b.text.length - a.text.length);

    // Apply each highlight
    sortedHighlights.forEach(highlight => {
      const textNodes = [];
      const walker = document.createTreeWalker(
        tempDiv,
        NodeFilter.SHOW_TEXT,
        null
      );

      let node;
      while (node = walker.nextNode()) {
        textNodes.push(node);
      }

      for (const textNode of textNodes) {
        const content = textNode.nodeValue || '';
        const index = content.indexOf(highlight.text);

        if (index !== -1) {
          const range = document.createRange();
          range.setStart(textNode, index);
          range.setEnd(textNode, index + highlight.text.length);

          const span = document.createElement('span');
          span.className = `highlight highlight-${highlight.color}`;
          span.dataset.highlightId = highlight.id;
          if (highlight.note) {
            span.dataset.note = highlight.note;
            span.title = highlight.note;
          }

          range.surroundContents(span);
          break; // Only highlight the first occurrence
        }
      }
    });

    // Update the content with highlights
    if (contentRef.current) {
      contentRef.current.innerHTML = tempDiv.innerHTML;
    }
  }, [highlights, article?.content]);

  // Apply highlights when content or highlights change
  useEffect(() => {
    if (article?.content && highlights) {
      applyHighlightsToContent();
    }
  }, [article?.content, highlights, applyHighlightsToContent]);

  // Format published date
  const formatPublishedDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-8 px-4">
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-zinc-400">Loading article...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !article) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-8 px-4">
          <div className="bg-red-900/30 border border-red-700 text-red-200 p-4 rounded-md">
            <p className="font-medium">Error loading article</p>
            <p className="text-sm mt-1">The article could not be found or there was an error loading it.</p>
            <Link href="/list">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const content = (
    <div className={`transition-all ${fullscreen ? 'max-w-5xl' : 'max-w-3xl'} mx-auto py-8 px-4`}>
      {/* Top toolbar */}
      {showTools && (
        <div className="sticky top-4 z-10 mb-8 flex items-center justify-between bg-zinc-900/90 backdrop-blur-sm rounded-lg p-2 shadow-md">
          <div className="flex items-center gap-1">
            <Link href="/list">
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                <ArrowLeft size={20} />
              </Button>
            </Link>
            <div className="h-6 border-r border-zinc-700 mx-1"></div>
            <Button
              variant="ghost"
              size="icon"
              className={`${article.is_favorite ? 'text-red-500' : 'text-zinc-400 hover:text-white'}`}
              onClick={handleToggleFavorite}
              aria-label={article.is_favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart size={20} />
            </Button>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
              <BookmarkPlus size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-400 hover:text-white"
              onClick={() => setShowHighlightTools(!showHighlightTools)}
            >
              <Highlighter size={20} />
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={handleToggleFontType}>
              {fontType === "serif" ? <BookOpen size={20} /> : <Monitor size={20} />}
            </Button>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={handleDecreaseFontSize}>
              <Minus size={20} />
            </Button>
            <div className="text-zinc-400 w-8 text-center text-sm">{fontSize}</div>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={handleIncreaseFontSize}>
              <Plus size={20} />
            </Button>
            <div className="h-6 border-r border-zinc-700 mx-1"></div>
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white" onClick={handleToggleFullscreen}>
              {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </Button>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-zinc-400 hover:text-white hover:bg-zinc-800 h-9 w-9"
            >
              <ExternalLink size={20} />
            </a>
          </div>
        </div>
      )}

      {/* Highlight toolbar - shows when highlight mode is active */}
      {showHighlightTools && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-2 bg-zinc-800 backdrop-blur-sm rounded-lg p-2 shadow-lg">
          <button className="w-6 h-6 rounded-full bg-yellow-400"></button>
          <button className="w-6 h-6 rounded-full bg-green-400"></button>
          <button className="w-6 h-6 rounded-full bg-blue-400"></button>
          <button className="w-6 h-6 rounded-full bg-purple-400"></button>
          <button className="w-6 h-6 rounded-full bg-red-400"></button>
          <div className="h-6 border-r border-zinc-700 mx-1"></div>
          <Button variant="ghost" size="icon" className="text-zinc-300 hover:text-white">
            <MessageSquarePlus size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="text-zinc-300 hover:text-white">
            <ListPlus size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="text-zinc-300 hover:text-white" onClick={() => setShowHighlightTools(false)}>
            <X size={18} />
          </Button>
        </div>
      )}

      {/* Article content */}
      <article>
        {article.image_url && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full object-cover max-h-[400px]"
            />
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-3 leading-tight">{article.title}</h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-zinc-400">
            {article.author && (
              <div className="flex items-center">
                <span>By {article.author}</span>
              </div>
            )}

            {article.published_date && (
              <div className="flex items-center">
                <span>{formatPublishedDate(article.published_date)}</span>
              </div>
            )}

            {article.domain && (
              <div className="flex items-center">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-400"
                >
                  {article.domain}
                </a>
              </div>
            )}

            {article.read_time && (
              <div className="flex items-center">
                <span>{article.read_time} min read</span>
              </div>
            )}
          </div>
        </header>

        <div
          ref={contentRef}
          className={`prose dark:prose-invert max-w-none
            ${fontType === "serif" ? "prose-serif" : "prose-sans"}
            article-content relative`}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: 1.7
          }}
          onMouseUp={handleTextSelection}
          onTouchEnd={handleTextSelection}
          dangerouslySetInnerHTML={{ __html: article.content || "" }}
        />

        {/* Highlight menu */}
        {showHighlightMenu && (
          <HighlightMenu
            selectedText={selectedText}
            articleId={articleId}
            position={highlightMenuPosition}
            onClose={() => setShowHighlightMenu(false)}
            onHighlightCreated={handleHighlightCreated}
          />
        )}

        {article.tags && article.tags.length > 0 && (
          <div className="mt-10 pt-6 border-t border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: string) => (
                <Link key={tag} href={`/tags/${tag}`}>
                  <a className="px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full">
                    {tag}
                  </a>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Article navigation */}
      <div className="mt-10 pt-6 border-t border-zinc-800 flex justify-between">
        <Button variant="outline" className="gap-1 text-zinc-400">
          <ChevronLeft size={16} />
          <span>Previous</span>
        </Button>
        <Button variant="outline" className="gap-1 text-zinc-400">
          <span>Next</span>
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );

  return (
    <Layout>
      {/* Reading Progress Indicator */}
      <ReadingProgressIndicator position="top" showPercentage={false} />
      {content}
    </Layout>
  );
};

export default ArticleDetailPage;
