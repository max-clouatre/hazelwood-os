import { ACTIVITIES } from "../activities/registry";
import { titleOf } from "../activities/types";
import { TopBar } from "../components/TopBar";
import { say } from "../lib/speech";
import { useStore } from "../lib/store";
import type { ProfileId } from "../lib/store";
import { STARS_PER_STICKER } from "../lib/stickers";
import { PROFILES } from "./ProfilePicker";

export function Home({ profile, onOpen, onHome }: { profile: ProfileId; onOpen: (id: string) => void; onHome: () => void }) {
  const p = PROFILES[profile];
  const { stars } = useStore();
  const mine = ACTIVITIES.filter((a) => a.profiles.includes(profile));
  const into = stars[profile] % STARS_PER_STICKER;
  return (
    <div className={`flex h-full flex-col ${p.bg}`}>
      <TopBar profile={profile} title={`Hi ${p.name}! ${p.emoji}`} onHome={onHome} />
      <div className="mx-auto flex items-center gap-2 px-4" aria-label="Progress to next sticker">
        {Array.from({ length: STARS_PER_STICKER }, (_, i) => (
          <span key={i} className={`emoji text-3xl ${i < into ? "" : "opacity-25 grayscale"}`}>⭐</span>
        ))}
        <span className="emoji ml-1 text-3xl">🎁</span>
      </div>
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-4">
        <div className="grid w-full max-w-4xl grid-cols-3 gap-4 sm:grid-cols-4">
          {mine.map((a, i) => (
            <button key={a.id} onClick={() => { say(titleOf(a, profile)); onOpen(a.id); }}
              style={{ animationDelay: `${i * 60}ms` }}
              className={`anim-pop flex aspect-[4/3] flex-col items-center justify-center rounded-[2rem] ${a.color} p-3 shadow-2xl active:scale-95`}>
              <span className="emoji flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-4xl sm:h-20 sm:w-20 sm:text-5xl">{a.emoji}</span>
              <span className="mt-1 text-center text-xl font-bold leading-tight drop-shadow sm:text-2xl">{titleOf(a, profile)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
