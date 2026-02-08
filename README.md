# The Last Spell Planner

A build planner for **The Last Spell**, inspired by [BBPlanner](https://www.bbplanner.xyz/) for Battle Brothers.

The core goal of this project is to let players plan builds and share them through URL state, similar to how BBPlanner links represent a full build.

## Current status

This repository is an early but usable prototype.

- Perk planning is implemented and synchronized to the URL query string.
- Attribute planning UI exists, but attribute URL sync is not wired yet.
- The app still needs cleanup, polish, and testing.

## What works today

### Perk planner

- 8 perk columns with 5 tiers each.
- Default column setup: `melee`, `magic`, `ranged`, `choice`, `choice`, `misc`, `misc`, `misc`.
- Choice-style columns can switch between `choice`, `poison`, `debuff`, `defense`, and `assassin`.
- Perk picker and tooltip UI for each slot.
- Reset button to clear selected perks.

### URL sharing (implemented for perks)

- Perk selections and non-default column types are written to query params.
- On page load, perk state is reconstructed from query params.
- Current encoding pattern:
  - `c{index}t=<type>` for column type (only when different from default).
  - `c{index}p=<perkId>-<tier>` for selected perks (repeatable key).

### Attribute planner

- Primary and secondary attribute sections.
- Selection caps (max 5 primary and 5 secondary).
- Duplicate prevention and remove actions.
- Tooltip details for each selected attribute.

## Not done yet (important)

- Attribute selections are not currently included in URL state.
  - Helper utilities exist in `src/services/attributesService.ts`, but are not integrated into the UI flow.
- URL sharing works, but is not compact/shortened like BBPlanner-style encodings.
- No automated tests are currently present.

See `TODO.md` for a checklist of completed and remaining work.

## Tech stack

- Vue 3 + TypeScript + Vite
- Pinia (state management)
- Tailwind CSS
- VueUse

## Project structure

- `src/App.vue` - top-level layout and sections
- `src/components/PerkTree.vue` - perk tree state, URL sync, and reset logic
- `src/components/PerkColumn.vue` - single column rendering and column type selection
- `src/components/PerkSlot.vue` - tier slot behavior and picker trigger
- `src/components/PerkPicker.vue` - perk choices popup
- `src/components/attributes/AttributesSelector.vue` - attribute selection UI
- `src/stores/attributeStore.ts` - selected attribute state
- `src/services/perkService.ts` - perk lookup helpers
- `src/services/attributesService.ts` - attribute helpers and URL encode/decode helpers
- `src/perks.json` - perk dataset
- `src/attributes.json` - attribute dataset

## Getting started

### Prerequisites

- Node.js 18+ (recommended: latest LTS)
- npm

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Notes

- `index.html` still has default Vite metadata (`Vite + Vue + TS`) and can be updated.
- If your primary objective is BBPlanner-like shareability, the next milestone is compact bidirectional URL encoding for both perks and attributes.

## Inspiration

- BBPlanner: https://www.bbplanner.xyz/
- Game: The Last Spell (Ishtar Games)
