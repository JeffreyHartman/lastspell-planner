import perks from "../perks.json";
import { Perk } from "../types/Perk";

export const getPerksByTypeAndTier = (type: string, tier: number): Perk[] => {
  return perks.filter((perk) => perk.type === type && perk.tier === tier);
};

export const getAllPerks = (): Perk[] => {
  return perks;
};

export const getPerksByType = (type: string): Perk[] => {
  return perks.filter((perk) => perk.type === type);
};

export const getPerksByTier = (tier: number): Perk[] => {
  return perks.filter((perk) => perk.tier === tier);
};
