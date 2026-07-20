-- Creates (server) / fetches (client) the remote instances.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local EVENTS = { "UpdateHud", "Notify" }
local FUNCTIONS = { "PlaceDefense", "UpgradeTower", "TogglePause" }

local Remotes = {}

function Remotes.get()
	local folder
	if RunService:IsServer() then
		folder = Instance.new("Folder")
		folder.Name = "BrainrotRemotes"
		for _, name in EVENTS do
			local ev = Instance.new("RemoteEvent")
			ev.Name = name
			ev.Parent = folder
		end
		for _, name in FUNCTIONS do
			local fn = Instance.new("RemoteFunction")
			fn.Name = name
			fn.Parent = folder
		end
		folder.Parent = ReplicatedStorage
	else
		folder = ReplicatedStorage:WaitForChild("BrainrotRemotes")
	end

	local out = { Events = {}, Functions = {} }
	for _, name in EVENTS do
		out.Events[name] = folder:WaitForChild(name)
	end
	for _, name in FUNCTIONS do
		out.Functions[name] = folder:WaitForChild(name)
	end
	return out
end

return Remotes
