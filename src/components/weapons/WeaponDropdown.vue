<template>
  <div
    ref="dropdownRef"
    class="absolute left-0 top-full z-30 mt-2 w-64 animate-scale-in rounded-xl border border-slate-600/40 bg-slate-900/95 p-2 shadow-glass backdrop-blur-sm"
  >
    <input
      ref="searchInputRef"
      v-model="searchQuery"
      type="text"
      placeholder="Search weapons..."
      class="mb-2 w-full rounded-lg border border-slate-600/50 bg-slate-800/80 px-3 py-1.5 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/70 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
    />

    <div class="max-h-64 overflow-y-auto">
      <button
        v-for="weapon in filteredWeapons"
        :key="weapon.id"
        type="button"
        class="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-slate-200 transition-colors duration-100 hover:bg-slate-700/60 hover:text-white"
        @click="selectWeapon(weapon)"
      >
        <img
          :src="weapon.icon"
          :alt="weapon.name"
          class="h-7 w-7 object-contain"
          loading="lazy"
        />
        <span class="truncate">{{ weapon.name }}</span>
        <span
          v-if="weapon.dlc"
          class="ml-auto shrink-0 rounded bg-slate-700/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-400"
        >
          {{ weapon.dlc }}
        </span>
      </button>

      <div
        v-if="filteredWeapons.length === 0"
        class="px-2 py-2 text-center text-xs text-slate-500"
      >
        No weapons match your search.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type PropType } from "vue";
import { onClickOutside, onKeyStroke } from "@vueuse/core";
import type { Weapon } from "@/types/Weapon";

const props = defineProps({
  weapons: {
    type: Array as PropType<Weapon[]>,
    required: true,
  },
});

const emit = defineEmits<{
  (event: "select", weapon: Weapon | null): void;
  (event: "close"): void;
}>();

const dropdownRef = ref<HTMLElement | null>(null);
const searchInputRef = ref<HTMLInputElement | null>(null);
const searchQuery = ref("");

onClickOutside(dropdownRef, () => emit("close"));
onKeyStroke("Escape", () => emit("close"));

onMounted(() => {
  searchInputRef.value?.focus();
});

const filteredWeapons = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  const list = query
    ? props.weapons.filter((w) => w.name.toLowerCase().includes(query))
    : props.weapons;
  return [...list].sort((a, b) => a.name.localeCompare(b.name));
});

const selectWeapon = (weapon: Weapon | null) => {
  emit("select", weapon);
  emit("close");
};
</script>
