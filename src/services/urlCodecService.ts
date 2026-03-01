import type { PerkColumnType } from "../types/PerkColumn";
import type { WeaponRankingsState } from "../types/Weapon";
import type { AttributePlansById } from "../types/Attribute";
import { getPerkById } from "./perkService";
import {
  getWeaponById,
  getWeaponByNumId,
  decodeWeaponsFromUrl,
} from "./weaponService";
import {
  decodeAttributePlansFromUrl,
  getAllAttributes,
} from "./attributesService";
import type { SelectedPerk } from "../types/SelectedPerk";

export interface PlannerState {
  name: string;
  perkColumns: PerkColumnType[];
  weapons: WeaponRankingsState;
  attributePlans: AttributePlansById;
}

// Column type index map — stable ordering for compact encoding
const COLUMN_TYPE_TO_INDEX: Record<string, number> = {
  melee: 0,
  magic: 1,
  ranged: 2,
  choice: 3,
  dwarf: 4,
  elf: 5,
  misc: 6,
  poison: 7,
  debuff: 8,
  defense: 9,
  assassin: 10,
};

const INDEX_TO_COLUMN_TYPE: Record<number, string> = Object.fromEntries(
  Object.entries(COLUMN_TYPE_TO_INDEX).map(([k, v]) => [v, k]),
);

const VALID_COLUMN_TYPES = new Set(Object.keys(COLUMN_TYPE_TO_INDEX));
const KNOWN_ATTR_IDS = new Set(getAllAttributes().map((a) => a.id));

const DEFAULT_COLUMN_TYPES = [
  "melee",
  "magic",
  "ranged",
  "choice",
  "choice",
  "misc",
  "misc",
  "misc",
];

// --- Base64 helpers (URL-safe) ---

const toBase64Url = (str: string): string => {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const fromBase64Url = (b64: string): string => {
  let padded = b64.replace(/-/g, "+").replace(/_/g, "/");
  while (padded.length % 4 !== 0) padded += "=";
  return atob(padded);
};

// --- Compact string encode/decode ---

/**
 * Encode perks section.
 * Format per column: colIdx.typeIdx.perkId.tier.priority,perkId.tier.priority,...
 * - typeIdx is omitted (empty field) when it matches the default for that column
 * - priority 1 = bonus, omitted when essential (default)
 * - Columns with no type change and no perks are omitted entirely
 */
const encodePerks = (columns: PerkColumnType[]): string => {
  const parts: string[] = [];

  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    const isDefaultType = col.type === DEFAULT_COLUMN_TYPES[i];
    const hasPerks = col.perks.length > 0;

    if (isDefaultType && !hasPerks) continue;

    const typeField = isDefaultType
      ? ""
      : String(COLUMN_TYPE_TO_INDEX[col.type] ?? col.type);

    const perkEntries = col.perks.map((sp) => {
      const priorityField = sp.priority === "bonus" ? ".1" : "";
      return `${sp.perk.id}.${sp.perk.tier}${priorityField}`;
    });

    const entry =
      perkEntries.length > 0
        ? `${i}.${typeField}.${perkEntries.join(",")}`
        : `${i}.${typeField}`;

    parts.push(entry);
  }

  return parts.join(";");
};

