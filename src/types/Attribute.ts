export interface Attribute {
  id: number;
  name: string;
  icon: string;
  min: string;
  max: string;
  description: string;
}

export type AttributeGroupKey = "basic" | "offense" | "defense" | "secondary";

export interface AttributeGroup {
  key: AttributeGroupKey;
  label: string;
  attributes: Attribute[];
}

export interface AttributePlanState {
  stars: number;
}

export type AttributePlansById = Record<number, AttributePlanState>;

export type HideZeroStarByGroup = Record<AttributeGroupKey, boolean>;

export interface AttributesData {
  primaryAttributes: Attribute[];
  offenseAttributes: Attribute[];
  defenseAttributes: Attribute[];
  secondaryAttributes: Attribute[];
}
