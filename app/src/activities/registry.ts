import ColorLab from "./ColorLab";
import KittyCount from "./KittyCount";
import LetterPals from "./LetterPals";
import MagnetMystery from "./MagnetMystery";
import SinkFloat from "./SinkFloat";
import SparklePaint from "./SparklePaint";
import SpellingUnicorn from "./SpellingUnicorn";
import StickerBook from "./StickerBook";
import TraceIt from "./TraceIt";
import type { Activity } from "./types";

export const ACTIVITIES: Activity[] = [
  { id: "kitty-count", title: "Count Friends", emoji: "🐱", color: "from-pink-400 to-rose-500", profiles: ["violet"], Component: KittyCount },
  { id: "letter-pals", title: "Letter Pals", emoji: "🔤", color: "from-violet-400 to-fuchsia-500", profiles: ["violet"], Component: LetterPals },
  { id: "trace-it", title: "Trace It", emoji: "✏️", color: "from-teal-400 to-cyan-500", profiles: ["violet"], Component: TraceIt },
  { id: "spelling", title: "Spelling Unicorn", emoji: "🦄", color: "from-fuchsia-400 to-purple-600", profiles: ["hazel"], Component: SpellingUnicorn },
  { id: "sink-float", title: "Sink or Float?", emoji: "🌊", color: "from-sky-400 to-blue-600", profiles: ["hazel"], Component: SinkFloat },
  { id: "magnet", title: "Magnet Mystery", emoji: "🧲", color: "from-red-400 to-rose-600", profiles: ["hazel"], Component: MagnetMystery },
  { id: "color-lab", title: "Color Lab", emoji: "🧪", color: "from-emerald-400 to-teal-600", profiles: ["hazel"], Component: ColorLab },
  { id: "sparkle-paint", title: "Sparkle Paint", emoji: "🎨", color: "from-amber-300 to-orange-500", profiles: ["hazel", "violet"], Component: SparklePaint },
  { id: "stickers", title: "My Stickers", emoji: "🎁", color: "from-yellow-300 to-amber-500", profiles: ["hazel", "violet"], Component: StickerBook },
];
