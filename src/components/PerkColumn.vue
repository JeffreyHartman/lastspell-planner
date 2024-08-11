<template>
  <div class="flex flex-col items-center p-2">
    <button
      @click="toggleColumnTypeSelector"
      class="mb-2 rounded-3xl p-2 text-white"
      :disabled="!allowTypeSelection"
    >
      <img
        :src="`/assets/icons/${columnType}_Perks_Column_Icon.webp`"
        :alt="`${columnType} column icon`"
        :title="`${capitalize(columnType)}`"
      />
    </button>
    <ColumnTypeSelector
      v-if="showTypeSelector"
      :position="typeSelectorPosition"
      :currentType="columnType"
      @columntype-selected="handleColumnTypeSelected"
      @close-columntype-selector="showTypeSelector = false"
    />
    <div class="flex flex-col items-center space-y-2">
      <PerkSlot
        v-for="tier in 5"
        :key="tier"
        :perk="getSelectedPerk(tier)"
        :tier="tier"
        :columnType="columnType"
        @select-perk="onSelectPerk"
      >
      </PerkSlot>
    </div>
  </div>
</template>

<script setup lang="ts">
import PerkSlot from "./PerkSlot.vue";
import { Perk } from "../types/Perk";
import ColumnTypeSelector from "./ColumnTypeSelector.vue";
import { computed, ref } from "vue";

const props = defineProps({
  columnType: {
    type: String,
    required: true,
  },
  selectedPerks: {
    type: Array as () => Perk[],
    required: true,
  },
  columnId: {
    type: Number,
    required: true,
  },
});
const emit = defineEmits(["select-perk", "columntype-selected"]);
const showTypeSelector = ref(false);
const typeSelectorPosition = ref({ top: "", left: "" });

const getSelectedPerk = (tier: number) => {
  return props.selectedPerks.find((perk) => perk.tier === tier) || null;
};

const toggleColumnTypeSelector = (event: MouseEvent) => {
  showTypeSelector.value = !showTypeSelector.value;
  if (showTypeSelector.value) {
    typeSelectorPosition.value = {
      top: `${event.clientY}px`,
      left: `${event.clientX}px`,
    };
  }
};

const onSelectPerk = (perk: Perk) => {
  emit("select-perk", perk ? perk : null);
};

const handleColumnTypeSelected = (columnType: string) => {
  console.log("Selected key:", props.columnId);
  emit("columntype-selected", columnType, props.columnId);
  showTypeSelector.value = false;
};

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const allowTypeSelection = computed(() => {
  return ["choice", "poison", "debuff", "defense", "assassin"].includes(
    props.columnType,
  );
});
</script>
