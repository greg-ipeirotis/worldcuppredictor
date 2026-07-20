-- The ~10 defenses, 4 families (BTD6-flavored balance).
-- Families: Shooter (turrets), Wall (temporary, on path wall-spots),
-- Zone (permanent AoE), Emitter (automatic timed).
local Palette = require(script.Parent.Palette)

local list = {
	-- === Shooters ===
	{
		id = "DartTurret",
		name = "Dart Turret",
		family = "Shooter",
		cost = 75,
		damage = 6,
		range = 22,
		fireInterval = 0.8,
		hitsAir = false,
		color = Palette.Shooter,
		desc = "Cheap and cheerful. Plinks the nearest brainrot to the tower.",
	},
	{
		id = "CannonTurret",
		name = "Cannon Turret",
		family = "Shooter",
		cost = 300,
		damage = 18,
		range = 24,
		fireInterval = 2.2,
		hitsAir = false,
		splashRadius = 8,
		color = Palette.Shooter,
		desc = "Slow boom, big splash. Melts clumps.",
	},
	{
		id = "SniperTurret",
		name = "Sniper Turret",
		family = "Shooter",
		cost = 500,
		damage = 55,
		range = 60,
		fireInterval = 3.5,
		hitsAir = true,
		color = Palette.Shooter,
		desc = "Huge single hits from across the slice. Hits flyers.",
	},
	{
		id = "LaserTurret",
		name = "Laser Turret",
		family = "Shooter",
		cost = 650,
		damage = 5,
		range = 26,
		fireInterval = 0.15,
		hitsAir = true,
		color = Palette.Shooter,
		desc = "A firehose of zaps. Hits flyers.",
	},

	-- === Temporary Walls (require a path wall-spot) ===
	{
		id = "HayWall",
		name = "Hay Wall",
		family = "Wall",
		cost = 50,
		wallHp = 250,
		lifetime = 30,
		color = Palette.Wall,
		desc = "Blocks the path for 30s or until munched. Flyers fly over.",
	},
	{
		id = "StoneWall",
		name = "Stone Wall",
		family = "Wall",
		cost = 150,
		wallHp = 700,
		lifetime = 45,
		color = Color3.fromRGB(170, 170, 180),
		desc = "Chunky blocker. 45s of pure stubbornness.",
	},

	-- === Permanent AoE Zones ===
	{
		id = "StickyZone",
		name = "Sticky Zone",
		family = "Zone",
		cost = 200,
		radius = 12,
		slowMult = 0.65,
		color = Palette.Sticky,
		desc = "Goo that slows ground brainrots by 35%. Forever.",
	},
	{
		id = "PoisonCloud",
		name = "Poison Cloud",
		family = "Zone",
		cost = 350,
		radius = 12,
		dps = 4,
		color = Palette.Poison,
		desc = "A permanent stinky cloud. Ground brainrots take damage inside.",
	},

	-- === Automatic Emitters ===
	{
		id = "TackSprayer",
		name = "Tack Sprayer",
		family = "Emitter",
		cost = 400,
		interval = 2.5,
		radius = 14,
		damage = 8,
		kind = "tack",
		color = Palette.Emitter,
		desc = "Sprays tacks in every direction on a timer. Ground only.",
	},
	{
		id = "AcidSpitter",
		name = "Acid Spitter",
		family = "Emitter",
		cost = 450,
		interval = 4.0,
		damage = 6,
		puddleRadius = 8,
		puddleLife = 3,
		kind = "acid",
		color = Palette.Acid,
		desc = "Spits an acid puddle onto the path every 4s. Ground only.",
	},
}

local byId = {}
for _, def in list do
	byId[def.id] = def
end

return { list = list, byId = byId }
