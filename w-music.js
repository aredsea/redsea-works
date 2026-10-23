(() => {
  'use strict';
  const data = window.BOT_WORKS;
  const main = document.querySelector('#main');
  const p = data?.projects.find(x => x.id === document.body.dataset.project);
  if (!p || !main) return;

  const base = document.body.dataset.base || '../../';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const asset = n => `${base}assets/${n}`;
  const size = n => data.media?.[n] ? `width="${data.media[n].width}" height="${data.media[n].height}"` : '';
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const cast = p.characters;
  const HUE = ['#c23a58', '#b5561b', '#3a74b6'];
  const SOFT = ['#f6dbe2', '#f8e2d2', '#dce7f4'];
  const INSTR = ['Piano', 'Voice · Guitar', 'Theremin'];
  const josa = (w, a, b) => { const c = w.charCodeAt(w.length - 1) - 0xac00; return w + (c >= 0 && c <= 11171 && c % 28 ? a : b); };

  /* ---------- the practice room: the original's 8-note sample ---------- */
  const NOTES = [4, 7, 4, 2, 0, 4, 7, 4];
  const NAME = { 0: '도', 2: '레', 4: '미', 7: '솔' };
  const PADS = [0, 2, 4, 7];
  const BPM = 86, BEAT = 60 / BPM;
  const WIN = [[.10, '공명'], [.18, '울림'], [.24, '여운']];
  const Y = { 0: 80, 2: 75, 4: 70, 7: 60 };   // C4 sits on a ledger line, E4 on the bottom line, G4 on the second
  let best = 0;
  try { best = Number(localStorage.getItem('redsea-practice-best-8')) || 0; } catch { }
  const s = { who: 0, phase: 'ready', marks: [], timers: [], raf: 0, t0: 0 };
  let audio = null;
  function tone(n, at = 0, vol = .16) {
    const A = window.AudioContext || window.webkitAudioContext; if (!A) return;
    try {
      audio ??= new A(); if (audio.state === 'suspended') audio.resume();
      const t = audio.currentTime + at, o = audio.createOscillator(), g = audio.createGain();
      o.type = 'sine'; o.frequency.value = 261.63 * 2 ** (n / 12);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .015); g.gain.exponentialRampToValueAtTime(.001, t + .45);
      o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t + .5);
    } catch { }
  }
  const tick = at => tone(24, at, .05);

  function staff() {
    const x = i => 70 + i * 62;
    return `<svg class="mu-staff" viewBox="0 0 560 120" role="img" aria-label="미 솔 미 레 도 미 솔 미, 여덟 음의 선율">
      ${[30, 40, 50, 60, 70].map(y => `<line x1="10" x2="550" y1="${y}" y2="${y}"/>`).join('')}
      <text class="mu-clef" x="12" y="78">𝄞</text>
      ${NOTES.map((n, i) => `<g class="mu-note" data-i="${i}" transform="translate(${x(i)} ${Y[n]})">
          ${n === 0 ? '<line class="mu-ledger" x1="-13" x2="13" y1="0" y2="0"/>' : ''}
          <circle class="mu-ring" r="26"/>
          <ellipse class="mu-head" rx="7.6" ry="5.6" transform="rotate(-20)"/>
          <line class="mu-stem" x1="6.6" x2="6.6" y1="-2" y2="-34"/>
          <text class="mu-name" y="${110 - Y[n]}">${NAME[n]}</text>
          <text class="mu-mark" y="${12 - Y[n]}"></text>
        </g>`).join('')}
      <line class="mu-head-line" x1="0" x2="0" y1="18" y2="92"/>
    </svg>`;
  }

  function verdict() {
    const hit = s.marks.filter(m => m && m !== '놓침').length;
    const c = cast[s.who], sc = p.scenes?.[s.who];
    return { hit, line: hit >= 7 ? '거의 같은 숨으로 끝났다.' : hit >= 4 ? '반쯤은 같은 박자에 있었다.' : '아직은 서로의 박자를 찾는 중.', c, sc };
  }

  function room() {
    const c = cast[s.who];
    const v = s.phase === 'done' ? verdict() : null;
    const label = { ready: '먼저 상대의 선율을 들어 보세요.', listen: `${josa(c.name.split(' ')[1] || c.name, '이', '가')} 먼저 연주하는 중…`, heard: '이제 내 차례. 고리가 음표에 닿는 순간 누르세요.', count: '하나, 둘, 셋, 넷…', play: '지금!', done: '' }[s.phase];
    return `<div class="mu-room" style="--hue:${HUE[s.who]};--soft:${SOFT[s.who]}">
      <div class="mu-partner" role="group" aria-label="함께 연주할 사람">${cast.map((x, i) => `<button type="button" data-who="${i}" aria-pressed="${s.who === i}"${['listen', 'count', 'play'].includes(s.phase) ? ' disabled' : ''} style="--hue:${HUE[i]}"><img src="${asset(x.image)}" alt="" width="738" height="1200"><span><b>${esc(x.name)}</b><small>${INSTR[i]}</small></span></button>`).join('')}</div>
      <div class="mu-sheet">
        <div class="mu-sheet-top"><span>No. ${String(s.who + 1).padStart(2, '0')} · 즉흥 선율</span><span>♩ = ${BPM}</span><span>8음</span></div>
        ${staff()}
        <p class="mu-status" role="status" aria-live="polite">${label}</p>
        <div class="mu-keys" role="group" aria-label="음 건반">${PADS.map((n, i) => `<button type="button" data-pad="${n}" aria-keyshortcuts="${i + 1}"${s.phase === 'play' || s.phase === 'count' ? '' : ' disabled'}><b>${NAME[n]}</b><small>${i + 1}</small></button>`).join('')}</div>
        <div class="mu-act">
          <button type="button" class="mu-btn" data-go="listen"${['listen', 'count', 'play'].includes(s.phase) ? ' disabled' : ''}>${s.phase === 'ready' ? '선율 듣기' : '다시 듣기'}</button>
          <button type="button" class="mu-btn mu-btn-ink" data-go="play"${s.phase === 'heard' || s.phase === 'done' ? '' : ' disabled'}>${s.phase === 'done' ? '한 번 더 연주' : '따라 연주'}</button>
        </div>
        <p class="mu-legend"><span>±0.10초 <b>공명</b></span><span>±0.18초 <b>울림</b></span><span>±0.24초 <b>여운</b></span><span>이 기기의 최고 기록 <b>${best} / 8</b></span></p>
      </div>
      ${v ? `<div class="mu-after"><p class="mu-score"><b>${v.hit}</b> / 8</p><p class="mu-after-line">${v.line}</p>${v.sc ? `<blockquote>“${esc(v.sc.quote)}”<cite>${esc(v.c.name)} · ${esc(v.sc.title)}</cite></blockquote>` : ''}<p class="mu-fine">실제 봇에서는 연주 결과를 제출하면 다음 대화와 관계 단계에 반영됩니다. 여기의 연습은 공명도를 바꾸지 않습니다.</p></div>` : ''}
    </div>`;
  }

  /* ---------- page ---------- */
  const film = p.videos?.[0];
  const stages = [[0, '낯선 박자', 'pp'], [75, '귀 기울임', 'p'], [150, '편안한 호흡', 'mp'], [225, '숨겨둔 선율', 'mf'], [300, '말 없는 신뢰', 'f'], [400, '영혼의 공명', 'ff'], [500, '목숨을 건 사랑', 'fff']];
  const petals = Array.from({ length: 7 }, (_, i) => `<img class="mu-petal" src="${asset('identity/music-petal.svg')}" alt="" style="--x:${8 + i * 13}%;--d:${(i * 1.7) % 9}s;--s:${.7 + (i % 3) * .25}" aria-hidden="true">`).join('');

  main.innerHTML = `
  <header class="mu-top">
    <a class="mu-mark" href="#top" aria-label="공명 듀엣, 맨 위로"><i>R</i><span>RESONANCE DUET</span></a>
    <nav class="mu-nav" aria-label="작품 메뉴"><a href="#programme">프로그램</a><a href="#duet">연습실</a><a href="#bond">공명</a><a href="#film">영상</a></nav>
    <a class="mu-back" href="${base}">← Archive</a>
  </header>

  <section class="mu-cover" id="top">
    <div class="mu-cover-plate">
      <img src="${asset('music-cinematic-v1.webp')}" alt="벚꽃이 보이는 연습실에서 피아노·기타·테레민을 함께 연주하는 세 사람" ${size('music-cinematic-v1.webp')} fetchpriority="high">
      <div class="mu-petals" aria-hidden="true">${petals}</div>
    </div>
    <div class="mu-cover-copy">
      <p class="mu-cover-pre">히비키가오카 음악학원 · 봄 연주회</p>
      <h1>벚꽃이 지는 소리를<br>너와 들었다</h1>
      <p class="mu-cover-jp" lang="ja">桜の散る音を、君と聴いた</p>
      <p class="mu-cover-text">${esc(p.tagline)} 말보다 먼저 같은 박자로. 세 사람이 들려주는 선율을 듣고, 내 차례에 따라 칩니다.</p>
      <div class="mu-cover-act"><a class="mu-btn mu-btn-ink" href="#duet">같이 연주해 보기</a><a class="mu-btn" href="#film">실제 시연 보기</a></div>
      <dl class="mu-cover-facts">${p.facts.map(f => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>
    </div>
    <p class="mu-op" aria-hidden="true">Op. 1 · ${esc(p.version)}</p>
  </section>

  <section class="mu-programme" id="programme" aria-labelledby="prog-h">
    <div class="mu-prog-head"><p class="mu-roman">Programme</p><h2 id="prog-h">세 사람의 첫 만남</h2>${p.overview.map(t => `<p>${esc(t)}</p>`).join('')}</div>
    <ol class="mu-trio">${cast.map((c, i) => { const sc = p.scenes[i]; return `<li style="--hue:${HUE[i]};--soft:${SOFT[i]}">
      <figure><img src="${asset(sc.image)}" alt="${esc(sc.imageCaption)}" ${size(sc.image)} loading="lazy"></figure>
      <div class="mu-trio-copy"><p class="mu-trio-no"><span>${['I', 'II', 'III'][i]}.</span>${INSTR[i]}</p><h3>${esc(c.name)}</h3><p class="mu-trio-role">${esc(c.role)}</p><p class="mu-trio-hook">${esc(c.hook)}</p><p>${esc(c.text)}</p>
      <div class="mu-trio-scene"><b>${esc(sc.title)}</b><p>${esc(sc.text)}</p><blockquote>“${esc(sc.quote)}”</blockquote></div></div></li>`; }).join('')}</ol>
  </section>

  <section class="mu-duet" id="duet" aria-labelledby="duet-h">
    <div class="mu-duet-head"><p class="mu-roman">Practice Room</p><h2 id="duet-h">마음의 악보</h2><p>네 개의 음으로 만든 짧은 즉흥 선율입니다. 먼저 듣고, 내 차례가 오면 고리가 음표에 닿는 순간 누르세요. 숫자 키 1~4로도 칠 수 있습니다.</p></div>
    <div data-room>${room()}</div>
    <p class="mu-fine mu-fine-wide">원작의 음·속도·판정 범위를 그대로 쓴 8음 연습 샘플입니다. 실제 봇의 112곡과 긴 악보는 들어 있지 않습니다. 소리가 나니 음량을 확인해 주세요.</p>
  </section>

  <section class="mu-notes" aria-label="작품의 규칙">${p.systems.map((x, i) => `<article><span>${['I', 'II', 'III', 'IV'][i]}</span><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article>`).join('')}</section>

  <section class="mu-bond" id="bond" aria-labelledby="bond-h">
    <div class="mu-bond-head"><p class="mu-roman">Resonance</p><h2 id="bond-h">공명도 0 — 500</h2><p>세 사람의 공명도는 따로 쌓이고, 결과를 제출할 때만 오릅니다. 줄어들지는 않습니다. 단계에 따라 마음을 여는 속도와 털어놓는 비밀이 달라집니다.</p></div>
    <ol class="mu-dyn">${stages.map(([n, label, dyn]) => `<li><i>${dyn}</i><b>${label}</b><span>${n}</span></li>`).join('')}</ol>
    <p class="mu-bond-note">${esc(p.note)}</p>
  </section>

  <section class="mu-film" id="film" aria-labelledby="film-h">
    ${film ? `<figure class="mu-phone"><video controls playsinline preload="none" poster="${asset(film.poster)}" ${size(film.poster)} aria-label="${esc(film.title)}"><source src="${asset(film.source)}" type="video/mp4"></video></figure>` : ''}
    <div class="mu-film-copy"><p class="mu-roman">Live Capture</p><h2 id="film-h">${film ? esc(film.title) : '시연'}</h2>${film ? `<p>${esc(film.caption)}</p>` : ''}<h3>시작하는 법</h3><ol>${p.guide.map(g => `<li>${esc(g)}</li>`).join('')}</ol></div>
  </section>

  <footer class="mu-foot">
    <a class="mu-next" href="${base}projects/yoo-hyeyeon/"><small>다음 작품</small><b>유혜연</b></a>
    <p>© 2026 redsea works · 벚꽃이 지는 소리를 너와 들었다 ${esc(p.version)}. 등장인물은 모두 성인입니다. 이미지·영상에 AI 생성 및 편집 자료가 포함됩니다. <a href="${base}credits/">저작권 · 크레딧</a></p>
    <a class="mu-back" href="${base}">← Archive</a>
  </footer>`;

  /* ---------- practice behaviour ---------- */
  const host = main.querySelector('[data-room]');
  const clear = () => { s.timers.forEach(clearTimeout); s.timers = []; cancelAnimationFrame(s.raf); s.raf = 0; };
  const later = (fn, ms) => s.timers.push(setTimeout(fn, ms));
  const nodes = () => [...host.querySelectorAll('.mu-note')];
  function paint(sel) { host.innerHTML = room(); if (sel) host.querySelector(sel)?.focus({ preventScroll: true }); }
  function flash(i, cls) { const g = nodes()[i]; if (!g) return; g.classList.remove(cls); void g.getBBox; g.classList.add(cls); }

  function listen() {
    clear(); s.phase = 'listen'; s.marks = []; paint(); window.RedseaIntro?.hush(true);
    NOTES.forEach((n, i) => later(() => { tone(n); nodes().forEach((g, k) => g.classList.toggle('is-sounding', k === i)); }, i * BEAT * 1000 + 250));
    later(() => { s.phase = 'heard'; paint('[data-go="play"]'); window.RedseaIntro?.hush(false); }, NOTES.length * BEAT * 1000 + 600);
  }
  function play() {
    clear(); s.phase = 'count'; s.marks = Array(NOTES.length).fill(null); paint('[data-pad="4"]'); window.RedseaIntro?.hush(true);
    const now = performance.now();
    for (let k = 0; k < 4; k++) { later(() => tick(0), k * BEAT * 1000); }
    s.t0 = now + 4 * BEAT * 1000;
    later(() => { s.phase = 'play'; host.querySelector('.mu-status').textContent = '지금!'; }, 4 * BEAT * 1000 - 120);
    const end = s.t0 + (NOTES.length - 1) * BEAT * 1000 + 300;
    const head = host.querySelector('.mu-head-line');
    function frame(t) {
      const gs = nodes();
      gs.forEach((g, i) => {
        const due = s.t0 + i * BEAT * 1000, dt = (due - t) / 1000;
        const ring = g.querySelector('.mu-ring');
        if (s.marks[i] || dt > BEAT * 1.2 || dt < -.24) { ring.style.opacity = 0; return; }
        const k = Math.max(0, dt) / (BEAT * 1.2);
        ring.style.opacity = String(1 - k * .6);
        ring.setAttribute('r', String(9 + k * 26));
      });
      const prog = (t - s.t0) / ((NOTES.length - 1) * BEAT * 1000);
      if (head) head.setAttribute('transform', `translate(${70 + Math.max(0, Math.min(1, prog)) * 7 * 62} 0)`);
      if (t > end) return finish();
      s.raf = requestAnimationFrame(frame);
    }
    s.raf = requestAnimationFrame(frame);
  }
  function hit(n) {
    tone(n);
    if (s.phase !== 'play') return;
    const t = performance.now();
    let best_ = -1, gap = 9;
    NOTES.forEach((_, i) => { if (s.marks[i]) return; const d = Math.abs((t - (s.t0 + i * BEAT * 1000)) / 1000); if (d < gap) { gap = d; best_ = i; } });
    if (best_ < 0 || gap > .24) return;
    const ok = NOTES[best_] === n;
    const w = ok ? WIN.find(([lim]) => gap <= lim) : null;
    s.marks[best_] = w ? w[1] : '놓침';
    const g = nodes()[best_];
    if (g) { g.querySelector('.mu-mark').textContent = s.marks[best_]; g.classList.add(w ? 'is-hit' : 'is-miss'); }
  }
  function finish() {
    cancelAnimationFrame(s.raf); s.raf = 0;
    s.marks = s.marks.map(m => m || '놓침');
    const hits = s.marks.filter(m => m !== '놓침').length;
    if (hits > best) { best = hits; try { localStorage.setItem('redsea-practice-best-8', String(best)); } catch { } }
    s.phase = 'done'; paint('[data-go="play"]'); window.RedseaIntro?.hush(false);
    nodes().forEach((g, i) => { g.querySelector('.mu-mark').textContent = s.marks[i]; g.classList.add(s.marks[i] === '놓침' ? 'is-miss' : 'is-hit'); });
  }
  host.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    if (b.dataset.who) { s.who = Number(b.dataset.who); s.phase = 'ready'; s.marks = []; paint(`[data-who="${s.who}"]`); return; }
    if (b.dataset.go === 'listen') listen();
    if (b.dataset.go === 'play') play();
  });
  host.addEventListener('pointerdown', e => { const b = e.target.closest('[data-pad]'); if (b && !b.disabled) { e.preventDefault(); hit(Number(b.dataset.pad)); b.classList.remove('is-down'); void b.offsetWidth; b.classList.add('is-down'); } });
  host.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[data-pad]')) { e.preventDefault(); hit(Number(e.target.dataset.pad)); } });
  document.addEventListener('keydown', e => {
    if (!/^[1-4]$/.test(e.key) || e.repeat || e.ctrlKey || e.metaKey || e.altKey || e.target.matches('input,textarea,select')) return;
    if (s.phase !== 'play' && s.phase !== 'count') return;
    e.preventDefault(); hit(PADS[Number(e.key) - 1]);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && ['listen', 'count', 'play'].includes(s.phase)) { clear(); s.phase = 'ready'; paint(); window.RedseaIntro?.hush(false); } });
  addEventListener('pagehide', () => { clear(); audio?.close().catch(() => { }); });

  /* ---------- petals only fall while the cover is on screen ---------- */
  const cover = main.querySelector('.mu-cover');
  new IntersectionObserver(([e]) => cover.classList.toggle('is-quiet', !e.isIntersecting)).observe(cover);
  const top = main.querySelector('.mu-top');
  new IntersectionObserver(([e]) => top.classList.toggle('is-solid', !e.isIntersecting), { rootMargin: '-80px 0px 0px 0px' }).observe(main.querySelector('.mu-cover-pre'));
  if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());

  /* ---------- the way in: house lights down, curtain up ---------- */
  const hz = n => 261.63 * 2 ** (n / 12);
  const key = (k, n, at, vol = .07) => { k.tone({ type: 'triangle', freq: hz(n), at, dur: 1.5, vol, cut: 2600 }); k.tone({ freq: hz(n + 12), at, dur: .7, vol: vol * .25 }); };
  const flutter = Array.from({ length: 9 }, (_, i) => `<img class="g-petal" src="${asset('identity/music-petal.svg')}" alt="" style="--x:${6 + i * 11}%;--d:${(i * 1.9) % 8}s;--s:${.7 + (i % 3) * .3}">`).join('');
  window.RedseaIntro?.gate({
    world: 'music',
    label: '벚꽃이 지는 소리를 너와 들었다 입장',
    switchIn: '.mu-back',
    scene: `<div class="g-scene"><div class="g-sheet"><img src="${asset('identity/music-gate.webp')}" alt="" width="1536" height="1024" fetchpriority="high"></div><i class="g-spot"></i><span class="g-petals" aria-hidden="true">${flutter}</span></div>
      <i class="g-dim" aria-hidden="true"></i>
      <div class="g-copy">
        <p class="g-time">히비키가오카 음악학원 · 봄 연주회 · 開演 18:30</p>
        <p class="g-title">벚꽃이 지는 소리를<br>너와 들었다</p>
        <p class="g-sub">공연 중에는 휴대전화를 무음으로 해 주세요.<br>다만 이 연주회는 소리가 있어야 완성됩니다.</p>
        <div class="g-act"><button type="button" data-gate="sound">${RedseaIntro.icon}<span>소리 켜고 입장</span></button><button type="button" data-gate="quiet">무음으로 관람</button></div>
      </div>`,
    enter(g, k) {
      if (k) {
        k.tone({ type: 'sawtooth', freq: 440, dur: 1.7, vol: .05, attack: .55, cut: 1700 });
        k.tone({ type: 'sawtooth', freq: 220, dur: 1.9, vol: .045, attack: .7, cut: 900 });
        k.tone({ type: 'sawtooth', freq: 110, dur: 2, vol: .035, attack: .8, cut: 500 });
        [0, 4, 7, 12, 16, 19, 24].forEach((n, i) => key(k, n, 1.15 + i * .075, .065));
        [-12, -5, 4].forEach(n => k.tone({ freq: hz(n), at: 1.75, dur: 3.2, vol: .04, attack: .4 }));
      }
      return 2550;
    },
    bed(k) {
      const MOTIF = [4, 7, 4, 2, 0, 4, 7, 4], STEP = 60 / 72, PAD = [[-12, -8, -5], [-15, -8, -3]];
      let round = 0;
      const phrase = () => {
        const up = round++ % 2 ? 12 : 0;
        MOTIF.forEach((n, i) => key(k, n + up, .2 + i * STEP, .045));
        PAD.forEach((ch, bar) => ch.forEach(n => k.tone({ freq: hz(n), at: .2 + bar * 4 * STEP, dur: 4 * STEP + .6, vol: .022, attack: .5 })));
      };
      phrase();
      const stop = k.every(Math.round(12 * STEP * 1000), phrase);
      const room = k.wash({ type: 'lowpass', freq: 600, q: .2, vol: .006 });
      return () => { stop(); room.stop(); };
    }
  });
})();
