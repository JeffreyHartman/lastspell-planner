<template>
  <div
    class="absolute z-10 rounded-md border-opacity-90 bg-gray-800 p-2 shadow-lg"
    :style="{ ...position, width: pickerWidth }"
    ref="target"
  >
    <div v-if="perks.length === 0" class="whitespace-nowrap px-2 text-white">
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
          class="h-8 w-8 cursor-pointer rounded-md hover:ring-2 hover:ring-blue-500"
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
  const columns = Math.min(perksCount, 5); // Max 5 columns
  return `${columns * 40 + (columns - 1) * 8 + 16}px`; // 40px for each icon, 8px gap, 16px for padding
});
</script>
