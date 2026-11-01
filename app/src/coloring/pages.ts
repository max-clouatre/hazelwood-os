// Original line art, drawn with code. Every page is a 400x300 SVG; each "region" is a shape
// a child can fill with a tap. "lines" are decorative strokes (whiskers, smiles, ...).

export interface Region { id: string; d: string; t?: string }
export interface Line { d: string; w?: number }
export interface Page { id: string; title: string; emoji: string; regions: Region[]; lines: Line[] }

// ---- shape helpers (all return SVG path data) ----
const f = (n: number) => +n.toFixed(1);
const circ = (cx: number, cy: number, r: number) => ell(cx, cy, r, r);
const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M${f(cx - rx)} ${f(cy)}a${rx} ${ry} 0 1 1 ${2 * rx} 0a${rx} ${ry} 0 1 1 ${-2 * rx} 0Z`; // clockwise, like rr(), so unions fill instead of cancelling;
const poly = (pts: [number, number][]) => `M${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join("L")}Z`;
const rr = (x: number, y: number, w: number, h: number, r = 0) =>
  `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z`;
const star = (cx: number, cy: number, R: number, r: number, n = 5) =>
  poly(Array.from({ length: n * 2 }, (_, i) => {
    const a = (Math.PI * i) / n - Math.PI / 2;
    const rad = i % 2 ? r : R;
    return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad] as [number, number];
  }));
const rot = (a: number, cx: number, cy: number) => `rotate(${a} ${cx} ${cy})`;
const MIRROR = "translate(400 0) scale(-1 1)";
const cloud = (cx: number, cy: number, k = 1) =>
  [circ(cx - 22 * k, cy, 18 * k), circ(cx, cy - 12 * k, 25 * k), circ(cx + 26 * k, cy - 2 * k, 19 * k), rr(cx - 40 * k, cy - 2 * k, 85 * k, 20 * k, 10 * k)].join("");
const arch = (cx: number, base: number, ro: number, ri: number) =>
  `M${cx - ro} ${base}A${ro} ${ro} 0 0 1 ${cx + ro} ${base}H${cx + ri}A${ri} ${ri} 0 0 0 ${cx - ri} ${base}Z`;
const withMirror = (r: Region): Region[] => [r, { id: r.id + "-r", d: r.d, t: MIRROR }];

const rainbow: Page = {
  id: "rainbow", title: "Rainbow", emoji: "🌈",
  regions: [
    ...[170, 145, 120, 95, 70].map((ro, i) => ({ id: `band${i}`, d: arch(200, 250, ro, ro - 25) })),
    { id: "cloud-l", d: cloud(62, 246, 1) },
    { id: "cloud-r", d: cloud(338, 246, 1) },
    { id: "sun", d: circ(345, 55, 28) },
    { id: "cloud-top", d: cloud(70, 60, 0.7) },
  ],
  lines: [
    ...Array.from({ length: 8 }, (_, i) => {
      const a = (Math.PI * 2 * i) / 8;
      return { d: `M${f(345 + Math.cos(a) * 36)} ${f(55 + Math.sin(a) * 36)}L${f(345 + Math.cos(a) * 50)} ${f(55 + Math.sin(a) * 50)}`, w: 5 };
    }),
  ],
};

const cat: Page = {
  id: "cat", title: "Kitty", emoji: "🐱",
  regions: [
    { id: "ear-l", d: poly([[105, 115], [122, 22], [190, 85]]) },
    { id: "ear-r", d: poly([[295, 115], [278, 22], [210, 85]]) },
    { id: "head", d: ell(200, 165, 105, 85) },
    { id: "inner-l", d: poly([[125, 95], [132, 52], [168, 84]]) },
    { id: "inner-r", d: poly([[275, 95], [268, 52], [232, 84]]) },
    { id: "eye-l", d: ell(158, 148, 17, 21) },
    { id: "eye-r", d: ell(242, 148, 17, 21) },
    { id: "cheek-l", d: circ(128, 190, 15) },
    { id: "cheek-r", d: circ(272, 190, 15) },
    { id: "nose", d: poly([[186, 176], [214, 176], [200, 194]]) },
    { id: "bow-l", d: poly([[200, 258], [148, 236], [148, 280]]) },
    { id: "bow-r", d: poly([[200, 258], [252, 236], [252, 280]]) },
    { id: "knot", d: circ(200, 258, 11) },
  ],
  lines: [
    { d: "M200 194V206" }, { d: "M200 206Q186 222 170 209" }, { d: "M200 206Q214 222 230 209" },
    { d: "M105 182L52 170" }, { d: "M105 195L48 200" }, { d: "M295 182L348 170" }, { d: "M295 195L352 200" },
    { d: "M162 150V152", w: 9 }, { d: "M246 150V152", w: 9 },
  ],
};

const unicorn: Page = {
  id: "unicorn", title: "Unicorn", emoji: "🦄",
  regions: [
    { id: "mane-l", d: ell(124, 182, 36, 98), t: rot(-7, 124, 182) },
    { id: "mane-r", d: ell(276, 182, 36, 98), t: rot(7, 276, 182) },
    { id: "ear-l", d: poly([[148, 100], [128, 48], [182, 82]]) },
    { id: "ear-r", d: poly([[252, 100], [272, 48], [218, 82]]) },
    { id: "head", d: ell(200, 178, 80, 98) },
    { id: "horn-tip", d: poly([[200, 6], [194, 30], [206, 30]]) },
    { id: "horn-mid", d: poly([[194, 30], [206, 30], [212, 54], [188, 54]]) },
    { id: "horn-base", d: poly([[188, 54], [212, 54], [219, 82], [181, 82]]) },
    { id: "fore-1", d: circ(166, 98, 27) },
    { id: "fore-2", d: circ(201, 88, 29) },
    { id: "fore-3", d: circ(236, 100, 26) },
    { id: "eye-l", d: ell(166, 172, 14, 18) },
    { id: "eye-r", d: ell(234, 172, 14, 18) },
    { id: "cheek-l", d: circ(143, 212, 14) },
    { id: "cheek-r", d: circ(257, 212, 14) },
    { id: "snout", d: ell(200, 238, 44, 32) },
    { id: "star", d: star(335, 50, 22, 9) },
    { id: "star2", d: star(62, 52, 17, 7) },
  ],
  lines: [
    { d: "M184 254Q200 266 216 254" }, { d: "M168 174V176", w: 8 }, { d: "M236 174V176", w: 8 },
    { d: "M186 236V238", w: 9 }, { d: "M214 236V238", w: 9 },
  ],
};

const puppy: Page = {
  id: "puppy", title: "Puppy", emoji: "🐶",
  regions: [
    { id: "ear-l", d: ell(104, 152, 38, 78), t: rot(20, 104, 152) },
    { id: "ear-r", d: ell(296, 152, 38, 78), t: rot(-20, 296, 152) },
    { id: "head", d: ell(200, 165, 96, 86) },
    { id: "patch", d: circ(238, 138, 32) },
    { id: "eye-l", d: circ(164, 138, 15) },
    { id: "eye-r", d: circ(238, 138, 15) },
    { id: "snout", d: ell(200, 207, 52, 40) },
    { id: "tongue", d: rr(186, 226, 28, 40, 12) },
    { id: "nose", d: ell(200, 184, 22, 15) },
    { id: "collar", d: rr(126, 252, 148, 24, 10) },
    { id: "tag", d: circ(200, 286, 11) },
  ],
  lines: [
    { d: "M200 199V226" }, { d: "M200 226Q176 238 166 222" }, { d: "M200 226Q224 238 234 222" },
    { d: "M164 140V142", w: 9 }, { d: "M238 140V142", w: 9 },
    { d: "M150 112Q164 102 178 112" }, { d: "M222 112Q238 102 252 112" },
  ],
};

const butterfly: Page = {
  id: "butterfly", title: "Butterfly", emoji: "🦋",
  regions: [
    ...withMirror({ id: "wing-up", d: "M200 140C150 30 40 30 52 108C58 150 130 160 200 150Z" }),
    ...withMirror({ id: "wing-low", d: "M200 152C140 160 74 176 92 234C108 272 172 250 200 192Z" }),
    ...withMirror({ id: "spot-up", d: circ(112, 92, 17) }),
    ...withMirror({ id: "spot-low", d: circ(126, 216, 12) }),
    { id: "body", d: ell(200, 172, 11, 62) },
    { id: "head", d: circ(200, 104, 13) },
  ],
  lines: [{ d: "M195 94Q180 58 160 44", w: 4 }, { d: "M205 94Q220 58 240 44", w: 4 }],
};

const flower = (cx: number, cy: number, n: number, dist: number, pr: number, id: string): Region[] => [
  ...Array.from({ length: n }, (_, i) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { id: `${id}-p${i}`, d: circ(cx + Math.cos(a) * dist, cy + Math.sin(a) * dist, pr) };
  }),
  { id: `${id}-c`, d: circ(cx, cy, pr * 0.85) },
];
const flowers: Page = {
  id: "flowers", title: "Flowers", emoji: "🌸",
  regions: [
    { id: "ground", d: rr(-4, 262, 408, 42, 0) },
    { id: "stem1", d: rr(103, 128, 14, 140, 4) },
    { id: "stem2", d: rr(283, 150, 14, 118, 4) },
    { id: "leaf1", d: ell(142, 218, 30, 12), t: rot(-28, 142, 218) },
    { id: "leaf2", d: ell(80, 200, 28, 11), t: rot(28, 80, 200) },
    { id: "leaf3", d: ell(252, 222, 26, 10), t: rot(28, 252, 222) },
    ...flower(110, 90, 6, 36, 24, "f1"),
    ...flower(290, 112, 5, 32, 22, "f2"),
    { id: "sun", d: circ(350, 36, 22) },
  ],
  lines: [],
};

const castle: Page = {
  id: "castle", title: "Castle", emoji: "🏰",
  regions: [
    { id: "ground", d: rr(-4, 262, 408, 42, 0) },
    { id: "wall", d: rr(110, 132, 180, 132, 0) },
    { id: "tower-l", d: rr(60, 104, 62, 160, 0) },
    { id: "tower-r", d: rr(278, 104, 62, 160, 0) },
    { id: "tower-c", d: rr(165, 74, 70, 70, 0) },
    { id: "roof-l", d: poly([[50, 104], [91, 40], [132, 104]]) },
    { id: "roof-r", d: poly([[268, 104], [309, 40], [350, 104]]) },
    { id: "roof-c", d: poly([[156, 74], [200, 14], [244, 74]]) },
    { id: "door", d: `M168 264V218A32 32 0 0 1 232 218V264Z` },
    { id: "win-l", d: rr(80, 134, 22, 34, 11) },
    { id: "win-r", d: rr(298, 134, 22, 34, 11) },
    { id: "win-c", d: circ(200, 108, 15) },
    { id: "flag", d: poly([[200, 14], [228, 22], [200, 30]]) },
  ],
  lines: [{ d: "M200 14V-4", w: 4 }],
};

const rocket: Page = {
  id: "rocket", title: "Rocket", emoji: "🚀",
  regions: [
    { id: "fin-l", d: poly([[152, 150], [104, 220], [152, 204]]) },
    { id: "fin-r", d: poly([[248, 150], [296, 220], [248, 204]]) },
    { id: "flame", d: "M174 210Q200 296 226 210Z" },
    { id: "nozzle", d: rr(168, 190, 64, 22, 5) },
    { id: "body", d: "M200 14C252 56 258 130 250 192H150C142 130 148 56 200 14Z" },
    { id: "window", d: circ(200, 100, 26) },
    { id: "planet", d: circ(322, 74, 32) },
    { id: "moon", d: circ(66, 66, 28) },
    { id: "crater1", d: circ(56, 56, 7) },
    { id: "crater2", d: circ(78, 76, 5) },
    { id: "star1", d: star(40, 170, 15, 6) },
    { id: "star2", d: star(356, 176, 13, 5) },
    { id: "star3", d: star(96, 262, 13, 5) },
    { id: "star4", d: star(330, 262, 16, 6) },
  ],
  lines: [{ d: `M${f(322 - 56)} ${f(74 + 14)}Q322 ${74 + 38} ${f(322 + 56)} ${f(74 - 12)}`, w: 5 }],
};

export const PAGES: Page[] = [rainbow, cat, unicorn, puppy, butterfly, flowers, castle, rocket];
// Easier pages (big simple shapes) first for Violet; Hazel starts with the detailed ones.
export const PAGE_ORDER: Record<"hazel" | "violet", string[]> = {
  violet: ["rainbow", "cat", "puppy", "butterfly", "unicorn", "flowers", "castle", "rocket"],
  hazel: ["unicorn", "castle", "butterfly", "cat", "puppy", "flowers", "rocket", "rainbow"],
};

export const PALETTE: { name: string; hex: string }[] = [
  { name: "red", hex: "#ef4444" }, { name: "orange", hex: "#fb923c" }, { name: "yellow", hex: "#facc15" },
  { name: "green", hex: "#22c55e" }, { name: "light blue", hex: "#7dd3fc" }, { name: "blue", hex: "#3b82f6" },
  { name: "purple", hex: "#a855f7" }, { name: "pink", hex: "#f472b6" }, { name: "brown", hex: "#92400e" },
  { name: "gray", hex: "#9ca3af" }, { name: "black", hex: "#1f2937" }, { name: "white", hex: "#ffffff" },
];
