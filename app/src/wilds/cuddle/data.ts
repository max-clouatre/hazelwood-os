// Cuddle Run: every number and piece of content in one place. The rules (game.ts) read from here.
import type { ElementId } from "../species";

export type SizeId = "tiny" | "small" | "medium" | "big" | "giant";
export const SIZE_ORDER: SizeId[] = ["tiny", "small", "medium", "big", "giant"];
/** scale: drawn size; care: seconds of petting needed; drain: energy per second while she tends it; hug: energy per second while it waits and clings; xp: sparkles value; speed: walking speed toward her. */
export const SIZES: Record<SizeId, { scale: number; care: number; drain: number; hug: number; xp: number; speed: number }> = {
  tiny:   { scale: 0.7,  care: 1.6, drain: 0.1, hug: 0.02, xp: 1, speed: 58 },
  small:  { scale: 0.85, care: 2.8, drain: 0.9, hug: 0.1,  xp: 2, speed: 50 },
  medium: { scale: 1.0,  care: 4.2, drain: 1.9, hug: 0.35, xp: 3, speed: 42 },
  big:    { scale: 1.25, care: 6.6, drain: 3.6, hug: 0.7,  xp: 5, speed: 34 },
  giant:  { scale: 1.5,  care: 9.5, drain: 5.2, hug: 1.0,  xp: 8, speed: 28 },
};

export const CUDDLE = {
  day: 240,                    // seconds in a run (a short "day" that ends in a sunset)
  energy: 120, regen: 0.45,     // starting/max energy, and energy back per second
  reach: 66, hugDist: 30,      // petting distance, and how close a clinging animal gets
  slots: 2,                    // animals she can pet at the same time (attention is limited)
  speed: 150, hugSlow: 0.07,   // her walking speed, and slow-down per clinging animal (max 45%)
  pickup: 46, magnetSpeed: 230, // how close sparkles are collected, and how fast they fly to her
  snackChance: 0.1, snackEnergy: 12,
  needyChance: 1 / 7, needyCare: 1.5, needyDrain: 1.4, needyXp: 2,
  maxAnimals: 40, spawnStart: 1.5, spawnEnd: 0.4, spawnRing: 40,
  levelXp: (l: number) => 6 + 4 * l,   // xp to go from level l to l+1
  levelMax: 14,
  helperMax: 5, helperOrbit: 56,
  berriesPerTwo: 1, berriesCap: 25, sunsetBonus: 5, bondBase: 1, bondPerTen: 1,
  befriend: (helped: number) => Math.min(0.55, 0.2 + helped / 300), befriendSunset: 0.7,
};

/** The size an animal of this rarity and form has. */
export const sizeOf = (rarity: number, stage: number): SizeId => SIZE_ORDER[Math.max(0, Math.min(4, rarity - 1 + stage - 1))];
/** Bigger animals only show up later in the day. */
export const sizeCap = (t: number): number => Math.min(4, 1 + Math.floor(t / 50));

export interface HelperDef { id: ElementId; name: string; short: string; emoji: string; what: string }
export const HELPERS: Record<ElementId, HelperDef> = {
  leaf:  { id: "leaf",  name: "Cozy Patch",   short: "Rest spots",    emoji: "🌼", what: "plants cozy flower patches. Stand in one to get your energy back." },
  water: { id: "water", name: "Splash Hello", short: "Calms animals", emoji: "💧", what: "splashes a friendly hello. Nearby animals slow down and tire you less." },
  fire:  { id: "fire",  name: "Warm Cuddles", short: "Faster pets",   emoji: "🔥", what: "glows warmly. Animals close to it get petted faster." },
  sun:   { id: "sun",   name: "Sunbeam",      short: "Helps by itself", emoji: "☀️", what: "pets the nearest animal all by itself, with no energy cost to you." },
  moon:  { id: "moon",  name: "Lullaby",      short: "Sleepy animals", emoji: "🌙", what: "hums a lullaby. Animals near it are sleepy and tire you less." },
  star:  { id: "star",  name: "Star Breeze",  short: "Gathers sparkles", emoji: "⭐", what: "blows a breeze that gathers sparkles and snacks, and you walk faster." },
};
/** Per-level strength of each helper ability (index = helper level 1..5). */
export const HELPER_LV = {
  patchEvery: 9, patchLife: 7, patchRadius: 70, patchRegen: [0, 1.6, 2.4, 3.2, 4.0, 5.0],
  splashEvery: [0, 9, 8, 7, 6, 5], splashRadius: 110, splashCalm: [0, 3, 3.6, 4.2, 4.8, 5.5],
  warmRadius: 80, warmBoost: [0, 1.4, 1.55, 1.7, 1.85, 2.0],
  sunRange: 130, sunRate: [0, 0.4, 0.5, 0.6, 0.7, 0.8],
  lullRadius: 110, lullDrain: [0, 0.7, 0.62, 0.54, 0.46, 0.4],
  breezeEvery: 6, breezeRadius: 240, breezeSpeed: [0, 0.03, 0.06, 0.09, 0.12, 0.15],
};

