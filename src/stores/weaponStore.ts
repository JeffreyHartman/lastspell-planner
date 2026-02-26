import { defineStore } from "pinia";
import type { WeaponSetsState, WeaponSetState } from "@/types/Weapon";
import { getDefaultWeaponSetsState, getWeaponById } from "@/services/weaponService";

export const useWeaponStore = defineStore("weapons", {
  state: (): WeaponSetsState => getDefaultWeaponSetsState(),

  getters: {
    getSet:
      (state) =>
      (index: number): WeaponSetState =>
        state.sets[index] ?? { primaryId: null, offhandId: null },

    isOffhandDisabled:
      (state) =>
      (setIndex: number): boolean => {
        const primary = state.sets[setIndex]?.primaryId;
        if (!primary) return true;
        const weapon = getWeaponById(primary);
        return !weapon || weapon.handedness === "2h";
      },
  },

  actions: {
    setPrimary(setIndex: number, weaponId: string | null) {
      const set = this.sets[setIndex];
      if (!set) return;

      set.primaryId = weaponId;

      // Auto-clear off-hand when switching to 2h or empty
      if (!weaponId) {
        set.offhandId = null;
      } else {
        const weapon = getWeaponById(weaponId);
        if (!weapon || weapon.handedness === "2h") {
          set.offhandId = null;
        }
      }
    },

    setOffhand(setIndex: number, weaponId: string | null) {
      const set = this.sets[setIndex];
      if (!set) return;

      // Only allow off-hand if primary is 1h
      if (this.isOffhandDisabled(setIndex)) {
        set.offhandId = null;
        return;
      }

      set.offhandId = weaponId;
    },

    setSets(state: WeaponSetsState) {
      this.sets = state.sets;
    },

    clearAll() {
      const defaults = getDefaultWeaponSetsState();
      this.sets = defaults.sets;
    },
  },
});
