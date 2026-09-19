// Versioned caches - must match src/lib/cache-version.ts
const CACHE_VERSION = "v2.0.0";
const CACHE_NAMES = {
  appShell: `cartilla:shell:${CACHE_VERSION}`,
  assets: `cartilla:assets:${CACHE_VERSION}`,
  audio: `cartilla:audio:${CACHE_VERSION}`,
  book: `cartilla:book:${CACHE_VERSION}`,
};

const PRECACHE_URLS = [
  "/",
  "/offline.html",
  "/cartilla/lecciones",
  "/book/book.pdf",
  "/icons/app-192.png",
  "/icons/app-512.png",
  "/gretel/thinking.webp",
];

// Helper to determine if a cached response has expired (in milliseconds)
function isExpired(response, maxAgeMs) {
  const dateHeader = response.headers.get("date");
  if (!dateHeader) return false;
  const age = Date.now() - new Date(dateHeader).getTime();
  return age > maxAgeMs;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAMES.appShell)
      .then((cache) => {
        return Promise.allSettled(
          PRECACHE_URLS.map((url) =>
            fetch(url, { cache: "reload" })
              .then((res) => {
                if (res.ok) {
                  return cache.put(url, res);
                }
                return null;
              })
              .catch(() => null),
          ),
        );
      })
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const activeCaches = Object.values(CACHE_NAMES);
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (!activeCaches.includes(key)) {
              return caches.delete(key);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Only cache same-origin resources
  if (url.origin !== self.location.origin) return;

  const path = url.pathname;
  const isHtml =
    request.mode === "navigate" ||
    path.endsWith(".html") ||
    (!path.includes(".") && !path.startsWith("/api/"));

  // 1. HTML Strategy: Network-first, fall back to cache, fall back to /offline.html
  if (isHtml) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAMES.appShell).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return caches.match("/offline.html").then((offlineFallback) => {
              if (offlineFallback) return offlineFallback;
              return new Response("Sin conexión", {
                status: 503,
                headers: { "Content-Type": "text/plain; charset=utf-8" },
              });
            });
          });
        }),
    );
    return;
  }

  // 2. Audio Strategy: Cache-first, never expire (audio cache name)
  if (path.startsWith("/audio/")) {
    event.respondWith(
      caches.open(CACHE_NAMES.audio).then((cache) => {
        return cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((fresh) => {
            if (fresh.ok) cache.put(request, fresh.clone());
            return fresh;
          });
        });
      }),
    );
    return;
  }

  // 3. PDF Strategy: Cache-first, never expire (book cache name)
  if (path.startsWith("/book/")) {
    event.respondWith(
      caches.open(CACHE_NAMES.book).then((cache) => {
        return cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((fresh) => {
            if (fresh.ok) cache.put(request, fresh.clone());
            return fresh;
          });
        });
      }),
    );
    return;
  }

  // 4. JS/CSS Strategy: Cache-first, stale-while-revalidate in background
  const isJsCss = path.endsWith(".js") || path.endsWith(".css") || path.includes("/assets/");
  if (isJsCss) {
    event.respondWith(
      caches.open(CACHE_NAMES.assets).then((cache) => {
        return cache.match(request).then((cached) => {
          const fetchPromise = fetch(request)
            .then((fresh) => {
              if (fresh.ok) cache.put(request, fresh.clone());
              return fresh;
            })
            .catch(() => null);

          if (cached) {
            event.waitUntil(fetchPromise);
            return cached;
          }
          return fetchPromise;
        });
      }),
    );
    return;
  }

  // 5. Images Strategy: Cache-first, expire after 30 days
  const isImage = /\.(png|jpg|jpeg|webp|avif|gif|svg|ico)$/i.test(path);
  if (isImage) {
    event.respondWith(
      caches.open(CACHE_NAMES.assets).then((cache) => {
        return cache.match(request).then((cached) => {
          const maxAgeMs = 30 * 24 * 60 * 60 * 1000; // 30 days
          if (cached && !isExpired(cached, maxAgeMs)) {
            return cached;
          }
          return fetch(request)
            .then((fresh) => {
              if (fresh.ok) cache.put(request, fresh.clone());
              return fresh;
            })
            .catch(() => cached);
        });
      }),
    );
    return;
  }

  // 6. Generic stale-while-revalidate fallback
  event.respondWith(
    caches.open(CACHE_NAMES.assets).then((cache) => {
      return cache.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((fresh) => {
            if (fresh.ok) cache.put(request, fresh.clone());
            return fresh;
          })
          .catch(() => null);

        if (cached) {
          event.waitUntil(fetchPromise);
          return cached;
        }
        return fetchPromise;
      });
    }),
  );
});
