import { say } from "../lib/speech";
import { useStore } from "../lib/store";
import { STARS_PER_STICKER, STICKERS } from "../lib/stickers";
import type { ActivityProps } from "./types";

export default function StickerBook({ profile }: ActivityProps) {
  const { stickers, stars } = useStore();
  const have = stickers[profile];
  const all = STICKERS[profile];
  const toNext = STARS_PER_STICKER - (stars[profile] % STARS_PER_STICKER);
  return (
    <div className="flex h-full flex-col items-center gap-3 overflow-y-auto px-4 pb-4">
      <p className="text-center text-2xl drop-shadow">
        {have >= all.length ? "You collected them all! 🎉" : <>{toNext} more <span className="emoji">⭐</span> for the next sticker!</>}
      </p>
      <div className="grid w-full max-w-3xl grid-cols-4 gap-3 sm:grid-cols-6">
        {all.map((e, i) => (
          <button key={i} onClick={() => i < have && say("Yay!")}
            className={`flex aspect-square items-center justify-center rounded-3xl text-6xl ${i < have ? "anim-pop bg-white/90 shadow-lg active:scale-90" : "bg-black/20"}`}>
            {i < have ? <span className="emoji">{e}</span> : <span className="text-4xl opacity-40">?</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
