// The pets. Each pet is just a traits entry: a procedural rig (rig.ts) builds the low-poly body from it. To add a pet: add an entry here.
// When a photo arrives, someone reads it and fills these fields (fur colours, ears, tail, size). Photos themselves are NOT stored in the repo.
export type Ears = "pointy" | "floppy" | "round";
export type Tail = "long" | "curly" | "fluffy" | "stub";
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
  patch?: { x: number; y: number; z: number; r: number }; // a coloured patch on the body (accent colour)
  sound: "bark" | "meow";
}

export const PETS: PetTraits[] = [
  // Traits read from the family's photos (2026-11-17). The photos are not stored here.
  { id: "nova", name: "Nova", species: "dog", size: 1.0, main: "#25222c", second: "#f4f1ea", accent: "#25222c", nose: "#2b2540", eye: "#7a5230", collar: "#f59ac0", ears: "pointy", tail: "curly", snout: 0.55, sound: "bark" },     // black and white dog: white blaze, chest and paws, tall upright ears, tail curled over her back
  { id: "leeloo", name: "Leeloo", species: "cat", size: 0.9, main: "#25222c", second: "#f4f1ea", accent: "#25222c", nose: "#7a5560", eye: "#d6a02a", ears: "pointy", tail: "long", snout: 0.1, sound: "meow" },                          // black cat with a white bib and white paws, amber eyes
  { id: "aslan", name: "Aslan", species: "cat", size: 1.2, main: "#e39a3a", second: "#f6d8a8", accent: "#c9772a", nose: "#e58aa5", eye: "#d6a02a", ears: "pointy", tail: "fluffy", snout: 0.12, stripes: true, sound: "meow" },     // big fluffy golden lion cat with darker orange stripes
  { id: "neo", name: "Neo", species: "cat", size: 0.95, main: "#8a7a66", second: "#f1ede6", accent: "#3e3a36", nose: "#d98a9a", eye: "#9fc7a0", ears: "pointy", tail: "long", snout: 0.1, stripes: true, sound: "meow" },        // the merle-coloured tabby: grey-brown with dark stripes, white belly, chest and paws, green eyes
  { id: "ember", name: "Ember", species: "cat", size: 0.75, main: "#25222c", second: "#f7f2ea", accent: "#e58a3a", nose: "#e8a0a8", eye: "#c9a227", collar: "#9aa8b8", earColor: "#25222c", tailColor: "#25222c", ears: "pointy", tail: "long", snout: 0.1, patch: { x: 0.12, y: 0.2, z: 0.1, r: 0.32 }, sound: "meow" }, // calico kitten: black, white and an orange patch
];
export const petById = (id: string) => PETS.find((p) => p.id === id) ?? PETS[0];
