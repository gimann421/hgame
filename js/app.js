// Game logic: dressing up, choosing friends, and dancing at any time.
(() => {
  const $ = s => document.querySelector(s);
  const SAVE_KEY = 'royal-dance-party-v1';

  const TABS = [
    { id: 'friends', icon: '👑', label: 'Friends' },
    { id: 'outfit', icon: '👗', label: 'Outfits' },
    { id: 'hair', icon: '💇', label: 'Hair' },
    { id: 'hat', icon: '🎀', label: 'Hats' },
    { id: 'shoes', icon: '👠', label: 'Shoes' },
    { id: 'item', icon: '🪄', label: 'Hold' },
    { id: 'cape', icon: '🦸', label: 'Capes' },
    { id: 'pet', icon: '🐱', label: 'Pets' },
    { id: 'stage', icon: '🏰', label: 'Places' },
    { id: 'dance', icon: '💃', label: 'Dances' },
    { id: 'music', icon: '🎵', label: 'Music' }
  ];

  function friendState(f) {
    return { friend: f.id, kind: f.kind, skin: f.skin, hair: f.hair, hairColor: f.hairColor, eyes: f.eyes, lashes: f.lashes, outfitColor: 'orig', ...f.look };
  }
  let S = { ...friendState(FRIENDS[0]), stage: 'ballroom', dance: 'twirl', track: 'pop', tab: 'friends', names: {} };
  try { const saved = JSON.parse(localStorage.getItem(SAVE_KEY)); if (saved && saved.friend) S = { ...S, ...saved }; } catch (e) {}
  if (!S.names || typeof S.names !== 'object') S.names = {};
  // An old or damaged save must never break the game: drop anything unknown.
  {
    const ok = (list, v) => list.some(x => x.id === v);
    const base = friendState(byId(FRIENDS, S.friend));
    if (!ok(FRIENDS, S.friend)) Object.assign(S, base);
    if (S.hair === 'none' && base.hair !== 'none') S.hair = base.hair;
    for (const [k, list] of [['outfit', outfitsFor(S.kind)], ['hair', [...HAIR_STYLES, { id: 'none' }]], ['hat', HATS], ['shoes', SHOES], ['item', ITEMS], ['cape', CAPES], ['pet', PETS]])
      if (!ok(list, S[k])) S[k] = ok(list, base[k]) ? base[k] : list[0].id;
    if (S.kind === 'snowman' && (S.tab === 'hair' || S.tab === 'shoes')) S.tab = 'outfit';
    if (!ok(STAGES, S.stage)) S.stage = 'ballroom';
    if (!ok(DANCES, S.dance)) S.dance = 'twirl';
    if (!ok(TRACKS, S.track)) S.track = 'pop';
    if (!ok(TABS, S.tab)) S.tab = 'friends';
    if (!SKIN[S.skin]) S.skin = base.skin;
    if (!OUTFIT_COLORS.some(c => c.id === S.outfitColor)) S.outfitColor = 'orig';
    if (typeof S.hairColor !== 'string' || !/^#[0-9a-f]{3,8}$/i.test(S.hairColor)) S.hairColor = base.hairColor;
    for (const id of Object.keys(S.names)) if (!ok(FRIENDS, id) || typeof S.names[id] !== 'string') delete S.names[id];
  }
  // Snowman-only outfits (No Scarf) stay out of everyone else's list, and sit first for Flurry.
  function outfitsFor(kind) {
    const shared = OUTFITS.filter(o => !o.forKind);
    if (kind !== 'snowman') return shared;
    return OUTFITS.filter(o => o.forKind === 'snowman').concat(shared);
  }
  function outfitName(o) {
    return S.kind === 'snowman' && SNOW_OUTFIT_NAMES[o.id] ? SNOW_OUTFIT_NAMES[o.id] : o.name;
  }
  // Flurry has twigs and snowball feet, so Hair and Shoes are not offered. Other friends see every tab.
  function tabsForState() {
    return S.kind === 'snowman' ? TABS.filter(t => t.id !== 'hair' && t.id !== 'shoes') : TABS;
  }
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const nameOf = id => S.names[id] || byId(FRIENDS, id).name;
  const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} };

  let dancing = false, mixTimer = null, noteTimer = null;
  const charView = st => ({ ...st, skinColor: SKIN[st.skin] });

  // ---------- rendering ----------
  let spinCache = {}, shownYaw = 0;
  function renderHero() {
    spinCache = {};
    $('#char').innerHTML = drawCharacter(charView(S), 0); shownYaw = 0; lastKey = '';
    $('#pet').innerHTML = drawPet(S.pet);
    $('#petwrap').style.display = S.pet === 'none' ? 'none' : '';
    $('#bg svg').innerHTML = drawStage(S.stage);
    $('#nameText').textContent = nameOf(S.friend);
  }

  const svg = (vb, inner) => `<svg viewBox="${vb}" aria-hidden="true">${inner}</svg>`;
  const FULL = '-10 -30 220 375', BODY = '-6 36 212 300', HEAD = '28 -6 144 144', FEET = '62 272 76 64';
  // Things that suit the chosen friend get a star (see FAVORITES)
  const favs = () => {
    const f = FAVORITES[S.friend]; if (!f) return null;
    const fr = byId(FRIENDS, S.friend), own = { ...fr.look, hair: fr.hair };
    if (fr.kind === 'snowman') delete own.outfit;
    const out = {};
    for (const k of ['outfit', 'color', 'hair', 'hat', 'shoes', 'item', 'cape', 'pet']) out[k] = new Set([...(f[k] || []), own[k]].filter(v => v && v !== 'none'));
    return out;
  };
  let FAV = null;
  const STAR = '<i class="favstar" aria-label="favorite">⭐</i>';
  const tile = (id, label, art, sel, extra = '', fav = false) => `<button class="tile${sel ? ' sel' : ''}${fav ? ' fav' : ''}${extra}" data-id="${id}">${fav ? STAR : ''}<div class="art">${art}</div><span>${label}</span></button>`;
  const isFav = (k, id) => !!(FAV && FAV[k] && FAV[k].has(id));

  function tilesFor(tab) {
    const cv = charView(S);
    FAV = favs();
    switch (tab) {
      case 'friends': return FRIENDS.map(f => tile(f.id, S.names[f.id] ? esc(S.names[f.id]) : f.name.replace(/^(Princess|Prince|Snow Queen) /, '').replace(/ the .*$/, ''), svg('30 -10 140 175', drawCharacter(charView(friendState(f)))), S.friend === f.id)).join('');
      case 'outfit': return `<div class="swatches">${OUTFIT_COLORS.map(c => `<button class="swatch oc${c.glitter ? ' glitter' : ''}${c.id === 'orig' ? ' orig' : ''}${(S.outfitColor || 'orig') === c.id ? ' sel' : ''}${isFav('color', c.id) ? ' fav' : ''}" data-oc="${c.id}" style="${c.main ? `--c:${c.main};--c2:${c.top || c.main}` : ''}" aria-label="${c.name}" title="${c.name}">${c.id === 'orig' ? '↺' : ''}${isFav('color', c.id) ? STAR : ''}</button>`).join('')}</div>` +
        outfitsFor(S.kind).map(o => tile(o.id, outfitName(o), svg(BODY, drawCharacter({ ...cv, outfit: o.id, item: 'none', cape: 'none' })), S.outfit === o.id, '', isFav('outfit', o.id))).join('');
      case 'hair':
        return `<div class="swatches">${HAIR_COLORS.map(c => `<button class="swatch${S.hairColor === c ? ' sel' : ''}" data-color="${c}" style="background:${c}" aria-label="hair color"></button>`).join('')}</div>` +
          HAIR_STYLES.map(h => tile(h.id, h.name, svg('20 -14 160 240', drawCharacter({ ...cv, hair: h.id, hat: 'none', item: 'none' })), S.hair === h.id, '', isFav('hair', h.id))).join('');
      case 'hat': return HATS.map(h => tile(h.id, h.name, svg('20 -34 160 170', drawCharacter({ ...cv, hat: h.id, item: 'none' })), S.hat === h.id, '', isFav('hat', h.id))).join('');
      case 'shoes': return SHOES.map(h => tile(h.id, h.name, svg(FEET, drawCharacter({ ...cv, outfit: 'bluetunic', shoes: h.id, cape: 'none', item: 'none' })), S.shoes === h.id, '', isFav('shoes', h.id))).join('');
      case 'item': return ITEMS.map(h => tile(h.id, h.name, h.id === 'none' ? '<div class="none">✖️</div>' : svg('78 70 100 160', item(h.id, 128, 199)), S.item === h.id, '', isFav('item', h.id))).join('');
      case 'cape': return CAPES.map(h => tile(h.id, h.name, svg(BODY, drawCharacter({ ...cv, cape: h.id, item: 'none' })), S.cape === h.id, '', isFav('cape', h.id))).join('');
      case 'pet': return PETS.map(h => tile(h.id, h.name, h.id === 'none' ? '<div class="none">✖️</div>' : svg('0 0 120 120', drawPet(h.id)), S.pet === h.id, '', isFav('pet', h.id))).join('');
      case 'stage': return STAGES.map(h => tile(h.id, h.name, `<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">${drawStage(h.id)}</svg>`, S.stage === h.id, ' wide')).join('');
      case 'dance': return DANCES.map(d => tile(d.id, d.name, `<div class="emoji">${d.emoji}</div>`, S.dance === d.id && dancing)).join('');
      case 'music': return TRACKS.map(t => tile(t.id, t.name, `<div class="emoji">${t.emoji}</div>`, S.track === t.id && dancing)).join('');
    }
    return '';
  }

  function renderTabs() {
    const tabs = tabsForState();
    if (!tabs.some(t => t.id === S.tab)) S.tab = 'outfit';
    $('#tabs').innerHTML = tabs.map(t => `<button class="tab${S.tab === t.id ? ' sel' : ''}" data-tab="${t.id}"><span class="ti">${t.icon}</span><span class="tl">${t.label}</span></button>`).join('');
  }
  function renderItems(keepScroll) {
    const box = $('#items');
    box.className = 'items tab-' + S.tab;
    box.innerHTML = tilesFor(S.tab);
    if (!keepScroll) { // jump back to the top of the list when switching tabs
      const portrait = window.matchMedia('(orientation: portrait)').matches;
      const pinned = portrait ? $('#stage').getBoundingClientRect().bottom + 12 : 12;
      const y = $('#panel').getBoundingClientRect().top + window.scrollY - pinned;
      if (window.scrollY > y) window.scrollTo(0, Math.max(0, y));
    }
    if (S.tab === 'item') box.querySelectorAll('.art svg').forEach(el => {
      try { const b = el.getBBox(), pad = 8, side = Math.max(b.width, b.height) + pad * 2;
        el.setAttribute('viewBox', `${b.x + b.width / 2 - side / 2} ${b.y + b.height / 2 - side / 2} ${side} ${side}`); } catch (e) {}
    });
  }
  function renderAll(keepScroll) { renderHero(); renderTabs(); renderItems(keepScroll); save(); }

  // ---------- dancing ----------
  const danceIds = DANCES.filter(d => d.id !== 'party').map(d => d.id);
  // Spinning dances turn her around for real: she is redrawn at each angle,
  // and her arms are posed here (in her own body) so they swing round in 3D.
  const wave = (t, period) => Math.sin(t / period * Math.PI * 2);
  const SPINS = {
    twirl: { yaw: p => p * 360, arms: (t, b) => { const a = 132 + 17 * wave(t, b * 2); return { armL: a, armR: a }; } },
    ballet: { yaw: p => p * 360, arms: (t, b) => { const a = 154 + 13 * wave(t, b * 2); return { armL: a, armR: a }; } },
    shimmy: { yaw: p => p < 0.6 ? 0 : (1 - Math.cos((p - 0.6) / 0.4 * Math.PI)) / 2 * 360, arms: (t, b) => { const a = 137 + 7 * wave(t, b / 2); return { armL: a, armR: a }; } }
  };
  let moveId = 'none', moveStart = 0;
  function setMove(id) {
    const hero = $('#hero');
    hero.className = hero.className.replace(/\bm-\S+/g, '').replace(/\bspin\b/, '').trim();
    void hero.offsetWidth; // restart animations
    hero.classList.add('m-' + id);
    moveId = id; moveStart = performance.now();
    hero.style.setProperty('--el', '0ms');
    lastKey = '';
    if (SPINS[id]) hero.classList.add('spin');
    else if (shownYaw !== 0) { shownYaw = 0; $('#char').innerHTML = drawCharacter(charView(S), 0); }
  }
  let lastDraw = 0, lastKey = '';
  function spinFrame(now) {
    requestAnimationFrame(spinFrame);
    const spin = SPINS[moveId];
    if (!dancing || !spin || now - lastDraw < 30) return;
    const beatMs = 60000 / byId(TRACKS, S.track).bpm, el = now - moveStart;
    const p = (el % (beatMs * 4)) / (beatMs * 4);
    const yaw = Math.round(spin.yaw(p) / 4) * 4 % 360;
    const pose = spin.arms(el, beatMs);
    pose.armL = Math.round(pose.armL / 2) * 2; pose.armR = Math.round(pose.armR / 2) * 2;
    const key = yaw + '|' + pose.armL + '|' + pose.armR;
    if (key === lastKey) return;
    lastKey = key; lastDraw = now; shownYaw = yaw;
    $('#hero').style.setProperty('--el', Math.round(el) + 'ms');
    $('#char').innerHTML = spinCache[key] || (spinCache[key] = drawCharacter(charView(S), yaw, pose));
  }
  requestAnimationFrame(spinFrame);
  function startDance() {
    const track = byId(TRACKS, S.track);
    Music.play(track);
    $('#stage').style.setProperty('--beat', (60 / track.bpm) + 's');
    dancing = true;
    $('#stage').classList.add('dancing');
    clearInterval(mixTimer);
    if (S.dance === 'party') {
      let i = 0; setMove(danceIds[0]);
      mixTimer = setInterval(() => { i = (i + 1) % danceIds.length; setMove(danceIds[i]); }, (60 / track.bpm) * 8 * 1000);
    } else setMove(S.dance);
    $('#danceBtn').innerHTML = '<span>⏹️</span> Stop';
    $('#danceBtn').classList.add('on');
    if (!noteTimer) noteTimer = setInterval(spawnNote, 420);
  }
  function stopDance() {
    dancing = false;
    Music.stop();
    clearInterval(mixTimer); clearInterval(noteTimer); noteTimer = null;
    $('#stage').classList.remove('dancing');
    setMove('none');
    $('#danceBtn').innerHTML = '<span>💃</span> Dance!';
    $('#danceBtn').classList.remove('on');
  }
  Music.onBeat = () => { if (dancing) { const s = $('#stage'); s.classList.remove('beat'); void s.offsetWidth; s.classList.add('beat'); } };

  // ---------- sparkles ----------
  function spawnNote() {
    const fx = $('#fx'), el = document.createElement('span');
    el.className = 'note';
    el.textContent = ['♪', '♫', '♬', '✨', '💖', '⭐'][Math.floor(Math.random() * 6)];
    el.style.left = (8 + Math.random() * 84) + '%';
    el.style.color = ['#fff', '#ff80ab', '#ffd54f', '#b388ff', '#80d8ff'][Math.floor(Math.random() * 5)];
    el.style.fontSize = (22 + Math.random() * 22) + 'px';
    fx.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }
  function burst(x, y) {
    const fx = $('#fx'), r = fx.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
      const el = document.createElement('span'), a = Math.PI * 2 * i / 10, d = 50 + Math.random() * 40;
      el.className = 'spark';
      el.textContent = ['✦', '✧', '★', '♥'][i % 4];
      el.style.left = (x - r.left) + 'px'; el.style.top = (y - r.top) + 'px';
      el.style.setProperty('--dx', Math.cos(a) * d + 'px'); el.style.setProperty('--dy', Math.sin(a) * d + 'px');
      el.style.color = ['#fff59d', '#ff80ab', '#80d8ff', '#ffffff', '#b388ff'][i % 5];
      fx.appendChild(el);
      setTimeout(() => el.remove(), 900);
    }
  }

  // ---------- input ----------
  let unlocked = false;
  document.addEventListener('pointerdown', () => { if (!unlocked) { Music.unlock(); unlocked = true; } }, { capture: true });
  document.addEventListener('dblclick', e => e.preventDefault());
  document.addEventListener('gesturestart', e => e.preventDefault());

  $('#tabs').addEventListener('click', e => {
    const b = e.target.closest('.tab'); if (!b) return;
    S.tab = b.dataset.tab; renderTabs(); renderItems(); save();
  });
  $('#items').addEventListener('click', e => {
    const sw = e.target.closest('.swatch');
    if (sw && sw.dataset.oc) { S.outfitColor = sw.dataset.oc; Music.chime(); renderAll(true); return; }
    if (sw) { S.hairColor = sw.dataset.color; renderAll(true); return; }
    const b = e.target.closest('.tile'); if (!b) return;
    const id = b.dataset.id;
    switch (S.tab) {
      case 'friends': Object.assign(S, friendState(byId(FRIENDS, id))); break;
      case 'outfit': S.outfit = id; break;
      case 'hair': if (S.kind === 'snowman') return; S.hair = id; break;
      case 'hat': S.hat = id; break;
      case 'shoes': if (S.kind === 'snowman') return; S.shoes = id; break;
      case 'item': S.item = id; break;
      case 'cape': S.cape = id; break;
      case 'pet': S.pet = id; break;
      case 'stage': S.stage = id; break;
      case 'dance': S.dance = id; renderAll(true); startDance(); renderItems(true); return;
      case 'music': S.track = id; renderAll(true); startDance(); renderItems(true); return;
    }
    Music.chime();
    renderAll(true);
    const h = $('#hero'); h.classList.remove('boing'); void h.offsetWidth; h.classList.add('boing');
  });
  $('#danceBtn').addEventListener('click', () => {
    if (dancing) stopDance();
    else { startDance(); if (S.tab !== 'dance' && S.tab !== 'music') { S.tab = 'dance'; renderTabs(); } }
    renderItems(true);
  });
  $('#surprise').addEventListener('click', () => {
    const pick = l => l[Math.floor(Math.random() * l.length)].id;
    S.outfit = pick(outfitsFor(S.kind)); S.hat = pick(HATS);
    S.item = pick(ITEMS); S.cape = Math.random() < 0.35 ? pick(CAPES) : 'none';
    if (S.kind !== 'snowman') {
      S.shoes = pick(SHOES.filter(s => s.id !== 'barefoot'));
      S.outfitColor = Math.random() < 0.45 ? OUTFIT_COLORS[1 + Math.floor(Math.random() * (OUTFIT_COLORS.length - 1))].id : 'orig';
    S.hairColor = Math.random() < 0.3 ? HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)] : S.hairColor;
    }
    Music.chime(); renderAll(true);
    const r = $('#hero').getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height * 0.4);
  });
  $('#stage').addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    burst(e.clientX, e.clientY);
    if (e.target.closest('#hero')) {
      Music.chime();
      const h = $('#hero'); h.classList.remove('boing'); void h.offsetWidth; h.classList.add('boing');
    }
  });

  // ---------- renaming ----------
  const box = $('#renameBox'), input = $('#nameInput');
  $('#nameTag').addEventListener('click', () => {
    input.value = nameOf(S.friend); box.hidden = false; $('#nameTag').hidden = true;
    input.focus(); input.select();
  });
  const closeRename = () => { box.hidden = true; $('#nameTag').hidden = false; input.blur(); renderAll(true); };
  box.addEventListener('submit', e => {
    e.preventDefault();
    const v = input.value.trim().slice(0, 24);
    if (v && v !== byId(FRIENDS, S.friend).name) S.names[S.friend] = v; else delete S.names[S.friend];
    Music.chime(); closeRename();
  });
  $('#nameReset').addEventListener('click', () => { delete S.names[S.friend]; closeRename(); });
  box.addEventListener('pointerdown', e => e.stopPropagation());

  renderAll();
})();
