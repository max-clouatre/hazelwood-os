import { useEffect, useState } from "react";
import { Burst } from "../components/Burst";
import { Catch } from "../wilds/Catch";
import { Dex } from "../wilds/Dex";
import { Duel } from "../wilds/Duel";
import { Eggs } from "../wilds/Eggs";
import { Zone } from "../wilds/Zone";
import type { Mode } from "../wilds/ModeTabs";
import { Starter } from "../wilds/Hub";
import { Landing } from "../wilds/Landing";
import type { Nav } from "../wilds/Landing";
import { Detail, MyWilds } from "../wilds/Collection";
import { Reveal } from "../wilds/Reveal";
import { BerryGuide } from "../wilds/BerryGuide";
import { BadgeOverlay, Tips } from "../wilds/Overlays";
import { addOwned, bump, dailyVisitorSpecies, makeOwned, rollDay, rollShiny, rollVariant, setWilds, wilds } from "../wilds/game";
import { SPECIES_BY_ID } from "../wilds/species";
import { BIOMES } from "../wilds/species";
import type { Biome } from "../wilds/species";
import type { Owned } from "../wilds/types";
import { useStore } from "../lib/store";
import { playTheme, stopMusic } from "../lib/music";
import { setNarrator } from "../lib/speech";
import type { ThemeId } from "../lib/music";
import type { ActivityProps } from "./types";

type View =
  | { n: "hub" } | { n: "zone"; biome: Biome; mode: Mode } | { n: "wilds" } | { n: "detail"; id: string } | { n: "dex" } | { n: "eggs" } | { n: "duel" }
  | { n: "catch"; draft: Owned; biome: Biome; bonus: number; headline: string; visitor: boolean };

export default function Hazelwild(_: ActivityProps) {
  const { wilds: w } = useStore();
  const [view, setView] = useState<View>({ n: "hub" });
  const [draft, setDraft] = useState<{ o: Owned; back: View; visitor: boolean } | null>(null);
  const [legend, setLegend] = useState<Owned | null>(null);
  const [starter, setStarter] = useState<Owned | null>(null);
  const [guide, setGuide] = useState(false);
  const [tips, setTips] = useState(false);
  useEffect(() => { rollDay(); }, []);
  // Songs: calm at the menus, each zone has its own while exploring (faster while catching), a fast one for duels.
  const themeKey = view.n === "zone" || view.n === "catch" ? view.biome.id : view.n === "duel" ? "duel" : "hub"; // one song for a whole zone visit (no restart when a catch starts)
  useEffect(() => {
    playTheme(themeKey as ThemeId);
  }, [themeKey]);
  useEffect(() => () => stopMusic(), []);
  useEffect(() => { setNarrator(w.voice === true); }, [w.voice]);
  useEffect(() => () => setNarrator(true), []); // other activities keep their voice (Hazelwild only is quiet)
  useEffect(() => { const f = () => setGuide(true); window.addEventListener("wilds:guide", f); return () => window.removeEventListener("wilds:guide", f); }, []);

  // Add the creature, and celebrate if that completed the Wilddex.
  const adopt = (o: Owned, name: string, caught = false) => {
    const completed = addOwned({ ...o, name });
    if (caught) { bump("catch"); bump("catchEl", SPECIES_BY_ID[o.sp].element); }
    if (completed) { const l = wilds().owned[wilds().owned.length - 1]; setLegend(l); }
  };

  if (!w.started) {
    return (
      <div className="relative h-full">
        <Starter onPick={(sp) => setStarter(makeOwned(sp, false))} />
        {starter && <Reveal draft={starter} headline="Your first friend!" onDone={(name) => { adopt(starter, name); setWilds(() => ({ started: true })); setStarter(null); setTips(true); }} />}
      </div>
    );
  }

  const toHub = () => setView({ n: "hub" });
  const startCatch = (draft: Owned, biome: Biome, bonus: number, headline: string, visitor: boolean) =>
    setView({ n: "catch", draft, biome, bonus, headline, visitor });

  return (
    <div className="relative h-full overflow-hidden">
      {view.n === "hub" && (
        <Landing w={w}
          onExplore={(b) => setView({ n: "zone", biome: b, mode: "explore" })}
          onVisitor={() => startCatch(makeOwned(dailyVisitorSpecies(), rollShiny(0.06), undefined, rollVariant()), BIOMES[0], 0.25, "Daily Visitor:", true)}
          onNav={(n: Nav) => setView({ n })} onTips={() => setTips(true)} />
      )}
      {view.n === "zone" && (
        <Zone biome={view.biome} mode={view.mode} onMode={(m) => setView({ ...view, mode: m })} onBack={toHub}
          onEncounter={(draft, lure) => startCatch(draft, view.biome, lure ? 0.1 : 0, lure ? "Your lure worked! A special" : "A wild", false)} />
      )}
      {view.n === "catch" && (
        <Catch draft={view.draft} biome={view.biome} bonus={view.bonus} headline={view.headline}
          onCaught={() => setDraft({ o: view.draft, back: view.visitor ? { n: "hub" } : { n: "zone", biome: view.biome, mode: "explore" }, visitor: view.visitor })}
          onFled={() => setView(view.visitor ? { n: "hub" } : { n: "zone", biome: view.biome, mode: "explore" })} />
      )}
      {view.n === "wilds" && <MyWilds onOpen={(id) => setView({ n: "detail", id })} onBack={toHub} />}
      {view.n === "detail" && <Detail id={view.id} onBack={() => setView({ n: "wilds" })} />}
      {view.n === "dex" && <Dex onBack={toHub} />}
      {view.n === "eggs" && <Eggs onBack={toHub} onAdopt={adopt} />}
      {view.n === "duel" && <Duel onBack={toHub} />}

      {w.newBadge && !draft && !legend && <BadgeOverlay id={w.newBadge} />}
      {tips && <Tips onClose={() => { setTips(false); setWilds(() => ({ tipSeen: true })); }} />}
      {guide && <BerryGuide onClose={() => setGuide(false)} />}
      {draft && (
        <Reveal draft={draft.o} headline={draft.o.shiny ? "You caught a shiny friend!" : "You caught a new friend!"} onDone={(name) => {
          adopt(draft.o, name, true);
          if (draft.visitor) setWilds(() => ({ visitorDone: true }));
          setView(draft.back); setDraft(null);
        }} />
      )}
      {legend && (
        <div className="absolute inset-0 z-40">
          <Burst emojis={["🌟", "⭐", "✨", "💖", "🏆"]} />
          <Reveal draft={legend} headline="🌟 Wilddex complete! A legendary friend joins you! 🌟" legendary onDone={(name) => { setWilds((x) => ({ owned: x.owned.map((o) => (o.id === legend.id ? { ...o, name } : o)) })); setLegend(null); }} />
        </div>
      )}
    </div>
  );
}

