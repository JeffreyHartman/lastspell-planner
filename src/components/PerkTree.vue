<template>
  <div class="glass-panel p-4">
    <div class="mb-3 flex items-center justify-between">
      <div class="flex flex-wrap items-center gap-2">
        <div class="relative">
          <MagnifyingGlassIcon
            class="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search perks..."
            class="w-48 rounded-lg border border-slate-600/60 bg-slate-800/80 py-1.5 pl-8 pr-8 text-sm text-slate-100 placeholder-slate-500 outline-none transition-colors focus:border-blue-500/60"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            @click="searchQuery = ''"
          >
            <XMarkIcon class="h-4 w-4" />
          </button>
        </div>
        <span class="text-xs text-slate-500">Right-click a perk to mark as bonus</span>

        <div
          class="flex items-center rounded-lg border border-slate-600/60 bg-slate-800/80 p-0.5"
        >
          <button
            v-for="race in races"
            :key="race.id"
            type="button"
            class="rounded-md px-2.5 py-1 text-xs font-semibold transition-colors"
            :class="
              selectedRace === race.id
                ? 'bg-ember/20 text-orange-200'
                : 'text-slate-300 hover:bg-slate-700/70'
            "
            @click="onRaceSelected(race.id)"
          >
            {{ race.label }}
          </button>
        </div>
      </div>
      <button type="button" class="btn btn--danger text-xs" @click="resetPerks">
        <ArrowPathIcon class="h-4 w-4" />
        Reset Perks
      </button>
    </div>

    <div class="flex justify-center gap-1 pb-2 sm:gap-2">
      <PerkColumn
        v-for="column in perkColumns"
        :columnId="column.id"
        :columnType="column.type"
        :selectedPerks="column.perks"
        :searchQuery="searchQuery"
        @select-perk="onSelectPerk"
        @toggle-priority="onTogglePriority"
        @columntype-selected="onColumnTypeSelected"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import PerkColumn from "./PerkColumn.vue";
import { PerkColumnType } from "../types/PerkColumn";
import { Perk } from "../types/Perk";
import { SelectedPerk } from "../types/SelectedPerk";
import { getPerkById } from "../services/perkService";

const emit = defineEmits<{
  (event: "state-changed"): void;
}>();

const searchQuery = ref("");

type Race = "human" | "dwarf" | "elf";

const races: { id: Race; label: string; columnType: string }[] = [
  { id: "human", label: "Human", columnType: "misc" },
  { id: "dwarf", label: "Dwarf", columnType: "dwarf" },
  { id: "elf", label: "Elf", columnType: "elf" },
];

const selectedRace = ref<Race>("human");

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

const RACIAL_COLUMN_INDEX = 5;

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
      if (column.type !== getDefaultColumnType(index)) {
        params.set(`c${index}t`, column.type);
      }

      // Save selected perks
      column.perks.forEach((sp) => {
        const suffix = sp.priority === "bonus" ? "-b" : "";
        params.append(`c${index}p`, `${sp.perk.id}-${sp.perk.tier}${suffix}`);
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

  const legacyRaceType = params.get("c0t");
  const hasRacialTypeInLegacyColumn =
    legacyRaceType === "dwarf" || legacyRaceType === "elf";
  const hasRacialTypeInCorrectColumn = ["dwarf", "elf"].includes(
    params.get(`c${RACIAL_COLUMN_INDEX}t`) ?? "",
  );

  if (hasRacialTypeInLegacyColumn && !hasRacialTypeInCorrectColumn) {
    params.set(`c${RACIAL_COLUMN_INDEX}t`, legacyRaceType);
    params.delete("c0t");
    const queryString = params.toString();
    const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}`;
    window.history.replaceState({}, "", newUrl);
  }

  // Create a new array of columns
  const newColumns = perkColumns.value.map((column, index) => {
    const newColumn: PerkColumnType = { ...column, perks: [] as SelectedPerk[] };

    // Load column type
    const columnType = params.get(`c${index}t`);
    if (columnType) {
      newColumn.type = columnType;
    }

    // Load perks
    const columnPerks = params.getAll(`c${index}p`);

    columnPerks.forEach((perkParam) => {
      const segments = perkParam.split("-");
      const perkId = Number(segments[0]);
      const tier = Number(segments[1]);
      const priority = segments[2] === "b" ? "bonus" : "essential";
      const perk = getPerkById(perkId);

      if (perk && perk.tier === tier) {
        newColumn.perks.push({ perk, priority });
      }
    });

    return newColumn;
  });

  // Assign the new array to perkColumns
  perkColumns.value = newColumns;
  selectedRace.value = getRaceByColumnType(
    newColumns[RACIAL_COLUMN_INDEX]?.type ?? "misc",
  );
});

// Helper function to get default column type
function getDefaultColumnType(columnIndex: number): string {
  return DEFAULT_COLUMN_TYPES[columnIndex];
}

function getRaceByColumnType(columnType: string): Race {
  if (columnType === "dwarf") return "dwarf";
  if (columnType === "elf") return "elf";
  return "human";
}

function getColumnTypeByRace(race: Race): string {
  return races.find((entry) => entry.id === race)?.columnType ?? "misc";
}

const onSelectPerk = (perk: Perk | null, columnId: number, tier: number) => {
  const column = perkColumns.value.find((col) => col.id === columnId);
  if (!column) return;

  // Remove any existing perk at this tier
  column.perks = column.perks.filter((sp) => sp.perk.tier !== tier);

  // Add the new perk if it's not null (null means clearing the perk)
  if (perk) {
    column.perks.push({ perk, priority: "essential" });
  }
};

const onTogglePriority = (columnId: number, tier: number) => {
  const column = perkColumns.value.find((col) => col.id === columnId);
  if (!column) return;

  const sp = column.perks.find((sp) => sp.perk.tier === tier);
  if (sp) {
    sp.priority = sp.priority === "essential" ? "bonus" : "essential";
  }
};

const onColumnTypeSelected = (newType: string, id: number) => {
  const column = perkColumns.value.find((column) => column.id === id);
  if (column) {
    column.type = newType;
  }
};

const onRaceSelected = (race: Race) => {
  selectedRace.value = race;

  const racialColumn = perkColumns.value.find(
    (column) => column.id === RACIAL_COLUMN_INDEX,
  );
  if (!racialColumn) return;

  racialColumn.type = getColumnTypeByRace(race);
  racialColumn.perks = [];
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
