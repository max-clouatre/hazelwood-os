import { useEffect } from "react";
import { Burst } from "../components/Burst";
import { chime } from "../lib/audio";
import { say } from "../lib/speech";
import { badgeInfo, setWilds } from "./game";

export function BadgeOverlay({ id }: { id: string }) {
  const b = badgeInfo(id);
  useEffect(() => { chime(); const t = setTimeout(() => say(`New badge! ${b.title}!`), 500); return () => clearTimeout(t); }, [b.title]);
  return (
    <button onClick={() => setWilds(() => ({ newBadge: null }))} className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-black/80 p-4 text-center">
      <Burst emojis={["🏅", "⭐", "✨", "💖"]} />
      <p className="text-2xl">New badge!</p>
      <span className="emoji anim-pop text-[7rem] leading-none">{b.emoji}</span>
      <p className="text-4xl font-bold">{b.title}</p>
      <p className="text-xl">{b.text}</p>
      <p className="rounded-full bg-yellow-300 px-4 py-1 text-xl font-bold text-black">+{b.reward} 🍓</p>
      <p className="text-sm text-white/60">tap to keep playing</p>
    </button>
  );
}

export function Tips({ onClose }: { onClose: () => void }) {
  const step = (icon: string, title: string, text: string) => (
    <div className="flex items-start gap-3 rounded-2xl bg-white/90 p-2 text-left text-emerald-950">
      <span className="emoji w-12 shrink-0 text-center text-4xl">{icon}</span>
      <div className="leading-tight"><p className="text-lg font-bold">{title}</p><p className="text-sm">{text}</p></div>
    </div>
  );
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center gap-2 overflow-y-auto bg-black/80 p-3">
      <p className="text-2xl font-bold">How to play Hazelwild</p>
      <div className="flex w-full max-w-xl flex-col gap-2">
        {step("🔎", "1. Explore", "Pick a place and tap the rustling bushes to find creatures, berries, and eggs.")}
        {step("🔮", "2. Catch", "Tap THROW when the white ring touches the dashed circle. Great timing means a better catch!")}
        {step("💖", "3. Grow", "Pet and feed your friends. Each one grows up in 3 steps, from simple to fancy!")}
        {step("☀️", "4. Choose their final form", "Day foods (🍯🥕) make a Sunlit form. Night foods (🍪🍬) make a Moonlit form. You decide!")}
        {step("📖", "5. Collect families", "Meet every creature in a family for a badge. Find all 4 forms of one creature for another!")}
        {step("🏕️", "6. Camp (new!)", "Open any zone and tap the Camp tab. Your friends work there and make ✨ Glow, even while you are away. Collect it to train your friends up!")}
        {step("🍓", "7. Berries", "Tap the 🍓 any time to see ways to get more. Playing other activities gives ⭐ stars, and every star becomes berries!")}
      </div>
      <button onClick={onClose} className="rounded-2xl bg-yellow-300 px-8 py-3 text-2xl font-bold text-black active:scale-95">Let's go!</button>
    </div>
  );
}
