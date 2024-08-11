<template>
  <div
    class="absolute z-10 rounded-md border-opacity-90 bg-gray-800 p-2 shadow-lg"
    :style="position"
    ref="target"
  >
    <div class="flex flex-col">
      <button
        v-for="columnType in columnTypes"
        :key="columnType"
        @click="selectColumnType(columnType)"
        class="px-4 py-2 text-left hover:bg-gray-700"
        :class="{ 'bg-blue-600': currentType === columnType }"
      >
        {{ columnType }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, PropType } from "vue";
import { onClickOutside, onKeyStroke } from "@vueuse/core";

const props = defineProps({
  currentType: {
    type: String,
    required: true,
  },
  position: {
    type: Object as PropType<{ top: string; left: string }>,
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
