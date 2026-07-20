-- Brainrot Defense — client bootstrap.
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Remotes = require(Shared:WaitForChild("Remotes"))

local player = Players.LocalPlayer
local remotes = Remotes.get()

local slicesFolder = workspace:WaitForChild("BrainrotSlices")
local sliceModel = slicesFolder:WaitForChild("Slice_" .. player.UserId)

local ctx = {
	player = player,
	remotes = remotes,
	sliceModel = sliceModel,
	selected = nil,
	selectionChanged = Instance.new("BindableEvent"),
}

function ctx.setSelected(defId)
	ctx.selected = defId
	ctx.selectionChanged:Fire(defId)
end

-- Hud first (it defines ctx.toast), then placement
require(script.HudController).start(ctx)
require(script.PlacementController).start(ctx)
