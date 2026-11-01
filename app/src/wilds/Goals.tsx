import { chime } from "../lib/audio";
import { say } from "../lib/speech";
import { claimGoal, GOAL_TEXT } from "./game";
import type { Goal } from "./types";

export function Goals({ goals }: { goals: Goal[] }) {
  if (!goals.length) return null;
  return (
    <div className="mx-auto w-full max-w-xl rounded-2xl bg-white/15 p-2">
      <p className="px-1 text-base font-bold">🎯 Today's goals</p>
      <div className="flex flex-col gap-1">
        {goals.map((g) => {
          const done = g.have >= g.target;
          return (
            <div key={g.id} className="flex items-center gap-2 rounded-xl bg-black/25 px-2 py-1">
              <div className="min-w-0 flex-1">
                <p className={`truncate text-base font-bold leading-tight ${g.claimed ? "text-white/50 line-through" : ""}`}>{GOAL_TEXT(g)}</p>
                <div className="h-2 overflow-hidden rounded-full bg-black/40"><div className="h-full bg-yellow-300 transition-all" style={{ width: `${(g.have / g.target) * 100}%` }} /></div>
              </div>
              {g.claimed ? <span className="emoji text-2xl">✅</span>
                : done ? <button onClick={() => { const r = claimGoal(g.id); chime(); say(`Goal done! ${r} berries!`); }} className="rounded-xl bg-mustard px-3 py-1 text-base font-bold text-black ring-4 ring-white active:scale-95">Claim +{g.reward} 🍓</button>
                : <span className="rounded-lg bg-black/30 px-2 text-sm font-bold">{g.have}/{g.target} · +{g.reward}🍓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
