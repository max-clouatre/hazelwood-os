import type { CSSProperties } from "react";

// Hand-drawn vector icons for the capture area. They don't depend on the tablet's emoji font,
// so they always draw correctly (no blank boxes), and each zone gets its own look.
const INK = "#2b2540";
const S = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
interface P { className?: string; style?: CSSProperties }

/** Circles drawn as one solid shape with a single outline (no inner lines). */
const Blob = ({ circles, fill }: { circles: [number, number, number][]; fill: string }) => (
  <g>
    {circles.map(([x, y, r], i) => <circle key={`o${i}`} cx={x} cy={y} r={r} fill={INK} stroke={INK} strokeWidth={6} />)}
    {circles.map(([x, y, r], i) => <circle key={`f${i}`} cx={x} cy={y} r={r} fill={fill} />)}
  </g>
);

export function SpotIcon({ biome, className, style }: P & { biome: string }) {
  let art;
  switch (biome) {
    case "forest": art = (
      <g>
        <rect x={24} y={32} width={16} height={24} rx={7} fill="#fff1d6" {...S} />
        <path d="M8 38C8 16 20 10 32 10C44 10 56 16 56 38Z" fill="#e5484d" {...S} />
        <circle cx={22} cy={26} r={4.5} fill="#fff" /><circle cx={35} cy={19} r={3.8} fill="#fff" /><circle cx={46} cy={30} r={4.2} fill="#fff" />
      </g>); break;
    case "shore": art = (
      <g>
        <rect x={25} y={52} width={14} height={8} rx={3} fill="#f4a261" {...S} />
        <path d="M32 54L7 30C8 12 20 8 32 8C44 8 56 12 57 30Z" fill="#ffb8a1" {...S} />
        <path d="M32 54L18 14M32 54L32 9M32 54L46 14M32 54L10 30M32 54L54 30" stroke="#e07a5f" strokeWidth={3} fill="none" strokeLinecap="round" />
      </g>); break;
    case "cave": art = (
      <g>
        <path d="M12 38L18 24L25 38L23 58L9 58Z" fill="#b79cff" {...S} />
        <path d="M52 42L46 30L39 42L41 58L55 58Z" fill="#b79cff" {...S} />
        <path d="M32 5L49 24L41 59L23 59L15 24Z" fill="#8ee3f5" {...S} />
        <path d="M32 5L26 24L32 59M32 5L40 24L32 59M15 24H49" stroke="#fff" strokeWidth={2.4} fill="none" opacity={0.7} strokeLinecap="round" />
      </g>); break;
    case "peak": art = (
      <g>
        <Blob circles={[[19, 40, 12], [33, 31, 16], [47, 40, 12], [33, 44, 12]]} fill="#ffffff" />
        <path d="M44 14L46.6 19.6L52.6 20.3L48.2 24.4L49.4 30.4L44 27.4L38.6 30.4L39.8 24.4L35.4 20.3L41.4 19.6Z" fill="#ffd84a" {...S} strokeWidth={2.4} />
      </g>); break;
    case "lure": art = (
      <g>
        <path d="M32 4L39.5 22.5L59 24L44 36.5L48.8 56L32 45.5L15.2 56L20 36.5L5 24L24.5 22.5Z" fill="#ffd84a" {...S} />
        <circle cx={26} cy={26} r={3} fill="#fff" opacity={0.85} />
      </g>); break;
    default: art = (
      <g>
        <Blob circles={[[19, 41, 14], [45, 41, 14], [32, 28, 17]]} fill="#58b85f" />
        <circle cx={26} cy={22} r={5} fill="#9be39a" /><circle cx={17} cy={38} r={3.2} fill="#ff8fb1" /><circle cx={46} cy={37} r={3.2} fill="#ffd84a" /><circle cx={33} cy={46} r={3.2} fill="#ff8fb1" />
      </g>);
  }
  return <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden>{art}</svg>;
}

export function Badge({ kind, className, style }: P & { kind: "q" | "bang" }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden>
      <circle cx={32} cy={32} r={26} fill={kind === "q" ? "#ffd84a" : "#ff6b6b"} {...S} />
      <text x={32} y={45} textAnchor="middle" fontSize={38} fontWeight={700} fontFamily="Fredoka, system-ui, sans-serif" fill={kind === "q" ? INK : "#fff"}>{kind === "q" ? "?" : "!"}</text>
    </svg>
  );
}

export function Orb({ className, style }: P) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden>
      <circle cx={32} cy={32} r={24} fill="#8b5cf6" {...S} />
      <path d="M18 28Q21 15 35 14" stroke="#fff" strokeWidth={4.5} fill="none" strokeLinecap="round" opacity={0.85} />
      <path d="M40 34L42 39L47.5 39.6L43.4 43.2L44.6 48.5L40 45.7L35.4 48.5L36.6 43.2L32.5 39.6L38 39Z" fill="#ffd84a" stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
    </svg>
  );
}

export type PopKind = "berry" | "heart" | "egg" | "dust" | "hourglass" | "bang" | "honey";
export function PopIcon({ kind, className, style }: P & { kind: PopKind }) {
  let art;
  switch (kind) {
    case "berry": art = (
      <g>
        <path d="M32 58C12 47 8 30 13 22C19 14 45 14 51 22C56 30 52 47 32 58Z" fill="#ef4444" {...S} />
        <path d="M20 16L32 8L44 16L32 22Z" fill="#4caf50" {...S} strokeWidth={2.6} />
        {[[24, 30], [34, 28], [42, 34], [28, 40], [37, 44]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={1.6} ry={2.4} fill="#ffe08a" />)}
      </g>); break;
    case "heart": art = <path d="M32 55C5 36 9 11 26 13C30 14 32 17 32 20C32 17 34 14 38 13C55 11 59 36 32 55Z" fill="#ff6fa5" {...S} />; break;
    case "egg": art = (
      <g>
        <ellipse cx={32} cy={36} rx={19} ry={25} fill="#fff3d6" {...S} />
        <circle cx={25} cy={30} r={4} fill="#ffb703" /><circle cx={38} cy={40} r={5} fill="#8ecae6" /><circle cx={28} cy={47} r={3} fill="#ff8fb1" />
      </g>); break;
    case "dust": art = <path d="M8 24Q30 12 52 24M5 36Q28 26 56 36M12 49Q32 41 48 49" stroke="#aaa3c8" strokeWidth={5} fill="none" strokeLinecap="round" />; break;
    case "hourglass": art = (
      <g>
        <path d="M16 8H48L37 32L48 56H16L27 32Z" fill="#ffe9a8" {...S} />
        <path d="M24 52L32 40L40 52Z" fill="#f4a261" />
      </g>); break;
    case "honey": art = (
      <g>
        <rect x={14} y={22} width={36} height={34} rx={9} fill="#ffb703" {...S} />
        <rect x={16} y={12} width={32} height={12} rx={4} fill="#f4e4c1" {...S} />
        <path d="M22 38Q22 46 27 46Q32 46 32 38" fill="#fff" opacity={0.55} />
        <rect x={20} y={30} width={24} height={9} rx={3} fill="#fff7d6" stroke={INK} strokeWidth={2} />
      </g>); break;
    default: art = <Badge kind="bang" />;
  }
  return <svg viewBox="0 0 64 64" className={className} style={style} aria-hidden>{kind === "bang" ? <><circle cx={32} cy={32} r={26} fill="#ff6b6b" {...S} /><text x={32} y={45} textAnchor="middle" fontSize={38} fontWeight={700} fontFamily="Fredoka, system-ui, sans-serif" fill="#fff">!</text></> : art}</svg>;
}
