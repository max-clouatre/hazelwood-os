import { useEffect, useMemo, useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime, oops } from "../lib/audio";
import { cheer, say } from "../lib/speech";
import { readAloud, sentenceOf, STARTS } from "../lib/spellinglists";
import { addStar, noteSpellingResult } from "../lib/store";
import type { ProfileId } from "../lib/store";
import { shuffle } from "../lib/util";

/** Starts: the beginning of the word is hidden and she picks it from look-alike choices (kn / n / gn, wr / r, wh / w, qu / kw / q).
 *  Every word on the list that has a tricky start comes up exactly once. She can try again until it is right; the first try is what is scored. */
export function SpellingStarts({ words, profile, onPractice }: { words: string[]; profile: ProfileId; onPractice: () => void }) {
  const list = useMemo(() => Array.from(new Set(words)).filter((w) => STARTS[w]), [words]);
  const [order, setOrder] = useState(() => shuffle(list));
  const [i, setI] = useState(0);
  const [tried, setTried] = useState<string[]>([]);   // wrong picks for this word
  const [done, setDone] = useState(false);             // this word solved
  const [firstTry, setFirstTry] = useState<boolean[]>([]);
  const [burst, setBurst] = useState(0);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => () => { timers.current.forEach(clearTimeout); window.speechSynthesis?.cancel?.(); }, []);
  const finished = i >= order.length;
  const word = order[i]; const def = word ? STARTS[word] : undefined;
  const options = useMemo(() => (def ? shuffle(def.options) : []), [word]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!finished && word) say(readAloud(word), 0.8); }, [i, finished]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (finished && order.length && firstTry.length === order.length) {
      const got = firstTry.filter(Boolean).length;
      say(got === order.length ? `${cheer()} Every start right!` : `You got ${got} out of ${order.length} on the first try.`);
      if (got === order.length) { chime(); setBurst((b) => b + 1); addStar(profile, 2); }
    }
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (o: string) => {
    if (done || !def || tried.includes(o)) return;
    if (o === def.start) {
      const first = tried.length === 0;
      setDone(true); chime(); addStar(profile); noteSpellingResult(word, !first); setFirstTry((f) => [...f, first]);
      say(`${word}! ${cheer()}`, 0.9);
      later(() => { setI((n) => n + 1); setTried([]); setDone(false); }, 1800);
    } else { setTried((t) => [...t, o]); oops(); if (tried.length === 0) say("Not quite. Listen again.", 0.9); }
  };
  const again = () => { setOrder(shuffle(list)); setI(0); setTried([]); setDone(false); setFirstTry([]); };

  if (!list.length) return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center" data-testid="starts-empty">
      <p className="text-2xl font-bold">Starts uses the words that begin with kn, wr, wh or qu.</p>
      <p className="text-lg">None of the words on this list do, so try Practice or Test Me.</p>
      <button onClick={onPractice} className="rounded-2xl bg-white px-6 py-3 text-2xl font-bold text-purple-800 shadow-xl active:scale-95">🦄 Practice</button>
    </div>
  );

  if (finished) {
    const got = firstTry.filter(Boolean).length; const missed = order.filter((_, k) => !firstTry[k]);
    return (
      <div className="relative flex h-full flex-col items-center justify-center gap-3 overflow-y-auto p-4 text-center" data-testid="starts-result">
        <p className="text-4xl font-bold" data-testid="starts-score">You got {got} out of {order.length} on the first try!</p>
        {missed.length === 0 ? <p className="text-2xl">🌟 Every start right! Bonus ⭐⭐</p> : <p className="text-xl">Words to look at again:</p>}
        {missed.length > 0 && <div className="flex max-w-xl flex-wrap justify-center gap-2">{missed.map((m) => <span key={m} className="rounded-2xl bg-white/90 px-4 py-2 text-xl font-bold text-purple-800">{m}</span>)}</div>}
        <div className="flex gap-3"><button onClick={again} className="rounded-2xl bg-mustard px-6 py-3 text-2xl font-bold text-black shadow-xl active:scale-95">🔤 Again</button><button onClick={onPractice} className="rounded-2xl bg-white px-6 py-3 text-2xl font-bold text-purple-800 shadow-xl active:scale-95">🦄 Practice</button></div>
        {burst > 0 && <Burst key={burst} emojis={["⭐", "🦄", "🌈", "✨"]} />}
      </div>
    );
  }

  const sentence = sentenceOf(word) ?? ""; const at = sentence.toLowerCase().indexOf(word); const before = at >= 0 ? sentence.slice(0, at) : ""; const after = at >= 0 ? sentence.slice(at + word.length) : "";
  return (
    <div className="relative flex h-full flex-col items-center justify-between px-3 pb-3" data-testid="starts-play">
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        <p className="rounded-full bg-black/30 px-4 py-1 text-xl font-bold" data-testid="starts-progress">Word {i + 1} of {order.length}</p>
        <button onClick={() => say(readAloud(word), 0.75)} aria-label="Hear the word" className="rounded-2xl bg-white/90 px-6 py-3 text-2xl font-bold text-purple-700 shadow-lg active:scale-95"><span className="emoji">🔊</span> Hear it again</button>
      </div>
      <p className="max-w-2xl text-center text-xl" data-testid="starts-sentence">{before}<b>{done ? word : `__${def!.rest}`}</b>{after}</p>
      <div className="flex items-center justify-center gap-1 text-6xl font-bold tracking-wide" data-testid="starts-word">
        <span className={`inline-flex h-20 min-w-[5.5rem] items-center justify-center rounded-2xl border-4 px-2 ${done ? "anim-pop border-yellow-300 bg-white text-purple-700" : "border-dashed border-white/70"}`}>{done ? def!.start : ""}</span><span>{def!.rest}</span>
      </div>
      <p className="h-8 text-2xl font-bold text-yellow-200" data-testid="starts-hint">{done ? "✓ Yes!" : tried.length ? "Try another one!" : "Pick how the word starts."}</p>
      <div className="flex flex-wrap justify-center gap-3" data-testid="starts-options">
        {options.map((o) => <button key={o} onClick={() => pick(o)} disabled={done || tried.includes(o)} aria-label={`Starts with ${o}`} className={`h-20 min-w-[5.5rem] rounded-2xl px-6 text-5xl font-bold shadow-lg active:scale-90 ${tried.includes(o) ? "bg-red-200 text-red-800 opacity-60" : "bg-fuchsia-100 text-fuchsia-800"}`}>{o}</button>)}
      </div>
    </div>
  );
}
