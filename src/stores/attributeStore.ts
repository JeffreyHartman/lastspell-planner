import { defineStore } from "pinia";
import {
  AttributeGroupKey,
  AttributePlansById,
  AttributePlanState,
} from "@/types/Attribute";
import {
  clampStars,
  getDefaultAttributePlanState,
  getDefaultHideZeroStarByGroup,
} from "@/services/attributesService";

export const useAttributeStore = defineStore("attributes", {
  state: () => ({
    attributePlans: {} as AttributePlansById,
    hideZeroStarByGroup: getDefaultHideZeroStarByGroup(),
  }),
  getters: {
    getPlan:
      (state) =>
      (attributeId: number): AttributePlanState => {
        return (
          state.attributePlans[attributeId] ?? getDefaultAttributePlanState()
        );
      },
    totalStarredAttributes: (state): number => {
      return Object.values(state.attributePlans).filter(
        (plan) => plan.stars > 0,
      ).length;
    },
    isGroupHidingZeroStar:
      (state) =>
      (groupKey: AttributeGroupKey): boolean => {
        return state.hideZeroStarByGroup[groupKey];
      },
    allGroupsHideZeroStar(state): boolean {
      return Object.values(state.hideZeroStarByGroup).every(Boolean);
    },
  },
  actions: {
    ensurePlan(attributeId: number): AttributePlanState {
      if (!this.attributePlans[attributeId]) {
        this.attributePlans[attributeId] = getDefaultAttributePlanState();
      }
      return this.attributePlans[attributeId];
    },

    cleanupPlan(attributeId: number) {
      const plan = this.attributePlans[attributeId];

      if (!plan) return;

      const normalizedPlan: AttributePlanState = {
        stars: clampStars(plan.stars),
      };

      if (normalizedPlan.stars === 0) {
        delete this.attributePlans[attributeId];
        return;
      }

      this.attributePlans[attributeId] = normalizedPlan;
    },

    setStars(attributeId: number, stars: number) {
      const plan = this.ensurePlan(attributeId);
      plan.stars = clampStars(stars);
      this.cleanupPlan(attributeId);
    },

    setPlans(plans: AttributePlansById) {
      const normalizedPlans: AttributePlansById = {};

      Object.entries(plans).forEach(([rawId, plan]) => {
        const attributeId = Number(rawId);

        if (!Number.isInteger(attributeId) || attributeId <= 0) {
          return;
        }

        const normalizedPlan: AttributePlanState = {
          stars: clampStars(plan.stars),
        };

        if (normalizedPlan.stars === 0) {
          return;
        }

        normalizedPlans[attributeId] = normalizedPlan;
      });

      this.attributePlans = normalizedPlans;
    },

    clearPlans() {
      this.attributePlans = {};
    },

    setHideZeroStar(groupKey: AttributeGroupKey, hideZeroStar: boolean) {
      this.hideZeroStarByGroup[groupKey] = hideZeroStar;
    },

    setAllHideZeroStar(hideZeroStar: boolean) {
      this.hideZeroStarByGroup = {
        basic: hideZeroStar,
        offense: hideZeroStar,
        defense: hideZeroStar,
        secondary: hideZeroStar,
      };
    },
  },
});
