import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Bookmark, 
  Globe, 
  Lock,
  Grid,
  List as ListIcon,
  Search
} from 'lucide-react';
import { getUserCollections, getPublicCollections } from '@/lib/socialService';
import { useAuth } from '@/lib/api';
import CollectionCard from '@/components/social/CollectionCard';
import { Input } from '@/components/ui/input';

export default function CollectionsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch user collections
  const { 
    data: userCollections = [], 
    isLoading: userCollectionsLoading 
  } = useQuery({
    queryKey: ['userCollections'],
    queryFn: () => getUserCollections(user?.id || ''),
    enabled: !!user && activeTab === 'my'
  });
  
  // Fetch public collections
  const { 
    data: publicCollections = [], 
    isLoading: publicCollectionsLoading 
  } = useQuery({
    queryKey: ['publicCollections'],
    queryFn: () => getPublicCollections(50),
    enabled: activeTab === 'discover'
  });
  
  // Filter collections based on search query
  const filteredCollections = activeTab === 'my' 
    ? userCollections.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : publicCollections.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  
  const isLoading = 
    (activeTab === 'my' && userCollectionsLoading) || 
    (activeTab === 'discover' && publicCollectionsLoading);
  
  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-2xl font-bold text-white">Collections</h1>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Link href="/collections/new">
              <Button className="gap-2">
                <Plus size={16} />
                <span>New Collection</span>
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="my" className="px-4">
                <Bookmark className="h-4 w-4 mr-2" />
                My Collections
              </TabsTrigger>
              <TabsTrigger value="discover" className="px-4">
                <Globe className="h-4 w-4 mr-2" />
                Discover
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="text"
                placeholder="Search collections..."
                className="pl-9 bg-zinc-900 border-zinc-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={viewMode === 'list' ? 'bg-zinc-800' : ''}
                onClick={() => setViewMode('list')}
              >
                <ListIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={viewMode === 'grid' ? 'bg-zinc-800' : ''}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Loading state */}
        {isLoading && (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="p-4 border border-zinc-800 rounded-lg">
                <div className="space-y-3">
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Empty state - My Collections */}
        {!isLoading && activeTab === 'my' && filteredCollections.length === 0 && (
          <div className="text-center py-12 bg-zinc-900/50 rounded-lg border border-zinc-800">
            {searchQuery ? (
              <>
                <Search className="h-12 w-12 mx-auto text-zinc-700 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Collections Found</h3>
                <p className="text-zinc-500 max-w-md mx-auto">
                  No collections match your search query. Try a different search term.
                </p>
              </>
            ) : (
              <>
                <Bookmark className="h-12 w-12 mx-auto text-zinc-700 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Collections Yet</h3>
                <p className="text-zinc-500 max-w-md mx-auto mb-6">
                  Collections help you organize your articles by topic or theme.
                  Create your first collection to get started.
                </p>
                <Link href="/collections/new">
                  <Button className="gap-2">
                    <Plus size={16} />
                    <span>Create Collection</span>
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
        
        {/* Empty state - Discover */}
        {!isLoading && activeTab === 'discover' && filteredCollections.length === 0 && (
          <div className="text-center py-12 bg-zinc-900/50 rounded-lg border border-zinc-800">
            {searchQuery ? (
              <>
                <Search className="h-12 w-12 mx-auto text-zinc-700 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Collections Found</h3>
                <p className="text-zinc-500 max-w-md mx-auto">
                  No public collections match your search query. Try a different search term.
                </p>
              </>
            ) : (
              <>
                <Globe className="h-12 w-12 mx-auto text-zinc-700 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Public Collections</h3>
                <p className="text-zinc-500 max-w-md mx-auto">
                  There are no public collections available yet. Be the first to share your collection with the community!
                </p>
              </>
            )}
          </div>
        )}
        
        {/* Collections grid */}
        {!isLoading && filteredCollections.length > 0 && (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredCollections.map((collection) => (
              <CollectionCard 
                key={collection.id} 
                collection={collection}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
