
import React from 'react';
import { Button } from './button';
import { Share2 } from 'lucide-react';

export function ShareButton({ url }: { url: string }) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Share Content',
          url: url
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback copy to clipboard
      navigator.clipboard.writeText(url);
    }
  };

  return (
    <Button 
      onClick={handleShare}
      className="bg-omnivore-primary text-white hover:bg-omnivore-secondary"
    >
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </Button>
  );
}
