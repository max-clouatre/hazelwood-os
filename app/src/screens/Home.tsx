import { ACTIVITIES } from "../activities/registry";
import { TopBar } from "../components/TopBar";
import { say } from "../lib/speech";
import type { ProfileId } from "../lib/store";
import { PROFILES } from "./ProfilePicker";

export function Home({ profile, onOpen, onHome }: { profile: ProfileId; onOpen: (id: string) => void; onHome: () => void }) {
  const p = PROFILES[profile];
  const mine = ACTIVITIES.filter((a) => a.profiles.includes(profile));
  return (
    <div className={`flex h-full flex-col bg-gradient-to-br ${p.bg}`}>
      <TopBar profile={profile} title={`Hi ${p.name}! ${p.emoji}`} onHome={onHome} />
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-4">
        <div className="grid w-full max-w-4xl grid-cols-2 gap-5 sm:grid-cols-3">
          {mine.map((a) => (
            <button key={a.id} onClick={() => { say(a.title); onOpen(a.id); }}
              className={`flex aspect-square flex-col items-center justify-center rounded-[2rem] bg-gradient-to-br ${a.color} p-3 shadow-2xl active:scale-95`}>
              <span className="emoji text-7xl sm:text-8xl">{a.emoji}</span>
              <span className="mt-2 text-center text-xl font-bold leading-tight drop-shadow sm:text-2xl">{a.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
