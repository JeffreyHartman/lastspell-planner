<template>
  <div
    class="pointer-events-none absolute left-full top-1/2 z-20 ml-2 hidden -translate-y-1/2 rounded-md border border-amber-600/40 bg-slate-900/95 p-2 text-left text-white shadow-lg group-hover:block"
    :class="widthClass"
  >
    <h3 class="mb-1 text-sm font-semibold leading-tight">{{ title }}</h3>
    <p v-if="meta" class="mb-1 text-xs text-amber-300">{{ meta }}</p>
    <p v-if="description" class="text-xs leading-snug text-slate-200">
      {{ description }}
    </p>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    description?: string;
    meta?: string;
    widthClass?: string;
  }>(),
  {
    description: "",
    meta: "",
    widthClass: "w-64",
  },
);
</script>
