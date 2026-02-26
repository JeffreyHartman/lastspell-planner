<template>
  <div class="relative">
    <div
      class="perk-slot-circle group"
      :class="{
        'perk-slot-circle--essential': perk && priority === 'essential',
        'perk-slot-circle--bonus': perk && priority === 'bonus',
        'perk-slot-circle--search-match': isSearchMatch,
        'perk-slot-circle--search-dimmed': isSearchActive && !isSearchMatch,
      }"
      @click="togglePerkPicker"
      @contextmenu.prevent="onRightClick"
      ref="perkSlot"
    >
      <img
        v-if="perk"
        :src="perk.icon"
        :alt="perk.name"
        class="h-10 w-10 rounded-full"
        :class="{ 'bg-slate-100 p-1': isPlaceholderIcon(perk.icon) }"
      />
      <span v-else class="h-2 w-2 rounded-full bg-slate-600/60"></span>
      <PerkTooltip v-if="perk" :perk="perk" />
    </div>
    <div
      v-if="isSearchMatch && matchingPerkNames.length"
      class="pointer-events-none absolute left-14 top-1/2 z-10 -translate-y-1/2 whitespace-nowrap rounded border border-blue-500/30 bg-slate-800/90 px-2 py-1 text-xs text-blue-300"
    >
      {{ matchingPerkNames.join(", ") }}
    </div>
    <PerkPicker
      v-if="showPerkPicker"
      :perks="availablePerks"
      :position="pickerPosition"
      @close-perk-picker="showPerkPicker = false"
      @select-perk="handleSelectPerk"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, PropType, nextTick } from "vue";
import { Perk } from "../types/Perk";
import { SelectedPerk } from "../types/SelectedPerk";
import { getPerksByTypeAndTier } from "../services/perkService";
import PerkPicker from "./PerkPicker.vue";
import PerkTooltip from "./PerkTooltip.vue";

const props = defineProps({
  selection: {
    type: Object as PropType<SelectedPerk | null>,
    default: null,
  },
  tier: {
    type: Number,
    required: true,
  },
  columnType: {
    type: String,
    required: true,
  },
  searchQuery: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["select-perk", "toggle-priority"]);

const showPerkPicker = ref(false);
const perkSlot = ref<HTMLElement | null>(null);
const pickerPosition = ref({ top: "0px", left: "0px" });

const perk = computed(() => props.selection?.perk ?? null);
const priority = computed(() => props.selection?.priority);

const isSearchActive = computed(() => props.searchQuery.length > 0);

const matchingPerks = computed(() => {
  if (!isSearchActive.value) return [];
  const query = props.searchQuery.toLowerCase();
  return getPerksByTypeAndTier(props.columnType, props.tier).filter((perk) =>
    perk.name.toLowerCase().includes(query),
  );
});

const isSearchMatch = computed(() => matchingPerks.value.length > 0);

const matchingPerkNames = computed(() =>
  matchingPerks.value.map((perk) => perk.name),
);

const availablePerks = computed(() => {
  const perks = getPerksByTypeAndTier(props.columnType, props.tier);
  const clearPerk: Perk = {
    id: 0,
    name: "Clear Perk",
    tier: 0,
    type: "clear",
    description: "Clears the perk from the column",
    icon: "/assets/icons/perks/clear.svg",
  };
  perks.push(clearPerk);
  return perks;
});

const togglePerkPicker = async () => {
  showPerkPicker.value = !showPerkPicker.value;
  if (showPerkPicker.value) {
    await nextTick();
    if (perkSlot.value) {
      pickerPosition.value = {
        top: `0px`,
        left: `52px`,
      };
    }
  }
};

const handleSelectPerk = (perk: Perk) => {
  emit("select-perk", perk.id === 0 ? null : perk, props.tier);
  showPerkPicker.value = false;
};

const onRightClick = () => {
  if (perk.value) {
    emit("toggle-priority", props.tier);
  }
};

const isPlaceholderIcon = (iconPath: string) => {
  return iconPath.includes("raw.githubusercontent.com/tailwindlabs/heroicons");
};
</script>
