const DEFAULT_NOTIFICATION = {
  title: "FitLog",
  body: "기록할 시간이 되었어요.",
  url: "/notifications",
};

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

function readPushPayload(event) {
  if (!event.data) {
    return DEFAULT_NOTIFICATION;
  }

  try {
    return {
      ...DEFAULT_NOTIFICATION,
      ...event.data.json(),
    };
  } catch {
    const text = event.data.text();

    return {
      ...DEFAULT_NOTIFICATION,
      body: text || DEFAULT_NOTIFICATION.body,
    };
  }
}

self.addEventListener("push", (event) => {
  const payload = readPushPayload(event);

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/custom/bell.svg",
      badge: "/icons/custom/bell.svg",
      data: {
        url: payload.url || DEFAULT_NOTIFICATION.url,
      },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || DEFAULT_NOTIFICATION.url,
    self.location.origin,
  ).href;

  event.waitUntil(
    self.clients
      .matchAll({
        includeUncontrolled: true,
        type: "window",
      })
      .then((clientList) => {
        const existingClient = clientList.find((client) => {
          return new URL(client.url).origin === self.location.origin;
        });

        if (existingClient) {
          existingClient.focus();
          return existingClient.navigate(targetUrl);
        }

        return self.clients.openWindow(targetUrl);
      }),
  );
});
