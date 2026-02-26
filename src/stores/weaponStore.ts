import { defineStore } from "pinia";
import type { RankedWeapon, WeaponRankingsState } from "@/types/Weapon";
import {
  clampWeaponStars,
  getDefaultWeaponRankingsState,
} from "@/services/weaponService";

export const useWeaponStore = defineStore("weapons", {
  state: (): WeaponRankingsState => getDefaultWeaponRankingsState(),

  getters: {
    getWeaponAt:
      (state) =>
      (index: number): RankedWeapon | undefined =>
        state.weapons[index],

    hasWeapon:
      (state) =>
      (weaponId: string): boolean =>
        state.weapons.some((w) => w.weaponId === weaponId),
  },

  actions: {
    addWeapon(weaponId: string, stars: number = 0) {
      if (this.hasWeapon(weaponId)) return;
      this.weapons.push({ weaponId, stars: clampWeaponStars(stars) });
    },

    removeWeapon(weaponId: string) {
      this.weapons = this.weapons.filter((w) => w.weaponId !== weaponId);
    },

    setStars(weaponId: string, stars: number) {
      const weapon = this.weapons.find((w) => w.weaponId === weaponId);
      if (weapon) {
        weapon.stars = clampWeaponStars(stars);
      }
    },

    setWeapons(state: WeaponRankingsState) {
      const seen = new Set<string>();
      this.weapons = state.weapons.filter((w) => {
        if (seen.has(w.weaponId)) return false;
        seen.add(w.weaponId);
        return true;
      });
    },

    clearAll() {
      this.weapons = [];
    },
  },
});
