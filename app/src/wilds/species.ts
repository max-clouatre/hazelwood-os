export type ElementId = "leaf" | "water" | "fire" | "sun" | "moon" | "star";
export type BodyKind = "blob" | "round" | "tall" | "long" | "drop";
export type EarKind = "pointy" | "round" | "long" | "leaf" | "fin" | "floppy" | "none";
export type TailKind = "fluffy" | "curl" | "leaf" | "flame" | "fin" | "star" | "plume" | "none";
export type Extra = "horn" | "crest" | "sprout" | "flametuft" | "antenna" | "antlers" | "crown" | "blossom" | "halo" | "wings" | "moths" | "mane" | "aura";
export type PatternKind = "plain" | "spots" | "stripes";
export type FoodId = "honey" | "cookie" | "candy" | "carrot";
export type Personality = "gentle" | "zippy" | "sleepy" | "brave" | "shy" | "silly";
export type Rarity = 1 | 2 | 3 | 4; // common, uncommon, rare, legendary

export interface Element { name: string; emoji: string; color: string; beats: ElementId; why: string; move: string }
export const ELEMENTS: Record<ElementId, Element> = {
  leaf: { name: "Leaf", emoji: "🌿", color: "#4ade80", beats: "water", why: "Plants drink up water.", move: "Leaf Whirl" },
  water: { name: "Water", emoji: "💧", color: "#38bdf8", beats: "fire", why: "Water puts out fire.", move: "Splash Wave" },
  fire: { name: "Fire", emoji: "🔥", color: "#fb923c", beats: "leaf", why: "Fire burns leaves.", move: "Ember Dash" },
  moon: { name: "Moon", emoji: "🌙", color: "#a78bfa", beats: "sun", why: "In an eclipse the Moon blocks the Sun.", move: "Moon Glow" },
  sun: { name: "Sun", emoji: "☀️", color: "#facc15", beats: "star", why: "Daylight hides the stars.", move: "Sunbeam" },
  star: { name: "Star", emoji: "⭐", color: "#f472b6", beats: "moon", why: "Stars shine brightest on a moonless night.", move: "Star Shower" },
};

export const FOODS: Record<FoodId, { name: string; emoji: string }> = {
  honey: { name: "Honey Drop", emoji: "🍯" },
  cookie: { name: "Moon Cookie", emoji: "🍪" },
  candy: { name: "Star Candy", emoji: "🍬" },
  carrot: { name: "Crunchy Carrot", emoji: "🥕" },
};
export const FOOD_COST = 2;

export const PERSONALITIES: Record<Personality, { label: string; pet: string[] }> = {
  gentle: { label: "Gentle", pet: ["Hee hee, that tickles!", "I love you!", "Soft pats are the best."] },
  zippy: { label: "Zippy", pet: ["Again! Again!", "Zoom zoom zoom!", "I have SO much energy!"] },
  sleepy: { label: "Sleepy", pet: ["*yaaawn* ...so cozy.", "Five more minutes...", "Zzz... oh! Hi!"] },
  brave: { label: "Brave", pet: ["I'll protect you!", "Nothing scares me!", "Let's go on an adventure!"] },
  shy: { label: "Shy", pet: ["Oh! ...Thank you.", "*hides a little, then smiles*", "You're my best friend."] },
  silly: { label: "Silly", pet: ["Boop! Boop! Boop!", "Hehehe! Blep!", "I'm a potato!"] },
};

export interface Species {
  id: string;
  names: [string, string, string]; // stage 1, 2, 3
  element: ElementId;
  rarity: Rarity;
  body: BodyKind; ears: EarKind; tail: TailKind;
  grow: [Extra[], Extra[], Extra[]]; // extras at each stage
  patterns: PatternKind[];
  main: string; light: string; accent: string;
  fav: FoodId;
  biomes: string[];
  blurb: string;
}

