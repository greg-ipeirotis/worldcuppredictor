-- Builds one player slice: checkerboard tiles, red S-path, wall spots,
-- the Tower, and the elevated command platform behind it.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Palette = require(Shared.Palette)
local PathUtil = require(Shared.PathUtil)

local MapBuilder = {}

-- Waypoints in slice-local coordinates (x across width, z from spawn edge to tower).
-- A zig-zag S with 6 bends, Bloons style.
local LOCAL_WAYPOINTS = {
	Vector2.new(16, -10), -- spawn out on the sand
	Vector2.new(16, 24),
	Vector2.new(80, 24),
	Vector2.new(80, 56),
	Vector2.new(16, 56),
	Vector2.new(16, 88),
	Vector2.new(80, 88),
	Vector2.new(80, 108),
	Vector2.new(48, 108),
	Vector2.new(48, 120), -- tower doorstep
}

local LOCAL_WALL_SPOTS = {
	Vector2.new(48, 24),
	Vector2.new(48, 56),
	Vector2.new(48, 88),
}

local function part(props, parent)
	local p = Instance.new("Part")
	p.Anchored = true
	p.CanCollide = props.CanCollide or false
	p.CanTouch = false
	p.CastShadow = false
	p.Material = props.Material or Enum.Material.SmoothPlastic
	for k, v in props do
		if k ~= "Material" and k ~= "CanCollide" then
			p[k] = v
		end
	end
	p.Parent = parent
	return p
end

function MapBuilder.getSlicesFolder()
	local folder = workspace:FindFirstChild("BrainrotSlices")
	if not folder then
		folder = Instance.new("Folder")
		folder.Name = "BrainrotSlices"
		folder.Parent = workspace
	end
	return folder
end

