import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
          <FileQuestion size={40} />
        </div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-zinc-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/">
              <a>Back to Home</a>
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/list">
              <a>My Reading List</a>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
