import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi } from 'vitest';
import { createTestQueryClient } from '../../test/setup';
import ArticleCard from './ArticleCard';

// Mock toggleFavorite function
const mockToggleFavorite = vi.fn();
vi.mock('../../lib/articleService', () => ({
  toggleFavorite: () => mockToggleFavorite()
}));

// Mock article data
const mockArticle = {
  id: '1',
  title: 'Test Article',
  url: 'https://example.com/test',
  excerpt: 'This is a test article excerpt',
  date_added: new Date().toISOString(),
  read_time: 5,
  is_favorite: false,
  is_archived: false,
  is_read: false,
  tags: ['react', 'testing']
};

describe('ArticleCard', () => {
  // Setup queryClient for tests
  const queryClient = createTestQueryClient();
  
  it('renders article information correctly', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ArticleCard article={mockArticle} />
      </QueryClientProvider>
    );
    
    // Check if title is rendered
    expect(screen.getByText('Test Article')).toBeInTheDocument();
    
    // Check if excerpt is rendered
    expect(screen.getByText('This is a test article excerpt')).toBeInTheDocument();
    
    // Check if read time is rendered
    expect(screen.getByText('5 min read')).toBeInTheDocument();
    
    // Check if tags are rendered
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('testing')).toBeInTheDocument();
  });
  
  it('handles favorite toggle correctly', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <ArticleCard article={mockArticle} />
      </QueryClientProvider>
    );
    
    // Find and click the favorite button
    const favoriteButton = screen.getByLabelText('Favorite');
    fireEvent.click(favoriteButton);
    
    // Check if toggleFavorite was called
    expect(mockToggleFavorite).toHaveBeenCalled();
  });
}); 