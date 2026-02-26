<template>
  <div
    class="flex items-center gap-2.5 rounded-lg border border-slate-700/40 bg-slate-900/50 px-2.5 py-2 transition-colors duration-150 hover:border-slate-600/50"
  >
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-600/50 bg-slate-700/60"
    >
      <img
        v-if="weapon"
        :src="weapon.icon"
        :alt="weapon.name"
        class="h-8 w-8 object-contain"
        loading="lazy"
      />
    </div>

    <span class="min-w-0 flex-1 truncate text-sm text-slate-100">
      {{ weapon?.name ?? "Unknown" }}
    </span>

    <div class="flex items-center gap-0.5">
      <button
        v-for="star in 3"
        :key="star"
        type="button"
        class="rounded-md p-0.5 text-amber-400 transition-all duration-150 hover:scale-110 hover:bg-slate-700/60 active:scale-95"
        :aria-label="`Set ${weapon?.name} importance to ${star} stars`"
        @click="onStarClick(star)"
      >
        <StarSolidIcon v-if="star <= stars" class="h-5 w-5" />
        <StarOutlineIcon v-else class="h-5 w-5" />
      </button>
    </div>

    <button
      type="button"
      class="rounded-md p-1 text-slate-500 transition-colors duration-150 hover:bg-red-900/30 hover:text-red-400"
      aria-label="Remove weapon"
      @click="emit('remove')"
    >
      <XMarkIcon class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { XMarkIcon, StarIcon as StarOutlineIcon } from "@heroicons/vue/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/vue/24/solid";
import { getWeaponById } from "@/services/weaponService";
import type { Weapon } from "@/types/Weapon";

const props = defineProps<{
  weaponId: string;
  stars: number;
}>();

const emit = defineEmits<{
  (event: "set-stars", stars: number): void;
  (event: "remove"): void;
}>();

const weapon = computed((): Weapon | undefined => getWeaponById(props.weaponId));

const onStarClick = (selectedStar: number) => {
  const nextStars =
    props.stars === selectedStar ? selectedStar - 1 : selectedStar;
  emit("set-stars", nextStars);
};
</script>
