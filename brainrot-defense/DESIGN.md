# 🏰 BRAINROT DEFENSE — Game Design Bible

**Platform:** Roblox (Luau, Rojo project) · **Players:** 10 per island server · **Session:** endless
**Style:** bright, colorful, cartoony, kid-friendly — Adopt Me / Grow a Garden / Steal a Brainrot energy.
Chunky rounded shapes, candy palette, bouncy juicy feedback, goofy faces, zero gore.

**Core tension:** ONE coin wallet, THREE pulls — harden your tower, arm up for the pit, or spin the wheel.

---

## 1. The Island

- A big **circle sliced like a pizza into 10 wedges** — one per player.
- Each player's **Tower sits at the outer rim**; **Italian Brainrots** spawn at the water's edge
  and march inward along a fixed path toward the tower.
- Dead center: a glowing circular **PvP Pit** (the ONLY place players can fight).
- Coins scatter **neutrally around the whole island every 5 minutes** — players race to collect
  but cannot fight outside the pit.

### The 5-Minute Heartbeat
1. Coins scatter → everyone scrambles to collect.
2. Loot dries up → the center pit refreshes → brawl for the capture.
3. Reset. A rhythmic boom-and-bust pulse, synced: coin scatter cooldown == pit cooldown.

## 2. The Slice (Tower Defense area)

- **PvZ-style checkerboard grass.** Every **2×2 grass block = one placement tile** (8×8 studs),
  arranged Clash Royale grid-style into a clean rectangle.
- Brainrots follow a **bright-red Bloons-style S-curve/zig-zag path**.
- **Spot tiers** (BTD5-flavored balance):
  - **2–5 premium spots** (gold tiles) tucked inside path bends — hit long stretches at once.
  - **~20–40 solid spots** lining the path.
  - **Filler tiles** far from the path — placeable but tactically weak; they square off the rectangle.
- **Wall spots**: a few marked anchors ON the path where temporary walls can be built.

## 3. The Tower (Clash Royale-style command post)

- Sits at the rim end of the path. **Deals constant passive AoE damage** to enemies in range (pulse).
- The player watches over the slice from an elevated platform behind it and **places all defenses from there**.
- **Upgrade tracks** (each level purchasable, like CR cards): **Damage · Fire Rate · Range** (5 levels each).
- Tower has HP; leaked brainrots damage it.
- **Persistence:** on tower death, BOTH the Tower upgrade tree AND unit upgrade trees persist —
  first waves back feel easy. Board (placed defenses) is lost.
- **Robux cheat-death** available (keep the whole board).

## 4. Defenses (~10 units, 4 families, BTD6-flavored)

| Family | Units | Notes |
|---|---|---|
| **Shooters/Turrets** | Dart Turret 75c · Cannon 300c (splash) · Sniper 500c (air) · Laser 650c (air, rapid) | direct damage |
| **Temporary Walls** | Hay Wall 50c (250hp/30s) · Stone Wall 150c (700hp/45s) | block the path on wall spots, then expire |
| **Permanent AoE Zones** | Sticky Zone 200c (35% slow) · Poison Cloud 350c (DoT) | placed near path, always on |
| **Auto Emitters** | Tack Sprayer 400c (radial burst every 2.5s) · Acid Spitter 450c (lobs a puddle at a path point every 4s) | fire on a clock |

Flyers ignore walls & ground zones; only Sniper, Laser and the Tower hit air.

## 5. Enemies — Italian Brainrots

| Brainrot | Role | Gimmick | Unlocks |
|---|---|---|---|
| Tralalero Tralala | Runner | fast, low HP, swarms | wave 1 |
| Bombardiro Crocodilo | Bomber | explodes on death, damages nearby walls | wave 3 |
| Tung Tung Tung Sahur | Tank | slow, huge HP, drum aura speed-buffs nearby enemies | wave 5 |
| Lirilì Larilà | Support | aura slows your turrets' fire rate | wave 7 |
| Bombombini Gusini | Flyer | ignores ground defenses, needs anti-air | wave 9 |
| **Trippi Troppi** | **BOSS** | every 10th wave, massive HP, scales per visit | wave 10 |

