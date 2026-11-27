// SVG drawing for characters, pets and stages. Character art uses a 200 x 345 box.
let UID = 0;

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
const byId = (list, id) => list.find(x => x.id === id) || list[0];

function starPath(cx, cy, r1, r2, pts = 5) {
  let d = '';
  for (let i = 0; i < pts * 2; i++) {
    const r = i % 2 ? r2 : r1, a = Math.PI / pts * i - Math.PI / 2;
    d += (i ? 'L' : 'M') + (cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1);
  }
  return d + 'Z';
}
function heartPath(x, y, s) {
  return `M${x},${y + s * 0.9} C${x - s * 1.6},${y - s * 0.2} ${x - s * 0.6},${y - s * 1.2} ${x},${y - s * 0.3} C${x + s * 0.6},${y - s * 1.2} ${x + s * 1.6},${y - s * 0.2} ${x},${y + s * 0.9}Z`;
}
function flower(x, y, r, petal, center) {
  let s = '';
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    s += `<circle cx="${(x + Math.cos(a) * r).toFixed(1)}" cy="${(y + Math.sin(a) * r).toFixed(1)}" r="${r * 0.85}" fill="${petal}"/>`;
  }
  return s + `<circle cx="${x}" cy="${y}" r="${r * 0.7}" fill="${center}"/>`;
}

// ---------- turning (yaw in degrees: 0 = facing you, 90 = her side, 180 = her back) ----------
let SPIN_SHIFT = 0; // slides skirt patterns sideways while she turns
const HEAD_R = 36, HEAD_CY = 84;
const SNOWMAN_HEAD_RX = 28, SNOWMAN_HEAD_RY = 44;
const clamp01 = v => Math.max(0, Math.min(1, v));
// Where a face feature sits after the head turns. phi = the feature's own angle on the head.
function featureAt(x0, yaw) {
  const phi = Math.asin(Math.max(-1, Math.min(1, (x0 - 100) / HEAD_R)));
  const a = phi + yaw * Math.PI / 180;
  return { x: 100 + HEAD_R * Math.sin(a), k: Math.cos(a) };
}
// Draw a feature (designed around x0) moved and foreshortened for the turn.
function placed(x0, yaw, inner, minK = 0.12) {
  const { x, k } = featureAt(x0, yaw);
  if (k < minK) return '';
  return `<g transform="translate(${x.toFixed(2)} 0) scale(${k.toFixed(3)} 1) translate(${-x0} 0)">${inner}</g>`;
}
