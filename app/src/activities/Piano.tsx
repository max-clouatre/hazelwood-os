import { useMemo, useState } from "react";
import { useStore } from "../lib/store";
import { pianoNote } from "../lib/piano";
import { say } from "../lib/speech";
import { Keyboard, layoutOf, PianoStage } from "./piano/Keyboard";
import { LessonPlayer } from "./piano/LessonPlayer";
import { LESSONS } from "./piano/lessons";
import type { Lesson } from "./piano/lessons";
import { loadMine, loadProgress } from "./piano/progress";
import { MySongsAdmin } from "./piano/MySongs";
import { SongPlayer } from "./piano/SongPlayer";
import type { PlaySong } from "./piano/SongPlayer";
import { CATS, SONGS } from "./piano/songs";
import type { ActivityProps } from "./types";

type View = { n: "menu" } | { n: "free" } | { n: "lessons" } | { n: "lesson"; lesson: Lesson } | { n: "cats" } | { n: "songs"; cat: string } | { n: "song"; song: PlaySong; back: string };
void Keyboard; void layoutOf;

/** Piano: free play, short lessons, and songs to follow or play along with (falling notes). */
export default function Piano({ profile }: ActivityProps) {
  const { sound } = useStore();
  const [view, setView] = useState<View>({ n: "menu" });
  const [oct, setOct] = useState(4);
  const [rainbow, setRainbow] = useState(true);
  const [letters, setLetters] = useState(true);
  const [lit, setLit] = useState<ReadonlySet<number>>(new Set());
  const [prog, setProg] = useState(loadProgress());
  const [mine, setMine] = useState(loadMine());
  const refresh = () => { setProg(loadProgress()); setMine(loadMine()); };
  const mineSongs: PlaySong[] = useMemo(() => mine.map((m) => ({ id: m.id, title: m.title, emoji: "✏️", bpm: m.bpm, notes: m.notes })), [mine]);
  const banner = !sound && <p className="bg-yellow-300 px-3 py-1 text-center text-lg font-bold text-black">🔇 Sound is off. Tap the speaker at the top to hear the piano!</p>;
  const tile = "flex flex-col items-center justify-center gap-1 rounded-3xl p-4 text-white shadow-xl active:scale-95";

  if (view.n === "lesson") return <LessonPlayer lesson={view.lesson} profile={profile} onExit={() => { refresh(); setView({ n: "lessons" }); }} onDone={refresh} />;
  if (view.n === "song") return <SongPlayer key={view.song.id} song={view.song} profile={profile} onExit={() => { refresh(); setView({ n: "songs", cat: view.back }); }} />;

  if (view.n === "free") {
    const lo = 12 * (oct + 1), hi = lo + 24;
    const press = (m: number) => { pianoNote(m, 0.8); setLit((s) => new Set(s).add(m)); window.setTimeout(() => setLit((s) => { const n = new Set(s); n.delete(m); return n; }), 220); };
    return (
      <div className="flex h-full flex-col bg-[#2b2d62]" data-testid="free-play">
        {banner}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2 pt-2">
          <button onClick={() => setView({ n: "menu" })} className="rounded-xl bg-white/90 px-3 py-1 text-lg font-bold text-purple-900 active:scale-95">◀ Piano</button>
          <p className="text-xl font-bold">🎹 Free Play</p>
          <span className="flex gap-1.5">
            <button onClick={() => setOct(Math.max(2, oct - 1))} aria-label="Lower notes" className="rounded-xl bg-white/20 px-3 py-1 text-lg font-bold active:scale-95">◀ Low</button>
            <button onClick={() => setOct(Math.min(5, oct + 1))} aria-label="Higher notes" className="rounded-xl bg-white/20 px-3 py-1 text-lg font-bold active:scale-95">High ▶</button>
            <button onClick={() => setRainbow(!rainbow)} aria-pressed={rainbow} aria-label="Rainbow colors" className={`rounded-xl px-3 py-1 text-lg font-bold active:scale-95 ${rainbow ? "bg-mustard text-black" : "bg-white/20"}`}>🌈</button>
            <button onClick={() => setLetters(!letters)} aria-pressed={letters} aria-label="Letters" className={`rounded-xl px-3 py-1 text-lg font-bold active:scale-95 ${letters ? "bg-mustard text-black" : "bg-white/20"}`}>ABC</button>
          </span>
        </div>
        <p className="px-3 py-1 text-center text-base text-white/80">Touch the keys to play. Try two fingers at once!</p>
        <div className="flex-1" />
        <PianoStage lo={lo} hi={hi} minKw={40} keyH={230} kb={{ onDown: press, lit, rainbow, letters }} />
        <div className="h-2" />
      </div>
    );
  }

  if (view.n === "lessons") return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto bg-[#2b2d62] p-3">
      <div className="flex items-center justify-between"><button onClick={() => setView({ n: "menu" })} className="rounded-xl bg-white/90 px-3 py-1 text-lg font-bold text-purple-900 active:scale-95">◀ Piano</button><p className="text-2xl font-bold">🎓 Lessons</p><span className="w-20" /></div>
      <div className="mx-auto grid w-full max-w-3xl gap-2 sm:grid-cols-2" data-testid="lesson-list">
        {LESSONS.map((l, i) => (
          <button key={l.id} onClick={() => { setView({ n: "lesson", lesson: l }); }} aria-label={`Lesson ${i + 1}: ${l.title}`} className="flex items-center gap-3 rounded-2xl bg-white/90 p-3 text-left text-emerald-950 shadow-lg active:scale-95">
            <span className="emoji text-4xl">{l.emoji}</span><span className="min-w-0 flex-1 leading-tight"><span className="block text-lg font-bold">{i + 1}. {l.title}</span><span className="text-sm">{l.blurb}</span></span>
            {prog.lessons.includes(l.id) && <span className="emoji text-3xl">✅</span>}
          </button>
        ))}
      </div>
    </div>
  );

  if (view.n === "cats") return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto bg-[#2b2d62] p-3 text-center">
      <div className="flex items-center justify-between"><button onClick={() => setView({ n: "menu" })} className="rounded-xl bg-white/90 px-3 py-1 text-lg font-bold text-purple-900 active:scale-95">◀ Piano</button><p className="text-2xl font-bold">🎵 Songs</p><span className="w-20" /></div>
      <div className="mx-auto grid w-full max-w-3xl grid-cols-2 gap-3" data-testid="song-cats">
        {CATS.map((c) => <button key={c.id} onClick={() => { setView({ n: "songs", cat: c.id }); say(c.name); }} aria-label={`Songs: ${c.name}`} className={tile} style={{ background: c.color }}><span className="emoji text-6xl">{c.emoji}</span><span className="text-2xl font-bold">{c.name}</span></button>)}
      </div>
    </div>
  );

  if (view.n === "songs") {
    const c = CATS.find((x) => x.id === view.cat)!;
    const list: PlaySong[] = view.cat === "mine" ? mineSongs : SONGS.filter((s) => s.cat === view.cat);
    return (
      <div className="flex h-full flex-col gap-2 overflow-y-auto bg-[#2b2d62] p-3">
        <div className="flex items-center justify-between"><button onClick={() => setView({ n: "cats" })} aria-label="Back to categories" className="rounded-xl bg-white/90 px-3 py-1 text-lg font-bold text-purple-900 active:scale-95">◀ Songs</button><p className="text-2xl font-bold"><span className="emoji">{c.emoji}</span> {c.name}</p><span className="w-20" /></div>
        {c.note && <p className="text-center text-base text-white/80">{c.note}</p>}
        <div className="mx-auto grid w-full max-w-3xl gap-2 sm:grid-cols-2" data-testid="song-list">
          {list.map((s) => (
            <button key={s.id} onClick={() => setView({ n: "song", song: s, back: view.cat })} aria-label={`Song: ${s.title}`} className="flex items-center gap-3 rounded-2xl bg-white/90 p-3 text-left text-emerald-950 shadow-lg active:scale-95">
              <span className="emoji text-4xl">{s.emoji}</span><span className="min-w-0 flex-1 leading-tight"><span className="block truncate text-lg font-bold">{s.title}</span>{"blurb" in s && (s as { blurb?: string }).blurb && <span className="text-sm">{(s as { blurb?: string }).blurb}</span>}</span>
              {prog.songs.includes(s.id) && <span className="emoji text-3xl">✅</span>}
            </button>
          ))}
          {list.length === 0 && <p className="col-span-full text-center text-lg">No songs here yet. A grown-up can add one below!</p>}
        </div>
        {view.cat === "mine" && <MySongsAdmin onChange={refresh} />}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center gap-3 overflow-y-auto bg-[#2b2d62] p-4 text-center">
      {banner}
      <p className="text-4xl font-bold drop-shadow">🎹 Piano</p>
      <div className="grid w-full max-w-3xl gap-3 sm:grid-cols-3" data-testid="piano-menu">
        <button onClick={() => { setView({ n: "free" }); say("Free play!"); }} aria-label="Free Play" className={tile} style={{ background: "#e58a3f" }}><span className="emoji text-6xl">🎹</span><span className="text-2xl font-bold">Free Play</span><span className="text-base">Touch and make music</span></button>
        <button onClick={() => { setView({ n: "lessons" }); say("Lessons!"); }} aria-label="Lessons" className={tile} style={{ background: "#3f8fd0" }}><span className="emoji text-6xl">🎓</span><span className="text-2xl font-bold">Lessons</span><span className="text-base">Learn step by step</span></button>
        <button onClick={() => { setView({ n: "cats" }); say("Songs!"); }} aria-label="Songs" className={tile} style={{ background: "#9b5fc0" }}><span className="emoji text-6xl">🎵</span><span className="text-2xl font-bold">Songs</span><span className="text-base">Play along!</span></button>
      </div>
    </div>
  );
}
