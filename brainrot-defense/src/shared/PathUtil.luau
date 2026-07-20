-- Polyline math for the red S-path: distance-along-path parametrization,
-- point-to-path distances (used for tile classification and acid targeting).
local PathUtil = {}

local function flat(v)
	return Vector3.new(v.X, 0, v.Z)
end

-- cumulative arc length at each waypoint; returns (cum, totalLength)
function PathUtil.cumulative(points)
	local cum = table.create(#points)
	cum[1] = 0
	for i = 2, #points do
		cum[i] = cum[i - 1] + (flat(points[i]) - flat(points[i - 1])).Magnitude
	end
	return cum, cum[#points]
end

-- position + travel direction at arc distance t
function PathUtil.positionAt(points, cum, t)
	local n = #points
	if t <= 0 then
		return points[1], (flat(points[2]) - flat(points[1])).Unit
	end
	if t >= cum[n] then
		return points[n], (flat(points[n]) - flat(points[n - 1])).Unit
	end
	for i = 2, n do
		if cum[i] >= t then
			local segLen = cum[i] - cum[i - 1]
			local alpha = if segLen > 0 then (t - cum[i - 1]) / segLen else 0
			local dir = (flat(points[i]) - flat(points[i - 1])).Unit
			return points[i - 1]:Lerp(points[i], alpha), dir
		end
	end
	return points[n], Vector3.zAxis
end

local function closestOnSegment(p, a, b)
	local ab = flat(b) - flat(a)
	local len2 = ab:Dot(ab)
	if len2 == 0 then
		return a, 0
	end
	local alpha = math.clamp((flat(p) - flat(a)):Dot(ab) / len2, 0, 1)
	return a + (b - a) * alpha, alpha
end

-- min planar distance from p to the polyline; returns (dist, closestPoint, arcT)
function PathUtil.distanceToPath(p, points, cum)
	local best, bestPoint, bestT = math.huge, points[1], 0
	for i = 2, #points do
		local q, alpha = closestOnSegment(p, points[i - 1], points[i])
		local d = (flat(p) - flat(q)).Magnitude
		if d < best then
			best = d
			bestPoint = q
			bestT = cum[i - 1] + alpha * (cum[i] - cum[i - 1])
		end
	end
	return best, bestPoint, bestT
end

-- per-segment planar distances + segment directions (for premium-spot detection)
function PathUtil.segmentDistances(p, points)
	local out = {}
	for i = 2, #points do
		local q = closestOnSegment(p, points[i - 1], points[i])
		local d = (flat(p) - flat(q)).Magnitude
		local dir = (flat(points[i]) - flat(points[i - 1])).Unit
		out[#out + 1] = { dist = d, dir = dir }
	end
	return out
end

return PathUtil
