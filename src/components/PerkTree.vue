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
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import PerkColumn from "./PerkColumn.vue";
import { PerkColumnType } from "../types/PerkColumn";
import { Perk } from "../types/Perk";
import { getAllPerks, getPerkById } from "../services/perkService";

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
watch(perkColumns, (newColumns) => {
  console.log("Perk columns changed");
  const params = new URLSearchParams();
  
  newColumns.forEach((column, index) => {
    // Save column type if it's a choice column
    if (column.type !== getDefaultColumnType(index)) {
      params.set(`c${index}t`, column.type);
    }
    
    // Save selected perks
    column.perks.forEach(perk => {
      params.append(`c${index}p`, `${perk.id}-${perk.tier}`);
    });
  });

  // Update URL without reloading the page
  const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
  console.log(newUrl);
  window.history.pushState({}, '', newUrl);
}, { deep: true });

// Load perks from URL on mount
onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  console.log("URL params:", Object.fromEntries(params.entries()));
  
  // Create a new array of columns
  const newColumns = perkColumns.value.map((column, index) => {
    // Create a new column object
    const newColumn: PerkColumnType = { ...column, perks: [] as Perk[] };
    
    // Load column type
    const columnType = params.get(`c${index}t`);
    if (columnType) {
      newColumn.type = columnType;
      console.log(`Setting column ${index} type to:`, columnType);
    }
    
    // Load perks
    const columnPerks = params.getAll(`c${index}p`);
    console.log(`Column ${index} perks from URL:`, columnPerks);
    
    columnPerks.forEach(perkParam => {
      const [perkId, tier] = perkParam.split('-').map(Number);
      const perk = getPerkById(perkId);
      console.log(`Looking up perk ID ${perkId}:`, perk);
      
      if (perk && perk.tier === tier) {
        newColumn.perks.push(perk);
        console.log(`Added perk to column ${index}:`, perk.name);
      }
    });
    
    return newColumn;
  });
  
  // Assign the new array to perkColumns
  perkColumns.value = newColumns;
  
  console.log("Final perkColumns state:", perkColumns.value);
});

// Helper function to get default column type
function getDefaultColumnType(columnIndex: number): string {
  const defaultTypes = ["melee", "magic", "ranged", "choice", "choice", "misc", "misc", "misc"];
  return defaultTypes[columnIndex];
}

const onSelectPerk = (perk: Perk | null, columnId: number, tier: number) => {
  const column = perkColumns.value.find((col) => col.id === columnId);
  if (!column) return;

  // Remove any existing perk at this tier
  column.perks = column.perks.filter(p => p.tier !== tier);
  
  // Add the new perk if it's not null (null means clearing the perk)
  if (perk) {
    column.perks.push(perk);
  }

  console.log("Selected perk: ", perk ? perk.name : "Cleared Perk");
};

const onColumnTypeSelected = (newType: string, id: number) => {
  const column = perkColumns.value.find((column) => column.id === id);
  if (column) {
    column.type = newType;
  }
};
</script>
