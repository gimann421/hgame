// A tiny synthesizer that plays the game's original tunes with the Web Audio API.
const Music = (() => {
  const SCALES = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10], penta: [0, 2, 4, 7, 9] };
  let ctx = null, master = null, noiseBuf = null, timer = null;
  let song = null, step = 0, nextTime = 0, playing = false, onBeat = null;

  const mtof = m => 440 * Math.pow(2, (m - 69) / 12);

  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
      ctx = new AC();
      const comp = ctx.createDynamicsCompressor();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(comp); comp.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state !== 'running') ctx.resume();
    return true;
  }

  function rng(seed) { let s = seed * 9301 + 49297; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }

  // Turn a track description into note lists for one loop.
  function compose(t) {
    const sc = SCALES[t.scale], n = sc.length, spb = t.meter * 2;
    const deg2midi = (d, base) => base + Math.floor(d / n) * 12 + sc[((d % n) + n) % n];
    const r = rng(t.seed);
    const bars = Math.max(8, t.prog.length);
    const chordDeg = b => t.prog[b % t.prog.length];
    const phrase = [];
    let prev = n; // start an octave up from the root
    for (let b = 0; b < 4; b++) {
      const c = chordDeg(b), tones = [c, c + 2, c + 4, c + n, c + 2 + n];
      const bar = [];
      t.rhythm.forEach((st, i) => {
        let d;
        if (i === 0) d = tones.reduce((a, x) => Math.abs(x - prev) < Math.abs(a - prev) ? x : a, tones[0]);
        else { d = prev + [-2, -1, -1, 1, 1, 2, 0][Math.floor(r() * 7)]; }
        d = Math.max(n - 3, Math.min(n * 2 + 2, d));
        bar.push({ st, d }); prev = d;
      });
      phrase.push(bar);
    }
    const melody = [];
    for (let b = 0; b < bars; b++) {
      let bar = phrase[b % 4].map(x => ({ ...x }));
      if (b % 4 === 3 && b >= 4) { // vary the ending
        const c = chordDeg(b);
        bar = bar.map((x, i) => ({ st: x.st, d: i === bar.length - 1 ? (b === bars - 1 ? n : c + n) : x.d + (r() < 0.5 ? 1 : -1) }));
      }
      melody.push(bar);
    }
    const lead = [], bass = [], chords = [];
    for (let b = 0; b < bars; b++) {
      const c = chordDeg(b);
      melody[b].forEach((x, i) => {
        const nextSt = i + 1 < melody[b].length ? melody[b][i + 1].st : spb;
        lead.push({ at: b * spb + x.st, len: Math.min(4, nextSt - x.st), m: deg2midi(x.d, t.key) });
      });
      (t.bass?.steps || []).forEach((st, i) => {
        const oct = t.bass.octaves && i % 2 ? 12 : 0;
        bass.push({ at: b * spb + st, len: 1, m: deg2midi(c, t.key - 24) + oct });
      });
      const tri = [c, c + 2, c + 4].map(d => deg2midi(d, t.key - 12));
      if (t.chords) (t.chords.pad ? [0] : t.chords.steps).forEach(st => chords.push({ at: b * spb + st, len: t.chords.pad ? spb : 1, ms: tri }));
      if (t.arp) for (let st = 0; st < spb; st++) chords.push({ at: b * spb + st, len: 1, ms: [tri[[0, 1, 2, 1][st % 4]] + 12], arp: true });
    }
    return { t, spb, total: bars * spb, lead, bass, chords };
  }

  function voice(freq, time, dur, o) {
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.wave || 'sine';
    osc.frequency.setValueAtTime(freq, time);
    let node = osc;
    if (o.filter) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.filter; osc.connect(f); node = f; }
    node.connect(g); g.connect(master);
    osc.start(time);
    const gain = o.gain || 0.15, a = o.attack || 0.01;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(gain, time + a);
    if (o.bell || o.pluck) {
      g.gain.exponentialRampToValueAtTime(0.0001, time + (o.decay || 0.4));
      osc.stop(time + (o.decay || 0.4) + 0.05);
      if (o.bell) { // add a soft sparkle overtone
        const o2 = ctx.createOscillator(), g2 = ctx.createGain();
        o2.frequency.value = freq * 3; o2.connect(g2); g2.connect(master);
        g2.gain.setValueAtTime(gain * 0.25, time); g2.gain.exponentialRampToValueAtTime(0.0001, time + 0.25);
        o2.start(time); o2.stop(time + 0.3);
      }
    } else {
      const end = time + Math.max(dur, 0.05);
      g.gain.setValueAtTime(gain, end - 0.02 > time + a ? end - 0.02 : time + a);
      g.gain.exponentialRampToValueAtTime(0.0001, end + (o.release || 0.12));
      osc.stop(end + (o.release || 0.12) + 0.05);
    }
  }
  function noise(time, dur, type, freq, gain) {
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    src.buffer = noiseBuf; f.type = type; f.frequency.value = freq;
    src.connect(f); f.connect(g); g.connect(master);
    g.gain.setValueAtTime(gain, time); g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    src.start(time, Math.random() * 0.5); src.stop(time + dur + 0.02);
  }
  function kick(time) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(150, time); o.frequency.exponentialRampToValueAtTime(45, time + 0.12);
    g.gain.setValueAtTime(0.7, time); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.3);
    o.connect(g); g.connect(master); o.start(time); o.stop(time + 0.32);
  }
  function tom(time) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(220, time); o.frequency.exponentialRampToValueAtTime(110, time + 0.18);
    g.gain.setValueAtTime(0.35, time); g.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
    o.connect(g); g.connect(master); o.start(time); o.stop(time + 0.25);
  }

  function playStep(i, time) {
    const S = song, t = S.t, sdur = 60 / t.bpm / 2;
    const pos = i % S.total, inBar = pos % S.spb;
    for (const n of S.lead) if (n.at === pos) voice(mtof(n.m), time, n.len * sdur * 0.9, { ...t.lead, pluck: !t.lead.bell, decay: Math.max(t.lead.decay, n.len * sdur * 0.8) });
    for (const n of S.bass) if (n.at === pos) voice(mtof(n.m), time, sdur * 0.9, { wave: t.bass.wave, gain: 0.22, filter: t.bass.filter, pluck: true, decay: sdur * 1.6 });
    for (const c of S.chords) if (c.at === pos) for (const m of c.ms)
      voice(mtof(m), time, c.len * sdur, c.arp ? { wave: 'triangle', gain: 0.05, pluck: true, decay: 0.25 } : { wave: t.chords.wave, gain: t.chords.gain, attack: t.chords.pad ? 0.3 : 0.01, release: t.chords.pad ? 0.6 : 0.1 });
    const d = t.drums || {};
    if (d.k?.includes(inBar)) kick(time);
    if (d.s?.includes(inBar)) { noise(time, 0.16, 'bandpass', 1800, 0.35); }
    if (d.c?.includes(inBar)) { noise(time, 0.05, 'bandpass', 1200, 0.3); noise(time + 0.02, 0.12, 'bandpass', 1300, 0.3); }
    if (d.h?.includes(inBar)) noise(time, 0.04, 'highpass', 7000, 0.12);
    if (d.sh?.includes(inBar)) noise(time, 0.06, 'highpass', 5000, 0.07);
    if (d.t?.includes(inBar)) tom(time);
    if (onBeat && inBar % 2 === 0) { const delay = Math.max(0, (time - ctx.currentTime) * 1000); setTimeout(() => onBeat(inBar / 2), delay); }
  }

  function tick() {
    if (!playing) return;
    const sdur = 60 / song.t.bpm / 2;
    // After the screen sleeps or the app is in the background, skip the missed
    // notes instead of playing them all at once.
    if (nextTime < ctx.currentTime - 0.1) nextTime = ctx.currentTime + 0.05;
    while (nextTime < ctx.currentTime + 0.15) { playStep(step, nextTime); nextTime += sdur; step++; }
  }

  // Coming back to the app (or after a phone call / lock screen) wakes the sound up again.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && ctx && playing && ctx.state !== 'running') ctx.resume();
  });

  return {
    unlock() {
      if (!ensure()) return;
      const b = ctx.createBuffer(1, 1, 22050), s = ctx.createBufferSource();
      s.buffer = b; s.connect(ctx.destination); s.start(0);
    },
    play(track) {
      if (!ensure()) return;
      if (!playing || !song || song.t.id !== track.id) {
        song = compose(track); step = 0; nextTime = ctx.currentTime + 0.08;
      }
      playing = true;
      if (!timer) timer = setInterval(tick, 25);
      tick();
    },
    stop() { playing = false; clearInterval(timer); timer = null; },
    chime() {
      if (!ensure()) return;
      const t = ctx.currentTime;
      [84, 88, 91, 96].forEach((m, i) => voice(mtof(m), t + i * 0.06, 0.1, { wave: 'sine', gain: 0.08, bell: true, decay: 0.4 }));
    },
    // camera click: two short bursts of filtered noise
    shutter() {
      if (!ensure()) return;
      const t = ctx.currentTime, len = Math.floor(ctx.sampleRate * 0.09);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
      [[0, 0.32], [0.075, 0.22]].forEach(([at, vol]) => {
        const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        src.buffer = buf; f.type = 'highpass'; f.frequency.value = 1200; g.gain.value = vol;
        src.connect(f); f.connect(g); g.connect(ctx.destination); src.start(t + at);
      });
    },
    set onBeat(fn) { onBeat = fn; },
    get playing() { return playing; }
  };
})();
