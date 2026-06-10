import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyCqdCOHFP6jUA9d_7sCy5-n26Muuoob1YI",
  authDomain: "gymwrld-app21.firebaseapp.com",
  projectId: "gymwrld-app21",
  storageBucket: "gymwrld-app21.firebasestorage.app",
  messagingSenderId: "1022295832270",
  appId: "1:1022295832270:web:89304e9125b6324d54429f",
  measurementId: "G-WG7Z2DTNRS",
};

const VAPID_KEY =
  "BH4H1wTqxSjsevGayekbC3VisdOOuzWySx4OnubeU0ey3MW_VvUcerpKsgxRmlHT2DDXbA3G9yYQwZDch5ukL_I";

export function getFirebaseApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

/** Ask the user to allow notifications and return the FCM token. */
export async function enablePushNotifications(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    throw new Error("Twoja przeglądarka nie obsługuje powiadomień.");
  }
  const supported = await isSupported().catch(() => false);
  if (!supported) throw new Error("Powiadomienia nie są wspierane tutaj.");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Brak zgody na powiadomienia.");
  }

  const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  await navigator.serviceWorker.ready;

  const app = getFirebaseApp();
  const messaging = getMessaging(app);
  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: reg,
  });

  if (token) {
    localStorage.setItem("gw_push_token", token);
    localStorage.setItem("gw_push_enabled", "1");
    onMessage(messaging, (payload) => {
      // Foreground — show a toast-like in-page notification via Notification API
      try {
        new Notification(payload.notification?.title || "GymWrld", {
          body: payload.notification?.body || "",
          icon: "/icon-192.png",
        });
      } catch {}
    });
  }
  return token ?? null;
}

export function isPushEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem("gw_push_enabled") === "1" &&
    typeof Notification !== "undefined" &&
    Notification.permission === "granted"
  );
}