export type UpgradeId = "reach" | "hands" | "gentle" | "heart" | "cozy" | "feet" | "magnet" | "snacks" | "calm";
export interface UpgradeDef { id: UpgradeId; name: string; text: string; max: number }
export const UPGRADES: UpgradeDef[] = [
  { id: "reach",  name: "Long reach",    text: "You can pet animals from farther away.", max: 5 },
  { id: "hands",  name: "Extra hand",    text: "Pet one more animal at the same time.", max: 3 },
  { id: "gentle", name: "Gentle hands",  text: "Animals feel happy faster.", max: 5 },
  { id: "heart",  name: "Big heart",     text: "More energy, and a little back right now.", max: 5 },
  { id: "cozy",   name: "Cozy aura",     text: "You slowly get energy back faster.", max: 5 },
  { id: "feet",   name: "Quick feet",    text: "You walk faster.", max: 5 },
  { id: "magnet", name: "Sparkle magnet", text: "Sparkles and snacks fly to you from farther.", max: 5 },
  { id: "snacks", name: "Snack bag",     text: "Animals leave snacks more often, and snacks give more energy.", max: 4 },
  { id: "calm",   name: "Calm voice",    text: "Waiting animals cling less and slow you less.", max: 4 },
];

// ---------------------------------------------------------------- learning: questions
const THINGS = ["carrots", "berries", "ducklings", "flowers", "apples", "shells", "acorns", "feathers", "stars", "nuts"];
export interface Question { text: string; answer: number; options: number[] }
const pickOf = <T,>(a: T[], r: () => number): T => a[Math.floor(r() * a.length)];
/** A short question that fits the run level: add to 10, add to 20, take away, then times tables. Always three different options. */
export function makeQuestion(level: number, r: () => number = Math.random): Question {
  const n = (lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
  const thing = pickOf(THINGS, r); let text: string, answer: number;
  if (level <= 2) { const a = n(2, 6), b = n(2, 10 - a); answer = a + b; text = `Hazel has ${a} ${thing}. A friend gives her ${b} more. How many ${thing} does she have now?`; }
  else if (level <= 5) { const a = n(6, 12), b = n(4, 9); answer = a + b; text = `There are ${a} ${thing} in the basket and ${b} more are added. How many ${thing} now?`; }
  else if (level <= 8) { const a = n(11, 20), b = n(3, 9); answer = a - b; text = `There are ${a} ${thing}. The little animals share ${b} of them. How many ${thing} are left?`; }
  else { const k = pickOf([2, 3, 5, 10], r), m = n(2, 6); answer = k * m; text = `${m} nests have ${k} ${thing} each. How many ${thing} altogether?`; }
  const set = new Set<number>([answer]);
  const near = [1, -1, 2, -2, 10, 3];
  for (let i = 0; set.size < 3 && i < 40; i++) { const o = answer + pickOf(near, r); if (o > 0) set.add(o); }
  const options = Array.from(set); for (let i = options.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [options[i], options[j]] = [options[j], options[i]]; }
  return { text, answer, options };
}

// ---------------------------------------------------------------- learning: field notes (true facts, one per species)
export const FACTS: Record<string, string> = {
  mossling: "Mice have front teeth that never stop growing, so they love to nibble!",
  bramblit: "Rabbits can see almost all the way around without turning their heads.",
  fernfox: "Foxes wrap their bushy tails around themselves like a warm blanket.",
  froggy: "Frogs can drink water through their skin!",
  fawny: "A baby deer is called a fawn. Its white spots help it hide in the forest.",
  pandy: "Pandas spend about half of every day eating bamboo.",
  bubbo: "Fish breathe underwater with gills, like little built-in snorkels.",
  ripplet: "Sea otters hold hands while they sleep so they do not drift apart.",
  pearlin: "A turtle's shell is part of its skeleton. It grows with the turtle!",
  ducky: "Ducks spread oil on their feathers, which keeps them dry in the water.",
  sealy: "Seals can hold their breath for a long time when they dive.",
  narwy: "A narwhal's long tusk is really a tooth!",
  embit: "Dragons are pretend, but real Komodo dragons are the biggest lizards in the world.",
  cindercub: "Lions live in big family groups called prides.",
  sparkit: "Cats sleep about 12 to 16 hours a day.",
  lizzy: "Some lizards can grow a new tail if their old one comes off.",
  rusty: "Red pandas wrap their fluffy tails around them to stay warm.",
  dino: "Many scientists think birds are the living cousins of dinosaurs.",
  puffsun: "Baby chicks start peeping to their mother before they even hatch.",
  sunbun: "Lambs can pick out their mother's voice in a big noisy flock.",
  dawnlet: "Many birds sing in the early morning to say hello to the day.",
  beezy: "Bees do a wiggle dance to tell their friends where the flowers are.",
  giri: "A giraffe's neck has seven bones, the same number as yours!",
  chimpy: "Monkeys use their long tails to help them balance in the trees.",
  moonpuff: "Bears sleep a lot in winter. That long nap is called hibernation.",
  lunalet: "Many moths fly at night, while most butterflies fly in the day.",
  hushowl: "Owls can turn their heads almost all the way around.",
  lunacorn: "Long ago, people thought a narwhal's tusk was a unicorn's horn.",
  batty: "Bats make squeaky sounds and listen for the echoes to find their way in the dark.",
  midnight: "Cats can see in much dimmer light than people can.",
  wolfy: "Wolves howl to talk to their pack from far away.",
  twinklet: "Hamsters keep food in their stretchy cheeks.",
  cometail: "Ferrets love to play, and they sleep for most of the day.",
  stellacorn: "Unicorns are pretend, but the Sun is a real star, the closest one to Earth!",
  axo: "Axolotls can grow back a lost leg!",
  pegasus: "Pegasus is a winged horse from old Greek stories, and there is a group of stars named after it.",
  llama: "Llamas hum when they are happy or curious.",
  bandit: "Raccoons have very sensitive hands and feel their food before they eat it.",
  hazelwisp: "A guardian of the whole Hazelwild!",
};