const decodePerks = (encoded: string): PerkColumnType[] => {
  const columns: PerkColumnType[] = DEFAULT_COLUMN_TYPES.map((type, i) => ({
    id: i,
    type,
    perks: [],
  }));

  if (!encoded) return columns;

  for (const part of encoded.split(";")) {
    if (!part) continue;

    // Split into fields: colIdx, typeIdx, then perk entries (comma-separated in remaining)
    const dotParts = part.split(".");
    const colIdx = parseInt(dotParts[0], 10);
    if (isNaN(colIdx) || colIdx < 0 || colIdx >= columns.length) continue;

    const typeField = dotParts[1];
    if (typeField !== undefined && typeField !== "") {
      const typeIdx = parseInt(typeField, 10);
      if (!isNaN(typeIdx) && INDEX_TO_COLUMN_TYPE[typeIdx]) {
        columns[colIdx].type = INDEX_TO_COLUMN_TYPE[typeIdx];
      }
    }

    // Remaining dotParts from index 2 onward form perk data
    // Rejoin them and split by comma to get individual perk entries
    if (dotParts.length > 2) {
      const perkData = dotParts.slice(2).join(".");
      const perkEntries = perkData.split(",");

      for (const entry of perkEntries) {
        if (!entry) continue;
        const fields = entry.split(".");
        const perkId = parseInt(fields[0], 10);
        const tier = parseInt(fields[1], 10);
        const priority = fields[2] === "1" ? "bonus" : "essential";

        if (isNaN(perkId) || isNaN(tier)) continue;

        const perk = getPerkById(perkId);
        if (perk && perk.tier === tier) {
          columns[colIdx].perks.push({
            perk,
            priority,
          } as SelectedPerk);
        }
      }
    }
  }

  return columns;
};

/**
 * Encode weapons section.
 * Format: numId.stars;numId.stars;...
 */
const encodeWeapons = (state: WeaponRankingsState): string => {
  if (state.weapons.length === 0) return "";

  return state.weapons
    .map((w) => {
      const weapon = getWeaponById(w.weaponId);
      if (!weapon) return null;
      return `${weapon.numId}.${w.stars}`;
    })
    .filter(Boolean)
    .join(";");
};

const decodeWeapons = (encoded: string): WeaponRankingsState => {
  if (!encoded) return { weapons: [] };

  const weapons: WeaponRankingsState["weapons"] = [];
  const seen = new Set<string>();

  for (const part of encoded.split(";")) {
    if (!part) continue;
    const [numIdStr, starsStr] = part.split(".");
    const numId = parseInt(numIdStr, 10);
    const stars = Math.max(0, Math.min(3, parseInt(starsStr, 10) || 0));

    const weapon = getWeaponByNumId(numId);
    if (weapon && !seen.has(weapon.id)) {
      seen.add(weapon.id);
      weapons.push({ weaponId: weapon.id, stars });
    }
  }

  return { weapons };
};

/**
 * Encode attributes section.
 * Format: attrId.stars;attrId.stars;...
 * Only starred attributes are included.
 */
const encodeAttributes = (plans: AttributePlansById): string => {
  return Object.entries(plans)
    .filter(([, plan]) => plan.stars > 0)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([id, plan]) => `${id}.${plan.stars}`)
    .join(";");
};

const decodeAttributes = (encoded: string): AttributePlansById => {
  if (!encoded) return {};

  const plans: AttributePlansById = {};

  for (const part of encoded.split(";")) {
    if (!part) continue;
    const [idStr, starsStr] = part.split(".");
    const id = parseInt(idStr, 10);
    const stars = Math.max(0, Math.min(3, parseInt(starsStr, 10) || 0));

    if (!isNaN(id) && id > 0 && stars > 0 && KNOWN_ATTR_IDS.has(id)) {
      plans[id] = { stars };
    }
  }

  return plans;
};

// --- Public API ---

/**
 * Encode full planner state to a URL query string.
 * Format: ?name=Build+Name&b=<base64 blob>
 */
export const encodePlannerStateToQuery = (state: PlannerState): string => {
  const perksStr = encodePerks(state.perkColumns);
  const weaponsStr = encodeWeapons(state.weapons);
  const attrsStr = encodeAttributes(state.attributePlans);

  const compact = `${perksStr}|${weaponsStr}|${attrsStr}`;
  const b64 = toBase64Url(compact);

  const params = new URLSearchParams();
  if (state.name) {
    params.set("name", state.name);
  }
  params.set("b", b64);

  return params.toString();
};

/**
 * Detect whether the URL uses the old (legacy) format.
 */
