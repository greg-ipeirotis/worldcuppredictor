-- Placement + behavior for all four defense families:
-- Shooters, temporary Walls, permanent Zones, automatic Emitters.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Shared = ReplicatedStorage:WaitForChild("Shared")
local Palette = require(Shared.Palette)
local PathUtil = require(Shared.PathUtil)
local DefenseCatalog = require(Shared.DefenseCatalog)
local Fx = require(script.Parent.Fx)

local DefenseService = {}
local S
local states = {} -- [player] = {slice, folder, shooters, walls, zones, emitters}

function DefenseService.init(services)
	S = services
end

function DefenseService.initPlayer(player, slice)
	local folder = Instance.new("Folder")
	folder.Name = "Defenses"
	folder.Parent = slice.model
	states[player] = { slice = slice, folder = folder, shooters = {}, walls = {}, zones = {}, emitters = {} }
end

function DefenseService.cleanup(player)
	states[player] = nil
end

-- ============================== model building ==============================

local function mkPart(props, parent)
	local p = Instance.new("Part")
	p.Anchored = true
	p.CanCollide = false
	p.CanQuery = false
	p.CanTouch = false
	p.CastShadow = false
	p.Material = props.Material or Enum.Material.SmoothPlastic
	for k, v in props do
		if k ~= "Material" then
			p[k] = v
		end
	end
	p.Parent = parent
	return p
end

local function attachHpBar(part, offset)
	local gui = Instance.new("BillboardGui")
	gui.Size = UDim2.new(0, 44, 0, 6)
	gui.StudsOffset = Vector3.new(0, offset, 0)
	gui.AlwaysOnTop = true
	local bg = Instance.new("Frame")
	bg.Size = UDim2.fromScale(1, 1)
	bg.BackgroundColor3 = Palette.HpRed
	bg.BorderSizePixel = 0
	bg.Parent = gui
	local fill = Instance.new("Frame")
	fill.Size = UDim2.fromScale(1, 1)
	fill.BackgroundColor3 = Palette.HpGreen
	fill.BorderSizePixel = 0
	fill.Parent = bg
	gui.Adornee = part
	gui.Parent = part
	return fill
end

local function buildShooterModel(def, pos, folder)
	local model = Instance.new("Model")
	model.Name = def.id
	local base = mkPart({
		Size = Vector3.new(4.5, 2.5, 4.5),
		Position = pos + Vector3.new(0, 1.35, 0),
		Color = def.color,
	}, model)
	local tall = def.id == "SniperTurret" and 5 or 3
	local barrel = mkPart({
		Size = Vector3.new(1.2, tall, 1.2),
		Position = pos + Vector3.new(0, 2.5 + tall / 2, 0),
		Color = def.color:Lerp(Color3.new(1, 1, 1), 0.35),
		Material = def.id == "LaserTurret" and Enum.Material.Neon or Enum.Material.SmoothPlastic,
	}, model)
	model.PrimaryPart = base
	model.Parent = folder
	return model, barrel.Position + Vector3.new(0, tall / 2, 0)
end

local function buildWallModel(def, spot, slice, folder)
	local _, dir = PathUtil.positionAt(slice.waypoints, slice.cum, spot.t)
	local pos = Vector3.new(spot.pos.X, 2.2, spot.pos.Z)
	local wallPart = mkPart({
		Size = Vector3.new(7.5, 4, 2.5),
		CFrame = CFrame.lookAt(pos, pos + Vector3.new(dir.X, 0, dir.Z)),
		Color = def.color,
		Material = def.id == "HayWall" and Enum.Material.Grass or Enum.Material.Slate,
	}, folder)
	return wallPart
end

local function buildZoneModel(def, pos, folder)
	local model = Instance.new("Model")
	model.Name = def.id
	mkPart({
		Shape = Enum.PartType.Cylinder,
		Size = Vector3.new(0.3, def.radius * 2, def.radius * 2),
		CFrame = CFrame.new(pos.X, 0.42, pos.Z) * CFrame.Angles(0, 0, math.rad(90)),
		Color = def.color,
		Material = Enum.Material.Neon,
		Transparency = 0.65,
	}, model)
	mkPart({
		Shape = Enum.PartType.Ball,
		Size = Vector3.new(2.2, 2.2, 2.2),
		Position = pos + Vector3.new(0, 1.4, 0),
		Color = def.color,
		Material = Enum.Material.Neon,
	}, model)
	model.Parent = folder
	return model
