// Sprites for Cuddle Run: our procedural SVG creatures, drawn once to small canvases (so the game loop only does cheap drawImage calls).
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Creature } from "../Creature";
import type { Species } from "../species";
import type { Branch } from "../types";

const SIZE = 128;
export class Sprites {
  private map = new Map<string, HTMLCanvasElement | "pending" | "fail">();
  key(sp: string, stage: number, seed: number, branch?: Branch) { return `${sp}|${stage}|${seed}|${branch ?? ""}`; }
  get(sp: Species, stage: number, seed = 7, branch?: Branch): HTMLCanvasElement | null { const v = this.map.get(this.key(sp.id, stage, seed, branch)); return v && v !== "pending" && v !== "fail" ? v : null; }
  load(sp: Species, stage: number, seed = 7, branch?: Branch): Promise<void> {
    const k = this.key(sp.id, stage, seed, branch); if (this.map.has(k)) return Promise.resolve(); this.map.set(k, "pending");
    return new Promise((resolve) => {
      try {
        const svg = renderToStaticMarkup(createElement(Creature, { species: sp, stage: stage as 1 | 2 | 3, seed, branch, className: "" })).replace("<svg ", `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" `);
        const img = new Image();
        img.onload = () => { const c = document.createElement("canvas"); c.width = c.height = SIZE; c.getContext("2d")!.drawImage(img, 0, 0, SIZE, SIZE); this.map.set(k, c); resolve(); };
        img.onerror = () => { this.map.set(k, "fail"); resolve(); };
        img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      } catch { this.map.set(k, "fail"); resolve(); }
    });
  }
}
