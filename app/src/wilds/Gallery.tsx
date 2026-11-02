import { COLLECTABLE, SPECIES_BY_ID, VARIANTS } from "./species";
import { Creature } from "./Creature";
import type { Personality, VariantId } from "./species";

const PERS: Personality[] = ["gentle", "zippy", "sleepy", "brave", "shy", "silly"];
const VARS = Object.keys(VARIANTS) as VariantId[];
/** Developer-only art preview. Open the app with #wilds-gallery after the address. */
export default function Gallery() {
  const list = [...COLLECTABLE, SPECIES_BY_ID.hazelwisp];
  return (
    <div className="h-full overflow-auto bg-indigo-950 p-2">
      <div className="grid gap-1" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {list.flatMap((s, i) => ([["1"], ["2"], ["3", "sun"], ["3", "moon"]] as const).map(([st, br]) => (
          <div key={s.id + st + br} className="rounded bg-white/10 p-1 text-center text-[10px]">
            <Creature species={s} stage={+st as 1 | 2 | 3} branch={br as "sun" | "moon" | undefined} seed={i * 3 + +st} personality={PERS[(i + +st) % 6]} className="mx-auto h-28 w-28" />
            {s.names[+st - 1]}{br ? ` (${br})` : ""} · {s.kind}
          </div>
        )))}
        {VARS.flatMap((v) => ["mossling", "fernfox", "hushowl", "stellacorn"].map((id, i) => (
          <div key={v + id} className="rounded bg-white/10 p-1 text-center text-[10px]">
            <Creature species={SPECIES_BY_ID[id]} stage={3} variant={v} seed={9 + i} className="mx-auto h-28 w-28" />
            {VARIANTS[v].name} {SPECIES_BY_ID[id].kind}
          </div>
        )))}
      </div>
    </div>
  );
}
