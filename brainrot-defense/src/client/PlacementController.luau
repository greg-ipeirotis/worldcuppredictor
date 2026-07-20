-- Click a shop item, then click a tile (or a white path spot for walls) to build.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Palette = require(Shared.Palette)
local DefenseCatalog = require(Shared.DefenseCatalog)

local PlacementController = {}

function PlacementController.start(ctx)
	local mouse = ctx.player:GetMouse()
	local playerGui = ctx.player:WaitForChild("PlayerGui")

	local box = Instance.new("SelectionBox")
	box.LineThickness = 0.08
	box.SurfaceTransparency = 0.7
	box.Parent = playerGui

	local hoverValid = false
	local hoverTarget = nil

	RunService.RenderStepped:Connect(function()
		local defId = ctx.selected
		if not defId then
			box.Adornee = nil
			hoverTarget = nil
			return
		end
		local def = DefenseCatalog.byId[defId]
		local target = mouse.Target
		local matches = false
		if target and target:IsDescendantOf(ctx.sliceModel) then
			if def.family == "Wall" then
				matches = target.Name:sub(1, 8) == "WallSpot"
			else
				matches = target.Name:sub(1, 5) == "Tile_"
			end
		end
		if matches then
			hoverTarget = target
			hoverValid = target:GetAttribute("Occupied") ~= true
			box.Adornee = target
			local c = hoverValid and Palette.UiGood or Palette.UiBad
			box.Color3 = c
			box.SurfaceColor3 = c
		else
			hoverTarget = nil
			box.Adornee = nil
		end
	end)

	UserInputService.InputBegan:Connect(function(input, gameProcessed)
		if gameProcessed then
			return
		end
		if input.UserInputType == Enum.UserInputType.MouseButton1 then
			if ctx.selected and hoverTarget and hoverValid then
				local ok, msg = ctx.remotes.Functions.PlaceDefense:InvokeServer(ctx.selected, hoverTarget)
				if not ok and msg then
					ctx.toast(msg, "bad")
				end
			end
		elseif input.UserInputType == Enum.UserInputType.MouseButton2 or input.KeyCode == Enum.KeyCode.Escape then
			ctx.setSelected(nil)
		end
	end)
end

return PlacementController
