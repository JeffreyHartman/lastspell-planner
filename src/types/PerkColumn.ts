import { Perk } from "./Perk";
export interface PerkColumnType {
  id: number;
  type: string;
  perks: Perk[];
}
