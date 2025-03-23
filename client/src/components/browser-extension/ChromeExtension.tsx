import { Button } from '@/components/ui/button';
import { Chrome, Download } from 'lucide-react';

const ChromeExtension = () => {
  return (
    <div className="bg-zinc-900 p-6 rounded-lg">
      <div className="flex items-center gap-3 mb-4">
        <Chrome size={24} className="text-blue-400" />
        <h2 className="text-xl font-semibold">Chrome Extension</h2>
      </div>
      
      <p className="text-zinc-400 mb-6">
        Install our Chrome extension to save articles with a single click, directly from your browser.
      </p>
      
      <div className="bg-zinc-800 p-4 rounded-md mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium">ReadLtr Extension</h3>
            <p className="text-sm text-zinc-500">Version 1.0.0</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download size={16} className="mr-2" />
            Install
          </Button>
        </div>
        
        <ul className="text-sm text-zinc-400 space-y-1">
          <li>• Save articles with one click</li>
          <li>• Highlight and save text snippets</li>
          <li>• Automatically detect readability mode</li>
          <li>• Sync across all your devices</li>
        </ul>
      </div>
      
      <div className="border-t border-zinc-800 pt-4">
        <h3 className="font-medium mb-3">Installation Instructions</h3>
        <ol className="list-decimal list-inside text-zinc-400 space-y-2 text-sm">
          <li>Click the "Install" button above to download the extension</li>
          <li>Open Chrome and navigate to <code className="bg-zinc-800 px-1 rounded">chrome://extensions</code></li>
          <li>Enable "Developer mode" in the top-right corner</li>
          <li>Drag and drop the downloaded file onto the extensions page</li>
          <li>Confirm the installation when prompted</li>
        </ol>
      </div>
      
      <div className="mt-6 border-t border-zinc-800 pt-4">
        <h3 className="font-medium mb-2">How to use the extension</h3>
        <p className="text-sm text-zinc-400">
          After installation, you'll see the ReadLtr icon in your browser toolbar. Click it while on any article to save
          it to your reading list. You can also right-click on any text to save a selection or highlight.
        </p>
      </div>
    </div>
  );
};

export default ChromeExtension; 