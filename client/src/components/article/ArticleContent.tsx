
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Share2, BookmarkPlus, Clock, Users, Bookmark } from 'lucide-react';

interface ArticleContentProps {
  article: any;
  onUpdate: (id: number, updates: any) => void;
}

export default function ArticleContent({ article, onUpdate }: ArticleContentProps) {
  const [isTextToSpeechEnabled, setIsTextToSpeechEnabled] = useState(article.audioEnabled);
  const [isDarkMode, setIsDarkMode] = useState(article.darkMode);
  const [readingProgress, setReadingProgress] = useState(article.readingProgress);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [collectionsModalOpen, setCollectionsModalOpen] = useState(false);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById('article-content');
      if (element) {
        const progress = Math.floor((window.scrollY / (element.scrollHeight - window.innerHeight)) * 100);
        setReadingProgress(Math.min(progress, 100));
        onUpdate(article.id, { readingProgress: progress });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [article.id, onUpdate]);

  // Text-to-speech
  const toggleTextToSpeech = () => {
    setIsTextToSpeechEnabled(!isTextToSpeechEnabled);
    onUpdate(article.id, { audioEnabled: !isTextToSpeechEnabled });
    
    if (!isTextToSpeechEnabled) {
      const utterance = new SpeechSynthesisUtterance(article.content);
      utterance.lang = article.textToSpeechLang || 'en';
      window.speechSynthesis.speak(utterance);
    } else {
      window.speechSynthesis.cancel();
    }
  };

  // Dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    onUpdate(article.id, { darkMode: !isDarkMode });
  };

  return (
    <div className={`py-8 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white'}`}>
      <div className="max-w-3xl mx-auto px-4">
        {/* Article Tools */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={isTextToSpeechEnabled}
                onCheckedChange={toggleTextToSpeech}
                id="tts"
              />
              <Label htmlFor="tts">Text-to-Speech</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={isDarkMode}
                onCheckedChange={toggleDarkMode}
                id="dark-mode"
              />
              <Label htmlFor="dark-mode">Dark Mode</Label>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareModalOpen(true)}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCollectionsModalOpen(true)}
            >
              <BookmarkPlus className="h-4 w-4 mr-1" />
              Add to Collection
            </Button>
          </div>
        </div>
        
        {/* Reading Progress */}
        <div className="mb-8">
          <div className="bg-slate-200 rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
          <p className="text-sm text-slate-500 mt-2">
            Reading Progress: {readingProgress}%
          </p>
        </div>
        
        {/* Article Content */}
        <article
          id="article-content"
          className={`prose ${isDarkMode ? 'prose-invert' : ''} max-w-none`}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        
        {/* Share Modal */}
        {shareModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <Card className="w-96 p-4">
              <h3 className="text-lg font-semibold mb-4">Share Article</h3>
              <div className="space-y-4">
                <div>
                  <Label>Make Public</Label>
                  <Switch
                    checked={article.isPublic}
                    onCheckedChange={(checked) => {
                      onUpdate(article.id, { isPublic: checked });
                    }}
                  />
                </div>
                <div>
                  <Label>Share with Users</Label>
                  <Input
                    placeholder="Enter usernames separated by commas"
                    onChange={(e) => {
                      const users = e.target.value.split(',').map(u => u.trim());
                      onUpdate(article.id, { sharedWith: users });
                    }}
                  />
                </div>
                <Button onClick={() => setShareModalOpen(false)}>Close</Button>
              </div>
            </Card>
          </div>
        )}
        
        {/* Collections Modal */}
        {collectionsModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <Card className="w-96 p-4">
              <h3 className="text-lg font-semibold mb-4">Add to Collection</h3>
              <div className="space-y-4">
                <Input
                  placeholder="New Collection Name"
                  onChange={(e) => {
                    const collections = [...(article.collections || []), e.target.value];
                    onUpdate(article.id, { collections });
                  }}
                />
                <div className="flex flex-wrap gap-2">
                  {article.collections?.map((collection: string) => (
                    <div
                      key={collection}
                      className="bg-slate-100 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      <Bookmark className="h-4 w-4 mr-1" />
                      {collection}
                    </div>
                  ))}
                </div>
                <Button onClick={() => setCollectionsModalOpen(false)}>Close</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
