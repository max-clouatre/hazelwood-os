import { useState } from "react";
import { ParentArea } from "./ParentArea";
import { ParentGate } from "./ParentGate";

export function BreakScreen({ name }: { name: string }) {
  const [step, setStep] = useState<"idle" | "gate" | "area">("idle");
  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-5 bg-night p-8 text-center">
      <span className="emoji anim-bob text-[8rem] leading-none">🌙</span>
      <h1 className="text-4xl font-bold">Great playing, {name}!</h1>
      <p className="text-2xl">It's time for a break. See you tomorrow!</p>
      <button onClick={() => setStep("gate")} className="mt-6 rounded-xl bg-white/15 px-5 py-2 text-lg">Grown-up</button>
      {step === "gate" && <ParentGate onPass={() => setStep("area")} onCancel={() => setStep("idle")} />}
      {step === "area" && <ParentArea onClose={() => setStep("idle")} />}
    </div>
  );
}
