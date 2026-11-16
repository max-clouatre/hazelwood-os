// Hazel's weekly spelling list from school. To change it: edit WEEKLY_LIST (new id, new words) and ship the app.
// When the tablet updates, a list with a newer id replaces the current one once (words she needs again are kept if they are still on it).
// After that, edits in the Grown-up area stick until the next id ships.
// SENTENCES are read aloud after the word (like a teacher: word, sentence, word). STARTS drive the "Starts" fill-in-the-gap game.
export const WEEKLY_LIST = {
  id: "2026-11-16",
  name: "Skills 3",
  test: "Tuesday, Nov 17",
  words: ["knotted", "knitting", "knocked", "wringing", "wronged", "whipped", "whined", "quitting", "quacked", "all"],
};

export const SENTENCES: Record<string, string> = {
  knotted: "Her shoelaces were knotted together.",
  knitting: "Grandma is knitting a warm hat.",
  knocked: "Someone knocked on the front door.",
  wringing: "She was wringing water out of her wet sock.",
  wronged: "He felt wronged when he lost his turn.",
  whipped: "Dad whipped the cream for the pie.",
  whined: "The puppy whined at the door.",
  quitting: "We are quitting the game to eat dinner.",
  quacked: "The duck quacked at the bread.",
  all: "We ate all of the cookies.",
  // the previous list keeps its sentences so a re-used word still has one
  page: "Turn the page of the book.", germ: "A germ is too small to see.", digit: "The number 7 has one digit.", gray: "The sky was gray today.",
  space: "The rocket flew into space.", face: "She drew a smiling face.", cell: "Every living thing is made of cells.", center: "Stand in the center of the circle.",
  carpet: "The cat sleeps on the carpet.", are: "We are going to the park.",
};
export const sentenceOf = (word: string): string | undefined => SENTENCES[word.toLowerCase()];
/** What is spoken for a word: the word, its sentence, then the word again (like a teacher at a spelling test). */
export const readAloud = (word: string): string => { const s = sentenceOf(word); return s ? `${word}. ${s} ${word}.` : word; };

export interface StartDef { start: string; rest: string; options: string[] }
/** "Starts": the beginning of the word is hidden and she picks it from look-alike choices (the teacher's note: kn, wr, wh, qu). */
export const STARTS: Record<string, StartDef> = {
  knotted: { start: "kn", rest: "otted", options: ["kn", "n", "gn"] },
  knitting: { start: "kn", rest: "itting", options: ["kn", "n", "gn"] },
  knocked: { start: "kn", rest: "ocked", options: ["kn", "n", "gn"] },
  wringing: { start: "wr", rest: "inging", options: ["wr", "r"] },
  wronged: { start: "wr", rest: "onged", options: ["wr", "r"] },
  whipped: { start: "wh", rest: "ipped", options: ["wh", "w"] },
  whined: { start: "wh", rest: "ined", options: ["wh", "w"] },
  quitting: { start: "qu", rest: "itting", options: ["qu", "kw", "q"] },
  quacked: { start: "qu", rest: "acked", options: ["qu", "kw", "q"] },
};
