import type { PushSubscriptionPayload } from "./types";

const SERVICE_WORKER_PATH = "/service-worker.js";

export function isPushNotificationSupported() {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isPushNotificationSupported()) {
    return "unsupported";
  }

  return Notification.permission;
}

export async function requestNotificationPermission() {
  if (!isPushNotificationSupported()) {
    return "unsupported" as const;
  }

  return Notification.requestPermission();
}

export async function registerPushServiceWorker() {
  if (!isPushNotificationSupported()) {
    throw new Error("This browser does not support push notifications.");
  }

  return navigator.serviceWorker.register(SERVICE_WORKER_PATH);
}

export async function getExistingPushSubscription(
  registration?: ServiceWorkerRegistration,
) {
  if (!isPushNotificationSupported()) {
    return null;
  }

  const activeRegistration =
    registration ?? (await navigator.serviceWorker.getRegistration());

  return activeRegistration?.pushManager.getSubscription() ?? null;
}

export async function subscribeBrowserPush(publicKey: string) {
  const registration = await registerPushServiceWorker();
  const existingSubscription = await getExistingPushSubscription(registration);

  if (existingSubscription) {
    return existingSubscription;
  }

  return registration.pushManager.subscribe({
    applicationServerKey: convertVapidKeyToUint8Array(publicKey),
    userVisibleOnly: true,
  });
}

export async function unsubscribeBrowserPush() {
  const subscription = await getExistingPushSubscription();

  if (!subscription) {
    return null;
  }

  const payload = serializePushSubscription(subscription);
  await subscription.unsubscribe();

  return payload;
}

export function serializePushSubscription(
  subscription: PushSubscription,
): PushSubscriptionPayload {
  const json = subscription.toJSON();

  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) {
    throw new Error("Push subscription is missing required keys.");
  }

  return {
    endpoint: json.endpoint,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
    userAgent: navigator.userAgent,
  };
}

function convertVapidKeyToUint8Array(publicKey: string) {
  const padding = "=".repeat((4 - (publicKey.length % 4)) % 4);
  const base64 = `${publicKey}${padding}`
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}
