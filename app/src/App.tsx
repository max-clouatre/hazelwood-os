import { useEffect, useState } from "react";
import { ACTIVITIES } from "./activities/registry";
import { TopBar } from "./components/TopBar";
import { unlockAudio } from "./lib/audio";
import type { ProfileId } from "./lib/store";
import { Home } from "./screens/Home";
import { PROFILES, ProfilePicker } from "./screens/ProfilePicker";

// Tiny state machine instead of a router: picker -> home -> activity.
export default function App() {
  const [profile, setProfile] = useState<ProfileId | null>(null);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    const stop = (e: Event) => e.preventDefault();
    window.addEventListener("contextmenu", stop);
    window.addEventListener("pointerdown", unlockAudio, { once: true });
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); window.removeEventListener("contextmenu", stop); };
  }, []);

  const activity = ACTIVITIES.find((a) => a.id === activityId);
  let body;
  if (!profile) body = <ProfilePicker onPick={setProfile} />;
  else if (!activity) body = <Home profile={profile} onOpen={setActivityId} onHome={() => setProfile(null)} />;
  else {
    body = (
      <div className={`flex h-full flex-col bg-gradient-to-br ${PROFILES[profile].bg}`}>
        <TopBar profile={profile} title={activity.title} onHome={() => setActivityId(null)} />
        <div className="min-h-0 flex-1"><activity.Component profile={profile} /></div>
      </div>
    );
  }
  return (
    <>
      {body}
      <div className="pointer-events-none fixed bottom-1 left-2 rounded-full bg-black/40 px-2 py-0.5 text-xs">{online ? "online" : "offline"}</div>
    </>
  );
}
