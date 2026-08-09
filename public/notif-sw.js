// Service worker for Serenity reminders.
// Its only job is to show notifications with snooze actions and to hand the
// snooze choice back to the app (or reschedule itself when no tab is open).

self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("message", (event) => {
  const msg = event.data || {};
  if (msg.type !== "show") return;
  const { title, body, tag, snoozable } = msg;
  self.registration.showNotification(title, {
    body,
    tag,
    data: { tag, title, body, snoozable },
    actions: snoozable
      ? [
          { action: "snooze-30", title: "Snooze 30 min" },
          { action: "snooze-60", title: "Snooze 1 hour" },
        ]
      : [],
  });
});

self.addEventListener("notificationclick", (event) => {
  const data = event.notification.data || {};
  const action = event.notification.actions ? event.action : "";
  event.notification.close();

  if (action === "snooze-30" || action === "snooze-60") {
    const minutes = action === "snooze-30" ? 30 : 60;
    event.waitUntil(
      (async () => {
        const clients = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
        if (clients.length) {
          clients.forEach((c) => c.postMessage({ type: "snooze", tag: data.tag, minutes, title: data.title, body: data.body }));
          return;
        }
        // No tab open: re-show from the worker after the delay.
        await new Promise((r) => setTimeout(r, minutes * 60_000));
        await self.registration.showNotification(data.title || "A gentle nudge", {
          body: data.body || "",
          tag: data.tag,
          data,
        });
      })(),
    );
    return;
  }

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
      if (clients.length) {
        clients[0].focus();
        clients[0].postMessage({ type: "opened", tag: data.tag });
      } else {
        await self.clients.openWindow("/");
      }
    })(),
  );
});
