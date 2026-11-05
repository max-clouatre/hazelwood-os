import AnimalGame from "./AnimalGame";
import ColorLab from "./ColorLab";
import ColoringBook from "./ColoringBook";
import Hazelwild from "./Hazelwild";
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
  { id: "animal-game", title: "Animal Game", emoji: "🐸", color: "bg-[#5aa84a]", profiles: ["hazel", "violet"], Component: AnimalGame },
  { id: "kitty-count", title: "Count Friends", emoji: "🐱", color: "bg-[#e5736b]", profiles: ["violet"], Component: KittyCount },
  { id: "letter-pals", title: "Letter Pals", emoji: "🔤", color: "bg-[#8a6bbf]", profiles: ["violet"], Component: LetterPals },
  { id: "trace-it", title: "Trace It", emoji: "✏️", color: "bg-[#3fa7a0]", profiles: ["violet"], Component: TraceIt },
  { id: "hazelwild", title: "Hazelwild", emoji: "🐾", color: "bg-[#4f9a5f]", profiles: ["hazel"], Component: Hazelwild },
  { id: "spelling", title: "Spelling Unicorn", emoji: "🦄", color: "bg-[#9b5fc0]", profiles: ["hazel"], Component: SpellingUnicorn },
  { id: "sink-float", title: "Sink or Float?", emoji: "🌊", color: "bg-[#3f8fd0]", profiles: ["hazel"], Component: SinkFloat },
  { id: "magnet", title: "Magnet Mystery", emoji: "🧲", color: "bg-[#d95a50]", profiles: ["hazel"], Component: MagnetMystery },
  { id: "color-lab", title: "Color Lab", emoji: "🧪", color: "bg-[#2fa07a]", profiles: ["hazel"], Component: ColorLab },
  { id: "coloring", title: "Coloring Book", titles: { hazel: "Color by Number" }, emoji: "🖍️", color: "bg-[#e58a3f]", profiles: ["hazel", "violet"], Component: ColoringBook },
  { id: "sparkle-paint", title: "Sparkle Paint", emoji: "🎨", color: "bg-[#f2b84b]", profiles: ["hazel", "violet"], Component: SparklePaint },
  { id: "stickers", title: "My Stickers", emoji: "🎁", color: "bg-[#d4a02a]", profiles: ["hazel", "violet"], Component: StickerBook },
];
