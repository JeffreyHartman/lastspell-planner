<template>
  <!-- dropdown -->
  <div
    class="absolute z-10 max-h-72 max-w-fit overflow-y-auto overflow-x-hidden rounded-md border-opacity-90 bg-gray-800 p-2 shadow-lg"
  >
    <div
      v-for="attribute in attributes"
      :key="attribute.id"
      class="cursor-pointer hover:bg-gray-700"
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
