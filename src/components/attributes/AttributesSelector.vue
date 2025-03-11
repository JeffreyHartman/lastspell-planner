<template>
  <div class="m-2 grid grid-cols-1 gap-4 md:grid-cols-2">
    <!-- Primary Attributes -->
    <div class="rounded-lg border border-gray-700 bg-gray-800 p-4">
      <h2 class="mb-2 text-xl font-bold text-white">Primary Attributes</h2>
      <button
        class="mb-2 w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        @click="showPrimaryDropdown = !showPrimaryDropdown"
        :disabled="selectedPrimaryAttributes.length >= 5"
      >
        Add Primary Attribute ({{ selectedPrimaryAttributes.length }}/5)
      </button>

      <!-- Primary Attribute Dropdown-->
      <AttributeDropdown
        v-if="showPrimaryDropdown"
        type="primary"
        @select="addPrimaryAttribute"
      />

      <!-- Selected primary attributes list -->
      <div class="mt-4 h-[250px] space-y-2">
        <div
          v-for="attribute in selectedPrimaryAttributes"
          :key="attribute.id"
          class="flex gap-4"
        >
          <AttributeItem :attribute="attribute" :show-tooltip="true" />
          <TrashIcon
            class="h-5 w-5 cursor-pointer"
            @click="removeAttribute(attribute, 'primary')"
          />
        </div>
      </div>
    </div>

    <!-- Secondary Attributes -->
    <div class="rounded-lg border border-gray-700 bg-gray-800 p-4">
      <h2 class="mb-2 text-xl font-bold text-white">Secondary Attributes</h2>
      <button
        class="mb-2 w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        @click="showSecondaryDropdown = !showSecondaryDropdown"
        :disabled="selectedSecondaryAttributes.length >= 5"
      >
        Add Secondary Attribute ({{ selectedSecondaryAttributes.length }}/5)
      </button>

      <!-- Secondary Attribute Dropdown -->
      <AttributeDropdown
        v-if="showSecondaryDropdown"
        type="secondary"
        @select="addSecondaryAttribute"
      />

      <!-- Selected secondary attributes list -->
      <div class="mt-4 h-[250px] space-y-2">
        <div
          v-for="attribute in selectedSecondaryAttributes"
          :key="attribute.id"
          class="flex gap-4"
        >
          <AttributeItem :attribute="attribute" :show-tooltip="true" />
          <TrashIcon
            class="h-5 w-5 cursor-pointer"
            @click="removeAttribute(attribute, 'secondary')"
          />
        </div>
      </div>
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
const showSecondaryDropdown = ref(false);

const selectedPrimaryAttributes = ref<Attribute[]>([]);
const selectedSecondaryAttributes = ref<Attribute[]>([]);

const addPrimaryAttribute = (attribute: Attribute) => {
  if (selectedPrimaryAttributes.value.length < 5) {
    selectedPrimaryAttributes.value.push(attribute);
    showPrimaryDropdown.value = false;
  }
};

const addSecondaryAttribute = (attribute: Attribute) => {
  if (selectedSecondaryAttributes.value.length < 5) {
    selectedSecondaryAttributes.value.push(attribute);
    showSecondaryDropdown.value = false;
  }
};

const removeAttribute = (
  attribute: Attribute,
  type: "primary" | "secondary",
) => {
  if (type === "primary") {
    selectedPrimaryAttributes.value = selectedPrimaryAttributes.value.filter(
      (attr) => attr.id !== attribute.id,
    );
  } else {
    selectedSecondaryAttributes.value =
      selectedSecondaryAttributes.value.filter(
        (attr) => attr.id !== attribute.id,
      );
  }
};
</script>