export const SPECIES: Species[] = [
  // ---- Leaf ----
  { id: "mossling", names: ["Mossling", "Mossbloom", "Mossgrove"], element: "leaf", rarity: 1, body: "round", ears: "leaf", tail: "none",
    grow: [["sprout"], ["sprout", "blossom"], ["sprout", "blossom", "aura"]], patterns: ["plain", "spots"],
    main: "#7bd56a", light: "#d9f7c8", accent: "#3f9d3a", fav: "honey", biomes: ["meadow", "forest"],
    blurb: "Naps in sunny patches. Tiny flowers sprout when it's happy." },
  { id: "bramblit", names: ["Bramblit", "Bramblop", "Bramblord"], element: "leaf", rarity: 1, body: "tall", ears: "long", tail: "fluffy",
    grow: [[], ["crest"], ["antlers", "aura"]], patterns: ["plain", "spots"],
    main: "#c9a36b", light: "#f5e6c8", accent: "#6ea84f", fav: "carrot", biomes: ["meadow", "forest"],
    blurb: "Hops through tall grass and loves anything crunchy." },
  { id: "fernfox", names: ["Sproutail", "Fernail", "Verdantail"], element: "leaf", rarity: 2, body: "blob", ears: "pointy", tail: "leaf",
    grow: [[], ["crest"], ["crest", "wings", "aura"]], patterns: ["plain", "stripes"],
    main: "#4fc29a", light: "#c9f2e2", accent: "#2a8f6a", fav: "cookie", biomes: ["forest"],
    blurb: "Its leafy tail rustles when it's excited." },
  // ---- Water ----
  { id: "bubbo", names: ["Bubbo", "Bubbolo", "Bubbarch"], element: "water", rarity: 1, body: "drop", ears: "fin", tail: "fin",
    grow: [[], ["crest"], ["crest", "aura"]], patterns: ["plain", "spots"],
    main: "#5ec4f2", light: "#d4f1ff", accent: "#2a8fd0", fav: "candy", biomes: ["shore", "meadow"],
    blurb: "Blows bubbles that pop into rainbows." },
  { id: "ripplet", names: ["Ripplet", "Rippleon", "Ripplord"], element: "water", rarity: 1, body: "long", ears: "round", tail: "curl",
    grow: [[], ["crest"], ["crest", "mane", "aura"]], patterns: ["plain", "stripes"],
    main: "#43c6c0", light: "#c8f4f1", accent: "#1f8f93", fav: "honey", biomes: ["shore"],
    blurb: "Floats on its back and juggles shells." },
  { id: "pearlin", names: ["Pearlin", "Pearlina", "Pearlux"], element: "water", rarity: 2, body: "round", ears: "fin", tail: "none",
    grow: [["crest"], ["crest", "halo"], ["crest", "halo", "aura"]], patterns: ["plain", "spots"],
    main: "#f4b6d6", light: "#fde4f0", accent: "#d98fb7", fav: "cookie", biomes: ["shore", "cave"],
    blurb: "Shines like a pearl in the moonlight." },
  // ---- Fire ----
  { id: "embit", names: ["Embit", "Emberly", "Emberoyal"], element: "fire", rarity: 1, body: "round", ears: "pointy", tail: "flame",
    grow: [[], ["flametuft"], ["flametuft", "wings", "aura"]], patterns: ["plain", "spots"],
    main: "#ff8a4c", light: "#ffe0b8", accent: "#ffd23f", fav: "candy", biomes: ["cave", "meadow"],
    blurb: "Warm as a campfire. Roasts marshmallows for friends." },
  { id: "cindercub", names: ["Cindercub", "Cinderpaw", "Cinderlion"], element: "fire", rarity: 2, body: "long", ears: "round", tail: "fluffy",
    grow: [[], ["mane"], ["mane", "crown", "aura"]], patterns: ["plain", "stripes"],
    main: "#e8604c", light: "#ffd6c9", accent: "#ffb347", fav: "carrot", biomes: ["cave", "shore"],
    blurb: "Small but brave. Roars a very tiny roar." },
  { id: "sparkit", names: ["Sparkit", "Flickerit", "Blazekit"], element: "fire", rarity: 2, body: "tall", ears: "pointy", tail: "flame",
    grow: [["flametuft"], ["flametuft", "crest"], ["flametuft", "wings", "aura"]], patterns: ["plain", "stripes"],
    main: "#ffb02e", light: "#fff0c2", accent: "#ff6b35", fav: "honey", biomes: ["cave"],
    blurb: "Never sits still. Leaves little sparkles behind." },
  // ---- Sun ----
  { id: "puffsun", names: ["Puffsun", "Dandesun", "Solarmane"], element: "sun", rarity: 1, body: "round", ears: "none", tail: "none",
    grow: [["mane"], ["mane", "halo"], ["mane", "halo", "aura"]], patterns: ["plain", "spots"],
    main: "#ffd84a", light: "#fff3b0", accent: "#ff9f1c", fav: "cookie", biomes: ["meadow", "shore"],
    blurb: "A fluffy ball of sunshine. Its mane glows at noon." },
  { id: "sunbun", names: ["Sunbun", "Sunnibun", "Solbunny"], element: "sun", rarity: 1, body: "tall", ears: "long", tail: "fluffy",
    grow: [[], ["halo"], ["halo", "wings", "aura"]], patterns: ["plain", "stripes"],
    main: "#ffe29a", light: "#fff8e0", accent: "#ffb347", fav: "carrot", biomes: ["meadow", "shore"],
    blurb: "Warms its paws on sunny rocks." },
  { id: "dawnlet", names: ["Dawnlet", "Dawnwing", "Dawnflare"], element: "sun", rarity: 2, body: "drop", ears: "pointy", tail: "plume",
    grow: [[], ["wings"], ["wings", "crown", "aura"]], patterns: ["plain", "spots"],
    main: "#ffc2a0", light: "#ffe9dc", accent: "#ff7f6e", fav: "honey", biomes: ["meadow", "peak"],
    blurb: "Wakes the whole forest with a morning song." },
  // ---- Moon ----
  { id: "moonpuff", names: ["Moonpuff", "Moonfluff", "Lunafluff"], element: "moon", rarity: 1, body: "round", ears: "round", tail: "fluffy",
    grow: [[], ["halo"], ["halo", "aura"]], patterns: ["plain", "spots"],
    main: "#b8a6f2", light: "#e6defc", accent: "#7a62d6", fav: "cookie", biomes: ["forest", "peak"],
    blurb: "Soft as a cloud. Hums lullabies in its sleep." },
  { id: "lunalet", names: ["Lunalet", "Lunamoth", "Lunarch"], element: "moon", rarity: 2, body: "blob", ears: "none", tail: "none",
    grow: [["antenna", "moths"], ["antenna", "moths", "halo"], ["antenna", "moths", "halo", "aura"]], patterns: ["plain", "spots"],
    main: "#c7d2fe", light: "#eef2ff", accent: "#818cf8", fav: "candy", biomes: ["forest", "peak"],
    blurb: "Flutters toward moonbeams and glows softly." },
  { id: "hushowl", names: ["Hushling", "Hushowl", "Hushwise"], element: "moon", rarity: 2, body: "tall", ears: "pointy", tail: "none",
    grow: [[], ["wings"], ["wings", "crown", "aura"]], patterns: ["plain", "stripes"],
    main: "#8b7fd1", light: "#d9d3f5", accent: "#f5d56b", fav: "honey", biomes: ["forest", "peak"],
    blurb: "Knows every secret of the night sky." },
  // ---- Star ----
  { id: "twinklet", names: ["Twinklet", "Twinklestar", "Twinklarch"], element: "star", rarity: 1, body: "round", ears: "round", tail: "star",
    grow: [["antenna"], ["antenna", "halo"], ["antenna", "halo", "aura"]], patterns: ["plain", "spots"],
    main: "#5b6ee8", light: "#c7d0ff", accent: "#ffd84a", fav: "candy", biomes: ["cave", "peak"],
    blurb: "Counts the stars every night and never loses count." },
  { id: "cometail", names: ["Cometit", "Cometail", "Cometarch"], element: "star", rarity: 2, body: "long", ears: "pointy", tail: "plume",
    grow: [[], ["crest"], ["crest", "wings", "aura"]], patterns: ["plain", "stripes"],
    main: "#c660d8", light: "#f3d3fa", accent: "#ffd84a", fav: "cookie", biomes: ["peak", "cave"],
    blurb: "Races across the sky, trailing stardust." },
  { id: "stellacorn", names: ["Starfoal", "Stellacorn", "Celestacorn"], element: "star", rarity: 3, body: "tall", ears: "pointy", tail: "plume",
    grow: [["horn"], ["horn", "mane"], ["horn", "mane", "wings", "aura"]], patterns: ["plain", "spots"],
    main: "#f3e9ff", light: "#ffffff", accent: "#c084fc", fav: "candy", biomes: ["peak"],
    blurb: "A rare star-unicorn. Its horn sings when the sky is clear." },
  // ---- Moon unicorn (rare) ----
  { id: "lunacorn", names: ["Moonfoal", "Lunacorn", "Eclipsecorn"], element: "moon", rarity: 3, body: "tall", ears: "pointy", tail: "plume",
    grow: [["horn"], ["horn", "mane"], ["horn", "mane", "wings", "aura"]], patterns: ["plain", "stripes"],
    main: "#9a8cf0", light: "#e3dcff", accent: "#ffd84a", fav: "cookie", biomes: ["peak", "forest"],
    blurb: "A rare moon-unicorn that walks only by moonlight." },
  // ---- Legendary (gift for completing the Wilddex) ----
  { id: "hazelwisp", names: ["Hazelwisp", "Hazelwisp", "Hazelwisp"], element: "leaf", rarity: 4, body: "round", ears: "leaf", tail: "plume",
    grow: [["antlers", "mane", "halo", "aura"], ["antlers", "mane", "halo", "aura"], ["antlers", "mane", "halo", "wings", "aura"]], patterns: ["plain"],
    main: "#b9825a", light: "#f3dcc0", accent: "#ffd84a", fav: "honey", biomes: [],
    blurb: "The guardian of the Hazelwild. Only a true collector can befriend it." },
];
export const SPECIES_BY_ID: Record<string, Species> = Object.fromEntries(SPECIES.map((s) => [s.id, s]));
export const COLLECTABLE = SPECIES.filter((s) => s.rarity < 4);

