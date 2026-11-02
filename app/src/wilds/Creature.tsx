import type { ReactNode } from "react";
import { useId, useMemo } from "react";
import { darken, lighten, mix, mulberry32, shift } from "./colors";
import { VARIANTS } from "./species";
import type { BodyKind, EarKind, Extra, Personality, Species, TailKind, VariantId } from "./species";

const OUT = "#2d2250";
const SW = 3.2;

interface BodyDef { d: string; ey: number; ex: number; my: number; ear: [number, number]; tail: [number, number]; top: number; cy: number; belly: [number, number, number, number]; mark: [number, number] }
const ellD = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 1 ${2 * rx} 0a${rx} ${ry} 0 1 1 ${-2 * rx} 0Z`;
const BODY: Record<BodyKind, BodyDef> = {
  blob: { d: "M100 52C150 52 168 92 166 126C164 162 134 182 100 182C66 182 36 162 34 126C32 92 50 52 100 52Z", ey: 112, ex: 22, my: 132, ear: [66, 66], tail: [156, 150], top: 52, cy: 120, belly: [100, 152, 44, 28], mark: [100, 84] },
  round: { d: ellD(100, 120, 64, 62), ey: 112, ex: 24, my: 134, ear: [64, 70], tail: [160, 140], top: 58, cy: 120, belly: [100, 152, 42, 26], mark: [100, 82] },
  tall: { d: "M100 40C136 40 152 76 152 118C152 160 134 186 100 186C66 186 48 160 48 118C48 76 64 40 100 40Z", ey: 100, ex: 20, my: 122, ear: [72, 58], tail: [150, 160], top: 40, cy: 118, belly: [100, 154, 36, 30], mark: [100, 72] },
  long: { d: ellD(100, 130, 76, 54), ey: 122, ex: 28, my: 142, ear: [60, 88], tail: [170, 140], top: 76, cy: 130, belly: [100, 160, 54, 22], mark: [100, 102] },
  drop: { d: "M100 36C118 66 158 96 158 136C158 166 134 186 100 186C66 186 42 166 42 136C42 96 82 66 100 36Z", ey: 130, ex: 22, my: 150, ear: [62, 100], tail: [152, 164], top: 36, cy: 130, belly: [100, 162, 38, 24], mark: [100, 100] },
};

interface Pal { main: string; light: string; accent: string; dark: string }

const leafD = (x: number, y: number, len: number, w: number) =>
  `M${x} ${y}C${x - w} ${y - len * 0.3} ${x - w} ${y - len * 0.8} ${x} ${y - len}C${x + w} ${y - len * 0.8} ${x + w} ${y - len * 0.3} ${x} ${y}Z`;
const starD = (cx: number, cy: number, R: number, r: number) =>
  `M${Array.from({ length: 10 }, (_, i) => { const a = (Math.PI * i) / 5 - Math.PI / 2; const rad = i % 2 ? r : R; return `${(cx + Math.cos(a) * rad).toFixed(1)} ${(cy + Math.sin(a) * rad).toFixed(1)}`; }).join("L")}Z`;
const flameD = (x: number, y: number, s: number) =>
  `M${x} ${y}C${x + 8 * s} ${y - 8 * s} ${x + 2 * s} ${y - 26 * s} ${x + 14 * s} ${y - 46 * s}C${x + 20 * s} ${y - 28 * s} ${x + 38 * s} ${y - 26 * s} ${x + 32 * s} ${y - 6 * s}C${x + 30 * s} ${y + 8 * s} ${x + 12 * s} ${y + 12 * s} ${x} ${y}Z`;

const P = { stroke: OUT, strokeWidth: SW, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

function ear(kind: EarKind, ax: number, ay: number, c: Pal): ReactNode {
  switch (kind) {
    case "pointy": return <g><path d={`M${ax - 18} ${ay + 22}L${ax - 6} ${ay - 34}L${ax + 24} ${ay + 18}Z`} fill={c.main} {...P} /><path d={`M${ax - 11} ${ay + 15}L${ax - 5} ${ay - 16}L${ax + 12} ${ay + 12}Z`} fill={c.accent} opacity={0.75} /></g>;
    case "round": return <g><circle cx={ax - 4} cy={ay - 2} r={18} fill={c.main} {...P} /><circle cx={ax - 4} cy={ay - 2} r={9} fill={c.accent} opacity={0.7} /></g>;
    case "long": return <g transform={`rotate(-14 ${ax} ${ay})`}><ellipse cx={ax - 4} cy={ay - 30} rx={13} ry={38} fill={c.main} {...P} /><ellipse cx={ax - 4} cy={ay - 26} rx={6} ry={26} fill={c.accent} opacity={0.6} /></g>;
    case "leaf": return <g transform={`rotate(-20 ${ax} ${ay})`}><path d={leafD(ax, ay + 10, 70, 22)} fill={c.accent} {...P} /><path d={`M${ax} ${ay + 6}L${ax} ${ay - 48}`} stroke={darken(c.accent, 0.15)} strokeWidth={2.4} fill="none" strokeLinecap="round" /></g>;
    case "fin": return <path d={`M${ax + 6} ${ay + 18}Q${ax - 32} ${ay - 4} ${ax - 28} ${ay - 36}Q${ax - 16} ${ay - 26} ${ax - 12} ${ay - 42}Q${ax + 2} ${ay - 26} ${ax + 14} ${ay - 32}Z`} fill={c.accent} {...P} />;
    case "bat": return <g><path d={`M${ax - 24} ${ay + 26}L${ax - 12} ${ay - 56}L${ax + 20} ${ay + 16}Z`} fill={c.main} {...P} /><path d={`M${ax - 16} ${ay + 16}L${ax - 11} ${ay - 32}L${ax + 10} ${ay + 12}Z`} fill={c.accent} opacity={0.6} /></g>;
    case "gills": return (
      <g>
        {[[-20, -8, 24, 8], [5, -6, 22, 7], [28, 26, 20, 7]].map(([rot, dy, rx, ry], i) => (
          <ellipse key={i} cx={ax - 26} cy={ay + 4 + dy + i * 10} rx={rx} ry={ry} transform={`rotate(${rot} ${ax - 26} ${ay + 4 + dy + i * 10})`} fill={c.accent} {...P} />
        ))}
      </g>
    );
    case "floppy": return <ellipse cx={ax - 16} cy={ay + 12} rx={15} ry={30} transform={`rotate(24 ${ax - 16} ${ay + 12})`} fill={c.main} {...P} />;
    default: return null;
  }
}

function tail(kind: TailKind, x: number, y: number, c: Pal): ReactNode {
  switch (kind) {
    case "fluffy": return <g><circle cx={x + 14} cy={y - 8} r={22} fill={c.light} {...P} /><circle cx={x + 8} cy={y - 14} r={9} fill="#fff" opacity={0.5} /></g>;
    case "curl": return <g><path d={`M${x - 8} ${y + 12}C${x + 30} ${y + 18} ${x + 42} ${y - 22} ${x + 16} ${y - 36}`} stroke={OUT} strokeWidth={22} fill="none" strokeLinecap="round" /><path d={`M${x - 8} ${y + 12}C${x + 30} ${y + 18} ${x + 42} ${y - 22} ${x + 16} ${y - 36}`} stroke={c.main} strokeWidth={15} fill="none" strokeLinecap="round" /><circle cx={x + 16} cy={y - 36} r={9} fill={c.accent} {...P} /></g>;
    case "leaf": return <g><path d={`M${x} ${y}C${x + 10} ${y - 32} ${x + 40} ${y - 44} ${x + 54} ${y - 38}C${x + 52} ${y - 8} ${x + 26} ${y + 8} ${x} ${y}Z`} fill={c.accent} {...P} /><path d={`M${x + 4} ${y - 2}L${x + 46} ${y - 34}`} stroke={darken(c.accent, 0.15)} strokeWidth={2.4} fill="none" strokeLinecap="round" /></g>;
    case "flame": return <g><path d={flameD(x, y + 4, 1.1)} fill="#ff8a3d" {...P} /><path d={flameD(x + 6, y + 2, 0.55)} fill="#ffd23f" /></g>;
    case "fin": return <path d={`M${x} ${y}C${x + 20} ${y - 24} ${x + 44} ${y - 26} ${x + 52} ${y - 38}C${x + 56} ${y - 10} ${x + 48} ${y + 8} ${x + 38} ${y + 24}C${x + 24} ${y + 16} ${x + 10} ${y + 14} ${x} ${y}Z`} fill={c.accent} {...P} />;
    case "star": return <g><path d={`M${x - 4} ${y + 4}L${x + 14} ${y - 6}`} stroke={OUT} strokeWidth={9} strokeLinecap="round" /><path d={starD(x + 30, y - 16, 24, 11)} fill="#ffd84a" {...P} /></g>;
    case "bushy": return (
      <g>
        <ellipse cx={x + 20} cy={y - 14} rx={24} ry={36} transform={`rotate(24 ${x + 20} ${y - 14})`} fill={c.main} {...P} />
        <path d={`M${x + 6} ${y - 6}Q${x + 24} ${y + 2} ${x + 40} ${y - 16}`} stroke={darken(c.main, 0.3)} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.55} />
        <ellipse cx={x + 33} cy={y - 42} rx={12} ry={14} transform={`rotate(24 ${x + 33} ${y - 42})`} fill={c.light} {...P} strokeWidth={2.4} />
      </g>
    );
    case "spike": return (
      <g>
        <path d={`M${x - 8} ${y + 14}L${x + 58} ${y + 8}L${x - 6} ${y - 16}Z`} fill={c.main} {...P} />
        <path d={`M${x + 8} ${y - 6}L${x + 14} ${y - 20}L${x + 22} ${y - 6}Z`} fill={c.accent} stroke={OUT} strokeWidth={2} strokeLinejoin="round" />
        <path d={`M${x + 26} ${y - 2}L${x + 32} ${y - 14}L${x + 38} ${y - 2}Z`} fill={c.accent} stroke={OUT} strokeWidth={2} strokeLinejoin="round" />
      </g>
    );
    case "nub": return <circle cx={x + 6} cy={y - 2} r={13} fill={c.light} {...P} />;
    case "plume": return <g><path d={`M${x - 4} ${y}C${x + 30} ${y - 10} ${x + 52} ${y - 42} ${x + 46} ${y - 76}C${x + 30} ${y - 54} ${x + 16} ${y - 34} ${x - 8} ${y - 16}Z`} fill={c.accent} {...P} /><path d={`M${x + 4} ${y - 8}C${x + 26} ${y - 22} ${x + 38} ${y - 44} ${x + 42} ${y - 64}`} stroke="#fff" strokeWidth={2.4} opacity={0.6} fill="none" strokeLinecap="round" /></g>;
    default: return null;
  }
}

function extraBehind(ex: Extra, b: BodyDef, c: Pal, elementColor: string): ReactNode {
  switch (ex) {
    case "aura": return null; // handled separately
    case "sunrays": return (
      <g>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (Math.PI * 2 * i) / 12;
          const x1 = 100 + Math.cos(a - 0.13) * 74, y1 = b.cy + Math.sin(a - 0.13) * 70, x2 = 100 + Math.cos(a + 0.13) * 74, y2 = b.cy + Math.sin(a + 0.13) * 70;
          return <path key={i} d={`M${x1} ${y1}L${100 + Math.cos(a) * 100} ${b.cy + Math.sin(a) * 96}L${x2} ${y2}Z`} fill="#ffd84a" {...P} strokeWidth={2.6} />;
        })}
      </g>
    );
    case "moonstars": return (
      <g>
        <path d="M156 34A24 24 0 1 0 156 82A18 18 0 1 1 156 34Z" fill="#ffe9a8" {...P} />
        {[[34, 46, 11], [22, 104, 8], [176, 118, 9], [44, 170, 7]].map(([x, y, r], i) => <path key={i} d={starD(x, y, r, r * 0.45)} fill="#fff3b0" stroke={OUT} strokeWidth={1.8} className="twinkle" style={{ animationDelay: `${i * 0.4}s` }} />)}
      </g>
    );
    case "wings": return (
      <g>
        {[0, 1].map((s) => (
          <g key={s} transform={s ? "translate(200 0) scale(-1 1)" : undefined}>
            <ellipse cx={36} cy={b.cy - 6} rx={40} ry={20} transform={`rotate(-38 36 ${b.cy - 6})`} fill={c.light} {...P} />
            <ellipse cx={30} cy={b.cy + 16} rx={30} ry={14} transform={`rotate(-14 30 ${b.cy + 16})`} fill={c.light} {...P} />
            <path d={`M22 ${b.cy - 14}L52 ${b.cy - 2}`} stroke={c.accent} strokeWidth={3} strokeLinecap="round" opacity={0.7} />
          </g>
        ))}
      </g>
    );
    case "moths": return (
      <g>
        {[0, 1].map((s) => (
          <g key={s} transform={s ? "translate(200 0) scale(-1 1)" : undefined}>
            <ellipse cx={32} cy={b.cy - 18} rx={42} ry={30} transform={`rotate(-30 32 ${b.cy - 18})`} fill={c.light} {...P} />
            <ellipse cx={38} cy={b.cy + 20} rx={26} ry={20} transform={`rotate(24 38 ${b.cy + 20})`} fill={c.light} {...P} />
            <circle cx={30} cy={b.cy - 20} r={8} fill={c.accent} opacity={0.6} />
            <circle cx={40} cy={b.cy + 22} r={5} fill={c.accent} opacity={0.6} />
          </g>
        ))}
      </g>
    );
    case "shell": return (
      <g>
        <ellipse cx={100} cy={b.cy - 4} rx={88} ry={72} fill={darken(c.accent, 0.12)} {...P} />
        <path d={`M100 ${b.cy - 76}V${b.cy - 34}M52 ${b.cy - 46}L82 ${b.cy - 28}M148 ${b.cy - 46}L118 ${b.cy - 28}`} stroke={OUT} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.45} />
      </g>
    );
    case "bumps": return (
      <g>
        {[-26, 26].map((dx) => <circle key={dx} cx={100 + dx} cy={b.top + 8} r={24} fill={c.main} {...P} />)}
      </g>
    );
    case "mane": return (
      <g>
        {Array.from({ length: 11 }, (_, i) => {
          const a = (Math.PI * 2 * i) / 11;
          return <circle key={i} cx={100 + Math.cos(a) * 56} cy={b.cy + Math.sin(a) * 52} r={22} fill={c.accent} {...P} />;
        })}
      </g>
    );
    case "antlers": return (
      <g stroke={OUT} strokeWidth={SW + 5} strokeLinecap="round" fill="none">
        {[0, 1].map((s) => (
          <g key={s} transform={s ? "translate(200 0) scale(-1 1)" : undefined}>
            <path d={`M84 ${b.top + 14}L70 ${b.top - 20}M76 ${b.top - 4}L58 ${b.top - 12}M72 ${b.top - 14}L80 ${b.top - 38}`} />
            <path d={`M84 ${b.top + 14}L70 ${b.top - 20}M76 ${b.top - 4}L58 ${b.top - 12}M72 ${b.top - 14}L80 ${b.top - 38}`} stroke="#b9845a" strokeWidth={5} />
          </g>
        ))}
      </g>
    );
    default: void elementColor; return null;
  }
}

function extraFront(ex: Extra, b: BodyDef, c: Pal): ReactNode {
  const t = b.top;
  switch (ex) {
    case "spikes": return (
      <g>
        {[64, 82, 100, 118, 136].map((x, i) => { const base = t + 16 + Math.abs(x - 100) * 0.38; const h = [12, 20, 26, 20, 12][i]; return <path key={x} d={`M${x - 9} ${base}L${x} ${base - h}L${x + 9} ${base}Z`} fill={c.accent} {...P} strokeWidth={2.6} />; })}
      </g>
    );
    case "tusk": return (
      <g transform={`rotate(-12 100 ${t + 22})`}>
        <path d={`M94 ${t + 24}L100 ${t - 66}L108 ${t + 24}Z`} fill="#fff4dc" {...P} />
        <path d={`M96 ${t + 4}L106 ${t - 2}M97 ${t - 14}L105 ${t - 20}M98 ${t - 30}L104 ${t - 34}`} stroke={OUT} strokeWidth={2} strokeLinecap="round" opacity={0.55} />
      </g>
    );
    case "ossicones": return (
      <g>
        {[-1, 1].map((sd) => (
          <g key={sd}>
            <path d={`M${100 + sd * 14} ${t + 10}L${100 + sd * 22} ${t - 20}`} stroke={OUT} strokeWidth={9} strokeLinecap="round" />
            <path d={`M${100 + sd * 14} ${t + 10}L${100 + sd * 22} ${t - 20}`} stroke={c.main} strokeWidth={4.6} strokeLinecap="round" />
            <circle cx={100 + sd * 22} cy={t - 22} r={7} fill={c.accent} {...P} strokeWidth={2.4} />
          </g>
        ))}
      </g>
    );
    case "horn": return (
      <g>
        <path d={`M90 ${t + 12}L100 ${t - 50}L110 ${t + 12}Z`} fill="#ffd84a" {...P} />
        <path d={`M93 ${t - 2}L107 ${t - 8}M95 ${t - 16}L105 ${t - 22}M97 ${t - 30}L103 ${t - 34}`} stroke={OUT} strokeWidth={2.4} strokeLinecap="round" opacity={0.7} />
      </g>
    );
    case "crest": return (
      <g>
        {[-26, 0, 26].map((r, i) => (
          <ellipse key={i} cx={100 + r * 0.7} cy={t - 4 + Math.abs(r) * 0.25} rx={8} ry={i === 1 ? 20 : 15} transform={`rotate(${r} ${100 + r * 0.7} ${t + 8})`} fill={c.accent} {...P} />
        ))}
      </g>
    );
    case "sprout": return (
      <g>
        <path d={`M100 ${t + 8}Q98 ${t - 12} 104 ${t - 22}`} stroke={OUT} strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d={`M100 ${t + 8}Q98 ${t - 12} 104 ${t - 22}`} stroke="#4fc66a" strokeWidth={3.6} fill="none" strokeLinecap="round" />
        <ellipse cx={90} cy={t - 22} rx={14} ry={7} transform={`rotate(-28 90 ${t - 22})`} fill="#5fd47a" {...P} />
        <ellipse cx={118} cy={t - 26} rx={14} ry={7} transform={`rotate(28 118 ${t - 26})`} fill="#5fd47a" {...P} />
      </g>
    );
    case "flametuft": return <g transform={`translate(-16 ${t - 40})`}><path d={flameD(100, 40, 1.2)} fill="#ff8a3d" {...P} /><path d={flameD(104, 38, 0.6)} fill="#ffd23f" /></g>;
    case "antenna": return (
      <g>
        <path d={`M112 ${t + 10}Q124 ${t - 10} 126 ${t - 26}`} stroke={OUT} strokeWidth={3.6} fill="none" strokeLinecap="round" />
        <circle cx={126} cy={t - 30} r={9} fill={c.accent} {...P} />
        <circle cx={123} cy={t - 33} r={3} fill="#fff" opacity={0.9} />
      </g>
    );
    case "crown": return (
      <g>
        <path d={`M82 ${t + 6}L84 ${t - 16}L92 ${t - 4}L100 ${t - 20}L108 ${t - 4}L116 ${t - 16}L118 ${t + 6}Z`} fill="#ffd84a" {...P} />
        <circle cx={100} cy={t - 4} r={3.4} fill="#ef4444" />
      </g>
    );
    case "blossom": return (
      <g transform={`translate(0 ${t - 4})`}>
        {Array.from({ length: 5 }, (_, i) => { const a = (Math.PI * 2 * i) / 5; return <circle key={i} cx={126 + Math.cos(a) * 9} cy={6 + Math.sin(a) * 9} r={7} fill="#ff9ec7" {...P} strokeWidth={2.4} />; })}
        <circle cx={126} cy={6} r={5} fill="#ffd84a" stroke={OUT} strokeWidth={2} />
      </g>
    );
    case "halo": return <g fill="none"><ellipse cx={100} cy={t - 16} rx={30} ry={8} stroke={OUT} strokeWidth={10} /><ellipse cx={100} cy={t - 16} rx={30} ry={8} stroke="#ffd84a" strokeWidth={5} /></g>;
    default: return null;
  }
}

function elementMark(el: string, x: number, y: number, c: Pal): ReactNode {
  const f = c.accent === "#ffd84a" ? "#ffd84a" : lighten(c.accent, 0.12);
  switch (el) {
    case "leaf": return <path d={leafD(x, y + 9, 18, 7)} fill={f} stroke={OUT} strokeWidth={1.8} />;
    case "water": return <path d={`M${x} ${y - 9}C${x + 9} ${y + 1} ${x + 8} ${y + 9} ${x} ${y + 9}C${x - 8} ${y + 9} ${x - 9} ${y + 1} ${x} ${y - 9}Z`} fill="#5ec4f2" stroke={OUT} strokeWidth={1.8} />;
    case "fire": return <path d={flameD(x - 6, y + 9, 0.38)} fill="#ff8a3d" stroke={OUT} strokeWidth={1.8} />;
    case "sun": return <g><circle cx={x} cy={y} r={6} fill="#ffd84a" stroke={OUT} strokeWidth={1.8} />{Array.from({ length: 8 }, (_, i) => { const a = (Math.PI * i) / 4; return <path key={i} d={`M${x + Math.cos(a) * 9} ${y + Math.sin(a) * 9}L${x + Math.cos(a) * 12.5} ${y + Math.sin(a) * 12.5}`} stroke={OUT} strokeWidth={1.8} strokeLinecap="round" />; })}</g>;
    case "moon": return <path d={`M${x + 4} ${y - 9}A9 9 0 1 0 ${x + 4} ${y + 9}A7 7 0 1 1 ${x + 4} ${y - 9}Z`} fill="#ffe9a8" stroke={OUT} strokeWidth={1.8} />;
    default: return <path d={starD(x, y, 10, 4.6)} fill="#ffd84a" stroke={OUT} strokeWidth={1.8} />;
  }
}

function eyes(p: Personality, b: BodyDef, stage: number, mood: string, c: Pal, glow?: string): ReactNode {
  const lx = 100 - b.ex, rx = 100 + b.ex, y = b.ey;
  const big = stage === 1 ? 1.12 : 1;
  if (mood === "sleep" || p === "sleepy") {
    return <g stroke={OUT} strokeWidth={3.4} fill="none" strokeLinecap="round"><path d={`M${lx - 9} ${y}Q${lx} ${y + 9} ${lx + 9} ${y}`} /><path d={`M${rx - 9} ${y}Q${rx} ${y + 9} ${rx + 9} ${y}`} /></g>;
  }
  const eye = (x: number, rxs: number, rys: number, k: string) => (
    <g key={k}>
      {glow && <ellipse cx={x} cy={y} rx={rxs * big + 5} ry={rys * big + 5} fill="none" stroke={glow} strokeWidth={3} opacity={0.85} />}
      <ellipse cx={x} cy={y} rx={rxs * big} ry={rys * big} fill={OUT} />
      <circle cx={x - 3.2} cy={y - 4.2} r={3.8 * big} fill="#fff" />
      <circle cx={x + 3.4} cy={y + 4.2} r={1.9 * big} fill="#fff" opacity={0.85} />
    </g>
  );
  const rxs = p === "zippy" ? 10.5 : p === "shy" ? 8 : 9.4;
  const rys = p === "zippy" ? 14 : p === "shy" ? 10.5 : 12.4;
  return (
    <g>
      {p === "silly" ? [eye(lx, 11.5, 14, "l"), eye(rx, 8, 10, "r")] : [eye(lx, rxs, rys, "l"), eye(rx, rxs, rys, "r")]}
      {p === "brave" && <g stroke={darken(c.main, 0.45)} strokeWidth={4} strokeLinecap="round"><path d={`M${lx - 11} ${y - 19}L${lx + 8} ${y - 14}`} /><path d={`M${rx + 11} ${y - 19}L${rx - 8} ${y - 14}`} /></g>}
    </g>
  );
}

export interface CreatureProps {
  species: Species;
  stage?: 1 | 2 | 3;
  shiny?: boolean;
  seed?: number;
  personality?: Personality;
  mood?: "happy" | "sleep" | "wow";
  className?: string;
  silhouette?: boolean;
  branch?: "sun" | "moon"; // final form (only used at form 3)
  teaser?: boolean; // dark silhouette of a form she hasn't reached yet
  variant?: VariantId; // special color: golden, storm, shadow, autumn
}

export function Creature({ species: sp, stage = 1, shiny = false, seed = 1, personality = "gentle", mood = "happy", className, silhouette, branch, teaser, variant }: CreatureProps) {
  const uid = "c" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const v = useMemo(() => {
    const r = mulberry32(seed * 7919 + sp.id.length);
    const dh = shiny && !variant ? 150 + (r() - 0.5) * 20 : variant ? 0 : (r() - 0.5) * 26;
    const pattern = sp.patterns[Math.floor(r() * sp.patterns.length)];
    const spots = Array.from({ length: 5 }, () => [r(), r(), 6 + r() * 7] as [number, number, number]);
    const size = 0.97 + r() * 0.06;
    return { dh, pattern, spots, size };
  }, [seed, shiny, sp, variant]);

  const br = stage === 3 ? branch : undefined;
  const tint = br === "sun" ? "#ffc34a" : br === "moon" ? "#6e78e0" : undefined; // Sunlit = warm gold, Moonlit = cool blue
  const base = (h: string) => { const x = shift(h, v.dh, shiny ? 0.06 : 0, 0); return tint ? mix(x, tint, br === "sun" ? 0.26 : 0.36) : x; };
  const vv = variant ? VARIANTS[variant] : undefined;
  const mainC = vv ? mix(base(sp.main), vv.main, 0.78) : base(sp.main);
  const c: Pal = {
    main: mainC,
    light: vv ? mix(base(sp.light), vv.light, 0.8) : base(sp.light),
    accent: vv ? (variant === "autumn" ? mix(sp.accent, vv.accent, 0.7) : vv.accent) : sp.accent === "#ffd84a" || sp.accent === "#ffd23f" ? sp.accent : base(sp.accent),
    dark: darken(mainC, 0.3),
  };
  const faces = sp.face ?? [];
  const b = BODY[sp.body];
  const extras = Array.from(new Set<Extra>([...sp.grow[stage - 1], ...(br === "sun" ? (["sunrays", "halo"] as Extra[]) : br === "moon" ? (["moonstars"] as Extra[]) : [])]));
  // "Simple to complex": babies are plain (no tail, pattern or mark, smaller ears); each form adds more.
  const showTail = stage >= 2 || sp.rarity === 4;
  const pattern = stage >= 2 ? v.pattern : "plain";
  const scale = (stage === 1 ? 0.84 : stage === 2 ? 0.96 : 1.04) * v.size;
  const hasAura = extras.includes("aura");
  // frogs wear their eyes on top of their head
  const eb: BodyDef = extras.includes("bumps") ? { ...b, ey: b.top + 8, ex: 26 } : b;
  const glow = variant === "shadow" ? "#c07bff" : undefined;

  if (silhouette) {
    return (
      <svg viewBox="-26 -26 252 252" className={className} aria-hidden>
        <g fill="#2d2250" opacity={0.85} transform={`translate(100 186) scale(${0.96}) translate(-100 -186)`}>
          <path d={b.d} />
          {sp.ears !== "none" && <circle cx={b.ear[0]} cy={b.ear[1] - 8} r={20} />}
          {sp.ears !== "none" && <circle cx={200 - b.ear[0]} cy={b.ear[1] - 8} r={20} />}
        </g>
      </svg>
    );
  }

  const earLeftRaw = ear(sp.ears, b.ear[0], b.ear[1], c);
  const earLeft = earLeftRaw && (stage === 1 ? <g transform={`translate(${b.ear[0]} ${b.ear[1]}) scale(0.8) translate(${-b.ear[0]} ${-b.ear[1]})`}>{earLeftRaw}</g> : earLeftRaw);
  return (
    <svg viewBox="-26 -26 252 252" className={className} role="img" aria-label={teaser ? "a mystery form" : sp.names[stage - 1]} style={teaser ? { filter: "brightness(0) opacity(0.45)" } : undefined}>
      <defs>
        <clipPath id={`${uid}b`}><path d={b.d} /></clipPath>
        <radialGradient id={`${uid}a`}><stop offset="0%" stopColor={shiny ? "#fff3b0" : c.accent} stopOpacity={0.55} /><stop offset="100%" stopColor={c.accent} stopOpacity={0} /></radialGradient>
      </defs>
      {hasAura && <circle cx={100} cy={112} r={104} fill={`url(#${uid}a)`} />}
      <ellipse cx={100} cy={188} rx={52 * scale} ry={7} fill="#000" opacity={0.18} />
      <g transform={`translate(100 186) scale(${scale}) translate(-100 -186)`}>
        {extras.map((x) => <g key={x}>{extraBehind(x, b, c, c.accent)}</g>)}
        {showTail && tail(sp.tail, b.tail[0], b.tail[1], c)}
        {earLeft && <g>{earLeft}<g transform="translate(200 0) scale(-1 1)">{earLeft}</g></g>}
        <path d={b.d} fill={c.main} {...P} />
        <g clipPath={`url(#${uid}b)`}>
          <ellipse cx={b.belly[0]} cy={b.belly[1]} rx={b.belly[2]} ry={b.belly[3]} fill={c.light} />
          {pattern === "spots" && v.spots.map((s, i) => <circle key={i} cx={46 + s[0] * 108} cy={b.top + 14 + s[1] * 70} r={s[2]} fill={c.dark} opacity={0.32} />)}
          {pattern === "stripes" && [0, 1, 2].map((i) => <path key={i} d={`M${54 + i * 34} ${b.top - 4}L${34 + i * 34} ${b.top + 52}`} stroke={c.dark} strokeWidth={11} opacity={0.3} strokeLinecap="round" />)}
          {pattern === "bands" && [60, 88, 116].map((dy) => <rect key={dy} x={20} y={b.top + dy} width={160} height={13} fill={c.accent} opacity={0.85} />)}
          <ellipse cx={78} cy={b.top + 28} rx={26} ry={14} transform={`rotate(-24 78 ${b.top + 28})`} fill="#fff" opacity={0.28} />
        </g>
        <path d={b.d} fill="none" {...P} />
        {/* face */}
        <ellipse cx={100 - eb.ex - 14} cy={eb.ey + 14} rx={9} ry={6} fill="#ff8fb1" opacity={personality === "shy" ? 0.85 : 0.55} />
        <ellipse cx={100 + eb.ex + 14} cy={eb.ey + 14} rx={9} ry={6} fill="#ff8fb1" opacity={personality === "shy" ? 0.85 : 0.55} />
        {faces.includes("mask") && <rect x={100 - eb.ex - 18} y={eb.ey - 13} width={2 * (eb.ex + 18)} height={26} rx={13} fill={darken(c.main, 0.32)} opacity={0.9} />}
        {faces.includes("muzzle") && <g><ellipse cx={100} cy={b.my - 3} rx={21} ry={14} fill={c.light} stroke={OUT} strokeWidth={2.2} /><ellipse cx={100} cy={b.my - 11} rx={6.5} ry={4.4} fill={OUT} /></g>}
        {eyes(personality, eb, stage, mood, c, glow)}
        {faces.includes("beak")
          ? <path d={`M91 ${b.my - 8}L109 ${b.my - 8}L100 ${b.my + 8}Z`} fill="#ffa63d" {...P} strokeWidth={2.6} />
          : mood === "wow" ? <ellipse cx={100} cy={b.my + 3} rx={5} ry={6.5} fill={OUT} /> : <path d={`M93 ${b.my}Q100 ${b.my + 9} 107 ${b.my}`} stroke={OUT} strokeWidth={3.2} fill="none" strokeLinecap="round" />}
        {personality === "silly" && mood !== "wow" && !faces.includes("beak") && <ellipse cx={103} cy={b.my + 8} rx={4.6} ry={5.4} fill="#ff6f91" stroke={OUT} strokeWidth={2} />}
        {faces.includes("whiskers") && (
          <g stroke={OUT} strokeWidth={2.2} strokeLinecap="round" fill="none" opacity={0.8}>
            {[-7, 0, 7].map((d) => <g key={d}><path d={`M${100 - b.ex - 8} ${b.my - 4 + d * 0.5}L${100 - b.ex - 38} ${b.my - 6 + d}`} /><path d={`M${100 + b.ex + 8} ${b.my - 4 + d * 0.5}L${100 + b.ex + 38} ${b.my - 6 + d}`} /></g>)}
          </g>
        )}
        {stage >= 2 && elementMark(sp.element, b.mark[0], b.mark[1], c)}
        {extras.map((x) => <g key={x}>{extraFront(x, b, c)}</g>)}
      </g>
      {variant === "storm" && [[20, 110, 1.5], [180, 84, 1.2]].map(([x, y, k], i) => (
        <path key={i} d={`M${x} ${y}l16 ${-26 * k}l-6 0l12 ${-26 * k}l-24 ${30 * k}l8 0z`} fill="#ffe14a" stroke={OUT} strokeWidth={1.8} strokeLinejoin="round" className="twinkle" style={{ animationDelay: `${i * 0.6}s` }} />
      ))}
      {variant === "shadow" && [[16, 150, 16], [186, 138, 13], [24, 60, 10]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#8b5cf6" opacity={0.28} className="twinkle" style={{ animationDelay: `${i * 0.5}s` }} />)}
      {variant === "autumn" && [[24, 56, "#d9742f"], [178, 92, "#b3401a"], [38, 168, "#f0a030"]].map(([x, y, col], i) => (
        <path key={i} d={leafD(Number(x), Number(y) + 16, 32, 12)} fill={String(col)} stroke={OUT} strokeWidth={1.6} transform={`rotate(${i * 50 - 30} ${x} ${y})`} className="twinkle" style={{ animationDelay: `${i * 0.5}s` }} />
      ))}
      {variant === "golden" && <circle cx={100} cy={112} r={96} fill="none" stroke="#ffd84a" strokeWidth={3} strokeDasharray="6 10" opacity={0.7} />}
      {(shiny || variant === "golden") && [[22, 40], [182, 52], [168, 160], [30, 150]].map(([x, y], i) => (
        <path key={i} d={starD(x, y, 9, 3.4)} fill="#fff7b0" stroke="#e0b100" strokeWidth={1.2} className="twinkle" style={{ animationDelay: `${i * 0.35}s` }} />
      ))}
    </svg>
  );
}

export const branchOf = (o: { branch?: "sun" | "moon" }) => o.branch;
export const stageOf = (xp: number): 1 | 2 | 3 => (xp >= 40 ? 3 : xp >= 14 ? 2 : 1);
export const nameOf = (sp: Species, xp: number) => sp.names[stageOf(xp) - 1];
