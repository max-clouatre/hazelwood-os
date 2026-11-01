import { useEffect, useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime, note } from "../lib/audio";
import { cheer, say } from "../lib/speech";
import { addStar, clearPage, markColored, setFill, useStore } from "../lib/store";
import { PageSvg } from "../coloring/PageSvg";
import { PAGE_ORDER, PAGES, PALETTE } from "../coloring/pages";
import ColorByNumber from "./ColorByNumber";
import type { ActivityProps } from "./types";

interface Undo { page: string; region: string; prev: string | null }

export default function ColoringBook({ profile }: ActivityProps) {
  // Hazel prefers color by number; Violet gets free coloring.
  if (profile === "hazel") return <ColorByNumber profile={profile} />;
  return <FreeColoring profile={profile} />;
}

function FreeColoring({ profile }: ActivityProps) {
  const { coloring, colored } = useStore();
  const [pageId, setPageId] = useState<string | null>(null);
  const [color, setColor] = useState(PALETTE[7]); // pink
  const [burst, setBurst] = useState(0);
  const undo = useRef<Undo[]>([]);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const order = PAGE_ORDER[profile].map((id) => PAGES.find((p) => p.id === id)!);
  const page = PAGES.find((p) => p.id === pageId);

  if (!page) {
    return (
      <div className="flex h-full flex-col items-center gap-3 overflow-y-auto px-4 pb-4">
        <p className="text-center text-2xl drop-shadow">Pick a picture to color!</p>
        <div className="grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {order.map((p) => (
            <button key={p.id} onClick={() => { undo.current = []; setPageId(p.id); say(p.title); }}
              className="relative overflow-hidden rounded-3xl bg-white shadow-xl active:scale-95">
              <PageSvg page={p} fills={coloring[profile][p.id] ?? {}} className="pointer-events-none block h-auto w-full" />
              <span className="block bg-white pb-1 text-center text-lg font-bold text-purple-900"><span className="emoji">{p.emoji}</span> {p.title}</span>
              {colored[profile][p.id] && <span className="emoji absolute right-2 top-1 text-3xl">⭐</span>}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const fills = coloring[profile][page.id] ?? {};
  const filled = Object.keys(fills).length;
  const enough = filled >= Math.min(4, page.regions.length);

  const pick = (c: (typeof PALETTE)[number]) => { setColor(c); say(c.name, 1); };
  const fill = (region: string) => {
    const prev = fills[region] ?? null;
    if (prev === color.hex) return;
    undo.current.push({ page: page.id, region, prev });
    if (undo.current.length > 30) undo.current.shift();
    setFill(profile, page.id, region, color.hex === "#ffffff" ? null : color.hex);
    note();
  };
  const undoLast = () => {
    const u = undo.current.pop();
    if (u && u.page === page.id) setFill(profile, u.page, u.region, u.prev);
  };
  const done = () => {
    if (!colored[profile][page.id]) {
      markColored(profile, page.id); addStar(profile);
    }
    chime(); setBurst((b) => b + 1);
    say(`${cheer()} What a beautiful ${page.title}!`);
    timer.current = window.setTimeout(() => { setPageId(null); setBurst(0); }, 2600);
  };

  const btn = "emoji h-14 w-14 rounded-full bg-white text-2xl text-black shadow-lg active:scale-95";
  return (
    <div className="flex h-full flex-col px-3 pb-2">
      <div className="relative min-h-0 flex-1">
        <PageSvg page={page} fills={fills} onFill={fill} className="absolute inset-0 h-full w-full rounded-2xl" />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <button onClick={() => { setPageId(null); undo.current = []; }} aria-label="All pictures" className={btn}>📖</button>
        {PALETTE.map((c) => (
          <button key={c.name} onClick={() => pick(c)} aria-label={c.name}
            className={`h-12 w-12 rounded-full border-4 shadow-lg ${c.name === color.name ? "scale-125 border-yellow-300" : "border-white/80"}`}
            style={{ background: c.hex }} />
        ))}
        <button onClick={undoLast} aria-label="Undo" className={btn}>↩️</button>
        <button onClick={() => { clearPage(profile, page.id); undo.current = []; }} aria-label="Clear page" className={btn}>🧽</button>
        <button onClick={done} disabled={!enough} aria-label="I'm done"
          className={`rounded-full bg-yellow-300 px-5 py-3 text-xl font-bold text-black shadow-lg active:scale-95 ${enough ? "animate-pulse" : "opacity-40"}`}>
          <span className="emoji">⭐</span> Done!
        </button>
      </div>
      {burst > 0 && <Burst key={burst} emojis={["⭐", "🌈", "💖", "✨"]} />}
    </div>
  );
}
