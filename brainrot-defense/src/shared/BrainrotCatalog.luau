-- The Italian Brainrots. Stats are pre-wave-scaling baselines.
-- bounty scales with wave (see Config.BountyWaveScale, capped at Config.BountyCap).
local Palette = require(script.Parent.Palette)

local list = {
	{
		id = "TralaleroTralala",
		name = "Tralalero Tralala",
		role = "Runner",
		hp = 18,
		speed = 14,
		bounty = 3,
		leak = 4,
		wallDamage = 8,
		size = 2.4,
		shape = "Ball",
		color = Color3.fromRGB(80, 140, 255),
	},
	{
		id = "BombardiroCrocodilo",
		name = "Bombardiro Crocodilo",
		role = "Bomber",
		hp = 45,
		speed = 8,
		bounty = 6,
		leak = 6,
		wallDamage = 12,
		size = 3.2,
		shape = "Ball",
		color = Color3.fromRGB(90, 200, 90),
		explodeRadius = 14,
		explodeDamage = 150, -- damages nearby walls on death
	},
	{
		id = "TungTungSahur",
		name = "Tung Tung Tung Sahur",
		role = "Tank",
		hp = 160,
		speed = 5,
		bounty = 12,
		leak = 10,
		wallDamage = 20,
		size = 4.2,
		shape = "Cylinder",
		color = Color3.fromRGB(150, 105, 60),
		speedAuraRadius = 16,
		speedAuraMult = 1.3, -- drum buff for nearby friends
	},
	{
		id = "LiriliLarila",
		name = "Lirilì Larilà",
		role = "Support",
		hp = 60,
		speed = 7,
		bounty = 8,
		leak = 6,
		wallDamage = 10,
		size = 3.0,
		shape = "Ball",
		color = Color3.fromRGB(255, 130, 200),
		turretSlowRadius = 20,
		turretSlowMult = 1.6, -- turrets near it fire 60% slower
	},
	{
		id = "BombombiniGusini",
		name = "Bombombini Gusini",
		role = "Flyer",
		hp = 40,
		speed = 11,
		bounty = 8,
		leak = 6,
		wallDamage = 0,
		size = 2.8,
		shape = "Ball",
		color = Color3.fromRGB(235, 235, 245),
		flying = true, -- ignores walls + ground zones; only anti-air hits it
	},
	{
		id = "TrippiTroppi",
		name = "Trippi Troppi",
		role = "BOSS",
		hp = 1200,
		speed = 4,
		bounty = 150,
		leak = 40,
		wallDamage = 60,
		size = 7.0,
		shape = "Ball",
		color = Color3.fromRGB(170, 90, 255),
		boss = true,
	},
}

-- wave at which each type may start appearing
local unlockWave = {
	TralaleroTralala = 1,
	BombardiroCrocodilo = 3,
	TungTungSahur = 5,
	LiriliLarila = 7,
	BombombiniGusini = 9,
	TrippiTroppi = 10, -- boss waves only
}

-- budget cost per unit when composing a wave
local budgetCost = {
	TralaleroTralala = 4,
	BombardiroCrocodilo = 9,
	TungTungSahur = 20,
	LiriliLarila = 12,
	BombombiniGusini = 10,
}

local byId = {}
for _, def in list do
	byId[def.id] = def
end

return {
	list = list,
	byId = byId,
	unlockWave = unlockWave,
	budgetCost = budgetCost,
	_palette = Palette, -- keep the require live for future skin tinting
}
