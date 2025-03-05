<template>
  <div class="flex items-center space-x-1">
    <img :src="attribute.icon" alt="attribute icon" />
    <span class="group relative">
      {{ attribute.name }}

      <!-- Tooltip -->
      <div
        v-if="showTooltip"
        class="absolute left-full z-10 ml-2 hidden w-64 rounded-md bg-gray-900 p-2 text-sm text-white shadow-lg group-hover:block"
      >
        <h3 class="mb-1 font-bold">{{ attribute.name }}</h3>
        <div class="mb-1 text-xs">
          <span class="text-gray-400">Range: </span>
          {{ attribute.min }} - {{ attribute.max }}
        </div>
        <p class="text-xs">{{ attribute.description }}</p>
      </div>
    </span>
  </div>
</template>

<script setup lang="ts">
import { Attribute } from "@/types/Attribute";

defineProps<{
  attribute: Attribute;
  showTooltip?: boolean;
}>();
</script>
