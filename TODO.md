# TODO

## Done

- [x] Bootstrap the project with Vue 3 + TypeScript + Vite.
- [x] Add a perk tree UI with 8 columns and 5 tiers per column.
- [x] Implement perk selection via picker popups and perk tooltips.
- [x] Support changing choice-style perk columns (`choice` / `poison` / `debuff` / `defense` / `assassin`).
- [x] Persist perk state in URL query params and restore on page load.
- [x] Add a reset action for clearing perk selections.
- [x] Add static perk data and icon mappings.
- [x] Build an attribute selector UI with primary and secondary sections.
- [x] Add Pinia attribute store rules (max count and duplicate prevention).
- [x] Add attribute data, icons, and tooltip details.

## Left to do

- [ ] Wire selected attributes into URL serialization/deserialization.
- [ ] Define a more compact, BBPlanner-style share URL encoding.
- [ ] Add explicit share UX (for example: copy link button and import feedback).
- [ ] Restrict/filter attribute dropdown options by context (`primary` vs `secondary` intent).
- [ ] Remove debug `console.log` statements in UI components.
- [ ] Update `index.html` metadata (title/favicon) from Vite defaults.
- [ ] Install dependencies in a clean environment and verify `npm run build` + `npm run lint` pass.
- [ ] Add automated tests for URL encode/decode and state restoration.
- [ ] Improve mobile responsiveness and keyboard/accessibility behavior.
- [ ] Remove unused dependencies or implement their intended usage (`@headlessui/vue`, `vuedraggable`).
- [ ] Add deployment notes and optional CI checks.
- [ ] Add license and contribution guidelines.
