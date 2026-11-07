'use strict';
const CACHE='openline-robot-academy-rc1';
const FILES=['./','index.html','styles.css','engine.js','missions.js','app.js','icon.svg','manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith(caches.open(CACHE).then(async c=>await c.match(e.request)||fetch(e.request)));});
self.addEventListener('message',e=>{if(e.data?.type==='CACHE_READY')e.waitUntil(caches.open(CACHE).then(async c=>{const ready=(await Promise.all(FILES.map(f=>c.match(new URL(f,self.registration.scope).href)))).every(Boolean);e.ports[0]?.postMessage({ready});}));});
