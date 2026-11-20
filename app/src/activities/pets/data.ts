// The pets. Each pet is just a traits entry: a procedural rig (rig.ts) builds the low-poly body from it. To add a pet: add an entry here.
// When a photo arrives, someone reads it and fills these fields (fur colours, ears, tail, size). Photos themselves are NOT stored in the repo.
export type Ears = "pointy" | "floppy" | "round";
export type Tail = "long" | "curly" | "fluffy" | "stub";
/** A patch of colour. Body patches use the body's coordinates, head patches the head's (units scale with the pet). */
export interface Patch { on?: "body" | "head"; x: number; y: number; z: number; r: number; c: string }
export interface PetTraits {
  id: string; name: string; species: "dog" | "cat"; placeholder?: boolean;
  size: number;            // 0.7 to 1.3, 1 = a medium dog
  main: string;            // main fur colour
  second: string;          // chest, belly, paws, muzzle
  accent: string;          // ears, back saddle, stripes, patches
  nose: string; eye: string; collar?: string;
  earColor?: string;       // if the ears differ from the accent colour
  tailColor?: string;      // if the tail differs from the main colour
  ears: Ears; tail: Tail;
  snout: number;           // 0 (flat face) to 1 (long snout)
  stripes?: boolean;       // tabby stripes on the back and tail
  patches?: Patch[];       // coloured patches on the body or head (calico, spots)
  sound: "bark" | "meow";
}

export const PETS: PetTraits[] = [
  // Traits read from the family's photos (2026-11-17). The photos are not stored here.
  { id: "nova", name: "Nova", species: "dog", size: 1.0, main: "#25222c", second: "#f4f1ea", accent: "#25222c", nose: "#2b2540", eye: "#7a5230", collar: "#f59ac0", ears: "pointy", tail: "curly", snout: 0.55, sound: "bark" },     // black and white dog: white blaze, chest and paws, tall upright ears, tail curled over her back
  { id: "leeloo", name: "Leeloo", species: "cat", size: 0.9, main: "#25222c", second: "#f4f1ea", accent: "#25222c", nose: "#7a5560", eye: "#d6a02a", ears: "pointy", tail: "long", snout: 0.1, sound: "meow" },                          // black cat with a white bib and white paws, amber eyes
  { id: "aslan", name: "Aslan", species: "cat", size: 1.2, main: "#e39a3a", second: "#f6d8a8", accent: "#c9772a", nose: "#e58aa5", eye: "#d6a02a", ears: "pointy", tail: "fluffy", snout: 0.12, stripes: true, sound: "meow" },     // big fluffy golden lion cat with darker orange stripes
  { id: "neo", name: "Neo", species: "cat", size: 0.95, main: "#8a7a66", second: "#f1ede6", accent: "#3e3a36", nose: "#d98a9a", eye: "#9fc7a0", ears: "pointy", tail: "long", snout: 0.1, stripes: true, sound: "meow" },        // the merle-coloured tabby: grey-brown with dark stripes, white belly, chest and paws, green eyes
  { id: "ember", name: "Ember", species: "cat", size: 0.75, main: "#f7f2ea", second: "#fffaf2", accent: "#e58a3a", nose: "#e8a0a8", eye: "#c9a227", collar: "#9aa8b8", earColor: "#25222c", tailColor: "#25222c", ears: "pointy", tail: "long", snout: 0.1, sound: "meow",
    patches: [{ x: 0.08, y: 0.22, z: -0.05, r: 0.34, c: "#25222c" }, { x: -0.12, y: 0.2, z: 0.32, r: 0.2, c: "#e58a3a" }, { x: 0.14, y: 0.16, z: -0.38, r: 0.17, c: "#e58a3a" },
      { on: "head", x: -0.1, y: 0.62, z: 0.12, r: 0.17, c: "#25222c" }, { on: "head", x: 0.15, y: 0.6, z: 0.16, r: 0.13, c: "#e58a3a" }] }, // calico kitten: mostly white, with black and orange patches
];
export const petById = (id: string) => PETS.find((p) => p.id === id) ?? PETS[0];

// ---- things the girls can unlock and choose (bond = pats + meals + games + baths + naps + tricks)
export type AccId = "none" | "bow" | "hat" | "bandana" | "shades" | "crown";
export const ACCESSORIES: { id: AccId; name: string; emoji: string; need: number }[] = [
  { id: "none", name: "Nothing", emoji: "🐾", need: 0 }, { id: "bow", name: "Bow", emoji: "🎀", need: 0 }, { id: "hat", name: "Party hat", emoji: "🎉", need: 6 },
  { id: "bandana", name: "Bandana", emoji: "🧣", need: 12 }, { id: "shades", name: "Cool shades", emoji: "😎", need: 20 }, { id: "crown", name: "Crown", emoji: "👑", need: 35 },
];
export const THEMES = [
  { id: "cozy", name: "Cozy", emoji: "🏠", floorA: "#c98f56", floorB: "#d9a86a", wall: "#f2e6c8", wall2: "#ead9b8", wain: "#8fb8d9", rug: "#f2b84b", rug2: "#e5736b", bed: "#8a6bbf", bed2: "#c9b6f2" },
  { id: "sky", name: "Sky", emoji: "☁️", floorA: "#e8f1fb", floorB: "#cfe0f3", wall: "#bfe3ff", wall2: "#a9d6fb", wain: "#ffffff", rug: "#ffd23f", rug2: "#ff8fb8", bed: "#4fa8e0", bed2: "#bfe3ff" },
  { id: "candy", name: "Candy", emoji: "🍬", floorA: "#fff1f6", floorB: "#ffd9e6", wall: "#ffc8dd", wall2: "#ffb3d1", wain: "#c8f2e0", rug: "#a8e6cf", rug2: "#ffd23f", bed: "#ff8fb8", bed2: "#ffd9e6" },
  { id: "forest", name: "Forest", emoji: "🌲", floorA: "#a8693a", floorB: "#b87a45", wall: "#cfe8c0", wall2: "#bfdcae", wain: "#6fb06a", rug: "#e5534b", rug2: "#fff1d6", bed: "#5b8f5b", bed2: "#cfe8c0" },
  { id: "yard", name: "Yard", emoji: "🌳", yard: true, sky: "#8fd0f0", skyNight: "#14183a", floorA: "#5fbf5a", floorB: "#6fcf66", wall: "#fff6e6", wall2: "#fff6e6", wain: "#f2e6c8", rug: "#e5534b", rug2: "#ffffff", bed: "#4fa8e0", bed2: "#bfe3ff" },
];
export const BOND_LEVELS: { at: number; name: string }[] = [{ at: 0, name: "New friends" }, { at: 10, name: "Buddies" }, { at: 25, name: "Best friends" }, { at: 50, name: "Forever friends" }];
export const bondLevel = (bond: number) => [...BOND_LEVELS].reverse().find((l) => bond >= l.at)!.name;
