<template>
  <div class="flex justify-around">
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
import { ref } from "vue";
import PerkColumn from "./PerkColumn.vue";
import { PerkColumnType } from "../types/PerkColumn";
import { Perk } from "../types/Perk";

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

const onSelectPerk = (perk: Perk) => {
  console.log("Selected perk:", perk.name);
};

const onColumnTypeSelected = (newType: string, id: number) => {
  const column = perkColumns.value.find((column) => column.id === id);
  if (column) {
    column.type = newType;
  }
};
</script>
