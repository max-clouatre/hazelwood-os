// Remembers the last crash so a grown-up can read it in the Grown-up area (and tell Claude).
const KEY = "hwos:lasterror";
export function logError(msg: string, stack?: string) {
  try { localStorage.setItem(KEY, JSON.stringify({ at: new Date().toISOString(), msg: msg.slice(0, 300), stack: (stack ?? "").slice(0, 600), ua: navigator.userAgent.slice(0, 160) })); } catch { /* ignore */ }
}
export function lastError(): { at: string; msg: string; stack: string; ua: string } | null {
  try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
export const clearError = () => { try { localStorage.removeItem(KEY); } catch { /* ignore */ } };
export function installGlobalErrorLogging() {
  window.addEventListener("error", (e) => logError(e.message || "error", e.error?.stack));
  window.addEventListener("unhandledrejection", (e) => logError(String((e.reason && e.reason.message) || e.reason || "promise rejected"), e.reason?.stack));
}
