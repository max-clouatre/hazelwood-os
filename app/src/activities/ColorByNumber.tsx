import { useEffect, useMemo, useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime, note, oops } from "../lib/audio";
import { cheer, say } from "../lib/speech";
import { addStar, clearPage, markColored, setFill, useStore } from "../lib/store";
import { PageSvg } from "../coloring/PageSvg";
import { NUMBER_KEYS, PAGE_ORDER, PAGES } from "../coloring/pages";
import type { ActivityProps } from "./types";

// Progress is stored under "n:<page>" so earlier free-coloring on the same picture never counts here.
const sk = (id: string) => `n:${id}`;

export default function ColorByNumber({ profile }: ActivityProps) {
  const { coloring, colored } = useStore();
  const [pageId, setPageId] = useState<string | null>(null);
  const [sel, setSel] = useState(1);
  const [bad, setBad] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const order = PAGE_ORDER[profile].map((id) => PAGES.find((p) => p.id === id)!);
  const page = PAGES.find((p) => p.id === pageId);
  const key = pageId ? NUMBER_KEYS[pageId] : undefined;
  const fills = useMemo(() => (pageId ? coloring[profile][sk(pageId)] ?? {} : {}), [coloring, profile, pageId]);

  if (!page || !key) {
    const total = (id: string) => Object.keys(NUMBER_KEYS[id].numbers).length;
    return (
      <div className="flex h-full flex-col items-center gap-3 overflow-y-auto px-4 pb-4">
        <p className="text-center text-2xl drop-shadow">Pick a picture. Match the numbers to the colors!</p>
        <div className="grid w-full max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {order.map((p) => {
            const done = Object.keys(coloring[profile][sk(p.id)] ?? {}).length;
            return (
              <button key={p.id} onClick={() => {
                setPageId(p.id); setSel(firstOpen(p.id, coloring[profile][sk(p.id)] ?? {})); say(p.title);
              }} className="relative overflow-hidden rounded-3xl bg-white shadow-xl active:scale-95">
                <PageSvg page={p} fills={coloring[profile][sk(p.id)] ?? {}} className="pointer-events-none block h-auto w-full" />
                <span className="block bg-white pb-1 text-center text-lg font-bold text-purple-900">
                  <span className="emoji">{p.emoji}</span> {p.title} <span className="text-sm font-normal text-purple-700">{done}/{total(p.id)}</span>
                </span>
                {colored[profile][sk(p.id)] && <span className="emoji absolute right-2 top-1 text-3xl">⭐</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const ids = page.regions.map((r) => r.id);
  const filledCount = ids.filter((id) => fills[id]).length;
  const complete = filledCount === ids.length;
  const left = (num: number) => ids.filter((id) => key.numbers[id] === num && !fills[id]).length;
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };

  function firstOpen(id: string, f: Record<string, string>) {
    const k = NUMBER_KEYS[id];
    for (let i = 1; i <= k.legend.length; i++) {
      if (Object.entries(k.numbers).some(([rid, num]) => num === i && !f[rid])) return i;
    }
    return 1;
  }

  const fill = (region: string) => {
    if (complete || fills[region]) return;
    const num = key.numbers[region];
    if (num !== sel) {
      oops(); setBad(region); later(() => setBad(null), 600);
      say(`That one is number ${num}. Look for ${key.legend[sel - 1].name}!`);
      return;
    }
    setFill(profile, sk(page.id), region, key.legend[num - 1].hex);
    note(num);
    const nextFills = { ...fills, [region]: key.legend[num - 1].hex };
    const remainingThis = ids.filter((id) => key.numbers[id] === num && !nextFills[id]).length;
    if (ids.every((id) => nextFills[id])) {
      later(() => {
        chime(); setBurst((b) => b + 1);
        say(`${cheer()} You finished the ${page.title}!`);
        if (!colored[profile][sk(page.id)]) { markColored(profile, sk(page.id)); addStar(profile, 2); }
      }, 350);
    } else if (remainingThis === 0) {
      const nxt = firstOpen(page.id, nextFills);
      say(`${key.legend[num - 1].name} is done! Now number ${nxt}, ${key.legend[nxt - 1].name}.`);
      setSel(nxt);
    }
  };

  const nextPage = () => {
    const i = order.findIndex((p) => p.id === page.id);
    const nxt = order[(i + 1) % order.length];
    setBurst(0); setPageId(nxt.id); setSel(firstOpen(nxt.id, coloring[profile][sk(nxt.id)] ?? {}));
  };

  const btn = "emoji h-14 w-14 rounded-full bg-white text-2xl text-black shadow-lg active:scale-95";
  return (
    <div className="flex h-full flex-col px-3 pb-2">
      <div className="mx-auto mb-1 h-3 w-48 overflow-hidden rounded-full bg-black/30">
        <div className="h-full rounded-full bg-yellow-300 transition-all" style={{ width: `${(filledCount / ids.length) * 100}%` }} />
      </div>
      <div className="relative min-h-0 flex-1">
        <PageSvg page={page} fills={fills} onFill={fill} numbers={key.numbers} bad={bad}
          tint={(id) => key.numbers[id] === sel} className="absolute inset-0 h-full w-full rounded-2xl" />
        {complete && (
          <div className="anim-pop absolute inset-x-0 bottom-3 flex items-center justify-center gap-3">
            <span className="rounded-full bg-white/95 px-5 py-2 text-2xl font-bold text-purple-800">🎉 You did it!</span>
            <button onClick={nextPage} className="rounded-full bg-yellow-300 px-5 py-2 text-2xl font-bold text-black shadow-lg active:scale-95">Next picture ➜</button>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <button onClick={() => { setPageId(null); setBurst(0); }} aria-label="All pictures" className={btn}>📖</button>
        {key.legend.map((c, i) => {
          const num = i + 1;
          const done = left(num) === 0;
          return (
            <button key={num} onClick={() => { setSel(num); say(`${num}, ${c.name}`, 1); }} aria-label={`number ${num} ${c.name}`}
              className={`relative flex h-14 w-14 items-center justify-center rounded-full border-4 text-2xl font-bold shadow-lg ${num === sel ? "scale-125 border-yellow-300" : "border-white/80"}`}
              style={{ background: c.hex, color: ["#facc15", "#fde68a", "#fb923c", "#7dd3fc", "#c4b5fd", "#d6a76a"].includes(c.hex) ? "#3b2a5a" : "#fff", textShadow: "0 1px 2px rgba(0,0,0,.5)" }}>
              {done ? <span className="emoji text-2xl">✓</span> : num}
            </button>
          );
        })}
        <button onClick={() => { clearPage(profile, sk(page.id)); setSel(1); setBurst(0); }} aria-label="Start over" className={btn}>🧽</button>
      </div>
      {burst > 0 && <Burst key={burst} emojis={["⭐", "🦄", "🌈", "💖"]} />}
    </div>
  );
}
