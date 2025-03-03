if (!self.define) {
  let e,
    s = {};
  const t = (t, a) => (
    (t = new URL(t + ".js", a).href),
    s[t] ||
      new Promise((s) => {
        if ("document" in self) {
          const e = document.createElement("script");
          (e.src = t), (e.onload = s), document.head.appendChild(e);
        } else (e = t), importScripts(t), s();
      }).then(() => {
        let e = s[t];
        if (!e) throw new Error(`Module ${t} didn’t register its module`);
        return e;
      })
  );
  self.define = (a, c) => {
    const n =
      e ||
      ("document" in self ? document.currentScript.src : "") ||
      location.href;
    if (s[n]) return;
    let i = {};
    const r = (e) => t(e, n),
      d = { module: { uri: n }, exports: i, require: r };
    s[n] = Promise.all(a.map((e) => d[e] || r(e))).then((e) => (c(...e), i));
  };
}
define(["./workbox-4754cb34"], function (e) {
  "use strict";
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: "/_next/app-build-manifest.json",
          revision: "788f91a59cd39ca07d1dce83d5be1133",
        },
        {
          url: "/_next/static/chunks/1183.aecd3c90e74b398d.js",
          revision: "aecd3c90e74b398d",
        },
        {
          url: "/_next/static/chunks/1284.382e67721f8ffdc1.js",
          revision: "382e67721f8ffdc1",
        },
        {
          url: "/_next/static/chunks/1601.e5a786733ccbac6a.js",
          revision: "e5a786733ccbac6a",
        },
        {
          url: "/_next/static/chunks/2395.0480db531bd4c0b3.js",
          revision: "0480db531bd4c0b3",
        },
        {
          url: "/_next/static/chunks/2725.bc43393c185533fd.js",
          revision: "bc43393c185533fd",
        },
        {
          url: "/_next/static/chunks/2783.fa0eb59df36f7318.js",
          revision: "fa0eb59df36f7318",
        },
        {
          url: "/_next/static/chunks/2818.eb5ba8d5d85832be.js",
          revision: "eb5ba8d5d85832be",
        },
        {
          url: "/_next/static/chunks/3124.3a05e264c8c43a95.js",
          revision: "3a05e264c8c43a95",
        },
        {
          url: "/_next/static/chunks/336.a8db631a10cc7fdc.js",
          revision: "a8db631a10cc7fdc",
        },
        {
          url: "/_next/static/chunks/338.d4acbf278a6274cc.js",
          revision: "d4acbf278a6274cc",
        },
        {
          url: "/_next/static/chunks/3397.d691fb96d8e5f1c9.js",
          revision: "d691fb96d8e5f1c9",
        },
        {
          url: "/_next/static/chunks/3788.1063ef58550b6a38.js",
          revision: "1063ef58550b6a38",
        },
        {
          url: "/_next/static/chunks/3991.652a206d89449351.js",
          revision: "652a206d89449351",
        },
        {
          url: "/_next/static/chunks/4255.499482c8cbeefeb2.js",
          revision: "499482c8cbeefeb2",
        },
        {
          url: "/_next/static/chunks/4958.34251f7257783294.js",
          revision: "34251f7257783294",
        },
        {
          url: "/_next/static/chunks/4bd1b696-d487c3af890ba77d.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/4e6af11a-14df3e2d8e987f53.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/5270.75af3aff9eb64d33.js",
          revision: "75af3aff9eb64d33",
        },
        {
          url: "/_next/static/chunks/5295.82ae05b9fece3655.js",
          revision: "82ae05b9fece3655",
        },
        {
          url: "/_next/static/chunks/5341.3321a3016c19704f.js",
          revision: "3321a3016c19704f",
        },
        {
          url: "/_next/static/chunks/5382-af161c394443f870.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/5512.2d17c39ea5dc2d3a.js",
          revision: "2d17c39ea5dc2d3a",
        },
        {
          url: "/_next/static/chunks/5548.d96b88283adc9833.js",
          revision: "d96b88283adc9833",
        },
        {
          url: "/_next/static/chunks/5714-0c00e3e3e73102b1.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/5832.96792f55341ff7d3.js",
          revision: "96792f55341ff7d3",
        },
        {
          url: "/_next/static/chunks/5969-e1ab82b9db67cc5d.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/6024.a5583f285aee6baf.js",
          revision: "a5583f285aee6baf",
        },
        {
          url: "/_next/static/chunks/6094.da9e88ecae9dd340.js",
          revision: "da9e88ecae9dd340",
        },
        {
          url: "/_next/static/chunks/6435.cde4083424ea1318.js",
          revision: "cde4083424ea1318",
        },
        {
          url: "/_next/static/chunks/6587-e08af33d6e807b1e.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/6735.dce668de27a428b7.js",
          revision: "dce668de27a428b7",
        },
        {
          url: "/_next/static/chunks/7091.83459176fd2e13c8.js",
          revision: "83459176fd2e13c8",
        },
        {
          url: "/_next/static/chunks/723.d0ff5a9e809d12e9.js",
          revision: "d0ff5a9e809d12e9",
        },
        {
          url: "/_next/static/chunks/7606.53bf03b97dedd827.js",
          revision: "53bf03b97dedd827",
        },
        {
          url: "/_next/static/chunks/7715.60bf8db4f0ab9f1e.js",
          revision: "60bf8db4f0ab9f1e",
        },
        {
          url: "/_next/static/chunks/7781.092bacf62c6da81f.js",
          revision: "092bacf62c6da81f",
        },
        {
          url: "/_next/static/chunks/7808.c492a484774a7850.js",
          revision: "c492a484774a7850",
        },
        {
          url: "/_next/static/chunks/7944.7c2722b997cf1530.js",
          revision: "7c2722b997cf1530",
        },
        {
          url: "/_next/static/chunks/8308.c914be311b405051.js",
          revision: "c914be311b405051",
        },
        {
          url: "/_next/static/chunks/90542734.decd9e88813f83f5.js",
          revision: "decd9e88813f83f5",
        },
        {
          url: "/_next/static/chunks/918-74edeff57ac930b1.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/9290-7416ec1a90304dc0.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/9468.0787f1cc8c7b7cd0.js",
          revision: "0787f1cc8c7b7cd0",
        },
        {
          url: "/_next/static/chunks/9542-f34598268873171a.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/9578.8af0e9d1716a3969.js",
          revision: "8af0e9d1716a3969",
        },
        {
          url: "/_next/static/chunks/969.d7757b877ed19f0b.js",
          revision: "d7757b877ed19f0b",
        },
        {
          url: "/_next/static/chunks/9725.0fd19893190fadeb.js",
          revision: "0fd19893190fadeb",
        },
        {
          url: "/_next/static/chunks/9761.eda99bc69085522b.js",
          revision: "eda99bc69085522b",
        },
        {
          url: "/_next/static/chunks/app/_not-found/page-04e1aed0f6522dc1.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/app/anonymousReport/page-7cf3a821ae70501f.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/app/api/analyze-links/route-22b129e727ab89db.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/app/dispatch/page-a221d8d5db722524.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/app/layout-8cfdc8456717d3c8.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/app/page-0f39a5303aa43f6f.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/app/sensor/page-d933a1696a15218e.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/app/spam/layout-910e8fd1f75b4e5f.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/app/spam/page-78992e9d8a1f8da4.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/app/supa/page-d4bfc53c5e207111.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/d3ac728e.659df8596d47a6bd.js",
          revision: "659df8596d47a6bd",
        },
        {
          url: "/_next/static/chunks/ebbfb5c1.dc2f878290bf85ac.js",
          revision: "dc2f878290bf85ac",
        },
        {
          url: "/_next/static/chunks/framework-c054b661e612b06c.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/main-7ab9bb26678d987d.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/main-app-5598500e393aa38b.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/pages/_app-4472d05d360df47c.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/pages/_error-8f5c1d50aa91bf6e.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/chunks/polyfills-42372ed130431b0a.js",
          revision: "846118c33b2c0e922d7b3a7676f81f6f",
        },
        {
          url: "/_next/static/chunks/webpack-0ebc0be05e4b702c.js",
          revision: "dtp-0tQL0lNg5PvOeZOul",
        },
        {
          url: "/_next/static/css/39e6fa52283ea388.css",
          revision: "39e6fa52283ea388",
        },
        {
          url: "/_next/static/css/b1b0610db504d8f7.css",
          revision: "b1b0610db504d8f7",
        },
        {
          url: "/_next/static/css/b5b7459797d7c561.css",
          revision: "b5b7459797d7c561",
        },
        {
          url: "/_next/static/css/f2882b7e9e040fad.css",
          revision: "f2882b7e9e040fad",
        },
        {
          url: "/_next/static/dtp-0tQL0lNg5PvOeZOul/_buildManifest.js",
          revision: "4b91ada98411fca284efb6bb58a1ad18",
        },
        {
          url: "/_next/static/dtp-0tQL0lNg5PvOeZOul/_ssgManifest.js",
          revision: "b6652df95db52feb4daf4eca35380933",
        },
        {
          url: "/_next/static/media/569ce4b8f30dc480-s.p.woff2",
          revision: "ef6cefb32024deac234e82f932a95cbd",
        },
        {
          url: "/_next/static/media/56d4c7a1c09c3371-s.woff2",
          revision: "43b1d1276722d640d51608db4600bb69",
        },
        {
          url: "/_next/static/media/7e6a2e30184bb114-s.p.woff2",
          revision: "bca21fe1983e7d9137ef6e68e05f3aee",
        },
        {
          url: "/_next/static/media/ba015fad6dcf6784-s.woff2",
          revision: "8ea4f719af3312a055caf09f34c89a77",
        },
        { url: "/_next/static/media/image.5fd53720.png", revision: "5fd53720" },
        {
          url: "/assets/Call_dispatch.png",
          revision: "3efe8404792dd4e3c208786bde657fae",
        },
        {
          url: "/assets/Heat_map.png",
          revision: "37f7a6da712c54c12adf0e6112640639",
        },
        {
          url: "/assets/Lead_generation.png",
          revision: "e2b82213e77106000cb0ca4d356035ce",
        },
        {
          url: "/assets/Phone.png",
          revision: "557861b80558a7ea036ae2cb395e3fcf",
        },
        {
          url: "/assets/Police.png",
          revision: "97ad2af86f8da0dcd39d7f642cff5f98",
        },
        {
          url: "/assets/Settings.png",
          revision: "c926c2e1136e16a9275188c3a68c72a1",
        },
        {
          url: "/assets/bell.png",
          revision: "1f55598b182e52e1b01c6f2434f879a2",
        },
        {
          url: "/assets/child_safety.svg",
          revision: "39091c87ce9395f7dfbcd3e64e58c19b",
        },
        {
          url: "/assets/gender_detect.svg",
          revision: "ba3e6ada334448896c9ed2d6caeb175b",
        },
        {
          url: "/assets/heatmap.svg",
          revision: "51e8d68f83230526230a45c789568b03",
        },
        {
          url: "/assets/im2.png",
          revision: "afa86a77a6241c02985e7e16785b64db",
        },
        {
          url: "/assets/image.png",
          revision: "055feaee6e43e9c747b383ddc1976ac0",
        },
        {
          url: "/assets/lead_prediction.svg",
          revision: "b627c58a81ba140ebb5aff48c4ed1c82",
        },
        {
          url: "/assets/phone_dark.png",
          revision: "52e4bef15448071d0518834b542e95c2",
        },
        {
          url: "/assets/react.svg",
          revision: "f0402b67b6ce880f65666bb49e841696",
        },
        {
          url: "/assets/report.png",
          revision: "b0a349b327c7b8fe896bd51f62739b92",
        },
        {
          url: "/assets/report.svg",
          revision: "15dcbb2445ab7c590baa078d8ab990e2",
        },
        {
          url: "/assets/scam.svg",
          revision: "b3d80cf01c40e9a9bca8403fb1401713",
        },
        {
          url: "/icons/icon-192x192.png",
          revision: "e0005d13a5295a3af7691411f248427d",
        },
        {
          url: "/icons/icon-512x512.png",
          revision: "e0005d13a5295a3af7691411f248427d",
        },
        { url: "/manifest.json", revision: "db5c0a4c9f2513cf673e9c15f3b8c0f3" },
        {
          url: "/sw-register.js",
          revision: "1b1ba3bfd04fc6337672be3177e866d1",
        },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      "/",
      new e.NetworkFirst({
        cacheName: "start-url",
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: t,
              state: a,
            }) =>
              s && "opaqueredirect" === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: "OK",
                    headers: s.headers,
                  })
                : s,
          },
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
      new e.CacheFirst({
        cacheName: "google-fonts-webfonts",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
      new e.StaleWhileRevalidate({
        cacheName: "google-fonts-stylesheets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-font-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 604800 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-image-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/image\?url=.+$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-image",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp3|wav|ogg)$/i,
      new e.CacheFirst({
        cacheName: "static-audio-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:mp4)$/i,
      new e.CacheFirst({
        cacheName: "static-video-assets",
        plugins: [
          new e.RangeRequestsPlugin(),
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:js)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-js-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:css|less)$/i,
      new e.StaleWhileRevalidate({
        cacheName: "static-style-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\/_next\/data\/.+\/.+\.json$/i,
      new e.StaleWhileRevalidate({
        cacheName: "next-data",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      /\.(?:json|xml|csv)$/i,
      new e.NetworkFirst({
        cacheName: "static-data-assets",
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        const s = e.pathname;
        return !s.startsWith("/api/auth/") && !!s.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "apis",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 16, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => {
        if (!(self.origin === e.origin)) return !1;
        return !e.pathname.startsWith("/api/");
      },
      new e.NetworkFirst({
        cacheName: "others",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
        ],
      }),
      "GET"
    ),
    e.registerRoute(
      ({ url: e }) => !(self.origin === e.origin),
      new e.NetworkFirst({
        cacheName: "cross-origin",
        networkTimeoutSeconds: 10,
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 3600 }),
        ],
      }),
      "GET"
    );
});
