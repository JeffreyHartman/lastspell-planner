<template>
  <section
    class="glass-panel overflow-visible p-4"
    :class="{ 'relative z-20': showDropdown }"
  >
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="text-2xl font-bold text-white">Weapons</h3>
        <p class="text-xs text-slate-300">
          Add weapons and rate them 0–3 stars to indicate build priority.
        </p>
      </div>

      <button
        type="button"
        class="btn btn--danger text-xs"
        @click="weaponStore.clearAll()"
      >
        <XMarkIcon class="h-4 w-4" />
        Clear Weapons
      </button>
    </div>

    <div class="space-y-2">
      <WeaponRankItem
        v-for="rw in weaponStore.weapons"
        :key="rw.weaponId"
        :weapon-id="rw.weaponId"
        :stars="rw.stars"
        @set-stars="(s) => weaponStore.setStars(rw.weaponId, s)"
        @remove="weaponStore.removeWeapon(rw.weaponId)"
      />

      <div
        v-if="weaponStore.weapons.length === 0"
        class="rounded-md border border-dashed border-slate-600 p-4 text-center text-sm text-slate-400"
      >
        No weapons selected. Click "Add Weapon" to get started.
      </div>
    </div>

    <div class="relative mt-3">
      <button
        type="button"
        class="btn btn--primary text-xs"
        @click="toggleDropdown"
      >
        <PlusIcon class="h-4 w-4" />
        Add Weapon
      </button>

      <WeaponDropdown
        v-if="showDropdown"
        :weapons="availableWeapons"
        @select="onWeaponSelected"
        @close="showDropdown = false"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { XMarkIcon, PlusIcon } from "@heroicons/vue/24/outline";
import { useWeaponStore } from "@/stores/weaponStore";
import { getAllWeapons } from "@/services/weaponService";
import type { Weapon } from "@/types/Weapon";
import WeaponRankItem from "./WeaponRankItem.vue";
import WeaponDropdown from "./WeaponDropdown.vue";

const emit = defineEmits<{
  (event: "state-changed"): void;
}>();

const weaponStore = useWeaponStore();
const showDropdown = ref(false);

const allWeapons = getAllWeapons();

const availableWeapons = computed(() =>
  allWeapons.filter((w) => !weaponStore.hasWeapon(w.id)),
);

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

const onWeaponSelected = (weapon: Weapon | null) => {
  if (weapon) {
    weaponStore.addWeapon(weapon.id, 0);
  }
  showDropdown.value = false;
};

watch(
  () => weaponStore.weapons,
  () => {
    emit("state-changed");
  },
  { deep: true },
);
</script>
