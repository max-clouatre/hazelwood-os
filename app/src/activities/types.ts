import type { ComponentType } from "react";
import type { ProfileId } from "../lib/store";

export interface ActivityProps { profile: ProfileId }
export interface Activity {
  id: string;
  title: string;
  emoji: string;
  titles?: Partial<Record<ProfileId, string>>; // per-child title override
  color: string; // tailwind gradient classes
  profiles: ProfileId[];
  Component: ComponentType<ActivityProps>;
}

export const titleOf = (a: Activity, p: ProfileId) => a.titles?.[p] ?? a.title;
