import ColorLab from "./ColorLab";
import KittyCount from "./KittyCount";
import LetterPals from "./LetterPals";
import SinkFloat from "./SinkFloat";
import SparklePaint from "./SparklePaint";
import SpellingUnicorn from "./SpellingUnicorn";
import type { Activity } from "./types";

export const ACTIVITIES: Activity[] = [
  { id: "kitty-count", title: "Count Friends", emoji: "🐱", color: "from-pink-400 to-rose-500", profiles: ["violet"], Component: KittyCount },
  { id: "letter-pals", title: "Letter Pals", emoji: "🔤", color: "from-violet-400 to-fuchsia-500", profiles: ["violet"], Component: LetterPals },
  { id: "spelling", title: "Spelling Unicorn", emoji: "🦄", color: "from-fuchsia-400 to-purple-600", profiles: ["hazel"], Component: SpellingUnicorn },
  { id: "sink-float", title: "Sink or Float?", emoji: "🌊", color: "from-sky-400 to-blue-600", profiles: ["hazel"], Component: SinkFloat },
  { id: "color-lab", title: "Color Lab", emoji: "🧪", color: "from-emerald-400 to-teal-600", profiles: ["hazel"], Component: ColorLab },
  { id: "sparkle-paint", title: "Sparkle Paint", emoji: "🎨", color: "from-amber-300 to-orange-500", profiles: ["hazel", "violet"], Component: SparklePaint },
];
