import type { ComponentType } from "react";
import type { ProfileId } from "../lib/store";

export interface ActivityProps { profile: ProfileId }
export interface Activity {
  id: string;
  title: string;
  emoji: string;
  color: string; // tailwind gradient classes
  profiles: ProfileId[];
  Component: ComponentType<ActivityProps>;
}
