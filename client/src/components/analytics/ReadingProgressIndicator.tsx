import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ReadingProgressIndicatorProps {
  className?: string;
  showPercentage?: boolean;
  showLabel?: boolean;
  position?: 'top' | 'bottom';
  color?: string;
}

/**
 * Reading Progress Indicator
 * 
 * This component displays a progress bar indicating how far the user has scrolled
 * through the article content.
 */
export default function ReadingProgressIndicator({
  className,
  showPercentage = false,
  showLabel = false,
  position = 'top',
  color = 'bg-blue-600'
}: ReadingProgressIndicatorProps) {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const calculateProgress = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      // Calculate progress percentage
      const scrollPercentage = Math.min(
        100,
        Math.max(
          0,
          Math.round((scrollTop / (documentHeight - windowHeight)) * 100)
        )
      );
      
      setProgress(scrollPercentage);
    };
    
    // Calculate initial progress
    calculateProgress();
    
    // Add scroll event listener
    window.addEventListener('scroll', calculateProgress);
    window.addEventListener('resize', calculateProgress);
    
    return () => {
      window.removeEventListener('scroll', calculateProgress);
      window.removeEventListener('resize', calculateProgress);
    };
  }, []);
  
  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-50 transition-opacity duration-300',
        position === 'top' ? 'top-0' : 'bottom-0',
        progress > 0 ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      <div className="relative">
        {showLabel && (
          <div className="absolute right-4 top-0 text-xs font-medium text-white bg-zinc-800 px-2 py-1 rounded-b-md">
            {showPercentage ? `${progress}%` : `${progress}% read`}
          </div>
        )}
        <Progress
          value={progress}
          className={cn('h-1 rounded-none', color)}
          indicatorClassName={cn('transition-all duration-300', color)}
        />
      </div>
    </div>
  );
}
