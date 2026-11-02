import { useEffect, useRef, useState } from "react";
import { chime, note, oops, tone } from "../lib/audio";
import { say } from "../lib/speech";
import { setWilds } from "./game";
import { catchChance, wilds } from "./game";
import { Creature } from "./Creature";
import { SPECIES_BY_ID } from "./species";
import type { Biome } from "./species";
import type { Owned } from "./types";
import { Orb, PopIcon } from "./Icons";
import { Scene } from "./Scene";

type Phase = "aim" | "throw" | "wobble" | "result";
const CYCLE = 1500;

export interface CatchProps {
  draft: Owned; biome: Biome; bonus?: number; headline: string;
  onCaught: () => void; onFled: () => void;
}

export function Catch({ draft, biome, bonus = 0, headline, onCaught, onFled }: CatchProps) {
  const sp = SPECIES_BY_ID[draft.sp];
  const [tries, setTries] = useState(3);
  const [phase, setPhase] = useState<Phase>("aim");
  const intro = `${headline} ??? appeared!`;
  const special = draft.shiny || !!draft.variant || sp.rarity >= 3; // a hint, without giving the creature away
  const [msg, setMsg] = useState(intro);
  const [useBerry, setUseBerry] = useState(false);
  const [quality, setQuality] = useState<"great" | "nice" | "ok" | "miss" | null>(null);
  const [ringHue, setRingHue] = useState("#fff");
  const ring = useRef<HTMLDivElement>(null);
  const raf = useRef(0);
  const start = useRef(performance.now());
  const scale = useRef(1.8);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  const berries = wilds().berries;

  useEffect(() => { say("Something is here! Who could it be?"); return () => timers.current.forEach(clearTimeout); }, [intro]);

  useEffect(() => {
    if (phase !== "aim") return;
    start.current = performance.now();
    const loop = (now: number) => {
      const t = ((now - start.current) % CYCLE) / CYCLE;
      scale.current = 1.8 - 1.25 * t;
      const d = Math.abs(scale.current - 1);
      if (ring.current) {
        ring.current.style.transform = `translate(-50%,-50%) scale(${scale.current})`;
        ring.current.style.borderColor = d < 0.1 ? "#4ade80" : d < 0.25 ? "#facc15" : d < 0.5 ? "#fb923c" : "#ffffff";
      }
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [phase]);

  const throwOrb = () => {
    if (phase !== "aim") return;
    cancelAnimationFrame(raf.current);
    const d = Math.abs(scale.current - 1);
    const q = d < 0.1 ? "great" : d < 0.25 ? "nice" : d < 0.5 ? "ok" : "miss";
    setQuality(q); setRingHue(q === "great" ? "#4ade80" : q === "nice" ? "#facc15" : "#fb923c");
    const berry = useBerry && wilds().berries > 0;
    if (berry) setWilds((w) => ({ berries: w.berries - 1 }));
    setPhase("throw"); tone(500, 0, 0.15);
    const left = tries - 1;
    setTries(left);
    later(() => {
      if (q === "miss") {
        oops(); setMsg("Missed! Wait for the ring to shrink to the circle.");
        finish(false, left);
        return;
      }
      setPhase("wobble"); note(2);
      later(() => {
        const ok = Math.random() < catchChance(sp, q, berry, bonus);
        if (ok) { chime(); setPhase("result"); setMsg(q === "great" ? "GREAT throw! Gotcha!" : "Gotcha!"); say("Gotcha! Who is it?"); later(onCaught, 1500); }
        else { oops(); setMsg("Oh no! It broke free!"); finish(false, left); }
      }, 1700);
    }, 450);
  };

  function finish(_: boolean, left: number) {
    if (left <= 0) { setPhase("result"); setMsg("It ran away... Maybe you'll find it again!"); say("It ran away. Try again soon!"); later(onFled, 2200); }
    else later(() => { setPhase("aim"); setMsg("Try again!"); }, 1200);
  }

  const wob = phase === "wobble";
  return (
    <div className="absolute inset-0" onPointerDown={(e) => { if ((e.target as HTMLElement).closest("button")) return; throwOrb(); }}>
      <Scene biome={biome} />
      <div className="absolute inset-x-0 top-2 flex flex-col items-center gap-1 px-3 text-center">
        <p className="rounded-full bg-black/40 px-4 py-1 text-xl font-bold drop-shadow">{msg}</p>
        <p className="rounded-full bg-black/30 px-3 py-0.5 text-base">
          <span className="emoji">❓</span> Mystery creature · {special ? "✨ It's sparkling... something special!" : "Who could it be?"}
        </p>
      </div>
      <div className="absolute left-3 top-24 flex gap-1">{[0, 1, 2].map((i) => <span key={i} className={`h-5 w-5 rounded-full border-2 border-white ${i < tries ? "bg-yellow-300" : "bg-black/30"}`} />)}</div>

      <div className="absolute left-1/2 top-[48%] -translate-x-1/2 -translate-y-1/2">
        <div className={wob ? "anim-wobble" : phase === "result" && msg.startsWith("Gotcha") ? "" : "anim-hop"} style={{ transition: "transform .4s", transform: wob || (phase === "result" && msg.startsWith("Gotcha")) ? "scale(.35)" : "scale(1)" }}>
          <Creature mystery species={sp} stage={1} seed={draft.seed} personality={draft.pers} mood={phase === "result" && !msg.startsWith("Gotcha") ? "sleep" : "happy"} className="h-56 w-56 sm:h-64 sm:w-64" />
        </div>
        {special && phase !== "result" && [[-86, -70], [90, -50], [-70, 60], [84, 70]].map(([x, y], i) => (
          <svg key={i} viewBox="0 0 20 20" className="twinkle pointer-events-none absolute left-1/2 top-1/2 h-8 w-8" style={{ marginLeft: x - 16, marginTop: y - 16, animationDelay: `${i * 0.4}s` }} aria-hidden><path d="M10 0L12.6 7.4L20 10L12.6 12.6L10 20L7.4 12.6L0 10L7.4 7.4Z" fill="#fff7b0" stroke="#e0b100" strokeWidth={0.8} /></svg>
        ))}
        {wob && <Orb className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2" />}
        {/* target circle + shrinking ring */}
        {phase === "aim" || phase === "throw" ? (
          <>
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-dashed border-white/80" />
            <div ref={ring} className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 rounded-full border-[6px]"
              style={{ transform: "translate(-50%,-50%) scale(1.8)", borderColor: phase === "throw" ? ringHue : "#fff" }} />
          </>
        ) : null}
        {phase === "throw" && <Orb className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2" style={{ animation: "burst 0.45s ease-in forwards", ["--dx" as string]: "0px", ["--dy" as string]: "-30px" } as React.CSSProperties} />}
        {quality && phase !== "aim" && <p className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-3xl font-bold" style={{ color: ringHue }}>{quality === "great" ? "GREAT!" : quality === "nice" ? "Nice!" : quality === "ok" ? "OK" : "Miss"}</p>}
      </div>

      <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2 px-2 sm:gap-4">
        <button onClick={() => setUseBerry((b) => !b)} disabled={phase !== "aim" || berries < 1}
          className={`rounded-2xl px-3 py-2 text-base font-bold shadow-lg active:scale-95 sm:px-4 sm:py-3 sm:text-lg ${useBerry ? "bg-pink-400 text-white ring-4 ring-pink-200" : "bg-white/90 text-pink-700"} ${berries < 1 ? "opacity-40" : ""}`}>
          <PopIcon kind="berry" className="mr-1 inline-block h-6 w-6 align-middle" /> Sweet berry {useBerry ? "ON" : ""}<span className="hidden text-xs font-normal sm:block">+15% · costs 1 ({berries} left)</span>
        </button>
        <button onClick={throwOrb} disabled={phase !== "aim"} className="rounded-3xl bg-yellow-300 px-6 py-3 text-2xl font-bold text-black shadow-2xl active:scale-95 sm:px-10 sm:py-4 sm:text-3xl">
          <Orb className="mr-2 inline-block h-9 w-9 align-middle" /> Throw!
        </button>
        <button onClick={onFled} disabled={phase !== "aim"} className="rounded-2xl bg-white/70 px-3 py-2 text-base font-bold text-purple-900 active:scale-95 sm:px-4 sm:py-3 sm:text-lg">Run</button>
      </div>
      <p className="pointer-events-none absolute inset-x-0 bottom-20 text-center text-sm text-white drop-shadow sm:bottom-24">Tap when the white ring touches the dashed circle!</p>
    </div>
  );
}
