-- One coin wallet per player + passive income + leaderstats.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)

local EconomyService = {}
local states = {} -- [player] = {coins, acc, coinsValue}

function EconomyService.init(_services) end

function EconomyService.initPlayer(player)
	local stats = Instance.new("Folder")
	stats.Name = "leaderstats"
	local coinsValue = Instance.new("IntValue")
	coinsValue.Name = "Coins"
	coinsValue.Value = Config.StartingCoins
	coinsValue.Parent = stats
	local bestValue = Instance.new("IntValue")
	bestValue.Name = "Best Wave"
	bestValue.Value = 1
	bestValue.Parent = stats
	stats.Parent = player

	states[player] = { coins = Config.StartingCoins, acc = 0, coinsValue = coinsValue }
end

function EconomyService.cleanup(player)
	states[player] = nil
end

function EconomyService.get(player)
	local state = states[player]
	return state and state.coins or 0
end

function EconomyService.award(player, amount)
	local state = states[player]
	if not state or amount <= 0 then
		return
	end
	state.coins += amount
	state.coinsValue.Value = state.coins
end

function EconomyService.spend(player, amount)
	local state = states[player]
	if not state or state.coins < amount then
		return false
	end
	state.coins -= amount
	state.coinsValue.Value = state.coins
	return true
end

function EconomyService.step(dt)
	for player, state in states do
		state.acc += dt * Config.PassiveIncomePerSec
		if state.acc >= 1 then
			local whole = math.floor(state.acc)
			state.acc -= whole
			EconomyService.award(player, whole)
		end
	end
end

return EconomyService
