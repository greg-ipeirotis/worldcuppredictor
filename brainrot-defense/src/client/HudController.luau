-- HUD: coins, wave banner, tower HP, shop bar, upgrade panel, pause, toasts.
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Palette = require(Shared.Palette)
local DefenseCatalog = require(Shared.DefenseCatalog)

local HudController = {}

local function mk(class, props, parent)
	local inst = Instance.new(class)
	for k, v in props do
		inst[k] = v
	end
	inst.Parent = parent
	return inst
end

local function corner(parent, radius)
	mk("UICorner", { CornerRadius = UDim.new(0, radius or 10) }, parent)
end

local function comma(n)
	local formatted = tostring(math.floor(n))
	while true do
		local k
		formatted, k = formatted:gsub("^(-?%d+)(%d%d%d)", "%1,%2")
		if k == 0 then
			break
		end
	end
	return formatted
end

function HudController.start(ctx)
	local playerGui = ctx.player:WaitForChild("PlayerGui")
	local gui = mk("ScreenGui", { Name = "BrainrotHud", ResetOnSpawn = false, IgnoreGuiInset = true }, playerGui)

	-- === coins (top left) ===
	local coinsFrame = mk("Frame", {
		Size = UDim2.new(0, 190, 0, 46),
		Position = UDim2.new(0, 14, 0, 14),
		BackgroundColor3 = Palette.UiBg,
		BackgroundTransparency = 0.15,
		BorderSizePixel = 0,
	}, gui)
	corner(coinsFrame, 14)
	local coinsLabel = mk("TextLabel", {
		Size = UDim2.fromScale(1, 1),
		BackgroundTransparency = 1,
		Font = Enum.Font.FredokaOne,
		TextSize = 24,
		TextColor3 = Palette.Coin,
		Text = "0 coins",
	}, coinsFrame)

	-- === wave banner (top center) ===
	local waveFrame = mk("Frame", {
		Size = UDim2.new(0, 300, 0, 64),
		Position = UDim2.new(0.5, -150, 0, 10),
		BackgroundColor3 = Palette.UiBg,
		BackgroundTransparency = 0.15,
		BorderSizePixel = 0,
	}, gui)
	corner(waveFrame, 14)
	local waveLabel = mk("TextLabel", {
		Size = UDim2.new(1, 0, 0, 34),
		BackgroundTransparency = 1,
		Font = Enum.Font.FredokaOne,
		TextSize = 26,
		TextColor3 = Palette.UiText,
		Text = "Wave 1",
	}, waveFrame)
	local waveSub = mk("TextLabel", {
		Size = UDim2.new(1, 0, 0, 24),
		Position = UDim2.new(0, 0, 0, 34),
		BackgroundTransparency = 1,
		Font = Enum.Font.FredokaOne,
		TextSize = 16,
		TextColor3 = Palette.UiSubtext,
		Text = "",
	}, waveFrame)

	-- === tower hp + pause (top right) ===
	local towerFrame = mk("Frame", {
		Size = UDim2.new(0, 230, 0, 92),
		Position = UDim2.new(1, -244, 0, 14),
		BackgroundColor3 = Palette.UiBg,
		BackgroundTransparency = 0.15,
		BorderSizePixel = 0,
	}, gui)
	corner(towerFrame, 14)
	mk("TextLabel", {
		Size = UDim2.new(1, -16, 0, 22),
		Position = UDim2.new(0, 8, 0, 6),
		BackgroundTransparency = 1,
		Font = Enum.Font.FredokaOne,
		TextSize = 16,
		TextColor3 = Palette.UiSubtext,
		Text = "TOWER HP",
		TextXAlignment = Enum.TextXAlignment.Left,
	}, towerFrame)
	local hpBg = mk("Frame", {
		Size = UDim2.new(1, -16, 0, 18),
		Position = UDim2.new(0, 8, 0, 28),
		BackgroundColor3 = Palette.HpRed,
		BorderSizePixel = 0,
	}, towerFrame)
	corner(hpBg, 8)
	local hpFill = mk("Frame", {
		Size = UDim2.fromScale(1, 1),
		BackgroundColor3 = Palette.HpGreen,
		BorderSizePixel = 0,
	}, hpBg)
	corner(hpFill, 8)
	local pauseButton = mk("TextButton", {
		Size = UDim2.new(1, -16, 0, 32),
		Position = UDim2.new(0, 8, 0, 52),
		BackgroundColor3 = Palette.UiAccent,
		BorderSizePixel = 0,
		Font = Enum.Font.FredokaOne,
		TextSize = 18,
		TextColor3 = Palette.UiText,
		Text = "⏸ Pause Defense",
	}, towerFrame)
	corner(pauseButton, 10)

	-- === toasts ===
	local toastAnchor = mk("Frame", {
		Size = UDim2.new(0, 480, 0, 0),
		Position = UDim2.new(0.5, -240, 0.22, 0),
		BackgroundTransparency = 1,
	}, gui)
	mk("UIListLayout", {
		FillDirection = Enum.FillDirection.Vertical,
		HorizontalAlignment = Enum.HorizontalAlignment.Center,
		Padding = UDim.new(0, 6),
	}, toastAnchor)

	local kindColors = { good = Palette.UiGood, bad = Palette.UiBad, info = Palette.UiText }
	function ctx.toast(text, kind)
		local label = mk("TextLabel", {
			Size = UDim2.new(1, 0, 0, 36),
			BackgroundColor3 = Palette.UiBg,
			BackgroundTransparency = 0.2,
			BorderSizePixel = 0,
			Font = Enum.Font.FredokaOne,
			TextSize = 20,
			TextColor3 = kindColors[kind] or Palette.UiText,
			Text = text,
		}, toastAnchor)
		corner(label, 12)
		TweenService:Create(label, TweenInfo.new(0.6, Enum.EasingStyle.Quad, Enum.EasingDirection.In, 0, false, 1.6), {
			TextTransparency = 1,
			BackgroundTransparency = 1,
		}):Play()
		task.delay(2.4, function()
			label:Destroy()
		end)
	end
	ctx.remotes.Events.Notify.OnClientEvent:Connect(function(text, kind)
		ctx.toast(text, kind)
	end)

	-- === shop bar (bottom) ===
	local shopFrame = mk("Frame", {
		Size = UDim2.new(0, #DefenseCatalog.list * 104 + 12, 0, 96),
		Position = UDim2.new(0.5, -(#DefenseCatalog.list * 104 + 12) / 2, 1, -108),
		BackgroundColor3 = Palette.UiBg,
		BackgroundTransparency = 0.15,
		BorderSizePixel = 0,
	}, gui)
	corner(shopFrame, 14)
	local layout = mk("UIListLayout", {
		FillDirection = Enum.FillDirection.Horizontal,
		HorizontalAlignment = Enum.HorizontalAlignment.Center,
		VerticalAlignment = Enum.VerticalAlignment.Center,
		Padding = UDim.new(0, 8),
	}, shopFrame)
	layout.SortOrder = Enum.SortOrder.LayoutOrder

	local strokes = {}
	for order, def in DefenseCatalog.list do
		local button = mk("TextButton", {
			Size = UDim2.new(0, 96, 0, 80),
			BackgroundColor3 = def.color,
			BorderSizePixel = 0,
			Text = "",
			LayoutOrder = order,
		}, shopFrame)
		corner(button, 12)
		local stroke = mk("UIStroke", { Color = Palette.PremiumGold, Thickness = 0, Transparency = 0 }, button)
		strokes[def.id] = stroke
		mk("TextLabel", {
			Size = UDim2.new(1, -8, 0, 42),
			Position = UDim2.new(0, 4, 0, 6),
			BackgroundTransparency = 1,
			Font = Enum.Font.FredokaOne,
			TextSize = 15,
			TextWrapped = true,
			TextColor3 = Palette.UiText,
			TextStrokeTransparency = 0.4,
			Text = def.name,
		}, button)
		mk("TextLabel", {
			Size = UDim2.new(1, -8, 0, 22),
			Position = UDim2.new(0, 4, 1, -28),
			BackgroundTransparency = 1,
			Font = Enum.Font.FredokaOne,
			TextSize = 17,
			TextColor3 = Palette.Coin,
			TextStrokeTransparency = 0.4,
			Text = comma(def.cost),
		}, button)
		button.MouseButton1Click:Connect(function()
			if ctx.selected == def.id then
				ctx.setSelected(nil)
			else
				ctx.setSelected(def.id)
				ctx.toast(def.desc, "info")
			end
		end)
	end
	ctx.selectionChanged.Event:Connect(function(defId)
		for id, stroke in strokes do
			stroke.Thickness = id == defId and 4 or 0
		end
	end)

	-- === tower upgrades (right side) ===
	local upFrame = mk("Frame", {
		Size = UDim2.new(0, 210, 0, 196),
		Position = UDim2.new(1, -224, 0.5, -98),
		BackgroundColor3 = Palette.UiBg,
		BackgroundTransparency = 0.15,
		BorderSizePixel = 0,
	}, gui)
	corner(upFrame, 14)
	mk("TextLabel", {
		Size = UDim2.new(1, 0, 0, 30),
		BackgroundTransparency = 1,
		Font = Enum.Font.FredokaOne,
		TextSize = 18,
		TextColor3 = Palette.UiText,
		Text = "🏰 Tower Upgrades",
	}, upFrame)
	local upButtons = {}
	local trackNames = { Damage = "💥 Damage", Rate = "⚡ Fire Rate", Range = "🎯 Range" }
	local yOff = 36
	for _, track in { "Damage", "Rate", "Range" } do
		local button = mk("TextButton", {
			Size = UDim2.new(1, -16, 0, 44),
			Position = UDim2.new(0, 8, 0, yOff),
			BackgroundColor3 = Palette.UiPanel,
			BorderSizePixel = 0,
			Font = Enum.Font.FredokaOne,
			TextSize = 16,
			TextColor3 = Palette.UiText,
			Text = trackNames[track],
		}, upFrame)
		corner(button, 10)
		upButtons[track] = button
		button.MouseButton1Click:Connect(function()
			local ok, msg = ctx.remotes.Functions.UpgradeTower:InvokeServer(track)
			if not ok and msg then
				ctx.toast(msg, "bad")
			end
		end)
		yOff += 52
	end

	pauseButton.MouseButton1Click:Connect(function()
		ctx.remotes.Functions.TogglePause:InvokeServer()
	end)

	-- === state updates ===
	ctx.remotes.Events.UpdateHud.OnClientEvent:Connect(function(data)
		coinsLabel.Text = comma(data.coins) .. " coins"
		local w = data.wave
		if w then
			waveLabel.Text = ("Wave %d   ·   Best %d"):format(w.wave, w.best)
			if data.paused then
				waveSub.Text = "⏸ Defense paused"
			elseif w.phase == "intermission" then
				waveSub.Text = ("Next wave in %ds"):format(w.timer)
			else
				waveSub.Text = ("%d brainrots left"):format(w.remaining)
			end
		end
		local t = data.tower
		if t then
			hpFill.Size = UDim2.fromScale(math.clamp(t.hp / t.maxHp, 0, 1), 1)
			for track, button in upButtons do
				local info = t.tracks[track]
				if info.maxed then
					button.Text = ("%s  Lv%d MAX"):format(trackNames[track], info.level)
				else
					button.Text = ("%s  Lv%d → %s"):format(trackNames[track], info.level, comma(info.cost))
				end
			end
		end
		pauseButton.Text = data.paused and "▶ Resume Defense" or "⏸ Pause Defense"
		pauseButton.BackgroundColor3 = data.paused and Palette.UiGood or Palette.UiAccent
	end)
end

return HudController
