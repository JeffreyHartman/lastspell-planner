import attributesData from "../attributes.json";
import { Attribute, AttributesData } from "../types/Attribute";

export const getAllAttributes = (): Attribute[] => {
  const data = attributesData as AttributesData;
  return [
    ...data.primaryAttributes,
    ...data.offenseAttributes,
    ...data.defenseAttributes,
    ...data.secondaryAttributes,
  ];
};