export interface Biome { id: string; name: string; emoji: string; need: number; sky: [string, string]; ground: string; decor: string[]; blurb: string }
export const BIOMES: Biome[] = [
  { id: "meadow", name: "Sunny Meadow", emoji: "🌼", need: 0, sky: ["#8fd3ff", "#d9f7ff"], ground: "#6fcf6a", decor: ["🌼", "🌷", "🦋", "🌳", "☁️"], blurb: "Flowers, butterflies and gentle friends." },
  { id: "forest", name: "Misty Forest", emoji: "🌲", need: 3, sky: ["#9bb8d3", "#d6e6df"], ground: "#4f9d5f", decor: ["🌲", "🍄", "🌳", "🦉", "🌫️"], blurb: "Tall trees, soft fog and sleepy night creatures." },
  { id: "shore", name: "Sparkle Shore", emoji: "🏖️", need: 6, sky: ["#7fd6f5", "#e0f7ff"], ground: "#f4d58d", decor: ["🐚", "🌊", "🌴", "🦀", "⛱️"], blurb: "Waves, shells and splashy pals." },
  { id: "cave", name: "Crystal Cave", emoji: "💎", need: 9, sky: ["#3b2a6b", "#6a4fb0"], ground: "#5b4a86", decor: ["💎", "🔮", "✨", "🌋", "🔥"], blurb: "Glittering gems and warm glowing rocks." },
  { id: "peak", name: "Star Peak", emoji: "🏔️", need: 12, sky: ["#1b1b4d", "#4a3f9b"], ground: "#8d98c9", decor: ["🏔️", "⭐", "🌙", "☄️", "✨"], blurb: "Up above the clouds, where the sky sparkles." },
];

export const STAGE_AT = [0, 14, 40]; // bond points needed for stage 1, 2, 3
export const RARITY_LABEL = ["", "Common", "Uncommon", "Rare", "Legendary"];
