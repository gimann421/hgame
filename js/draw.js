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
// The part of the head you see from behind: a crescent that grows into a full circle,
// plus the hair on top of the head down to the hairline, which shows from every side.
function backOfHead(yaw, c, style) {
  if (style === 'none') return '';
  const s = Math.sin(yaw * Math.PI / 180), co = Math.cos(yaw * Math.PI / 180);
  if (co > 0.985) return '';
  const R = HEAD_R + 3, top = HEAD_CY - R - 1, bot = HEAD_CY + R + 1;
  // hair reaches a bit past the ear toward the face when she is turned away
  const rx = Math.max(0.01, R * Math.abs(co) * (co < 0 ? 1.22 : 0.92));
  const left = s > 0; // face slides right, so the back shows on the left
  const sg = left ? 1 : -1;
  // short styles stop at the nape, so the neck shows below them
  const yEnd = ['short', 'spiky', 'pixie', 'curly'].includes(style) ? 110 : bot;
  const xEnd = 100 - sg * Math.sqrt(Math.max(0, R * R - (yEnd - HEAD_CY) ** 2));
  const xMid = 100 - sg * rx * Math.sign(co || 1);
  const cx = (xMid - 0.125 * (xEnd + 100)) / 0.75;
  let d = `<path d="M100,${top} A${R},${R + 1} 0 0 ${left ? 0 : 1} ${xEnd.toFixed(1)},${yEnd} C${cx.toFixed(1)},${yEnd} ${cx.toFixed(1)},${top} 100,${top}Z" fill="${c}"/>`;
  // top-of-head hair: from the hairline above the forehead, curving back to behind the ear
  const hy = 57, xs = 100 + sg * Math.sqrt(R * R - (hy - HEAD_CY) ** 2);
  const xb = 100 - sg * rx * 0.85;
  const fade = clamp01(Math.abs(s) * 3);
  d += `<path d="M${xs.toFixed(1)},${hy} A${R},${R + 1} 0 0 ${left ? 0 : 1} 100,${top} L${(100 - sg * R * 0.6).toFixed(1)},${top + 4} L${xb.toFixed(1)},${HEAD_CY - 8} Q${((xs + xb) / 2).toFixed(1)},${hy + 2} ${xs.toFixed(1)},${hy}Z" fill="${c}" opacity="${fade.toFixed(2)}"/>`;
  return d;
}
// Strands and curls on the back of the head (seen when she faces away).
function backStrandLines(style, c) {
  if (style === 'none') return '';
  const d = shade(c, -0.18), l = shade(c, 0.2);
  let s = `<path d="M100,46 Q96,80 100,118" stroke="${d}" stroke-width="2" fill="none" opacity=".6"/><path d="M84,56 Q80,80 84,108 M116,56 Q120,80 116,108" stroke="${l}" stroke-width="2.4" fill="none" opacity=".55"/>`;
  if (style === 'afro') s = arcCircles(100, 82, 38, 0, 360, 16, 10, c) + s;
  if (style === 'curly') s = arcCircles(100, 84, 34, 0, 360, 14, 9, c);
  return s;
}
function earsOnTop(st, yaw) {
  let s = '';
  for (const x0 of [64, 136]) {
    const { x, k } = featureAt(x0, yaw);
    if (k > 0.02 && k < 0.999) s += `<ellipse cx="${x.toFixed(2)}" cy="88" rx="${(7 * Math.max(0.45, k + 0.3)).toFixed(2)}" ry="7.4" fill="${st.skinColor}"/><ellipse cx="${x.toFixed(2)}" cy="88" rx="${(3 * Math.max(0.3, k)).toFixed(2)}" ry="3.6" fill="${shade(st.skinColor, -0.12)}"/>`;
  }
  return s;
}

// ---------- patterns scattered over a clip shape ----------
function patternFill(kind, clipD, colors, box) {
  if (!kind || kind === 'none') return '';
  const id = 'c' + (++UID);
  const [x0, y0, x1, y1] = box;
  let s = '';
  const light = shade(colors.main, 0.6), dark = shade(colors.main, -0.25);
  if (kind === 'rainbow') {
    const bands = ['#ff8a80', '#ffd180', '#ffff8d', '#b9f6ca', '#80d8ff', '#b388ff'];
    const h = (y1 - y0) / bands.length;
    bands.forEach((c, i) => { s += `<rect x="${x0}" y="${y0 + i * h}" width="${x1 - x0}" height="${h + 1}" fill="${c}"/>`; });
  } else if (kind === 'stripes') {
    for (let y = y0; y < y1; y += 14) s += `<rect x="${x0}" y="${y}" width="${x1 - x0}" height="6" fill="${colors.stripe || '#1565c0'}" opacity=".85"/>`;
  } else if (kind === 'scales') {
    for (let y = y0, row = 0; y < y1; y += 9, row++)
      for (let x = x0 - 12 + (row % 2) * 6 + (SPIN_SHIFT % 12 + 12) % 12; x < x1; x += 12) s += `<path d="M${x - 6},${y} Q${x},${y + 9} ${x + 6},${y}" fill="none" stroke="${light}" stroke-width="1.6" opacity=".8"/>`;
  } else {
    let row = 0;
    for (let y = y0 + 8; y < y1; y += 22, row++) {
      for (let x = x0 - 16 + (row % 2) * 11 + (SPIN_SHIFT % 22 + 22) % 22; x < x1 + 6; x += 22) {
        if (kind === 'dots') s += `<circle cx="${x}" cy="${y}" r="3.2" fill="${light}"/>`;
        else if (kind === 'stars') s += `<path d="${starPath(x, y, 5, 2.2)}" fill="${colors.trim}"/>`;
        else if (kind === 'sparkle') s += `<path d="${starPath(x, y, 4.5, 1.2, 4)}" fill="#fff" opacity=".85"/>`;
        else if (kind === 'snow') s += `<g stroke="#fff" stroke-width="1.4" opacity=".95"><path d="M${x - 5},${y}H${x + 5}M${x},${y - 5}V${y + 5}M${x - 3.5},${y - 3.5}L${x + 3.5},${y + 3.5}M${x + 3.5},${y - 3.5}L${x - 3.5},${y + 3.5}"/></g>`;
        else if (kind === 'leaves') s += `<path d="M${x - 5},${y + 3} Q${x},${y - 8} ${x + 5},${y - 3} Q${x},${y + 8} ${x - 5},${y + 3}Z" fill="${dark}" opacity=".7"/>`;
        else if (kind === 'flowers') s += flower(x, y, 2.6, '#fff', colors.trim);
        else if (kind === 'hearts') s += `<path d="${heartPath(x, y, 3.6)}" fill="#ec407a" opacity=".8"/>`;
      }
    }
  }
  return `<clipPath id="${id}"><path d="${clipD}"/></clipPath><g clip-path="url(#${id})">${s}</g>`;
}

// ---------- shoes ----------
function shoe(sh, x, y, dir, skin) {
  const fx = x + dir * 2.5;
  const c = sh.color, a = sh.accent;
  const sole = (col, dy = 4.6) => `<ellipse cx="${fx}" cy="${y + dy}" rx="9.6" ry="5.4" fill="${col}"/>`;
  const toe = (col, extra = '') => `<ellipse cx="${fx}" cy="${y + 2.6}" rx="9.6" ry="6" fill="${col}"${extra}/>`;
  switch (sh.kind) {
    case 'crystal':
      return toe(c, ` opacity=".92" stroke="#fff" stroke-width="1.6"`) + `<path d="${starPath(fx + dir * 3.5, y + 1, 3.2, 1, 4)}" fill="#fff"/>`;
    case 'boot':
      return `<rect x="${x - 7.6}" y="${y - 36}" width="15.2" height="38" rx="5" fill="${c}"/><rect x="${x - 7.9}" y="${y - 36}" width="15.8" height="5.5" rx="2.5" fill="${a}"/>` + sole(shade(c, -0.35)) + toe(c);
    case 'fluffy':
      return `<rect x="${x - 7.8}" y="${y - 27}" width="15.6" height="29" rx="6" fill="#90caf9"/>` + sole('#64b5f6') + toe('#90caf9') +
        `<ellipse cx="${x}" cy="${y - 26}" rx="8.4" ry="4.6" fill="#fff"/><circle cx="${x - 4.5}" cy="${y - 27.5}" r="2.6" fill="#fff"/><circle cx="${x + 4.5}" cy="${y - 27}" r="2.6" fill="#fff"/>`;
    case 'sneaker':
      return sole('#ffffff', 4.8) + toe(c) + `<path d="M${fx - 4.5},${y - 0.6} H${fx + 4.5}" stroke="#ff8a80" stroke-width="1.5" stroke-linecap="round"/><path d="M${fx - 4.5},${y + 1.8} H${fx + 4.5}" stroke="#ffeb3b" stroke-width="1.5" stroke-linecap="round"/>`;
    case 'sandal':
      return `<ellipse cx="${fx}" cy="${y + 4.6}" rx="9.4" ry="3.4" fill="${c}"/><ellipse cx="${fx}" cy="${y + 2}" rx="8.4" ry="5.2" fill="${skin}"/><path d="M${fx - 5},${y + 4} L${fx},${y - 2} L${fx + 5},${y + 4}" fill="none" stroke="${c}" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>`;
    case 'ballet':
      return toe(c) + `<path d="M${x - 5},${y - 1} L${x + 5},${y - 9} M${x + 5},${y - 1} L${x - 5},${y - 9} M${x - 5},${y - 9} L${x + 5},${y - 16}" stroke="${a}" stroke-width="1.8" stroke-linecap="round"/>`;
    case 'bare':
      return `<ellipse cx="${fx}" cy="${y + 2.6}" rx="8.4" ry="5.6" fill="${skin}"/><ellipse cx="${fx + dir * 6}" cy="${y + 1}" rx="1.9" ry="1.5" fill="${shade(skin, -0.1)}"/>`;
    default:
      return sole(shade(c, -0.3)) + toe(c) + `<circle cx="${fx + dir * 1.5}" cy="${y - 0.4}" r="2.4" fill="${a}"/>`;
  }
}

