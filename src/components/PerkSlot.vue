<template>
  <div class="relative">
    <div
      class="perk-slot group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700"
      @click="togglePerkPicker"
      ref="perkSlot"
    >
      <img
        v-if="selectedPerk"
        :src="selectedPerk.icon"
        :alt="selectedPerk.name"
        class="h-8 w-8"
      />
      <PerkTooltip v-if="selectedPerk" :perk="selectedPerk" />
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
import { computed, defineEmits, ref, PropType, nextTick } from "vue";
import { Perk } from "../types/Perk";
import { getPerksByTypeAndTier } from "../services/perkService";
import PerkPicker from "./PerkPicker.vue";
import PerkTooltip from "./PerkTooltip.vue";

const props = defineProps({
  perk: {
    type: Object as PropType<Perk | null>,
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
});

const emit = defineEmits(["select-perk"]);

const showPerkPicker = ref(false);
const perkSlot = ref<HTMLElement | null>(null);
const pickerPosition = ref({ top: "0px", left: "0px" });

const selectedPerk = ref<Perk | null>(props.perk);

const availablePerks = computed(() => {
  const perks = getPerksByTypeAndTier(props.columnType, props.tier);
  // Add a 'Clear Perk' option
  const clearPerk: Perk = {
    id: 0,
    name: "Clear Perk",
    tier: 0,
    type: "clear",
    description: "Clears the perk from the column",
    icon: "/assets/icons/perks/clear.jpg",
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
        left: `40px`,
      };
    }
  }
};

const handleSelectPerk = (perk: Perk) => {
  // Update the local state
  selectedPerk.value = perk.id === 0 ? null : perk;

  // Emit the event to the parent
  emit("select-perk", selectedPerk ? selectedPerk.value : null);

  // Close the picker
  showPerkPicker.value = false;
};
</script>