## 6. Waves

- **Always running, independent** of the 5-minute coin/pit clock (collisions = chaos = fun).
- Player can **pause their tower defense at any time** (e.g. to fight in the pit).
- BTD6-style balanced ramp: HP mult `1 + 0.07(w-1) + 0.004(w-1)²`, budget grows linearly,
  spawn gaps shrink, new types unlock at thresholds, boss every 10th.
- **Public leaderboard = highest wave count.**

## 7. Economy (Coins only)

**Faucets:** passive tower income ~5/s · kill bounties 2–15 (scale with wave) · wave-clear 50–200
· PvP pit kill ~40 · 5-min coin scatter (~150–300 per player share).

**Sinks:** basic turret 75 · mid 150–300 · emitter 400–450 · tower upgrade 250×1.6^lvl
· PvP weapon 200 (+150/level) · **wheel spin 100**.

**Robux → Coins:** R$25→1,000 · R$100→5,000 ⭐ · R$250→14,000 · R$500→32,000 · R$1,000→70,000.
**Fixed Robux products:** cheat death R$49 · keep OP weapon forever R$149 · keep OP turret forever R$349
· cosmetics R$99–499.

**Guardrail:** Robux buys coins, convenience, cosmetics, keep-forever — NEVER a random paid pull,
never power the grind can't reach.

**Death stipend:** small startup cash (not enough to fully rebuild — stay locked in).
**Pit death:** respawn in your slice, lose a measly coin amount (sting → revenge, never loop-breaking).

## 8. Center Pit (PvP) & God Turret

- **Capture-the-flag / king-of-the-hill** in the center circle; Bloons-TD-Battles-style competitive combat.
- Round can **end early on full capture**; hard-capped at **5 minutes** — most capture progress wins. No stalemates.
- **God Turret** (pit prize): kept **exactly 1 week**, un-stealable, then vanishes. Earned ONLY here.
- **PvP weapons:** 5 custom original assets (NOT default Roblox) — sword, baguette bat, etc.
  3 upgrade levels each, deliberately **not OP** — skill wins fights, gear doesn't.

## 9. The Wheel (gambling)

- **Spin with Coins** (coins purchasable with Robux — the pull itself is always coin-priced).
- Pool: tower skins · turrets · PvP weapons. **Rare jackpots:** OP Turret (distinct from God Turret),
  OP player weapon, super-rare skin.
- **OP wins are temporary** — spend Robux to keep forever.
- **HONEST ODDS, locked policy:** evenly divided wheel, **displayed drop rates**, a **pity system**
  (guaranteed good pull every N spins), a **daily free spin**. Near-miss drama lives in the
  **presentation only** (slow ticks, tension, confetti) — the odds are never rigged toward
  engineered near-misses. Kid-safe, Roblox-policy-safe, deliberate choice.

## 10. Build Roadmap

- **Phase 1 (this code): single-slice vertical slice** — per-player slice instance, checkerboard grid,
  red S-path, wave spawner, tower + upgrades, all 10 defenses, coins, shop UI, pause, leaderstats.
  Bright primitive placeholder art (colored Parts, candy palette).
- Phase 2: circular 10-wedge island geometry, neutral 5-min coin scatter.
- Phase 3: center pit, capture logic, 5 PvP weapons, pit economy, God Turret.
- Phase 4: the Wheel (honest odds + pity + presentation), OP items with expiry.
- Phase 5: Robux products (coin packs, cheat death, keep-forever, cosmetics), DataStore persistence,
  global leaderboard, real models/art pass, sounds, mobile input.

## Known TODOs

- DataStore persistence (upgrades/best wave currently session-only).
- Mobile/touch placement input.
- Sounds & real models (all primitives for now).
- Sell/refund for placed defenses.
