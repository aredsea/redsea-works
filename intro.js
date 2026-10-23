/* redsea works — entrance gates.
   Each world draws its own gate and scores its own sound; this file holds what they share:
   the lock on the page, the two ways in, the header sound switch and a small Web Audio kit.
   Every sound is synthesised in the browser, so there are no audio files to license or load. */
(() => {
  'use strict';
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  let ctx = null, master = null, duck = null, bedStop = null, bedFn = null, on = false;
  const switches = [];

  /* ---------- sound ---------- */
  function wake() {
    const A = window.AudioContext || window.webkitAudioContext;
    if (!A) return null;
    if (!ctx) {
      try { ctx = new A(); } catch { return null; }
      master = ctx.createGain(); master.gain.value = 0;
      duck = ctx.createGain();
      const limit = ctx.createDynamicsCompressor();
      limit.threshold.value = -10; limit.ratio.value = 6;
      master.connect(duck); duck.connect(limit); limit.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  let noiseBuf = null;
  function noise() {
    if (noiseBuf) return noiseBuf;
    const len = ctx.sampleRate * 2, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return (noiseBuf = b);
  }
  const kit = {
    get ctx() { return ctx; },
    get out() { return master; },
    // one enveloped oscillator; `to` glides the pitch, `cut` puts it through a lowpass
    tone({ type = 'sine', freq = 440, to, at = 0, dur = .5, vol = .2, attack = .01, cut, q = .7, dest = master }) {
      const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
      let head = o;
      if (cut) { const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cut; f.Q.value = q; o.connect(f); head = f; }
      head.connect(g); g.connect(dest); o.start(t); o.stop(t + dur + .05);
      return o;
    },
    // a burst of filtered noise; `from`→`to` sweeps the band
    hiss({ at = 0, dur = .4, vol = .2, from = 1200, to, type = 'bandpass', q = 1, attack = .005, dest = master }) {
      const t = ctx.currentTime + at, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noise(); s.loop = true;
      f.type = type; f.Q.value = q; f.frequency.setValueAtTime(from, t);
      if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(.0008, t + dur);
      s.connect(f); f.connect(g); g.connect(dest); s.start(t, Math.random()); s.stop(t + dur + .05);
    },
    // an endless filtered noise bed (rain, wind, a room)
    wash({ type = 'bandpass', freq = 1000, q = .6, vol = .05, dest = master }) {
      const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noise(); s.loop = true; f.type = type; f.frequency.value = freq; f.Q.value = q;
      g.gain.setValueAtTime(0, ctx.currentTime); g.gain.linearRampToValueAtTime(vol, ctx.currentTime + 2.5);
      s.connect(f); f.connect(g); g.connect(dest); s.start();
      return { gain: g, filter: f, stop() { try { s.stop(); } catch { } } };
    },
    // a soft echo send for rooms and caverns
    echo(time = .32, feedback = .38, wet = .35) {
      const d = ctx.createDelay(2), fb = ctx.createGain(), w = ctx.createGain(), lp = ctx.createBiquadFilter();
      d.delayTime.value = time; fb.gain.value = feedback; w.gain.value = wet; lp.type = 'lowpass'; lp.frequency.value = 2600;
      d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(w); w.connect(master);
      return d;
    },
    // repeat fn every `ms` while sound is on
    every(ms, fn) { const id = setInterval(() => { if (on && ctx && ctx.state === 'running') fn(); }, ms); return () => clearInterval(id); }
  };

  function startBed() {
    if (!bedFn || bedStop || !wake()) return;
    try { bedStop = bedFn(kit) || (() => { }); } catch { bedStop = () => { }; }
  }
  let rest = 0;
  function setSound(next) {
    on = next && !!wake();
    clearTimeout(rest);
    if (ctx) {
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(on ? 1 : 0, t + (on ? .25 : .4));
      // Once the fade is done, stop the whole graph so a muted page costs nothing.
      if (!on) rest = setTimeout(() => { if (!on) ctx.suspend(); }, 450);
    }
    if (on) startBed();
    switches.forEach(paintSwitch);
  }
  // A hidden tab should not keep playing to nobody.
  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (on) ctx.resume();
  });

  const ICON = {
    on: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.6 7.6 0 0 1 0 11"/></svg>',
    off: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/></svg>'
  };
  function paintSwitch(b) {
    b.setAttribute('aria-pressed', String(on));
    // The switch is for the background; sounds a visitor asks for (the practice room) still play.
    b.setAttribute('aria-label', on ? '배경음 끄기' : '배경음 켜기');
    b.innerHTML = on ? ICON.on : ICON.off;
  }

  /* ---------- the gate ---------- */
  // scene: the gate's markup, holding a [data-gate="sound"] and a [data-gate="quiet"] button.
  // enter(gate, kit|null): starts the world's own opening and returns how long it runs, in ms.
  // bed(kit): starts the world's background sound and returns a function that stops it.
  function gate({ world, label, scene, enter, bed, switchIn }) {
    bedFn = bed;
    const root = document.documentElement;
    const host = switchIn && document.querySelector(switchIn);
    if (host) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'snd';
      b.addEventListener('click', () => setSound(!on));
      host.after(b);
      switches.push(b); paintSwitch(b);
    }

    const g = document.createElement('div');
    g.className = `gate gate-${world}`;
    g.setAttribute('role', 'dialog');
    g.setAttribute('aria-modal', 'true');
    g.setAttribute('aria-label', label);
    g.innerHTML = scene;
    document.body.prepend(g);
    root.classList.add('is-gated');
    // Everything behind the gate is out of reach, the skip link included, until a door is chosen.
    const behind = [...document.body.children].filter(e => e !== g && !e.inert);
    behind.forEach(e => { e.inert = true; });
    requestAnimationFrame(() => { g.classList.add('is-up'); g.querySelector('[data-gate="sound"]')?.focus({ preventScroll: true }); });

    let gone = false;
    function go(withSound) {
      if (gone) return; gone = true;
      g.querySelectorAll('[data-gate]').forEach(b => { b.disabled = true; });
      setSound(withSound);
      const quick = still.matches;
      const ms = quick ? 450 : (enter?.(g, on ? kit : null) ?? 1200);
      g.classList.add('is-open');
      if (quick) g.classList.add('is-quick');
      document.removeEventListener('keydown', esc);
      setTimeout(() => {
        g.remove();
        root.classList.remove('is-gated');
        behind.forEach(e => { e.inert = false; });
        const target = location.hash.length > 1 && document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (target) target.scrollIntoView({ block: 'start' });
      }, ms);
    }
    function esc(e) { if (e.key === 'Escape') go(false); }
    document.addEventListener('keydown', esc);
    g.addEventListener('click', e => {
      const b = e.target.closest('[data-gate]');
      if (b) go(b.dataset.gate === 'sound');
    });
  }

  // Lowers the background while a page plays its own notes, so the two never compete.
  function hush(quiet) {
    if (!ctx) return;
    const t = ctx.currentTime;
    duck.gain.cancelScheduledValues(t);
    duck.gain.setValueAtTime(duck.gain.value, t);
    duck.gain.linearRampToValueAtTime(quiet ? .1 : 1, t + (quiet ? .3 : 1.2));
  }

  window.RedseaIntro = { gate, hush, icon: ICON.on };
})();
