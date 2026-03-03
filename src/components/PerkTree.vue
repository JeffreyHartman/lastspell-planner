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
        <div class="flex items-center gap-3 text-xs text-slate-500">
          <div class="flex items-center gap-1.5">
            <span
              class="inline-block h-3 w-3 rounded-full border border-gold/80"
              style="
                box-shadow:
                  0 0 4px 1px rgba(212, 168, 67, 0.6),
                  0 0 10px 3px rgba(212, 168, 67, 0.35);
              "
            ></span>
            <span class="text-gold/90">Core</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span
              class="inline-block h-3 w-3 rounded-full border border-emerald-500/50"
              style="box-shadow: 0 0 10px 2px rgba(78, 173, 107, 0.3)"
            ></span>
            <span class="text-emerald-400/90">Nice to have</span>
          </div>
          <span class="text-slate-600">|</span>
          <span class="sm:hidden">Re-select to toggle</span>
          <span class="hidden sm:inline">Right-click to toggle</span>
        </div>

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

    <div class="flex justify-center gap-0 pb-2 sm:gap-2">
      <PerkColumn
        v-for="column in perkColumns"
        :key="column.id"
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

const props = defineProps<{
  initialState?: PerkColumnType[];
}>();

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

defineExpose({ perkColumns });

const isInitialized = ref(false);

watch(
  perkColumns,
  () => {
    if (isInitialized.value) {
      emit("state-changed");
    }
  },
  { deep: true },
);

onMounted(() => {
  if (props.initialState) {
    perkColumns.value = props.initialState.map((col) => ({
      ...col,
      perks: col.perks.map((sp) => ({ ...sp, perk: { ...sp.perk } })),
    }));
    selectedRace.value = getRaceByColumnType(
      perkColumns.value[RACIAL_COLUMN_INDEX]?.type ?? "misc",
    );
  }
  isInitialized.value = true;
});

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
  const previousRace = selectedRace.value;
  selectedRace.value = race;

  const racialColumn = perkColumns.value.find(
    (column) => column.id === RACIAL_COLUMN_INDEX,
  );
  if (!racialColumn) return;

  // When switching away from Human, try to move misc perks to other misc columns
  if (previousRace === "human" && race !== "human" && racialColumn.perks.length > 0) {
    const otherMiscColumns = perkColumns.value.filter(
      (col) => col.id !== RACIAL_COLUMN_INDEX && col.type === "misc",
    );

    for (const sp of racialColumn.perks) {
      const target = otherMiscColumns.find(
        (col) => !col.perks.some((p) => p.perk.tier === sp.perk.tier),
      );
      if (target) {
        target.perks.push({ perk: { ...sp.perk }, priority: sp.priority });
      }
    }
  }

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
