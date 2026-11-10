import { useEffect, useMemo, useRef, useState } from "react";
import { Burst } from "../components/Burst";
import { chime, oops } from "../lib/audio";
import { cheer, say } from "../lib/speech";
import { addStar, noteSpellingResult } from "../lib/store";
import type { ProfileId } from "../lib/store";
import { shuffle } from "../lib/util";

const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
interface Result { word: string; typed: string; right: boolean }

/** Test Me: every word on the list, once each, in a fresh random order. She hears the word and types it from a full keyboard
 *  (no tiles, no hints, no spoken letters), one try per word. Right/wrong is remembered so Practice repeats the missed ones. */
export function SpellingTest({ words, profile, onPractice }: { words: string[]; profile: ProfileId; onPractice: () => void }) {
  const list = useMemo(() => Array.from(new Set(words)), [words]);
  const [order, setOrder] = useState(() => shuffle(list));
  const [i, setI] = useState(0);
  const [typed, setTyped] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [feedback, setFeedback] = useState<null | { right: boolean; word: string }>(null);
  const [burst, setBurst] = useState(0);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => () => { timers.current.forEach(clearTimeout); window.speechSynthesis?.cancel?.(); }, []);

  const finished = i >= order.length;
  const word = order[i];
  useEffect(() => { if (!finished && word) say(word, 0.8); }, [i, finished]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (finished && results.length === order.length) {
      const got = results.filter((r) => r.right).length;
      say(got === order.length ? `${cheer()} Every word right!` : `You got ${got} out of ${order.length}.`);
      if (got === order.length) { chime(); setBurst((b) => b + 1); addStar(profile, 3); }
    }
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const press = (ch: string) => { if (feedback || finished || typed.length >= 16) return; setTyped((t) => t + ch); };
  const check = () => {
    if (feedback || finished || !typed) return;
    const right = typed.trim().toLowerCase() === word.toLowerCase();
    noteSpellingResult(word, !right);
    setResults((r) => [...r, { word, typed, right }]);
    setFeedback({ right, word });
    if (right) { chime(); addStar(profile); say("Correct!", 0.95); } else { oops(); say(`The word is ${word}. ${word.split("").join(" ")}.`, 0.8); }
    later(() => { setFeedback(null); setTyped(""); setI((n) => n + 1); }, right ? 1300 : 3200);
  };
  const again = () => { setOrder(shuffle(list)); setI(0); setTyped(""); setResults([]); setFeedback(null); };

  if (finished) {
    const got = results.filter((r) => r.right).length; const missed = results.filter((r) => !r.right);
    return (
      <div className="relative flex h-full flex-col items-center justify-center gap-3 overflow-y-auto p-4 text-center" data-testid="test-result">
        <p className="text-4xl font-bold" data-testid="test-score">You got {got} out of {order.length}!</p>
        {got === order.length ? <p className="text-2xl">🌟 Every word right! Bonus ⭐⭐⭐</p> : <p className="text-xl">Words to practice:</p>}
        {missed.length > 0 && (
          <div className="flex max-w-xl flex-wrap justify-center gap-2" data-testid="test-missed">
            {missed.map((m) => <span key={m.word} className="rounded-2xl bg-white/90 px-4 py-2 text-xl font-bold text-purple-800">{m.word}<span className="block text-sm font-normal text-red-600">you wrote: {m.typed || "(nothing)"}</span></span>)}
          </div>
        )}
        <div className="flex gap-3"><button onClick={again} className="rounded-2xl bg-mustard px-6 py-3 text-2xl font-bold text-black shadow-xl active:scale-95">📝 Test again</button><button onClick={onPractice} className="rounded-2xl bg-white px-6 py-3 text-2xl font-bold text-purple-800 shadow-xl active:scale-95">🦄 Practice</button></div>
        {burst > 0 && <Burst key={burst} emojis={["⭐", "🦄", "🌈", "✨"]} />}
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col items-center justify-between px-3 pb-3" data-testid="test-play">
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        <p className="rounded-full bg-black/30 px-4 py-1 text-xl font-bold" data-testid="test-progress">Word {i + 1} of {order.length}</p>
        <button onClick={() => say(word, 0.75)} aria-label="Hear the word" className="rounded-2xl bg-white/90 px-6 py-3 text-2xl font-bold text-purple-700 shadow-lg active:scale-95"><span className="emoji">🔊</span> Hear it again</button>
      </div>
      <div className="sp-box flex min-h-[5.5rem] w-full max-w-xl items-center justify-center rounded-2xl border-4 border-dashed border-white/60 bg-white/10 px-3" aria-label="Your spelling">
        <span className="break-all text-5xl font-bold tracking-widest" data-testid="test-typed">{typed}</span>
        {!feedback && <span className="ml-1 inline-block h-10 w-1 animate-pulse bg-white" />}
      </div>
      <p className={`h-10 text-3xl font-bold ${feedback?.right ? "text-green-300" : "text-yellow-200"}`} data-testid="test-feedback">{feedback ? (feedback.right ? "✓ Correct!" : `The word is: ${feedback.word}`) : ""}</p>
      <div className="flex w-full max-w-2xl flex-col items-center gap-1.5" data-testid="test-keys">
        {ROWS.map((row, ri) => (
          <div key={row} className="flex w-full justify-center gap-1">
            {row.split("").map((ch) => <button key={ch} data-key={ch} onClick={() => press(ch)} className="sp-key h-14 min-w-0 flex-1 rounded-xl bg-fuchsia-100 text-3xl font-bold text-fuchsia-800 shadow-lg active:scale-90 sm:h-16">{ch}</button>)}
            {ri === 2 && <button onClick={() => !feedback && setTyped((t) => t.slice(0, -1))} aria-label="Delete a letter" className="sp-key emoji h-14 flex-[1.4] rounded-xl bg-white/25 text-3xl active:scale-90 sm:h-16">⌫</button>}
          </div>
        ))}
        <button onClick={check} disabled={!typed || !!feedback} aria-label="Check my word" className={`sp-done mt-1 w-full max-w-sm rounded-2xl py-3 text-3xl font-bold shadow-xl active:scale-95 ${typed && !feedback ? "bg-mustard text-black ring-4 ring-white" : "bg-white/20 text-white/60"}`}>✓ Done</button>
      </div>
    </div>
  );
}
