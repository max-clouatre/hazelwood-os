import { useEffect, useState } from "react";
import { unlockAudio } from "../lib/audio";
import { playTheme, renderTheme, stopMusic, THEMES } from "../lib/music";
import type { ThemeId } from "../lib/music";
import { update, useStore } from "../lib/store";

type Stat = { peak: number; rms: number; seconds: number; activeShare: number };
/** Developer page: open the app address followed by #music to listen to each song and see its sound levels. */
export default function MusicLab() {
  const { music, sound } = useStore();
  const [stats, setStats] = useState<Partial<Record<ThemeId, Stat>>>({});
  const [playing, setPlaying] = useState<string>("");
  const ids = Object.keys(THEMES) as ThemeId[];
  useEffect(() => {
    let alive = true;
    (async () => { for (const id of ids) { const s = await renderTheme(id, 8); if (!alive) return; setStats((p) => ({ ...p, [id]: s })); } })();
    return () => { alive = false; stopMusic(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="h-full overflow-auto bg-night p-3">
      <h1 className="text-2xl font-bold">Music Lab</h1>
      <p className="mb-2 text-sm text-white/70">Tap play to listen. Levels are measured by rendering 8 bars of each song. (peak should stay under 1.0)</p>
      <div className="mb-3 flex gap-2">
        <button onClick={() => update(() => ({ sound: !sound }))} className="rounded-xl bg-white/20 px-3 py-2">Sound: {sound ? "on" : "off"}</button>
        <button onClick={() => update(() => ({ music: !music }))} className="rounded-xl bg-white/20 px-3 py-2">Music: {music ? "on" : "off"}</button>
        <button onClick={() => { stopMusic(); setPlaying(""); }} className="rounded-xl bg-red-400 px-3 py-2 font-bold text-black">⏹ Stop</button>
      </div>
      {ids.map((id) => {
        const s = stats[id];
        return (
          <div key={id} className="mb-2 flex items-center gap-3 rounded-2xl bg-white/10 p-2">
            <button onClick={() => { unlockAudio(); playTheme(id); setPlaying(id); }} className={`rounded-xl px-4 py-2 text-xl font-bold ${playing === id ? "bg-yellow-300 text-black" : "bg-white text-black"}`}>▶ {id}</button>
            <button onClick={() => { unlockAudio(); playTheme(id, true); setPlaying(id + "!"); }} className="rounded-xl bg-white/80 px-3 py-2 text-black">▶ faster</button>
            <div className="min-w-0 flex-1 text-sm"><b>{THEMES[id].label}</b> · {THEMES[id].bpm} bpm
              <div data-stat={id} className="text-white/70">{s ? `peak ${s.peak.toFixed(2)} · avg ${s.rms.toFixed(3)} · ${s.seconds.toFixed(0)}s · sounding ${(s.activeShare * 100).toFixed(0)}% of the time` : "measuring..."}</div></div>
          </div>
        );
      })}
    </div>
  );
}
