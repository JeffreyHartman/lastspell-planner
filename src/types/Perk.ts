import { Race } from "./Race";

export interface Perk {
  id: number;
  icon: string;
  type: string;
  name: string;
  tier: number;
  description: string;
  /** Races that can take this perk. Omitted means every race can. */
  races?: Race[];
  /** ID of the perk that this perk takes the place of for its `races`. */
  replaces?: number;
}
