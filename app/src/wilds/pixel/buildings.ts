// Pixel art shapes for Village buildings (boxes, built around the plot centre, y up from the ground). Another art style would
// supply its own shapes for the same building ids; the rules live in ../village.ts and do not care how it is drawn.
import type { Box } from "./island";

const B = (x: number, y: number, z: number, sx: number, sy: number, sz: number, c: string): Box => ({ x, y, z, sx, sy, sz, c });
const PAD = "#e8cf9a";

/** The flat tan pad every plot sits on (also shown empty, so you can see where to build). */
export const pad = (): Box[] => [B(0, 0.05, 0, 1.7, 0.1, 1.7, PAD), B(0, 0.1, 0, 1.5, 0.04, 1.5, "#f1dcae")];

export function shapeOf(kind: string, level: number): Box[] {
  const out: Box[] = pad(); const L = Math.max(1, Math.min(3, level));
  switch (kind) {
    case "glowwell": {
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; out.push(B(Math.cos(a) * 0.55, 0.28, Math.sin(a) * 0.55, 0.3, 0.36, 0.3, i % 2 ? "#c9c4dc" : "#b3add0")); }
      out.push(B(0, 0.3, 0, 0.62, 0.26, 0.62, "#ffe27a")); out.push(B(0, 0.42, 0, 0.3, 0.1, 0.3, "#fff6c4"));
      if (L >= 2) { out.push(B(-0.62, 0.95, 0, 0.12, 1.3, 0.12, "#a8693a"), B(0.62, 0.95, 0, 0.12, 1.3, 0.12, "#a8693a"), B(0, 1.65, 0, 1.5, 0.14, 0.34, "#e5534b")); }
      if (L >= 3) { out.push(B(0, 1.95, 0, 0.5, 0.3, 0.3, "#ffd23f"), B(0, 2.2, 0, 0.2, 0.2, 0.2, "#fff6c4")); }
      break;
    }
    case "berrypatch": {
      const n = L === 1 ? 2 : L === 2 ? 3 : 3, cols = [-0.5, 0, 0.5].slice(0, n);
      out.push(B(0, 0.16, 0, 1.4, 0.12, 1.4, "#8a5a36"));
      cols.forEach((x, i) => (L === 1 ? [-0.3, 0.3] : [-0.5, 0, 0.5]).forEach((z, j) => {
        out.push(B(x, 0.42, z, 0.4, 0.4, 0.4, (i + j) % 2 ? "#3dbb55" : "#4fcf63"));
        out.push(B(x + 0.12, 0.66, z + 0.1, 0.12, 0.12, 0.12, "#e5334b"), B(x - 0.1, 0.5, z - 0.14, 0.1, 0.1, 0.1, "#ff6b8a"));
      }));
      if (L >= 3) out.push(B(0, 0.95, -0.78, 1.5, 0.1, 0.1, "#a8693a"), B(-0.72, 0.55, -0.78, 0.1, 0.9, 0.1, "#a8693a"), B(0.72, 0.55, -0.78, 0.1, 0.9, 0.1, "#a8693a"));
      break;
    }
    case "lumberhut": {
      const s = 1 + (L - 1) * 0.12;
      out.push(B(0, 0.5, 0, 1.0 * s, 0.8, 0.9 * s, "#b87a45"), B(0, 0.5, 0.46 * s, 0.34, 0.5, 0.06, "#4a3426"));
      out.push(B(0, 1.05, 0, 1.2 * s, 0.22, 1.1 * s, "#d0553f"), B(0, 1.25, 0, 0.8 * s, 0.2, 0.8 * s, "#c0432f"), B(0, 1.42, 0, 0.4 * s, 0.16, 0.5 * s, "#a8341f"));
      for (let i = 0; i < 2 + L; i++) out.push(B(0.78 * s, 0.14 + (i % 2) * 0.2, -0.3 + (i >> 1) * 0.25 + (i % 2) * 0.12, 0.24, 0.2, 0.7, i % 2 ? "#c8905a" : "#b87a45"));
      if (L >= 2) out.push(B(-0.3, 1.5, -0.2, 0.22, 0.5, 0.22, "#9a9ab0"));
      if (L >= 3) out.push(B(0, 1.9, 0, 0.06, 0.6, 0.06, "#7a4e2d"), B(0.2, 2.05, 0, 0.34, 0.2, 0.04, "#ffd23f"));
      break;
    }
    case "workshop": {
      out.push(B(0, 0.45, 0, 1.3, 0.7, 1.1, "#e3dff2"), B(0, 0.45, 0.56, 0.36, 0.5, 0.06, "#6b5a8a"), B(-0.4, 0.5, 0.56, 0.24, 0.24, 0.06, "#8fd0f0"));
      out.push(B(0, 0.95, 0, 1.5, 0.22, 1.3, "#e5534b"), B(0, 1.15, 0, 1.0, 0.2, 0.9, "#c93f3a"), B(0.45, 1.35, -0.2, 0.22, 0.5, 0.22, "#8e8aa0"));
      out.push(B(0.2, 1.55, 0.5, 0.34, 0.34, 0.1, "#ffd23f"), B(0.2, 1.55, 0.5, 0.14, 0.14, 0.12, "#8a6a2a"));
      if (L >= 2) out.push(B(-1.0, 0.35, 0, 0.7, 0.5, 0.9, "#cfc9e6"), B(-1.0, 0.7, 0, 0.8, 0.14, 1.0, "#e5534b"));
      if (L >= 3) out.push(B(0, 1.9, 0, 0.06, 0.7, 0.06, "#7a4e2d"), B(0.2, 2.1, 0, 0.36, 0.22, 0.04, "#ffd23f"));
      break;
    }
    case "flowers": {
      const C = ["#f27aa5", "#ffd23f", "#ffffff", "#7ab8ff", "#ff9a3a"];
      for (let i = 0; i < 9; i++) { const x = ((i * 37) % 11) / 11 * 1.2 - 0.6, z = ((i * 53) % 13) / 13 * 1.2 - 0.6; out.push(B(x, 0.28, z, 0.06, 0.34, 0.06, "#3dbb55"), B(x, 0.5, z, 0.22, 0.2, 0.22, C[i % C.length])); }
      break;
    }
    case "lantern": {
      out.push(B(0, 0.6, 0, 0.1, 1.0, 0.1, "#5b4a6a"), B(0, 1.2, 0, 0.36, 0.34, 0.36, "#ffd23f"), B(0, 1.2, 0, 0.2, 0.2, 0.2, "#fff6c4"), B(0, 1.42, 0, 0.44, 0.08, 0.44, "#5b4a6a"));
      break;
    }
  }
  return out;
}
