/**
 * Cloud Sync Layer for Serenity / Intern Haven.
 * Enables backing up and syncing all local app state, rotation reviews,
 * and yearly metrics to cloud persistence (e.g. Firebase Firestore / Cloud DB).
 */

import { AppState, getState, setState } from "./store";

export interface SyncConfig {
  apiKey?: string;
  projectId?: string;
  userId?: string;
  enabled: boolean;
  lastSyncedAt?: string;
}

const SYNC_CONFIG_KEY = "serenity.sync.config.v1";

export function getSyncConfig(): SyncConfig {
  try {
    const raw = localStorage.getItem(SYNC_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { enabled: false };
}

export function saveSyncConfig(cfg: Partial<SyncConfig>) {
  const current = getSyncConfig();
  const updated = { ...current, ...cfg };
  localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Export full state as a backup JSON file that users can download.
 */
export function exportStateAsJSON(app: AppState): string {
  return JSON.stringify(
    {
      appVersion: "1.0.0",
      exportedAt: new Date().toISOString(),
      data: app,
    },
    null,
    2
  );
}

/**
 * Import a previously backed-up state JSON.
 */
export function importStateFromJSON(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    const data = parsed.data || parsed;
    if (data && typeof data === "object" && data.startDate) {
      setState(data);
      return true;
    }
  } catch (err) {
    console.error("Failed to import state JSON:", err);
  }
  return false;
}
