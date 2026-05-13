export type PushPermissionStatus =
  | "unsupported"
  | "default"
  | "granted"
  | "denied"
  | "subscribed"
  | "error";

export type VapidPublicKeyResponse = {
  publicKey?: string;
  vapidPublicKey?: string;
};

export type PushSubscriptionKeys = {
  p256dh: string;
  auth: string;
};

export type PushSubscriptionPayload = {
  endpoint: string;
  keys: PushSubscriptionKeys;
  userAgent: string;
};
