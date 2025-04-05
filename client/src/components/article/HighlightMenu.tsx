import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Highlighter, MessageSquare, Copy, Share2, X } from 'lucide-react';
import { createHighlight } from '@/lib/highlightService';
import { toast } from '@/components/ui/toast';

interface HighlightMenuProps {
  selectedText: string;
  articleId: string;
  position: { x: number; y: number };
  onClose: () => void;
  onHighlightCreated: (highlight: any) => void;
}

const HIGHLIGHT_COLORS = [
  { name: 'yellow', class: 'bg-yellow-500', textClass: 'text-black' },
  { name: 'blue', class: 'bg-blue-500', textClass: 'text-white' },
  { name: 'green', class: 'bg-green-500', textClass: 'text-black' },
  { name: 'pink', class: 'bg-pink-500', textClass: 'text-white' },
  { name: 'purple', class: 'bg-purple-500', textClass: 'text-white' },
];

export default function HighlightMenu({ 
  selectedText, 
  articleId, 
  position, 
  onClose,
  onHighlightCreated
}: HighlightMenuProps) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [note, setNote] = useState('');
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[0].name);

  // Position the menu above the selected text
  const menuStyle = {
    position: 'absolute' as const,
    left: `${position.x}px`,
    top: `${Math.max(position.y - 50, 10)}px`,
    zIndex: 1000,
  };

  const handleHighlight = async (color: string) => {
    try {
      setSelectedColor(color);
      
      const highlight = await createHighlight({
        articleId,
        text: selectedText,
        color,
        note: '',
      });
      
      onHighlightCreated(highlight);
      toast({
        title: 'Highlight created',
        description: 'Your highlight has been saved',
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating highlight:', error);
      toast({
        title: 'Error',
        description: 'Failed to create highlight',
        variant: 'destructive',
      });
    }
  };

  const handleAddNote = async () => {
    try {
      const highlight = await createHighlight({
        articleId,
        text: selectedText,
        color: selectedColor,
        note,
      });
      
      onHighlightCreated(highlight);
      toast({
        title: 'Note added',
        description: 'Your highlight and note have been saved',
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedText);
    toast({
      title: 'Copied',
      description: 'Text copied to clipboard',
    });
    onClose();
  };

  const handleShare = () => {
    // Implement sharing functionality
    if (navigator.share) {
      navigator.share({
        text: selectedText,
      }).catch(console.error);
    } else {
      handleCopy();
    }
    onClose();
  };

  return (
    <div 
      className="bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg p-2"
      style={menuStyle}
    >
      {!isAddingNote ? (
        <>
          <div className="flex space-x-1 mb-2">
            {HIGHLIGHT_COLORS.map((color) => (
              <button
                key={color.name}
                className={`w-6 h-6 rounded-full ${color.class} flex items-center justify-center`}
                onClick={() => handleHighlight(color.name)}
                aria-label={`Highlight with ${color.name} color`}
              >
                {selectedColor === color.name && (
                  <span className={`text-xs ${color.textClass}`}>✓</span>
                )}
              </button>
            ))}
          </div>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-zinc-300 hover:text-white"
              onClick={() => setIsAddingNote(true)}
            >
              <MessageSquare size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-zinc-300 hover:text-white"
              onClick={handleCopy}
            >
              <Copy size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-zinc-300 hover:text-white"
              onClick={handleShare}
            >
              <Share2 size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-zinc-300 hover:text-white"
              onClick={onClose}
            >
              <X size={16} />
            </Button>
          </div>
        </>
      ) : (
        <div className="w-64">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-white">Add Note</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 text-zinc-400"
              onClick={() => setIsAddingNote(false)}
            >
              <X size={14} />
            </Button>
          </div>
          <textarea
            className="w-full h-24 p-2 text-sm bg-zinc-700 border border-zinc-600 rounded-md text-white"
            placeholder="Add your note here..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            autoFocus
          />
          <div className="flex justify-end mt-2">
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleAddNote}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
