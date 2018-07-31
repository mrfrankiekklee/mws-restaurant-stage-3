var cacheName = 'v1';
var cacheFiles = [
    './',
    './index.html',
    './restaurant.html',
    './js/restaurant_info.js',
    './js/main.js',
    './js/dbhelper.js',
    './js/app.js',
    './dist/css/style.css'
    , 'https://maps.googleapis.com/maps/api/js?libraries=places&callback=initMap'
]




self.addEventListener('install', function (e) {
    console.log("[ServiceWorker] Installed")

    e.waitUntil(
        caches.open(cacheName).then(function (cache) {

            console.log("[ServiceWorker] Caching cacheFiles");
            return Promise.all(cacheFiles)

        }))
})

self.addEventListener('activate', function (e) {
    console.log("[ServiceWorker] Activated")

    e.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(cacheNames.map(function (thisCacheName) {
                if (thisCacheName !== cacheName) {
                    console.log("[ServiceWorker] Removing Cached Files from", thisCacheName);
                    return caches.delete(thisCacheName);
                }
            }))
        }))
})


self.addEventListener('fetch', function (e) {
    console.log("[ServiceWorker] Fetching", e.request.url);


    var url = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBdJV2tuoBNRzvmw4s9Xr9yogc0QbDktm0&libraries=places&callback=initMap'

    e.respondWith(

        caches.match(e.request).then(function (response) {
            if (response) {
                console.log("[ServiceWorker] Found in cache", e.request.url);
                return response;
            }
            if (e.request.cache === 'only-if-cached' && e.request.mode !== 'same-origin') {
                return;
            }
            return fetch(e.request);

        }));
});
