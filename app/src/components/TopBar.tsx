import { useStore } from "../lib/store";
import type { ProfileId } from "../lib/store";
import { update } from "../lib/store";

export function TopBar({ profile, title, onHome }: { profile: ProfileId; title?: string; onHome: () => void }) {
  const { stars, sound } = useStore();
  return (
    <div className="flex items-center justify-between gap-3 p-3">
      <button onClick={onHome} aria-label="Home"
        className="emoji h-16 w-16 rounded-full bg-white/90 text-3xl text-black shadow-lg active:scale-95">🏠</button>
      {title && <h1 className="truncate text-2xl font-bold drop-shadow sm:text-3xl">{title}</h1>}
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-black/30 px-4 py-2 text-xl font-bold"><span className="emoji">⭐</span> {stars[profile]}</div>
        <button onClick={() => update((s) => ({ sound: !s.sound }))} aria-label="Sound"
          className="emoji h-12 w-12 rounded-full bg-black/30 text-2xl active:scale-95">{sound ? "🔊" : "🔇"}</button>
      </div>
    </div>
  );
}
