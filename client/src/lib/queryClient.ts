import { QueryClient } from "@tanstack/react-query";
import { supabase } from './supabase';

// Configure global defaults for all queries
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long the data in the cache will remain fresh (in milliseconds)
      staleTime: 1000 * 60 * 5, // 5 minutes
      
      // How many times to retry failed queries
      retry: 1,
      
      // If true, the query will be refetched when the window regains focus
      refetchOnWindowFocus: true,
      
      // If true, the query will be refetched when the component using it is remounted
      refetchOnMount: true,
      
      // Placeholder and error data handling
      placeholderData: keepPreviousData,
    },
    mutations: {
      // How many times to retry failed mutations
      retry: 0,
    },
  },
});

// Helper function to keep previous data while fetching new data
function keepPreviousData<T>(previousData: T | undefined): T | undefined {
  return previousData;
}

// Query keys for caching and invalidation
export const queryKeys = {
  articles: {
    all: ['articles'] as const,
    lists: () => [...queryKeys.articles.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.articles.lists(), filters] as const,
    details: () => [...queryKeys.articles.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.articles.details(), id] as const,
  },
  tags: {
    all: ['tags'] as const,
  },
  user: {
    all: ['user'] as const,
    preferences: () => [...queryKeys.user.all, 'preferences'] as const,
  },
};

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest<T = any>(
  method: Method,
  endpoint: string,
  data?: any
): Promise<T> {
  // Extract the resource and ID from the endpoint
  // Example: /api/articles/123 -> resource = 'articles', id = '123'
  const parts = endpoint.replace(/^\/api\//, '').split('/');
  const resource = parts[0];
  const id = parts.length > 1 ? parts[1] : undefined;
  
  try {
    let response;
    
    // Handle different HTTP methods
    switch (method) {
      case 'GET':
        if (id) {
          // Get a single item
          response = await supabase
            .from(resource)
            .select('*')
            .eq('id', id)
            .single();
        } else {
          // Get all items
          response = await supabase
            .from(resource)
            .select('*');
        }
        break;
        
      case 'POST':
        // Create a new item
        response = await supabase
          .from(resource)
          .insert(data)
          .select();
        break;
        
      case 'PUT':
      case 'PATCH':
        // Update an existing item
        if (!id) throw new Error('ID is required for update operations');
        response = await supabase
          .from(resource)
          .update(data)
          .eq('id', id)
          .select();
        break;
        
      case 'DELETE':
        // Delete an item
        if (!id) throw new Error('ID is required for delete operations');
        response = await supabase
          .from(resource)
          .delete()
          .eq('id', id);
        break;
        
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    
    if (response.error) throw response.error;
    
    return response.data as T;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}
