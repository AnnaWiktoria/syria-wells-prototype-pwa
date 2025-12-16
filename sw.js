const CACHE_NAME = "syria-wells-v1";
const urlsToCache = [
	"/", // index.html
	"/index.html",
	"/style.css",
	"/main.js",
	"/manifest.json",
	"/icon-192.png",
	"/icon-512.png",
	"https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
	"https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
];

// Instalacja SW i buforowanie plików
self.addEventListener("install", event => {
	console.log("Service Worker installing...");
	event.waitUntil(
		caches.open(CACHE_NAME).then(cache => {
			console.log("Caching app shell");
			return cache.addAll(urlsToCache);
		})
	);
	self.skipWaiting();
});

// Aktywacja SW
self.addEventListener("activate", event => {
	console.log("Service Worker activated");
	event.waitUntil(
		caches.keys().then(keys => {
			return Promise.all(
				keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
			);
		})
	);
	self.clients.claim();
});

// Obsługa fetch – najpierw z cache, potem z sieci
self.addEventListener("fetch", event => {
	event.respondWith(
		caches
			.match(event.request)
			.then(response => {
				if (response) {
					console.log("Serving from cache:", event.request.url);
					return response;
				}
				return fetch(event.request).then(fetchResponse => {
					return caches.open(CACHE_NAME).then(cache => {
						cache.put(event.request, fetchResponse.clone());
						return fetchResponse;
					});
				});
			})
			.catch(() => {
				// fallback np. offline.html jeśli potrzebne
			})
	);
});
