<template>
  <div class="blanket"></div>
  <div class="appBackground"></div>
  <div class="relative z-10 mx-auto w-full max-w-[1280px] px-4 pb-12 text-center sm:px-6">
    <header class="py-6 sm:py-8">
      <h1
        class="font-display text-3xl font-bold tracking-wider text-white drop-shadow-lg sm:text-4xl lg:text-5xl"
      >
        The Last Spell Planner
      </h1>
      <p class="mt-1.5 text-sm tracking-wide text-slate-300">
        Plan your perks, weapons, and attributes
      </p>
    </header>

    <div
      class="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start"
    >
      <main class="relative z-10 min-w-0">
        <section class="glass-panel mb-6 p-4 text-left">
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="btn btn--primary text-xs"
              @click="createNewBuildFromScratch"
            >
              <PlusIcon class="h-4 w-4" />
              New Build
            </button>

            <input
              v-model="buildName"
              type="text"
              maxlength="100"
              class="min-w-0 flex-1 rounded-lg border border-slate-600/50 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-ember/70 focus:outline-none focus:ring-1 focus:ring-ember/30 transition-colors duration-150"
              placeholder="Untitled Build"
            />

            <button
              type="button"
              class="btn inline-flex h-10 w-10 items-center justify-center !px-0"
              :class="
                hasActiveSavedBuild
                  ? 'border-ember/50 text-ember shadow-glow-ember'
                  : ''
              "
              :aria-label="
                hasActiveSavedBuild
                  ? 'Update saved build'
                  : 'Save build to this browser'
              "
              @click="saveCurrentBuild"
            >
              <component
                :is="hasActiveSavedBuild ? HeartSolidIcon : HeartOutlineIcon"
                class="h-5 w-5"
              />
            </button>
          </div>

          <p class="mt-2 text-xs text-slate-400">
            {{
              hasActiveSavedBuild
                ? "Saved on this browser. Changes update automatically."
                : "Unsaved build. Click the heart to save it locally."
            }}
          </p>
        </section>

        <h2 class="section-header mt-6">Perk Tree</h2>
        <perk-tree
          ref="perkTreeRef"
          :key="`perk-${plannerStateKey}`"
          :initial-state="initialPerkState"
          @state-changed="onPlannerStateChanged"
        />

        <h2 class="section-header mt-8">Weapons</h2>
        <WeaponSelector
          :key="`wpns-${plannerStateKey}`"
          @state-changed="onPlannerStateChanged"
        />

        <h2 class="section-header mt-8">Attributes</h2>
        <AttributesSelector
          :key="`attrs-${plannerStateKey}`"
          @state-changed="onPlannerStateChanged"
        />
      </main>

      <aside class="glass-panel p-4 text-left xl:sticky xl:top-4">
        <h2 class="font-display mb-3 border-b border-slate-700/40 pb-2 text-xl">
          Saved Builds
        </h2>

        <p v-if="savedBuilds.length === 0" class="mt-2 text-sm text-slate-400">
          No saved builds yet.
        </p>

        <div v-else class="mt-2 space-y-2">
          <div
            v-for="build in savedBuilds"
            :key="build.id"
            class="flex items-center gap-1"
          >
            <button
              type="button"
              class="flex min-w-0 flex-1 flex-col rounded-lg border px-3 py-2.5 text-left transition-all duration-150"
              :class="
                build.id === activeSavedBuildId
                  ? 'border-ember/40 bg-ember/10 text-white shadow-glow-ember'
                  : 'border-slate-700/40 bg-slate-800/40 text-slate-300 hover:border-slate-600/60 hover:bg-slate-700/50'
              "
              @click="loadSavedBuild(build)"
            >
              <span class="truncate text-sm font-semibold">{{ build.name }}</span>
            </button>
            <button
              type="button"
              class="shrink-0 rounded-md p-1.5 text-slate-500 transition-colors hover:bg-red-900/30 hover:text-red-400"
              aria-label="Delete build"
              @click="onDeleteBuild(build)"
            >
              <TrashIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from "vue";
