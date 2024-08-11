<template>
  <!-- Tooltip -->
  <div
    class="absolute left-full z-10 ml-2 hidden w-64 rounded-md bg-gray-900 p-2 text-sm text-white shadow-lg group-hover:block"
  >
    <h3 class="mb-1 font-bold">{{ perk.name }}</h3>
    <p class="text-xs">{{ perk.description }}</p>
  </div>
</template>

<script setup lang="ts">
import { PropType } from "vue";
import { Perk } from "../types/Perk";

const props = defineProps({
  perk: {
    type: Object as PropType<Perk>,
    required: true,
  },
});
</script>
