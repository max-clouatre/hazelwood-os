import { useEffect, useRef, useState } from "react";
import { ParentArea } from "../components/ParentArea";
import { ParentGate } from "../components/ParentGate";
import { unlockAudio } from "../lib/audio";
import { say } from "../lib/speech";
import { useStore } from "../lib/store";
import type { ProfileId } from "../lib/store";

export const PROFILES: Record<ProfileId, { name: string; emoji: string; bg: string; card: string }> = {
  hazel: { name: "Hazel", emoji: "🦄", bg: "from-purple-700 via-fuchsia-600 to-pink-500", card: "from-fuchsia-300 to-purple-400" },
  violet: { name: "Violet", emoji: "🐱", bg: "from-pink-500 via-rose-400 to-amber-300", card: "from-pink-300 to-rose-400" },
};

export function ProfilePicker({ onPick }: { onPick: (p: ProfileId) => void }) {
  const { stars } = useStore();
  const [step, setStep] = useState<"idle" | "gate" | "area">("idle");
  const hold = useRef<number>();
  useEffect(() => () => window.clearTimeout(hold.current), []);
  const stop = () => window.clearTimeout(hold.current);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 bg-gradient-to-br from-indigo-900 via-purple-800 to-fuchsia-700 p-6">
      {/* Long-press the title for 1.5s to reach the grown-up area. */}
      <h1 onPointerDown={() => { hold.current = window.setTimeout(() => setStep("gate"), 1500); }}
        onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
        className="text-center text-4xl font-bold drop-shadow sm:text-5xl">Who is playing?</h1>
      <div className="flex w-full max-w-3xl flex-wrap justify-center gap-6">
        {(Object.keys(PROFILES) as ProfileId[]).map((id) => {
          const p = PROFILES[id];
          return (
            <button key={id}
              onClick={() => { unlockAudio(); say(`Hi ${p.name}!`); onPick(id); }}
              className={`flex h-72 w-64 flex-col items-center justify-center rounded-[2.5rem] bg-gradient-to-br ${p.card} shadow-2xl active:scale-95`}>
              <span className="emoji anim-bob text-[8rem] leading-none">{p.emoji}</span>
              <span className="mt-3 text-5xl font-bold text-white drop-shadow">{p.name}</span>
              <span className="mt-1 text-2xl text-white/90"><span className="emoji">⭐</span> {stars[id]}</span>
            </button>
          );
        })}
      </div>
      {step === "gate" && <ParentGate onPass={() => setStep("area")} onCancel={() => setStep("idle")} />}
      {step === "area" && <ParentArea onClose={() => setStep("idle")} />}
    </div>
  );
}
