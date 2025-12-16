const CACHE_NAME = "syria-wells-v1";
const urlsToCache = [
	"./",                // ZMIANA: kropka na początku
	"./index.html",      // ZMIANA: kropka na początku
	"./style.css",       // ZMIANA: kropka na początku
	"./main.js",         // ZMIANA: kropka na początku
	"./manifest.json",   // ZMIANA: kropka na początku
    // UPEWNIJ SIĘ, ŻE TE PLIKI FIZYCZNIE ISTNIEJĄ W FOLDERZE:
	"./icon-192.png",    
	"./icon-512.png",
    // Linki zewnętrzne zostawiamy bez zmian:
	"https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
	"https://unpkg.com/leaflet@1.9.4/dist/leaflet.js",
];

// Instalacja SW i buforowanie plików
self.addEventListener("install", event => {
	console.log("Service Worker installing...");
	event.waitUntil(
		caches.open(CACHE_NAME).then(cache => {
			console.log("Caching app shell");
            // To jest moment krytyczny. Jeśli brakuje pliku, tutaj padnie błąd.
			return cache.addAll(urlsToCache);
		})
	);
	self.skipWaiting();
});

// Aktywacja SW (czyszczenie starego cache)
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
    // Ignorujemy żądania inne niż http/https (np. chrome-extension)
    if (!event.request.url.startsWith('http')) return;

	event.respondWith(
		caches.match(event.request).then(response => {
            // 1. Jeśli jest w cache, zwróć z cache
			if (response) {
				return response;
			}
            
            // 2. Jeśli nie ma, pobierz z sieci
			return fetch(event.request).then(fetchResponse => {
                // Sprawdzamy czy odpowiedź jest poprawna
                if(!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                    return fetchResponse;
                }

                // Klonujemy odpowiedź, bo strumień można zużyć tylko raz
                const responseToCache = fetchResponse.clone();

				caches.open(CACHE_NAME).then(cache => {
					cache.put(event.request, responseToCache);
				});

				return fetchResponse;
			});
		})
	);
});
