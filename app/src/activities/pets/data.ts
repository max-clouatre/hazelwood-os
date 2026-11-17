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
  ears: Ears; tail: Tail;
  snout: number;           // 0 (flat face) to 1 (long snout)
  stripes?: boolean;       // tabby stripes on the back and tail
  patch?: { x: number; y: number; z: number; r: number }; // a coloured patch on the body (accent colour)
  sound: "bark" | "meow";
}

export const PETS: PetTraits[] = [
  { id: "buddy", name: "Buddy", species: "dog", placeholder: true, size: 1.05, main: "#d9a24a", second: "#f3d9a0", accent: "#a8691f", nose: "#2b2540", eye: "#3a2418", collar: "#e5534b", ears: "floppy", tail: "long", snout: 0.6, sound: "bark" },
  { id: "mimi", name: "Mimi", species: "cat", placeholder: true, size: 0.85, main: "#8f96a3", second: "#e8e4f2", accent: "#5b6170", nose: "#e58aa5", eye: "#9fd36a", collar: "#8a6bbf", ears: "pointy", tail: "long", snout: 0.1, stripes: true, sound: "meow" },
];
export const petById = (id: string) => PETS.find((p) => p.id === id) ?? PETS[0];
