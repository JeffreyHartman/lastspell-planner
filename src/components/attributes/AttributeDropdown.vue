<template>
  <!-- dropdown -->
  <div
    class="absolute z-20 max-h-72 max-w-fit animate-fade-in overflow-y-auto overflow-x-hidden rounded-xl border border-slate-600/40 bg-slate-900/95 p-2 shadow-glass backdrop-blur-sm"
  >
    <div
      v-for="attribute in attributes"
      :key="attribute.id"
      class="cursor-pointer rounded-lg px-1 py-0.5 transition-colors duration-150 hover:bg-slate-700/60"
      @click="selectAttribute(attribute)"
    >
      <AttributeItem :attribute="attribute" :show-tooltip="false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Attribute } from "@/types/Attribute";
import { getAllAttributes } from "@/services/attributesService";
import AttributeItem from "./AttributeItem.vue";

const attributes = ref<Attribute[]>(getAllAttributes());

const emit = defineEmits(["select"]);

const selectAttribute = (attribute: Attribute) => {
  emit("select", attribute);
};
</script>
