# 🏰 Brainrot Defense

Endless tower defense vs. Italian Brainrots — Roblox, candy-bright, kid-friendly.
See [DESIGN.md](./DESIGN.md) for the full game bible.

**This is Phase 1: the single-slice vertical slice.** Every player who joins gets their own
slice: PvZ checkerboard grid, red Bloons S-path, escalating brainrot waves, an upgradeable
Tower, 10 placeable defenses, coins + shop, pause, and a Best Wave leaderboard (leaderstats).
All visuals are bright primitive placeholders.

## Project layout (Rojo)

```
default.project.json      Rojo tree
src/shared/               Config, catalogs, palette, path math, remotes
src/server/               Map builder + game services (waves, enemies, tower, defenses, economy)
src/client/               HUD + placement controller
```

## Getting it into Studio

1. Install [Rojo](https://rojo.space) (CLI via `aftman install`, plus the Rojo Studio plugin).
2. From this folder: `rojo serve default.project.json`
3. Open a baseplate in Roblox Studio → Rojo plugin → Connect.
4. Press **Play**. You'll spawn on the platform behind your Tower.

Or build a place file: `rojo build default.project.json -o BrainrotDefense.rbxlx` and open it.

## How to play (Phase 1)

- Coins tick in passively; kills and wave clears pay bounties.
- Click a defense in the bottom shop bar, then click a **grass tile** (gold = premium spot).
  Walls go on the **white dashed spots on the path**.
- Buy Tower upgrades (right panel): Damage / Fire Rate / Range.
- **Pause** button freezes your waves (pit integration comes in Phase 3).
- Tower dies → board wipes, you get a stipend, **upgrades persist**, wave resets. Beat your Best Wave.

## Tuning

Every number lives in `src/shared/Config.luau`, `DefenseCatalog.luau`, and `BrainrotCatalog.luau`.
