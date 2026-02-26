<template>
  <div class="relative">
    <button
      type="button"
      class="weapon-slot"
      :class="{
        'weapon-slot--selected': weapon,
        'weapon-slot--disabled': disabled,
      }"
      :disabled="disabled"
      @click="toggleDropdown"
    >
      <img
        v-if="weapon"
        :src="weapon.icon"
        :alt="weapon.name"
        class="h-9 w-9 object-contain"
      />
      <span v-else class="text-[10px] font-medium uppercase text-slate-500">
        {{ label }}
      </span>
    </button>

    <WeaponDropdown
      v-if="showDropdown"
      :weapons="weapons"
      @select="onSelect"
      @close="showDropdown = false; emit('dropdown-toggle', false)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType } from "vue";
import type { Weapon } from "@/types/Weapon";
import WeaponDropdown from "./WeaponDropdown.vue";

defineProps({
  weapon: {
    type: Object as PropType<Weapon | null>,
    default: null,
  },
  weapons: {
    type: Array as PropType<Weapon[]>,
    required: true,
  },
  label: {
    type: String,
    default: "Empty",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  (event: "select", weapon: Weapon | null): void;
  (event: "dropdown-toggle", open: boolean): void;
}>();

const showDropdown = ref(false);

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
  emit("dropdown-toggle", showDropdown.value);
};

const onSelect = (weapon: Weapon | null) => {
  emit("select", weapon);
  showDropdown.value = false;
};
</script>