import {
  HeartIcon as HeartOutlineIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/vue/24/solid";

import PerkTree from "./components/PerkTree.vue";
import WeaponSelector from "./components/weapons/WeaponSelector.vue";
import AttributesSelector from "./components/attributes/AttributesSelector.vue";
import {
  SavedBuild,
  getDefaultBuildName,
  getSavedBuilds,
  saveBuild,
  deleteBuild,
} from "@/services/buildStorageService";
import { useWeaponStore } from "@/stores/weaponStore";
import { useAttributeStore } from "@/stores/attributeStore";
import {
  encodePlannerStateToQuery,
  decodePlannerStateFromQuery,
  isLegacyUrlFormat,
} from "@/services/urlCodecService";
import type { PerkColumnType } from "@/types/PerkColumn";

const plannerStateKey = ref(0);
const buildName = ref(getDefaultBuildName());
const savedBuilds = ref<SavedBuild[]>([]);
const activeSavedBuildId = ref<string | null>(null);
const initialPerkState = ref<PerkColumnType[] | undefined>(undefined);
const perkTreeRef = ref<InstanceType<typeof PerkTree> | null>(null);
const isHydrating = ref(false);

const weaponStore = useWeaponStore();
const attributeStore = useAttributeStore();

const hasActiveSavedBuild = computed(() => {
  return activeSavedBuildId.value !== null;
});

const syncUrlFromState = () => {
  if (isHydrating.value) return;

  const perkColumns = perkTreeRef.value?.perkColumns ?? [];

  const query = encodePlannerStateToQuery({
    name: buildName.value,
    perkColumns,
    weapons: weaponStore.$state,
    attributePlans: attributeStore.attributePlans,
  });

  const newUrl = `${window.location.pathname}${query ? `?${query}` : ""}`;
  window.history.replaceState({}, "", newUrl);
};

const getCurrentQuery = (): string => {
  return window.location.search.startsWith("?")
    ? window.location.search.slice(1)
    : window.location.search;
};

const refreshSavedBuilds = () => {
  savedBuilds.value = getSavedBuilds();
};

const persistCurrentBuild = (buildId?: string): SavedBuild => {
  syncUrlFromState();

  const savedBuild = saveBuild({
    id: buildId ?? activeSavedBuildId.value ?? undefined,
    name: buildName.value,
    query: getCurrentQuery(),
  });

  buildName.value = savedBuild.name;
  activeSavedBuildId.value = savedBuild.id;
  refreshSavedBuilds();

  return savedBuild;
};

const hydrateFromState = (search: string) => {
  isHydrating.value = true;

  const state = decodePlannerStateFromQuery(search);

  buildName.value = state.name || getDefaultBuildName();
  initialPerkState.value = state.perkColumns;
  weaponStore.setWeapons(state.weapons);
  attributeStore.setPlans(state.attributePlans);

  plannerStateKey.value += 1;

  nextTick(() => {
    isHydrating.value = false;
    syncUrlFromState();
  });
};

const createNewBuildFromScratch = () => {
  activeSavedBuildId.value = null;
  hydrateFromState("");
};

const saveCurrentBuild = () => {
  persistCurrentBuild();
};

const loadSavedBuild = (build: SavedBuild) => {
  activeSavedBuildId.value = build.id;

  // Migrate legacy saved builds
  if (isLegacyUrlFormat(build.query)) {
    hydrateFromState(build.query);
    nextTick(() => {
      persistCurrentBuild(build.id);
    });
    return;
  }

  hydrateFromState(build.query);
};

const onDeleteBuild = (build: SavedBuild) => {
  const safeName = build.name.replace(/[\r\n]/g, " ").slice(0, 80);
  if (!confirm(`Delete "${safeName}"?`)) return;

  deleteBuild(build.id);
  refreshSavedBuilds();

  if (activeSavedBuildId.value === build.id) {
    activeSavedBuildId.value = null;
  }
};

const onPlannerStateChanged = () => {
  syncUrlFromState();

  if (!isHydrating.value && activeSavedBuildId.value) {
    persistCurrentBuild(activeSavedBuildId.value);
  }
};

watch(buildName, () => {
  syncUrlFromState();

  if (!isHydrating.value && activeSavedBuildId.value) {
    persistCurrentBuild(activeSavedBuildId.value);
  }
});

onMounted(() => {
  refreshSavedBuilds();

  const search = window.location.search;

  if (search && search !== "?") {
    hydrateFromState(search);

    // Try to match a saved build by query after migration
    nextTick(() => {
      const currentQuery = getCurrentQuery();
      const matchingBuild = savedBuilds.value.find(
        (build) => build.query === currentQuery,
      );

      if (matchingBuild) {
        activeSavedBuildId.value = matchingBuild.id;
        buildName.value = matchingBuild.name;
      }
    });
  }
});
</script>

<style scoped>
.blanket {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 50%;
  width: min(1240px, calc(100vw - 24px));
  transform: translateX(-50%);
  background: rgba(15, 12, 8, 0.72);
  border-radius: 12px;
  z-index: -1;
  box-shadow: 0 0 30px 35px rgba(15, 12, 8, 0.72);
}

.appBackground {
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  position: fixed;
  transform: translate3d(0, 0, 0);
  background-image: url("/assets/Site-background-dark.webp");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  filter: sepia(25%) brightness(0.45);
  z-index: -2;
}
</style>
