import { useState } from "react";
import Layout from "@/components/Layout";
import { useQuery } from "@tanstack/react-query";
import { getArticles } from "@/lib/articleService";
import { Link } from "wouter";
import ArticleCard from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LayoutGrid, 
  List as ListIcon, 
  Filter,
  ChevronDown,
  SortAsc,
  SortDesc,
  Book
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BooksPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  
  // Get articles with content_type = 'books'
  const { data: books = [], isLoading } = useQuery({
    queryKey: ["articles", "content-type", "books", sortOrder],
    queryFn: () => getArticles({ 
      contentType: "books",
      // Add sorting logic here in a real implementation
    }),
  });
  
  // Loading skeletons
  const renderSkeletons = (count = 8) => {
    return Array(count).fill(0).map((_, i) => (
      <div key={i} className="p-4 border border-zinc-800 rounded-lg">
        <div className="space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex justify-between pt-2">
            <Skeleton className="h-4 w-20" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    ));
  };

  const content = (
    <div className="py-8 px-4 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Book className="h-6 w-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">Books</h1>
        </div>
        
        <div className="flex gap-2">
          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {sortOrder === "newest" ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
                <span>{sortOrder === "newest" ? "Newest first" : "Oldest first"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
              <DropdownMenuItem 
                className={sortOrder === "newest" ? "bg-zinc-800" : ""}
                onClick={() => setSortOrder("newest")}
              >
                <SortDesc className="h-4 w-4 mr-2" />
                Newest first
              </DropdownMenuItem>
              <DropdownMenuItem 
                className={sortOrder === "oldest" ? "bg-zinc-800" : ""}
                onClick={() => setSortOrder("oldest")}
              >
                <SortAsc className="h-4 w-4 mr-2" />
                Oldest first
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Filter button - would open a more complex filter panel in a real implementation */}
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
          
          {/* View mode toggle */}
          <div className="flex rounded-md overflow-hidden border border-zinc-800">
            <Button 
              variant="ghost" 
              size="sm"
              className={`rounded-none px-2 ${viewMode === "grid" ? "bg-blue-600" : "bg-zinc-900"}`}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={`rounded-none px-2 ${viewMode === "list" ? "bg-blue-600" : "bg-zinc-900"}`}
              onClick={() => setViewMode("list")}
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-3 gap-4" : "space-y-4"}>
          {renderSkeletons(viewMode === "grid" ? 9 : 5)}
        </div>
      ) : books.length > 0 ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-3 gap-4" : "space-y-4"}>
          {books.map(book => (
            <ArticleCard
              key={book.id}
              article={book}
              viewMode={viewMode}
              showTags
            />
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900/50 rounded-lg p-10 text-center">
          <p className="text-zinc-400 mb-4">You don't have any books saved yet.</p>
          <Link href="/save">
            <a className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md">
              Add Your First Book
            </a>
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      {content}
    </Layout>
  );
} 