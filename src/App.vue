<template>
  <div class="blanket"></div>
  <div class="appBackground"></div>
  <div class="content mx-auto w-full max-w-[1200px] px-3 pb-8 text-center">
    <h1 class="py-5 text-4xl font-bold">The Last Spell Planner</h1>

    <div
      class="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_260px] xl:items-start"
    >
      <main class="min-w-0">
        <section
          class="mb-4 rounded-xl border border-slate-700/80 bg-slate-900/70 p-3 text-left"
        >
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-md border border-slate-600 bg-slate-800 px-2 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-700"
              @click="createNewBuildFromScratch"
            >
              <PlusIcon class="h-4 w-4" />
              Create a new build from scratch
            </button>

            <input
              v-model="buildName"
              type="text"
              class="min-w-0 flex-1 rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-amber-500 focus:outline-none"
              placeholder="Untitled Build"
            />

            <button
              type="button"
              class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-600 bg-slate-800 text-white transition-colors hover:bg-slate-700"
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

          <p class="mt-2 text-xs text-slate-300">
            {{
              hasActiveSavedBuild
                ? "Saved on this browser. Changes update automatically."
                : "Unsaved build. Click the heart to save it locally."
            }}
          </p>
        </section>

        <h2>Perk Tree</h2>
        <perk-tree
          :key="`perk-${plannerStateKey}`"
          @state-changed="onPlannerStateChanged"
        />

        <h2 class="py-4">Attributes</h2>
        <AttributesSelector
          :key="`attrs-${plannerStateKey}`"
          @state-changed="onPlannerStateChanged"
        />
      </main>

      <aside
        class="rounded-xl border border-slate-700/80 bg-slate-900/70 p-3 text-left"
      >
        <h2 class="text-2xl">Saved Builds</h2>

        <p v-if="savedBuilds.length === 0" class="mt-2 text-sm text-slate-300">
          No saved builds yet.
        </p>

        <div v-else class="mt-2 space-y-2">
          <button
            v-for="build in savedBuilds"
            :key="build.id"
            type="button"
            class="flex w-full flex-col rounded-md border px-2 py-2 text-left transition-colors"
            :class="
              build.id === activeSavedBuildId
                ? 'border-amber-500 bg-slate-800/90 text-white'
                : 'border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-700/80'
            "
            @click="loadSavedBuild(build)"
          >
            <span class="truncate text-sm font-semibold">{{ build.name }}</span>
            <span class="text-xs text-slate-400">{{
              formatUpdatedAt(build.updatedAt)
            }}</span>
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

const formatUpdatedAt = (updatedAt: string): string => {
  const parsedDate = new Date(updatedAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Saved locally";
  }

  return parsedDate.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style>
body {
  color: white;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: "Cinzel-Bold", sans-serif;
}
</style>

<style scoped>
/* Stole these from https://bbplanner.xyz */
.blanket {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 50%;
  width: min(1240px, calc(100vw - 24px));
  transform: translateX(-50%);
  background: rgba(6, 6, 6, 0.7);
  z-index: -1;
  box-shadow: 0 0 30px 35px rgba(6, 6, 6, 0.7);
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
  filter: grayscale(40%);
  z-index: -2;
}
</style>
