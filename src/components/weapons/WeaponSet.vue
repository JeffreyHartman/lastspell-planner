<template>
  <div class="glass-card overflow-visible p-3">
    <h4 class="mb-2 text-sm font-semibold text-slate-300">
      {{ label }}
    </h4>
    <div class="flex items-start gap-3">
      <div class="text-center">
        <WeaponSlot
          :weapon="primaryWeapon"
          :weapons="mainHandWeapons"
          label="Main"
          @select="onPrimarySelect"
          @dropdown-toggle="(open: boolean) => emit('dropdown-toggle', open)"
        />
        <span class="mt-1 block text-[10px] text-slate-500">Main</span>
      </div>
      <div class="text-center">
        <WeaponSlot
          :weapon="offhandWeapon"
          :weapons="offHandWeapons"
          label="Off"
          :disabled="offhandDisabled"
          @select="onOffhandSelect"
          @dropdown-toggle="(open: boolean) => emit('dropdown-toggle', open)"
        />
        <span class="mt-1 block text-[10px] text-slate-500">Off-hand</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Weapon } from "@/types/Weapon";
import {
  getWeaponById,
  getMainHandWeapons,
  getOffHandWeapons,
} from "@/services/weaponService";
import { useWeaponStore } from "@/stores/weaponStore";
import WeaponSlot from "./WeaponSlot.vue";

const props = defineProps({
  setIndex: {
    type: Number,
    required: true,
  },
  label: {
    type: String,
    required: true,
  },
});

const emit = defineEmits<{
  (event: "dropdown-toggle", open: boolean): void;
}>();

const weaponStore = useWeaponStore();

const mainHandWeapons = getMainHandWeapons();
const offHandWeapons = getOffHandWeapons();

const primaryWeapon = computed((): Weapon | null => {
  const id = weaponStore.getSet(props.setIndex).primaryId;
  return id ? getWeaponById(id) ?? null : null;
});

const offhandWeapon = computed((): Weapon | null => {
  const id = weaponStore.getSet(props.setIndex).offhandId;
  return id ? getWeaponById(id) ?? null : null;
});

const offhandDisabled = computed(() =>
  weaponStore.isOffhandDisabled(props.setIndex),
);

const onPrimarySelect = (weapon: Weapon | null) => {
  weaponStore.setPrimary(props.setIndex, weapon?.id ?? null);
};

const onOffhandSelect = (weapon: Weapon | null) => {
  weaponStore.setOffhand(props.setIndex, weapon?.id ?? null);
};
</script>
