-- Every tunable number in the game. Balance lives here.
local Config = {
	-- === Slice geometry (studs) ===
	SliceWidth = 96, -- 12 tiles across
	SliceLength = 128, -- 16 tiles deep
	TileSize = 8, -- one placement tile = 2x2 "grass pixels" of 4 studs
	SliceSpacing = 220, -- distance between player slices (Phase 1 row layout)
	PathHalfWidth = 3,
	-- tile classification thresholds (distance from tile center to path centerline)
	TileBlockedDist = 6.8, -- overlapping the path -> no tile
	TileNormalDist = 12.5, -- close enough to be a solid spot
	PremiumMinSegments = 2, -- near 2+ differently-oriented segments = inside a bend -> premium

	-- === Economy ===
	StartingCoins = 200,
	PassiveIncomePerSec = 5,
	DeathStipend = 150, -- deliberately NOT enough to fully rebuild
	BountyWaveScale = 0.05, -- bounty * (1 + scale*(wave-1))
	BountyCap = 15,
	WaveBonusBase = 40,
	WaveBonusPerWave = 8,
	WaveBonusCap = 200,

	-- === Tower ===
	TowerMaxHp = 100,
	TowerBaseDamage = 8,
	TowerBaseInterval = 1.0, -- seconds per pulse
	TowerBaseRange = 18,
	TowerDamagePerLevel = 0.4, -- damage = base * (1 + 0.4 * level)
	TowerIntervalPerLevel = 0.88, -- interval * 0.88^level
	TowerRangePerLevel = 4,
	TowerUpgradeBaseCost = 250,
	TowerUpgradeCostScale = 1.6,
	TowerUpgradeMaxLevel = 5,

	-- === Waves ===
	FirstWaveDelay = 6,
	IntermissionSecs = 8,
	WaveBudgetBase = 50,
	WaveBudgetPerWave = 18,
	SpawnGapBase = 1.0,
	SpawnGapPerWave = 0.015,
	SpawnGapMin = 0.35,
	BossEvery = 10,
	-- hp mult: 1 + A*(w-1) + B*(w-1)^2  (BTD6-ish gentle-then-steep ramp)
	HpRampLinear = 0.07,
	HpRampQuad = 0.004,
	SpeedRampPerWave = 0.01,
	SpeedRampMax = 1.6,

	-- === Misc ===
	HudPushInterval = 0.5,
	FlyerHoverHeight = 7,
}

return Config
