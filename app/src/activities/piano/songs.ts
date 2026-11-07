// The song book. Notes use the format described in lib/piano.ts (parseSong). All of these tunes are traditional or public domain.
// Classical pieces are simplified openings. Songs that are still under copyright are NOT bundled: grown-ups add those under My Songs.
export interface SongDef { id: string; title: string; emoji: string; cat: "kids" | "holiday" | "dads"; bpm: number; notes: string; blurb?: string }

export const SONGS: SongDef[] = [
  { id: "twinkle", title: "Twinkle Twinkle", emoji: "⭐", cat: "kids", bpm: 100, notes: "C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2 G4 G4 F4 F4 E4 E4 D4:2 G4 G4 F4 F4 E4 E4 D4:2 C4 C4 G4 G4 A4 A4 G4:2 F4 F4 E4 E4 D4 D4 C4:2", blurb: "Also the ABC song and Baa Baa Black Sheep!" },
  { id: "mary", title: "Mary Had a Little Lamb", emoji: "🐑", cat: "kids", bpm: 110, notes: "E4 D4 C4 D4 E4 E4 E4:2 D4 D4 D4:2 E4 G4 G4:2 E4 D4 C4 D4 E4 E4 E4 E4 D4 D4 E4 D4 C4:3" },
  { id: "hotcross", title: "Hot Cross Buns", emoji: "🥐", cat: "kids", bpm: 100, notes: "E4 D4 C4:2 E4 D4 C4:2 C4:.5 C4:.5 C4:.5 C4:.5 D4:.5 D4:.5 D4:.5 D4:.5 E4 D4 C4:2", blurb: "Just three notes!" },
  { id: "row", title: "Row, Row, Row Your Boat", emoji: "🚣", cat: "kids", bpm: 100, notes: "C4 C4 C4:.75 D4:.25 E4 E4:.75 D4:.25 E4:.75 F4:.25 G4:2 C5:.33 C5:.33 C5:.34 G4:.33 G4:.33 G4:.34 E4:.33 E4:.33 E4:.34 C4:.33 C4:.33 C4:.34 G4:.75 F4:.25 E4:.75 D4:.25 C4:2" },
  { id: "birthday", title: "Happy Birthday", emoji: "🎂", cat: "kids", bpm: 100, notes: "G4:.75 G4:.25 A4 G4 C5 B4:2 G4:.75 G4:.25 A4 G4 D5 C5:2 G4:.75 G4:.25 G5 E5 C5 B4 A4:2 F5:.75 F5:.25 E5 C5 D5 C5:2" },
  { id: "macdonald", title: "Old MacDonald", emoji: "🐄", cat: "kids", bpm: 110, notes: "C4 C4 C4 G4 A4 A4 G4:2 E4 E4 D4 D4 C4:2 G4:1 C4 C4 C4 G4 A4 A4 G4:2 E4 E4 D4 D4 C4:2" },
  { id: "itsy", title: "Itsy Bitsy Spider", emoji: "🕷️", cat: "kids", bpm: 110, notes: "G4:.5 C4:.75 C4:.25 C4:.5 D4:.5 E4:.75 E4:.25 E4:.5 D4:.5 C4:.5 D4:.5 E4:.5 C4:1.5 E4:.5 E4:.5 F4:.5 G4:1 G4:.5 F4:.5 E4:.5 F4:.5 G4:.5 E4:1.5 C4:.5 C4:.5 D4:.5 E4:1 E4:.5 D4:.5 C4:.5 D4:.5 E4:.5 C4:1.5" },
  { id: "london", title: "London Bridge", emoji: "🌉", cat: "kids", bpm: 110, notes: "G4:.75 A4:.25 G4 F4 E4 F4 G4:2 D4 E4 F4:2 E4 F4 G4:2 G4:.75 A4:.25 G4 F4 E4 F4 G4:2 D4:2 G4:2 E4:1 C4:3" },
  { id: "frere", title: "Frère Jacques", emoji: "🔔", cat: "kids", bpm: 110, notes: "C4 D4 E4 C4 C4 D4 E4 C4 E4 F4 G4:2 E4 F4 G4:2 G4:.5 A4:.5 G4:.5 F4:.5 E4 C4 G4:.5 A4:.5 G4:.5 F4:.5 E4 C4 C4 G3 C4:2 C4 G3 C4:2" },
  { id: "yankee", title: "Yankee Doodle", emoji: "🎩", cat: "kids", bpm: 120, notes: "C4 C4 D4 E4 C4 E4 D4 G3 C4 C4 D4 E4 C4:2 B3:2 C4 C4 D4 E4 F4 E4 D4 C4 B3 G3 A3 B3 C4:2 C4:2" },
  { id: "susanna", title: "Oh! Susanna", emoji: "🪕", cat: "kids", bpm: 120, notes: "C4 D4 E4 G4 G4:1.5 A4:.5 G4 E4 C4:1.5 D4:.5 E4 E4 D4 C4 D4:3 R:1 C4 D4 E4 G4 G4:1.5 A4:.5 G4 E4 C4:1.5 D4:.5 E4 E4 D4 D4 C4:3" },
  { id: "jingle", title: "Jingle Bells", emoji: "🛷", cat: "holiday", bpm: 120, notes: "E4 E4 E4:2 E4 E4 E4:2 E4 G4 C4:1.5 D4:.5 E4:4 F4 F4 F4:1.5 F4:.5 F4 E4 E4 E4:.5 E4:.5 E4 D4 D4 E4 D4:2 G4:2" },
  { id: "wewish", title: "We Wish You a Merry Christmas", emoji: "🎄", cat: "holiday", bpm: 130, notes: "D4:1 G4:1 G4:.5 A4:.5 G4:.5 F#4:.5 E4:1 E4:1 E4:1 A4:1 A4:.5 B4:.5 A4:.5 G4:.5 F#4:1 D4:1 D4:1 B4:1 B4:.5 C5:.5 B4:.5 A4:.5 G4:1 E4:1 D4:.5 D4:.5 E4:1 A4:1 F#4:1 G4:2", blurb: "Has two black keys (F sharp)!" },
  { id: "ode", title: "Ode to Joy", emoji: "🎼", cat: "dads", bpm: 110, notes: "E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 E4:1.5 D4:.5 D4:2 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4:1.5 C4:.5 C4:2 D4 D4 E4 C4 D4 E4:.5 F4:.5 E4 C4 D4 E4:.5 F4:.5 E4 D4 C4 D4 G3:2 E4 E4 F4 G4 G4 F4 E4 D4 C4 C4 D4 E4 D4:1.5 C4:.5 C4:2", blurb: "Beethoven, 1824" },
  { id: "elise", title: "Für Elise", emoji: "🎹", cat: "dads", bpm: 100, notes: "E5:.5 D#5:.5 E5:.5 D#5:.5 E5:.5 B4:.5 D5:.5 C5:.5 A4:1.5 R:.5 C4:.5 E4:.5 A4:.5 B4:1.5 R:.5 E4:.5 G#4:.5 B4:.5 C5:1.5 R:.5 E4:.5 E5:.5 D#5:.5 E5:.5 D#5:.5 E5:.5 B4:.5 D5:.5 C5:.5 A4:1.5 R:.5 C4:.5 E4:.5 A4:.5 B4:1.5 R:.5 E4:.5 C5:.5 B4:.5 A4:2", blurb: "Beethoven. The famous opening, simplified." },
  { id: "greensleeves", title: "Greensleeves", emoji: "🌿", cat: "dads", bpm: 100, notes: "A4:1 C5:2 D5:1 E5:1.5 F5:.5 E5:1 D5:2 B4:1 G4:1.5 A4:.5 B4:1 C5:2 A4:1 A4:1.5 G#4:.5 A4:1 B4:2 G#4:1 E4:2 A4:1 C5:2 D5:1 E5:1.5 F5:.5 E5:1 D5:2 B4:1 G4:1.5 A4:.5 B4:1 C5:1.5 B4:.5 A4:1 G#4:1.5 F#4:.5 G#4:1 A4:3", blurb: "A 16th century English folk tune" },
  { id: "entertainer", title: "The Entertainer", emoji: "🎩", cat: "dads", bpm: 110, notes: "D4:.25 D#4:.25 E4:.25 C5:.75 E4:.25 C5:.75 E4:.25 C5:1.5 C5:.25 D5:.25 D#5:.25 E5:.25 C5:.25 D5:.25 E5:.5 B4:.25 D5:.5 C5:1.5", blurb: "Scott Joplin, 1902. The opening, simplified." },
  { id: "auld", title: "Auld Lang Syne", emoji: "🎆", cat: "dads", bpm: 90, notes: "D4:1 G4:1.5 G4:.5 G4:1 B4:1 A4:1.5 G4:.5 A4:1 B4:.5 A4:.5 G4:1.5 G4:.5 B4:1 D5:1 E5:3 R:1 E5:1.5 D5:.5 B4:1 B4:1 D5:1.5 B4:.5 A4:1 G4:.5 A4:.5 G4:1.5 E4:.5 E4:1 D4:1 G4:3", blurb: "Traditional Scottish, for New Year's Eve" },
];
export const CATS: { id: SongDef["cat"] | "mine"; name: string; emoji: string; color: string; note?: string }[] = [
  { id: "kids", name: "Kids' Songs", emoji: "🧸", color: "#e5736b" },
  { id: "holiday", name: "Holiday", emoji: "🎄", color: "#3f9a5f" },
  { id: "dads", name: "Dads' Corner", emoji: "🎸", color: "#3f8fd0", note: "Classics for grown-up taste. Want Mad World? Add it under My Songs." },
  { id: "mine", name: "My Songs", emoji: "✏️", color: "#8a6bbf", note: "Songs you type in yourself. They stay on this tablet." },
];
