import { defineStore } from "pinia";
import { Attribute } from "@/types/Attribute";

export const useAttributeStore = defineStore("attributes", {
  state: () => ({
    primaryAttributes: [] as Attribute[],
    secondaryAttributes: [] as Attribute[],
  }),
  getters: {
    allSelectedAttributes: (state) => [
      ...state.primaryAttributes,
      ...state.secondaryAttributes,
    ],
    selectedAttributeIds(state) {
      const allAttributes = [
        ...state.primaryAttributes,
        ...state.secondaryAttributes,
      ];
      return allAttributes.map((attr) => attr.id);
    },
    isPrimaryFull: (state) => state.primaryAttributes.length >= 5,
    isSecondaryFull: (state) => state.secondaryAttributes.length >= 5,
    isAttributeSelected() {
      return (id: number) => this.selectedAttributeIds.includes(id);
    },
  },
  actions: {
    addAttribute(attribute: Attribute, type: "primary" | "secondary") {
      if (type === "primary") {
        this.addPrimaryAttribute(attribute);
      } else {
        this.addSecondaryAttribute(attribute);
      }
    },
    addPrimaryAttribute(attribute: Attribute) {
      if (!this.isPrimaryFull && !this.isAttributeSelected(attribute.id)) {
        this.primaryAttributes.push(attribute);
        return true;
      } else {
        return false;
      }
    },
    addSecondaryAttribute(attribute: Attribute) {
      if (!this.isSecondaryFull && !this.isAttributeSelected(attribute.id)) {
        this.secondaryAttributes.push(attribute);
        return true;
      } else {
        return false;
      }
    },
    removeAttribute(attribute: Attribute, type: "primary" | "secondary") {
      if (type === "primary") {
        this.primaryAttributes = this.primaryAttributes.filter(
          (attr) => attr.id !== attribute.id,
        );
      } else {
        this.secondaryAttributes = this.secondaryAttributes.filter(
          (attr) => attr.id !== attribute.id,
        );
      }
    },
    clearAttributes() {
      this.primaryAttributes = [];
      this.secondaryAttributes = [];
    },
  },
});
