import weaponsData from "../weapons.json";
import type { Weapon, RankedWeapon, WeaponRankingsState } from "../types/Weapon";

const weapons = weaponsData as Weapon[];

const WEAPON_BY_ID = new Map<string, Weapon>(weapons.map((w) => [w.id, w]));

export const getAllWeapons = (): Weapon[] => [...weapons];

export const getWeaponById = (id: string): Weapon | undefined =>
  WEAPON_BY_ID.get(id);

export const clampWeaponStars = (stars: number): number =>
  Math.max(0, Math.min(3, Math.floor(stars)));

export const getDefaultWeaponRankingsState = (): WeaponRankingsState => ({
  weapons: [],
});

/**
 * New URL format: weaponId~stars;weaponId~stars;...
 * Example: sword~3;longbow~2
 */
export const encodeWeaponsForUrl = (state: WeaponRankingsState): string => {
  if (state.weapons.length === 0) return "";
  return state.weapons
    .map((w) => (w.stars > 0 ? `${w.weaponId}~${w.stars}` : w.weaponId))
    .join(";");
};

/**
 * Detect legacy format by checking for commas.
 * Old format: primaryId,offhandId;primaryId,offhandId
 */
const isLegacyFormat = (encoded: string): boolean => encoded.includes(",");

/**
 * Decode legacy format: splits by ; then ,, extracts all valid weapon IDs with 0 stars.
 */
const decodeLegacyWeapons = (encoded: string): RankedWeapon[] => {
  const seen = new Set<string>();
  const result: RankedWeapon[] = [];

  for (const setPart of encoded.split(";")) {
    if (!setPart) continue;
    for (const id of setPart.split(",")) {
      const trimmed = id.trim();
      if (trimmed && WEAPON_BY_ID.has(trimmed) && !seen.has(trimmed)) {
        seen.add(trimmed);
        result.push({ weaponId: trimmed, stars: 0 });
      }
    }
  }

  return result;
};

/**
 * Decode new format: splits by ; then ~, extracts weaponId and stars.
 * A bare ID like "longbow" (no tilde) defaults to 0 stars.
 */
const decodeNewWeapons = (encoded: string): RankedWeapon[] => {
  const seen = new Set<string>();
  const result: RankedWeapon[] = [];

  for (const part of encoded.split(";")) {
    if (!part) continue;
    const tildeIdx = part.indexOf("~");
    const weaponId = tildeIdx === -1 ? part : part.slice(0, tildeIdx);
    const stars =
      tildeIdx === -1 ? 0 : clampWeaponStars(parseInt(part.slice(tildeIdx + 1), 10) || 0);

    if (weaponId && WEAPON_BY_ID.has(weaponId) && !seen.has(weaponId)) {
      seen.add(weaponId);
      result.push({ weaponId, stars });
    }
  }

  return result;
};

export const decodeWeaponsFromUrl = (encoded: string): WeaponRankingsState => {
  if (!encoded) return getDefaultWeaponRankingsState();

  const weapons = isLegacyFormat(encoded)
    ? decodeLegacyWeapons(encoded)
    : decodeNewWeapons(encoded);

  return { weapons };
};
