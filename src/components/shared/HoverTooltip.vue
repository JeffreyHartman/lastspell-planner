<template>
  <div
    class="pointer-events-none absolute left-full top-1/2 z-30 ml-3 hidden -translate-y-1/2 animate-fade-in rounded-lg border border-ember/25 bg-slate-900/95 p-3 text-left text-white shadow-glass backdrop-blur-sm group-hover:block"
    :class="widthClass"
  >
    <h3 class="mb-1 text-sm font-semibold leading-tight text-orange-200">
      {{ title }}
    </h3>
    <p v-if="meta" class="mb-1.5 text-xs text-ember/80">{{ meta }}</p>
    <p v-if="description" class="text-xs leading-relaxed text-slate-300">
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
