import { COLLECTABLE, SPECIES_BY_ID } from "./species";
import { Creature } from "./Creature";
import type { Personality } from "./species";

const PERS: Personality[] = ["gentle", "zippy", "sleepy", "brave", "shy", "silly"];
/** Developer-only art preview. Open the app with #wilds-gallery after the address. */
export default function Gallery() {
  const list = [...COLLECTABLE, SPECIES_BY_ID.hazelwisp];
  return (
    <div className="h-full overflow-auto bg-indigo-950 p-2">
      <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {list.flatMap((s, i) => ([1, 2, 3] as const).map((st) => (
          <div key={s.id + st} className="rounded bg-white/10 p-1 text-center text-[10px]">
            <Creature species={s} stage={st} seed={i * 3 + st} personality={PERS[(i + st) % 6]} className="mx-auto h-36 w-36" shiny={st === 3 && i % 5 === 0} />
            {s.names[st - 1]} · {PERS[(i + st) % 6]}
          </div>
        )))}
      </div>
    </div>
  );
}
