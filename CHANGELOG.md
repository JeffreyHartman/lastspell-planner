# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-03-06

### Changed
- Set initial semantic version at 1.0.0
- Updated 21 perk descriptions to match current in-game values (wiki sync):
  - **Fatality**: Execute threshold changed from 10 to 15 Health; scaling now based on Physical damage % instead of hero level
  - **Perseverance**: Now once per turn, restores 2 AP (was 1), +10% Accuracy (was +5%)
  - **Shorter Weapons**: Reworked to -2 Skill Range + Undodgeable at 2-6 tiles (was -1 Range, +15% Accuracy, +20% Reliability)
  - **Longer Weapons**: Reworked to +2 Skill Range + Inaccurate x1.5 at 5 tiles or less (was -25% Reliability, +2 Range)
  - **Field Study**: Added "Increase maximum Skill Range to 16"
  - **Surgical Strike**: Completely reworked - now converts next skill cost to Move Points after killing a full-HP enemy at range 5+
  - **Toxic Leech**: Range 5 to 6, Health restored 2 to 3
  - **Epidemic**: Reworked - now triggers every 3 enemies Poisoned, applies 30 Poison + Contagion to nearest enemy in range 10
  - **Bully**: Critical Power penalty reduced from -15% to -10%
  - **Resupply** renamed to **Manual Control**: Completely reworked defense tier 3 perk
  - **Cherry Picking**: Reliability bonus increased from +40% to +75%
  - **One By One**: Damage values increased (+7%/+10%, cap 80%), penalty reduced to -4%
  - **Cheer**: Now auto-casts at start of turn, range increased to 1-15, buff duration 2 turns
  - **Crippling Punch**: Added scaling damage mechanic per kill
  - **Initiator**: Removed -10% Damage penalty
  - **Quantity Vs Quality** renamed to **Quality over Quantity**: Reworked to convert Propagation Bounces into Propagation Damage (800% rate)
  - **Mana Shield**: Moved from tier 4 to tier 3
  - **Runic Gift**: Moved from tier 3 to tier 4
  - **Specialist**: Damage reduced to +40% (was +50%), now grants +1 AP and +2 uses/turn (was +1), limited to Main hand slot
  - **Don't panic**: Added Vision and cannot damage friendly buildings
  - **Blood Magic**: Added explicit 100% conversion rate for Daily Mana Regen to Daily Health Regen
