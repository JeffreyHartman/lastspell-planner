<template>
  <div
    class="absolute z-20 animate-scale-in rounded-xl border border-slate-600/40 bg-slate-900/95 p-3 shadow-glass backdrop-blur-sm"
    :style="{ ...position, width: pickerWidth }"
    ref="target"
  >
    <div
      v-if="perks.length === 0"
      class="whitespace-nowrap px-2 text-sm text-slate-400"
    >
      No perks available
    </div>
    <div v-else class="flex flex-wrap gap-2">
      <div
        v-for="perk in perks"
        :key="perk.id"
        class="group relative"
        @mouseover="showDetails(perk)"
        @mouseout="hideDetails"
        @click="selectPerk(perk)"
      >
        <img
          :src="perk.icon"
          :alt="perk.name"
          class="h-10 w-10 cursor-pointer rounded-lg border border-transparent transition-all duration-150 hover:border-amber-500/50 hover:shadow-glow-amber"
          :class="{ 'bg-slate-100 p-1': isPlaceholderIcon(perk.icon) }"
        />
        <PerkTooltip :perk="perk" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, PropType, computed } from "vue";
import { Perk } from "../types/Perk";
import { onClickOutside, onKeyStroke } from "@vueuse/core";
import PerkTooltip from "../components/PerkTooltip.vue";

const props = defineProps({
  perks: {
    type: Array as PropType<Perk[]>,
    required: true,
  },
  position: {
    type: Object as PropType<{ top: string; left: string }>,
    required: true,
  },
});

const emit = defineEmits(["close-perk-picker", "select-perk"]);
const target = ref(null);

onClickOutside(target, () => emit("close-perk-picker"));
onKeyStroke("Escape", () => emit("close-perk-picker"));

const selectedPerk = ref<Perk | null>(null);

const showDetails = (perk: Perk) => {
  selectedPerk.value = perk;
};

const hideDetails = () => {
  selectedPerk.value = null;
};

const selectPerk = (perk: Perk) => {
  emit("select-perk", perk);
  emit("close-perk-picker");
};

const pickerWidth = computed(() => {
  const perksCount = props.perks.length;
  const columns = Math.min(perksCount, 5);
  return `${columns * 48 + (columns - 1) * 8 + 24}px`;
});

const isPlaceholderIcon = (iconPath: string) => {
  return iconPath.includes("raw.githubusercontent.com/tailwindlabs/heroicons");
};
</script>
