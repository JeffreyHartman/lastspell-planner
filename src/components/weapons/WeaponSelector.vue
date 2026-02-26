<template>
  <section
    class="glass-panel overflow-visible p-4"
    :class="{ 'relative z-20': dropdownOpen }"
  >
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="text-2xl font-bold text-white">Weapon Loadout</h3>
        <p class="text-xs text-slate-300">
          Select primary and off-hand weapons for each weapon set.
        </p>
      </div>

      <button type="button" class="btn btn--danger text-xs" @click="resetAll">
        <XMarkIcon class="h-4 w-4" />
        Clear Weapons
      </button>
    </div>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <WeaponSet :set-index="0" label="Weapon Set 1" @dropdown-toggle="onDropdownToggle" />
      <WeaponSet :set-index="1" label="Weapon Set 2" @dropdown-toggle="onDropdownToggle" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { XMarkIcon } from "@heroicons/vue/24/outline";
import { useWeaponStore } from "@/stores/weaponStore";
import {
  encodeWeaponsForUrl,
  decodeWeaponsFromUrl,
} from "@/services/weaponService";
import WeaponSet from "./WeaponSet.vue";

const emit = defineEmits<{
  (event: "state-changed"): void;
}>();

const weaponStore = useWeaponStore();
const isHydratingFromUrl = ref(true);
const dropdownOpen = ref(false);

const onDropdownToggle = (open: boolean) => {
  dropdownOpen.value = open;
};

const syncWeaponsToUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const encoded = encodeWeaponsForUrl(weaponStore.$state);

  if (encoded) {
    params.set("wpns", encoded);
  } else {
    params.delete("wpns");
  }

  const queryString = params.toString();
  const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}`;
  window.history.replaceState({}, "", nextUrl);
};

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get("wpns");

  if (encoded) {
    weaponStore.setSets(decodeWeaponsFromUrl(encoded));
  } else {
    weaponStore.clearAll();
  }

  isHydratingFromUrl.value = false;
  syncWeaponsToUrl();
});

watch(
  () => weaponStore.sets,
  () => {
    if (isHydratingFromUrl.value) return;
    syncWeaponsToUrl();
    emit("state-changed");
  },
  { deep: true },
);

const resetAll = () => {
  weaponStore.clearAll();
};
</script>