end

local function buildEmitterModel(def, pos, folder)
	local model = Instance.new("Model")
	model.Name = def.id
	mkPart({
		Shape = Enum.PartType.Cylinder,
		Size = Vector3.new(2.2, 4.5, 4.5),
		CFrame = CFrame.new(pos.X, 1.35, pos.Z) * CFrame.Angles(0, 0, math.rad(90)),
		Color = def.color,
	}, model)
	mkPart({
		Shape = Enum.PartType.Ball,
		Size = Vector3.new(2.6, 2.6, 2.6),
		Position = pos + Vector3.new(0, 3.2, 0),
		Color = def.color:Lerp(Color3.new(1, 1, 1), 0.25),
		Material = Enum.Material.Neon,
	}, model)
	model.Parent = folder
	return model
end

-- ============================== placement ==============================

function DefenseService.place(player, defId, targetPart)
	local state = states[player]
	local def = DefenseCatalog.byId[defId]
	if not state or not def then
		return false, "Unknown defense"
	end
	if typeof(targetPart) ~= "Instance" or not targetPart:IsA("BasePart") then
		return false, "Pick a spot first!"
	end
	local slice = state.slice

	if def.family == "Wall" then
		local spot = slice.wallSpotByPart[targetPart]
		if not spot then
			return false, "Walls go on the white path spots!"
		end
		if spot.occupied then
			return false, "Spot taken!"
		end
		if not S.Economy.spend(player, def.cost) then
			return false, "Not enough coins!"
		end
		local wallPart = buildWallModel(def, spot, slice, state.folder)
		local wall = {
			def = def,
			spot = spot,
			t = spot.t,
			hp = def.wallHp,
			maxHp = def.wallHp,
			expires = os.clock() + def.lifetime,
			model = wallPart,
			hpFill = attachHpBar(wallPart, 3),
			alive = true,
		}
		table.insert(state.walls, wall)
		spot.occupied = true
		spot.part:SetAttribute("Occupied", true)
		return true
	end

	-- everything else goes on a grass tile
	local tile = slice.tileByPart[targetPart]
	if not tile then
		return false, "Place that on a grass tile!"
	end
	if tile.occupied then
		return false, "Tile taken!"
	end
	if not S.Economy.spend(player, def.cost) then
		return false, "Not enough coins!"
	end
	local pos = tile.pos

	if def.family == "Shooter" then
		local model, muzzle = buildShooterModel(def, pos, state.folder)
		table.insert(state.shooters, { def = def, pos = pos, muzzle = muzzle, cd = 0, model = model, tile = tile })
	elseif def.family == "Zone" then
		local model = buildZoneModel(def, pos, state.folder)
		table.insert(state.zones, {
			def = def,
			pos = pos,
			radius = def.radius,
			slowMult = def.slowMult,
			dps = def.dps,
			model = model,
			tile = tile,
		})
	elseif def.family == "Emitter" then
		local model = buildEmitterModel(def, pos, state.folder)
		local emitter = { def = def, pos = pos, timer = def.interval, model = model, tile = tile }
		if def.kind == "acid" then
			local _, aimPos = PathUtil.distanceToPath(pos, slice.waypoints, slice.cum)
			emitter.aimPos = aimPos
		end
		table.insert(state.emitters, emitter)
	else
		return false, "Unknown family"
	end

	tile.occupied = true
	tile.part:SetAttribute("Occupied", true)
	return true
end

-- ============================== queries ==============================

-- zones (permanent + live acid puddles), pruning expired puddles
function DefenseService.getZones(player)
	local state = states[player]
	if not state then
		return {}
	end
	local now = os.clock()
	for i = #state.zones, 1, -1 do
		local z = state.zones[i]
		if z.expires and now >= z.expires then
			if z.model then
				z.model:Destroy()
			end
			table.remove(state.zones, i)
		end
	end
	return state.zones
end

