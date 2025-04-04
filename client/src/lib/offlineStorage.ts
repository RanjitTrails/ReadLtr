/**
 * Offline Storage Service
 * 
 * This module provides functions for storing and retrieving data from IndexedDB
 * to enable offline functionality.
 */

import { v4 as uuidv4 } from 'uuid';
import { Article } from '@shared/schema';

// Database name and version
const DB_NAME = 'ReadLtrOfflineDB';
const DB_VERSION = 1;

// Store names
const STORES = {
  ARTICLES: 'cachedArticles',
  PENDING_ARTICLES: 'pendingArticles',
  PENDING_HIGHLIGHTS: 'pendingHighlights',
  PENDING_NOTES: 'pendingNotes',
  READING_SESSIONS: 'offlineReadingSessions'
};

// Open the database
export async function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.ARTICLES)) {
        db.createObjectStore(STORES.ARTICLES, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.PENDING_ARTICLES)) {
        db.createObjectStore(STORES.PENDING_ARTICLES, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.PENDING_HIGHLIGHTS)) {
        db.createObjectStore(STORES.PENDING_HIGHLIGHTS, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.PENDING_NOTES)) {
        db.createObjectStore(STORES.PENDING_NOTES, { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains(STORES.READING_SESSIONS)) {
        db.createObjectStore(STORES.READING_SESSIONS, { keyPath: 'id' });
      }
    };
  });
}

// Cache an article for offline reading
export async function cacheArticle(article: Article): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(STORES.ARTICLES, 'readwrite');
    const store = transaction.objectStore(STORES.ARTICLES);
    
    // Add or update the article
    await new Promise<void>((resolve, reject) => {
      const request = store.put(article);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
    
    console.log('Article cached successfully:', article.id);
  } catch (error) {
    console.error('Failed to cache article:', error);
    throw error;
  }
}

// Get a cached article by ID
export async function getCachedArticle(id: string): Promise<Article | null> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(STORES.ARTICLES, 'readonly');
    const store = transaction.objectStore(STORES.ARTICLES);
    
    return await new Promise<Article | null>((resolve, reject) => {
      const request = store.get(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  } catch (error) {
    console.error('Failed to get cached article:', error);
    return null;
  }
}

// Get all cached articles
export async function getAllCachedArticles(): Promise<Article[]> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(STORES.ARTICLES, 'readonly');
    const store = transaction.objectStore(STORES.ARTICLES);
    
    return await new Promise<Article[]>((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  } catch (error) {
    console.error('Failed to get all cached articles:', error);
    return [];
  }
}

// Remove a cached article
export async function removeCachedArticle(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(STORES.ARTICLES, 'readwrite');
    const store = transaction.objectStore(STORES.ARTICLES);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
    
    console.log('Cached article removed successfully:', id);
  } catch (error) {
    console.error('Failed to remove cached article:', error);
    throw error;
  }
}

// Save an article when offline
export async function saveArticleOffline(article: Partial<Article>): Promise<string> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(STORES.PENDING_ARTICLES, 'readwrite');
    const store = transaction.objectStore(STORES.PENDING_ARTICLES);
    
    // Generate a temporary ID
    const tempId = uuidv4();
    const articleWithId = { ...article, id: tempId, offline_created: true };
    
    await new Promise<void>((resolve, reject) => {
      const request = store.add(articleWithId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
    
    // Register for sync when online
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-articles');
    }
    
    console.log('Article saved offline successfully:', tempId);
    return tempId;
  } catch (error) {
    console.error('Failed to save article offline:', error);
    throw error;
  }
}

// Get all pending articles
export async function getPendingArticles(): Promise<Partial<Article>[]> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(STORES.PENDING_ARTICLES, 'readonly');
    const store = transaction.objectStore(STORES.PENDING_ARTICLES);
    
    return await new Promise<Partial<Article>[]>((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  } catch (error) {
    console.error('Failed to get pending articles:', error);
    return [];
  }
}

// Save a highlight when offline
export async function saveHighlightOffline(highlight: any): Promise<string> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(STORES.PENDING_HIGHLIGHTS, 'readwrite');
    const store = transaction.objectStore(STORES.PENDING_HIGHLIGHTS);
    
    // Generate a temporary ID
    const tempId = uuidv4();
    const highlightWithId = { ...highlight, id: tempId, offline_created: true };
    
    await new Promise<void>((resolve, reject) => {
      const request = store.add(highlightWithId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
    
    // Register for sync when online
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-highlights');
    }
    
    console.log('Highlight saved offline successfully:', tempId);
    return tempId;
  } catch (error) {
    console.error('Failed to save highlight offline:', error);
    throw error;
  }
}

// Save a note when offline
export async function saveNoteOffline(note: any): Promise<string> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(STORES.PENDING_NOTES, 'readwrite');
    const store = transaction.objectStore(STORES.PENDING_NOTES);
    
    // Generate a temporary ID
    const tempId = uuidv4();
    const noteWithId = { ...note, id: tempId, offline_created: true };
    
    await new Promise<void>((resolve, reject) => {
      const request = store.add(noteWithId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
    
    // Register for sync when online
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-notes');
    }
    
    console.log('Note saved offline successfully:', tempId);
    return tempId;
  } catch (error) {
    console.error('Failed to save note offline:', error);
    throw error;
  }
}

// Save a reading session when offline
export async function saveReadingSessionOffline(session: any): Promise<string> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(STORES.READING_SESSIONS, 'readwrite');
    const store = transaction.objectStore(STORES.READING_SESSIONS);
    
    // Generate a temporary ID if not provided
    const sessionId = session.id || uuidv4();
    const sessionWithId = { ...session, id: sessionId, offline_created: true };
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(sessionWithId);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
    
    console.log('Reading session saved offline successfully:', sessionId);
    return sessionId;
  } catch (error) {
    console.error('Failed to save reading session offline:', error);
    throw error;
  }
}

// Check if the browser is online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Register event listeners for online/offline events
export function registerConnectivityListeners(
  onlineCallback: () => void,
  offlineCallback: () => void
): void {
  window.addEventListener('online', onlineCallback);
  window.addEventListener('offline', offlineCallback);
}

// Unregister event listeners
export function unregisterConnectivityListeners(
  onlineCallback: () => void,
  offlineCallback: () => void
): void {
  window.removeEventListener('online', onlineCallback);
  window.removeEventListener('offline', offlineCallback);
}

// Clear all offline data (for testing or logout)
export async function clearOfflineData(): Promise<void> {
  try {
    const db = await openDatabase();
    const storeNames = Object.values(STORES);
    
    for (const storeName of storeNames) {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    }
    
    console.log('All offline data cleared successfully');
  } catch (error) {
    console.error('Failed to clear offline data:', error);
    throw error;
  }
}
