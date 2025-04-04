import { useState, useEffect, useRef } from 'react';
import { 
  startReadingSession, 
  updateReadingProgress, 
  endReadingSession 
} from '@/lib/analyticsService';

interface ReadingTrackerProps {
  articleId: string;
  initialProgress?: number;
}

/**
 * Reading Tracker Component
 * 
 * This component tracks reading progress and reports it to the analytics service.
 * It should be included in the article reading page.
 */
export default function ReadingTracker({ articleId, initialProgress = 0 }: ReadingTrackerProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [progress, setProgress] = useState(initialProgress);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());
  const isVisibleRef = useRef<boolean>(true);
  
  // Start reading session when component mounts
  useEffect(() => {
    const startSession = async () => {
      const session = await startReadingSession(articleId);
      if (session) {
        setSessionId(session.id);
      }
    };
    
    startSession();
    
    // End session when component unmounts
    return () => {
      if (sessionId) {
        endReadingSession(sessionId, progress);
      }
    };
  }, [articleId]);
  
  // Track scroll position to calculate reading progress
  useEffect(() => {
    if (!sessionId) return;
    
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
      
      setProgress(visiblePercentage);
      
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
        updateReadingProgress(sessionId, progress);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Periodic updates even when not scrolling
    const intervalId = setInterval(() => {
      if (isVisibleRef.current && sessionId) {
        const now = Date.now();
        if (now - lastUpdateRef.current > 10000) {
          updateReadingProgress(sessionId, progress);
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
  }, [sessionId, progress, articleId]);
  
  // This component doesn't render anything visible
  return null;
}

// Higher-order component to wrap content with reading tracking
export function withReadingTracker<P extends object>(
  Component: React.ComponentType<P>,
  getArticleId: (props: P) => string,
  getInitialProgress?: (props: P) => number
) {
  return function WithReadingTracker(props: P) {
    const articleId = getArticleId(props);
    const initialProgress = getInitialProgress ? getInitialProgress(props) : 0;
    
    return (
      <>
        <ReadingTracker articleId={articleId} initialProgress={initialProgress} />
        <Component {...props} />
      </>
    );
  };
}
