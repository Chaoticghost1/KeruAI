import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const APP_VERSION = '2.0.0';

async function clearAllCachesAndReload() {
  console.log('Clearing all caches for fresh start...');
  
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear service worker caches
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));
  }
  
  // Unregister all service workers
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(reg => reg.unregister()));
  }
  
  // Clear IndexedDB
  const databases = await indexedDB.databases?.() || [];
  for (const db of databases) {
    if (db.name) {
      indexedDB.deleteDatabase(db.name);
    }
  }
  
  // Mark as cleared
  localStorage.setItem('app_version', APP_VERSION);
  
  // Force reload
  window.location.reload();
}

async function initApp() {
  const storedVersion = localStorage.getItem('app_version');
  
  // If version mismatch or no version, clear everything and reload
  if (storedVersion !== APP_VERSION) {
    await clearAllCachesAndReload();
    return; // Will reload, so don't continue
  }
  
  // Register service worker (optional - only if we want offline support)
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
    } catch (error) {
      console.warn('Service worker registration failed:', error);
    }
  }
  
  // Render the app
  createRoot(document.getElementById("root")!).render(<App />);
}

initApp();
