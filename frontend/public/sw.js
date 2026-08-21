// public/sw.js
// PWA 설치 요건(fetch 핸들러를 가진 서비스워커)을 채우기 위한 최소 워커.
// 캐싱은 하지 않고 요청을 그대로 네트워크로 흘려보낸다.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
self.addEventListener('fetch', () => {})
