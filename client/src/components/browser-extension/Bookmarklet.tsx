import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bookmark } from 'lucide-react';

const Bookmarklet = () => {
  const [copied, setCopied] = useState(false);

  // This is the bookmarklet code that will be executed when the user clicks the bookmark
  const bookmarkletCode = `
    javascript:(function(){
      // Base URL of our application
      var baseUrl = '${window.location.origin}';
      
      // Get current page info
      var url = encodeURIComponent(document.location.href);
      var title = encodeURIComponent(document.title);
      
      // Open a popup with the save dialog
      window.open(
        baseUrl + '/save?url=' + url + '&title=' + title,
        'readltr_save',
        'width=500,height=600,toolbar=0,menubar=0,location=0'
      );
    })();
  `.trim().replace(/\s+/g, ' ');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDragStart = (e: React.DragEvent<HTMLAnchorElement>) => {
    e.dataTransfer.setData('text/plain', bookmarkletCode);
  };

  return (
    <div className="bg-zinc-900 p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-2">ReadLtr Bookmarklet</h2>
      <p className="text-zinc-400 mb-4">
        Drag this bookmarklet to your bookmarks bar to save articles with a single click.
      </p>
      
      <div className="flex flex-col items-center mb-4">
        <a 
          href={bookmarkletCode}
          draggable
          onDragStart={handleDragStart}
          className="bg-zinc-800 text-white py-2 px-4 rounded-md flex items-center gap-2 hover:bg-zinc-700 mb-4"
        >
          <Bookmark size={16} />
          <span>Save to ReadLtr</span>
        </a>
        
        <p className="text-sm text-zinc-500 text-center">
          Drag this button to your bookmarks bar. If you can't drag it, you can copy the code and create a bookmark manually.
        </p>
      </div>
      
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full"
        onClick={copyToClipboard}
      >
        {copied ? 'Copied!' : 'Copy Bookmarklet Code'}
      </Button>
      
      <div className="mt-6 border-t border-zinc-800 pt-4">
        <h3 className="font-medium mb-2">How to use the bookmarklet</h3>
        <ol className="list-decimal list-inside text-zinc-400 space-y-2 text-sm">
          <li>Drag the button above to your bookmarks bar</li>
          <li>Navigate to any article or web page you want to save</li>
          <li>Click the "Save to ReadLtr" bookmark in your bookmarks bar</li>
          <li>The article will be saved to your ReadLtr account</li>
        </ol>
      </div>
    </div>
  );
};

export default Bookmarklet; 