// Service Worker for ReadLtr
// Handles caching and offline access

const CACHE_NAME = 'readltr-cache-v1';
const RUNTIME_CACHE = 'readltr-runtime-v1';

// Resources to cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/index.css',
  '/assets/index.js',
  '/offline.html',
  '/assets/offline.css',
  '/assets/images/offline.svg'
];

// Install event - precache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    // For API requests, use network first, then cache
    if (event.request.url.includes('/api/') || 
        event.request.url.includes('supabase.co')) {
      handleApiRequest(event);
    } 
    // For article content, use cache first, then network
    else if (event.request.url.includes('/article/')) {
      handleArticleRequest(event);
    }
    // For other requests, use cache first with network fallback
    else {
      handleStaticRequest(event);
    }
  }
});

// Handle API requests - network first, then cache
function handleApiRequest(event) {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache a copy of the response
        const responseToCache = response.clone();
        caches.open(RUNTIME_CACHE)
          .then(cache => {
            // Only cache successful responses
            if (response.status === 200) {
              cache.put(event.request, responseToCache);
            }
          });
        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(event.request);
      })
  );
}

// Handle article requests - cache first, then network
function handleArticleRequest(event) {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) {
          // Fetch from network in the background to update cache
          fetch(event.request)
            .then(response => {
              caches.open(RUNTIME_CACHE)
                .then(cache => {
                  cache.put(event.request, response);
                });
            })
            .catch(err => console.log('Failed to update article cache:', err));
          
          return cachedResponse;
        }
        
        // If not in cache, fetch from network
        return fetch(event.request)
          .then(response => {
            // Cache a copy of the response
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch(() => {
            // If both cache and network fail, show offline page
            return caches.match('/offline.html');
          });
      })
  );
}

// Handle static requests - cache first with network fallback
function handleStaticRequest(event) {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(event.request)
          .then(response => {
            // Cache a copy of the response
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch(() => {
            // If it's an HTML request, show offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
            // For other resources, just fail
            return new Response('Network error', { status: 408, headers: { 'Content-Type': 'text/plain' } });
          });
      })
  );
}

// Background sync for pending operations
self.addEventListener('sync', event => {
  if (event.tag === 'sync-articles') {
    event.waitUntil(syncArticles());
  } else if (event.tag === 'sync-highlights') {
    event.waitUntil(syncHighlights());
  } else if (event.tag === 'sync-notes') {
    event.waitUntil(syncNotes());
  }
});

// Sync articles that were saved offline
async function syncArticles() {
  const db = await openIndexedDB();
  const pendingArticles = await db.getAll('pendingArticles');
  
  for (const article of pendingArticles) {
    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(article)
      });
      
      if (response.ok) {
        await db.delete('pendingArticles', article.id);
      }
    } catch (error) {
      console.error('Failed to sync article:', error);
    }
  }
}

// Sync highlights that were created offline
async function syncHighlights() {
  const db = await openIndexedDB();
  const pendingHighlights = await db.getAll('pendingHighlights');
  
  for (const highlight of pendingHighlights) {
    try {
      const response = await fetch('/api/highlights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(highlight)
      });
      
      if (response.ok) {
        await db.delete('pendingHighlights', highlight.id);
      }
    } catch (error) {
      console.error('Failed to sync highlight:', error);
    }
  }
}

// Sync notes that were created offline
async function syncNotes() {
  const db = await openIndexedDB();
  const pendingNotes = await db.getAll('pendingNotes');
  
  for (const note of pendingNotes) {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(note)
      });
      
      if (response.ok) {
        await db.delete('pendingNotes', note.id);
      }
    } catch (error) {
      console.error('Failed to sync note:', error);
    }
  }
}

// Helper function to open IndexedDB
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ReadLtrOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      resolve({
        getAll: (storeName) => {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
          });
        },
        delete: (storeName, id) => {
          return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(id);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve();
          });
        }
      });
    };
    
    // Create object stores if they don't exist
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pendingArticles')) {
        db.createObjectStore('pendingArticles', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pendingHighlights')) {
        db.createObjectStore('pendingHighlights', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('pendingNotes')) {
        db.createObjectStore('pendingNotes', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('cachedArticles')) {
        db.createObjectStore('cachedArticles', { keyPath: 'id' });
      }
    };
  });
}

// Push notification event
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/assets/images/icon-192x192.png',
    badge: '/assets/images/badge-72x72.png',
    data: {
      url: data.url
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
