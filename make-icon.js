const { chromium } = require('playwright');
const OUT = process.argv[2] || 'icon-1024.png';
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1024, height: 1024 } });
  await p.goto('file://' + process.cwd() + '/index.html');
  const svg = await p.evaluate(() => drawCharacter({ skinColor: SKIN[1], hair: 'wavy', hairColor: '#f2c75c', eyes: '#3b7a57', lashes: true, outfit: 'rose', hat: 'crown', shoes: 'pink', item: 'none', cape: 'none' }));
  const star = (x, y, r, c, o = 1) => { const pts = []; for (let i = 0; i < 8; i++) { const a = Math.PI / 4 * i - Math.PI / 2, rr = i % 2 ? r * 0.28 : r; pts.push((x + Math.cos(a) * rr).toFixed(1) + ',' + (y + Math.sin(a) * rr).toFixed(1)); } return `<polygon points="${pts.join(' ')}" fill="${c}" opacity="${o}"/>`; };
  let sparkles = '';
  for (const [x, y, r, c] of [[150, 190, 70, '#fff59d'], [880, 150, 56, '#ffffff'], [870, 560, 44, '#fff59d'], [130, 600, 40, '#ffffff'], [250, 380, 26, '#ffffff'], [790, 360, 30, '#ffe082'], [930, 820, 34, '#ffffff'], [90, 870, 30, '#fff59d']]) sparkles += star(x, y, r, c);
  let dots = '';
  for (let i = 0; i < 40; i++) { const x = (Math.sin(i * 91.7) * 0.5 + 0.5) * 1024, y = (Math.sin(i * 37.3 + 1) * 0.5 + 0.5) * 1024; dots += `<circle cx="${x}" cy="${y}" r="${3 + (i % 4) * 2}" fill="#fff" opacity=".45"/>`; }
  const bg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8ac4"/><stop offset=".55" stop-color="#b36bff"/><stop offset="1" stop-color="#6a3df0"/></linearGradient>
      <radialGradient id="glow" cx=".5" cy=".42" r=".5"><stop offset="0" stop-color="#fff6c7" stop-opacity=".95"/><stop offset=".55" stop-color="#ffd1ec" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="1024" height="1024" fill="url(#g)"/>
    <circle cx="512" cy="450" r="470" fill="url(#glow)"/>
    ${dots}
    <path d="M0,0 H1024 V70 H0Z" fill="#c2185b"/>
    ${Array.from({ length: 8 }, (_, i) => `<path d="M${i * 128},66 Q${i * 128 + 64},150 ${i * 128 + 128},66Z" fill="#d81b60"/><path d="M${i * 128},66 Q${i * 128 + 64},150 ${i * 128 + 128},66" fill="none" stroke="#ffd54f" stroke-width="10"/>`).join('')}
    <path d="M0,68 H1024" stroke="#ffd54f" stroke-width="10"/>
    <g transform="translate(512 172) scale(5.0) translate(-100 -12)">${svg}</g>
    ${sparkles}
  </svg>`;
  await p.setContent(`<body style="margin:0;width:1024px;height:1024px;overflow:hidden">${bg}</body>`);
  await p.screenshot({ path: OUT });
  await b.close();
})();
