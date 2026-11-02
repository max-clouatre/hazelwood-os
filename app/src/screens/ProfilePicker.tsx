import { useEffect, useRef, useState } from "react";
import { ParentArea } from "../components/ParentArea";
import { ParentGate } from "../components/ParentGate";
import { unlockAudio } from "../lib/audio";
import { say } from "../lib/speech";
import { useStore } from "../lib/store";
import { BUILD, checkQuietly, useUpdateInfo } from "../lib/update";
import type { ProfileId } from "../lib/store";

export const PROFILES: Record<ProfileId, { name: string; emoji: string; bg: string; card: string }> = {
  hazel: { name: "Hazel", emoji: "🦄", bg: "bg-forest", card: "bg-[#9bd17f]" },
  violet: { name: "Violet", emoji: "🐱", bg: "bg-plum", card: "bg-[#f4a0bd]" },
};

export function ProfilePicker({ onPick }: { onPick: (p: ProfileId) => void }) {
  const { stars } = useStore();
  const [step, setStep] = useState<"idle" | "gate" | "area">("idle");
  const hold = useRef<number>();
  const newer = useUpdateInfo();
  useEffect(() => { void checkQuietly(); const t = setInterval(() => void checkQuietly(), 30 * 60 * 1000); return () => { clearInterval(t); window.clearTimeout(hold.current); }; }, []);
  const stop = () => window.clearTimeout(hold.current);
  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-6 bg-night p-6">
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
              className={`flex h-72 w-64 flex-col items-center justify-center rounded-[2.5rem] ${p.card} shadow-2xl active:scale-95`}>
              <span className="emoji anim-bob text-[8rem] leading-none">{p.emoji}</span>
              <span className="mt-3 text-5xl font-bold text-white drop-shadow">{p.name}</span>
              <span className="mt-1 text-2xl text-white/90"><span className="emoji">⭐</span> {stars[id]}</span>
            </button>
          );
        })}
      </div>
      <button onClick={() => setStep("gate")} aria-label="Grown-up settings" className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/15 px-3 py-2 text-base font-bold active:scale-95">
        <span className="emoji text-2xl">⚙️</span> Grown-ups{newer && <span className="ml-1 rounded-full bg-yellow-300 px-2 text-sm text-black">update!</span>}
      </button>
      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] text-white/40">version {BUILD}</p>
      {step === "gate" && <ParentGate onPass={() => setStep("area")} onCancel={() => setStep("idle")} />}
      {step === "area" && <ParentArea onClose={() => setStep("idle")} />}
    </div>
  );
}
