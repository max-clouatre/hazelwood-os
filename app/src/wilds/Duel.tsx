import { useEffect, useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime, oops, tone } from "../lib/audio";
import { cheer, say } from "../lib/speech";
import { addStar, useStore } from "../lib/store";
import { addBerries, bump, gainBond, setWilds, stageFor, todayKey } from "./game";
import { Back } from "./Collection";
import { Creature } from "./Creature";
import { COLLECTABLE, ELEMENTS, SPECIES_BY_ID } from "./species";
import type { ElementId, Personality, Species } from "./species";

interface Fighter { oid?: string; sp: Species; stage: 1 | 2 | 3; name: string; max: number; hp: number; shiny: boolean; seed: number; pers: Personality }
const maxHp = (stage: number) => 70 + 25 * (stage - 1);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const mult = (a: ElementId, d: ElementId) => (ELEMENTS[a].beats === d ? 1.6 : ELEMENTS[d].beats === a ? 0.6 : 1);
const PERS: Personality[] = ["gentle", "zippy", "brave", "silly", "shy", "sleepy"];

function Chart({ onClose }: { onClose: () => void }) {
  const ids = Object.keys(ELEMENTS) as ElementId[];
  return (
    <button onClick={onClose} className="anim-pop absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-3">
      <div className="max-w-lg rounded-3xl bg-indigo-950 p-4 text-left shadow-2xl">
        <p className="mb-2 text-center text-2xl font-bold">Who beats who?</p>
        {ids.map((id) => {
          const e = ELEMENTS[id], t = ELEMENTS[e.beats];
          return <p key={id} className="text-lg"><span className="emoji">{e.emoji}</span> {e.name} <b>beats</b> <span className="emoji">{t.emoji}</span> {t.name}<span className="block pl-8 text-sm text-white/70">{e.why}</span></p>;
        })}
        <p className="mt-2 text-center text-sm text-white/60">tap to close</p>
      </div>
    </button>
  );
}