function MapBuilder.build(player, originX)
	local model = Instance.new("Model")
	model.Name = "Slice_" .. player.UserId

	local origin = Vector3.new(originX, 0, 0)
	local W, L = Config.SliceWidth, Config.SliceLength

	-- base slab + sand spawn strip
	part({
		Name = "Base",
		Size = Vector3.new(W + 8, 2, L + 8),
		Position = origin + Vector3.new(W / 2, -1, L / 2),
		Color = Palette.GrassDark,
		CanCollide = true,
	}, model)
	part({
		Name = "Sand",
		Size = Vector3.new(W + 8, 2, 26),
		Position = origin + Vector3.new(W / 2, -0.95, -13),
		Color = Palette.Sand,
		CanCollide = true,
	}, model)

	-- absolute waypoints
	local waypoints = {}
	for i, wp in LOCAL_WAYPOINTS do
		waypoints[i] = origin + Vector3.new(wp.X, 0.5, wp.Y)
	end
	local cum, totalLength = PathUtil.cumulative(waypoints)

	-- red path segments (slightly raised, rounded corners via overlap)
	local pathFolder = Instance.new("Folder")
	pathFolder.Name = "Path"
	pathFolder.Parent = model
	for i = 2, #waypoints do
		local a = Vector3.new(waypoints[i - 1].X, 0.2, waypoints[i - 1].Z)
		local b = Vector3.new(waypoints[i].X, 0.2, waypoints[i].Z)
		local len = (b - a).Magnitude
		part({
			Name = "PathSeg",
			Size = Vector3.new(Config.PathHalfWidth * 2, 0.3, len + Config.PathHalfWidth * 2),
			CFrame = CFrame.lookAt((a + b) / 2, b),
			Color = Palette.PathRed,
		}, pathFolder)
	end

	-- checkerboard placement tiles
	local tilesFolder = Instance.new("Folder")
	tilesFolder.Name = "Tiles"
	tilesFolder.Parent = model
	local tiles = {}
	local tileByPart = {}
	local ts = Config.TileSize
	local index = 0
	for gz = 0, (L / ts) - 1 do
		for gx = 0, (W / ts) - 1 do
			local center = origin + Vector3.new(gx * ts + ts / 2, 0, gz * ts + ts / 2)
			local segs = PathUtil.segmentDistances(center, waypoints)
			local minDist, nearCount, firstDir, bentPair = math.huge, 0, nil, false
			for _, s in segs do
				minDist = math.min(minDist, s.dist)
				if s.dist <= Config.TileNormalDist then
					nearCount += 1
					if firstDir then
						if math.abs(firstDir:Dot(s.dir)) < 0.9 then
							bentPair = true
						end
					else
						firstDir = s.dir
					end
				end
			end
			if minDist < Config.TileBlockedDist then
				continue -- the path runs through here
			end

			local kind
			if nearCount >= Config.PremiumMinSegments and bentPair then
				kind = "premium"
			elseif minDist <= Config.TileNormalDist then
				kind = "normal"
			else
				kind = "filler"
			end

			local alt = (gx + gz) % 2 == 0
			local color
			if kind == "premium" then
				color = alt and Palette.PremiumGold or Palette.PremiumGold:Lerp(Color3.new(1, 1, 1), 0.15)
			elseif kind == "filler" then
				color = alt and Palette.GrassFiller or Palette.GrassFiller:Lerp(Color3.new(1, 1, 1), 0.08)
			else
				color = alt and Palette.GrassLight or Palette.GrassDark
			end

			index += 1
			local tilePart = part({
				Name = "Tile_" .. index,
				Size = Vector3.new(ts, 0.26, ts),
				Position = Vector3.new(center.X, 0.13, center.Z),
				Color = color,
			}, tilesFolder)
			tilePart:SetAttribute("TileIndex", index)
			tilePart:SetAttribute("Kind", kind)
			tilePart:SetAttribute("Occupied", false)

			local tile = { part = tilePart, kind = kind, occupied = false, index = index, pos = tilePart.Position }
			tiles[index] = tile
			tileByPart[tilePart] = tile
		end
	end

	-- wall spots on the path
	local wallFolder = Instance.new("Folder")
	wallFolder.Name = "WallSpots"
	wallFolder.Parent = model
	local wallSpots = {}
	local wallSpotByPart = {}
	for i, ws in LOCAL_WALL_SPOTS do
		local pos = origin + Vector3.new(ws.X, 0, ws.Y)
		local _, snapped, t = PathUtil.distanceToPath(pos, waypoints, cum)
		local spotPart = part({
			Name = "WallSpot_" .. i,
			Size = Vector3.new(7, 0.3, 7),
			Position = Vector3.new(snapped.X, 0.36, snapped.Z),
			Color = Palette.WallSpotWhite,
			Transparency = 0.25,
		}, wallFolder)
		spotPart:SetAttribute("Occupied", false)
		local spot = { part = spotPart, pos = spotPart.Position, t = t, occupied = false, index = i }
		wallSpots[i] = spot
		wallSpotByPart[spotPart] = spot
	end

	-- the Tower
	local towerPos = origin + Vector3.new(48, 0, 120)
	local towerModel = Instance.new("Model")
	towerModel.Name = "Tower"
	local towerBase = part({
		Name = "TowerBase",
		Shape = Enum.PartType.Cylinder,
		Size = Vector3.new(7, 9, 9),
		CFrame = CFrame.new(towerPos + Vector3.new(0, 3.5, 0)) * CFrame.Angles(0, 0, math.rad(90)),
		Color = Palette.TowerBody,
		CanCollide = true,
	}, towerModel)
	part({
		Name = "TowerCore",
		Shape = Enum.PartType.Ball,
		Size = Vector3.new(5.5, 5.5, 5.5),
		Position = towerPos + Vector3.new(0, 9.5, 0),
		Color = Palette.TowerCore,
		Material = Enum.Material.Neon,
	}, towerModel)
	towerModel.PrimaryPart = towerBase
	towerModel.Parent = model

	-- elevated command platform behind the tower
	local platform = part({
		Name = "CommandPlatform",
		Size = Vector3.new(16, 1.2, 10),
		Position = origin + Vector3.new(48, 7, 128),
		Color = Palette.TowerBody,
		CanCollide = true,
	}, model)

	model.Parent = MapBuilder.getSlicesFolder()

	return {
		player = player,
		model = model,
		origin = origin,
		waypoints = waypoints,
		cum = cum,
		totalLength = totalLength,
		tiles = tiles,
		tileByPart = tileByPart,
		wallSpots = wallSpots,
		wallSpotByPart = wallSpotByPart,
		towerPos = towerPos,
		towerModel = towerModel,
		spawnPos = platform.Position + Vector3.new(0, 3, 0),
		paused = false,
	}
end

return MapBuilder
