<template>
  <div class="flex flex-col items-center px-1 sm:px-2">
    <div class="relative mb-3">
      <button
        @click="toggleColumnTypeSelector"
        class="group flex h-10 w-10 items-center justify-center rounded-full border border-slate-600/50 bg-slate-800/70 transition-all duration-200 hover:border-slate-400/60 hover:shadow-glow-sm disabled:cursor-default disabled:opacity-50 disabled:hover:border-slate-600/50 disabled:hover:shadow-none"
        :disabled="!allowTypeSelection"
      >
        <img
          :src="getColumnIconSrc(columnType)"
          :alt="`${columnType} column icon`"
          :title="capitalize(columnType)"
          class="h-7 w-7 object-contain"
          :class="{
            'rounded-full bg-slate-200 p-1':
              hasPlaceholderColumnIcon(columnType),
          }"
        />
        <span
          v-if="allowTypeSelection"
          class="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-ember/70"
        ></span>
      </button>
      <ColumnTypeSelector
        v-if="showTypeSelector"
        :currentType="columnType"
        @columntype-selected="handleColumnTypeSelected"
        @close-columntype-selector="showTypeSelector = false"
      />
    </div>
    <div class="flex flex-col items-center">
      <template v-for="tier in 5" :key="tier">
        <div v-if="tier > 1" class="tier-connector"></div>
        <PerkSlot
          :selection="getSelectedPerk(tier)"
          :tier="tier"
          :columnType="columnType"
          :searchQuery="searchQuery"
          @select-perk="onSelectPerk"
          @toggle-priority="onTogglePriority"
        />
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import PerkSlot from "./PerkSlot.vue";
import { Perk } from "../types/Perk";
import { SelectedPerk } from "../types/SelectedPerk";
import ColumnTypeSelector from "./ColumnTypeSelector.vue";
import { computed, ref } from "vue";

const props = defineProps({
  columnType: {
    type: String,
    required: true,
  },
  selectedPerks: {
    type: Array as () => SelectedPerk[],
    required: true,
  },
  columnId: {
    type: Number,
    required: true,
  },
  searchQuery: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["select-perk", "columntype-selected", "toggle-priority"]);
const showTypeSelector = ref(false);

const getSelectedPerk = (tier: number): SelectedPerk | null => {
  return props.selectedPerks.find((sp) => sp.perk.tier === tier) || null;
};

const toggleColumnTypeSelector = () => {
  showTypeSelector.value = !showTypeSelector.value;
};

const onSelectPerk = (perk: Perk | null, tier: number) => {
  emit("select-perk", perk, props.columnId, tier);
};

const onTogglePriority = (tier: number) => {
  emit("toggle-priority", props.columnId, tier);
};

const handleColumnTypeSelected = (columnType: string) => {
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

const VALID_ICON_TYPES = new Set([
  "melee", "magic", "ranged", "choice", "dwarf", "elf",
  "misc", "poison", "debuff", "defense", "assassin",
]);

const getColumnIconSrc = (type: string) => {
  if (type === "dwarf") {
    return "https://raw.githubusercontent.com/tailwindlabs/heroicons/master/src/24/solid/shield-check.svg";
  }

  if (type === "elf") {
    return "https://raw.githubusercontent.com/tailwindlabs/heroicons/master/src/24/solid/sparkles.svg";
  }

  if (!VALID_ICON_TYPES.has(type)) {
    return `/assets/icons/misc_Perks_Column_Icon.webp`;
  }

  return `/assets/icons/${type}_Perks_Column_Icon.webp`;
};

const hasPlaceholderColumnIcon = (type: string) => {
  return type === "dwarf" || type === "elf";
};
</script>
