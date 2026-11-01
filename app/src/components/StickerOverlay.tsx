import { useEffect } from "react";
import { chime } from "../lib/audio";
import { say } from "../lib/speech";
import { update, useStore } from "../lib/store";
import { STICKERS } from "../lib/stickers";
import { Burst } from "./Burst";

/** Full-screen "new sticker" celebration. Tap anywhere to keep playing. */
export function StickerOverlay() {
  const { newSticker } = useStore();
  useEffect(() => {
    if (newSticker) { chime(); setTimeout(() => say("You earned a new sticker!"), 600); }
  }, [newSticker]);
  if (!newSticker) return null;
  const e = STICKERS[newSticker.profile][newSticker.index];
  return (
    <button onClick={() => update(() => ({ newSticker: null }))}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/70">
      <Burst key={newSticker.index} emojis={["⭐", "✨", e, "💖"]} />
      <span className="text-3xl font-bold">New sticker!</span>
      <span className="emoji anim-pop text-[10rem] leading-none">{e}</span>
      <span className="text-xl text-white/80">Tap to keep playing</span>
    </button>
  );
}
