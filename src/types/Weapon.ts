export type WeaponCategory = "melee" | "ranged" | "magic";
export type WeaponHandedness = "1h" | "2h" | "oh";
export type WeaponDlc = "dwarf" | "elf" | null;

export interface Weapon {
  id: string;
  numId: number;
  name: string;
  icon: string;
  category: WeaponCategory;
  handedness: WeaponHandedness;
  dlc: WeaponDlc;
}

export interface RankedWeapon {
  weaponId: string;
  stars: number; // 0-3
}

export interface WeaponRankingsState {
  weapons: RankedWeapon[];
}