// ---------- hair ----------
const HAIR_TOP = { afro: -16, spiky: -8, curly: -5, puffs: -2 };
function arcCircles(cx, cy, R, a0, a1, n, r, fill) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = (a0 + (a1 - a0) * i / (n - 1)) * Math.PI / 180;
    s += `<circle cx="${(cx + R * Math.cos(a)).toFixed(1)}" cy="${(cy + R * Math.sin(a)).toFixed(1)}" r="${r}" fill="${fill}"/>`;
  }
  return s;
}
function hairBack(style, c) {
  if (style === 'none') return '';
  const d = shade(c, -0.18);
  switch (style) {
    case 'long': return `<path d="M60,85 C54,34 146,34 140,85 C144,130 150,175 148,210 Q100,222 52,210 C50,175 56,130 60,85Z" fill="${c}"/><path d="M70,120 C70,160 68,190 66,208 M130,120 C130,160 132,190 134,208" stroke="${d}" stroke-width="2" fill="none"/>`;
    case 'wavy': return `<path d="M60,85 C54,34 146,34 140,85 Q152,108 142,130 Q156,152 144,174 Q156,196 140,214 Q100,224 60,214 Q44,196 56,174 Q44,152 58,130 Q48,108 60,85Z" fill="${c}"/>`;
    case 'bob': return `<path d="M57,90 C52,34 148,34 143,90 L146,130 Q100,140 54,130Z" fill="${c}"/>`;
    case 'afro': return `<circle cx="100" cy="74" r="57" fill="${c}"/>` + arcCircles(100, 74, 54, 0, 360, 18, 10, c);
    case 'puffs': return `<circle cx="58" cy="50" r="25" fill="${c}"/><circle cx="142" cy="50" r="25" fill="${c}"/><path d="M62,88 C56,38 144,38 138,88Z" fill="${c}"/>`;
    case 'bun': return `<circle cx="100" cy="34" r="21" fill="${c}"/><path d="M90,30 Q100,22 110,30" stroke="${d}" stroke-width="2" fill="none"/><path d="M62,88 C56,38 144,38 138,88Z" fill="${c}"/>`;
    case 'ponytail': return `<path d="M124,52 Q178,70 160,180 Q150,150 140,130 Q150,95 120,70Z" fill="${c}"/><path d="M62,88 C56,38 144,38 138,88Z" fill="${c}"/><circle cx="128" cy="58" r="6" fill="#ec407a"/>`;
    case 'braids': return `<path d="M62,90 C56,38 144,38 138,90Z" fill="${c}"/>`;
    case 'longbraid': {
      let b = `<path d="M60,85 C54,34 146,34 140,85 C144,110 146,130 140,140 Q100,150 60,140 C54,130 56,110 60,85Z" fill="${c}"/>`;
      const pts = [];
      for (let i = 0; i <= 22; i++) { const t = i / 22; pts.push([136 + 26 * Math.sin(t * 2.4) + t * 18, 110 + t * 222]); }
      pts.push([178, 336], [192, 330], [200, 318]);
      pts.forEach(([x, y], i) => { b += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${Math.max(6, 11 - i * 0.2).toFixed(1)}" ry="8" fill="${i % 2 ? c : shade(c, -0.08)}"/>`; });
      [[150, 160, '#f48fb1'], [164, 220, '#ce93d8'], [168, 280, '#fff59d'], [190, 330, '#81d4fa']].forEach(([x, y, f]) => { b += flower(x, y, 3.4, f, '#fff'); });
      return b;
    }
    case 'curly': return `<path d="M62,86 C58,40 142,40 138,86Z" fill="${c}"/>` + arcCircles(100, 78, 38, 180, 360, 11, 11, c);
    case 'spiky': case 'short': case 'pixie':
    default: return `<path d="M61,90 C56,38 144,38 139,90 Q100,76 61,90Z" fill="${c}"/>`;
  }
}
function hairFront(style, c) {
  if (style === 'none') return '';
  const d = shade(c, -0.18), l = shade(c, 0.25);
  const sweep = `<path d="M62.7,92 A38.5,40 0 1 1 137.3,92 C134,72 124,62 110,58 C100,68 82,72 70,72 C66,78 64,85 62.7,92Z" fill="${c}"/><path d="M106,48 Q90,52 80,62" stroke="${l}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`;
  const part = `<path d="M62.7,92 A38.5,40 0 1 1 137.3,92 C134,70 120,58 100,56 C80,58 66,70 62.7,92Z" fill="${c}"/><path d="M100,43 L100,57" stroke="${d}" stroke-width="2"/>`;
  switch (style) {
    case 'long': case 'wavy': case 'ponytail': case 'longbraid': return sweep;
    case 'bob': return `<path d="M62.3,90 A38.5,40 0 1 1 137.7,90 L136,74 Q100,64 64,74Z" fill="${c}"/>`;
    case 'bun': case 'puffs': return part;
    case 'braids': return part + braidSide(c, -1) + braidSide(c, 1);
    case 'afro': return arcCircles(100, 82, 38, 200, 340, 9, 10, c);
    case 'curly': return arcCircles(100, 80, 34, 195, 345, 8, 9, c);
    case 'short': return `<path d="M61.6,84 A38.5,40 0 1 1 138.4,84 Q134,64 120,60 Q104,70 88,63 Q72,64 61.6,84Z" fill="${c}"/><rect x="62" y="78" width="6" height="16" rx="3" fill="${c}"/><rect x="132" y="78" width="6" height="16" rx="3" fill="${c}"/>`;
    case 'spiky': return `<path d="M62,86 L58,56 L72,60 L72,38 L88,50 L96,28 L106,46 L122,32 L124,52 L140,50 L138,86 Q132,64 100,62 Q72,64 62,86Z" fill="${c}"/>`;
    case 'pixie': return `<path d="M61.8,86 A38.5,40 0 1 1 138.4,80 Q138,62 124,56 Q118,74 88,74 Q70,74 61.8,86Z" fill="${c}"/><path d="M120,48 Q100,58 84,64" stroke="${l}" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;
  }
  return sweep;
}

function braidSide(c, side) {
  const d = shade(c, -0.18);
  let s = '';
  for (let i = 0; i < 7; i++) {
    const x = 100 + side * (37 - i * 0.6), y = 98 + i * 14;
    s += `<ellipse cx="${x}" cy="${y}" rx="9" ry="9" fill="${c}"/><path d="M${x - 7},${y - 2} Q${x},${y + 6} ${x + 7},${y - 2}" stroke="${d}" stroke-width="1.5" fill="none"/>`;
  }
  return s + `<circle cx="${100 + side * 33}" cy="${196}" r="5" fill="#ec407a"/><path d="M${100 + side * 33 - 4},200 l-2,12 M${100 + side * 33 + 4},200 l2,12" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
}

// What the head looks like from behind, shown in the middle of a spin.
function hairBackView(style, c) {
  const d = shade(c, -0.18), l = shade(c, 0.2);
  let s = hairBack(style, c) + `<ellipse cx="100" cy="82" rx="38.5" ry="40" fill="${c}"/>`;
  if (['short', 'spiky', 'pixie', 'curly'].includes(style)) s += `<path d="M66,100 Q100,124 134,100 L134,108 Q100,128 66,108Z" fill="${d}" opacity=".5"/>`;
  s += `<path d="M100,46 Q96,80 100,118" stroke="${d}" stroke-width="2" fill="none" opacity=".6"/><path d="M84,56 Q80,80 84,108 M116,56 Q120,80 116,108" stroke="${l}" stroke-width="2.4" fill="none" opacity=".55"/>`;
  if (style === 'afro') s += arcCircles(100, 82, 38, 0, 360, 16, 10, c);
  if (style === 'curly') s += arcCircles(100, 84, 34, 0, 360, 14, 9, c);
  return s;
}

// ---------- hats ----------
function hat(id, off) {
  const y = off;
  const gold = '#ffc93c', goldD = '#e0a100';
  let s = '';
  switch (id) {
    case 'tiara': s = `<path d="M78,52 Q100,38 122,52 L118,57 Q100,46 82,57Z" fill="${gold}"/><path d="M93,46 L100,30 L107,46Z" fill="${gold}"/><circle cx="100" cy="42" r="3.4" fill="#ec407a"/><circle cx="86" cy="49" r="2.5" fill="#4fc3f7"/><circle cx="114" cy="49" r="2.5" fill="#4fc3f7"/>`; break;
    case 'crown': s = `<path d="M72,52 L70,20 L86,36 L100,14 L114,36 L130,20 L128,52Z" fill="${gold}" stroke="${goldD}" stroke-width="2"/><rect x="71" y="44" width="58" height="9" rx="3" fill="${goldD}"/><circle cx="100" cy="48" r="4" fill="#e53935"/><circle cx="84" cy="48" r="3" fill="#43a047"/><circle cx="116" cy="48" r="3" fill="#1e88e5"/><circle cx="100" cy="14" r="3.5" fill="#fff"/><circle cx="70" cy="20" r="3" fill="#fff"/><circle cx="130" cy="20" r="3" fill="#fff"/>`; break;
    case 'princecrown': s = `<path d="M76,50 L76,28 L88,38 L100,24 L112,38 L124,28 L124,50Z" fill="${gold}" stroke="${goldD}" stroke-width="2"/><rect x="75" y="44" width="50" height="8" rx="2" fill="#c62828"/><circle cx="100" cy="48" r="3" fill="#fff"/>`; break;
    case 'flowers': {
      const cols = ['#f48fb1', '#fff176', '#ce93d8', '#ffffff', '#ff8a65', '#81d4fa', '#f48fb1'];
      for (let i = 0; i < 7; i++) {
        const a = (200 + i * 23.3) * Math.PI / 180, x = 100 + 42 * Math.cos(a), yy = 80 + 38 * Math.sin(a);
        s += `<ellipse cx="${(x + 5).toFixed(1)}" cy="${(yy + 3).toFixed(1)}" rx="6" ry="3" fill="#66bb6a"/>` + flower(+x.toFixed(1), +yy.toFixed(1), 4, cols[i], '#ffd54f');
      }
      break;
    }
    case 'snow': s = `<path d="M78,52 Q100,40 122,52 L118,56 Q100,46 82,56Z" fill="#e3f2fd" stroke="#90caf9"/>` + [[84, 44, 6], [100, 34, 10], [116, 44, 6]].map(([x, yy, r]) => `<g stroke="#bbdefb" stroke-width="2.2" stroke-linecap="round"><path d="M${x - r},${yy}H${x + r}M${x - r / 2},${yy - r * .86}L${x + r / 2},${yy + r * .86}M${x + r / 2},${yy - r * .86}L${x - r / 2},${yy + r * .86}"/></g><circle cx="${x}" cy="${yy}" r="2" fill="#fff"/>`).join(''); break;
    case 'star': s = `<path d="M66,70 C66,36 134,36 134,70" stroke="#ab47bc" stroke-width="5" fill="none"/><path d="${starPath(122, 40, 15, 7)}" fill="#ffd54f" stroke="#ffb300" stroke-width="2"/>`; break;
    case 'bow': s = `<path d="M118,46 L100,32 L102,58Z" fill="#ec407a"/><path d="M118,46 L138,30 L136,60Z" fill="#ec407a"/><circle cx="118" cy="46" r="6" fill="#ad1457"/>`; break;
    case 'cone': s = `<path d="M94,48 Q130,0 110,-24 Q118,10 126,46Z" fill="#f8bbd0" opacity=".6"/><path d="M80,50 L104,-22 L122,48Z" fill="#f48fb1"/><path d="M83,42 L119,40 L121,48 L80,50Z" fill="#ffd54f"/><circle cx="104" cy="-22" r="4" fill="#fff59d"/><path d="${starPath(100, 18, 4, 1.6)}" fill="#fff"/><path d="${starPath(108, 30, 3, 1.2)}" fill="#fff"/>`; break;
    case 'beret': s = `<ellipse cx="94" cy="46" rx="40" ry="15" fill="#2e7d32"/><path d="M58,52 Q94,62 132,50" stroke="#1b5e20" stroke-width="4" fill="none"/><path d="M118,42 Q150,10 160,6 Q144,26 122,46Z" fill="#ef5350"/><path d="M120,44 Q140,24 158,8" stroke="#b71c1c" stroke-width="1.5" fill="none"/>`; break;
    case 'wizard': s = `<ellipse cx="100" cy="50" rx="48" ry="10" fill="#4527a0"/><path d="M70,50 Q90,-8 112,-24 Q118,8 130,50Z" fill="#5e35b1"/><path d="${starPath(98, 22, 6, 2.5)}" fill="#ffd54f"/><path d="${starPath(112, 38, 4, 1.6)}" fill="#ffd54f"/><circle cx="86" cy="40" r="2" fill="#fff59d"/>`; break;
    case 'bunny': s = `<path d="M66,70 C66,38 134,38 134,70" stroke="#fff" stroke-width="5" fill="none"/><ellipse cx="82" cy="18" rx="9" ry="28" fill="#fff" transform="rotate(-12 82 18)"/><ellipse cx="82" cy="20" rx="4.5" ry="20" fill="#f8bbd0" transform="rotate(-12 82 20)"/><ellipse cx="118" cy="18" rx="9" ry="28" fill="#fff" transform="rotate(12 118 18)"/><ellipse cx="118" cy="20" rx="4.5" ry="20" fill="#f8bbd0" transform="rotate(12 118 20)"/>`; break;
    case 'cat': s = `<path d="M66,70 C66,38 134,38 134,70" stroke="#212121" stroke-width="5" fill="none"/><path d="M70,52 L72,22 L94,42Z" fill="#212121"/><path d="M76,46 L77,30 L88,41Z" fill="#f48fb1"/><path d="M130,52 L128,22 L106,42Z" fill="#212121"/><path d="M124,46 L123,30 L112,41Z" fill="#f48fb1"/>`; break;
    case 'beanie': s = `<circle cx="100" cy="17" r="9.5" fill="#f5f5f5"/><circle cx="97" cy="14" r="3" fill="#fff"/><path d="M61,60 C59,14 141,14 139,60Z" fill="#2e7d32"/><path d="M70,40 Q100,30 130,40 M64,51 Q100,41 136,51" stroke="#43a047" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M84,24 Q82,40 84,56 M100,22 V56 M116,24 Q118,40 116,56" stroke="#276a2b" stroke-width="1.6" fill="none" opacity=".6"/><rect x="59" y="54" width="82" height="13" rx="6" fill="#1b5e20"/><path d="M66,60.5 H134" stroke="#66bb6a" stroke-width="2" stroke-dasharray="3 3"/>`; break;
    case 'shell': s = `<g transform="translate(128 58) rotate(20)"><path d="M-12,6 Q0,-18 12,6Z" fill="#ffab91"/><path d="M0,6 L0,-10 M-6,6 L-3,-8 M6,6 L3,-8" stroke="#ff7043" stroke-width="1.5"/><circle cx="0" cy="8" r="3" fill="#fff"/></g><circle cx="76" cy="58" r="3" fill="#fff"/><circle cx="70" cy="66" r="2.4" fill="#fff"/>`; break;
    default: return '';
  }
  return `<g transform="translate(0 ${y})">${s}</g>`;
}

// ---------- items held in the right hand ----------
function item(id, x, y) {
  switch (id) {
    case 'wand': return `<path d="M${x},${y + 8} L${x + 2},${y - 40}" stroke="#ffd54f" stroke-width="3.5" stroke-linecap="round"/><path d="${starPath(x + 2, y - 48, 12, 5)}" fill="#fff176" stroke="#ffb300" stroke-width="2"/><circle cx="${x + 14}" cy="${y - 60}" r="2" fill="#fff"/><circle cx="${x - 10}" cy="${y - 58}" r="1.6" fill="#fff"/>`;
    case 'bouquet': return `<path d="M${x - 4},${y - 22} L${x},${y + 10} L${x + 4},${y - 22}" stroke="#43a047" stroke-width="2.5" fill="none"/><path d="M${x - 8},${y - 6} L${x},${y + 6} L${x + 8},${y - 6}Z" fill="#fff"/>` + flower(x - 8, y - 26, 4, '#f48fb1', '#fff176') + flower(x + 8, y - 26, 4, '#ce93d8', '#fff176') + flower(x, y - 36, 4.5, '#ff8a65', '#fff176') + `<circle cx="${x + 13}" cy="${y - 38}" r="3" fill="#fff"/>`;
    case 'fan': return `<path d="M${x},${y} L${x - 26},${y - 26} A37,37 0 0 1 ${x + 26},${y - 26} Z" fill="#f48fb1" stroke="#ad1457" stroke-width="1.5"/><path d="M${x},${y} L${x - 14},${y - 34} M${x},${y} L${x},${y - 37} M${x},${y} L${x + 14},${y - 34}" stroke="#ad1457" stroke-width="1.2"/>` + flower(x, y - 24, 3, '#fff', '#ffd54f');
    case 'mic': return `<rect x="${x - 3}" y="${y - 16}" width="6" height="26" rx="3" fill="#424242"/><circle cx="${x}" cy="${y - 22}" r="8" fill="#bdbdbd" stroke="#757575" stroke-width="1.5"/><path d="M${x - 6},${y - 24} H${x + 6} M${x - 6},${y - 20} H${x + 6}" stroke="#9e9e9e"/>`;
    case 'ribbon': return `<path d="M${x},${y + 8} L${x},${y - 30}" stroke="#8d6e63" stroke-width="3" stroke-linecap="round"/><path class="ribbon-wave" d="M${x},${y - 30} C${x + 30},${y - 60} ${x + 40},${y - 10} ${x + 64},${y - 40} C${x + 80},${y - 60} ${x + 90},${y - 20} ${x + 100},${y - 36}" stroke="#ec407a" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    case 'balloon': return `<path d="M${x},${y} Q${x + 16},${y - 44} ${x + 36},${y - 82}" stroke="#757575" stroke-width="1.2" fill="none"/><path d="${heartPath(x + 36, y - 106, 16)}" fill="#ff5252"/><ellipse cx="${x + 28}" cy="${y - 110}" rx="3" ry="5" fill="#fff" opacity=".7"/>`;
    case 'teddy': return `<g transform="translate(${x} ${y - 14})"><circle cx="-9" cy="-14" r="5" fill="#a1887f"/><circle cx="9" cy="-14" r="5" fill="#a1887f"/><ellipse cx="0" cy="10" rx="12" ry="14" fill="#a1887f"/><circle cx="0" cy="-6" r="11" fill="#a1887f"/><ellipse cx="0" cy="-2" rx="5" ry="4" fill="#d7ccc8"/><circle cx="-4" cy="-8" r="1.6" fill="#3e2723"/><circle cx="4" cy="-8" r="1.6" fill="#3e2723"/><circle cx="0" cy="-3" r="1.6" fill="#3e2723"/><path d="M-5,4 L5,4" stroke="#e53935" stroke-width="3"/></g>`;
    case 'lantern': return `<path d="M${x},${y} L${x},${y + 16}" stroke="#5d4037" stroke-width="2"/><rect x="${x - 11}" y="${y + 14}" width="22" height="6" rx="2" fill="#5d4037"/><rect x="${x - 9}" y="${y + 20}" width="18" height="24" rx="4" fill="#fff59d" stroke="#5d4037" stroke-width="2"/><ellipse cx="${x}" cy="${y + 32}" rx="5" ry="7" fill="#ffb300"/><rect x="${x - 11}" y="${y + 44}" width="22" height="5" rx="2" fill="#5d4037"/>`;
    case 'parasol': return `<path d="M${x},${y + 10} L${x},${y - 60}" stroke="#795548" stroke-width="2.5"/><path d="M${x - 42},${y - 56} Q${x},${y - 104} ${x + 42},${y - 56} Q${x + 28},${y - 64} ${x + 14},${y - 56} Q${x},${y - 64} ${x - 14},${y - 56} Q${x - 28},${y - 64} ${x - 42},${y - 56}Z" fill="#f8bbd0" stroke="#ec407a" stroke-width="2"/><path d="M${x + 4},${y + 10} q0,8 -6,8" stroke="#795548" stroke-width="2.5" fill="none"/>`;
    case 'sword': return `<path d="M${x - 3},${y - 8} L${x - 3},${y - 62} L${x},${y - 70} L${x + 3},${y - 62} L${x + 3},${y - 8}Z" fill="#e0e0e0" stroke="#9e9e9e"/><rect x="${x - 12}" y="${y - 10}" width="24" height="5" rx="2" fill="#ffc93c"/><rect x="${x - 2.5}" y="${y - 6}" width="5" height="14" fill="#8d6e63"/><circle cx="${x}" cy="${y + 9}" r="3.5" fill="#ffc93c"/>`;
    case 'book': return `<g transform="translate(${x} ${y - 8}) rotate(-10)"><rect x="-14" y="-16" width="28" height="34" rx="3" fill="#7e57c2"/><rect x="-11" y="-13" width="22" height="28" rx="2" fill="#9575cd"/><path d="${starPath(0, 0, 7, 3)}" fill="#ffd54f"/></g>`;
    case 'cupcake': return `<path d="M${x - 11},${y - 6} L${x - 8},${y + 12} L${x + 8},${y + 12} L${x + 11},${y - 6}Z" fill="#4fc3f7"/><path d="M${x - 13},${y - 6} Q${x - 14},${y - 18} ${x - 4},${y - 20} Q${x},${y - 30} ${x + 6},${y - 20} Q${x + 15},${y - 18} ${x + 13},${y - 6}Z" fill="#f8bbd0"/><circle cx="${x}" cy="${y - 28}" r="4" fill="#e53935"/><circle cx="${x - 5}" cy="${y - 12}" r="1.3" fill="#fff59d"/><circle cx="${x + 5}" cy="${y - 14}" r="1.3" fill="#81d4fa"/>`;
    case 'iceaxe': return `<path d="M${x},${y + 14} L${x},${y - 58}" stroke="#8d6e63" stroke-width="4" stroke-linecap="round"/><path d="M${x - 16},${y - 54} Q${x - 4},${y - 64} ${x + 2},${y - 60} L${x + 14},${y - 62} L${x + 2},${y - 54} Q${x - 4},${y - 58} ${x - 16},${y - 54}Z" fill="#b0bec5" stroke="#78909c" stroke-width="1.3" stroke-linejoin="round"/><rect x="${x - 3}" y="${y - 2}" width="6" height="10" rx="2" fill="#5d4037"/>`;
    case 'mirror': return `<rect x="${x - 2.5}" y="${y - 12}" width="5" height="22" rx="2" fill="#ffc93c"/><ellipse cx="${x}" cy="${y - 28}" rx="13" ry="16" fill="#ffc93c"/><ellipse cx="${x}" cy="${y - 28}" rx="9.5" ry="12.5" fill="#b3e5fc"/><path d="M${x - 4},${y - 34} L${x + 2},${y - 24}" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>`;
  }
  return '';
}

// ---------- cape ----------
function cape(id) {
  const c = byId(CAPES, id);
  if (!c || c.id === 'none') return '';
  const d = 'M80,134 Q100,140 120,134 L194,318 Q100,338 6,318Z';
  let s = `<path d="${d}" fill="${c.color}"/>`;
  if (c.rainbow) s += patternFill('rainbow', d, { main: c.color }, [4, 130, 196, 340]);
  if (c.stars) s += patternFill('stars', d, { main: c.color, trim: c.trim }, [4, 130, 196, 340]);
  s += `<path d="M6,318 Q100,338 194,318" stroke="${c.trim}" stroke-width="6" fill="none"/>`;
  return s;
}
function capeCollar(id) {
  const c = byId(CAPES, id);
  if (!c || c.id === 'none') return '';
  if (c.ermine) return `<path d="M76,132 Q100,152 124,132 L126,142 Q100,162 74,142Z" fill="#fff"/><circle cx="88" cy="144" r="1.8" fill="#212121"/><circle cx="100" cy="150" r="1.8" fill="#212121"/><circle cx="112" cy="144" r="1.8" fill="#212121"/>`;
  return `<path d="M78,132 Q100,146 122,132" stroke="${c.trim}" stroke-width="5" fill="none"/><circle cx="100" cy="142" r="4" fill="#ffc93c"/>`;
}

// ---------- body / outfit ----------
function outfitParts(o, skin) {
  const top = o.top || o.main, trim = o.trim;
  const colors = { main: o.main, trim, stripe: o.type === 'explorer' ? o.main : undefined };
  const legCol = o.pants ? o.pants : (o.legs && o.legs !== 'skin' ? o.legs : skin);
  let skirt = '', torso = '', over = '';
  const bodice = 'M80,140 Q90,133 100,141 Q110,133 120,140 L114,196 Q100,200 86,196Z';
  const chest = `<path d="M84,126 L116,126 L120,142 L80,142Z" fill="${skin}"/>`;
  const sash = `<path d="M85,189 Q100,194 115,189 L115,198 Q100,203 85,198Z" fill="${trim}"/>`;
  if (o.type === 'gown') {
    const d = 'M85,190 C70,232 40,282 24,318 Q100,340 176,318 C160,282 130,232 115,190Z';
    skirt = `<path d="${d}" fill="${o.main}"/>` + patternFill(o.pattern, d, colors, [20, 188, 180, 340]);
    if (o.panel) skirt += `<path d="M92,194 Q84,262 76,330 Q100,336 124,330 Q116,262 108,194Z" fill="${o.panel}" opacity=".9"/>`;
    skirt += `<path d="M100,200 L100,330 M91,198 Q72,262 60,326 M109,198 Q128,262 140,326" stroke="${shade(o.main, -0.15)}" stroke-width="2" fill="none" opacity=".45"/>`;
    skirt += `<path d="M24,318 Q100,340 176,318" stroke="${trim}" stroke-width="7" fill="none" stroke-linecap="round"/>`;
    torso = chest + `<path d="${bodice}" fill="${top}"/>` + patternFill(o.pattern === 'rainbow' ? 'sparkle' : 'none', bodice, colors, [78, 130, 122, 200]) + sash;
  } else if (o.type === 'dress') {
    const d = 'M86,190 Q62,226 50,262 Q100,276 150,262 Q138,226 114,190Z';
    skirt = `<path d="${d}" fill="${o.main}"/>` + patternFill(o.pattern, d, colors, [46, 188, 154, 280]) + `<path d="M50,262 Q100,276 150,262" stroke="${trim}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    torso = chest + `<path d="${bodice}" fill="${top}"/>` + sash;
  } else if (o.type === 'mermaid') {
    const d = 'M86,190 C82,236 88,272 92,296 Q70,318 52,334 Q100,346 148,334 Q130,318 108,296 C112,272 118,236 114,190Z';
    skirt = `<path d="${d}" fill="${o.main}"/>` + patternFill('scales', d, colors, [50, 188, 150, 346]) + `<path d="M92,296 Q70,318 52,334 Q100,346 148,334 Q130,318 108,296Z" fill="${trim}" opacity=".55"/>`;
    torso = chest + `<path d="${bodice}" fill="${top}"/>` + `<path d="M84,152 Q92,160 100,152 Q108,160 116,152" stroke="${trim}" stroke-width="3" fill="none"/>` + sash;
  } else if (o.type === 'tunic') {
    const d = 'M79,133 Q100,128 121,133 L124,230 Q100,238 76,230Z';
    torso = `<path d="${d}" fill="${o.main}"/><path d="M90,132 L100,150 L110,132" fill="${shade(o.main, 0.35)}"/><path d="M100,150 L100,230" stroke="${trim}" stroke-width="3"/><rect x="77" y="194" width="46" height="9" fill="#5d4037"/><rect x="95" y="192" width="10" height="13" rx="2" fill="${trim}"/><path d="M76,230 Q100,238 124,230" stroke="${trim}" stroke-width="4" fill="none"/>`;
  } else if (o.type === 'coat') {
    torso = `<path d="M84,196 L72,280 L96,272 L100,214 L104,272 L128,280 L116,196Z" fill="${shade(o.main, -0.12)}"/><path d="M79,133 Q100,128 121,133 L124,226 Q100,232 76,226Z" fill="${o.main}"/><path d="M90,132 L100,170 L110,132Z" fill="#fff"/><path d="M90,132 L96,170 L86,170Z M110,132 L104,170 L114,170Z" fill="${trim}"/>` +
      [178, 192, 206].map(y => `<circle cx="100" cy="${y}" r="3" fill="${trim}"/>`).join('') + `<path d="M84,138 L120,200" stroke="${shade(o.main === '#fff3e0' ? '#1e88e5' : '#1e88e5', 0)}" stroke-width="6" opacity=".9"/>`;
  } else if (o.type === 'explorer') {
    const shirt = 'M79,133 Q100,128 121,133 L122,222 Q100,228 78,222Z';
    torso = `<path d="${shirt}" fill="${top}"/>` + patternFill(o.pattern, shirt, colors, [76, 128, 124, 230]) + `<path d="M79,133 L94,136 L92,222 L78,222Z M121,133 L106,136 L108,222 L122,222Z" fill="${o.main}"/><rect x="78" y="200" width="44" height="8" fill="${trim}"/><path d="M92,134 L100,146 L108,134" stroke="${shade(top, -0.2)}" stroke-width="2" fill="none"/>`;
  } else if (o.type === 'pajamas') {
    const shirt = 'M79,133 Q100,128 121,133 L123,220 Q100,226 77,220Z';
    torso = `<path d="${shirt}" fill="${o.main}"/>` + patternFill(o.pattern, shirt, colors, [76, 128, 124, 228]) + `<path d="M90,132 Q100,142 110,132" stroke="${trim}" stroke-width="4" fill="none"/>` + [158, 178, 198].map(y => `<circle cx="100" cy="${y}" r="2.6" fill="${trim}"/>`).join('');
  }
  if (o.pants && o.pattern && o.type === 'pajamas') over = 'pjlegs';
  return { skirt, torso, legCol, over, colors };
}

// A hand hanging at the end of the arm. inward = which way the thumb points (toward the body).
function hand(hx, hy, skin, inward, holding, held) {
  // Drawn pointing down, thumb toward the body (+x before mirroring by `inward`).
  const line = shade(skin, -0.3), crease = shade(skin, -0.16);
  const T = `transform="translate(${hx} ${hy}) scale(${inward} 1)"`;
  if (!holding) {
    // relaxed open hand: palm, four fingers held together, thumb resting beside them
    const edge = 'M-5.4,-7 C-5.9,-2 -6.3,3.5 -5.7,7.6 C-5.1,11.6 -2.9,13.8 -0.4,13.8 C2.3,13.8 4.2,12.1 4.6,9.2 L4.8,5.6 C6.9,5 8.1,2.6 7.5,0.2 C7.1,-1.6 5.8,-2.6 5.2,-3.2 L5.4,-7';
    return `<g ${T}><path d="${edge}Z" fill="${skin}"/><path d="M-5.95,-2.2 C-6.3,3 -6.3,4.6 -5.7,7.6 C-5.1,11.6 -2.9,13.8 -0.4,13.8 C2.3,13.8 4.2,12.1 4.6,9.2 L4.8,5.6 C6.9,5 8.1,2.6 7.5,0.2 C7.1,-1.6 5.8,-2.6 5.2,-3.2" fill="none" stroke="${line}" stroke-width=".75" stroke-linecap="round"/>` +
      `<path d="M-2.9,7.2 Q-3,10 -2.6,12.4 M-0.4,7.6 V13 M2,7.4 Q2.1,10 1.9,12.2" stroke="${crease}" stroke-width=".6" stroke-linecap="round" fill="none"/>` +
      `<path d="M4.7,5.4 Q3.6,2.6 4.4,-0.4" stroke="${crease}" stroke-width=".65" stroke-linecap="round" fill="none"/></g>`;
  }
  // closed hand around the handle: item behind, fingers curled over the front, thumb on top
  const fist = 'M-5.4,-7 C-6.6,-2.5 -6.9,4.5 -5.9,8.2 C-5,10.9 4.8,11.2 5.8,8.4 C6.9,4.6 6.6,-2.6 5.4,-7';
  return `${held}<g ${T}><path d="${fist}Z" fill="${skin}"/><path d="M-6.35,-2.5 C-6.9,2 -6.8,5.5 -5.9,8.2 C-5,10.9 4.8,11.2 5.8,8.4 C6.9,4.6 6.7,0 6.3,-2.5" fill="none" stroke="${line}" stroke-width=".75" stroke-linecap="round"/>` +
    `<path d="M-5.6,0.6 Q-2.6,1.8 0.6,0.8 M-5.7,3.6 Q-2.6,4.8 0.6,3.8 M-5.4,6.6 Q-2.6,7.8 0.4,6.8" stroke="${crease}" stroke-width=".65" stroke-linecap="round" fill="none"/>` +
    `<path d="M5.9,-3.2 C3.6,-4.8 -0.6,-3.6 -1.8,-1.4 C-1,0.2 3.2,0 6.2,0.6Z" fill="${skin}" stroke="${line}" stroke-width=".7" stroke-linejoin="round"/></g>`;
}

function arm(side, o, skin, itemId) {
  const L = side === 'L';
  const sx = L ? 80 : 120, hx = L ? 72 : 128, sy = 140, hy = 201;
  const sl = o.sleeve, col = o.top || o.main, tr = o.trim;
  let s = `<path d="M${sx},${sy} L${hx},${hy - 2}" stroke="${skin}" stroke-width="11" stroke-linecap="round"/>`;
  if (sl === 'long' || sl === 'epaulette') {
    s += `<path d="M${sx},${sy} L${hx + (L ? 0.8 : -0.8)},${hy - 8}" stroke="${col}" stroke-width="14" stroke-linecap="round"/><circle cx="${hx + (L ? 0.9 : -0.9)}" cy="${hy - 8}" r="7.2" fill="${tr}"/>`;
    if (sl === 'epaulette') s += `<ellipse cx="${sx}" cy="${sy - 2}" rx="10" ry="6" fill="${tr}"/><path d="M${sx - 8},${sy + 2} v6 M${sx - 4},${sy + 3} v7 M${sx},${sy + 3} v7 M${sx + 4},${sy + 3} v7 M${sx + 8},${sy + 2} v6" stroke="${tr}" stroke-width="2"/>`;
  } else if (sl === 'puff') {
    s += `<ellipse cx="${sx + (L ? -1 : 1)}" cy="${sy + 3}" rx="12.5" ry="11" fill="${col}"/><path d="M${sx - 10},${sy + 10} Q${sx},${sy + 16} ${sx + 10},${sy + 10}" stroke="${tr}" stroke-width="3" fill="none"/>`;
  } else if (sl === 'short') {
    s += `<path d="M${sx},${sy} L${sx + (hx - sx) * 0.35},${sy + (hy - sy) * 0.35}" stroke="${col}" stroke-width="15" stroke-linecap="round"/>`;
  } else if (sl === 'cap') {
    s += `<ellipse cx="${sx}" cy="${sy + 1}" rx="10" ry="7" fill="${tr}" opacity=".9"/>`;
  }
  const holding = !L && itemId && itemId !== 'none';
  if (holding) s += hand(hx, hy, skin, L ? 1 : -1, true, item(itemId, hx, hy - 2));
  else s += hand(hx, hy, skin, L ? 1 : -1, false, '');
  return `<g class="p-arm${side}">${s}</g>`;
}

function twigArm(side, itemId) {
  const L = side === 'L', dir = L ? -1 : 1;
  const sx = L ? 70 : 130, sy = 150, hx = L ? 72 : 128, hy = 201;
  const ex = sx + dir * 14, ey = 176; // elbow bend
  const tw = '#6d4c41';
  let s = `<path d="M${sx},${sy} L${ex},${ey} L${hx},${hy - 4}" stroke="${tw}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  s += `<path d="M${ex - dir * 2},${ey - 6} l${dir * 9},-6" stroke="${tw}" stroke-width="2.6" stroke-linecap="round"/>`;
  const holding = !L && itemId && itemId !== 'none';
  if (holding) s = s + item(itemId, hx, hy - 2) + `<path d="M${hx - 5},${hy - 4} Q${hx},${hy - 7} ${hx + 5},${hy - 3} M${hx - 5},${hy + 1} Q${hx},${hy - 2} ${hx + 5},${hy + 2}" stroke="${tw}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  else s += `<path d="M${hx},${hy - 4} l${dir * -4},9 M${hx},${hy - 4} l0,10 M${hx},${hy - 4} l${dir * 5},8" stroke="${tw}" stroke-width="2.4" stroke-linecap="round"/>`;
  return `<g class="p-arm${side}">${s}</g>`;
}

function face(st, yaw = 0) {
  const sk = st.skinColor, eye = st.eyes;
  const blush = shade('#ff8a80', 0.25);
  const ear = x0 => { const { x, k } = featureAt(x0, yaw); return { x, k, svg: `<ellipse cx="${x.toFixed(2)}" cy="88" rx="${(7 * Math.max(0.45, Math.abs(k) + 0.3)).toFixed(2)}" ry="7.4" fill="${sk}"/><ellipse cx="${x.toFixed(2)}" cy="88" rx="${(3 * Math.max(0.3, Math.abs(k))).toFixed(2)}" ry="3.6" fill="${shade(sk, -0.12)}"/>` }; };
  const snow = st.kind === 'snowman';
  const ears = snow ? [] : [ear(64), ear(136)];
  let s = ears.filter(e => e.k <= 0.02).map(e => e.svg).join('');
  s += `<ellipse cx="100" cy="${HEAD_CY}" rx="${HEAD_R}" ry="37" fill="${sk}"/>`;
  s += ears.filter(e => e.k > 0.02).map(e => e.svg).join('');
  const sn = Math.sin(yaw * Math.PI / 180), cs = Math.cos(yaw * Math.PI / 180);
  if (!snow && Math.abs(sn) > 0.55 && cs > -0.3) { // a little nose and chin on the side view
    const x = 100 + Math.sign(sn) * (HEAD_R - 1);
    s += `<ellipse cx="${x.toFixed(1)}" cy="98" rx="4" ry="3.6" fill="${sk}"/>`;
  }
  let f = '';
  f += placed(79, yaw, `<ellipse cx="79" cy="101" rx="7" ry="4.5" fill="${blush}" opacity=".55"/>`);
  f += placed(121, yaw, `<ellipse cx="121" cy="101" rx="7" ry="4.5" fill="${blush}" opacity=".55"/>`);
  const bc = shade(st.hairColor, -0.25);
  let eyes = '';
  for (const x of [86, 114]) {
    let e = `<ellipse cx="${x}" cy="89" rx="6.6" ry="8.6" fill="#2a1a14"/><ellipse cx="${x}" cy="90.5" rx="5" ry="6.2" fill="${eye}"/><circle cx="${x}" cy="91" r="2.6" fill="#1a0f0b"/><circle cx="${x + 2.4}" cy="86" r="2.4" fill="#fff"/><circle cx="${x - 2.2}" cy="93.5" r="1.1" fill="#fff"/>`;
    if (st.lashes) { const o = x < 100 ? -1 : 1; e += `<path d="M${x + o * 5},${83} l${o * 4},-3 M${x + o * 6.3},${86} l${o * 4.5},-1.5" stroke="#2a1a14" stroke-width="1.8" stroke-linecap="round"/>`; }
    e += `<path d="M${x - 7},${x < 100 ? 76 : 75} Q${x},${72} ${x + 7},${x < 100 ? 75 : 76}" stroke="${bc}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    eyes += placed(x, yaw, e, 0.18);
  }
  f += `<g class="p-eyes">${eyes}</g>`;
  if (snow) {
    f += placed(100, yaw, [90, 95, 100, 105, 110].map((x, i) => `<circle cx="${x}" cy="${108 + [0, 2.6, 3.4, 2.6, 0][i]}" r="2.2" fill="#37474f"/>`).join(''), 0.2);
    // carrot nose, pointing out toward the side she is turned to
    const { x, k } = featureAt(100, yaw), dir = sn >= 0 ? 1 : -1, len = 10 + 12 * Math.abs(sn);
    if (k > -0.2) f += `<path d="M${(x - 4).toFixed(1)},96 L${(x + dir * len).toFixed(1)},100 L${(x - 3).toFixed(1)},103 Q${(x - 6).toFixed(1)},99.5 ${(x - 4).toFixed(1)},96Z" fill="#ff8a3d" stroke="#e8691d" stroke-width="1" stroke-linejoin="round"/><path d="M${(x + dir * 2).toFixed(1)},98 l0,2.5 M${(x + dir * 6).toFixed(1)},98.8 l0,2" stroke="#e8691d" stroke-width=".9"/>`;
    return s + f;
  }
  f += placed(100, yaw, `<path d="M98,98 Q100,100 102,98" stroke="${shade(sk, -0.2)}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`);
  f += placed(100, yaw, `<path class="p-mouth" d="M91,105 Q100,115 109,105 Q100,108.5 91,105Z" fill="#d84a4a" stroke="#b23a3a" stroke-width="1.4" stroke-linejoin="round"/>`, 0.2);
  return s + f;
}

// The back of an outfit's top, drawn over the front when she faces away.
function torsoBack(o) {
  const top = o.top || o.main, trim = o.trim;
  switch (o.type) {
    case 'gown': case 'dress': case 'mermaid':
      return `<path d="M80,136 Q100,130 120,136 L114,196 Q100,200 86,196Z" fill="${top}"/><path d="M100,138 V194" stroke="${shade(top, -0.15)}" stroke-width="1.5"/><path d="M85,189 Q100,194 115,189 L115,198 Q100,203 85,198Z" fill="${trim}"/><path d="M95,192 L88,210 L94,208Z M105,192 L112,210 L106,208Z" fill="${trim}"/>`;
    case 'tunic':
      return `<path d="M79,133 Q100,128 121,133 L124,230 Q100,238 76,230Z" fill="${o.main}"/><rect x="77" y="194" width="46" height="9" fill="#5d4037"/><path d="M76,230 Q100,238 124,230" stroke="${trim}" stroke-width="4" fill="none"/>`;
    case 'coat':
      return `<path d="M84,196 L72,280 L96,272 L100,214 L104,272 L128,280 L116,196Z" fill="${shade(o.main, -0.12)}"/><path d="M79,133 Q100,128 121,133 L124,226 Q100,232 76,226Z" fill="${o.main}"/><path d="M100,200 V228" stroke="${shade(o.main, -0.25)}" stroke-width="2"/><circle cx="94" cy="206" r="2.6" fill="${trim}"/><circle cx="106" cy="206" r="2.6" fill="${trim}"/>`;
    case 'explorer':
      return `<path d="M79,133 Q100,128 121,133 L122,222 Q100,228 78,222Z" fill="${o.main}"/><rect x="78" y="200" width="44" height="8" fill="${trim}"/>`;
    case 'pajamas':
      return `<path d="M79,133 Q100,128 121,133 L123,220 Q100,226 77,220Z" fill="${o.main}"/>`;
  }
  return '';
}

// How each hairstyle's long part behaves in a turn: how far it sits behind her, and how much volume it keeps side-on.
const HAIR_SHEET = { long: [16, 0.62], wavy: [16, 0.66], longbraid: [16, 0.62], ponytail: [14, 0.7], bob: [10, 0.74],
  braids: [6, 0.85], bun: [4, 0.92], puffs: [4, 0.8], afro: [2, 0.97], curly: [2, 0.95], short: [3, 0.92], spiky: [3, 0.92], pixie: [3, 0.92] };
// Styles whose front part is a fringe on the face side; the rest cover the head all round.
const FRINGE_STYLES = ['long', 'wavy', 'ponytail', 'longbraid', 'bob', 'bun', 'puffs', 'braids'];
// Hats that sit only on the front of the head, versus ones that go all round it.
const FRONT_HATS = ['tiara', 'snow', 'bow', 'shell', 'star'];

// Arm outward angle (degrees from hanging down, in her own body) seen from a turned camera.
// Returns the screen rotation for the arm drawing, and how long it looks.
function armView(side, alpha, rad) {
  const REST = 7.5, a = (alpha + REST) * Math.PI / 180;
  const h = Math.sin(a), v = Math.cos(a);
  const across = h * Math.cos(rad);              // sideways on screen
  const beta = Math.atan2(across, v) * 180 / Math.PI;
  const len = Math.max(0.55, Math.sqrt(across * across + v * v));
  const rot = side === 'L' ? beta - REST : -beta + REST;
  const depth = (side === 'L' ? 1 : -1) * Math.sin(rad) * h; // hand toward (+) or away from (-) you
  return { rot, len, depth };
}

// st: { skinColor, hair, hairColor, eyes, lashes, outfit, hat, shoes, item, cape }
// yaw turns her around (0 = facing you, 180 = back). pose = { armL, armR } outward angles while turning.
function drawCharacter(st, yaw = 0, pose = null) {
  yaw = ((yaw % 360) + 360) % 360;
  const rad = yaw * Math.PI / 180, sn = Math.sin(rad), cs = Math.cos(rad);
  const turning = yaw !== 0 || pose;
  const o = byId(OUTFITS, st.outfit);
  const sh = byId(SHOES, st.shoes);
  const snow = st.kind === 'snowman';
  if (snow) st = { ...st, skinColor: '#f7fbff' };
  const sk = st.skinColor, hc = st.hairColor;
  SPIN_SHIFT = yaw * 0.35;
  const P = outfitParts(o, sk);
  SPIN_SHIFT = 0;
  const legCol = P.legCol;
  const bodyX = (x0, r) => { const a = Math.asin((x0 - 100) / r) + rad; return { x: 100 + r * Math.sin(a), z: Math.cos(a) }; };
  const mirror = (px, x0) => cs < 0 ? `translate(${px.toFixed(2)} 0) scale(-1 1) translate(${-x0} 0)` : `translate(${(px - x0).toFixed(2)} 0)`;
  const leg = (side) => {
    if (o.type === 'mermaid' || snow) return { z: 0, svg: '' };
    const x0 = side === 'L' ? 91 : 109, p = bodyX(x0, 9);
    const dir = (Math.abs(sn) > 0.45 ? Math.sign(sn) : (side === 'L' ? -1 : 1)) * (cs < 0 ? -1 : 1);
    let pants = `<rect x="${x0 - 6.5}" y="198" width="13" height="124" rx="4" fill="${legCol}"/>`;
    if (o.pants) pants += `<rect x="${x0 - 7.3}" y="${309}" width="14.6" height="6" rx="3" fill="${shade(legCol, -0.12)}"/>`;
    if (o.type === 'pajamas') pants += patternFill(o.pattern, `M${x0 - 6.5},198 h13 v120 h-13Z`, P.colors, [x0 - 7, 196, x0 + 7, 320]);
    return { z: p.z, svg: `<g transform="${mirror(p.x, x0)}"><g class="p-leg${side}">${pants}${shoe(sh, x0, 320, dir, sk)}</g></g>` };
  };
  const armSvg = (side) => {
    const x0 = side === 'L' ? 80 : 120, p = bodyX(x0, 20.5);
    const drawn = snow ? twigArm(side, side === 'R' ? st.item : undefined) : arm(side, o, sk, side === 'R' ? st.item : undefined);
    if (!turning) return { z: 0, svg: drawn };
    const alpha = pose ? (side === 'L' ? pose.armL : pose.armR) : 0;
    const v = armView(side, alpha, rad);
    const t = `translate(${(p.x - x0).toFixed(2)} 0) rotate(${v.rot.toFixed(1)} ${x0} 140) translate(${x0} 140) scale(1 ${v.len.toFixed(3)}) translate(${-x0} -140)`;
    return { z: p.z + v.depth * 0.6, svg: `<g transform="${t}">${drawn}</g>` };
  };
  const legs = [leg('L'), leg('R')].sort((a, b) => a.z - b.z).map(l => l.svg).join('');
  const arms = [armSvg('L'), armSvg('R')];
  const armsBehind = arms.filter(a => a.z < -0.05).sort((a, b) => a.z - b.z).map(a => a.svg).join('');
  // an arm swung toward you passes in front of her head
  const armsFront = arms.filter(a => a.z >= -0.05 && !(turning && a.z > 0.3 && cs < 0)).sort((a, b) => a.z - b.z).map(a => a.svg).join('');
  const armsNearest = arms.filter(a => turning && a.z > 0.3 && cs < 0).sort((a, b) => a.z - b.z).map(a => a.svg).join('');

  // torso: a little narrower side-on, and the back of the outfit when she faces away
  const w = (0.74 + 0.26 * Math.abs(cs)).toFixed(3);
  const snowBall = (cy, r) => `<circle cx="100" cy="${cy}" r="${r}" fill="url(#snowball)"/><path d="M${100 - r * 0.7},${cy + r * 0.55} Q100,${cy + r * 1.02} ${100 + r * 0.7},${cy + r * 0.55}" stroke="#d6e4f5" stroke-width="3" fill="none" opacity=".8"/>`;
  const snowDefs = `<defs><radialGradient id="snowball" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#f1f6fd"/><stop offset="1" stop-color="#d3e1f2"/></radialGradient></defs>`;
  const coal = snow ? [140, 157, 174].map(y => placed(100, yaw, `<circle cx="100" cy="${y}" r="3.6" fill="#37474f"/><circle cx="99" cy="${y - 1.2}" r="1" fill="#90a4ae"/>`)).join('') : '';
  const scarf = snow ? `<path d="M70,124 Q100,140 130,124 L131,134 Q100,150 69,134Z" fill="${o.main}"/><path d="M76,128 Q100,140 124,128" stroke="${o.trim}" stroke-width="2.5" fill="none" stroke-dasharray="5 4"/>` +
    (cs > -0.2 ? `<path d="M${(112 + sn * 6).toFixed(1)},134 L${(118 + sn * 6).toFixed(1)},170 L${(128 + sn * 6).toFixed(1)},167 L${(122 + sn * 6).toFixed(1)},133Z" fill="${o.main}"/><path d="M${(118 + sn * 6).toFixed(1)},170 l-1,5 M${(123 + sn * 6).toFixed(1)},169 l0,5 M${(128 + sn * 6).toFixed(1)},167 l1,5" stroke="${o.trim}" stroke-width="2" stroke-linecap="round"/>` : '') : '';
  const torso = snow ? `${snowDefs}${snowBall(154, 35)}${coal}${scarf}` : `<g transform="translate(100 0) scale(${w} 1) translate(-100 0)">
    <rect x="93.5" y="108" width="13" height="26" rx="5" fill="${sk}"/><path d="M93.5,116 Q100,121 106.5,116" stroke="${shade(sk, -0.12)}" stroke-width="3" fill="none"/>
    ${P.torso}${cs < -0.15 ? torsoBack(o) : ''}${cs > 0.15 ? capeCollar(st.cape) : ''}</g>`;

  // long hair hangs behind her back and swings round with her
  const [hShift, hMin] = HAIR_SHEET[st.hair] || [10, 0.8];
  const kh = 1 - (1 - hMin) * Math.abs(sn);
  const sheetT = `translate(${(-sn * hShift).toFixed(2)} 0) translate(100 0) scale(${kh.toFixed(3)} 1) translate(-100 0)`;
  const sheet = hairBack(st.hair, hc);
  let sheetFront = '';
  if (turning && cs < 0.35 && Math.abs(sn) > 0.02 || cs < -0.9) {
    const id = 'hs' + (++UID);
    const edge = 100 - Math.sign(sn || 1) * 60 * cs;
    const clip = sn >= 0 ? `<rect x="-60" y="-60" width="${(edge + 60).toFixed(1)}" height="480"/>` : `<rect x="${edge.toFixed(1)}" y="-60" width="400" height="480"/>`;
    sheetFront = `<clipPath id="${id}">${clip}</clipPath><g clip-path="url(#${id})"><g class="p-head"><g transform="${sheetT}">${sheet}</g></g></g>`;
  }

  // cape hangs from the shoulders on her back
  const capeT = `translate(${(-sn * 12).toFixed(2)} 0) translate(100 0) scale(${(0.72 + 0.28 * Math.abs(cs)).toFixed(3)} 1) translate(-100 0)`;
  const capeSvg = turning ? `<g transform="${capeT}">${cape(st.cape)}</g>` : cape(st.cape);
  const capeInFront = cs < -0.25;

  // head: face slides round the head; fringe squeezes toward the far edge; the back of the head fills in
  const fringeK = (1 + cs) / 2, anchor = sn >= 0 ? 136 : 64;
  const fringeT = `translate(${anchor} 0) scale(${fringeK.toFixed(3)} 1) translate(${-anchor} 0)`;
  let front;
  if (!turning) front = hairFront(st.hair, hc);
  else if (FRINGE_STYLES.includes(st.hair)) {
    const base = st.hair === 'braids' ? hairFront('bun', hc) : hairFront(st.hair, hc);
    front = fringeK > 0.01 ? `<g transform="${fringeT}">${base}</g>` : '';
    if (st.hair === 'braids') for (const side of [-1, 1]) {
      const f = featureAt(100 + side * 31, yaw); // braids hang at the front of each shoulder
      if (f.k > -0.3) front += `<g transform="translate(${(f.x - (100 + side * 31)).toFixed(2)} 0)">${braidSide(hc, side)}</g>`;
    }
  } else front = hairFront(st.hair, hc);
  const backStrands = cs < -0.4 ? `<g opacity="${clamp01((-cs - 0.4) / 0.4).toFixed(2)}">${backStrandLines(st.hair, hc)}</g>` : '';
  const hTop = HAIR_TOP[st.hair] || 0;
  const frontHat = FRONT_HATS.includes(st.hat);
  const hatSvg = !turning ? hat(st.hat, hTop) : frontHat ? (fringeK > 0.02 ? `<g transform="${fringeT}">${hat(st.hat, hTop)}</g>` : '') : `<g transform="translate(${(sn * 3).toFixed(2)} 0)">${hat(st.hat, hTop)}</g>`;
  const headBack = turning ? backOfHead(yaw, hc, st.hair) : '';
  const headParts = FRINGE_STYLES.includes(st.hair) || !turning
    ? `${face(st, yaw)}${headBack}${turning && !snow ? earsOnTop(st, yaw) : ''}${front}${backStrands}`
    : `${face(st, yaw)}${headBack}${turning && !snow ? earsOnTop(st, yaw) : ''}${backStrands}${front}`;

  return `
  <g class="p-all"><g class="p-body">
    ${capeInFront ? '' : capeSvg}
    <g class="p-head">${turning ? `<g transform="${sheetT}">${sheet}</g>` : sheet}</g>
    ${armsBehind}
    ${legs}
    <g class="p-skirt">${snow ? `<ellipse cx="100" cy="318" rx="44" ry="5" fill="#000" opacity=".08"/><circle cx="84" cy="304" r="14" fill="url(#snowball)"/><circle cx="116" cy="304" r="14" fill="url(#snowball)"/>${snowBall(240, 52)}` : P.skirt}</g>
    ${torso}
    ${sheetFront}
    ${capeInFront ? capeSvg : ''}
    ${armsFront}
    <g class="p-head">${headParts}${hatSvg}</g>
    ${armsNearest}
  </g></g>`;
}

// ---------- pets (120 x 120 box), soft shading and outlines ----------
function drawPet(id) {
  const uid = 'p' + (++UID);
  let defs = '', n = 0;
  const G = base => {
    const gid = uid + '_' + (n++);
    defs += `<radialGradient id="${gid}" cx="38%" cy="30%" r="80%"><stop offset="0" stop-color="${shade(base, 0.5)}"/><stop offset=".5" stop-color="${base}"/><stop offset="1" stop-color="${shade(base, -0.2)}"/></radialGradient>`;
    return `url(#${gid})`;
  };
  const O = base => `stroke="${shade(base, -0.45)}" stroke-width="2" stroke-linejoin="round"`;
  const eye = (x, y, r, iris, lashes) => {
    let e = `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.18}" fill="#24160f"/><ellipse cx="${x}" cy="${y + r * 0.25}" rx="${r * 0.72}" ry="${r * 0.82}" fill="${iris}"/><ellipse cx="${x}" cy="${y + r * 0.35}" rx="${r * 0.38}" ry="${r * 0.45}" fill="#24160f"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.4}" r="${r * 0.38}" fill="#fff"/><circle cx="${x - r * 0.35}" cy="${y + r * 0.5}" r="${r * 0.16}" fill="#fff"/>`;
    if (lashes) e += `<path d="M${x - r * 0.9},${y - r * 0.7} l-3,-3 M${x - r * 0.5},${y - r * 1.05} l-1.5,-3.5" stroke="#24160f" stroke-width="1.6" stroke-linecap="round"/>`;
    return e;
  };
  const blush = (x1, x2, y) => `<ellipse cx="${x1}" cy="${y}" rx="5" ry="3" fill="#ff8fab" opacity=".55"/><ellipse cx="${x2}" cy="${y}" rx="5" ry="3" fill="#ff8fab" opacity=".55"/>`;
  const wmouth = (x, y, c = '#5d3a2a') => `<path d="M${x - 5},${y} Q${x - 2.5},${y + 3.5} ${x},${y} Q${x + 2.5},${y + 3.5} ${x + 5},${y}" stroke="${c}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
  let s = '';
  switch (id) {
    case 'kitty': {
      const c = '#f6a04d', cream = '#fff3e0';
      s = `<path class="pet-tail" d="M82,104 C108,106 112,80 100,66 C96,62 92,66 96,70 C104,82 100,96 80,96Z" fill="${G(c)}" ${O(c)}/><path d="M98,70 l6,4 M101,80 l7,1" stroke="#d9772a" stroke-width="2.5" stroke-linecap="round"/>
        <ellipse cx="60" cy="92" rx="25" ry="22" fill="${G(c)}" ${O(c)}/><ellipse cx="60" cy="96" rx="13" ry="15" fill="${cream}"/>
        <ellipse cx="49" cy="111" rx="8" ry="5.5" fill="${G(cream)}" ${O(c)}/><ellipse cx="71" cy="111" rx="8" ry="5.5" fill="${G(cream)}" ${O(c)}/>
        <path d="M32,48 Q30,20 38,16 Q48,22 56,32Z" fill="${G(c)}" ${O(c)}/><path d="M88,48 Q90,20 82,16 Q72,22 64,32Z" fill="${G(c)}" ${O(c)}/>
        <path d="M37,40 Q37,26 40,23 Q46,27 50,33Z M83,40 Q83,26 80,23 Q74,27 70,33Z" fill="#f8a5c2"/>
        <path d="M28,58 Q24,64 30,66 Q26,72 34,72 M92,58 Q96,64 90,66 Q94,72 86,72" fill="none" ${O(c)}/>
        <ellipse cx="60" cy="54" rx="31" ry="27" fill="${G(c)}" ${O(c)}/>
        <path d="M52,30 Q54,38 56,40 M60,28 V40 M68,30 Q66,38 64,40" stroke="#d9772a" stroke-width="3" stroke-linecap="round" fill="none"/>
        <ellipse cx="54" cy="66" rx="8" ry="6" fill="${cream}"/><ellipse cx="66" cy="66" rx="8" ry="6" fill="${cream}"/>
        ${eye(47, 54, 6.2, '#43a047')}${eye(73, 54, 6.2, '#43a047')}
        <path d="M57,61.5 Q60,59.5 63,61.5 Q60,65 57,61.5Z" fill="#f06292"/>${wmouth(60, 65.5)}${blush(39, 81, 64)}
        <path d="M44,66 l-16,-3 M44,69 l-15,2 M76,66 l16,-3 M76,69 l15,2" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>`;
      break;
    }
    case 'puppy': {
      const c = '#d9a066', ear = '#8d5a3b', cream = '#fff8ee';
      s = `<path class="pet-tail" d="M82,98 Q104,96 104,76 Q108,72 110,78 Q110,104 84,106Z" fill="${G(c)}" ${O(c)}/>
        <ellipse cx="60" cy="92" rx="25" ry="22" fill="${G(c)}" ${O(c)}/><ellipse cx="60" cy="96" rx="13" ry="15" fill="${cream}"/>
        <ellipse cx="49" cy="111" rx="8.5" ry="5.5" fill="${G(cream)}" ${O(c)}/><ellipse cx="71" cy="111" rx="8.5" ry="5.5" fill="${G(cream)}" ${O(c)}/>
        <path d="M42,76 Q60,84 78,76" stroke="#e53935" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="60" cy="82" r="4" fill="#ffd54f" stroke="#c49000"/>
        <ellipse cx="60" cy="52" rx="30" ry="27" fill="${G(c)}" ${O(c)}/>
        <path d="M34,34 Q18,40 22,66 Q26,76 34,70 Q40,52 40,38Z" fill="${G(ear)}" ${O(ear)}/><path d="M86,34 Q102,40 98,66 Q94,76 86,70 Q80,52 80,38Z" fill="${G(ear)}" ${O(ear)}/>
        <ellipse cx="72" cy="44" rx="9" ry="8" fill="${ear}" opacity=".45"/>
        <ellipse cx="60" cy="65" rx="15" ry="11" fill="${G(cream)}"/>
        ${eye(48, 50, 6, '#6d4c41')}${eye(72, 50, 6, '#6d4c41')}
        <ellipse cx="60" cy="59" rx="5.5" ry="4" fill="#3e2723"/><ellipse cx="58.5" cy="57.8" rx="1.8" ry="1" fill="#fff" opacity=".7"/>
        <path d="M60,63 V66" stroke="#3e2723" stroke-width="1.6"/>${wmouth(60, 66, '#3e2723')}<path d="M57,68 Q60,77 63,68Z" fill="#f06292"/>${blush(40, 80, 62)}`;
      break;
    }
    case 'bunny': {
      const c = '#fbf7f4', pink = '#f8a5c2';
      s = `<circle class="pet-tail" cx="85" cy="100" r="9" fill="${G('#ffffff')}" ${O('#e0d6d0')}/>
        <ellipse cx="60" cy="94" rx="24" ry="20" fill="${G(c)}" ${O('#d7ccc8')}/>
        <ellipse cx="49" cy="111" rx="8" ry="5" fill="${G(c)}" ${O('#d7ccc8')}/><ellipse cx="71" cy="111" rx="8" ry="5" fill="${G(c)}" ${O('#d7ccc8')}/>
        <path d="M46,38 Q32,4 42,2 Q54,4 56,34Z" fill="${G(c)}" ${O('#d7ccc8')}/><path d="M46,32 Q38,10 43,8 Q50,10 52,32Z" fill="${pink}"/>
        <path d="M66,34 Q82,6 98,14 Q100,24 74,40Z" fill="${G(c)}" ${O('#d7ccc8')}/><path d="M70,34 Q84,14 94,17 Q94,22 74,37Z" fill="${pink}"/>
        <ellipse cx="60" cy="56" rx="27" ry="25" fill="${G(c)}" ${O('#d7ccc8')}/>
        ${eye(49, 54, 5.6, '#8d6e63')}${eye(71, 54, 5.6, '#8d6e63')}
        <path d="M57,62 Q60,60 63,62 Q60,65.5 57,62Z" fill="#f06292"/>${wmouth(60, 66)}<rect x="57.6" y="66.5" width="4.8" height="4" rx="1" fill="#fff" stroke="#d7ccc8" stroke-width=".8"/>${blush(41, 79, 64)}
        <g transform="translate(78 36)">${flower(0, 0, 3.6, '#ffd54f', '#ff8a65')}</g>`;
      break;
    }
    case 'fox': {
      const c = '#f57c3a', w = '#fffaf2', dk = '#4e342e';
      s = `<path class="pet-tail" d="M80,104 C116,108 120,72 104,56 C100,74 92,86 80,90Z" fill="${G(c)}" ${O(c)}/><path d="M104,56 C112,64 114,74 112,82 C106,76 102,66 104,56Z" fill="${w}"/>
        <ellipse cx="60" cy="94" rx="23" ry="20" fill="${G(c)}" ${O(c)}/><path d="M48,80 Q60,104 72,80 Q66,110 60,110 Q54,110 48,80Z" fill="${w}"/>
        <ellipse cx="49" cy="111" rx="7.5" ry="5" fill="${dk}"/><ellipse cx="71" cy="111" rx="7.5" ry="5" fill="${dk}"/>
        <path d="M30,46 L32,12 L56,32Z" fill="${G(c)}" ${O(c)}/><path d="M90,46 L88,12 L64,32Z" fill="${G(c)}" ${O(c)}/>
        <path d="M32,12 L31.5,22 L38,18Z M88,12 L88.5,22 L82,18Z" fill="${dk}"/><path d="M36,38 L37,22 L50,33Z M84,38 L83,22 L70,33Z" fill="${w}" opacity=".9"/>
        <path d="M28,54 Q30,26 60,26 Q90,26 92,54 Q90,70 60,82 Q30,70 28,54Z" fill="${G(c)}" ${O(c)}/>
        <path d="M30,56 Q44,58 52,66 Q56,78 60,80 Q64,78 68,66 Q76,58 90,56 Q86,72 60,84 Q34,72 30,56Z" fill="${w}"/>
        ${eye(46, 52, 5.6, '#ff9800')}${eye(74, 52, 5.6, '#ff9800')}
        <ellipse cx="60" cy="70" rx="4.2" ry="3.2" fill="${dk}"/>${wmouth(60, 74.5)}${blush(38, 82, 62)}`;
      break;
    }
    case 'unicorn': {
      const c = '#fdfbff', ol = '#d1c4e9', hoof = '#ffd54f', mane = ['#f48fb1', '#ce93d8', '#81d4fa', '#a5d6a7', '#fff59d'];
      // one smooth neck that flows from the chest up into the head
      const neck = 'M34,90 C30,74 32,60 40,50 L62,48 C58,58 58,72 64,84 Z';
      s = `<path class="pet-tail" d="M90,84 Q114,82 112,106 Q106,96 94,96Z" fill="${mane[1]}"/><path d="M92,90 Q110,92 106,112 Q100,102 90,98Z" fill="${mane[2]}"/>
        ${[46, 58, 76, 88].map(x => `<rect x="${x - 4.5}" y="92" width="9" height="20" rx="4.5" fill="${G(c)}" ${O(ol)}/><rect x="${x - 4.5}" y="107" width="9" height="6" rx="2" fill="${hoof}"/>`).join('')}
        <ellipse cx="66" cy="87" rx="29" ry="17" fill="${G(c)}" ${O(ol)}/>
        <path d="${neck}" fill="${G(c)}"/><path d="M34,90 C30,74 32,60 40,50" fill="none" ${O(ol)}/>
        <ellipse cx="42" cy="40" rx="20" ry="17" fill="${G(c)}" ${O(ol)}/>
        <ellipse cx="27" cy="48" rx="11" ry="8.5" fill="${G('#f8d7e8')}" ${O('#f3c1d8')}/><circle cx="23" cy="47" r="1.5" fill="#c2185b"/><circle cx="29" cy="46" r="1.5" fill="#c2185b"/>
        <path d="M52,25 L60,15 L60,30Z" fill="${G(c)}" ${O(ol)}/><path d="M55,25 L59,19 L59,28Z" fill="#f8bbd0"/>
        <path d="M38,24 L47,22 L43,2Z" fill="${G(hoof)}" stroke="#c49000" stroke-width="1.3" stroke-linejoin="round"/><path d="M39.5,17 L45.5,15 M41,10 L44.5,8.6" stroke="#c49000" stroke-width="1.2"/>
        ${[[54, 26, 8], [60, 36, 8.2], [62, 47, 8], [62, 58, 7.6], [64, 69, 7], [67, 79, 6]].map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${mane[i % 5]}"/>`).join('')}
        ${eye(40, 38, 5.4, '#7e57c2', true)}<ellipse cx="36" cy="49" rx="4" ry="2.6" fill="#ff8fab" opacity=".5"/>
        <path d="M24,53 Q28,56 32,53" stroke="#c2185b" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
      break;
    }
    case 'chameleon': {
      const c = '#7ccf5a', d = '#4f9e3a', belly = '#d8f5a2';
      s = `<path class="pet-tail" d="M78,92 C100,94 108,80 102,70 C97,62 86,64 86,72 C86,78 92,80 95,76" fill="none" stroke="${d}" stroke-width="10.5" stroke-linecap="round"/>
        <path d="M78,92 C100,94 108,80 102,70 C97,62 86,64 86,72 C86,78 92,80 95,76" fill="none" stroke="${c}" stroke-width="7.5" stroke-linecap="round" class="pet-tail"/>
        <path d="M38,104 l-4,9 M48,106 l1,8 M70,106 l-1,8 M80,103 l4,9" stroke="${d}" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="34" cy="113" rx="4.5" ry="2.6" fill="${c}"/><ellipse cx="49" cy="114.5" rx="4.5" ry="2.6" fill="${c}"/><ellipse cx="69" cy="114.5" rx="4.5" ry="2.6" fill="${c}"/><ellipse cx="84" cy="113" rx="4.5" ry="2.6" fill="${c}"/>
        <ellipse cx="60" cy="90" rx="28" ry="18" fill="${G(c)}" ${O(c)}/>
        <path d="M40,100 Q60,110 80,100 Q72,106 60,107 Q48,106 40,100Z" fill="${belly}" opacity=".9"/>
        <path d="M44,78 Q48,90 46,100 M58,74 Q62,88 60,104 M72,76 Q76,88 74,100" stroke="#f6c94c" stroke-width="3" fill="none" stroke-linecap="round" opacity=".75"/>
        <path d="M36,74 Q60,62 86,76" fill="none" stroke="${d}" stroke-width="2" stroke-dasharray="1 5" stroke-linecap="round"/>
        <path d="M14,60 C14,40 30,30 46,32 L56,40 C60,54 56,66 44,72 C30,76 14,72 14,60Z" fill="${G(c)}" ${O(c)}/>
        <path d="M30,33 Q38,20 52,26 Q50,32 46,34Z" fill="${G(c)}" ${O(c)}/>
        <path d="M16,62 Q28,70 44,66" stroke="${d}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
        <circle cx="38" cy="50" r="12" fill="${G(c)}" ${O(c)}/>
        ${eye(39, 50, 6.4, '#ff9800')}
        <path d="M18,58 Q24,63 32,60" stroke="#2e6b1c" stroke-width="1.6" fill="none" stroke-linecap="round"/>
        <ellipse cx="26" cy="62" rx="4" ry="2.4" fill="#ff8fab" opacity=".55"/>
        <circle cx="18" cy="52" r="1.2" fill="#2e6b1c"/>`;
      break;
    }
    case 'reindeer': {
      const c = '#a9784f', light = '#ecd6b8', ant = '#d9b98a';
      s = `<path class="pet-tail" d="M88,80 Q98,76 96,86 Q92,84 88,86Z" fill="${light}" ${O(c)}/>
        ${[44, 56, 72, 84].map(x => `<rect x="${x - 4.5}" y="92" width="9" height="19" rx="4.5" fill="${G(c)}" ${O(c)}/><rect x="${x - 4.5}" y="107" width="9" height="6" rx="2" fill="#4e342e"/>`).join('')}
        <ellipse cx="64" cy="86" rx="28" ry="17" fill="${G(c)}" ${O(c)}/><ellipse cx="62" cy="92" rx="16" ry="8" fill="${light}" opacity=".85"/>
        <path d="M34,88 C30,74 32,62 38,54 L58,52 C56,62 56,74 62,84Z" fill="${G(c)}"/><path d="M34,88 C30,74 32,62 38,54" fill="none" ${O(c)}/>
        <path d="M30,22 Q26,10 32,4 M30,16 Q22,14 20,8 M30,22 Q20,22 16,16 M54,22 Q58,10 52,4 M54,16 Q62,14 64,8 M54,22 Q64,22 68,16" stroke="${ant}" stroke-width="4" fill="none" stroke-linecap="round"/>
        <path d="M24,30 Q14,24 14,32 Q18,38 28,36Z M60,30 Q70,24 70,32 Q66,38 56,36Z" fill="${G(c)}" ${O(c)}/>
        <ellipse cx="42" cy="42" rx="19" ry="17" fill="${G(c)}" ${O(c)}/>
        <ellipse cx="42" cy="54" rx="12" ry="9" fill="${G(light)}" ${O(c)}/>
        <ellipse cx="42" cy="50" rx="5" ry="3.6" fill="#4e342e"/><ellipse cx="40.5" cy="49" rx="1.6" ry="1" fill="#fff" opacity=".6"/>
        ${eye(34, 38, 4.6, '#5d4037')}${eye(50, 38, 4.6, '#5d4037')}
        <path d="M38,57 Q42,60 46,57" stroke="#5d3a2a" stroke-width="1.5" fill="none" stroke-linecap="round"/>${blush(28, 56, 47)}
        <path d="M26,66 Q42,74 58,66" stroke="#e53935" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="42" cy="71" r="3.2" fill="#ffd54f" stroke="#c49000" stroke-width="1"/>`;
      break;
    }
    case 'dragon': {
      const c = '#5cbf6a', belly = '#fff3b0', wing = '#b39ddb';
      s = `<path class="pet-tail" d="M80,102 Q104,110 106,88 L114,82 L104,80 L104,90 Q100,100 82,96Z" fill="${G(c)}" ${O(c)}/>
        <path d="M34,74 Q10,52 14,40 Q22,52 30,50 Q24,62 38,70Z" fill="${G(wing)}" ${O(wing)}/><path d="M86,74 Q110,52 106,40 Q98,52 90,50 Q96,62 82,70Z" fill="${G(wing)}" ${O(wing)}/>
        <ellipse cx="60" cy="92" rx="25" ry="21" fill="${G(c)}" ${O(c)}/><ellipse cx="60" cy="96" rx="14" ry="15" fill="${belly}"/>
        <path d="M48,90 H72 M47,97 H73 M49,104 H71" stroke="#e6cf6a" stroke-width="1.5"/>
        <ellipse cx="48" cy="111" rx="8" ry="5" fill="${G(c)}" ${O(c)}/><ellipse cx="72" cy="111" rx="8" ry="5" fill="${G(c)}" ${O(c)}/>
        <path d="M42,30 L36,10 L50,26Z M78,30 L84,10 L70,26Z" fill="${G(belly)}" stroke="#c9a92c" stroke-width="1.3"/>
        <path d="M54,26 L60,16 L66,26Z" fill="#ff8a65"/>
        <ellipse cx="60" cy="52" rx="30" ry="26" fill="${G(c)}" ${O(c)}/>
        <ellipse cx="60" cy="66" rx="15" ry="9" fill="${G('#8bd99a')}"/><circle cx="55" cy="64" r="1.6" fill="#2e7d32"/><circle cx="65" cy="64" r="1.6" fill="#2e7d32"/>
        ${eye(47, 50, 6, '#ffb300')}${eye(73, 50, 6, '#ffb300')}
        <path d="M53,70 Q60,75 67,70" stroke="#2e7d32" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M63,71.5 l1.5,3 l1.5,-3.6Z" fill="#fff"/>${blush(38, 82, 60)}`;
      break;
    }
    case 'owl': {
      const c = '#9c7356', chest = '#f1e2cf';
      s = `<path class="pet-tail" d="M28,62 Q14,86 30,104 Q34,84 36,70Z M92,62 Q106,86 90,104 Q86,84 84,70Z" fill="${G(shade(c, -0.1))}" ${O(c)}/>
        <path d="M30,40 L28,16 L46,30Z M90,40 L92,16 L74,30Z" fill="${G(c)}" ${O(c)}/>
        <ellipse cx="60" cy="68" rx="32" ry="42" fill="${G(c)}" ${O(c)}/>
        <ellipse cx="60" cy="84" rx="20" ry="22" fill="${G(chest)}"/>
        ${[[52, 78], [68, 78], [60, 86], [52, 94], [68, 94], [60, 102]].map(([x, y]) => `<path d="M${x - 5},${y} Q${x},${y + 5} ${x + 5},${y}" stroke="#c9ad8f" stroke-width="1.6" fill="none"/>`).join('')}
        <circle cx="46" cy="50" r="14" fill="${G('#fff8ee')}" ${O('#d7c3ad')}/><circle cx="74" cy="50" r="14" fill="${G('#fff8ee')}" ${O('#d7c3ad')}/>
        ${eye(46, 50, 7.4, '#ffb300')}${eye(74, 50, 7.4, '#ffb300')}
        <path d="M55,60 L65,60 L60,70Z" fill="${G('#ffb74d')}" stroke="#e08a00" stroke-width="1.2"/>
        ${[50, 56, 64, 70].map(x => `<path d="M${x},108 v6" stroke="#f0a400" stroke-width="3.2" stroke-linecap="round"/>`).join('')}${blush(34, 86, 66)}`;
      break;
    }
    case 'penguin': {
      const c = '#2f3e66';
      s = `<path class="pet-tail" d="M30,60 Q14,80 24,96 Q30,84 34,72Z M90,60 Q106,80 96,96 Q90,84 86,72Z" fill="${G(c)}" ${O(c)}/>
        <ellipse cx="50" cy="111" rx="10" ry="4.5" fill="${G('#ffa726')}"/><ellipse cx="70" cy="111" rx="10" ry="4.5" fill="${G('#ffa726')}"/>
        <ellipse cx="60" cy="68" rx="31" ry="43" fill="${G(c)}" ${O(c)}/>
        <path d="M60,40 Q44,26 38,46 Q34,62 42,80 Q40,104 60,108 Q80,104 78,80 Q86,62 82,46 Q76,26 60,40Z" fill="${G('#ffffff')}"/>
        ${eye(50, 54, 5.4, '#5c6bc0')}${eye(70, 54, 5.4, '#5c6bc0')}
        <path d="M54,63 Q60,60 66,63 Q60,72 54,63Z" fill="${G('#ffa726')}" stroke="#e08a00" stroke-width="1"/>${blush(41, 79, 64)}
        <path d="M34,80 Q60,92 86,80 L86,88 Q60,100 34,88Z" fill="#e53935"/><path d="M76,86 L80,104 L88,100 L82,84Z" fill="#c62828"/>`;
      break;
    }
    case 'frog': {
      const c = '#7cc84a', belly = '#e8f7c8';
      s = `<ellipse cx="34" cy="108" rx="14" ry="6" fill="${G(c)}" ${O(c)}/><ellipse cx="86" cy="108" rx="14" ry="6" fill="${G(c)}" ${O(c)}/>
        <ellipse cx="60" cy="86" rx="32" ry="24" fill="${G(c)}" ${O(c)}/><ellipse cx="60" cy="92" rx="18" ry="16" fill="${belly}"/>
        <ellipse cx="60" cy="58" rx="34" ry="22" fill="${G(c)}" ${O(c)}/>
        <circle cx="40" cy="40" r="14" fill="${G(c)}" ${O(c)}/><circle cx="80" cy="40" r="14" fill="${G(c)}" ${O(c)}/>
        ${eye(40, 40, 7, '#5d4037')}${eye(80, 40, 7, '#5d4037')}
        <path d="M40,64 Q60,78 80,64" stroke="#2e6b1c" stroke-width="2.2" fill="none" stroke-linecap="round"/>${blush(34, 86, 62)}
        <path d="M46,30 L48,20 L54,27 L60,16 L66,27 L72,20 L74,30Z" fill="${G('#ffd54f')}" stroke="#c49000" stroke-width="1.2"/>`;
      break;
    }
    case 'mouse': {
      const c = '#b0a8b9', pink = '#f8a5c2';
      s = `<path class="pet-tail" d="M82,104 Q112,108 108,84 Q106,74 98,78" stroke="${pink}" stroke-width="3" fill="none" stroke-linecap="round"/>
        <ellipse cx="60" cy="94" rx="23" ry="19" fill="${G(c)}" ${O(c)}/><ellipse cx="60" cy="98" rx="12" ry="13" fill="#efeaf2"/>
        <ellipse cx="50" cy="111" rx="7" ry="4.5" fill="${pink}"/><ellipse cx="70" cy="111" rx="7" ry="4.5" fill="${pink}"/>
        <circle cx="32" cy="34" r="18" fill="${G(c)}" ${O(c)}/><circle cx="32" cy="34" r="11" fill="${pink}"/><circle cx="88" cy="34" r="18" fill="${G(c)}" ${O(c)}/><circle cx="88" cy="34" r="11" fill="${pink}"/>
        <ellipse cx="60" cy="58" rx="27" ry="24" fill="${G(c)}" ${O(c)}/>
        ${eye(49, 55, 5.6, '#4e342e')}${eye(71, 55, 5.6, '#4e342e')}
        <circle cx="60" cy="66" r="3.6" fill="#f06292"/>${wmouth(60, 70)}${blush(40, 80, 66)}
        <path d="M46,66 l-14,-3 M46,69 l-13,2 M74,66 l14,-3 M74,69 l13,2" stroke="#7d7488" stroke-width="1.2" stroke-linecap="round"/>
        <path d="M40,80 Q60,92 80,80 L76,88 Q60,96 44,88Z" fill="#4fc3f7"/>`;
      break;
    }
    default: return '';
  }
  return `<defs>${defs}</defs><g class="pet-body">${s}</g>`;
}

// ---------- stage backdrops (800 x 600, sliced to fit) ----------
function drawStage(id) {
  let s = '';
  const R = (n, seed) => { let x = Math.sin(seed * 999 + n * 77.7) * 10000; return x - Math.floor(x); };
  switch (id) {
    case 'ballroom':
      s = `<rect width="800" height="600" fill="#f8bbd0"/><rect y="0" width="800" height="380" fill="#f9c8db"/>`;
      for (const x of [120, 400, 680]) s += `<path d="M${x - 70},360 V170 Q${x},70 ${x + 70},170 V360Z" fill="#b2ebf2" stroke="#fff" stroke-width="10"/><path d="M${x},100 V360 M${x - 70},250 H${x + 70}" stroke="#fff" stroke-width="5"/>`;
      for (const x of [260, 540]) s += `<rect x="${x - 18}" y="80" width="36" height="300" fill="#fce4ec"/><rect x="${x - 26}" y="70" width="52" height="16" fill="#fff"/>`;
      s += `<rect y="380" width="800" height="220" fill="#f48fb1"/><ellipse cx="400" cy="500" rx="330" ry="80" fill="#80cbc4"/><ellipse cx="400" cy="500" rx="270" ry="58" fill="#b2dfdb"/><ellipse cx="400" cy="500" rx="120" ry="26" fill="#80cbc4"/>`;
      // curtain valance across the top: scalloped swags with a gold trim
      s += `<rect width="800" height="34" fill="#c2185b"/>`;
      for (let x = 0; x < 800; x += 100) s += `<path d="M${x},30 Q${x + 50},96 ${x + 100},30Z" fill="#d81b60"/><path d="M${x},30 Q${x + 50},96 ${x + 100},30" fill="none" stroke="#ffd54f" stroke-width="5"/>`;
      s += `<path d="M0,32 H800" stroke="#ffd54f" stroke-width="5"/>`;
      break;
    case 'ice':
      s = `<defs><linearGradient id="gi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fc3f7"/><stop offset="1" stop-color="#e1f5fe"/></linearGradient></defs><rect width="800" height="600" fill="url(#gi)"/>`;
      for (const [x, h] of [[60, 300], [150, 220], [650, 260], [740, 330]]) s += `<path d="M${x - 40},400 L${x - 30},${400 - h} L${x},${380 - h} L${x + 30},${400 - h} L${x + 40},400Z" fill="#b3e5fc" stroke="#fff" stroke-width="4" opacity=".9"/>`;
      for (let i = 0; i < 26; i++) { const x = R(i, 1) * 800, y = R(i, 2) * 380, r = 4 + R(i, 3) * 8; s += `<g stroke="#fff" stroke-width="2" opacity=".8"><path d="M${x - r},${y}H${x + r}M${x},${y - r}V${y + r}M${x - r * .7},${y - r * .7}L${x + r * .7},${y + r * .7}M${x + r * .7},${y - r * .7}L${x - r * .7},${y + r * .7}"/></g>`; }
      s += `<rect y="400" width="800" height="200" fill="#e1f5fe"/><ellipse cx="400" cy="500" rx="320" ry="76" fill="#b3e5fc"/><ellipse cx="400" cy="500" rx="250" ry="52" fill="#e3f2fd"/>`;
      break;
    case 'sea':
      s = `<defs><linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4dd0e1"/><stop offset="1" stop-color="#00838f"/></linearGradient></defs><rect width="800" height="600" fill="url(#gs)"/>`;
      for (let i = 0; i < 4; i++) s += `<path d="M${120 + i * 180},0 L${60 + i * 180},420 L${160 + i * 180},420Z" fill="#fff" opacity=".07"/>`;
      for (let i = 0; i < 22; i++) s += `<circle cx="${R(i, 4) * 800}" cy="${R(i, 5) * 420}" r="${3 + R(i, 6) * 9}" fill="none" stroke="#e0f7fa" stroke-width="2" opacity=".7"/>`;
      for (const x of [40, 90, 700, 760]) s += `<path d="M${x},470 Q${x - 20},400 ${x},340 Q${x + 20},280 ${x},220" stroke="#43a047" stroke-width="12" fill="none" stroke-linecap="round"/>`;
      s += `<path d="M150,460 Q170,380 190,420 Q200,370 220,440Z" fill="#ff8a65"/><path d="M600,460 Q620,390 640,430 Q660,380 670,460Z" fill="#f48fb1"/>`;
      s += `<rect y="430" width="800" height="170" fill="#ffe0b2"/><ellipse cx="400" cy="505" rx="320" ry="70" fill="#ffcc80"/>`;
      break;
    case 'forest':
      s = `<rect width="800" height="600" fill="#c5e1a5"/><rect width="800" height="300" fill="#dcedc8"/>`;
      for (const [x, sc] of [[40, 1.2], [150, .9], [260, .7], [560, .7], [660, .95], [770, 1.2]]) s += `<rect x="${x - 12 * sc}" y="${420 - 160 * sc}" width="${24 * sc}" height="${170 * sc}" fill="#795548"/><circle cx="${x}" cy="${420 - 200 * sc}" r="${80 * sc}" fill="#66bb6a"/><circle cx="${x - 40 * sc}" cy="${420 - 160 * sc}" r="${50 * sc}" fill="#4caf50"/><circle cx="${x + 40 * sc}" cy="${420 - 165 * sc}" r="${52 * sc}" fill="#81c784"/>`;
      for (let i = 0; i < 20; i++) s += `<circle cx="${R(i, 7) * 800}" cy="${80 + R(i, 8) * 330}" r="${2 + R(i, 9) * 3}" fill="#fff59d" opacity=".9"/>`;
      s += `<rect y="420" width="800" height="180" fill="#8bc34a"/><ellipse cx="400" cy="505" rx="320" ry="72" fill="#aed581"/>`;
      for (let i = 0; i < 12; i++) s += flower(30 + i * 68, 440 + R(i, 10) * 140, 5, ['#f48fb1', '#fff', '#ce93d8', '#ffd54f'][i % 4], '#ffb300');
      break;
    case 'night':
      s = `<defs><linearGradient id="gn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a237e"/><stop offset="1" stop-color="#7e57c2"/></linearGradient></defs><rect width="800" height="600" fill="url(#gn)"/>`;
      s += `<circle cx="640" cy="110" r="54" fill="#fff9c4"/><circle cx="662" cy="96" r="50" fill="#283593"/>`;
      for (let i = 0; i < 46; i++) s += `<path d="${starPath(R(i, 11) * 800, R(i, 12) * 400, 3 + R(i, 13) * 6, 1.3 + R(i, 13) * 2)}" fill="#fff59d" opacity="${0.5 + R(i, 14) * 0.5}"/>`;
      s += `<path d="M0,430 L60,380 L60,300 L80,270 L100,300 L100,380 L180,380 L180,320 L200,290 L220,320 L220,430Z" fill="#311b92"/><path d="M620,430 L620,330 L640,300 L660,330 L660,360 L720,360 L720,280 L745,240 L770,280 L770,430Z" fill="#311b92"/>`;
      s += `<rect y="430" width="800" height="170" fill="#4527a0"/><ellipse cx="400" cy="505" rx="320" ry="72" fill="#5e35b1"/>`;
      break;
    case 'garden':
      s = `<rect width="800" height="600" fill="#b3e5fc"/>`;
      ['#ff8a80', '#ffd180', '#ffff8d', '#b9f6ca', '#80d8ff', '#b388ff'].forEach((c, i) => { s += `<path d="M60,440 A340,300 0 0 1 740,440" stroke="${c}" stroke-width="22" fill="none" transform="translate(0 ${i * 22})"/>`; });
      s += `<ellipse cx="140" cy="90" rx="60" ry="24" fill="#fff"/><ellipse cx="180" cy="74" rx="40" ry="24" fill="#fff"/><ellipse cx="650" cy="120" rx="64" ry="22" fill="#fff"/><ellipse cx="610" cy="104" rx="36" ry="22" fill="#fff"/>`;
      s += `<rect y="440" width="800" height="160" fill="#9ccc65"/><ellipse cx="400" cy="508" rx="320" ry="70" fill="#c5e1a5"/>`;
      for (let i = 0; i < 16; i++) { const x = 20 + i * 52; s += `<path d="M${x},600 V${470 + R(i, 15) * 40}" stroke="#558b2f" stroke-width="3"/>` + flower(x, 470 + R(i, 15) * 40, 7, ['#ff8a80', '#ffd54f', '#ce93d8', '#80d8ff', '#f48fb1'][i % 5], '#fff59d'); }
      break;
    case 'beach':
      s = `<defs><linearGradient id="gb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8a65"/><stop offset=".6" stop-color="#ffcc80"/><stop offset="1" stop-color="#fff3e0"/></linearGradient></defs><rect width="800" height="600" fill="url(#gb)"/>`;
      s += `<circle cx="400" cy="330" r="90" fill="#ffee58" opacity=".9"/><rect y="330" width="800" height="110" fill="#29b6f6"/>`;
      for (let i = 0; i < 6; i++) s += `<path d="M${i * 140},${360 + (i % 2) * 30} q20,-10 40,0" stroke="#e1f5fe" stroke-width="4" fill="none"/>`;
      s += `<path d="M90,440 Q80,300 120,180" stroke="#8d6e63" stroke-width="16" fill="none"/>` + [0, 60, 130, 200, 260].map(a => `<path d="M120,180 q${Math.cos(a * Math.PI / 180) * 60},${Math.sin(a * Math.PI / 180) * 30 - 10} ${Math.cos(a * Math.PI / 180) * 110},${Math.sin(a * Math.PI / 180) * 50 + 30}" stroke="#43a047" stroke-width="14" fill="none" stroke-linecap="round"/>`).join('');
      s += `<rect y="430" width="800" height="170" fill="#ffe0b2"/><ellipse cx="400" cy="505" rx="320" ry="70" fill="#ffd59a"/><path d="M680,520 l12,-14 l12,14 l-12,8Z" fill="#ff8a65"/>`;
      break;
  }
  return s;
}
