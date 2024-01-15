let cacheName = 'aniList-v2';
let cacheErr = 'aniListErr-v2';

var filesToCache = [
  '/',
  '/index.html',
  '/js/main.js',
  '/css/style.css',
  '/images/check.svg'
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(cacheName).then(function (cache) {
      return cache.addAll(filesToCache);
    })
  );
});

addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;     // if valid response is found in cache return it
        } else {
          return fetch(event.request)     //fetch from internet
            .then(function (res) {
              return caches.open(cacheName)
                .then(function (cache) {
                  cache.put(event.request.url, res.clone());    //save the response for future
                  return res;   // return the fetched data
                })
            })
            .catch(function (err) {       // fallback mechanism
              return caches.open(cacheErr)
                .then(function (cache) {
                  return cache.match('/offline.html');
                });
            });
        }
      })
  );
});

/* Serve cached content when offline */
// self.addEventListener('fetch', function (e) {
//   e.respondWith(
//     caches.match(e.request).then(function (response) {
//       return response || fetch(e.request);
//     })
//   );
// });
