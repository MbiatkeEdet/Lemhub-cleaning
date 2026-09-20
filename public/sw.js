self.addEventListener("push", (event) => {
  if (!event.data) return;

  const payload = event.data.json();

  event.waitUntil(
    self.registration.showNotification(payload.title || "TidyNow", {
      body: payload.body,
      icon: "/favicon.svg",
      requireInteraction: Boolean(payload.requireInteraction),
      tag: payload.tag,
      data: payload.data || {},
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes("/cleaner"));
      if (existing) return existing.focus();
      return self.clients.openWindow("/cleaner");
    })
  );
});
