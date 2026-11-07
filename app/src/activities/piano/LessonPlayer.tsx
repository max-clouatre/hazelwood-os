import { useEffect, useMemo, useRef, useState } from "react";
import { Burst } from "../../components/Burst";
import { chime, note, oops } from "../../lib/audio";
import { letterOf, parseNote, pianoNote } from "../../lib/piano";
import { addStar } from "../../lib/store";
import type { ProfileId } from "../../lib/store";
import { cheer, say } from "../../lib/speech";
import { PianoStage } from "./Keyboard";
import type { Lesson } from "./lessons";
import { markDone } from "./progress";

/** One lesson: read (and hear) the step, press the glowing keys in order. Mistakes only get a friendlier hint. */
export function LessonPlayer({ lesson, profile, onExit, onDone }: { lesson: Lesson; profile: ProfileId; onExit: () => void; onDone: () => void }) {
  const [si, setSi] = useState(0);     // step
  const [j, setJ] = useState(0);       // key within the step
  const [lit, setLit] = useState<ReadonlySet<number>>(new Set());
  const [hint, setHint] = useState("");
  const [done, setDone] = useState(false);
  const [burst, setBurst] = useState(0);
  const wrong = useRef(0);
  const step = lesson.steps[si];
  const seq = useMemo(() => (step.seq ?? []).map((n) => parseNote(n)!), [step]);
  const glow = useMemo(() => new Set(seq[j] !== undefined ? [seq[j]] : []), [seq, j]);

  useEffect(() => { setJ(0); wrong.current = 0; setHint(""); say(step.text, 0.88); }, [si]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { window.speechSynthesis?.cancel?.(); }, []);

  const nextStep = () => {
    if (si + 1 < lesson.steps.length) { chime(); window.setTimeout(() => setSi(si + 1), 500); return; }
    setDone(true); markDone("lessons", lesson.id); addStar(profile); chime(); setBurst((b) => b + 1); say(`${cheer()} You finished ${lesson.title}!`); onDone();
  };
  const press = (m: number) => {
    pianoNote(m, 0.5); setLit((s) => new Set(s).add(m)); window.setTimeout(() => setLit((s) => { const n = new Set(s); n.delete(m); return n; }), 220);
    if (done) return;
    if (step.any) { const k = j + 1; setJ(k); if (k >= step.any) nextStep(); return; }
    if (m === seq[j]) { wrong.current = 0; setHint(""); const k = j + 1; setJ(k); if (k >= seq.length) nextStep(); }
    else { wrong.current += 1; oops(); setHint(wrong.current >= 2 ? `Try the ${letterOf(seq[j])} key. It is glowing!` : "Almost! Look for the glowing key."); if (wrong.current === 2) say(`Try the ${letterOf(seq[j])} key`, 0.9); }
  };

  return (
    <div className="relative flex h-full flex-col bg-[#2b2d62]" data-testid="lesson-player">
      <div className="flex items-center justify-between gap-2 px-2 pt-2">
        <button onClick={onExit} aria-label="Back to lessons" className="rounded-xl bg-white/90 px-3 py-1 text-lg font-bold text-purple-900 active:scale-95">◀ Lessons</button>
        <p className="min-w-0 flex-1 truncate text-center text-xl font-bold"><span className="emoji">{lesson.emoji}</span> {lesson.title}</p>
        <span className="rounded-full bg-black/30 px-3 py-1 text-lg font-bold">{Math.min(si + 1, lesson.steps.length)}/{lesson.steps.length}</span>
      </div>
      <div className="mx-auto flex max-w-3xl flex-1 flex-col items-center justify-center gap-3 px-3 text-center">
        {!done ? (<>
          <p className="text-2xl font-bold sm:text-3xl" data-testid="lesson-text">{step.text}</p>
          <button onClick={() => say(step.text, 0.88)} aria-label="Hear it again" className="rounded-full bg-white/20 px-4 py-1 text-lg font-bold active:scale-95">🔊 Hear it again</button>
          {seq.length > 0 && <div className="flex flex-wrap justify-center gap-1.5" data-testid="lesson-seq">{seq.map((m, i) => <span key={i} className={`rounded-xl border-[3px] border-ink px-3 py-1 text-2xl font-bold ${i < j ? "bg-emerald-300 text-black" : i === j ? "bg-mustard text-black" : "bg-white/20"}`}>{i < j ? "✓" : letterOf(m)}</span>)}</div>}
          {step.any && <p className="text-xl font-bold" data-testid="lesson-seq">{Math.min(j, step.any)} / {step.any} keys</p>}
          <p className="min-h-[2rem] text-xl font-bold text-yellow-200" data-testid="lesson-hint">{hint}</p>
        </>) : (
          <div className="anim-pop flex flex-col items-center gap-3"><p className="text-4xl font-bold" data-testid="lesson-done">🎉 Lesson complete!</p><p className="text-xl">You earned a star.</p>
            <button onClick={onExit} className="rounded-3xl bg-mustard px-10 py-3 text-2xl font-bold text-black shadow-xl active:scale-95">◀ More lessons</button></div>
        )}
      </div>
      <PianoStage lo={60} hi={72} minKw={38} keyH={170} kb={{ onDown: press, lit, glow: done ? undefined : glow, rainbow: true, letters: true }} />
      <div className="h-2" />
      {burst > 0 && <Burst key={burst} emojis={["⭐", "🎵", "✨"]} />}
      <span className="hidden">{note.length}</span>
    </div>
  );
}
