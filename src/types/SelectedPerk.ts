import { Perk } from "./Perk";

export type PerkPriority = "essential" | "bonus";

export interface SelectedPerk {
  perk: Perk;
  priority: PerkPriority;
}
