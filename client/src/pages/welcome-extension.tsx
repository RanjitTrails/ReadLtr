import { Link } from "wouter";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  Check,
  Chrome,
  ThumbsUp,
  Tag as TagIcon,
  CheckCircle2,
  Clock
} from "lucide-react";

export default function WelcomeExtensionPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-amber-600 mb-4">
            Welcome to ReadLtr Extension
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            You're all set! The ReadLtr extension is now installed and ready to use.
          </p>
        </div>
        
        <Card className="p-8 mb-12 bg-zinc-900 border-zinc-800">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Save Articles in One Click</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-amber-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-zinc-200">Click the ReadLtr icon in your browser toolbar to save the current page</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-amber-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-zinc-200">Right-click on any page or link and select "Save to ReadLtr"</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-amber-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-zinc-200">Add tags and notes to organize your saved articles</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-amber-500 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-zinc-200">Articles are automatically saved for offline reading</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="flex justify-center items-center">
              <div className="bg-zinc-800 p-6 rounded-lg shadow-lg max-w-[280px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-zinc-900" />
                    </div>
                    <span className="ml-2 text-lg font-medium text-white">ReadLtr</span>
                  </div>
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <div className="border-t border-zinc-700 pt-4">
                  <p className="text-sm text-zinc-300 mb-2">Successfully saved:</p>
                  <p className="text-white font-medium text-sm mb-4 truncate">How to Build a Browser Extension</p>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>5 min read</span>
                    </div>
                    <div className="flex items-center">
                      <TagIcon className="h-3 w-3 mr-1" />
                      <span>development</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">What's Next?</h2>
          <p className="text-zinc-400 mb-6">
            Visit your reading list to see your saved articles or continue browsing the web to save more content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/list">
              <Button className="bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 w-full sm:w-auto">
                <BookOpen className="mr-2 h-5 w-5" />
                Go to My Reading List
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="border-zinc-700 text-zinc-200 hover:bg-zinc-800 w-full sm:w-auto"
              onClick={() => window.open("https://github.com/username/readltr", "_blank")}
            >
              <ThumbsUp className="mr-2 h-5 w-5" />
              Support the Project
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
} 