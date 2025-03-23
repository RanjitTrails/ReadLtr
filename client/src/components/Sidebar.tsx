import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Inbox,
  Archive,
  Heart,
  BookOpen,
  Hash,
  Settings,
  HelpCircle,
  Home,
  Search,
  BookMarked,
  Clock,
  PanelLeft,
  Filter,
  Plus,
  FileText,
  Book,
  Mail,
  FileIcon,
  Twitter,
  Video,
  Rss,
  ChevronDown,
  ChevronRight,
  Library
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllTags } from "@/lib/articleService";

// Define interface for navigation items
interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<any>; // LucideIcon type
  badge?: number; // Optional badge count
}

export default function Sidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showLibrary, setShowLibrary] = useState(true);
  const [showFeed, setShowFeed] = useState(false);
  
  // Fetch all tags
  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: getAllTags,
  });

  const navItems: NavItem[] = [
    { href: "/", label: "Home", icon: Home },
    // Library and its subfolders are handled separately
    { href: "/favorites", label: "Favorites", icon: Heart },
    { href: "/archive", label: "Archive", icon: Archive },
    { href: "/later", label: "Read Later", icon: Clock },
    { href: "/highlights", label: "Highlights", icon: BookMarked },
  ];

  const libraryItems: NavItem[] = [
    { href: "/list/articles", label: "Articles", icon: FileText, badge: 23 },
    { href: "/list/books", label: "Books", icon: Book },
    { href: "/list/emails", label: "Emails", icon: Mail },
    { href: "/list/pdfs", label: "PDFs", icon: FileIcon },
    { href: "/list/tweets", label: "Tweets", icon: Twitter },
    { href: "/list/videos", label: "Videos", icon: Video },
    { href: "/list/tags", label: "Tags", icon: Hash },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <aside 
      className={cn(
        "h-screen flex flex-col bg-zinc-950 text-zinc-200 border-r border-zinc-800 transition-all duration-300",
        collapsed ? "w-[60px]" : "w-[250px]"
      )}
    >
      <div className="flex items-center justify-between p-3 h-16">
        {!collapsed && (
          <Link href="/">
            <a className="flex items-center">
              <BookOpen className="h-6 w-6 text-blue-400" />
              <span className="ml-2 text-lg font-semibold">ReadLtr</span>
            </a>
          </Link>
        )}
        {collapsed && (
          <Link href="/">
            <a className="mx-auto">
              <BookOpen className="h-6 w-6 text-blue-400" />
            </a>
          </Link>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setCollapsed(!collapsed)} 
          className="text-zinc-400 hover:text-white"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Search */}
      <div className="px-3 mt-2 mb-4">
        {!collapsed ? (
          <div className="flex items-center bg-zinc-900 rounded-md px-3 py-2 text-zinc-400">
            <Search className="h-4 w-4 mr-2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none w-full text-sm"
            />
          </div>
        ) : (
          <Button variant="ghost" size="icon" className="mx-auto flex text-zinc-400 hover:text-white">
            <Search className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      {/* Add new article button */}
      <div className="px-3 mb-6">
        {!collapsed ? (
          <Link href="/save">
            <a className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center justify-center">
              <Plus className="h-4 w-4 mr-2" />
              Add New Article
            </a>
          </Link>
        ) : (
          <Link href="/save">
            <a className="mx-auto flex bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md">
              <Plus className="h-5 w-5" />
            </a>
          </Link>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a
                className={cn(
                  "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                )}
              >
                <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="ml-auto bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full text-xs">
                    {item.badge}
                  </span>
                )}
              </a>
            </Link>
          ))}
        </div>
        
        {/* Library Section */}
        <div className="mt-6">
          {!collapsed ? (
            <button
              onClick={() => setShowLibrary(!showLibrary)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100"
            >
              <div className="flex items-center">
                <Library className="h-5 w-5 mr-3" />
                <span>Library</span>
              </div>
              <span>{showLibrary ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span>
            </button>
          ) : (
            <div className="flex justify-center py-2">
              <Library className="h-5 w-5 text-zinc-400" />
            </div>
          )}
          
          {!collapsed && showLibrary && (
            <div className="mt-1 ml-2 space-y-1">
              {libraryItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a className="flex items-center py-1.5 px-3 rounded-md text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900">
                    <item.icon className="h-4 w-4 mr-3" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full text-xs">
                        {item.badge}
                      </span>
                    )}
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {/* Feed Section */}
        <div className="mt-2">
          {!collapsed ? (
            <button
              onClick={() => setShowFeed(!showFeed)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100"
            >
              <div className="flex items-center">
                <Rss className="h-5 w-5 mr-3" />
                <span>Feed</span>
              </div>
              <span>{showFeed ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span>
            </button>
          ) : (
            <div className="flex justify-center py-2">
              <Rss className="h-5 w-5 text-zinc-400" />
            </div>
          )}
          
          {!collapsed && showFeed && (
            <div className="mt-1 ml-2 space-y-1">
              <Link href="/feeds/manage">
                <a className="flex items-center py-1.5 px-3 rounded-md text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900">
                  <Settings className="h-4 w-4 mr-3" />
                  <span>Manage feeds</span>
                </a>
              </Link>
            </div>
          )}
        </div>
        
        {/* Filters section */}
        {!collapsed && (
          <div className="mt-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100"
            >
              <div className="flex items-center">
                <Filter className="h-4 w-4 mr-3" />
                <span>Filters</span>
              </div>
              <span>{showFilters ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</span>
            </button>
            
            {showFilters && (
              <div className="mt-2 ml-7 space-y-1">
                <a
                  href="#"
                  className="block px-3 py-1 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-md"
                >
                  Unread
                </a>
                <a
                  href="#"
                  className="block px-3 py-1 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-md"
                >
                  Long reads
                </a>
                <a
                  href="#"
                  className="block px-3 py-1 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 rounded-md"
                >
                  Recently added
                </a>
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="p-3 border-t border-zinc-800">
        <div className="space-y-1">
          <Link href="/settings">
            <a
              className={cn(
                "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors",
                isActive("/settings")
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
              )}
            >
              <Settings className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
              {!collapsed && <span>Settings</span>}
            </a>
          </Link>
          <Link href="/help">
            <a
              className={cn(
                "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors",
                isActive("/help")
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
              )}
            >
              <HelpCircle className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
              {!collapsed && <span>Help</span>}
            </a>
          </Link>
        </div>
      </div>
    </aside>
  );
} 