export const isLegacyUrlFormat = (search: string): boolean => {
  const params = new URLSearchParams(search);
  // Legacy if it has any of the old-style params and no 'b' param
  if (params.has("b")) return false;

  for (const key of params.keys()) {
    if (
      key === "wpns" ||
      key === "attrs" ||
      /^c\d+(t|p)$/.test(key)
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Decode legacy URL format into PlannerState.
 */
const decodeLegacyUrl = (search: string): PlannerState => {
  const params = new URLSearchParams(search);

  // Decode weapons
  const wpnsEncoded = params.get("wpns") ?? "";
  const weapons = decodeWeaponsFromUrl(wpnsEncoded);

  // Decode attributes
  const attrsEncoded = params.get("attrs") ?? "";
  const attributePlans = decodeAttributePlansFromUrl(attrsEncoded);

  // Decode perks (replicate PerkTree.vue's onMounted logic)
  const perkColumns: PerkColumnType[] = DEFAULT_COLUMN_TYPES.map(
    (type, i) => ({
      id: i,
      type,
      perks: [],
    }),
  );

  // Handle legacy racial column migration
  const legacyRaceType = params.get("c0t");
  const RACIAL_COLUMN_INDEX = 5;
  const hasRacialTypeInLegacyColumn =
    legacyRaceType === "dwarf" || legacyRaceType === "elf";
  const hasRacialTypeInCorrectColumn = ["dwarf", "elf"].includes(
    params.get(`c${RACIAL_COLUMN_INDEX}t`) ?? "",
  );

  if (hasRacialTypeInLegacyColumn && !hasRacialTypeInCorrectColumn) {
    params.set(`c${RACIAL_COLUMN_INDEX}t`, legacyRaceType);
    params.delete("c0t");
  }

  for (let i = 0; i < perkColumns.length; i++) {
    const columnType = params.get(`c${i}t`);
    if (columnType && VALID_COLUMN_TYPES.has(columnType)) {
      perkColumns[i].type = columnType;
    }

    const columnPerks = params.getAll(`c${i}p`);
    for (const perkParam of columnPerks) {
      const segments = perkParam.split("-");
      const perkId = Number(segments[0]);
      const tier = Number(segments[1]);
      const priority = segments[2] === "b" ? "bonus" : "essential";
      const perk = getPerkById(perkId);

      if (perk && perk.tier === tier) {
        perkColumns[i].perks.push({ perk, priority });
      }
    }
  }

  return {
    name: "",
    perkColumns,
    weapons,
    attributePlans,
  };
};

/**
 * Decode planner state from URL query string.
 * Supports both new base64 format and legacy format.
 */
export const decodePlannerStateFromQuery = (search: string): PlannerState => {
  if (!search || search === "?") {
    return {
      name: "",
      perkColumns: DEFAULT_COLUMN_TYPES.map((type, i) => ({
        id: i,
        type,
        perks: [],
      })),
      weapons: { weapons: [] },
      attributePlans: {},
    };
  }

  if (isLegacyUrlFormat(search)) {
    return decodeLegacyUrl(search);
  }

  const params = new URLSearchParams(search);
  const name = params.get("name") ?? "";
  const b64 = params.get("b");

  if (!b64) {
    return {
      name,
      perkColumns: DEFAULT_COLUMN_TYPES.map((type, i) => ({
        id: i,
        type,
        perks: [],
      })),
      weapons: { weapons: [] },
      attributePlans: {},
    };
  }

  try {
    const compact = fromBase64Url(b64);
    const [perksStr = "", weaponsStr = "", attrsStr = ""] = compact.split("|");

    return {
      name,
      perkColumns: decodePerks(perksStr),
      weapons: decodeWeapons(weaponsStr),
      attributePlans: decodeAttributes(attrsStr),
    };
  } catch {
    return {
      name,
      perkColumns: DEFAULT_COLUMN_TYPES.map((type, i) => ({
        id: i,
        type,
        perks: [],
      })),
      weapons: { weapons: [] },
      attributePlans: {},
    };
  }
};
