/* GymWrld push messaging service worker (separate from app-shell SW). */
/* eslint-disable */
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCqdCOHFP6jUA9d_7sCy5-n26Muuoob1YI",
  authDomain: "gymwrld-app21.firebaseapp.com",
  projectId: "gymwrld-app21",
  storageBucket: "gymwrld-app21.firebasestorage.app",
  messagingSenderId: "1022295832270",
  appId: "1:1022295832270:web:89304e9125b6324d54429f",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "GymWrld";
  const options = {
    body: payload.notification?.body || "",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((list) => {
      const url = event.notification.data?.url || "/";
      for (const c of list) {
        if ("focus" in c) return c.navigate(url).then(() => c.focus());
      }
      return clients.openWindow(url);
    }),
  );
});