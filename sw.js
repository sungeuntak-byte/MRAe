/* MRAe 서비스 워커 — 버전을 올리면 앱이 새 파일로 갱신됩니다 */
const VER = 'mrae-v2';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VER).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VER).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    // 내 앱 파일: 네트워크 우선(최신 반영), 실패하면 저장본
    e.respondWith(fetch(req,{cache:'no-store'}).then(r => { const cp = r.clone(); caches.open(VER).then(c => c.put(req, cp)); return r; })
      .catch(() => caches.match(req).then(m => m || caches.match('./index.html'))));
  } else {
    // 글꼴·글자인식 엔진 등 외부 파일: 한 번 받으면 저장해 두고 이후엔 오프라인에서도 사용
    e.respondWith(caches.match(req).then(m => m || fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) { const cp = r.clone(); caches.open(VER).then(c => c.put(req, cp)); } return r; })));
  }
});
