-- Spawns, moves, and kills Italian Brainrots along each slice's path.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Palette = require(Shared.Palette)
local PathUtil = require(Shared.PathUtil)
local BrainrotCatalog = require(Shared.BrainrotCatalog)
local Fx = require(script.Parent.Fx)

local EnemyService = {}
local S -- services table, injected
local states = {} -- [player] = {slice, enemies, nextId, folder}

function EnemyService.init(services)
	S = services
end

function EnemyService.initPlayer(player, slice)
	local folder = Instance.new("Folder")
	folder.Name = "Enemies"
	folder.Parent = slice.model
	states[player] = { slice = slice, enemies = {}, nextId = 0, folder = folder }
end

function EnemyService.cleanup(player)
	states[player] = nil
end

local function buildModel(def, folder)
	local model = Instance.new("Model")
	model.Name = def.id
	local body = Instance.new("Part")
	body.Anchored = true
	body.CanCollide = false
	body.CanQuery = false
	body.CanTouch = false
	body.CastShadow = false
	body.Color = def.color
	body.Material = Enum.Material.SmoothPlastic
	if def.shape == "Cylinder" then
		body.Shape = Enum.PartType.Cylinder
		body.Size = Vector3.new(def.size * 1.5, def.size, def.size)
		-- stand the log upright: cylinder axis is X, rotate to vertical
		body.CFrame = CFrame.new(0, 0, 0) * CFrame.Angles(0, 0, math.rad(90))
	else
		body.Shape = Enum.PartType.Ball
		body.Size = Vector3.new(def.size, def.size, def.size)
		body.CFrame = CFrame.new(0, 0, 0)
	end
	body.Parent = model
	model.PrimaryPart = body
	-- neutral pivot so PivotTo preserves the baked-in upright rotation (Tung Tung's log)
	model.WorldPivot = CFrame.new()

	-- goofy googly eyes on the front
	for _, xOff in { -def.size * 0.22, def.size * 0.22 } do
		local eye = Instance.new("Part")
		eye.Shape = Enum.PartType.Ball
		eye.Size = Vector3.new(0.7, 0.7, 0.7)
		eye.Color = Color3.new(1, 1, 1)
		eye.Material = Enum.Material.SmoothPlastic
		eye.Anchored = true
		eye.CanCollide = false
		eye.CanQuery = false
		eye.CanTouch = false
		eye.CastShadow = false
		eye.CFrame = CFrame.new(xOff, def.size * 0.18, -def.size * 0.45)
		eye.Parent = model
		local pupil = eye:Clone()
		pupil.Size = Vector3.new(0.32, 0.32, 0.32)
		pupil.Color = Color3.new(0, 0, 0)
		pupil.CFrame = eye.CFrame * CFrame.new(0, 0, -0.25)
		pupil.Parent = model
	end

	-- hp bar
	local gui = Instance.new("BillboardGui")
	gui.Name = "HpBar"
	gui.Size = UDim2.new(0, 46, 0, 7)
	gui.StudsOffset = Vector3.new(0, def.size / 2 + 1.6, 0)
	gui.AlwaysOnTop = true
	local bg = Instance.new("Frame")
	bg.Size = UDim2.fromScale(1, 1)
	bg.BackgroundColor3 = Palette.HpRed
	bg.BorderSizePixel = 0
	bg.Parent = gui
	local fill = Instance.new("Frame")
	fill.Name = "Fill"
	fill.Size = UDim2.fromScale(1, 1)
	fill.BackgroundColor3 = Palette.HpGreen
	fill.BorderSizePixel = 0
	fill.Parent = bg
	gui.Adornee = body
	gui.Parent = body

	model.Parent = folder
	return model, fill
end

function EnemyService.spawn(player, typeId, mults)
	local state = states[player]
	if not state then
		return
	end
	local def = BrainrotCatalog.byId[typeId]
	local hp = def.hp * mults.hp * (def.boss and (mults.bossExtra or 1) or 1)
	local model, hpFill = buildModel(def, state.folder)
	state.nextId += 1
	local enemy = {
		id = state.nextId,
		def = def,
		hp = hp,
		maxHp = hp,
		t = 0,
		speedMult = mults.speed,
		alive = true,
		flying = def.flying == true,
		attackTimer = 0,
		model = model,
		hpFill = hpFill,
		curPos = state.slice.waypoints[1],
	}
	table.insert(state.enemies, enemy)
	return enemy
end

local function groundY(def)
	return 0.35 + def.size / 2
end

local function kill(state, enemy, awardBounty)
	if not enemy.alive then
		return
	end
	enemy.alive = false
	local def = enemy.def
	if awardBounty then
		local wave = S.Wave.getWave(state.slice.player)
		local bounty
		if def.boss then
			bounty = def.bounty
		else
			bounty = math.min(Config.BountyCap, def.bounty * (1 + Config.BountyWaveScale * (wave - 1)))
		end
		S.Economy.award(state.slice.player, math.floor(bounty + 0.5))
		Fx.coinPop(state.folder, enemy.curPos, Palette.Coin)
		if def.explodeRadius then
			Fx.boom(state.folder, enemy.curPos, def.explodeRadius, Palette.Explosion)
			S.Defense.explodeWalls(state.slice.player, enemy.curPos, def.explodeRadius, def.explodeDamage)
		end
	end
	enemy.model:Destroy()
end

function EnemyService.damage(player, enemy, amount)
	local state = states[player]
	if not state or not enemy.alive then
		return
	end
	enemy.hp -= amount
	if enemy.hp <= 0 then
		kill(state, enemy, true)
	else
		enemy.hpFill.Size = UDim2.fromScale(math.clamp(enemy.hp / enemy.maxHp, 0, 1), 1)
	end
end

function EnemyService.damageArea(player, center, radius, amount, hitsAir)
	local state = states[player]
	if not state then
		return
	end
	local flatC = Vector3.new(center.X, 0, center.Z)
	for _, e in state.enemies do
		if e.alive and (hitsAir or not e.flying) then
			local p = Vector3.new(e.curPos.X, 0, e.curPos.Z)
			if (p - flatC).Magnitude <= radius then
				EnemyService.damage(player, e, amount)
			end
		end
	end
end

-- first enemy (furthest along the path) within range
function EnemyService.getFirstInRange(player, pos, range, hitsAir)
	local state = states[player]
	if not state then
		return nil
	end
	local flatP = Vector3.new(pos.X, 0, pos.Z)
	local best, bestT = nil, -1
	for _, e in state.enemies do
		if e.alive and (hitsAir or not e.flying) then
			local p = Vector3.new(e.curPos.X, 0, e.curPos.Z)
			if (p - flatP).Magnitude <= range and e.t > bestT then
				best, bestT = e, e.t
			end
		end
	end
	return best
end

-- support brainrot aura: returns the slow multiplier affecting a turret at pos (1 = none)
function EnemyService.turretSlowAt(player, pos)
	local state = states[player]
	if not state then
		return 1
	end
	local flatP = Vector3.new(pos.X, 0, pos.Z)
	for _, e in state.enemies do
		if e.alive and e.def.turretSlowRadius then
			local p = Vector3.new(e.curPos.X, 0, e.curPos.Z)
			if (p - flatP).Magnitude <= e.def.turretSlowRadius then
				return e.def.turretSlowMult
			end
		end
	end
	return 1
end

function EnemyService.count(player)
	local state = states[player]
	if not state then
		return 0
	end
	local n = 0
	for _, e in state.enemies do
		if e.alive then
			n += 1
		end
	end
	return n
end

function EnemyService.clearAll(player)
	local state = states[player]
	if not state then
		return
	end
	for _, e in state.enemies do
		if e.alive then
			e.alive = false
			e.model:Destroy()
		end
	end
	state.enemies = {}
end

function EnemyService.step(dt)
	for player, state in states do
		local slice = state.slice
		if slice.paused then
			continue
		end

		-- prune the dead
		for i = #state.enemies, 1, -1 do
			if not state.enemies[i].alive then
				table.remove(state.enemies, i)
			end
		end

		-- collect drum-tank buffers
		local tanks = {}
		for _, e in state.enemies do
			if e.alive and e.def.speedAuraRadius then
				tanks[#tanks + 1] = e
			end
		end

		local zones = S.Defense.getZones(player)
		local walls = S.Defense.getWalls(player) -- sorted by t, alive only

		for _, e in state.enemies do
			if not e.alive then
				continue
			end
			local def = e.def

			-- zone effects (ground only)
			local slow, dotDps = 1, 0
			if not e.flying then
				local p = Vector3.new(e.curPos.X, 0, e.curPos.Z)
				for _, z in zones do
					local zp = Vector3.new(z.pos.X, 0, z.pos.Z)
					if (p - zp).Magnitude <= z.radius then
						if z.slowMult then
							slow = math.min(slow, z.slowMult)
						end
						if z.dps then
							dotDps += z.dps
						end
					end
				end
			end
			if dotDps > 0 then
				EnemyService.damage(player, e, dotDps * dt)
				if not e.alive then
					continue
				end
			end

			-- drum buff from nearby tanks
			local buff = 1
			for _, tank in tanks do
				if tank ~= e and tank.alive then
					local d = (Vector3.new(tank.curPos.X, 0, tank.curPos.Z) - Vector3.new(e.curPos.X, 0, e.curPos.Z)).Magnitude
					if d <= tank.def.speedAuraRadius then
						buff = tank.def.speedAuraMult
						break
					end
				end
			end

			local speed = def.speed * e.speedMult * slow * buff

			-- wall blocking (ground only)
			local blocked = false
			if not e.flying then
				for _, wall in walls do
					if wall.t > e.t - 1 and e.t + speed * dt >= wall.t - 2 then
						blocked = true
						e.t = math.min(e.t, wall.t - 2)
						e.attackTimer -= dt
						if e.attackTimer <= 0 then
							e.attackTimer = 1
							S.Defense.damageWall(player, wall, def.wallDamage)
						end
						break
					end
				end
			end
			if not blocked then
				e.t += speed * dt
			end

			-- reached the tower?
			if e.t >= slice.totalLength then
				e.alive = false
				e.model:Destroy()
				S.Tower.takeLeak(player, def.leak)
				continue
			end

			-- move the model
			local pos, dir = PathUtil.positionAt(slice.waypoints, slice.cum, e.t)
			local y = e.flying and Config.FlyerHoverHeight or groundY(def)
			local at = Vector3.new(pos.X, y, pos.Z)
			e.curPos = at
			e.model:PivotTo(CFrame.lookAt(at, at + Vector3.new(dir.X, 0, dir.Z)))
		end
	end
end

return EnemyService
