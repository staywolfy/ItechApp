const CACHE_NAME = "itech-cache-v3";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/android/android-launchericon-192-192.png",
  "/icons/android/android-launchericon-512-512.png",
  "/icons/ios/180.png",
  "/screenshots/desktop-wide.png",
  "/screenshots/mobile-narrow.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
