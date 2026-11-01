import type { ProfileId } from "./store";

// Emoji limited to older Unicode releases so they render on Android 11.
export const STICKERS: Record<ProfileId, string[]> = {
  hazel: ["🦄", "🌈", "✨", "🦋", "🌸", "🧪", "🔭", "🌍", "🚀", "🌙", "☀️", "⭐", "🐬", "🦉", "🍄", "🌻", "🐞", "🐢", "🦊", "🐝", "🌺", "🎀", "💜", "👑"],
  violet: ["🐱", "🐶", "🦄", "🌈", "🐰", "🐼", "🐻", "🐥", "🦁", "🐸", "🐠", "🦋", "🌸", "🍓", "🍦", "🎈", "🎀", "💖", "🐷", "🐨", "🐮", "🐙", "🌟", "👑"],
};
export const STARS_PER_STICKER = 5;
