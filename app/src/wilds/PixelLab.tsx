import { useEffect, useRef, useState } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Creature } from "./Creature";
import { SPECIES, SPECIES_BY_ID } from "./species";

// Experiment: our flat SVG creatures turned into real pixel art (sampled to a 36x36 grid), then built from cubes in a three.js
// scene that is drawn at low resolution and enlarged with hard edges. Not part of the game loop; opened from the Grown-up area.
// three.js is loaded only when this opens, so the game itself does not pay for it.

const GRID = 36;
const PICKS = ["mossling", "bubbo", "embit", "bramblit", "ducky"].filter((id) => SPECIES_BY_ID[id]).concat(SPECIES.slice(5, 9).map((s) => s.id)).filter((v, i, a) => a.indexOf(v) === i).slice(0, 8);
const RES = [{ n: "Chunky", w: 200, h: 112 }, { n: "Classic", w: 280, h: 158 }, { n: "Fine", w: 400, h: 225 }];

/** Draw one creature to a small canvas and return its pixels (RGBA). Nearest-neighbour: no smoothing, so it reads as pixel art. */
function pixels(spId: string, seed: number): Promise<Uint8ClampedArray> {
  return new Promise((resolve, reject) => {
    const sp = SPECIES_BY_ID[spId];
    const svg = renderToStaticMarkup(<Creature species={sp} stage={2} seed={seed} className="" />)
      .replace("<svg ", `<svg xmlns="http://www.w3.org/2000/svg" width="${GRID * 8}" height="${GRID * 8}" `);
    const img = new Image();
    img.onload = () => {
      const big = document.createElement("canvas"); big.width = big.height = GRID * 8;
      big.getContext("2d")!.drawImage(img, 0, 0, GRID * 8, GRID * 8);
      const small = document.createElement("canvas"); small.width = small.height = GRID;
      const c = small.getContext("2d")!; c.imageSmoothingEnabled = false;
      // average each 8x8 block by hand-free downscale, then harden the alpha so edges are crisp
      c.drawImage(big, 0, 0, GRID, GRID);
      const d = c.getImageData(0, 0, GRID, GRID).data;
      for (let i = 3; i < d.length; i += 4) d[i] = d[i] > 110 ? 255 : 0;
      resolve(d);
    };
    img.onerror = () => reject(new Error("could not draw creature"));
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
}

export function PixelLab({ onClose }: { onClose: () => void }) {
  const mount = useRef<HTMLDivElement>(null);
  const [pick, setPick] = useState(PICKS[0]);
  const [res, setRes] = useState(1);
  const [fps, setFps] = useState(0);
  const [err, setErr] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stop = false; let raf = 0; let cleanup = () => {};
    setErr(""); setReady(false);
    (async () => {
      try {
        const THREE = await import("three");
        const ids = [pick, ...PICKS.filter((p) => p !== pick).slice(0, 2)];
        const pix = await Promise.all(ids.map((id, i) => pixels(id, 21 + i * 7)));
        if (stop || !mount.current) return;
        const { w, h } = RES[res];
        const canvas = document.createElement("canvas");
        canvas.style.cssText = "width:100%;height:100%;image-rendering:pixelated;image-rendering:crisp-edges;display:block;object-fit:contain";
        mount.current.innerHTML = ""; mount.current.appendChild(canvas);
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
        renderer.setPixelRatio(1); renderer.setSize(w, h, false); renderer.setClearColor(0x8fd0f0);
        const scene = new THREE.Scene();
        const cam = new THREE.PerspectiveCamera(38, w / h, 0.1, 100);
        scene.add(new THREE.AmbientLight(0xffffff, 0.75));
        const sun = new THREE.DirectionalLight(0xfff4d6, 1.1); sun.position.set(4, 8, 6); scene.add(sun);

        const box = new THREE.BoxGeometry(1, 1, 1);
        const tmp = new THREE.Object3D(), col = new THREE.Color();
        const group = new THREE.Group(); scene.add(group);
        const flat = (m: THREE.InstancedMesh) => { m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; group.add(m); return m; };

        // ground: a patch of two-tone grass cubes
        const N = 13; const ground = new THREE.InstancedMesh(box, new THREE.MeshLambertMaterial(), N * N);
        for (let x = 0; x < N; x++) for (let z = 0; z < N; z++) {
          tmp.position.set(x - N / 2, -0.5, z - N / 2); tmp.scale.set(1, 1, 1); tmp.updateMatrix(); ground.setMatrixAt(x * N + z, tmp.matrix);
          ground.setColorAt(x * N + z, col.set((x + z) % 2 ? "#6fcf62" : "#62c258"));
        }
        flat(ground);
        // a few trees (trunk + leaf cubes)
        const trees: [number, number][] = [[-5, -5], [5, -5], [5.5, 2], [-5.5, 2]];
        const leaf = new THREE.InstancedMesh(box, new THREE.MeshLambertMaterial(), trees.length * 5), trunk = new THREE.InstancedMesh(box, new THREE.MeshLambertMaterial(), trees.length * 2);
        trees.forEach(([x, z], i) => {
          for (let k = 0; k < 2; k++) { tmp.position.set(x, 0.5 + k, z); tmp.scale.set(0.6, 1, 0.6); tmp.updateMatrix(); trunk.setMatrixAt(i * 2 + k, tmp.matrix); trunk.setColorAt(i * 2 + k, col.set("#8a5a3a")); }
          const L: [number, number, number][] = [[0, 2.5, 0], [1, 2.2, 0], [-1, 2.2, 0], [0, 2.2, 1], [0, 2.2, -1]];
          L.forEach(([dx, dy, dz], k) => { tmp.position.set(x + dx, dy, z + dz); tmp.scale.set(1.05, 1.05, 1.05); tmp.updateMatrix(); leaf.setMatrixAt(i * 5 + k, tmp.matrix); leaf.setColorAt(i * 5 + k, col.set(k ? "#2f9e55" : "#37b062")); });
        });
        flat(trunk); flat(leaf);

        // creatures: one cube per opaque pixel, 5 cubes deep (a pixel sprite with some thickness)
        const U = 0.11; const bobs: THREE.Group[] = [];
        pix.forEach((d, ci) => {
          let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++;
          const DEPTH = 5; const m = new THREE.InstancedMesh(box, new THREE.MeshLambertMaterial(), n * DEPTH); let k = 0;
          for (let y = 0; y < GRID; y++) for (let x = 0; x < GRID; x++) {
            const o = (y * GRID + x) * 4; if (!d[o + 3]) continue;
            col.setRGB(d[o] / 255, d[o + 1] / 255, d[o + 2] / 255, THREE.SRGBColorSpace);
            for (let z = 0; z < DEPTH; z++) { tmp.position.set((x - GRID / 2) * U, (GRID - y) * U, (z - 2) * U); tmp.scale.set(U, U, U); tmp.updateMatrix(); m.setMatrixAt(k, tmp.matrix); m.setColorAt(k, col); k++; }
          }
          m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true;
          const g = new THREE.Group(); g.add(m);
          const a = (ci / pix.length) * Math.PI * 2; g.position.set(Math.cos(a) * (ci ? 3.8 : 0), 0, Math.sin(a) * (ci ? 1.6 : 0)); g.userData.base = a;
          scene.add(g); bobs.push(g);
        });

        let frames = 0, t0 = performance.now(); setReady(true);
        const loop = (t: number) => {
          if (stop) return;
          const s = t / 1000;
          const ang = Math.sin(s * 0.3) * 0.95; cam.position.set(Math.sin(ang) * 9, 4.4 + Math.sin(s * 0.2) * 0.8, Math.cos(ang) * 9); cam.lookAt(0, 1.6, 0);
          bobs.forEach((g, i) => { g.position.y = Math.abs(Math.sin(s * 2.2 + i)) * 0.18; g.rotation.y = Math.sin(s * 0.7 + i) * 0.15; });
          renderer.render(scene, cam);
          frames++; if (t - t0 > 1000) { setFps(Math.round((frames * 1000) / (t - t0))); frames = 0; t0 = t; }
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        cleanup = () => { cancelAnimationFrame(raf); renderer.dispose(); box.dispose(); };
      } catch (e) { if (!stop) setErr(e instanceof Error ? e.message : String(e)); }
    })();
    return () => { stop = true; cancelAnimationFrame(raf); cleanup(); };
  }, [pick, res]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col gap-2 bg-night p-3 text-white" data-testid="pixel-lab">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xl font-bold">🧊 Pixel Lab <span className="text-sm font-normal text-white/70">experiment, not in the game</span></p>
        <span className="rounded-full bg-black/40 px-3 py-1 text-lg font-bold" data-testid="pixel-fps">{fps} fps</span>
        <button onClick={onClose} className="rounded-xl bg-white px-4 py-2 text-lg font-bold text-black active:scale-95">Close</button>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl border-[3px] border-ink bg-[#8fd0f0]">
        <div ref={mount} className="h-full w-full" />
        {!ready && !err && <p className="absolute inset-0 flex items-center justify-center text-lg">Building pixels…</p>}
        {err && <p className="absolute inset-0 flex items-center justify-center p-4 text-center text-lg">This device could not run the 3D lab ({err}). Nothing is wrong with the game.</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {PICKS.map((id) => <button key={id} onClick={() => setPick(id)} aria-pressed={pick === id} className={`rounded-xl px-3 py-1 text-base font-bold active:scale-95 ${pick === id ? "bg-mustard text-black" : "bg-white/20"}`}>{SPECIES_BY_ID[id].names[0]}</button>)}
        <span className="mx-1 text-white/50">|</span>
        {RES.map((r, i) => <button key={r.n} onClick={() => setRes(i)} aria-pressed={res === i} className={`rounded-xl px-3 py-1 text-base font-bold active:scale-95 ${res === i ? "bg-emerald-400 text-black" : "bg-white/20"}`}>{r.n}</button>)}
      </div>
    </div>
  );
}
