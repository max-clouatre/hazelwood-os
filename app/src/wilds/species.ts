export type ElementId = "leaf" | "water" | "fire" | "sun" | "moon" | "star";
export type BodyKind = "blob" | "round" | "tall" | "long" | "drop";
export type EarKind = "pointy" | "round" | "long" | "leaf" | "fin" | "floppy" | "bat" | "gills" | "none";
export type TailKind = "fluffy" | "curl" | "leaf" | "flame" | "fin" | "star" | "plume" | "bushy" | "spike" | "nub" | "none";
export type Extra = "spikes" | "tusk" | "shell" | "bumps" | "ossicones" | "sunrays" | "moonstars" | "horn" | "crest" | "sprout" | "flametuft" | "antenna" | "antlers" | "crown" | "blossom" | "halo" | "wings" | "moths" | "mane" | "aura";
export type PatternKind = "plain" | "spots" | "stripes" | "bands";
export type Face = "beak" | "whiskers" | "muzzle" | "mask";
export type VariantId = "golden" | "storm" | "shadow" | "autumn";
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
export const FOOD_SIDE: Record<FoodId, "sun" | "moon"> = { honey: "sun", carrot: "sun", cookie: "moon", candy: "moon" };

export interface Family { name: string; blurb: string }
export const FAMILIES: Record<ElementId, Family> = {
  leaf: { name: "Sproutkin", blurb: "Gentle growers of the green." },
  water: { name: "Tidefolk", blurb: "Splashy friends of pond and shore." },
  fire: { name: "Emberkin", blurb: "Warm hearts with flickering tails." },
  sun: { name: "Dawnkin", blurb: "Bright, fluffy bringers of morning." },
  moon: { name: "Duskkin", blurb: "Quiet dreamers of the night." },
  star: { name: "Skykin", blurb: "Sparkling wanderers of the heavens." },
};

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
  kind: string; // the real animal it is: Fox, Otter, Owl...
  face?: Face[];
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

type G = Species["grow"];
const g = (a: Extra[], b2: Extra[], c: Extra[]): G => [a, b2, c];
const A = (id: string, kind: string, names: [string, string, string], element: ElementId, rarity: Rarity, body: BodyKind, ears: EarKind, tail: TailKind, grow: G,
  patterns: PatternKind[], main: string, light: string, accent: string, fav: FoodId, biomes: string[], blurb: string, face?: Face[]): Species =>
  ({ id, kind, names, element, rarity, body, ears, tail, grow, patterns, main, light, accent, fav, biomes, blurb, face });

