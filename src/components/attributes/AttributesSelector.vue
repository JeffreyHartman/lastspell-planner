<template>
  <section class="glass-panel p-4">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="text-2xl font-bold text-white">Attributes Priorities</h3>
        <p class="text-xs text-slate-300">
          Rate each stat from 0 to 3 stars.
        </p>
      </div>

      <button
        type="button"
        class="btn text-xs"
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
        class="glass-card min-w-0 p-3"
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
            class="btn py-1 text-[11px]"
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
            class="flex min-w-0 items-center gap-2 rounded-lg border border-slate-700/40 bg-slate-900/50 px-2.5 py-2 transition-colors duration-150 hover:border-slate-600/50"
          >
            <div
              class="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-600/50 bg-slate-700/60 transition-colors duration-150"
              :title="attribute.name"
            >
              <img
                :src="attribute.icon"
                :alt="`${attribute.name} icon`"
                class="h-8 w-8 object-contain"
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
                class="rounded-md p-0.5 text-amber-400 transition-all duration-150 hover:scale-110 hover:bg-slate-700/60 active:scale-95"
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

          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import {
  EyeIcon,
  EyeSlashIcon,
  StarIcon as StarOutlineIcon,
} from "@heroicons/vue/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/vue/24/solid";

import { useAttributeStore } from "@/stores/attributeStore";
import { getAttributeGroups } from "@/services/attributesService";
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

const allGroupsHideZeroStar = computed(() => {
  return attributeStore.allGroupsHideZeroStar;
});

const getPlan = (attributeId: number) => {
  return attributeStore.getPlan(attributeId);
};

const getStars = (attributeId: number): number => {
  return getPlan(attributeId).stars;
};

const setStars = (attributeId: number, selectedStars: number) => {
  const currentStars = getStars(attributeId);
  const nextStars =
    currentStars === selectedStars ? selectedStars - 1 : selectedStars;
  attributeStore.setStars(attributeId, nextStars);
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

watch(
  () => attributeStore.attributePlans,
  () => {
    emit("state-changed");
  },
  { deep: true },
);
</script>
