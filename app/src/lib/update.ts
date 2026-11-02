import { useSyncExternalStore } from "react";

declare const __BUILD__: string;
/** Which build of the app this page is running (changes on every release). */
export const BUILD = typeof __BUILD__ !== "undefined" ? __BUILD__ : "dev";

let available = false;
let remoteBuild: string | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Ask the server which build is newest. null means we couldn't reach it (offline). */
export async function fetchRemoteBuild(): Promise<string | null> {
  try {
    const r = await fetch(`version.json?t=${Date.now()}`, { cache: "no-store" });
    if (!r.ok) return null;
    const j = await r.json();
    return typeof j.build === "string" ? j.build : null;
  } catch { return null; }
}

/** Quiet background check: just remembers whether a newer version exists (shows a dot on the gear). */
export async function checkQuietly() {
  const r = await fetchRemoteBuild();
  if (r === null) return;
  remoteBuild = r; available = r !== BUILD; emit();
}

export const useUpdateInfo = () => useSyncExternalStore(
  (cb) => { listeners.add(cb); return () => { listeners.delete(cb); }; },
  () => (available ? "yes" : "no"),
) === "yes";
export const latestKnown = () => remoteBuild;

export type UpdateResult = "current" | "offline" | "updating";

/** Look for a newer version; if there is one, install it and restart the app. */
export async function updateNow(): Promise<UpdateResult> {
  const remote = await fetchRemoteBuild();
  if (remote === null) return "offline";
  remoteBuild = remote;
  if (remote === BUILD) { available = false; emit(); return "current"; }
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) {
      await reg.update().catch(() => undefined);
      // the new worker takes over by itself; give it a moment, then restart
      await new Promise<void>((res) => {
        const t = setTimeout(res, 4000);
        navigator.serviceWorker.addEventListener("controllerchange", () => { clearTimeout(t); setTimeout(res, 300); }, { once: true });
      });
    }
  } catch { /* fall through to reload */ }
  location.reload();
  return "updating";
}

/** Last resort: forget every cached app file and download everything fresh. Saved progress is kept. */
export async function refreshAppFiles() {
  try {
    const regs = (await navigator.serviceWorker?.getRegistrations()) ?? [];
    await Promise.all(regs.map((r) => r.unregister()));
    if ("caches" in window) { const keys = await caches.keys(); await Promise.all(keys.map((k) => caches.delete(k))); }
  } catch { /* ignore */ }
  location.replace(location.pathname + "?fresh=" + Date.now());
}
