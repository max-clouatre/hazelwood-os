// Short piano lessons. A step shows `text`, lights the keys in `seq` one after another, and moves on when each is played in order.
// `any` instead of `seq` means "tap any N keys". Lessons use the keys C4 to C5, so the keyboard is the same for all of them.
export interface Step { text: string; seq?: string[]; any?: number }
export interface Lesson { id: string; title: string; emoji: string; blurb: string; steps: Step[] }

export const LESSONS: Lesson[] = [
  { id: "hello", title: "Hello, Piano!", emoji: "👋", blurb: "Touch the keys and listen.", steps: [
    { text: "Tap any 3 keys. Hear that? That's a piano!", any: 3 },
    { text: "Tap keys on the left. Low notes sound deep. Tap keys on the right. High notes sound squeaky!", any: 4 } ] },
  { id: "middle-c", title: "Find Middle C", emoji: "🎯", blurb: "The most famous key.", steps: [
    { text: "Look for two black keys together. The white key just to the left of them is C. Tap the glowing C!", seq: ["C4"] },
    { text: "Great! Tap C three more times.", seq: ["C4", "C4", "C4"] } ] },
  { id: "walk-up", title: "Walk Up: C D E", emoji: "🚶", blurb: "Three keys in a row.", steps: [
    { text: "Walk up the stairs. Tap C, then D, then E.", seq: ["C4", "D4", "E4"] },
    { text: "Now walk back down. E, D, C.", seq: ["E4", "D4", "C4"] } ] },
  { id: "five-finger", title: "Five Finger Walk", emoji: "🖐️", blurb: "C D E F G and back.", steps: [
    { text: "Use one finger for each key. Walk up: C D E F G.", seq: ["C4", "D4", "E4", "F4", "G4"] },
    { text: "And back down: G F E D C.", seq: ["G4", "F4", "E4", "D4", "C4"] } ] },
  { id: "black-keys", title: "Black Keys", emoji: "⬛", blurb: "Twos and threes.", steps: [
    { text: "The black keys come in groups. First the group of two. Tap them!", seq: ["C#4", "D#4"] },
    { text: "Now the group of three. Tap them!", seq: ["F#4", "G#4", "A#4"] },
    { text: "Black keys sound spooky. Play the three again, low to high.", seq: ["F#4", "G#4", "A#4"] } ] },
  { id: "a-b", title: "Meet A and B", emoji: "🔤", blurb: "The rest of the letters.", steps: [
    { text: "The piano uses seven letters: C D E F G A B, then it starts again. Find A.", seq: ["A4"] },
    { text: "Now B, then the next C up high!", seq: ["B4", "C5"] },
    { text: "Play all seven letters, then high C: C D E F G A B C.", seq: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"] } ] },
  { id: "buns", title: "Your First Song", emoji: "🥐", blurb: "Hot Cross Buns.", steps: [
    { text: "Three notes make a song! E, D, C.", seq: ["E4", "D4", "C4"] },
    { text: "Once more: E, D, C.", seq: ["E4", "D4", "C4"] },
    { text: "Now the fast part: C C C C, D D D D.", seq: ["C4", "C4", "C4", "C4", "D4", "D4", "D4", "D4"] },
    { text: "And the ending: E, D, C. You are playing Hot Cross Buns!", seq: ["E4", "D4", "C4"] } ] },
  { id: "mary", title: "Mary Had a Little Lamb", emoji: "🐑", blurb: "A real tune.", steps: [
    { text: "First line: E D C D E E E.", seq: ["E4", "D4", "C4", "D4", "E4", "E4", "E4"] },
    { text: "Second line: D D D, then E G G.", seq: ["D4", "D4", "D4", "E4", "G4", "G4"] },
    { text: "Now the first line again: E D C D E E E E.", seq: ["E4", "D4", "C4", "D4", "E4", "E4", "E4", "E4"] },
    { text: "The ending: D D E D C. You can play a whole song!", seq: ["D4", "D4", "E4", "D4", "C4"] } ] },
];
