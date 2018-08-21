let CACHE_NAME = 'restaurant_v1';
let cachesUrl = [
  'index.html', 'restaurant.html',
  '/js/main.js', '/js/dbhelper.js',
  '/js/restaurant_info.js', '/img',
  '/css/styles.css'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(cachesUrl);
      }).catch(error => {
        console.log('FAILED TO OPEN CACHE', error);
      })
  )
});
