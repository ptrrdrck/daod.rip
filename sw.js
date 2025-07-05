/* © 2021 Peter Rodrick <pete@lftlc.xyz> - Service Worker for Performance Optimization */

const CACHE_NAME = 'dao-drip-v1';
const STATIC_CACHE_NAME = 'dao-drip-static-v1';
const DYNAMIC_CACHE_NAME = 'dao-drip-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style-optimized.css',
  '/util.js',
  '/script-optimized.js',
  '/dao-optimized.js',
  '/about.html'
];

// Assets to cache dynamically
const DYNAMIC_ASSETS = [
  '/img/'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static assets', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external URLs
  if (url.origin !== location.origin) {
    return;
  }
  
  event.respondWith(
    handleRequest(request)
  );
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Strategy 1: Cache First for static assets
    if (isStaticAsset(url.pathname)) {
      return await cacheFirst(request);
    }
    
    // Strategy 2: Network First for dynamic content
    if (isDynamicAsset(url.pathname)) {
      return await networkFirst(request);
    }
    
    // Strategy 3: Stale While Revalidate for HTML pages
    if (isHTMLPage(url.pathname)) {
      return await staleWhileRevalidate(request);
    }
    
    // Default: Network First
    return await networkFirst(request);
    
  } catch (error) {
    console.error('Service Worker: Error handling request', error);
    
    // Fallback for HTML pages
    if (isHTMLPage(url.pathname)) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      return await cache.match('/index.html') || new Response('Page not available offline');
    }
    
    return new Response('Resource not available', { status: 404 });
  }
}

// Cache First strategy - good for static assets
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  const networkResponse = await fetch(request);
  
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
  }
  
  return networkResponse;
}

// Network First strategy - good for dynamic content
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(DYNAMIC_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Stale While Revalidate strategy - good for HTML pages
async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Network failed, return cached version if available
      return cachedResponse;
    });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network
  return await fetchPromise;
}

// Utility functions
function isStaticAsset(pathname) {
  return pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/);
}

function isDynamicAsset(pathname) {
  return pathname.startsWith('/api/') || pathname.startsWith('/data/');
}

function isHTMLPage(pathname) {
  return pathname === '/' || pathname.endsWith('.html') || !pathname.includes('.');
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'chapter-read') {
    event.waitUntil(syncChapterRead());
  }
});

async function syncChapterRead() {
  // This would sync read chapter data when back online
  console.log('Service Worker: Syncing chapter read data');
  
  try {
    // Get pending sync data from IndexedDB or localStorage
    const pendingSyncs = JSON.parse(localStorage.getItem('pendingSyncs') || '[]');
    
    for (const sync of pendingSyncs) {
      // Send to server when back online
      await fetch('/api/sync-chapter-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sync)
      });
    }
    
    // Clear pending syncs
    localStorage.removeItem('pendingSyncs');
    
  } catch (error) {
    console.error('Service Worker: Error syncing chapter data', error);
  }
}

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'New content available',
      icon: '/img/icon-192x192.png',
      badge: '/img/badge-72x72.png',
      tag: data.tag || 'dao-drip-notification',
      renotify: true,
      actions: [
        {
          action: 'view',
          title: 'View Now',
          icon: '/img/view-icon.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss',
          icon: '/img/dismiss-icon.png'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Dao Drip', options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from main app
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Periodic background sync (experimental)
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync', event.tag);
  
  if (event.tag === 'update-check') {
    event.waitUntil(checkForUpdates());
  }
});

async function checkForUpdates() {
  // Check for app updates periodically
  console.log('Service Worker: Checking for updates');
  
  try {
    const response = await fetch('/api/version');
    const data = await response.json();
    
    if (data.version !== CACHE_NAME) {
      // New version available, notify the app
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATE_AVAILABLE',
          version: data.version
        });
      });
    }
  } catch (error) {
    console.error('Service Worker: Error checking for updates', error);
  }
}