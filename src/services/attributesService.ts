import attributesData from "../attributes.json";
import {
  Attribute,
  AttributeGroup,
  AttributeGroupKey,
  AttributePlansById,
  AttributePlanState,
  AttributesData,
  HideZeroStarByGroup,
} from "../types/Attribute";

const data = attributesData as AttributesData;

const ATTRIBUTE_GROUPS: AttributeGroup[] = [
  {
    key: "basic",
    label: "Basic",
    attributes: [...data.primaryAttributes],
  },
  {
    key: "offense",
    label: "Offense",
    attributes: [...data.offenseAttributes],
  },
  {
    key: "defense",
    label: "Defense",
    attributes: [...data.defenseAttributes],
  },
  {
    key: "secondary",
    label: "Secondary",
    attributes: [...data.secondaryAttributes],
  },
];

const DEFAULT_PLAN_STATE: AttributePlanState = {
  stars: 0,
  minTarget: "",
  maxTarget: "",
};

const KNOWN_ATTRIBUTE_IDS = new Set(
  ATTRIBUTE_GROUPS.flatMap((group) =>
    group.attributes.map((attribute) => attribute.id),
  ),
);

export const getDefaultAttributePlanState = (): AttributePlanState => ({
  ...DEFAULT_PLAN_STATE,
});

export const getDefaultHideZeroStarByGroup = (): HideZeroStarByGroup => ({
  basic: false,
  offense: false,
  defense: false,
  secondary: false,
});

export const getAttributeGroups = (): AttributeGroup[] => {
  return ATTRIBUTE_GROUPS.map((group) => ({
    ...group,
    attributes: [...group.attributes],
  }));
};

export const getAllAttributes = (): Attribute[] => {
  return ATTRIBUTE_GROUPS.flatMap((group) => group.attributes);
};

export const getAttributesByCategory = (category: string): Attribute[] => {
  switch (category) {
    case "basic":
    case "primary":
      return [...data.primaryAttributes];
    case "offense":
      return [...data.offenseAttributes];
    case "defense":
      return [...data.defenseAttributes];
    case "secondary":
      return [...data.secondaryAttributes];
    default:
      return getAllAttributes();
  }
};

export const getAttributeById = (id: number): Attribute | undefined => {
  return getAllAttributes().find((attribute) => attribute.id === id);
};

export const clampStars = (stars: number): number => {
  if (!Number.isFinite(stars)) return 0;
  return Math.min(3, Math.max(0, Math.trunc(stars)));
};

const encodePlanValue = (value: string): string => {
  return encodeURIComponent(value.trim());
};

const decodePlanValue = (value: string): string => {
  try {
    return decodeURIComponent(value).trim();
  } catch {
    return "";
  }
};

const hasPlanValue = (plan: AttributePlanState): boolean => {
  return (
    plan.stars > 0 || plan.minTarget.length > 0 || plan.maxTarget.length > 0
  );
};

export const encodeAttributePlansForUrl = (
  attributePlans: AttributePlansById,
): string => {
  return Object.entries(attributePlans)
    .map(([rawId, plan]) => {
      const id = Number(rawId);
      if (!Number.isInteger(id) || id <= 0 || !KNOWN_ATTRIBUTE_IDS.has(id)) {
        return null;
      }

      const normalizedPlan: AttributePlanState = {
        stars: clampStars(plan.stars),
        minTarget: plan.minTarget?.trim() ?? "",
        maxTarget: plan.maxTarget?.trim() ?? "",
      };

      if (!hasPlanValue(normalizedPlan)) {
        return null;
      }

      return {
        id,
        plan: normalizedPlan,
      };
    })
    .filter((entry): entry is { id: number; plan: AttributePlanState } =>
      Boolean(entry),
    )
    .sort((a, b) => a.id - b.id)
    .map(
      ({ id, plan }) =>
        `${id}~${plan.stars}~${encodePlanValue(plan.minTarget)}~${encodePlanValue(plan.maxTarget)}`,
    )
    .join(";");
};

export const decodeAttributePlansFromUrl = (
  encodedPlans: string,
): AttributePlansById => {
  if (!encodedPlans) {
    return {};
  }

  const decodedPlans: AttributePlansById = {};

  encodedPlans.split(";").forEach((encodedPlan) => {
    if (!encodedPlan) return;

    const [rawId, rawStars = "0", rawMinTarget = "", rawMaxTarget = ""] =
      encodedPlan.split("~");

    const id = Number(rawId);

    if (!Number.isInteger(id) || id <= 0 || !KNOWN_ATTRIBUTE_IDS.has(id)) {
      return;
    }

    const plan: AttributePlanState = {
      stars: clampStars(Number(rawStars)),
      minTarget: decodePlanValue(rawMinTarget),
      maxTarget: decodePlanValue(rawMaxTarget),
    };

    if (!hasPlanValue(plan)) {
      return;
    }

    decodedPlans[id] = plan;
  });

  return decodedPlans;
};

export const getOrderedGroupKeys = (): AttributeGroupKey[] => {
  return ["basic", "offense", "defense", "secondary"];
};
