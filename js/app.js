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
    return { friend: f.id, skin: f.skin, hair: f.hair, hairColor: f.hairColor, eyes: f.eyes, lashes: f.lashes, ...f.look };
  }
  let S = { ...friendState(FRIENDS[0]), stage: 'ballroom', dance: 'twirl', track: 'pop', tab: 'friends' };
  try { const saved = JSON.parse(localStorage.getItem(SAVE_KEY)); if (saved && saved.friend) S = { ...S, ...saved }; } catch (e) {}
  const save = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} };

  let dancing = false, mixTimer = null, noteTimer = null;
  const charView = st => ({ ...st, skinColor: SKIN[st.skin] });

  // ---------- rendering ----------
  function renderHero() {
    $('#char').innerHTML = drawCharacter(charView(S));
    $('#pet').innerHTML = drawPet(S.pet);
    $('#petwrap').style.display = S.pet === 'none' ? 'none' : '';
    $('#bg svg').innerHTML = drawStage(S.stage);
    $('#nameTag').textContent = byId(FRIENDS, S.friend).name;
  }

  const svg = (vb, inner) => `<svg viewBox="${vb}" aria-hidden="true">${inner}</svg>`;
  const FULL = '-10 -30 220 375', BODY = '-6 36 212 300', HEAD = '28 -6 144 144', FEET = '62 272 76 64';
  const tile = (id, label, art, sel, extra = '') => `<button class="tile${sel ? ' sel' : ''}${extra}" data-id="${id}"><div class="art">${art}</div><span>${label}</span></button>`;

  function tilesFor(tab) {
    const cv = charView(S);
    switch (tab) {
      case 'friends': return FRIENDS.map(f => tile(f.id, f.name.replace(/^(Princess|Prince) /, ''), svg('30 -10 140 175', drawCharacter(charView(friendState(f)))), S.friend === f.id)).join('');
      case 'outfit': return OUTFITS.map(o => tile(o.id, o.name, svg(BODY, drawCharacter({ ...cv, outfit: o.id, item: 'none', cape: 'none' })), S.outfit === o.id)).join('');
      case 'hair':
        return `<div class="swatches">${HAIR_COLORS.map(c => `<button class="swatch${S.hairColor === c ? ' sel' : ''}" data-color="${c}" style="background:${c}" aria-label="hair color"></button>`).join('')}</div>` +
          HAIR_STYLES.map(h => tile(h.id, h.name, svg('20 -14 160 240', drawCharacter({ ...cv, hair: h.id, hat: 'none', item: 'none' })), S.hair === h.id)).join('');
      case 'hat': return HATS.map(h => tile(h.id, h.name, svg('20 -34 160 170', drawCharacter({ ...cv, hat: h.id, item: 'none' })), S.hat === h.id)).join('');
      case 'shoes': return SHOES.map(h => tile(h.id, h.name, svg(FEET, drawCharacter({ ...cv, outfit: 'bluetunic', shoes: h.id, cape: 'none', item: 'none' })), S.shoes === h.id)).join('');
      case 'item': return ITEMS.map(h => tile(h.id, h.name, h.id === 'none' ? '<div class="none">✖️</div>' : svg('78 70 100 160', item(h.id, 128, 199)), S.item === h.id)).join('');
      case 'cape': return CAPES.map(h => tile(h.id, h.name, svg(BODY, drawCharacter({ ...cv, cape: h.id, item: 'none' })), S.cape === h.id)).join('');
      case 'pet': return PETS.map(h => tile(h.id, h.name, h.id === 'none' ? '<div class="none">✖️</div>' : svg('0 0 120 120', drawPet(h.id)), S.pet === h.id)).join('');
      case 'stage': return STAGES.map(h => tile(h.id, h.name, `<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">${drawStage(h.id)}</svg>`, S.stage === h.id, ' wide')).join('');
      case 'dance': return DANCES.map(d => tile(d.id, d.name, `<div class="emoji">${d.emoji}</div>`, S.dance === d.id && dancing)).join('');
      case 'music': return TRACKS.map(t => tile(t.id, t.name, `<div class="emoji">${t.emoji}</div>`, S.track === t.id && dancing)).join('');
    }
    return '';
  }

  function renderTabs() {
    $('#tabs').innerHTML = TABS.map(t => `<button class="tab${S.tab === t.id ? ' sel' : ''}" data-tab="${t.id}"><span class="ti">${t.icon}</span><span class="tl">${t.label}</span></button>`).join('');
  }
  function renderItems(keepScroll) {
    const box = $('#items'), top = box.scrollTop;
    box.className = 'items tab-' + S.tab;
    box.innerHTML = tilesFor(S.tab);
    box.scrollTop = keepScroll ? top : 0;
    if (S.tab === 'item') box.querySelectorAll('.art svg').forEach(el => {
      try { const b = el.getBBox(), pad = 8, side = Math.max(b.width, b.height) + pad * 2;
        el.setAttribute('viewBox', `${b.x + b.width / 2 - side / 2} ${b.y + b.height / 2 - side / 2} ${side} ${side}`); } catch (e) {}
    });
  }
  function renderAll(keepScroll) { renderHero(); renderTabs(); renderItems(keepScroll); save(); }

  // ---------- dancing ----------
  const danceIds = DANCES.filter(d => d.id !== 'party').map(d => d.id);
  function setMove(id) {
    const hero = $('#hero');
    hero.className = hero.className.replace(/\bm-\S+/g, '').trim();
    void hero.offsetWidth; // restart animations
    hero.classList.add('m-' + id);
  }
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
    if (sw) { S.hairColor = sw.dataset.color; renderAll(true); return; }
    const b = e.target.closest('.tile'); if (!b) return;
    const id = b.dataset.id;
    switch (S.tab) {
      case 'friends': Object.assign(S, friendState(byId(FRIENDS, id))); break;
      case 'outfit': S.outfit = id; break;
      case 'hair': S.hair = id; break;
      case 'hat': S.hat = id; break;
      case 'shoes': S.shoes = id; break;
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
    S.outfit = pick(OUTFITS); S.hat = pick(HATS); S.shoes = pick(SHOES.filter(s => s.id !== 'barefoot'));
    S.item = pick(ITEMS); S.cape = Math.random() < 0.35 ? pick(CAPES) : 'none';
    S.hairColor = Math.random() < 0.3 ? HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)] : S.hairColor;
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

  renderAll();
})();