function DefenseService.getWalls(player)
	local state = states[player]
	if not state then
		return {}
	end
	local alive = {}
	for _, w in state.walls do
		if w.alive then
			alive[#alive + 1] = w
		end
	end
	table.sort(alive, function(a, b)
		return a.t < b.t
	end)
	return alive
end

local function destroyWall(state, wall)
	if not wall.alive then
		return
	end
	wall.alive = false
	wall.spot.occupied = false
	wall.spot.part:SetAttribute("Occupied", false)
	Fx.boom(state.folder, wall.model.Position, 4, wall.def.color)
	wall.model:Destroy()
end

function DefenseService.damageWall(player, wall, dmg)
	local state = states[player]
	if not state or not wall.alive then
		return
	end
	wall.hp -= dmg
	if wall.hp <= 0 then
		destroyWall(state, wall)
	else
		wall.hpFill.Size = UDim2.fromScale(math.clamp(wall.hp / wall.maxHp, 0, 1), 1)
	end
end

-- bomber death: splash damage to nearby walls
function DefenseService.explodeWalls(player, pos, radius, dmg)
	local state = states[player]
	if not state then
		return
	end
	for _, wall in state.walls do
		if wall.alive then
			local d = (Vector3.new(wall.model.Position.X, 0, wall.model.Position.Z) - Vector3.new(pos.X, 0, pos.Z)).Magnitude
			if d <= radius then
				DefenseService.damageWall(player, wall, dmg)
			end
		end
	end
end

function DefenseService.clearSlice(player)
	local state = states[player]
	if not state then
		return
	end
	for _, s in state.shooters do
		s.model:Destroy()
		s.tile.occupied = false
		s.tile.part:SetAttribute("Occupied", false)
	end
	for _, z in state.zones do
		if z.model then
			z.model:Destroy()
		end
		if z.tile then
			z.tile.occupied = false
			z.tile.part:SetAttribute("Occupied", false)
		end
	end
	for _, e in state.emitters do
		e.model:Destroy()
		e.tile.occupied = false
		e.tile.part:SetAttribute("Occupied", false)
	end
	for _, w in state.walls do
		if w.alive then
			w.alive = false
			w.spot.occupied = false
			w.spot.part:SetAttribute("Occupied", false)
			w.model:Destroy()
		end
	end
	state.shooters, state.zones, state.emitters, state.walls = {}, {}, {}, {}
end

-- ============================== behavior ==============================

function DefenseService.step(dt)
	local now = os.clock()
	for player, state in states do
		if state.slice.paused then
			continue
		end

		-- shooters
		for _, s in state.shooters do
			s.cd -= dt
			if s.cd <= 0 then
				local target = S.Enemy.getFirstInRange(player, s.pos, s.def.range, s.def.hitsAir)
				if target then
					local slowMult = S.Enemy.turretSlowAt(player, s.pos)
					s.cd = s.def.fireInterval * slowMult
					Fx.beam(state.folder, s.muzzle, target.curPos, s.def.color)
					if s.def.splashRadius then
						local hitPos = target.curPos
						Fx.ring(
							state.folder,
							Vector3.new(hitPos.X, 0.6, hitPos.Z),
							s.def.splashRadius,
							s.def.color,
							0.25
						)
						S.Enemy.damageArea(player, hitPos, s.def.splashRadius, s.def.damage, s.def.hitsAir)
					else
						S.Enemy.damage(player, target, s.def.damage)
					end
				else
					s.cd = 0.1
				end
			end
		end

		-- walls: expiry
		for i = #state.walls, 1, -1 do
			local w = state.walls[i]
			if w.alive and now >= w.expires then
				destroyWall(state, w)
			end
			if not w.alive then
				table.remove(state.walls, i)
			end
		end

		-- emitters
		for _, em in state.emitters do
			em.timer -= dt
			if em.timer <= 0 then
				em.timer = em.def.interval
				if em.def.kind == "tack" then
					if S.Enemy.count(player) > 0 then
						Fx.ring(state.folder, em.pos + Vector3.new(0, 1, 0), em.def.radius, em.def.color, 0.3)
						S.Enemy.damageArea(player, em.pos, em.def.radius, em.def.damage, false)
					end
				elseif em.def.kind == "acid" and em.aimPos then
					local puddleModel = mkPart({
						Shape = Enum.PartType.Cylinder,
						Size = Vector3.new(0.25, em.def.puddleRadius * 2, em.def.puddleRadius * 2),
						CFrame = CFrame.new(em.aimPos.X, 0.45, em.aimPos.Z) * CFrame.Angles(0, 0, math.rad(90)),
						Color = em.def.color,
						Material = Enum.Material.Neon,
						Transparency = 0.5,
					}, state.folder)
					table.insert(state.zones, {
						pos = em.aimPos,
						radius = em.def.puddleRadius,
						dps = em.def.damage,
						expires = now + em.def.puddleLife,
						model = puddleModel,
					})
				end
			end
		end
	end
end

return DefenseService
