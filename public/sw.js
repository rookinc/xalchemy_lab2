const CACHE_NAME = "lab2-public-v1";

const ASSETS = [
  "/",
  "/assets/app.css",
  "/assets/app.js",
  "/assets/favicon.ico"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((res) => res || fetch(event.request))
  );
});
