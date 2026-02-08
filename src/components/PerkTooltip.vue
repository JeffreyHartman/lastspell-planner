<template>
  <HoverTooltip :title="perk.name" :description="perk.description" />
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { Perk } from "../types/Perk";
import HoverTooltip from "./shared/HoverTooltip.vue";

defineProps({
  perk: {
    type: Object as PropType<Perk>,
    required: true,
  },
});
</script>