export const SPECIES: Species[] = [
  // ---------------- Leaf: Sproutkin ----------------
  A("mossling", "Mouse", ["Mousey", "Leaf Mouse", "Grove Mouse"], "leaf", 1, "round", "round", "curl", g(["sprout"], ["sprout", "blossom"], ["sprout", "blossom", "aura"]), ["plain", "spots"],
    "#7bd56a", "#d9f7c8", "#3f9d3a", "honey", ["meadow", "forest"], "A tiny mouse with a sprout on its head. Flowers bloom when it's happy.", ["whiskers"]),
  A("bramblit", "Bunny", ["Bunny", "Bramble Bunny", "Briar Bunny"], "leaf", 1, "tall", "long", "fluffy", g([], ["crest"], ["antlers", "aura"]), ["plain", "spots"],
    "#c9a36b", "#f5e6c8", "#6ea84f", "carrot", ["meadow", "forest"], "Hops through tall grass and loves anything crunchy.", ["whiskers"]),
  A("fernfox", "Fox", ["Foxy", "Fern Fox", "Forest Fox"], "leaf", 2, "blob", "pointy", "bushy", g([], ["crest"], ["crest", "mane", "aura"]), ["plain", "stripes"],
    "#4fc29a", "#c9f2e2", "#2a8f6a", "cookie", ["forest"], "A clever fox whose fluffy tail rustles like leaves.", ["whiskers"]),
  A("froggy", "Frog", ["Froggy", "Leaf Frog", "Jungle Frog"], "leaf", 1, "round", "none", "none", g(["bumps"], ["bumps", "blossom"], ["bumps", "blossom", "aura"]), ["plain", "spots"],
    "#5fd35a", "#e4f9c9", "#2f9e44", "candy", ["forest", "shore"], "Hops from lily pad to lily pad. Ribbit!"),
  A("fawny", "Deer", ["Fawn", "Leaf Deer", "Grand Stag"], "leaf", 2, "tall", "leaf", "nub", g([], ["antlers"], ["antlers", "crown", "aura"]), ["spots"],
    "#c58b57", "#f6e3c4", "#7bb661", "honey", ["forest", "meadow"], "A gentle fawn. Antlers grow as it gets older."),
  A("pandy", "Panda", ["Pandy", "Bamboo Panda", "Grand Panda"], "leaf", 3, "round", "round", "nub", g(["sprout"], ["sprout"], ["sprout", "crown", "aura"]), ["plain"],
    "#f2f2ee", "#ffffff", "#34303d", "carrot", ["forest"], "A sleepy panda who munches bamboo all day.", ["muzzle"]),
  // ---------------- Water: Tidefolk ----------------
  A("bubbo", "Fish", ["Fishy", "Bubble Fish", "Bubble Koi"], "water", 1, "drop", "fin", "fin", g([], ["crest"], ["crest", "aura"]), ["plain", "spots"],
    "#5ec4f2", "#d4f1ff", "#2a8fd0", "candy", ["shore", "meadow"], "Blows bubbles that pop into rainbows."),
  A("ripplet", "Otter", ["Otty", "Ripple Otter", "River Otter"], "water", 1, "long", "round", "curl", g([], ["crest"], ["crest", "mane", "aura"]), ["plain", "stripes"],
    "#43c6c0", "#c8f4f1", "#1f8f93", "honey", ["shore"], "Floats on its back and juggles shells.", ["muzzle", "whiskers"]),
  A("pearlin", "Turtle", ["Shelly", "Pearl Turtle", "Grand Turtle"], "water", 2, "round", "none", "nub", g(["shell"], ["shell", "halo"], ["shell", "halo", "aura"]), ["plain", "spots"],
    "#f4b6d6", "#fde4f0", "#d98fb7", "cookie", ["shore", "cave"], "Carries a pearly shell that shines in the moonlight."),
  A("ducky", "Duck", ["Ducky", "Pond Duck", "Grand Swan"], "water", 1, "round", "none", "nub", g([], [], ["wings", "aura"]), ["plain", "spots"],
    "#8fd3f4", "#e2f6ff", "#3a9fd8", "carrot", ["meadow", "shore"], "Paddles around the pond and splashes everyone.", ["beak"]),
  A("sealy", "Seal", ["Sealy", "Wave Seal", "Sea Lion"], "water", 2, "long", "none", "fin", g([], ["crest"], ["mane", "aura"]), ["plain", "spots"],
    "#8aa7c8", "#dbe6f4", "#4f6f99", "candy", ["shore"], "Balances a ball on its nose.", ["muzzle", "whiskers"]),
  A("narwy", "Narwhal", ["Narwy", "Bubble Narwhal", "Grand Narwhal"], "water", 3, "drop", "none", "fin", g(["tusk"], ["tusk", "crest"], ["tusk", "crest", "aura"]), ["plain", "spots"],
    "#9fc5e8", "#e6f1fb", "#4f8dc7", "honey", ["shore", "peak"], "The unicorn of the sea! Its tusk glitters.", []),
  // ---------------- Fire: Emberkin ----------------
  A("embit", "Dragon", ["Drakey", "Ember Drake", "Fire Dragon"], "fire", 1, "round", "pointy", "flame", g([], ["flametuft"], ["flametuft", "wings", "aura"]), ["plain", "spots"],
    "#ff8a4c", "#ffe0b8", "#ffd23f", "candy", ["cave", "meadow"], "A baby dragon, warm as a campfire."),
  A("cindercub", "Lion", ["Cubby", "Ember Lion", "Flame Lion"], "fire", 2, "long", "round", "fluffy", g([], ["mane"], ["mane", "crown", "aura"]), ["plain", "stripes"],
    "#e8604c", "#ffd6c9", "#ffb347", "carrot", ["cave", "shore"], "A small lion cub with a very tiny roar.", ["muzzle"]),
  A("sparkit", "Cat", ["Kitten", "Spark Cat", "Blaze Cat"], "fire", 2, "tall", "pointy", "flame", g(["flametuft"], ["flametuft", "crest"], ["flametuft", "wings", "aura"]), ["plain", "stripes"],
    "#ffb02e", "#fff0c2", "#ff6b35", "honey", ["cave"], "Never sits still. Leaves little sparkles behind.", ["whiskers"]),
  A("lizzy", "Lizard", ["Lizzy", "Fire Lizard", "Lava Lizard"], "fire", 1, "long", "none", "spike", g([], ["spikes"], ["spikes", "aura"]), ["plain", "spots"],
    "#e0503e", "#ffd9cf", "#ffd23f", "carrot", ["cave", "meadow"], "Sunbathes on warm rocks."),
  A("rusty", "Red Panda", ["Rusty", "Ember Panda", "Fire Panda"], "fire", 2, "round", "round", "bushy", g([], ["crest"], ["crest", "crown", "aura"]), ["plain", "stripes"],
    "#c9552d", "#fbe3cf", "#fff1dc", "cookie", ["forest", "cave"], "Climbs trees and naps in the warm sun.", ["muzzle"]),
  A("dino", "Dino", ["Dino", "Ember Dino", "Lava Rex"], "fire", 3, "tall", "none", "spike", g(["spikes"], ["spikes"], ["spikes", "aura"]), ["plain", "spots"],
    "#e8883a", "#ffe6c2", "#9a3412", "candy", ["cave"], "A mighty little dinosaur. Stomp, stomp, stomp!"),
  // ---------------- Sun: Dawnkin ----------------
  A("puffsun", "Chick", ["Chicky", "Sun Chick", "Golden Hen"], "sun", 1, "round", "none", "nub", g([], ["mane"], ["mane", "halo", "aura"]), ["plain", "spots"],
    "#ffd84a", "#fff3b0", "#ff9f1c", "cookie", ["meadow", "shore"], "A fluffy ball of sunshine that peeps all day.", ["beak"]),
  A("sunbun", "Lamb", ["Lamby", "Sun Lamb", "Golden Ram"], "sun", 1, "tall", "floppy", "fluffy", g([], ["halo"], ["halo", "mane", "aura"]), ["plain", "stripes"],
    "#ffe29a", "#fff8e0", "#ffb347", "carrot", ["meadow", "shore"], "Soft and woolly. Warms its toes on sunny rocks."),
  A("dawnlet", "Bird", ["Birdy", "Dawn Bird", "Dawn Phoenix"], "sun", 2, "drop", "none", "plume", g([], ["wings"], ["wings", "crown", "aura"]), ["plain", "spots"],
    "#ffc2a0", "#ffe9dc", "#ff7f6e", "honey", ["meadow", "peak"], "Wakes the whole forest with a morning song.", ["beak"]),
  A("beezy", "Bee", ["Buzzy", "Honey Bee", "Queen Bee"], "sun", 1, "round", "none", "spike", g(["antenna"], ["antenna", "wings"], ["antenna", "wings", "crown", "aura"]), ["bands"],
    "#ffd23f", "#fff4bf", "#3a3550", "honey", ["meadow"], "Buzzes from flower to flower making honey."),
  A("giri", "Giraffe", ["Giri", "Sun Giraffe", "Grand Giraffe"], "sun", 2, "tall", "round", "nub", g(["ossicones"], ["ossicones"], ["ossicones", "crown", "aura"]), ["spots"],
    "#f6c453", "#fff0c4", "#9a5b1f", "carrot", ["meadow"], "Nibbles leaves from the very tallest trees."),
  A("chimpy", "Monkey", ["Chimpy", "Sun Monkey", "Golden Monkey"], "sun", 2, "round", "round", "curl", g([], ["crest"], ["crest", "halo", "aura"]), ["plain"],
    "#d9a566", "#f9e6c4", "#8a5a2b", "candy", ["shore", "forest"], "Swings from branch to branch.", ["muzzle"]),
  // ---------------- Moon: Duskkin ----------------
  A("moonpuff", "Bear", ["Bear Cub", "Moon Bear", "Lunar Bear"], "moon", 1, "round", "round", "nub", g([], ["halo"], ["halo", "aura"]), ["plain", "spots"],
    "#b8a6f2", "#e6defc", "#7a62d6", "cookie", ["forest", "peak"], "Soft as a cloud. Hums lullabies in its sleep.", ["muzzle"]),
  A("lunalet", "Moth", ["Mothy", "Moon Moth", "Luna Moth"], "moon", 2, "blob", "none", "none", g(["antenna", "moths"], ["antenna", "moths", "halo"], ["antenna", "moths", "halo", "aura"]), ["plain", "spots"],
    "#c7d2fe", "#eef2ff", "#818cf8", "candy", ["forest", "peak"], "Flutters toward moonbeams and glows softly."),
  A("hushowl", "Owl", ["Owlet", "Night Owl", "Moon Owl"], "moon", 2, "tall", "pointy", "none", g([], ["wings"], ["wings", "crown", "aura"]), ["plain", "stripes"],
    "#8b7fd1", "#d9d3f5", "#f5d56b", "honey", ["forest", "peak"], "Knows every secret of the night sky.", ["beak"]),
  A("lunacorn", "Unicorn", ["Moon Foal", "Moon Unicorn", "Eclipse Unicorn"], "moon", 3, "tall", "pointy", "plume", g(["horn"], ["horn", "mane"], ["horn", "mane", "wings", "aura"]), ["plain", "stripes"],
    "#9a8cf0", "#e3dcff", "#ffd84a", "cookie", ["peak", "forest"], "A rare moon-unicorn that walks only by moonlight."),
  A("batty", "Bat", ["Batty", "Moon Bat", "Night Bat"], "moon", 2, "round", "bat", "none", g(["wings"], ["wings", "crest"], ["wings", "crest", "aura"]), ["plain", "spots"],
    "#6a5acd", "#d5cff7", "#ffd84a", "candy", ["cave", "forest"], "Flies at night and sings in squeaks."),
  A("midnight", "Black Cat", ["Night Kitten", "Moon Cat", "Shadow Cat"], "moon", 2, "blob", "pointy", "curl", g([], ["halo"], ["halo", "aura"]), ["plain", "stripes"],
    "#4f4872", "#a79fcf", "#ffd84a", "cookie", ["forest", "cave"], "Slips quietly through the shadows.", ["whiskers"]),
  A("wolfy", "Wolf", ["Wolf Pup", "Moon Wolf", "Silver Wolf"], "moon", 3, "long", "pointy", "bushy", g([], ["mane"], ["mane", "crown", "aura"]), ["plain", "stripes"],
    "#9aa3c4", "#e4e8f5", "#6a5acd", "honey", ["forest", "peak"], "Howls at the moon with its whole heart.", ["muzzle"]),
  // ---------------- Star: Skykin ----------------
  A("twinklet", "Hamster", ["Hammy", "Star Hamster", "Cosmic Hamster"], "star", 1, "round", "round", "star", g(["antenna"], ["antenna", "halo"], ["antenna", "halo", "aura"]), ["plain", "spots"],
    "#5b6ee8", "#c7d0ff", "#ffd84a", "candy", ["cave", "peak"], "Stuffs its cheeks with stardust.", ["whiskers"]),
  A("cometail", "Ferret", ["Ferrie", "Comet Ferret", "Cosmic Ferret"], "star", 2, "long", "pointy", "plume", g([], ["crest"], ["crest", "wings", "aura"]), ["plain", "stripes"],
    "#c660d8", "#f3d3fa", "#ffd84a", "cookie", ["peak", "cave"], "Races across the sky, trailing stardust.", ["whiskers"]),
  A("stellacorn", "Unicorn", ["Star Foal", "Star Unicorn", "Celestial Unicorn"], "star", 3, "tall", "pointy", "plume", g(["horn"], ["horn", "mane"], ["horn", "mane", "wings", "aura"]), ["plain", "spots"],
    "#f3e9ff", "#ffffff", "#c084fc", "candy", ["peak"], "A rare star-unicorn. Its horn sings when the sky is clear."),
  A("axo", "Axolotl", ["Axo", "Star Axolotl", "Cosmic Axolotl"], "star", 2, "blob", "gills", "fin", g([], ["crest"], ["crest", "halo", "aura"]), ["plain", "spots"],
    "#ffb3d1", "#ffe5ef", "#e0558f", "honey", ["cave", "shore"], "Always smiling. Can grow back anything!"),
  A("pegasus", "Pegasus", ["Wing Foal", "Star Pegasus", "Celestial Pegasus"], "star", 3, "tall", "pointy", "plume", g(["wings"], ["wings", "mane"], ["wings", "mane", "crown", "aura"]), ["plain", "stripes"],
    "#bfe3ff", "#f0f9ff", "#6a8cff", "carrot", ["peak"], "A flying horse that gallops through clouds."),
  A("llama", "Llama", ["Llamie", "Star Llama", "Cosmic Llama"], "star", 2, "tall", "floppy", "fluffy", g([], ["mane"], ["mane", "halo", "aura"]), ["plain", "spots"],
    "#e9d2b6", "#fff6e8", "#c05cb3", "carrot", ["peak", "meadow"], "Fluffy and proud. Hums when it's happy."),
  A("bandit", "Raccoon", ["Bandit", "Star Raccoon", "Cosmic Raccoon"], "star", 2, "blob", "round", "bushy", g([], ["crest"], ["crest", "halo", "aura"]), ["plain"],
    "#9aa0b8", "#e1e4ee", "#ffd84a", "cookie", ["forest", "peak"], "A sneaky snack-finder in a little mask.", ["mask", "muzzle"]),
  // ---------------- Legendary (gift for completing the Wilddex) ----------------
  A("hazelwisp", "Guardian", ["Hazelwisp", "Hazelwisp", "Hazelwisp"], "leaf", 4, "round", "leaf", "plume", g(["antlers", "mane", "halo", "aura"], ["antlers", "mane", "halo", "aura"], ["antlers", "mane", "halo", "wings", "aura"]), ["plain"],
    "#b9825a", "#f3dcc0", "#ffd84a", "honey", [], "The guardian of the Hazelwild. Only a true collector can befriend it."),
];
export const SPECIES_BY_ID: Record<string, Species> = Object.fromEntries(SPECIES.map((s) => [s.id, s]));
export const COLLECTABLE = SPECIES.filter((s) => s.rarity < 4);

