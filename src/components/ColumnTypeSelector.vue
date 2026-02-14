<template>
  <div
    class="absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 animate-fade-in rounded-xl border border-slate-600/40 bg-slate-900/95 p-2 shadow-glass backdrop-blur-sm"
    ref="target"
  >
    <div class="flex flex-col gap-0.5">
      <button
        v-for="columnType in columnTypes"
        :key="columnType"
        @click="selectColumnType(columnType)"
        class="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all duration-150"
        :class="
          currentType === columnType
            ? 'border border-amber-500/40 bg-amber-500/15 text-amber-200'
            : 'border border-transparent text-slate-300 hover:bg-slate-700/60 hover:text-white'
        "
      >
        <img
          :src="`/assets/icons/${columnType}_Perks_Column_Icon.webp`"
          :alt="columnType"
          class="h-6 w-6 object-contain"
        />
        <span class="capitalize">{{ columnType }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onClickOutside, onKeyStroke } from "@vueuse/core";

defineProps({
  currentType: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["columntype-selected", "close-columntype-selector"]);

const target = ref(null);
onClickOutside(target, () => emit("close-columntype-selector"));
onKeyStroke("Escape", () => emit("close-columntype-selector"));

const columnTypes = ["choice", "poison", "debuff", "defense", "assassin"];

const selectColumnType = (columnType: string) => {
  emit("columntype-selected", columnType);
};
</script>
