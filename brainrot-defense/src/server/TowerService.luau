-- The player's Tower: constant AoE pulse damage, three upgrade tracks, HP,
-- and the death/persistence rules (upgrades survive, board doesn't).
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Palette = require(Shared.Palette)
local Fx = require(script.Parent.Fx)

local TowerService = {}
local S
local states = {} -- [player] = {slice, hp, tracks, pulseAcc, pendingDeath}

local TRACKS = { "Damage", "Rate", "Range" }

function TowerService.init(services)
	S = services
end

function TowerService.initPlayer(player, slice)
	states[player] = {
		slice = slice,
		hp = Config.TowerMaxHp,
		tracks = { Damage = 0, Rate = 0, Range = 0 },
		pulseAcc = 0,
		pendingDeath = false,
	}
end

function TowerService.cleanup(player)
	states[player] = nil
end

local function stats(state)
	local t = state.tracks
	return {
		damage = Config.TowerBaseDamage * (1 + Config.TowerDamagePerLevel * t.Damage),
		interval = Config.TowerBaseInterval * Config.TowerIntervalPerLevel ^ t.Rate,
		range = Config.TowerBaseRange + Config.TowerRangePerLevel * t.Range,
	}
end

function TowerService.upgradeCost(state, track)
	return math.floor(Config.TowerUpgradeBaseCost * Config.TowerUpgradeCostScale ^ state.tracks[track])
end

function TowerService.upgrade(player, track)
	local state = states[player]
	if not state or not table.find(TRACKS, track) then
		return false, "Unknown upgrade"
	end
	if state.tracks[track] >= Config.TowerUpgradeMaxLevel then
		return false, "Already maxed!"
	end
	local cost = TowerService.upgradeCost(state, track)
	if not S.Economy.spend(player, cost) then
		return false, "Not enough coins!"
	end
	state.tracks[track] += 1
	Fx.ring(state.slice.model, state.slice.towerPos + Vector3.new(0, 1, 0), 12, Palette.PremiumGold, 0.5)
	return true
end

function TowerService.takeLeak(player, dmg)
	local state = states[player]
	if not state then
		return
	end
	state.hp = math.max(0, state.hp - dmg)
	if state.hp <= 0 then
		state.pendingDeath = true
	end
end

local function die(player, state)
	state.pendingDeath = false
	state.hp = Config.TowerMaxHp
	-- board wiped, upgrades kept, small stipend (not enough to fully rebuild)
	S.Defense.clearSlice(player)
	S.Enemy.clearAll(player)
	S.Wave.reset(player)
	S.Economy.award(player, Config.DeathStipend)
	S.notify(
		player,
		("Your tower fell! +%d coin stipend. Upgrades kept — go again!"):format(Config.DeathStipend),
		"bad"
	)
	Fx.boom(state.slice.model, state.slice.towerPos + Vector3.new(0, 5, 0), 16, Palette.Explosion)
end

function TowerService.step(dt)
	for player, state in states do
		if state.pendingDeath then
			die(player, state)
			continue
		end
		if state.slice.paused then
			continue
		end
		local st = stats(state)
		state.pulseAcc += dt
		if state.pulseAcc >= st.interval then
			state.pulseAcc = 0
			if S.Enemy.count(player) > 0 then
				S.Enemy.damageArea(player, state.slice.towerPos, st.range, st.damage, true)
				Fx.ring(state.slice.model, state.slice.towerPos + Vector3.new(0, 0.6, 0), st.range, Palette.TowerPulse)
			end
		end
	end
end

function TowerService.getHudInfo(player)
	local state = states[player]
	if not state then
		return nil
	end
	local tracks = {}
	for _, track in TRACKS do
		local lvl = state.tracks[track]
		tracks[track] = {
			level = lvl,
			maxed = lvl >= Config.TowerUpgradeMaxLevel,
			cost = lvl < Config.TowerUpgradeMaxLevel and TowerService.upgradeCost(state, track) or 0,
		}
	end
	return {
		hp = state.hp,
		maxHp = Config.TowerMaxHp,
		tracks = tracks,
	}
end

return TowerService
