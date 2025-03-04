import attributesData from "../attributes.json";
import { Attribute, AttributesData } from "../types/Attribute";

// Get all attributes as a flat array
export const getAllAttributes = (): Attribute[] => {
  const data = attributesData as AttributesData;
  return [
    ...data.primaryAttributes,
    ...data.offenseAttributes,
    ...data.defenseAttributes,
    ...data.secondaryAttributes,
  ];
};

// Get attributes by category
export const getAttributesByCategory = (category: string): Attribute[] => {
  const data = attributesData as AttributesData;
  
  switch (category) {
    case 'primary':
      return [...data.primaryAttributes];
    case 'offense':
      return [...data.offenseAttributes];
    case 'defense':
      return [...data.defenseAttributes];
    case 'secondary':
      return [...data.secondaryAttributes];
    default:
      return getAllAttributes();
  }
};

// Get an attribute by ID
export const getAttributeById = (id: number): Attribute | undefined => {
  return getAllAttributes().find(attr => attr.id === id);
};

// Encode selected attributes for URL
export const encodeAttributesForUrl = (attributes: { attributeId: number, rank: number }[]): string => {
  // Sort by rank
  const sorted = [...attributes].sort((a, b) => a.rank - b.rank);
  
  // Convert to format: attr1,attr2,attr3
  return sorted.map(attr => attr.attributeId).join(',');
};

// Decode attributes from URL
export const decodeAttributesFromUrl = (attributesString: string): { attributeId: number, rank: number }[] => {
  if (!attributesString) return [];
  
  const ids = attributesString.split(',').map(Number);
  
  // Convert to array with ranks
  return ids
    .filter(id => !isNaN(id) && id > 0)
    .map((id, index) => ({
      attributeId: id,
      rank: index + 1
    }));
};