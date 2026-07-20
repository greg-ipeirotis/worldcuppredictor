-- Brainrot Defense — server bootstrap.
-- Builds a slice per player, wires services together, runs the game loop.
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared.Config)
local Palette = require(Shared.Palette)
local Remotes = require(Shared.Remotes)

local MapBuilder = require(script.MapBuilder)

local S = {}
S.Economy = require(script.EconomyService)
S.Enemy = require(script.EnemyService)
S.Tower = require(script.TowerService)
S.Defense = require(script.DefenseService)
S.Wave = require(script.WaveService)

local remotes = Remotes.get()
local slices = {} -- [player] = slice
local sliceIndex = {} -- [player] = number
local usedIndices = {}

function S.notify(player, text, kind)
	remotes.Events.Notify:FireClient(player, text, kind or "info")
end

for _, service in { S.Economy, S.Enemy, S.Tower, S.Defense, S.Wave } do
	service.init(S)
end

-- a friendly sea under everything
local sea = Instance.new("Part")
sea.Name = "Sea"
sea.Anchored = true
sea.CanCollide = true
sea.Size = Vector3.new(4000, 2, 4000)
sea.Position = Vector3.new(0, -5, 0)
sea.Color = Palette.Sea
sea.Material = Enum.Material.SmoothPlastic
sea.Parent = workspace

local function allocIndex()
	local i = 0
	while usedIndices[i] do
		i += 1
	end
	usedIndices[i] = true
	return i
end

local function placeCharacter(player, char)
	local slice = slices[player]
	if not slice then
		return
	end
	local hrp = char:WaitForChild("HumanoidRootPart", 10)
	if not hrp then
		return
	end
	local look = Vector3.new(slice.towerPos.X, slice.spawnPos.Y, slice.towerPos.Z - 30)
	char:PivotTo(CFrame.lookAt(slice.spawnPos, look))
end

local function onPlayerAdded(player)
	if slices[player] then
		return
	end
	local idx = allocIndex()
	sliceIndex[player] = idx
	local slice = MapBuilder.build(player, idx * Config.SliceSpacing)
	slices[player] = slice

	S.Economy.initPlayer(player)
	S.Enemy.initPlayer(player, slice)
	S.Tower.initPlayer(player, slice)
	S.Defense.initPlayer(player, slice)
	S.Wave.initPlayer(player, slice)

	player.CharacterAdded:Connect(function(char)
		placeCharacter(player, char)
	end)
	if player.Character then
		placeCharacter(player, player.Character)
	end

	S.notify(player, "Welcome to Brainrot Defense! Build turrets before the brainrots arrive!", "good")
end

local function onPlayerRemoving(player)
	S.Wave.cleanup(player)
	S.Defense.cleanup(player)
	S.Tower.cleanup(player)
	S.Enemy.cleanup(player)
	S.Economy.cleanup(player)
	local slice = slices[player]
	if slice then
		slice.model:Destroy()
	end
	slices[player] = nil
	if sliceIndex[player] ~= nil then
		usedIndices[sliceIndex[player]] = nil
		sliceIndex[player] = nil
	end
end

Players.PlayerAdded:Connect(onPlayerAdded)
Players.PlayerRemoving:Connect(onPlayerRemoving)
for _, player in Players:GetPlayers() do
	task.spawn(onPlayerAdded, player)
end

-- === Remote handlers ===

remotes.Functions.PlaceDefense.OnServerInvoke = function(player, defId, targetPart)
	local slice = slices[player]
	if not slice then
		return false, "No slice yet"
	end
	if typeof(targetPart) ~= "Instance" or not targetPart:IsDescendantOf(slice.model) then
		return false, "That's not your slice!"
	end
	return S.Defense.place(player, defId, targetPart)
end

remotes.Functions.UpgradeTower.OnServerInvoke = function(player, track)
	if typeof(track) ~= "string" then
		return false, "Bad request"
	end
	return S.Tower.upgrade(player, track)
end

remotes.Functions.TogglePause.OnServerInvoke = function(player)
	local slice = slices[player]
	if not slice then
		return false
	end
	slice.paused = not slice.paused
	return slice.paused
end

-- === Game loop ===

local hudAcc = 0
RunService.Heartbeat:Connect(function(dt)
	S.Economy.step(dt)
	S.Wave.step(dt)
	S.Enemy.step(dt)
	S.Defense.step(dt)
	S.Tower.step(dt)

	hudAcc += dt
	if hudAcc >= Config.HudPushInterval then
		hudAcc = 0
		for player, slice in slices do
			remotes.Events.UpdateHud:FireClient(player, {
				coins = S.Economy.get(player),
				wave = S.Wave.getHudInfo(player),
				tower = S.Tower.getHudInfo(player),
				paused = slice.paused,
			})
		end
	end
end)
