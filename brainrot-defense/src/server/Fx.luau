-- Cheap juicy primitive effects: beams, rings, pops, booms.
local Debris = game:GetService("Debris")
local TweenService = game:GetService("TweenService")

local Fx = {}

local function basePart(color)
	local p = Instance.new("Part")
	p.Anchored = true
	p.CanCollide = false
	p.CanQuery = false
	p.CanTouch = false
	p.Material = Enum.Material.Neon
	p.Color = color
	p.CastShadow = false
	return p
end

function Fx.beam(parent, from, to, color)
	local dist = (to - from).Magnitude
	if dist < 0.1 then
		return
	end
	local p = basePart(color)
	p.Size = Vector3.new(0.35, 0.35, dist)
	p.CFrame = CFrame.lookAt((from + to) / 2, to)
	p.Parent = parent
	Debris:AddItem(p, 0.08)
end

function Fx.ring(parent, pos, radius, color, life)
	local p = basePart(color)
	p.Shape = Enum.PartType.Cylinder
	p.Size = Vector3.new(0.4, 2, 2)
	p.Transparency = 0.35
	p.CFrame = CFrame.new(pos) * CFrame.Angles(0, 0, math.rad(90))
	p.Parent = parent
	local tween = TweenService:Create(p, TweenInfo.new(life or 0.35, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
		Size = Vector3.new(0.4, radius * 2, radius * 2),
		Transparency = 1,
	})
	tween:Play()
	Debris:AddItem(p, (life or 0.35) + 0.05)
end

function Fx.boom(parent, pos, radius, color)
	local p = basePart(color)
	p.Shape = Enum.PartType.Ball
	p.Size = Vector3.new(2, 2, 2)
	p.Transparency = 0.2
	p.CFrame = CFrame.new(pos)
	p.Parent = parent
	local tween = TweenService:Create(p, TweenInfo.new(0.4, Enum.EasingStyle.Quad, Enum.EasingDirection.Out), {
		Size = Vector3.new(radius * 2, radius * 2, radius * 2),
		Transparency = 1,
	})
	tween:Play()
	Debris:AddItem(p, 0.45)
end

function Fx.coinPop(parent, pos, color)
	for _ = 1, 2 do
		local p = basePart(color)
		p.Anchored = false
		p.Shape = Enum.PartType.Ball
		p.Size = Vector3.new(0.9, 0.9, 0.9)
		p.CFrame = CFrame.new(pos + Vector3.new(0, 1, 0))
		p.Parent = parent
		p.AssemblyLinearVelocity = Vector3.new(math.random(-12, 12), math.random(18, 28), math.random(-12, 12))
		Debris:AddItem(p, 0.8)
	end
end

return Fx
