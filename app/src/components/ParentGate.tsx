import { useMemo, useState } from "react";
import { rand, shuffle } from "../lib/util";

/** A small multiplication question that a 7-year-old is unlikely to beat. */
export function ParentGate({ onPass, onCancel }: { onPass: () => void; onCancel: () => void }) {
  const q = useMemo(() => {
    const a = 6 + rand(4), b = 6 + rand(4);
    const right = a * b;
    const opts = shuffle([right, right + 6, right - 6, right + 10].slice(0, 4));
    return { a, b, right, opts };
  }, []);
  const [wrong, setWrong] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-indigo-950/95 p-6">
      <p className="text-2xl">Grown-ups only</p>
      <p className="text-5xl font-bold">{q.a} × {q.b} = ?</p>
      <div className="flex flex-wrap justify-center gap-4">
        {q.opts.map((o) => (
          <button key={o} onClick={() => (o === q.right ? onPass() : setWrong(true))}
            className="h-20 w-28 rounded-2xl bg-white text-4xl font-bold text-indigo-900 active:scale-95">{o}</button>
        ))}
      </div>
      {wrong && <p className="text-xl text-red-300">Not quite. Try again.</p>}
      <button onClick={onCancel} className="rounded-xl bg-white/20 px-6 py-3 text-xl">Back</button>
    </div>
  );
}
