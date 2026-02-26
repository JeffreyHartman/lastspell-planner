<template>
  <div class="blanket"></div>
  <div class="appBackground"></div>
  <div class="relative z-10 mx-auto w-full max-w-[1280px] px-4 pb-12 text-center sm:px-6">
    <header class="py-6 sm:py-8">
      <h1
        class="text-3xl font-bold tracking-wider text-white drop-shadow-lg sm:text-4xl lg:text-5xl"
      >
        The Last Spell Planner
      </h1>
      <p class="mt-1 text-sm tracking-wide text-slate-400">
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
              class="min-w-0 flex-1 rounded-lg border border-slate-600/50 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/70 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-colors duration-150"
              placeholder="Untitled Build"
            />

            <button
              type="button"
              class="btn inline-flex h-10 w-10 items-center justify-center !px-0"
              :class="
                hasActiveSavedBuild
                  ? 'border-amber-500/50 text-amber-400 shadow-glow-amber'
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
          :key="`perk-${plannerStateKey}`"
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
        <h2 class="mb-3 border-b border-slate-700/40 pb-2 text-xl">
          Saved Builds
        </h2>

        <p v-if="savedBuilds.length === 0" class="mt-2 text-sm text-slate-400">
          No saved builds yet.
        </p>

        <div v-else class="mt-2 space-y-2">
          <button
            v-for="build in savedBuilds"
            :key="build.id"
            type="button"
            class="flex w-full flex-col rounded-lg border px-3 py-2.5 text-left transition-all duration-150"
            :class="
              build.id === activeSavedBuildId
                ? 'border-amber-500/50 bg-amber-500/10 text-white shadow-glow-amber'
                : 'border-slate-700/40 bg-slate-800/40 text-slate-300 hover:border-slate-600/60 hover:bg-slate-700/50'
            "
            @click="loadSavedBuild(build)"
          >
            <span class="truncate text-sm font-semibold">{{ build.name }}</span>
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import {
  HeartIcon as HeartOutlineIcon,
  PlusIcon,
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
} from "@/services/buildStorageService";

const plannerStateKey = ref(0);
const buildName = ref(getDefaultBuildName());
const savedBuilds = ref<SavedBuild[]>([]);
const activeSavedBuildId = ref<string | null>(null);

const hasActiveSavedBuild = computed(() => {
  return activeSavedBuildId.value !== null;
});

const getCurrentQuery = (): string => {
  return window.location.search.startsWith("?")
    ? window.location.search.slice(1)
    : window.location.search;
};

const refreshSavedBuilds = () => {
  savedBuilds.value = getSavedBuilds();
};

const persistCurrentBuild = (buildId?: string): SavedBuild => {
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

const createNewBuildFromScratch = () => {
  buildName.value = getDefaultBuildName();
  activeSavedBuildId.value = null;
  window.history.replaceState({}, "", window.location.pathname);
  plannerStateKey.value += 1;
};

const saveCurrentBuild = () => {
  persistCurrentBuild();
};

const loadSavedBuild = (build: SavedBuild) => {
  buildName.value = build.name;
  activeSavedBuildId.value = build.id;

  const nextUrl = `${window.location.pathname}${build.query ? `?${build.query}` : ""}`;
  window.history.replaceState({}, "", nextUrl);
  plannerStateKey.value += 1;
};

const onPlannerStateChanged = () => {
  if (!activeSavedBuildId.value) {
    return;
  }

  persistCurrentBuild(activeSavedBuildId.value);
};

watch(buildName, () => {
  if (!activeSavedBuildId.value) {
    return;
  }

  persistCurrentBuild(activeSavedBuildId.value);
});

onMounted(() => {
  refreshSavedBuilds();

  const matchingBuild = savedBuilds.value.find(
    (build) => build.query === getCurrentQuery(),
  );

  if (matchingBuild) {
    activeSavedBuildId.value = matchingBuild.id;
    buildName.value = matchingBuild.name;
  }
});


</script>

<style scoped>
/* Stole these from https://bbplanner.xyz */
.blanket {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 50%;
  width: min(1240px, calc(100vw - 24px));
  transform: translateX(-50%);
  background: rgba(6, 6, 6, 0.65);
  border-radius: 12px;
  z-index: -1;
  box-shadow: 0 0 30px 35px rgba(6, 6, 6, 0.65);
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
  filter: grayscale(50%) brightness(0.7);
  z-index: -2;
}
</style>
