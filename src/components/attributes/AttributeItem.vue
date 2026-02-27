<template>
  <div class="flex items-center gap-1.5">
    <img
      :src="attribute.icon"
      :alt="`${attribute.name} icon`"
      class="h-6 w-6 object-contain"
    />
    <span class="group relative text-sm text-slate-200">
      {{ attribute.name }}

      <!-- Tooltip -->
      <div
        v-if="showTooltip"
        class="pointer-events-none absolute left-full z-30 ml-2 hidden w-64 animate-fade-in rounded-lg border border-ember/25 bg-slate-900/95 p-3 text-sm text-white shadow-glass backdrop-blur-sm group-hover:block"
      >
        <h3 class="mb-1 font-bold text-orange-200">{{ attribute.name }}</h3>
        <div class="mb-1 text-xs">
          <span class="text-slate-400">Range: </span>
          <span class="text-slate-200"
            >{{ attribute.min }} - {{ attribute.max }}</span
          >
        </div>
        <p class="text-xs leading-relaxed text-slate-300">
          {{ attribute.description }}
        </p>
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
