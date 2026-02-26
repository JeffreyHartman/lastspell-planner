export type WeaponCategory = "melee" | "ranged" | "magic";
export type WeaponHandedness = "1h" | "2h" | "oh";
export type WeaponDlc = "dwarf" | "elf" | null;

export interface Weapon {
  id: string;
  name: string;
  icon: string;
  category: WeaponCategory;
  handedness: WeaponHandedness;
  dlc: WeaponDlc;
}

export interface WeaponSetState {
  primaryId: string | null;
  offhandId: string | null;
}

export interface WeaponSetsState {
  sets: [WeaponSetState, WeaponSetState];
}
