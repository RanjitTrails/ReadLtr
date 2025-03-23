import { useState } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { saveArticle } from "@/lib/articleService";
import { 
  Link as LinkIcon, 
  BookOpen, 
  Clipboard, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Tag as TagIcon,
  Loader2
} from "lucide-react";

export default function SavePage() {
  const [, navigate] = useLocation();
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [note, setNote] = useState("");
  const [contentType, setContentType] = useState<"articles" | "books" | "emails" | "pdfs" | "tweets" | "videos">("articles");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSuccessful, setIsSuccessful] = useState(false);
  
  // Mutation for saving article
  const saveMutation = useMutation({
    mutationFn: saveArticle,
    onSuccess: () => {
      setIsSuccessful(true);
      setTimeout(() => {
        navigate("/list");
      }, 2000);
    },
    onError: (error: Error) => {
      setErrorMsg(error.message || "Failed to save the article. Please try again.");
    }
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      setErrorMsg("Please enter a valid URL");
      return;
    }
    
    // Clear any existing error
    setErrorMsg("");
    
    // Process tags
    const tagArray = tags
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
    
    // Submit the article
    saveMutation.mutate({
      url,
      tags: tagArray,
      note: note || undefined,
      contentType: contentType
    });
  };
  
  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setUrl(clipboardText);
      }
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };
  
  return (
    <Layout>
      <div className="py-10 px-4 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Add to Your Reading List</h1>
          <p className="text-zinc-400">
            Save articles, blog posts, and other web content to read later.
          </p>
        </div>
        
        {isSuccessful ? (
          <div className="bg-green-900/20 border border-green-800 rounded-lg p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-white mb-2">Article Saved!</h2>
            <p className="text-zinc-300 mb-4">
              Your article was successfully added to your reading list.
            </p>
            <Button onClick={() => navigate("/list")}>
              Go to My List
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                <p className="text-red-200 text-sm">{errorMsg}</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="url" className="text-white">
                Article URL
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
                  <Input
                    id="url"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="pl-10 bg-zinc-900 border-zinc-700 text-white"
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePaste}
                  className="flex-shrink-0"
                >
                  <Clipboard className="h-4 w-4 mr-2" />
                  Paste
                </Button>
              </div>
              <p className="text-xs text-zinc-500">
                Tip: You can also install the browser extension to save articles with one click.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contentType" className="text-white">
                Content Type
              </Label>
              <select
                id="contentType"
                value={contentType}
                onChange={(e) => setContentType(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2 text-white"
              >
                <option value="articles">Article</option>
                <option value="books">Book</option>
                <option value="emails">Email</option>
                <option value="pdfs">PDF</option>
                <option value="tweets">Tweet</option>
                <option value="videos">Video</option>
              </select>
              <p className="text-xs text-zinc-500">
                Select the type of content you're saving
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-white">
                Tags (optional)
              </Label>
              <div className="relative">
                <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
                <Input
                  id="tags"
                  placeholder="technology, science, news"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="pl-10 bg-zinc-900 border-zinc-700 text-white"
                />
              </div>
              <p className="text-xs text-zinc-500">
                Separate tags with commas
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="note" className="text-white">
                Notes (optional)
              </Label>
              <Textarea
                id="note"
                placeholder="Add a note about this article..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-zinc-900 border-zinc-700 text-white resize-none h-24"
              />
            </div>
            
            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving Article...
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Save to Reading List
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
        
        <div className="mt-12 border-t border-zinc-800 pt-8">
          <h2 className="text-lg font-medium text-white mb-4">Other Ways to Save</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
              <h3 className="text-base font-medium text-white mb-2">Browser Extension</h3>
              <p className="text-sm text-zinc-400 mb-3">
                Save articles with one click while browsing the web.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Get Extension
              </Button>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
              <h3 className="text-base font-medium text-white mb-2">Email to ReadLtr</h3>
              <p className="text-sm text-zinc-400 mb-3">
                Forward articles to your personal ReadLtr email address.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Setup Email
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 