export interface Biome { id: string; name: string; emoji: string; need: number; spot: string; sky: [string, string]; ground: string; decor: string[]; blurb: string }
export const BIOMES: Biome[] = [
  { id: "meadow", name: "Sunny Meadow", emoji: "🌼", need: 0, spot: "🌿", sky: ["#8fd3ff", "#d9f7ff"], ground: "#6fcf6a", decor: ["🌼", "🌷", "🦋", "🌳", "☁️"], blurb: "Flowers, butterflies and gentle friends." },
  { id: "forest", name: "Misty Forest", emoji: "🌲", need: 4, spot: "🍄", sky: ["#9bb8d3", "#d6e6df"], ground: "#4f9d5f", decor: ["🌲", "🍄", "🌳", "🦉", "🌫️"], blurb: "Tall trees, soft fog and sleepy night creatures." },
  { id: "shore", name: "Sparkle Shore", emoji: "🏖️", need: 8, spot: "🐚", sky: ["#7fd6f5", "#e0f7ff"], ground: "#f4d58d", decor: ["🐚", "🌊", "🌴", "🦀", "⛱️"], blurb: "Waves, shells and splashy pals." },
  { id: "cave", name: "Crystal Cave", emoji: "💎", need: 12, spot: "💎", sky: ["#3b2a6b", "#6a4fb0"], ground: "#5b4a86", decor: ["💎", "🔮", "✨", "🌋", "🔥"], blurb: "Glittering gems and warm glowing rocks." },
  { id: "peak", name: "Star Peak", emoji: "🏔️", need: 16, spot: "☁️", sky: ["#1b1b4d", "#4a3f9b"], ground: "#8d98c9", decor: ["🏔️", "⭐", "🌙", "☄️", "✨"], blurb: "Up above the clouds, where the sky sparkles." },
];

