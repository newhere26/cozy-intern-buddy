// Service worker for WithYou reminders.
// Shows notifications with snooze actions and hands the snooze choice
// back to the app (or reschedules itself when no tab is open).

self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("message", (event) => {
  const msg = event.data || {};
  if (msg.type !== "show") return;
  const { title, body, tag, snoozable, prefs } = msg;
  self.registration.showNotification(title, {
    body,
    tag,
    data: { tag, title, body, snoozable, prefs },
    actions: snoozable
      ? [
          { action: "snooze-30", title: "Snooze 30 min" },
          { action: "snooze-60", title: "Snooze 1 hour" },
        ]
      : [],
  });
});

function toMins(hhmm) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h)) return null;
  return h * 60 + (m || 0);
}

function adjustQuietHours(targetMs, prefs) {
  if (!prefs || !prefs.quietStart || !prefs.quietEnd) return targetMs;
  const start = toMins(prefs.quietStart);
  const end = toMins(prefs.quietEnd);
  if (start == null || end == null || start === end) return targetMs;

  const d = new Date(targetMs);
  const mins = d.getHours() * 60 + d.getMinutes();
  const isQuiet = start < end ? mins >= start && mins < end : mins >= start || mins < end;

  if (!isQuiet) return targetMs;

  const endH = Math.floor(end / 60);
  const endM = end % 60;

  const adjusted = new Date(targetMs);
  if (start > end && mins >= start) {
    adjusted.setDate(adjusted.getDate() + 1);
  }
  adjusted.setHours(endH, endM, 0, 0);
  if (adjusted.getTime() <= targetMs) {
    adjusted.setDate(adjusted.getDate() + 1);
  }
  return adjusted.getTime();
}

function fmtAmPm(ms) {
  const d = new Date(ms);
  let h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, "0");
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

self.addEventListener("notificationclick", (event) => {
  const data = event.notification.data || {};
  const action = event.notification.actions ? event.action : "";
  event.notification.close();

  if (action === "snooze-30" || action === "snooze-60") {
    const minutes = action === "snooze-30" ? 30 : 60;
    const targetMs = Date.now() + minutes * 60_000;
    const finalAt = adjustQuietHours(targetMs, data.prefs);
    const timeStr = fmtAmPm(finalAt);

    event.waitUntil(
      (async () => {
        const clients = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
        if (clients.length) {
          clients.forEach((c) =>
            c.postMessage({
              type: "snooze",
              tag: data.tag,
              minutes,
              title: data.title,
              body: data.body,
              finalAt,
              timeStr,
            }),
          );
          return;
        }

        // No tab open: calculate delay and re-show with next nudge phrasing.
        const delay = Math.max(1000, finalAt - Date.now());
        await new Promise((r) => setTimeout(r, Math.min(delay, 24 * 3600 * 1000)));

        const baseBody = (data.body || "").replace(/\s*\(Next nudge at [^)]+\)/, "");
        const nextBody = `${baseBody} (Next nudge at ${timeStr})`;

        await self.registration.showNotification(data.title || "A gentle nudge", {
          body: nextBody,
          tag: data.tag,
          data: { ...data, body: nextBody },
          actions: data.snoozable
            ? [
                { action: "snooze-30", title: "Snooze 30 min" },
                { action: "snooze-60", title: "Snooze 1 hour" },
              ]
            : [],
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

