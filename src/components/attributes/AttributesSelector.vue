<template>
  <section
    class="m-2 rounded-xl border border-slate-700/70 bg-slate-900/65 p-4"
  >
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="text-2xl font-bold text-white">Attributes Priorities</h3>
        <p class="text-xs text-slate-300">
          Rate each stat from 0 to 3 stars and optionally set a target range.
        </p>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-md border border-slate-600 bg-slate-800/90 px-3 py-2 text-xs font-semibold text-slate-100 transition-colors hover:bg-slate-700"
        @click="toggleAllGroupsZeroStarVisibility"
      >
        <component
          :is="allGroupsHideZeroStar ? EyeIcon : EyeSlashIcon"
          class="h-4 w-4"
        />
        {{ allGroupsHideZeroStar ? "Show 0-star stats" : "Hide 0-star stats" }}
      </button>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="group in attributeGroups"
        :key="group.key"
        class="min-w-0 rounded-lg border border-slate-700/80 bg-slate-800/70 p-3"
      >
        <header class="mb-3 flex items-center justify-between gap-2">
          <div>
            <h4 class="text-lg font-semibold text-slate-100">
              {{ group.label }}
            </h4>
            <p class="text-xs text-slate-400">
              {{ getStarredCount(group) }}/{{ group.attributes.length }} starred
            </p>
          </div>

          <button
            type="button"
            class="inline-flex items-center gap-1 rounded border border-slate-600 px-2 py-1 text-[11px] font-semibold text-slate-200 transition-colors hover:bg-slate-700"
            @click="toggleGroupZeroStarVisibility(group.key)"
          >
            <component
              :is="isGroupHidingZeroStar(group.key) ? EyeIcon : EyeSlashIcon"
              class="h-3.5 w-3.5"
            />
            {{
              isGroupHidingZeroStar(group.key) ? "Show 0-star" : "Hide 0-star"
            }}
          </button>
        </header>

        <div class="space-y-2">
          <div
            v-if="getVisibleAttributes(group).length === 0"
            class="rounded-md border border-dashed border-slate-600 p-3 text-center text-xs text-slate-400"
          >
            No starred stats in this group.
          </div>

          <div
            v-for="attribute in getVisibleAttributes(group)"
            :key="attribute.id"
            class="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-1 rounded-md border border-slate-700/80 bg-slate-900/60 px-2 py-1.5"
          >
            <div
              class="group relative row-span-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-500/70 bg-slate-600/80"
              :title="attribute.name"
            >
              <img
                :src="attribute.icon"
                :alt="`${attribute.name} icon`"
                class="h-7 w-7 object-contain"
                loading="lazy"
              />
              <HoverTooltip
                :title="attribute.name"
                :meta="`Wiki range: ${attribute.min} - ${attribute.max}`"
                :description="attribute.description"
                width-class="w-72"
              />
            </div>

            <div class="flex min-w-0 items-center gap-0.5">
              <button
                v-for="star in 3"
                :key="`a${attribute.id}-s${star}`"
                type="button"
                class="rounded p-0.5 text-amber-400 transition-colors hover:bg-slate-700"
                :aria-label="`Set ${attribute.name} importance to ${star} stars`"
                @click="setStars(attribute.id, star)"
              >
                <StarSolidIcon
                  v-if="star <= getStars(attribute.id)"
                  class="h-5 w-5"
                />
                <StarOutlineIcon v-else class="h-5 w-5" />
              </button>
            </div>

            <div
              class="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1"
            >
              <input
                type="text"
                :placeholder="attribute.min"
                :value="getMinTarget(attribute.id)"
                class="w-full min-w-0 rounded border border-slate-600 bg-slate-900 px-1.5 py-1 text-center text-[11px] text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                @input="onMinTargetInput(attribute.id, $event)"
              />
              <span class="text-[10px] font-semibold uppercase text-slate-500"
                >to</span
              >
              <input
                type="text"
                :placeholder="attribute.max"
                :value="getMaxTarget(attribute.id)"
                class="w-full min-w-0 rounded border border-slate-600 bg-slate-900 px-1.5 py-1 text-center text-[11px] text-slate-100 placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                @input="onMaxTargetInput(attribute.id, $event)"
              />
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import {
  EyeIcon,
  EyeSlashIcon,
  StarIcon as StarOutlineIcon,
} from "@heroicons/vue/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/vue/24/solid";

