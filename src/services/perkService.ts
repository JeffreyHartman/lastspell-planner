import perksData from "../perks.json";

import { Perk } from "../types/Perk";
import { Race } from "../types/Race";

const perks = perksData as Perk[];

const isAvailableForRace = (perk: Perk, race: Race): boolean =>
  !perk.races || perk.races.includes(race);

const isReplacedForRace = (perk: Perk, race: Race): boolean =>
  perks.some((other) => other.replaces === perk.id && isAvailableForRace(other, race));

export const getPerksByTypeAndTier = (
  type: string,
  tier: number,
  race: Race = "human",
): Perk[] => {
  return perks.filter(
    (perk) =>
      perk.type === type &&
      perk.tier === tier &&
      isAvailableForRace(perk, race) &&
      !isReplacedForRace(perk, race),
  );
};

/**
 * Returns the version of `perk` that `race` can take: the racial replacement,
 * the base perk that a racial perk replaces, or `perk` unchanged.
 */
export const getPerkForRace = (perk: Perk, race: Race): Perk => {
  if (!isAvailableForRace(perk, race) && perk.replaces !== undefined) {
    return getPerkById(perk.replaces) ?? perk;
  }
  return (
    perks.find((other) => other.replaces === perk.id && isAvailableForRace(other, race)) ??
    perk
  );
};

export const getAllPerks = (): Perk[] => {
  return perks;
};

export const getPerkById = (id: number): Perk | null => {
  return perks.find(perk => perk.id === id) || null;
};

export const getPerksByType = (type: string): Perk[] => {
  return perks.filter((perk) => perk.type === type);
};

export const getPerksByTier = (tier: number): Perk[] => {
  return perks.filter((perk) => perk.tier === tier);
};
