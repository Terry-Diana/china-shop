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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);