import { useAttributeStore } from "@/stores/attributeStore";
import {
  decodeAttributePlansFromUrl,
  encodeAttributePlansForUrl,
  getAttributeGroups,
} from "@/services/attributesService";
import {
  Attribute,
  AttributeGroup,
  AttributeGroupKey,
} from "@/types/Attribute";
import HoverTooltip from "@/components/shared/HoverTooltip.vue";

const emit = defineEmits<{
  (event: "state-changed"): void;
}>();

const attributeStore = useAttributeStore();
const attributeGroups = getAttributeGroups();
const isHydratingFromUrl = ref(true);

const allGroupsHideZeroStar = computed(() => {
  return attributeStore.allGroupsHideZeroStar;
});

const getPlan = (attributeId: number) => {
  return attributeStore.getPlan(attributeId);
};

const getStars = (attributeId: number): number => {
  return getPlan(attributeId).stars;
};

const getMinTarget = (attributeId: number): string => {
  return getPlan(attributeId).minTarget;
};

const getMaxTarget = (attributeId: number): string => {
  return getPlan(attributeId).maxTarget;
};

const setStars = (attributeId: number, selectedStars: number) => {
  const currentStars = getStars(attributeId);
  const nextStars =
    currentStars === selectedStars ? selectedStars - 1 : selectedStars;
  attributeStore.setStars(attributeId, nextStars);
};

const onMinTargetInput = (attributeId: number, event: Event) => {
  const input = event.target as HTMLInputElement;
  attributeStore.setMinTarget(attributeId, input.value);
};

const onMaxTargetInput = (attributeId: number, event: Event) => {
  const input = event.target as HTMLInputElement;
  attributeStore.setMaxTarget(attributeId, input.value);
};

const isGroupHidingZeroStar = (groupKey: AttributeGroupKey): boolean => {
  return attributeStore.isGroupHidingZeroStar(groupKey);
};

const toggleGroupZeroStarVisibility = (groupKey: AttributeGroupKey) => {
  attributeStore.setHideZeroStar(
    groupKey,
    !attributeStore.isGroupHidingZeroStar(groupKey),
  );
};

const toggleAllGroupsZeroStarVisibility = () => {
  attributeStore.setAllHideZeroStar(!allGroupsHideZeroStar.value);
};

const getVisibleAttributes = (group: AttributeGroup): Attribute[] => {
  if (!isGroupHidingZeroStar(group.key)) {
    return group.attributes;
  }

  return group.attributes.filter((attribute) => getStars(attribute.id) > 0);
};

const getStarredCount = (group: AttributeGroup): number => {
  return group.attributes.filter((attribute) => getStars(attribute.id) > 0)
    .length;
};

const syncAttributesToUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const encodedPlans = encodeAttributePlansForUrl(
    attributeStore.attributePlans,
  );

  if (encodedPlans) {
    params.set("attrs", encodedPlans);
  } else {
    params.delete("attrs");
  }

  const queryString = params.toString();
  const nextUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}`;

  window.history.replaceState({}, "", nextUrl);
};

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const encodedPlans = params.get("attrs");

  if (encodedPlans) {
    attributeStore.setPlans(decodeAttributePlansFromUrl(encodedPlans));
  } else {
    attributeStore.clearPlans();
  }

  isHydratingFromUrl.value = false;
  syncAttributesToUrl();
});

watch(
  () => attributeStore.attributePlans,
  () => {
    if (isHydratingFromUrl.value) return;
    syncAttributesToUrl();
    emit("state-changed");
  },
  { deep: true },
);
</script>
