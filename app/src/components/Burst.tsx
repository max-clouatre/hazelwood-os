import { useMemo } from "react";

/** Celebration: emoji fly outward. Remount with a new `key` to replay. */
export function Burst({ emojis = ["⭐", "✨", "💖"] }: { emojis?: string[] }) {
  const bits = useMemo(
    () => Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2 + Math.random() * 0.4;
      const d = 140 + Math.random() * 160;
      return { e: emojis[i % emojis.length], dx: Math.cos(a) * d, dy: Math.sin(a) * d };
    }),
    [emojis],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center">
      {bits.map((b, i) => (
        <span key={i} className="emoji absolute text-4xl"
          style={{ ["--dx" as string]: `${b.dx}px`, ["--dy" as string]: `${b.dy}px`, animation: "burst 1.1s ease-out forwards" }}>
          {b.e}
        </span>
      ))}
    </div>
  );
}
