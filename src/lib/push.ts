import "server-only";

import webpush, { type PushSubscription as WebPushSubscription } from "web-push";

export function getWebPushPublicKey() {
  return process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY || "";
}

export function isWebPushConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY &&
      process.env.WEB_PUSH_PRIVATE_KEY &&
      process.env.WEB_PUSH_SUBJECT,
  );
}

export function configureWebPush() {
  if (!isWebPushConfigured()) {
    return false;
  }

  webpush.setVapidDetails(
    process.env.WEB_PUSH_SUBJECT!,
    process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY!,
    process.env.WEB_PUSH_PRIVATE_KEY!,
  );
  return true;
}

export async function sendWebPushNotification(subscription: WebPushSubscription, payload: unknown) {
  if (!configureWebPush()) {
    return false;
  }

  await webpush.sendNotification(subscription, JSON.stringify(payload));
  return true;
}
