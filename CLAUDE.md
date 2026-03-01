# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Last Spell Planner is a build planner for the game "The Last Spell." Players plan perk builds, weapon rankings, and attribute targets, then share them via URL query strings. Inspired by [BBPlanner](https://www.bbplanner.xyz/) for Battle Brothers.

## Commands

```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Type-check (vue-tsc) then build for production
npm run lint         # ESLint with --fix across all source files
npm run preview      # Preview production build locally
```

No test framework is installed yet.

## Tech Stack

- Vue 3 (Composition API with `<script setup>`) + TypeScript (strict mode)
- Pinia for state management
- Tailwind CSS 3 with custom warm "forge" color palette (slate overridden with earthy tones, plus `ember` and `gold`)
- Vite 5 with `@` alias pointing to `/src`
- Fonts: Cinzel (display/headings), Barlow (body text)

## Architecture

### State Management — Three Separate Patterns

**Perks** use local component state in `PerkTree.vue` (no Pinia store). Perk columns and selections are managed with Vue `ref`/`watch`. PerkTree exposes its state via `defineExpose` and accepts an `initialState` prop.

**Weapons** use `stores/weaponStore.ts` (Pinia). The `WeaponSelector` component reads/writes through the store.

**Attributes** use `stores/attributeStore.ts` (Pinia). The `AttributesSelector` component reads/writes through the store.

### URL State Synchronization

All planner state is encoded in URL query parameters so builds can be shared as links. **App.vue is the centralized URL owner** — child components emit `state-changed` events and do not read/write the URL directly.

**Current format** (compact base64):
```
?name=My+Build&b=<url-safe-base64>
```
- `name` — plain text build name (human-readable in URL bar)
- `b` — URL-safe base64 blob encoding all perk/weapon/attribute state

The base64 blob decodes to a pipe-separated string: `PERKS|WEAPONS|ATTRIBUTES`
- **Perks:** `;`-separated column entries → `colIdx.typeIdx.perkId.tier.priority,...`
- **Weapons:** `;`-separated `numId.stars` entries (uses stable numeric weapon IDs from `weapons.json`)
- **Attributes:** `;`-separated `attrId.stars` entries

**Legacy format** (auto-detected and migrated):
- `c{index}t=<type>`, `c{index}p=<perkId>-<tier>[-b]`, `wpns=...`, `attrs=...`

Codec logic lives in `services/urlCodecService.ts`. Legacy URLs are detected by `isLegacyUrlFormat()` and decoded via existing service functions, then re-encoded to the new format.

Sync flow: on mount, App.vue decodes URL → populates stores + passes `initialState` prop to PerkTree. On change, App.vue reads all state and writes the URL via `window.history.replaceState()`. An `isHydrating` flag prevents redundant writes during initial load.

### Saved Builds

`services/buildStorageService.ts` persists builds to localStorage (key: `tls-planner.saved-builds.v1`). Each saved build stores `{ id, name, query, createdAt, updatedAt }`. `App.vue` manages the save/load/rename lifecycle and a sidebar lists all builds.

### Services Layer

- `services/perkService.ts` — perk lookup by ID, filtering by type/tier
- `services/attributesService.ts` — attribute lookup, encode/decode helpers
- `services/weaponService.ts` — weapon lookup by ID/numId, encode/decode helpers
- `services/urlCodecService.ts` — centralized URL encode/decode (base64 compact format + legacy support)
- `services/buildStorageService.ts` — localStorage CRUD for saved builds (save, delete, list)

### Data Files

Static JSON datasets live in `src/`: `perks.json` (~200 perks), `weapons.json` (~36 weapons, each with a stable `numId`), `attributes.json` (~20 attributes). These are imported directly by services.

### Component Hierarchy

```
App.vue (layout, saved builds sidebar)
├── PerkTree → PerkColumn[] → PerkSlot[] (with PerkPicker, PerkTooltip)
├── WeaponSelector → WeaponRankItem[] + WeaponDropdown
└── AttributesSelector → AttributeItem[] (grouped: basic/offense/defense/secondary)
```

### Styling Conventions

- Custom component classes defined in `src/style.css` using Tailwind's `@layer components` (`.glass-panel`, `.btn`, `.btn--primary`, `.btn--danger`, `.perk-slot-circle`)
- Glow effects via custom box shadows: `shadow-glow-amber` (essential perk), `shadow-glow-emerald` (bonus perk), `shadow-glow-ember`, `shadow-glow-blue`
- Right-click on a perk slot toggles priority between "essential" (amber) and "bonus" (green)

## Key Interaction Patterns

- Perk priority is toggled by right-click (essential ↔ bonus)
- Race selection (Human/Dwarf/Elf) in PerkTree affects column 5 with racial perks
- `App.vue` uses a `plannerStateKey` to force re-render child components when loading a saved build
- Choice-style perk columns can switch between: choice, poison, debuff, defense, assassin
