-- Endless waves: composition, scaling, boss waves, clear bonuses, best-wave tracking.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local BrainrotCatalog = require(Shared.BrainrotCatalog)

local WaveService = {}
local S
local states = {} -- [player] = {slice, wave, best, phase, timer, queue, spawnTimer, mults}

function WaveService.init(services)
	S = services
end

function WaveService.initPlayer(player, slice)
	states[player] = {
		slice = slice,
		wave = 1,
		best = 1,
		phase = "intermission",
		timer = Config.FirstWaveDelay,
		queue = {},
		spawnTimer = 0,
		mults = { hp = 1, speed = 1 },
	}
end

function WaveService.cleanup(player)
	states[player] = nil
end

function WaveService.getWave(player)
	local state = states[player]
	return state and state.wave or 1
end

function WaveService.reset(player)
	local state = states[player]
	if not state then
		return
	end
	state.wave = 1
	state.phase = "intermission"
	state.timer = Config.IntermissionSecs
	state.queue = {}
end

local function multsFor(wave)
	local w = wave - 1
	return {
		hp = 1 + Config.HpRampLinear * w + Config.HpRampQuad * w * w,
		speed = math.min(Config.SpeedRampMax, 1 + Config.SpeedRampPerWave * wave),
		bossExtra = math.max(1, wave / Config.BossEvery),
	}
end

local function compose(wave)
	local queue = {}
	if wave % Config.BossEvery == 0 then
		table.insert(queue, "TrippiTroppi")
		for _ = 1, 6 do
			table.insert(queue, "TralaleroTralala")
		end
		return queue
	end

	local budget = Config.WaveBudgetBase + Config.WaveBudgetPerWave * wave
	local pool = {}
	local minCost = math.huge
	for id, cost in BrainrotCatalog.budgetCost do
		if wave >= BrainrotCatalog.unlockWave[id] then
			pool[#pool + 1] = { id = id, cost = cost }
			minCost = math.min(minCost, cost)
		end
	end
	while budget >= minCost do
		local affordable = {}
		for _, entry in pool do
			if entry.cost <= budget then
				affordable[#affordable + 1] = entry
			end
		end
		if #affordable == 0 then
			break
		end
		local pick = affordable[math.random(#affordable)]
		table.insert(queue, pick.id)
		budget -= pick.cost
	end
	return queue
end

local function spawnGap(wave)
	return math.clamp(Config.SpawnGapBase - Config.SpawnGapPerWave * wave, Config.SpawnGapMin, Config.SpawnGapBase)
end

function WaveService.step(dt)
	for player, state in states do
		if state.slice.paused then
			continue
		end

		if state.phase == "intermission" then
			state.timer -= dt
			if state.timer <= 0 then
				state.mults = multsFor(state.wave)
				state.queue = compose(state.wave)
				state.phase = "spawning"
				state.spawnTimer = 0
				if state.wave % Config.BossEvery == 0 then
					S.notify(player, ("Wave %d — BOSS INCOMING: Trippi Troppi!"):format(state.wave), "bad")
				else
					S.notify(player, ("Wave %d incoming!"):format(state.wave), "info")
				end
			end
		elseif state.phase == "spawning" then
			state.spawnTimer -= dt
			if state.spawnTimer <= 0 and #state.queue > 0 then
				local typeId = table.remove(state.queue, 1)
				S.Enemy.spawn(player, typeId, state.mults)
				state.spawnTimer = spawnGap(state.wave)
			end
			if #state.queue == 0 then
				state.phase = "active"
			end
		elseif state.phase == "active" then
			if S.Enemy.count(player) == 0 then
				local bonus = math.min(Config.WaveBonusCap, Config.WaveBonusBase + Config.WaveBonusPerWave * state.wave)
				S.Economy.award(player, bonus)
				S.notify(player, ("Wave %d cleared! +%d coins"):format(state.wave, bonus), "good")
				state.wave += 1
				if state.wave > state.best then
					state.best = state.wave
					local stats = player:FindFirstChild("leaderstats")
					local bestValue = stats and stats:FindFirstChild("Best Wave")
					if bestValue then
						bestValue.Value = state.best
					end
				end
				state.phase = "intermission"
				state.timer = Config.IntermissionSecs
			end
		end
	end
end

function WaveService.getHudInfo(player)
	local state = states[player]
	if not state then
		return nil
	end
	return {
		wave = state.wave,
		best = state.best,
		phase = state.phase,
		timer = math.max(0, math.ceil(state.timer)),
		remaining = #state.queue + S.Enemy.count(player),
	}
end

return WaveService
