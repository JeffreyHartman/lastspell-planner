import weaponsData from "../weapons.json";
import type { Weapon, WeaponHandedness, WeaponSetsState, WeaponSetState } from "../types/Weapon";

const weapons = weaponsData as Weapon[];

const WEAPON_BY_ID = new Map<string, Weapon>(weapons.map((w) => [w.id, w]));

export const getAllWeapons = (): Weapon[] => [...weapons];

export const getWeaponById = (id: string): Weapon | undefined =>
  WEAPON_BY_ID.get(id);

export const getMainHandWeapons = (): Weapon[] =>
  weapons.filter((w) => w.handedness !== "oh");

export const getOffHandWeapons = (): Weapon[] =>
  weapons.filter((w) => w.handedness === "oh");

export const getWeaponsByHandedness = (handedness: WeaponHandedness): Weapon[] =>
  weapons.filter((w) => w.handedness === handedness);

export const getDefaultWeaponSetState = (): WeaponSetState => ({
  primaryId: null,
  offhandId: null,
});

export const getDefaultWeaponSetsState = (): WeaponSetsState => ({
  sets: [getDefaultWeaponSetState(), getDefaultWeaponSetState()],
});

/**
 * URL format: primaryId,offhandId;primaryId,offhandId
 * Empty slots omitted, trailing empties trimmed.
 * Example: sword,offhand-dagger;longbow
 */
export const encodeWeaponsForUrl = (state: WeaponSetsState): string => {
  const parts = state.sets.map((set) => {
    const primary = set.primaryId ?? "";
    const offhand = set.offhandId ?? "";
    if (!primary && !offhand) return "";
    if (!offhand) return primary;
    return `${primary},${offhand}`;
  });

  // Trim trailing empty sets
  while (parts.length > 0 && parts[parts.length - 1] === "") {
    parts.pop();
  }

  return parts.join(";");
};

export const decodeWeaponsFromUrl = (encoded: string): WeaponSetsState => {
  const state = getDefaultWeaponSetsState();
  if (!encoded) return state;

  const setParts = encoded.split(";");
  for (let i = 0; i < Math.min(setParts.length, 2); i++) {
    const part = setParts[i];
    if (!part) continue;

    const [primaryId = "", offhandId = ""] = part.split(",");

    if (primaryId && WEAPON_BY_ID.has(primaryId)) {
      const weapon = WEAPON_BY_ID.get(primaryId)!;
      if (weapon.handedness !== "oh") {
        state.sets[i].primaryId = primaryId;
      }
    }

    if (offhandId && WEAPON_BY_ID.has(offhandId)) {
      const weapon = WEAPON_BY_ID.get(offhandId)!;
      if (weapon.handedness === "oh") {
        // Only allow off-hand if primary is 1h
        const primary = state.sets[i].primaryId
          ? WEAPON_BY_ID.get(state.sets[i].primaryId!)
          : null;
        if (primary && primary.handedness === "1h") {
          state.sets[i].offhandId = offhandId;
        }
      }
    }
  }

  return state;
};
