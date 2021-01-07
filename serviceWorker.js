// code adapted from https://dev.to/ibrahima92/how-to-build-a-pwa-from-scratch-with-html-css-and-javascript-4bg5
const staticDwindle = "dev-dwindle-site-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/fav.ico",
  "/css/styles.css",
  "/js/code.js",
  "/images/globe.png",
  "/images/menu.png",
  "/images/notes.png",
  "/images/privacy.png",
  "/images/thumb.png",
  "/data/en/contractions.json",
  "/data/en/corporations.json",
  "/data/en/emojis.json",
  "/data/en/numbers.json",
  "/data/en/ordinals.json",
  "/data/en/popular.json",
  "/data/en/sports.json"
];

self.addEventListener("install", function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(staticDwindle).then(function(cache) {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});
