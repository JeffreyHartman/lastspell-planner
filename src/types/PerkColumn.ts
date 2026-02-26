import { SelectedPerk } from "./SelectedPerk";

export interface PerkColumnType {
  id: number;
  type: string;
  perks: SelectedPerk[];
}
