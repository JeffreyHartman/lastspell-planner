<template>
  <div class="m-2 grid grid-cols-1 gap-4 md:grid-cols-2">
    <!-- Primary Attributes -->
    <div class="rounded-lg border border-gray-700 bg-gray-800 p-4">
      <h2 class="mb-2 text-xl font-bold text-white">Primary Attributes</h2>
      <button
        class="mb-2 w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        @click="showPrimaryDropdown = !showPrimaryDropdown"
      >
        Add Primary Attribute
      </button>

      <!-- Primary Attribute Dropdown-->
      <AttributeDropdown
        v-if="showPrimaryDropdown"
        type="primary"
        @select="addPrimaryAttribute"
      />

      <!-- Selected primary attributes list -->
      <div class="mt-4 space-y-2">
        <div
          v-for="attribute in selectedPrimaryAttributes"
          :key="attribute.id"
          class="flex gap-4"
        >
          <AttributeItem :attribute="attribute" :show-tooltip="true" />
          <TrashIcon
            class="h-5 w-5 cursor-pointer"
            @click="removeAttribute(attribute)"
          />
        </div>
      </div>
    </div>

    <!-- Secondary Attributes -->
    <div class="rounded-lg border border-gray-700 bg-gray-800 p-4">
      <h2 class="mb-2 text-xl font-bold text-white">Secondary Attributes</h2>
      <button
        class="mb-2 w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Add Secondary Attribute
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import AttributeDropdown from "./AttributeDropdown.vue";
import AttributeItem from "./AttributeItem.vue";
import { Attribute } from "@/types/Attribute";
import { getAttributeById } from "@/services/attributesService";
import { TrashIcon } from "@heroicons/vue/24/solid";

const showPrimaryDropdown = ref(false);

const selectedPrimaryAttributes = ref<Attribute[]>([]);

const addPrimaryAttribute = (attribute: Attribute) => {
  selectedPrimaryAttributes.value.push(attribute);
  showPrimaryDropdown.value = false;
};

const removeAttribute = (attribute: Attribute) => {
  selectedPrimaryAttributes.value = selectedPrimaryAttributes.value.filter(
    (attr) => attr.id !== attribute.id,
  );
};
</script>
