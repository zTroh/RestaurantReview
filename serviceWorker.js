let CACHE_NAME = 'restaurant_v1';
// let cachesUrl = [
//   'index.html', 'restaurant.html',
//   '/js/main.js', '/js/dbhelper.js',
//   '/js/restaurant_info.js', '/img',
//   '/css/styles.css'
// ];

self.addEventListener('install', e => {
  // e.waitUntil(
  //   caches.open(CACHE_NAME)
  //     .then(cache => {
  //       console.log('Opened cache');
  //       return cache.addAll(cachesUrl);
  //     }).catch(error => {
  //       console.log('FAILED TO OPEN CACHE', error);
  //     })
  // )
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(cacheName => {
        return Promise.all(
          cacheName.map(cache => {
            if(cache !== CACHE_NAME){
              console.log('ServiceWorker cleaning old Cache');
              return caches.delete(cache);
            }
          })
        )
      })
  )
})
// calling the fetch event
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        //clone the respose
        const requestClone = res.clone();
        caches
          .open(CACHE_NAME)
          .then(cache => {
            //add resopnse to cache
            cache.put(e.request, requestClone);
          });
          return res;
      }).catch( error => caches.match(e.request).then(res => res))
  );
});
