import { useEffect, useState } from "react";
import { chime } from "../lib/audio";
import { say } from "../lib/speech";
import { useStore } from "../lib/store";
import { addBerries, BUSH_BERRIES, bushWait, biomeUnlocked, setWilds } from "./game";
import { BIOMES } from "./species";

export const openGuide = () => window.dispatchEvent(new Event("wilds:guide"));
export const goActivity = (id: string) => window.dispatchEvent(new CustomEvent("hwos:go", { detail: id }));

/** The berry counter. Tap it anywhere to learn how to earn more. */
export function BerryPill({ n, className = "" }: { n: number; className?: string }) {
  return (
    <button onClick={openGuide} aria-label="How to get more berries" className={`flex items-center gap-1 rounded-full bg-black/30 px-3 py-1 text-xl font-bold active:scale-95 ${className}`}>
      <span className="emoji">🍓</span> {n} <span className="ml-1 rounded-full bg-yellow-300 px-2 text-base text-black">+</span>
    </button>
  );
}

const fmt = (ms: number) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;

function Row({ icon, title, text, children }: { icon: string; title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/90 p-2 text-left text-emerald-950">
      <span className="emoji w-12 shrink-0 text-center text-4xl">{icon}</span>
      <div className="min-w-0 flex-1 leading-tight"><p className="text-lg font-bold">{title}</p><p className="text-sm">{text}</p></div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}

export function BerryGuide({ onClose }: { onClose: () => void }) {
  const { wilds: w } = useStore();
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const btn = "rounded-xl bg-yellow-300 px-3 py-2 text-base font-bold text-black active:scale-95";
  const doneGoals = w.goals.list.filter((g) => g.claimed).length;
  return (
    <div className="absolute inset-0 z-50 flex flex-col gap-2 overflow-y-auto bg-black/80 p-3">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between">
        <p className="text-2xl font-bold">🍓 How to get more berries</p>
        <button onClick={onClose} className="rounded-xl bg-white px-4 py-2 text-xl font-bold text-black">Close</button>
      </div>
      <div className="mx-auto flex w-full max-w-xl flex-col gap-2">
        <Row icon="⭐" title="Play any activity, get ⭐ stars" text="Every ⭐ gives you 3 🍓 berries and warms your eggs!">
          <div className="flex flex-col gap-1">
            <button className={btn} onClick={() => { say("Let's play spelling!"); goActivity("spelling"); }}>Spelling</button>
            <button className={btn} onClick={() => goActivity("sink-float")}>Science</button>
          </div>
        </Row>
        <Row icon="🌳" title="Wishing Tree" text={w.treeDone ? "Already visited today. Come back tomorrow for +5 🍓." : "Free! +5 🍓 once every day."}>
          {!w.treeDone && <button className={btn} onClick={() => { addBerries(5); setWilds(() => ({ treeDone: true })); chime(); say("Five berries!"); }}>Get +5</button>}
        </Row>
        <div className="rounded-2xl bg-white/90 p-2 text-emerald-950">
          <p className="px-1 text-lg font-bold"><span className="emoji">🍓</span> Berry Bushes: +{BUSH_BERRIES} 🍓 each, again every 2 minutes</p>
          <div className="mt-1 grid grid-cols-2 gap-1 text-sm">
            {BIOMES.filter((b) => biomeUnlocked(b.id, w)).map((b) => {
              const wait = bushWait(w, b.id, now);
              return <p key={b.id} className="rounded-lg bg-emerald-100 px-2 py-1"><span className="emoji">{b.emoji}</span> {b.name.split(" ")[1] ?? b.name}: {wait > 0 ? `in ${fmt(wait)}` : <b>ready!</b>}</p>;
            })}
          </div>
        </div>
        <Row icon="🎯" title="Daily Goals" text={`Finish today's goals for bonus berries. ${doneGoals}/${w.goals.list.length} claimed.`} />
        <Row icon="🔎" title="Look in bushes" text="About 1 in 4 rustling bushes hides 1–3 berries (or even an egg!)." />
        <Row icon="⚔️" title="Duels" text="Win: +6 🍓. Even a loss gives +2 🍓." />
        <Row icon="🏅" title="Family badges" text="Meet a whole family: +20 🍓. Find all 4 forms of one creature: +10 🍓." />
      </div>
    </div>
  );
}
