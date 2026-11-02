// Small safety shims so the app still runs on older Android Chrome versions (the Galaxy Tab A).
// Imported first in main.tsx.
if (!Array.prototype.at) {
  Object.defineProperty(Array.prototype, "at", {
    value: function at<T>(this: T[], n: number): T | undefined { n = Math.trunc(n) || 0; if (n < 0) n += this.length; return this[n]; },
    writable: true, configurable: true,
  });
}
if (!String.prototype.replaceAll) {
  Object.defineProperty(String.prototype, "replaceAll", {
    value: function replaceAll(this: string, a: string | RegExp, b: string): string {
      return typeof a === "string" ? this.split(a).join(b) : this.replace(new RegExp(a.source, a.flags.includes("g") ? a.flags : a.flags + "g"), b);
    },
    writable: true, configurable: true,
  });
}
if (!Object.hasOwn) {
  Object.defineProperty(Object, "hasOwn", { value: (o: object, k: PropertyKey) => Object.prototype.hasOwnProperty.call(o, k), writable: true, configurable: true });
}
export {};