export function Duel({ onBack }: { onBack: () => void }) {
  const { wilds: w } = useStore();
  const [phase, setPhase] = useState<"pick" | "fight" | "end">("pick");
  const [sel, setSel] = useState<string[]>(() => [...w.owned].sort((a, b) => b.xp - a.xp).slice(0, 3).map((o) => o.id));
  const [chart, setChart] = useState(false);
  const [mine, setMine] = useState<Fighter[]>([]);
  const [theirs, setTheirs] = useState<Fighter[]>([]);
  const [pi, setPi] = useState(0);
  const [oi, setOi] = useState(0);
  const [log, setLog] = useState("");
  const [busy, setBusy] = useState(false);
  const [hit, setHit] = useState<"p" | "o" | null>(null);
  const [won, setWon] = useState<boolean | null>(null);
  const [reward, setReward] = useState("");
  const buff = useRef({ p: false, o: false });
  const guard = useRef({ p: false, o: false });
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 3 ? s : [...s, id]));

  const start = () => {
    const team: Fighter[] = sel.map((id) => {
      const o = w.owned.find((x) => x.id === id)!;
      const stage = stageFor(o.xp);
      return { oid: id, sp: SPECIES_BY_ID[o.sp], stage, name: o.name, max: maxHp(stage), hp: maxHp(stage), shiny: o.shiny, seed: o.seed, pers: o.pers };
    });
    const avg = Math.round(team.reduce((a, f) => a + f.stage, 0) / team.length);
    const foes: Fighter[] = team.map((_, i) => {
      const sp = COLLECTABLE[Math.floor(Math.random() * COLLECTABLE.length)];
      const stage = Math.max(1, Math.min(3, avg + (Math.random() < 0.3 ? 1 : Math.random() < 0.5 ? 0 : -1))) as 1 | 2 | 3;
      return { sp, stage, name: sp.names[stage - 1], max: maxHp(stage), hp: maxHp(stage), shiny: false, seed: 40 + i * 13, pers: PERS[Math.floor(Math.random() * PERS.length)] };
    });
    buff.current = { p: false, o: false }; guard.current = { p: false, o: false };
    setMine(team); setTheirs(foes); setPi(0); setOi(0); setWon(null);
    setLog(`A wild duel begins! ${team[0].name} vs ${foes[0].name}!`); say("A friendly duel begins!");
    setPhase("fight");
  };

  async function strike(from: "p" | "o", mineL: Fighter[], theirsL: Fighter[], pIdx: number, oIdx: number) {
    const a = from === "p" ? mineL[pIdx] : theirsL[oIdx];
    const d = from === "p" ? theirsL[oIdx] : mineL[pIdx];
    const m = mult(a.sp.element, d.sp.element);
    const boosted = buff.current[from]; buff.current[from] = false;
    const dg = guard.current[from === "p" ? "o" : "p"]; guard.current[from === "p" ? "o" : "p"] = false;
    const dmg = Math.max(1, Math.round((20 + 7 * (a.stage - 1)) * m * (boosted ? 1.5 : 1) * (0.9 + Math.random() * 0.2) * (dg ? 0.5 : 1)));
    const move = ELEMENTS[a.sp.element].move;
    setLog(`${a.name} uses ${move}! ${ELEMENTS[a.sp.element].emoji}`); tone(m > 1 ? 700 : 400, 0, 0.2, "square", 0.12);
    await sleep(700); if (!alive.current) return;
    d.hp = Math.max(0, d.hp - dmg);
    setHit(from === "p" ? "o" : "p"); setMine([...mineL]); setTheirs([...theirsL]);
    const eff = m > 1 ? `Super effective! ${ELEMENTS[a.sp.element].why}` : m < 1 ? `Not very effective... ${ELEMENTS[d.sp.element].why}` : "";
    setLog(`${d.name} takes ${dmg}! ${eff}`); if (m > 1) say("Super effective!");
    await sleep(900); if (!alive.current) return; setHit(null);
  }

  async function act(kind: "attack" | "guard" | "cheer") {
    if (busy) return; setBusy(true);
    const mineL = mine.map((f) => ({ ...f })), theirsL = theirs.map((f) => ({ ...f }));
    let p = pi, o = oi;
    const me = mineL[p];
    if (kind === "attack") await strike("p", mineL, theirsL, p, o);
    else if (kind === "guard") { guard.current.p = true; me.hp = Math.min(me.max, me.hp + 8); setMine([...mineL]); setLog(`${me.name} braces for impact! (+8 spirit)`); await sleep(900); }
    else { buff.current.p = true; setLog(`${me.name} cheers! The next move will be stronger!`); say("Cheer!"); await sleep(900); }
    if (!alive.current) return;

    if (theirsL[o].hp <= 0) {
      setLog(`${theirsL[o].name} needs a rest!`); await sleep(900);
      o++; if (o >= theirsL.length) return finish(true, mineL);
      setOi(o); setLog(`A new challenger: ${theirsL[o].name}!`); await sleep(900);
    } else {
      const r = Math.random();
      const oppKind = r < 0.65 || buff.current.o ? "attack" : r < 0.8 ? "guard" : "cheer";
      const foe = theirsL[o];
      if (oppKind === "attack") await strike("o", mineL, theirsL, p, o);
      else if (oppKind === "guard") { guard.current.o = true; foe.hp = Math.min(foe.max, foe.hp + 8); setTheirs([...theirsL]); setLog(`${foe.name} braces!`); await sleep(900); }
      else { buff.current.o = true; setLog(`${foe.name} cheers!`); await sleep(900); }
      if (!alive.current) return;
      if (mineL[p].hp <= 0) {
        setLog(`${mineL[p].name} needs a nap!`); oops(); await sleep(900);
        p++; if (p >= mineL.length) return finish(false, mineL);
        setPi(p); setLog(`Go, ${mineL[p].name}!`); await sleep(700);
      }
    }
    setMine(mineL); setTheirs(theirsL); setBusy(false);
  }

  function finish(win: boolean, team: Fighter[]) {
    setBusy(false); setWon(win); setPhase("end");
    const ids = team.map((f) => f.oid!).filter(Boolean);
    if (win) {
      chime(); say(`${cheer()} You won the duel!`);
      addBerries(6); gainBond(ids, 3); bump("duel");
      let r = "+6 🍓 and +3 💖 for your team!";
      if (w.duelDay !== todayKey()) { addStar("hazel", 1); r += " First win today: +1 ⭐!"; }
      setWilds((x) => ({ duelDay: todayKey(), duelWins: x.duelWins + 1 }));
      setReward(r);
    } else {
      addBerries(2); gainBond(ids, 1); setReward("So close! +2 🍓 and +1 💖. Try a different team or use Guard and Cheer!"); say("So close! Try again!");
    }
  }

  const bar = (f: Fighter) => (
    <div className="w-full">
      <div className="flex items-center justify-between text-lg font-bold"><span className="truncate"><span className="emoji">{ELEMENTS[f.sp.element].emoji}</span> {f.name}</span><span className="text-sm">{f.hp}/{f.max}</span></div>
      <div className="h-4 overflow-hidden rounded-full bg-black/40"><div className={`h-full transition-all duration-500 ${f.hp / f.max > 0.5 ? "bg-emerald-400" : f.hp / f.max > 0.25 ? "bg-yellow-300" : "bg-red-500"}`} style={{ width: `${(f.hp / f.max) * 100}%` }} /></div>
    </div>
  );

  if (phase === "pick") {
    return (
      <div className="relative flex h-full flex-col gap-2 bg-night p-3">
        <div className="flex items-center justify-between"><Back onClick={onBack} /><p className="text-2xl font-bold">⚔️ Friendly Duel</p><button onClick={() => setChart(true)} className="rounded-2xl bg-white/90 px-3 py-2 text-lg font-bold text-indigo-900 active:scale-95">❓ Who beats who?</button></div>
        <p className="text-center text-lg">Pick up to 3 friends. Use <b>Super effective</b> moves to win!</p>
        <div className="grid flex-1 grid-cols-3 content-start gap-2 overflow-y-auto sm:grid-cols-5">
          {w.owned.map((o) => {
            const on = sel.includes(o.id); const st = stageFor(o.xp);
            return (
              <button key={o.id} onClick={() => toggle(o.id)} className={`relative rounded-2xl p-1 text-center active:scale-95 ${on ? "bg-yellow-300/40 ring-4 ring-yellow-300" : "bg-white/10"}`}>
                <Creature species={SPECIES_BY_ID[o.sp]} stage={st} shiny={o.shiny} seed={o.seed} personality={o.pers} className="mx-auto h-20 w-20" />
                <p className="truncate text-sm font-bold">{o.name}</p>
                <p className="text-xs"><span className="emoji">{ELEMENTS[SPECIES_BY_ID[o.sp].element].emoji}</span> Form {st}</p>
                {on && <span className="absolute right-1 top-1 rounded-full bg-yellow-300 px-2 text-sm font-bold text-black">{sel.indexOf(o.id) + 1}</span>}
              </button>
            );
          })}
        </div>
        <button onClick={start} disabled={sel.length === 0} className="mx-auto rounded-3xl bg-yellow-300 px-10 py-3 text-3xl font-bold text-black shadow-xl active:scale-95 disabled:opacity-40">⚔️ Start duel! ({sel.length})</button>
        {chart && <Chart onClose={() => setChart(false)} />}
      </div>
    );
  }

  const me = mine[pi], foe = theirs[oi];
  return (
    <div className="relative flex h-full flex-col gap-2 bg-night p-3">
      <div className="flex items-center justify-between"><Back onClick={onBack} label="◀ Leave" /><button onClick={() => setChart(true)} className="rounded-2xl bg-white/90 px-3 py-2 text-lg font-bold text-indigo-900 active:scale-95">❓ Who beats who?</button></div>
      {phase === "fight" && me && foe && (
        <>
          <div className="grid min-h-0 flex-1 grid-cols-2 items-center gap-3">
            <div className="flex flex-col items-center gap-1"><div className={hit === "p" ? "anim-shake" : "anim-bob"}><Creature species={me.sp} stage={me.stage} shiny={me.shiny} seed={me.seed} personality={me.pers} mood={me.hp <= 0 ? "sleep" : "happy"} className="h-40 w-40 sm:h-48 sm:w-48" /></div>{bar(me)}<p className="text-xs text-white/70">Team {mine.filter((f) => f.hp > 0).length}/{mine.length} ready</p></div>
            <div className="flex flex-col items-center gap-1"><div className={hit === "o" ? "anim-shake" : "anim-bob"}><Creature species={foe.sp} stage={foe.stage} seed={foe.seed} personality={foe.pers} mood={foe.hp <= 0 ? "sleep" : "happy"} className="h-40 w-40 sm:h-48 sm:w-48" /></div>{bar(foe)}<p className="text-xs text-white/70">Their team {theirs.filter((f) => f.hp > 0).length}/{theirs.length}</p></div>
          </div>
          <p className="min-h-[3.2rem] rounded-2xl bg-black/40 px-3 py-2 text-center text-lg font-bold">{log}</p>
          <div className="flex gap-2">
            <button onClick={() => act("attack")} disabled={busy} className="flex-[2] rounded-2xl px-2 py-3 text-xl font-bold text-black shadow-lg active:scale-95 disabled:opacity-50" style={{ background: ELEMENTS[me.sp.element].color }}><span className="emoji">{ELEMENTS[me.sp.element].emoji}</span> {ELEMENTS[me.sp.element].move}</button>
            <button onClick={() => act("guard")} disabled={busy} className="flex-1 rounded-2xl bg-sky-200 px-2 py-3 text-lg font-bold text-sky-950 shadow-lg active:scale-95 disabled:opacity-50"><span className="emoji">🛡️</span> Guard<span className="block text-xs font-normal">half damage, heal</span></button>
            <button onClick={() => act("cheer")} disabled={busy} className="flex-1 rounded-2xl bg-pink-200 px-2 py-3 text-lg font-bold text-pink-950 shadow-lg active:scale-95 disabled:opacity-50"><span className="emoji">🎉</span> Cheer<span className="block text-xs font-normal">next move +50%</span></button>
          </div>
        </>
      )}
      {phase === "end" && (
        <div className="anim-pop flex flex-1 flex-col items-center justify-center gap-3 text-center">
          {won && <Burst emojis={["⭐", "🏆", "💖", "✨"]} />}
          <p className="text-4xl font-bold">{won ? "🏆 You won!" : "Good duel!"}</p>
          <p className="max-w-md text-xl">{reward}</p>
          <div className="flex gap-3">
            <button onClick={() => { setPhase("pick"); setSel(sel); }} className="rounded-2xl bg-yellow-300 px-6 py-3 text-2xl font-bold text-black active:scale-95">Duel again</button>
            <button onClick={onBack} className="rounded-2xl bg-white/90 px-6 py-3 text-2xl font-bold text-indigo-900 active:scale-95">Back to map</button>
          </div>
        </div>
      )}
      {chart && <Chart onClose={() => setChart(false)} />}
    </div>
  );
}
