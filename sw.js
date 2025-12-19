const CACHE_NAME = "syria-wells-v1";

// 1. W tej liście trzymamy TYLKO pliki lokalne.
// Dzięki temu instalacja PWA nie wywali się przez błędy sieciowe CDN.
const urlsToCache = [
	"./",
	"./index.html",
	"./style.css",
	"./main.js",
	"./manifest.json",
	"./icon-192.png", 
	"./icon-512.png", 
	"./favicon.ico" 
];

self.addEventListener("install", event => {
	console.log("[SW] Installing...");
	event.waitUntil(
		caches.open(CACHE_NAME).then(cache => {
			console.log("[SW] Caching local core files");
			return cache.addAll(urlsToCache);
		})
	);
	self.skipWaiting();
});

self.addEventListener("activate", event => {
	console.log("[SW] Activating...");
	event.waitUntil(
		caches.keys().then(keys => {
			return Promise.all(
				keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
			);
		})
	);
	self.clients.claim();
});

self.addEventListener("fetch", event => {
    // Ignorujemy żądania inne niż http (np. chrome-extension)
    if (!event.request.url.startsWith('http')) return;

	event.respondWith(
		caches.match(event.request).then(response => {
            // Jeśli plik jest w cache (np. Leaflet przy drugim wejściu), zwróć go
			if (response) {
				return response;
			}
            
            // Jeśli nie ma, pobierz z sieci i zapisz w cache na przyszłość
			return fetch(event.request).then(fetchResponse => {
                // Sprawdzamy czy odpowiedź jest poprawna
                if(!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic' && fetchResponse.type !== 'cors') {
                    return fetchResponse;
                }

                // Klonujemy odpowiedź
                const responseToCache = fetchResponse.clone();

				caches.open(CACHE_NAME).then(cache => {
					cache.put(event.request, responseToCache);
				});

				return fetchResponse;
			}).catch(() => {
                // Tu można dodać obsługę offline dla brakujących plików
            });
		})
	);
});


