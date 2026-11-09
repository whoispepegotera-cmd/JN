const CACHE='gloamgear-browser-20261109-v1';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['./','./manifest.webmanifest'])));self.skipWaiting();});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('gloamgear-browser-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;
 const path=new URL(event.request.url).pathname;
 if(!path.startsWith(new URL(self.registration.scope).pathname)&&!path.includes('/assets/'))return;
 event.respondWith(fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>caches.match(event.request).then(hit=>hit||new Response('Sin conexión. Vuelve a abrir Gloamgear cuando haya red.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}}))));
});