export const STAGE_AT = [0, 14, 40];
export type FormKey = "1" | "2" | "3s" | "3m";
export const FORM_KEYS: FormKey[] = ["1", "2", "3s", "3m"];
export const FORM_LABEL: Record<FormKey, string> = { "1": "Baby", "2": "Grown", "3s": "Sunlit", "3m": "Moonlit" };
export const formName = (sp: Species, key: FormKey) => (key === "1" ? sp.names[0] : key === "2" ? sp.names[1] : `${key === "3s" ? "Sunlit" : "Moonlit"} ${sp.names[2]}`);
export const familyMembers = (el: ElementId) => COLLECTABLE.filter((s) => s.element === el); // bond points needed for stage 1, 2, 3
export const RARITY_LABEL = ["", "Common", "Uncommon", "Rare", "Legendary"];

export interface Variant { name: string; emoji: string; main: string; light: string; accent: string; blurb: string }
export const VARIANTS: Record<VariantId, Variant> = {
  golden: { name: "Golden", emoji: "🌟", main: "#f2c230", light: "#fff1b8", accent: "#fff7d6", blurb: "Shimmers like treasure. Super rare!" },
  storm: { name: "Storm", emoji: "⚡", main: "#5d6b8c", light: "#c7d2ea", accent: "#ffe14a", blurb: "Crackles with thunder and lightning." },
  shadow: { name: "Shadow", emoji: "🌑", main: "#3d3560", light: "#7a6fa8", accent: "#c07bff", blurb: "Hides in the dark with glowing eyes." },
  autumn: { name: "Autumn", emoji: "🍂", main: "#d9742f", light: "#f7d9a6", accent: "#8f4a1f", blurb: "Wears the warm colors of falling leaves." },
};
/** Old names (from before the animal-name update), so saved friends can be renamed. */
export const LEGACY_NAMES: Record<string, string[]> = {
  mossling: ["Mossling", "Mossbloom", "Mossgrove"], bramblit: ["Bramblit", "Bramblop", "Bramblord"], fernfox: ["Sproutail", "Fernail", "Verdantail"],
  bubbo: ["Bubbo", "Bubbolo", "Bubbarch"], ripplet: ["Ripplet", "Rippleon", "Ripplord"], pearlin: ["Pearlin", "Pearlina", "Pearlux"],
  embit: ["Embit", "Emberly", "Emberoyal"], cindercub: ["Cindercub", "Cinderpaw", "Cinderlion"], sparkit: ["Sparkit", "Flickerit", "Blazekit"],
  puffsun: ["Puffsun", "Dandesun", "Solarmane"], sunbun: ["Sunbun", "Sunnibun", "Solbunny"], dawnlet: ["Dawnlet", "Dawnwing", "Dawnflare"],
  moonpuff: ["Moonpuff", "Moonfluff", "Lunafluff"], lunalet: ["Lunalet", "Lunamoth", "Lunarch"], hushowl: ["Hushling", "Hushowl", "Hushwise"],
  twinklet: ["Twinklet", "Twinklestar", "Twinklarch"], cometail: ["Cometit", "Cometail", "Cometarch"], stellacorn: ["Starfoal", "Stellacorn", "Celestacorn"],
  lunacorn: ["Moonfoal", "Lunacorn", "Eclipsecorn"],
};
