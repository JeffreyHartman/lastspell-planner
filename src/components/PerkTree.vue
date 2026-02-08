<template>
  <div class="flex justify-center">
    <PerkColumn
      v-for="column in perkColumns"
      :columnId="column.id"
      :columnType="column.type"
      :selectedPerks="column.perks"
      @select-perk="onSelectPerk"
      @columntype-selected="onColumnTypeSelected"
    />
  </div>
  <button @click="resetPerks">Reset Perks</button>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import PerkColumn from "./PerkColumn.vue";
import { PerkColumnType } from "../types/PerkColumn";
import { Perk } from "../types/Perk";
import { getPerkById } from "../services/perkService";

const emit = defineEmits<{
  (event: "state-changed"): void;
}>();

const DEFAULT_COLUMN_TYPES = [
  "melee",
  "magic",
  "ranged",
  "choice",
  "choice",
  "misc",
  "misc",
  "misc",
];

const perkColumns = ref<PerkColumnType[]>([
  { id: 0, type: "melee", perks: [] },
  { id: 1, type: "magic", perks: [] },
  { id: 2, type: "ranged", perks: [] },
  { id: 3, type: "choice", perks: [] },
  { id: 4, type: "choice", perks: [] },
  { id: 5, type: "misc", perks: [] },
  { id: 6, type: "misc", perks: [] },
  { id: 7, type: "misc", perks: [] },
]);

// Update URL when perks change
watch(
  perkColumns,
  (newColumns) => {
    const params = new URLSearchParams(window.location.search);

    removePerkParams(params);

    newColumns.forEach((column, index) => {
      // Save column type if it's not the default for that column index
      // (including custom types in the 2 choice slots)
      if (column.type !== getDefaultColumnType(index)) {
        params.set(`c${index}t`, column.type);
      }

      // Save selected perks
      column.perks.forEach((perk) => {
        params.append(`c${index}p`, `${perk.id}-${perk.tier}`);
      });
    });

    const queryString = params.toString();
    const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}`;

    window.history.replaceState({}, "", newUrl);
    emit("state-changed");
  },
  { deep: true },
);

const removePerkParams = (params: URLSearchParams) => {
  const keysToRemove: string[] = [];

  params.forEach((_, key) => {
    if (/^c\d+(t|p)$/.test(key)) {
      keysToRemove.push(key);
    }
  });

  keysToRemove.forEach((key) => {
    params.delete(key);
  });
};

// Load perks from URL on mount
onMounted(() => {
  const params = new URLSearchParams(window.location.search);

  // Create a new array of columns
  const newColumns = perkColumns.value.map((column, index) => {
    // Create a new column object
    const newColumn: PerkColumnType = { ...column, perks: [] as Perk[] };

    // Load column type
    const columnType = params.get(`c${index}t`);
    if (columnType) {
      newColumn.type = columnType;
    }

    // Load perks
    const columnPerks = params.getAll(`c${index}p`);

    columnPerks.forEach((perkParam) => {
      const [perkId, tier] = perkParam.split("-").map(Number);
      const perk = getPerkById(perkId);

      if (perk && perk.tier === tier) {
        newColumn.perks.push(perk);
      }
    });

    return newColumn;
  });

  // Assign the new array to perkColumns
  perkColumns.value = newColumns;
});

// Helper function to get default column type
function getDefaultColumnType(columnIndex: number): string {
  return DEFAULT_COLUMN_TYPES[columnIndex];
}

const onSelectPerk = (perk: Perk | null, columnId: number, tier: number) => {
  const column = perkColumns.value.find((col) => col.id === columnId);
  if (!column) return;

  // Remove any existing perk at this tier
  column.perks = column.perks.filter(
    (selectedPerk) => selectedPerk.tier !== tier,
  );

  // Add the new perk if it's not null (null means clearing the perk)
  if (perk) {
    column.perks.push(perk);
  }
};

const onColumnTypeSelected = (newType: string, id: number) => {
  const column = perkColumns.value.find((column) => column.id === id);
  if (column) {
    column.type = newType;
  }
};

const resetPerks = () => {
  perkColumns.value.forEach((column) => {
    column.perks = [];
    if (column.id === 3 || column.id === 4) {
      column.type = "choice";
    }
  });
};
</script>
