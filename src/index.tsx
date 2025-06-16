import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Add cache-busting meta tags
const addCacheBustingHeaders = () => {
  // Add cache control meta tags
  const metaTags = [
    { httpEquiv: 'Cache-Control', content: 'no-cache, no-store, must-revalidate' },
    { httpEquiv: 'Pragma', content: 'no-cache' },
    { httpEquiv: 'Expires', content: '0' }
  ];

  metaTags.forEach(tag => {
    const metaTag = document.createElement('meta');
    metaTag.httpEquiv = tag.httpEquiv;
    metaTag.content = tag.content;
    document.head.appendChild(metaTag);
  });
};

// Clear service worker cache on load
const clearServiceWorkerCache = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      // Send message to service worker to clear cache
      registration.active?.postMessage({ type: 'CLEAR_CACHE' });
    });
  }
};

// Initialize app with cache busting
addCacheBustingHeaders();
clearServiceWorkerCache();

// Add a global cache buster to all fetch requests
const originalFetch = window.fetch;
window.fetch = function(input, init) {
  // Add a cache buster to URL requests
  if (typeof input === 'string' && !input.includes('supabase.co')) {
    const separator = input.includes('?') ? '&' : '?';
    input = `${input}${separator}_=${Date.now()}`;
  }
  
  // Add cache control headers to all requests
  if (!init) {
    init = {};
  }
  if (!init.headers) {
    init.headers = {};
  }
  
  // Add the headers to prevent caching
  init.headers = {
    ...init.headers,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  };
  
  return originalFetch.call(this, input, init);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);