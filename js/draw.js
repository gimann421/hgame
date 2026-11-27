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
      for (let x = x0 + (row % 2) * 6; x < x1; x += 12) s += `<path d="M${x - 6},${y} Q${x},${y + 9} ${x + 6},${y}" fill="none" stroke="${light}" stroke-width="1.6" opacity=".8"/>`;
  } else {
    let row = 0;
    for (let y = y0 + 8; y < y1; y += 22, row++) {
      for (let x = x0 + 6 + (row % 2) * 11; x < x1; x += 22) {
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
  const fx = x + dir * 3;
  const c = sh.color, a = sh.accent;
  switch (sh.kind) {
    case 'crystal':
      return `<ellipse cx="${fx}" cy="${y + 3}" rx="11" ry="6.5" fill="${c}" opacity=".9" stroke="#fff" stroke-width="2"/><path d="${starPath(fx + dir * 4, y + 1, 3.5, 1, 4)}" fill="#fff"/>`;
    case 'boot':
      return `<rect x="${x - 8.5}" y="${y - 38}" width="17" height="40" rx="5" fill="${c}"/><rect x="${x - 9}" y="${y - 38}" width="18" height="6" rx="3" fill="${a}"/><ellipse cx="${fx}" cy="${y + 3}" rx="12" ry="6.5" fill="${c}"/><rect x="${fx - 12}" y="${y + 5}" width="24" height="3" rx="1.5" fill="${shade(c, -0.3)}"/>`;
    case 'fluffy':
      return `<rect x="${x - 9}" y="${y - 28}" width="18" height="30" rx="6" fill="#90caf9"/><ellipse cx="${x}" cy="${y - 27}" rx="12" ry="6" fill="#fff"/><ellipse cx="${fx}" cy="${y + 3}" rx="12.5" ry="7" fill="#90caf9"/><circle cx="${x - 5}" cy="${y - 29}" r="3" fill="#fff"/><circle cx="${x + 6}" cy="${y - 28}" r="3" fill="#fff"/>`;
    case 'sneaker':
      return `<ellipse cx="${fx}" cy="${y + 2}" rx="12" ry="7" fill="${c}"/><path d="M${fx - 12},${y + 4} H${fx + 12}" stroke="#fff" stroke-width="3.5" stroke-linecap="round"/><path d="M${fx - 6},${y - 1} H${fx + 6}" stroke="#ff8a80" stroke-width="1.6"/><path d="M${fx - 6},${y + 1} H${fx + 6}" stroke="#ffeb3b" stroke-width="1.6"/>`;
    case 'sandal':
      return `<ellipse cx="${fx}" cy="${y + 2}" rx="10.5" ry="6" fill="${skin}"/><ellipse cx="${fx}" cy="${y + 6}" rx="12" ry="3" fill="${c}"/><path d="M${fx - 6},${y + 4} L${fx},${y - 3} L${fx + 6},${y + 4}" fill="none" stroke="${c}" stroke-width="2.5"/>`;
    case 'ballet':
      return `<ellipse cx="${fx}" cy="${y + 3}" rx="10.5" ry="6" fill="${c}"/><path d="M${x - 6},${y - 2} L${x + 6},${y - 14} M${x + 6},${y - 2} L${x - 6},${y - 14}" stroke="${a}" stroke-width="2"/>`;
    case 'bare':
      return `<ellipse cx="${fx}" cy="${y + 3}" rx="10" ry="6" fill="${skin}"/><ellipse cx="${fx + dir * 7}" cy="${y + 1}" rx="2" ry="1.6" fill="${shade(skin, -0.1)}"/>`;
    default:
      return `<ellipse cx="${fx}" cy="${y + 3}" rx="11.5" ry="6.5" fill="${c}"/><circle cx="${fx + dir * 2}" cy="${y - 1}" r="3" fill="${a}"/>`;
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
    case 'curly': return `<path d="M62,86 C58,40 142,40 138,86Z" fill="${c}"/>` + arcCircles(100, 78, 38, 180, 360, 11, 11, c);
    case 'spiky': case 'short': case 'pixie':
    default: return `<path d="M61,90 C56,38 144,38 139,90 Q100,76 61,90Z" fill="${c}"/>`;
  }
}
function hairFront(style, c) {
  const d = shade(c, -0.18), l = shade(c, 0.25);
  const sweep = `<path d="M63,92 C58,48 84,40 100,40 C122,40 144,50 137,92 C134,72 124,62 110,58 C100,68 82,72 70,72 C66,78 64,85 63,92Z" fill="${c}"/><path d="M106,48 Q90,52 80,62" stroke="${l}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`;
  const part = `<path d="M63,92 C58,46 142,46 137,92 C134,70 120,58 100,56 C80,58 66,70 63,92Z" fill="${c}"/><path d="M100,44 L100,57" stroke="${d}" stroke-width="2"/>`;
  switch (style) {
    case 'long': case 'wavy': case 'ponytail': return sweep;
    case 'bob': return `<path d="M62,90 C58,42 142,42 138,90 L136,74 Q100,64 64,74Z" fill="${c}"/>`;
    case 'bun': case 'puffs': return part;
    case 'braids': {
      let s = part;
      for (const side of [-1, 1]) {
        for (let i = 0; i < 7; i++) {
          const x = 100 + side * (37 - i * 0.6), y = 98 + i * 14;
          s += `<ellipse cx="${x}" cy="${y}" rx="9" ry="9" fill="${c}"/><path d="M${x - 7},${y - 2} Q${x},${y + 6} ${x + 7},${y - 2}" stroke="${d}" stroke-width="1.5" fill="none"/>`;
        }
        s += `<circle cx="${100 + side * 33}" cy="${196}" r="5" fill="#ec407a"/><path d="M${100 + side * 33 - 4},200 l-2,12 M${100 + side * 33 + 4},200 l2,12" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
      }
      return s;
    }
    case 'afro': return arcCircles(100, 82, 38, 200, 340, 9, 10, c);
    case 'curly': return arcCircles(100, 80, 34, 195, 345, 8, 9, c);
    case 'short': return `<path d="M62,84 C60,42 140,42 138,84 Q134,64 120,60 Q104,70 88,63 Q72,64 62,84Z" fill="${c}"/><rect x="62" y="78" width="6" height="16" rx="3" fill="${c}"/><rect x="132" y="78" width="6" height="16" rx="3" fill="${c}"/>`;
    case 'spiky': return `<path d="M62,86 L58,56 L72,60 L72,38 L88,50 L96,28 L106,46 L122,32 L124,52 L140,50 L138,86 Q132,64 100,62 Q72,64 62,86Z" fill="${c}"/>`;
    case 'pixie': return `<path d="M62,86 C58,44 142,40 140,80 Q138,62 124,56 Q118,74 88,74 Q70,74 62,86Z" fill="${c}"/><path d="M120,48 Q100,58 84,64" stroke="${l}" stroke-width="3" fill="none" opacity=".7" stroke-linecap="round"/>`;
  }
  return sweep;
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
    case 'balloon': return `<path d="M${x},${y} Q${x + 8},${y - 40} ${x + 2},${y - 80}" stroke="#757575" stroke-width="1.2" fill="none"/><path d="${heartPath(x + 2, y - 104, 16)}" fill="#ff5252"/><ellipse cx="${x - 6}" cy="${y - 108}" rx="3" ry="5" fill="#fff" opacity=".7"/>`;
    case 'teddy': return `<g transform="translate(${x} ${y - 14})"><circle cx="-9" cy="-14" r="5" fill="#a1887f"/><circle cx="9" cy="-14" r="5" fill="#a1887f"/><ellipse cx="0" cy="10" rx="12" ry="14" fill="#a1887f"/><circle cx="0" cy="-6" r="11" fill="#a1887f"/><ellipse cx="0" cy="-2" rx="5" ry="4" fill="#d7ccc8"/><circle cx="-4" cy="-8" r="1.6" fill="#3e2723"/><circle cx="4" cy="-8" r="1.6" fill="#3e2723"/><circle cx="0" cy="-3" r="1.6" fill="#3e2723"/><path d="M-5,4 L5,4" stroke="#e53935" stroke-width="3"/></g>`;
    case 'lantern': return `<path d="M${x},${y} L${x},${y + 16}" stroke="#5d4037" stroke-width="2"/><rect x="${x - 11}" y="${y + 14}" width="22" height="6" rx="2" fill="#5d4037"/><rect x="${x - 9}" y="${y + 20}" width="18" height="24" rx="4" fill="#fff59d" stroke="#5d4037" stroke-width="2"/><ellipse cx="${x}" cy="${y + 32}" rx="5" ry="7" fill="#ffb300"/><rect x="${x - 11}" y="${y + 44}" width="22" height="5" rx="2" fill="#5d4037"/>`;
    case 'parasol': return `<path d="M${x},${y + 10} L${x},${y - 60}" stroke="#795548" stroke-width="2.5"/><path d="M${x - 42},${y - 56} Q${x},${y - 104} ${x + 42},${y - 56} Q${x + 28},${y - 64} ${x + 14},${y - 56} Q${x},${y - 64} ${x - 14},${y - 56} Q${x - 28},${y - 64} ${x - 42},${y - 56}Z" fill="#f8bbd0" stroke="#ec407a" stroke-width="2"/><path d="M${x + 4},${y + 10} q0,8 -6,8" stroke="#795548" stroke-width="2.5" fill="none"/>`;
    case 'sword': return `<path d="M${x - 3},${y - 8} L${x - 3},${y - 62} L${x},${y - 70} L${x + 3},${y - 62} L${x + 3},${y - 8}Z" fill="#e0e0e0" stroke="#9e9e9e"/><rect x="${x - 12}" y="${y - 10}" width="24" height="5" rx="2" fill="#ffc93c"/><rect x="${x - 2.5}" y="${y - 6}" width="5" height="14" fill="#8d6e63"/><circle cx="${x}" cy="${y + 9}" r="3.5" fill="#ffc93c"/>`;
    case 'book': return `<g transform="translate(${x} ${y - 8}) rotate(-10)"><rect x="-14" y="-16" width="28" height="34" rx="3" fill="#7e57c2"/><rect x="-11" y="-13" width="22" height="28" rx="2" fill="#9575cd"/><path d="${starPath(0, 0, 7, 3)}" fill="#ffd54f"/></g>`;
    case 'cupcake': return `<path d="M${x - 11},${y - 6} L${x - 8},${y + 12} L${x + 8},${y + 12} L${x + 11},${y - 6}Z" fill="#4fc3f7"/><path d="M${x - 13},${y - 6} Q${x - 14},${y - 18} ${x - 4},${y - 20} Q${x},${y - 30} ${x + 6},${y - 20} Q${x + 15},${y - 18} ${x + 13},${y - 6}Z" fill="#f8bbd0"/><circle cx="${x}" cy="${y - 28}" r="4" fill="#e53935"/><circle cx="${x - 5}" cy="${y - 12}" r="1.3" fill="#fff59d"/><circle cx="${x + 5}" cy="${y - 14}" r="1.3" fill="#81d4fa"/>`;
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
  s += `<circle cx="${hx}" cy="${hy}" r="6.8" fill="${skin}"/>`;
  if (!L && itemId) s = s + item(itemId, hx, hy - 2);
  return `<g class="p-arm${side}">${s}</g>`;
}

function face(st) {
  const sk = st.skinColor, eye = st.eyes;
  const blush = shade('#ff8a80', 0.25);
  let s = `<circle cx="64" cy="88" r="7" fill="${sk}"/><circle cx="136" cy="88" r="7" fill="${sk}"/>`;
  s += `<ellipse cx="100" cy="84" rx="36" ry="37" fill="${sk}"/>`;
  s += `<ellipse cx="79" cy="101" rx="7" ry="4.5" fill="${blush}" opacity=".55"/><ellipse cx="121" cy="101" rx="7" ry="4.5" fill="${blush}" opacity=".55"/>`;
  s += `<g class="p-eyes">`;
  for (const x of [86, 114]) {
    s += `<ellipse cx="${x}" cy="89" rx="6.6" ry="8.6" fill="#2a1a14"/><ellipse cx="${x}" cy="90.5" rx="5" ry="6.2" fill="${eye}"/><circle cx="${x}" cy="91" r="2.6" fill="#1a0f0b"/><circle cx="${x + 2.4}" cy="86" r="2.4" fill="#fff"/><circle cx="${x - 2.2}" cy="93.5" r="1.1" fill="#fff"/>`;
    if (st.lashes) {
      const o = x < 100 ? -1 : 1;
      s += `<path d="M${x + o * 5},${83} l${o * 4},-3 M${x + o * 6.3},${86} l${o * 4.5},-1.5" stroke="#2a1a14" stroke-width="1.8" stroke-linecap="round"/>`;
    }
  }
  s += `</g>`;
  const bc = shade(st.hairColor, -0.25);
  s += `<path d="M79,76 Q86,72 93,75 M107,75 Q114,72 121,76" stroke="${bc}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M98,98 Q100,100 102,98" stroke="${shade(sk, -0.2)}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  s += `<path class="p-mouth" d="M91,105 Q100,115 109,105 Q100,108.5 91,105Z" fill="#d84a4a" stroke="#b23a3a" stroke-width="1.4" stroke-linejoin="round"/>`;
  return s;
}

// st: { skinColor, hair, hairColor, eyes, lashes, outfit, hat, shoes, item, cape }
function drawCharacter(st) {
  const o = byId(OUTFITS, st.outfit);
  const sh = byId(SHOES, st.shoes);
  const sk = st.skinColor;
  const P = outfitParts(o, sk);
  const legCol = P.legCol;
  const leg = (side) => {
    const x = side === 'L' ? 92 : 108, dir = side === 'L' ? -1 : 1;
    let pants = `<rect x="${x - 7.5}" y="198" width="15" height="${o.pants ? 120 : 124}" rx="7" fill="${legCol}"/>`;
    if (o.pants) pants += `<rect x="${x - 8.5}" y="${306}" width="17" height="6" rx="3" fill="${shade(legCol, -0.12)}"/>`;
    if (o.type === 'pajamas') pants += patternFill(o.pattern, `M${x - 7.5},198 h15 v120 h-15Z`, P.colors, [x - 8, 196, x + 8, 320]);
    return `<g class="p-leg${side}">${pants}${shoe(sh, x, 320, dir, sk)}</g>`;
  };
  const hTop = HAIR_TOP[st.hair] || 0;
  return `
  <g class="p-all"><g class="p-body">
    ${cape(st.cape)}
    <g class="p-head">${hairBack(st.hair, st.hairColor)}</g>
    ${leg('L')}${leg('R')}
    <g class="p-skirt">${P.skirt}</g>
    <rect x="93.5" y="108" width="13" height="26" rx="5" fill="${sk}"/><path d="M93.5,116 Q100,121 106.5,116" stroke="${shade(sk, -0.12)}" stroke-width="3" fill="none"/>
    ${P.torso}
    ${capeCollar(st.cape)}
    ${arm('L', o, sk)}${arm('R', o, sk, st.item)}
    <g class="p-head">${face(st)}${hairFront(st.hair, st.hairColor)}${hat(st.hat, hTop)}</g>
  </g></g>`;
}

// ---------- pets (120 x 120 box) ----------
function drawPet(id) {
  const eyes = (x1, x2, y, c = '#2a1a14') => `<circle cx="${x1}" cy="${y}" r="4" fill="${c}"/><circle cx="${x2}" cy="${y}" r="4" fill="${c}"/><circle cx="${x1 + 1.3}" cy="${y - 1.4}" r="1.4" fill="#fff"/><circle cx="${x2 + 1.3}" cy="${y - 1.4}" r="1.4" fill="#fff"/>`;
  const smile = (x, y) => `<path d="M${x - 5},${y} Q${x - 2.5},${y + 4} ${x},${y} Q${x + 2.5},${y + 4} ${x + 5},${y}" stroke="#4e342e" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  let s = '';
  switch (id) {
    case 'kitty': s = `<path class="pet-tail" d="M84,92 Q112,90 104,60" stroke="#ffb74d" stroke-width="9" fill="none" stroke-linecap="round"/><ellipse cx="60" cy="92" rx="26" ry="20" fill="#ffb74d"/><path d="M34,46 L38,18 L56,36Z M86,46 L82,18 L64,36Z" fill="#ffb74d"/><path d="M40,38 L41,26 L50,34Z M80,38 L79,26 L70,34Z" fill="#f8bbd0"/><circle cx="60" cy="52" r="27" fill="#ffb74d"/><path d="M42,40 l8,4 M60,30 v8 M78,40 l-8,4" stroke="#f57c00" stroke-width="3" stroke-linecap="round"/>` + eyes(50, 70, 52) + `<path d="M57,60 L63,60 L60,63Z" fill="#f06292"/>` + smile(60, 64) + `<path d="M36,60 l-12,-2 M36,64 l-12,2 M84,60 l12,-2 M84,64 l12,2" stroke="#fff" stroke-width="1.5"/>`; break;
    case 'puppy': s = `<path class="pet-tail" d="M84,88 Q104,84 100,66" stroke="#d7a86e" stroke-width="8" fill="none" stroke-linecap="round"/><ellipse cx="60" cy="92" rx="26" ry="20" fill="#d7a86e"/><circle cx="60" cy="54" r="27" fill="#d7a86e"/><ellipse cx="34" cy="56" rx="10" ry="20" fill="#8d6e63"/><ellipse cx="86" cy="56" rx="10" ry="20" fill="#8d6e63"/><ellipse cx="60" cy="66" rx="13" ry="10" fill="#f5e1c8"/>` + eyes(50, 70, 50) + `<ellipse cx="60" cy="61" rx="5" ry="3.6" fill="#3e2723"/><path d="M60,64 v4" stroke="#3e2723" stroke-width="1.6"/><ellipse cx="60" cy="74" rx="4" ry="5" fill="#f06292"/>`; break;
    case 'bunny': s = `<circle class="pet-tail" cx="86" cy="96" r="8" fill="#fff"/><ellipse cx="60" cy="94" rx="24" ry="18" fill="#f5f5f5"/><ellipse cx="48" cy="18" rx="8" ry="22" fill="#f5f5f5"/><ellipse cx="48" cy="20" rx="4" ry="16" fill="#f8bbd0"/><ellipse cx="72" cy="18" rx="8" ry="22" fill="#f5f5f5"/><ellipse cx="72" cy="20" rx="4" ry="16" fill="#f8bbd0"/><circle cx="60" cy="56" r="25" fill="#f5f5f5"/>` + eyes(50, 70, 54) + `<path d="M57,62 L63,62 L60,65Z" fill="#f06292"/>` + smile(60, 66) + `<ellipse cx="44" cy="64" rx="5" ry="3" fill="#f8bbd0"/><ellipse cx="76" cy="64" rx="5" ry="3" fill="#f8bbd0"/>`; break;
    case 'fox': s = `<path class="pet-tail" d="M82,96 Q118,96 110,62 Q104,80 84,86Z" fill="#ff7043"/><path d="M104,66 Q110,62 110,62 Q112,72 106,76Z" fill="#fff"/><ellipse cx="60" cy="94" rx="24" ry="18" fill="#ff7043"/><path d="M32,44 L36,14 L56,34Z M88,44 L84,14 L64,34Z" fill="#ff7043"/><path d="M34,54 Q60,24 86,54 Q74,84 60,84 Q46,84 34,54Z" fill="#ff7043"/><path d="M40,60 Q60,70 80,60 Q72,82 60,82 Q48,82 40,60Z" fill="#fff"/>` + eyes(50, 70, 54) + `<circle cx="60" cy="72" r="3.6" fill="#3e2723"/>`; break;
    case 'unicorn': s = `<ellipse cx="62" cy="92" rx="30" ry="18" fill="#fafafa"/><rect x="40" y="98" width="8" height="20" rx="4" fill="#fafafa"/><rect x="74" y="98" width="8" height="20" rx="4" fill="#fafafa"/><path class="pet-tail" d="M90,88 Q112,90 108,112 Q100,98 92,98Z" fill="#ce93d8"/><path d="M40,90 L42,48 L64,60Z" fill="#fafafa"/><ellipse cx="44" cy="44" rx="20" ry="16" fill="#fafafa"/><ellipse cx="32" cy="50" rx="9" ry="8" fill="#f8bbd0"/><path d="M50,30 L58,4 L58,32Z" fill="#ffd54f"/><path d="M52,24 L58,22 M53,17 L58,15" stroke="#ffb300" stroke-width="1.5"/><path d="M58,32 Q72,36 70,52 Q76,64 66,76" stroke="#f48fb1" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M62,34 Q78,42 74,58" stroke="#81d4fa" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M52,30 L56,22 L60,30Z" fill="#fafafa"/><circle cx="44" cy="42" r="3.6" fill="#2a1a14"/><circle cx="45" cy="41" r="1.2" fill="#fff"/>`; break;
    case 'dragon': s = `<path class="pet-tail" d="M84,98 Q110,104 108,80 L114,74 L104,74Z" fill="#66bb6a"/><path d="M30,72 L8,50 L22,82Z M90,72 L112,50 L98,82Z" fill="#a5d6a7"/><ellipse cx="60" cy="92" rx="26" ry="21" fill="#66bb6a"/><ellipse cx="60" cy="96" rx="15" ry="14" fill="#fff59d"/><circle cx="60" cy="52" r="26" fill="#66bb6a"/><path d="M42,32 L40,18 L50,28Z M78,32 L80,18 L70,28Z" fill="#fff59d"/>` + eyes(50, 70, 50) + `<ellipse cx="60" cy="64" rx="12" ry="7" fill="#81c784"/><circle cx="55" cy="63" r="1.6" fill="#2e7d32"/><circle cx="65" cy="63" r="1.6" fill="#2e7d32"/>` + smile(60, 70); break;
    case 'owl': s = `<ellipse cx="60" cy="72" rx="32" ry="38" fill="#8d6e63"/><ellipse cx="60" cy="84" rx="20" ry="22" fill="#d7ccc8"/><path d="M30,40 L36,24 L48,38Z M90,40 L84,24 L72,38Z" fill="#8d6e63"/><circle cx="46" cy="52" r="13" fill="#fff"/><circle cx="74" cy="52" r="13" fill="#fff"/>` + eyes(46, 74, 52) + `<path d="M56,62 L64,62 L60,70Z" fill="#ffb300"/><path class="pet-tail" d="M28,70 Q16,86 30,98 M92,70 Q104,86 90,98" stroke="#6d4c41" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M50,110 v6 M56,110 v6 M64,110 v6 M70,110 v6" stroke="#ffb300" stroke-width="3" stroke-linecap="round"/>`; break;
    case 'penguin': s = `<ellipse cx="60" cy="70" rx="30" ry="42" fill="#263238"/><ellipse cx="60" cy="78" rx="20" ry="32" fill="#fff"/><path class="pet-tail" d="M30,64 Q18,82 26,96 M90,64 Q102,82 94,96" stroke="#263238" stroke-width="9" fill="none" stroke-linecap="round"/>` + eyes(52, 68, 52) + `<path d="M54,60 L66,60 L60,68Z" fill="#ffa726"/><ellipse cx="50" cy="112" rx="9" ry="4" fill="#ffa726"/><ellipse cx="70" cy="112" rx="9" ry="4" fill="#ffa726"/><ellipse cx="46" cy="64" rx="4" ry="2.5" fill="#f8bbd0"/><ellipse cx="74" cy="64" rx="4" ry="2.5" fill="#f8bbd0"/>`; break;
    default: return '';
  }
  return `<g class="pet-body">${s}</g>`;
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
      s += `<path d="M400,0 V40" stroke="#ffd54f" stroke-width="3"/><path d="M340,40 Q400,90 460,40Z" fill="#ffe082"/>` + [350, 375, 400, 425, 450].map(x => `<circle cx="${x}" cy="62" r="5" fill="#fff"/>`).join('');
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
