/**
 * @typedef {object} CircleShape
 * @property {number} radius
 */

/**
 * @typedef {object} RectShape
 * @property {number} halfW
 * @property {number} halfH
 */

/**
 * @typedef {CircleShape | RectShape} Shape
 */

/**
 * @typedef {object} CircleArea
 * @property {number} x
 * @property {number} y
 * @property {number} radius
 */

/**
 * @typedef {object} RectArea
 * @property {number} left
 * @property {number} right
 * @property {number} top
 * @property {number} bottom
 */

/**
 * @typedef {CircleArea | RectArea} Area
 */

/**
 * @param {number} start
 * @param {number} dest
 * @param {number} min
 * @param {number} max
 * @returns 점이 선형이동 할 때 좌표가 [min, max] 구간에 들어가는 t의 범위 [tmin, tmax],
 */
// const slab = (start, dest, min, max) => {
//   if (dest === 0) return start < min || start > max ? null : [-Infinity, Infinity];
//   const t1 = (min - start) / dest;
//   const t2 = (max - start) / dest;
//   return [Math.min(t1, t2), Math.max(t1, t2)];
// };

const EPS = 1e-6;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const dot = (ax, ay, bx, by) => ax * bx + ay * by;

const len = (x, y) => Math.sqrt(x * x + y * y);

const normalize = (x, y) => {
  const l = len(x, y);
  if (l < EPS) return { x: 0, y: 0 };
  return { x: x / l, y: y / l };
};

/**
 * @param {CircleArea} mover
 * @param {CircleArea} target
 * @param {number} dx
 * @param {number} dy
 */
function resolveCircleCircle(mover, target, dx, dy) {
  const nx = mover.x + dx;
  const ny = mover.y + dy;

  const vx = nx - target.x;
  const vy = ny - target.y;

  const dist = len(vx, vy);
  const minDist = mover.radius + target.radius;

  if (dist >= minDist) return null;

  // 이동 방향 기준으로 이미 멀어지는 중이면 무시
  if (dot(vx, vy, dx, dy) > 0) return null;

  const penetration = minDist - dist;
  const n = normalize(vx, vy);

  return {
    x: nx + n.x * penetration,
    y: ny + n.y * penetration,
    penetration,
  };
}

function resolveCircleRect(mover, rect, dx, dy) {
  const nx = mover.x + dx;
  const ny = mover.y + dy;

  const cx = clamp(nx, rect.left, rect.right);
  const cy = clamp(ny, rect.top, rect.bottom);

  const vx = nx - cx;
  const vy = ny - cy;

  const dist = len(vx, vy);
  if (dist >= mover.radius) return null;

  // 이미 멀어지는 방향이면 무시
  if (dot(vx, vy, dx, dy) > 0) return null;

  const penetration = mover.radius - dist;

  const n = dist < EPS
    ? normalize(dx, dy)   // 내부 깊숙이 들어온 경우 fallback
    : normalize(vx, vy);

  return {
    x: nx + n.x * penetration,
    y: ny + n.y * penetration,
    penetration,
  };
}

/**
 * @param {CircleArea} mover
 * @param {Area[]} obstacles
 * @param {import(".").XY} dest
 */
export const resolveXY = (mover, obstacles, dest) => {
  let dx = dest.x - mover.x;
  let dy = dest.y - mover.y;

  let px = mover.x + dx;
  let py = mover.y + dy;

  // 이동이 없으면 그대로
  if (Math.abs(dx) < EPS && Math.abs(dy) < EPS) {
    return { x: mover.x, y: mover.y };
  }

  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    let result = null;

    if ('radius' in obs) {
      result = resolveCircleCircle(
        { x: mover.x, y: mover.y, radius: mover.radius },
        obs,
        dx,
        dy
      );
    } else {
      result = resolveCircleRect(
        { x: mover.x, y: mover.y, radius: mover.radius },
        obs,
        dx,
        dy
      );
    }

    if (!result) continue;

    // 가장 강한(침투량 큰) 충돌만 반영
    px = result.x;
    py = result.y;

    dx = px - mover.x;
    dy = py - mover.y;
  }

  return { x: px, y: py };
};
