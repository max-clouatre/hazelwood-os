// The Animal Game's animals. Emoji are limited to older Unicode releases so they draw on the Android 11 tablet.
// To add an animal: one line in a category. To add a category: one entry in CATEGORIES.
export type Move = "hop" | "waddle" | "stomp" | "fly" | "swim" | "crawl" | "sway" | "run";
export interface Animal { e: string; name: string; act: string; sound: string; move: Move }
export interface Category { id: string; name: string; emoji: string; color: string; animals: Animal[] }

const A = (e: string, name: string, act: string, sound: string, move: Move): Animal => ({ e, name, act, sound, move });

export const CATEGORIES: Category[] = [
  { id: "pets", name: "Pets", emoji: "🐶", color: "#e5736b", animals: [
    A("🐶", "dog", "Wag your tail and pant!", "Woof woof!", "run"), A("🐱", "cat", "Stretch, then tiptoe like a cat!", "Meow!", "sway"),
    A("🐰", "bunny", "Hop hop hop with your bunny ears!", "Sniff sniff!", "hop"), A("🐹", "hamster", "Run and run on your wheel!", "Squeak squeak!", "run"),
    A("🐢", "turtle", "Walk nice and slow, with your shell!", "Hello, I am slow!", "crawl"), A("🦜", "parrot", "Flap your wings and copy me!", "Squawk! Hello!", "fly") ] },
  { id: "farm", name: "Farm", emoji: "🐮", color: "#e0a33a", animals: [
    A("🐮", "cow", "Chew chew and swish your tail!", "Moooo!", "sway"), A("🐷", "pig", "Waddle and roll in the mud!", "Oink oink!", "waddle"),
    A("🐑", "sheep", "Fluffy sheep, bounce along!", "Baaaa!", "hop"), A("🐔", "chicken", "Flap your wings and peck, peck!", "Bawk bawk!", "waddle"),
    A("🐴", "horse", "Gallop, gallop, gallop!", "Neigh!", "run"), A("🦆", "duck", "Waddle and flap your wings!", "Quack quack!", "waddle"),
    A("🐐", "goat", "Jump up high like a goat!", "Maaaa!", "hop") ] },
  { id: "safari", name: "Jungle", emoji: "🐘", color: "#c98a3a", animals: [
    A("🐘", "elephant", "Swing your trunk and stomp, stomp!", "Toot toot!", "stomp"), A("🦁", "lion", "Shake your big mane and roar!", "Roar!", "stomp"),
    A("🐒", "monkey", "Scratch and swing like a monkey!", "Ooh ooh aah aah!", "hop"), A("🦒", "giraffe", "Stretch your neck up, up, up!", "Munch munch!", "sway"),
    A("🦓", "zebra", "Trot like a stripy zebra!", "Neigh!", "run"), A("🐯", "tiger", "Creep, then pounce like a tiger!", "Grrr!", "stomp"),
    A("🦛", "hippo", "Wobble and open your big mouth!", "Hungry hippo!", "waddle"), A("🐊", "crocodile", "Crawl and snap, snap, snap!", "Snap snap!", "crawl"),
    A("🦍", "gorilla", "Beat your chest and stomp!", "Ooh ooh!", "stomp"), A("🐍", "snake", "Slither on the ground like a snake!", "Ssssss!", "crawl") ] },
  { id: "water", name: "Water", emoji: "🐸", color: "#3f8fd0", animals: [
    A("🐸", "frog", "Crouch down and hop like a frog!", "Ribbit ribbit!", "hop"), A("🐟", "fish", "Swim and wiggle your tail!", "Blub blub!", "swim"),
    A("🐙", "octopus", "Wave all eight arms!", "Wiggle wiggle!", "swim"), A("🐬", "dolphin", "Leap and flip like a dolphin!", "Eee eee!", "swim"),
    A("🦈", "shark", "Swim with your fin up!", "Dun dun dun dun!", "swim"), A("🦀", "crab", "Scuttle sideways and pinch!", "Click click!", "waddle"),
    A("🐳", "whale", "Swim slow and big, then spout!", "Whooooo!", "sway"), A("🐧", "penguin", "Waddle with your flippers down!", "Honk honk!", "waddle") ] },
  { id: "bugs", name: "Birds & Bugs", emoji: "🦋", color: "#8a6bbf", animals: [
    A("🦋", "butterfly", "Flutter your wings and float!", "Flutter flutter!", "fly"), A("🐝", "bee", "Buzz around the flowers!", "Bzzzzz!", "fly"),
    A("🐛", "caterpillar", "Wiggle along on your tummy!", "Munch munch!", "crawl"), A("🐞", "ladybug", "Tiny steps, tiny wings!", "Pitter patter!", "crawl"),
    A("🐜", "ant", "March in a line, carry a crumb!", "Tick tick!", "run"), A("🐌", "snail", "Slooow, slooow, slooow!", "Slide slide!", "crawl"),
    A("🦉", "owl", "Turn your head and flap your wings!", "Hoo hoo!", "sway"), A("🦅", "eagle", "Spread your wings and soar!", "Screee!", "fly"),
    A("🦩", "flamingo", "Stand on one leg, nice and tall!", "Honk!", "sway") ] },
  { id: "woods", name: "Woods", emoji: "🐻", color: "#4f9a5f", animals: [
    A("🐻", "bear", "Stand up tall and growl!", "Growl!", "stomp"), A("🦊", "fox", "Sneak and pounce like a fox!", "Ring ding ding!", "run"),
    A("🐺", "wolf", "Lift your head and howl!", "Awooo!", "sway"), A("🐿️", "squirrel", "Scamper and nibble an acorn!", "Chit chit!", "run"),
    A("🦌", "deer", "Leap light like a deer!", "Tip toe!", "hop"), A("🦔", "hedgehog", "Curl up into a spiky ball!", "Snuffle snuffle!", "waddle"),
    A("🐼", "panda", "Sit and munch bamboo!", "Munch munch!", "sway"), A("🐨", "koala", "Hug a tree and snooze!", "Yawn!", "sway"),
    A("🦘", "kangaroo", "Big bouncy jumps!", "Boing boing!", "hop") ] },
];
export const ALL_ANIMALS: Animal[] = CATEGORIES.flatMap((c) => c.animals);
