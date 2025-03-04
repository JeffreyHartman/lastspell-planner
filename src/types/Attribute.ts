export interface Attribute {
  id: number;
  name: string;
  icon: string;
  min: string;
  max: string;
  description: string;
}

export interface AttributesData {
  primaryAttributes: Attribute[];
  offenseAttributes: Attribute[];
  defenseAttributes: Attribute[];
  secondaryAttributes: Attribute[];
}
