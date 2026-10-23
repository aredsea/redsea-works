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

  const text = (data.hyeyeonPrologue || '').trim().split(/\n\s*\n/).map(t => t.trim()).filter(Boolean);
  const title = text.shift() || '얼음';
  const first = text.shift() || '';
  const said = t => /^[“"]/.test(t);
  // A section break falls where the scene turns: before the first spoken line after a long silence.
  // The lines that carry the scene. Matched by their words, so an edit to the text cannot shift them.
  const MOMENT = [
    ['오늘 만나자고 한 건 나였다.', 'rise'], ['그런데 얼굴을 보자 전부 남의 말 같았다.', 'drift'],
    ['무슨 일이 있었던 건 아니었다.', 'rise'], ['“우리 그만하자.”', 'big'], ['막상 뱉고 나니 평범한 목소리였다.', 'drift'],
    ['처음으로 네 얼굴을 제대로 봤다.', 'rise'], ['“네 얘기까지 듣고 나면, 또 없던 일로 하고 싶어질까 봐.”', 'drift'],
    ['“너는…… 나랑 아직 만나고 싶어?”', 'big']
  ];
  const kindOf = t => (MOMENT.find(([m]) => m === t) || [])[1];
  const words = t => t.split(' ').map((w, i) => `<span style="--i:${i}">${esc(w)}</span>`).join(' ');
  const body = text.map((t, i) => {
    const k = kindOf(t), cls = [said(t) ? 'hy-said' : '', i === Math.floor(text.length * .5) ? 'hy-turn' : '', k ? 'hy-' + k : ''].filter(Boolean).join(' ');
    if (k === 'rise' || k === 'big') return `<p class="${cls}" data-moment>${words(t)}</p>`;
    if (k === 'drift') return `<p class="${cls}" data-moment>${esc(t)}<span class="hy-echo" aria-hidden="true">${esc(t)}</span></p>`;
    return `<p class="${cls}">${esc(t)}</p>`;
  }).join('');

  const AXES = [['존중', '상대를 동등한 사람으로 대하는 태도.'], ['이해', '상대의 상황과 마음을 알아보는 반응.'], ['유능함', '일을 판단하고 해내는 모습.'], ['호의', '자신에게 향하는 관심과 친절.'], ['매력', '끌림을 느끼게 하는 인상.']];
  // Example moments only: they show which way the rule moves, not what the engine scores.
  const MOMENTS = [
    { id: 'snack', sign: 1, axes: ['호의', '이해'], text: '시험 공부 중인 혜연에게 야식을 사 들고 갔다' },
    { id: 'ask', sign: 1, axes: ['존중', '이해'], text: '약속을 정하기 전에 혜연의 일정을 먼저 물었다' },
    { id: 'work', sign: 1, axes: ['유능함', '호의'], text: '회사 일로 막힌 혜연과 같이 해결 방법을 찾았다' },
    { id: 'result', sign: 1, big: true, axes: ['이해', '호의', '매력'], text: '시험 결과가 나온 날, 결과보다 혜연을 먼저 챙겼다' },
    { id: 'public', sign: -1, axes: ['존중', '이해'], text: '혜연의 실수를 다른 사람 앞에서 지적했다' },
    { id: 'dismiss', sign: -1, big: true, axes: ['존중', '이해', '호의'], text: '혜연이 붙들고 있는 공부를 대수롭지 않게 말했다' }
  ];
  const C = { x: 300, y: 250 }, R = 178;
  const NODE = AXES.map(([a], i) => { const t = (-90 + 72 * i) * Math.PI / 180; return { a, x: C.x + R * Math.cos(t), y: C.y + R * Math.sin(t), t }; });
  function diagram() {
    const seg = n => { const dx = C.x - n.x, dy = C.y - n.y, d = Math.hypot(dx, dy); return { x1: n.x + dx / d * 34, y1: n.y + dy / d * 34, x2: C.x - dx / d * 78, y2: C.y - dy / d * 78 }; };
    return `<svg viewBox="0 0 600 500">
      <polygon class="hy-web" points="${NODE.map(n => `${n.x.toFixed(1)},${n.y.toFixed(1)}`).join(' ')}"/>
      ${NODE.map(n => { const s = seg(n); return `<line class="hy-spoke" data-spoke="${n.a}" pathLength="100" x1="${s.x1.toFixed(1)}" y1="${s.y1.toFixed(1)}" x2="${s.x2.toFixed(1)}" y2="${s.y2.toFixed(1)}"/><line class="hy-pulse" data-pulse="${n.a}" pathLength="100" x1="${s.x1.toFixed(1)}" y1="${s.y1.toFixed(1)}" x2="${s.x2.toFixed(1)}" y2="${s.y2.toFixed(1)}"/>`; }).join('')}
      <circle class="hy-core-amp" cx="${C.x}" cy="${C.y}" r="78"/>
      <circle class="hy-core" cx="${C.x}" cy="${C.y}" r="74"/>
      <text class="hy-core-t" x="${C.x}" y="${C.y - 4}">호감도</text>
      <text class="hy-core-s" x="${C.x}" y="${C.y + 22}" data-core>하나의 값</text>
      ${NODE.map((n, i) => `<g class="hy-node" data-node="${n.a}" transform="translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})"><circle r="32"/><text class="hy-node-t" y="6">${n.a}</text><text class="hy-node-n" y="-44">0${i + 1}</text><text class="hy-node-sign" y="56"></text></g>`).join('')}
    </svg>`;
  }
  const DAY = [['WORK', '첫 직장에 적응하는 중', '서림재보험의 신입 계리 담당자. 능숙하게 해내는 일과 아직 익숙하지 않은 일이 함께 있습니다.'], ['STUDY', '시험은 아직 끝나지 않았다', '계리사 2차 세 과목에 합격했고, 남은 두 과목을 준비합니다.'], ['HOME', '도심 오피스텔의 자기 생활', '혼자 사는 집에서 자신의 취향과 생활 방식을 만들어 갑니다.'], ['WITH YOU', '편해질수록 가까워지는 거리', '좋아하는 사람에게 먼저 다가가고, 친밀함이 늘수록 장난과 애교뿐 아니라 참견도 늘어납니다.']];
  const glass = `<svg class="hy-glass" viewBox="0 0 120 170" aria-hidden="true">
      <defs><clipPath id="hy-cup"><path d="M14 18h92l-9 140a8 8 0 0 1-8 7H31a8 8 0 0 1-8-7z"/></clipPath></defs>
      <g clip-path="url(#hy-cup)">
        <rect class="hy-water" x="0" y="96" width="120" height="80"/>
        <g class="hy-ice">
          <g data-ice="0"><rect x="30" y="70" width="28" height="26" rx="5" transform="rotate(-12 44 83)"/></g>
          <g data-ice="1"><rect x="58" y="64" width="30" height="28" rx="5" transform="rotate(9 73 78)"/></g>
          <g data-ice="2"><rect x="40" y="96" width="26" height="24" rx="5" transform="rotate(18 53 108)"/></g>
          <g data-ice="3"><rect x="64" y="100" width="24" height="22" rx="5" transform="rotate(-6 76 111)"/></g>
        </g>
      </g>
      <path class="hy-cup-line" d="M14 18h92l-9 140a8 8 0 0 1-8 7H31a8 8 0 0 1-8-7z"/>
      <path class="hy-cup-shine" d="M26 30l8 118"/>
    </svg>`;

  main.innerHTML = `
  <header class="hy-top">
    <a class="hy-mark" href="#top">유혜연 <span>HYEYEON YOO · 제작 중</span></a>
    <nav class="hy-nav" aria-label="작품 메뉴"><a href="#ice">첫 장</a><a href="#person">인물</a><a href="#days">생활</a><a href="#bond">관계</a></nav>
    <a class="hy-back" href="${base}">← archive</a>
  </header>

  <div class="hy-slide">
  <section class="hy-half" id="top" aria-label="${esc(title)} — 유혜연의 첫 장">
    <img class="hy-ice-face" src="${asset('identity/hyeyeon-ice-face.webp')}" alt="" width="1536" height="1024" fetchpriority="high" aria-hidden="true">
    <img class="hy-shatter" src="${asset('identity/hyeyeon-ice-break.webp')}" alt="" width="1536" height="1024" aria-hidden="true">
    <p class="hy-half-top">redsea works · 04</p>
    <h1 class="hy-title" aria-label="${esc(title)}">${[...title].map((ch, i) => `<span class="hy-syl" aria-hidden="true" style="--side:${i ? 1 : -1}">${esc(ch)}</span>`).join('')}</h1>
    <p class="hy-first">${esc(first)}</p>
    <a class="hy-down" href="#ice">첫 장 읽기</a>
    <p class="hy-half-foot">유혜연 · 첫 메시지 ${text.length + 1}문단 · ${esc(p.version)}</p>
  </section>
  <div class="hy-hold" aria-hidden="true"></div>

  <article class="hy-chapter" id="ice" aria-labelledby="ice-h">
    <aside class="hy-margin" aria-hidden="true">${glass}<p class="hy-glass-note" data-glass-note>삼십 분째</p></aside>
    <div class="hy-page">
      <header class="hy-chapter-head"><p>1</p><h2 id="ice-h">${esc(title)}</h2></header>
      <p class="hy-lede">${esc(first)}</p>
      ${body}
      <p class="hy-end">이 글에서 대화가 시작됩니다.</p>
    </div>
  </article>
  </div>

  <section class="hy-person" id="person" aria-labelledby="person-h">
    <figure class="hy-plate"><img src="${asset('hyeyeon-cinematic-v1.webp')}" alt="흰 머리띠를 한 유혜연, 저녁 카페의 창가" ${size('hyeyeon-cinematic-v1.webp')} loading="lazy"><figcaption>유혜연 · 저녁의 창가</figcaption></figure>
    <div class="hy-person-copy">
      <h2 id="person-h">혼자서도 잘 지내지만,<br>늘 혼자 있고 싶지는 않다.</h2>
      <dl class="hy-facts">${p.facts.map(f => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>
      ${p.overview.slice(0, 2).map(t => `<p>${esc(t)}</p>`).join('')}
      <p class="hy-aside">관계의 마찰도 성격의 일부로 남겨 둡니다. 애정과 간섭을 구별하게 되는 순간도, 구별하지 못하는 순간도 관계에 남습니다.</p>
    </div>
  </section>

  <section class="hy-days" id="days" aria-labelledby="days-h">
    <h2 id="days-h">일과 공부 사이, 혜연의 생활</h2>
    <figure class="hy-desk"><img src="${asset('worlds/hyeyeon-evening.webp')}" alt="퇴근 후 공부할 책과 노트가 놓인 유혜연의 방" width="1672" height="941" loading="lazy"><figcaption>집으로 돌아와, 아직 남은 두 과목.</figcaption></figure>
    <ol class="hy-toc">${DAY.map(([k, h, t], i) => `<li><span>${k}</span><div><h3>${h}</h3><p>${t}</p></div><b>${i + 2}</b></li>`).join('')}</ol>
  </section>

  <section class="hy-bond" id="bond" aria-labelledby="bond-h">
    <div class="hy-bond-head"><h2 id="bond-h">호감이 변해도,<br>있었던 일은 남도록.</h2><p>${esc(p.overview[3] || '')}</p><p class="hy-wip">개발 중인 관계 엔진 · 규칙 설명</p></div>
    <div class="hy-lab">
      <figure class="hy-diagram" aria-hidden="true">${diagram()}</figure>
      <div class="hy-lab-side">
        <h3>한 번의 상호작용을 골라 보세요</h3>
        <div class="hy-moments" role="group" aria-label="예시 상호작용">${MOMENTS.map(m => `<button type="button" data-moment="${m.id}" aria-pressed="false" class="${m.sign > 0 ? 'is-warm' : 'is-cold'}"><span>${m.sign > 0 ? '다가감' : '거리둠'}${m.big ? ' · 의미 있는 사건' : ''}</span>${esc(m.text)}</button>`).join('')}</div>
        <dl class="hy-legend">${AXES.map(([a, t]) => `<div data-legend="${a}"><dt>${a}</dt><dd>${t}</dd></div>`).join('')}</dl>
      </div>
    </div>
    <ol class="hy-steps"><li data-step="0"><span>01</span><b>상호작용</b><p>말과 행동을 다섯 방향에서 봅니다.</p></li><li data-step="1"><span>02</span><b>의미 있는 사건</b><p>혜연에게 중요한 일일 때만 변화가 커집니다. 좋고 나쁨의 방향은 그대로입니다.</p></li><li data-step="2"><span>03</span><b>호감도와 사건 기억</b><p>호감도가 상한에 닿아도 사건은 기억합니다.</p></li></ol>
    <div class="hy-result">
      <div class="hy-meter"><p><span>거리둠</span><b data-mood>아직 아무 일도 없었다</b><span>다가감</span></p><div class="hy-meter-track"><i data-mark></i></div><p class="hy-meter-note" data-cap aria-live="polite">수치는 확정 전이라 방향과 크기만 보여 줍니다.</p></div>
      <article class="hy-mem is-warm" data-mem="warm"><span>다가감 · 최근의 긍정적 사건</span><p>관계가 가까워진 전환점을 한 건 기억합니다.</p></article>
      <article class="hy-mem is-cold" data-mem="cold"><span>거리둠 · 최근의 부정적 사건</span><p>평범한 대화를 했다는 이유만으로 거리감이 저절로 사라지지는 않습니다.</p></article>
    </div>
    <p class="hy-status">위 장면은 규칙의 흐름을 보여 주는 예시이며 실제 봇의 판정이 아닙니다. 긍정·부정 사건은 각각 최근 한 건을 남깁니다. 관계 단계와 연애 전환은 아직 구현 중이고, 실제 RisuAI와 모델을 연결한 품질 검증도 남아 있습니다. 점수의 초기값·범위·배율은 확정되지 않았습니다.</p>
  </section>

  <footer class="hy-foot">
    <a class="hy-next" href="${base}projects/rental-danjo/"><small>처음 작품으로</small><b>렌탈남녀</b></a>
    <p>© 2026 redsea works · 유혜연 ${esc(p.version)} · 제작 중. ${esc(p.note)} 이미지에 AI 생성 및 편집 자료가 포함됩니다. <a href="${base}credits/">저작권 · 크레딧</a></p>
    <a class="hy-back" href="${base}">← archive</a>
  </footer>`;

  /* ---------- the cover cracks, frosts over, and the chapter slides across it ---------- */
  const half = main.querySelector('.hy-half');
  const stillCover = matchMedia('(prefers-reduced-motion: reduce)');
  let coverTick = false;
  function cover() {
    coverTick = false;
    // First the ice gives way while the cover holds still, then the chapter slides over it.
    const hold = main.querySelector('.hy-hold').offsetHeight;
    const crack = Math.min(1, Math.max(0, scrollY / Math.max(1, hold)));
    const t = Math.min(1, Math.max(0, (scrollY - hold) / Math.max(1, half.offsetHeight)));
    half.style.setProperty('--c', stillCover.matches ? '1' : crack.toFixed(4));
    half.style.setProperty('--p', stillCover.matches ? '0' : t.toFixed(4));
  }
  addEventListener('scroll', () => { if (!coverTick) { coverTick = true; requestAnimationFrame(cover); } }, { passive: true });
  cover();
  requestAnimationFrame(() => half.classList.add('is-cold'));

  /* ---------- lines that carry the scene ---------- */
  const moments = [...main.querySelectorAll('[data-moment]')];
  const settle = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); settle.unobserve(e.target); } }), { threshold: .6, rootMargin: '0px 0px -12% 0px' });
  moments.forEach(m => settle.observe(m));
  let momentTick = false;
  function drift() {
    momentTick = false;
    if (stillCover.matches) return;
    const vh = innerHeight;
    moments.forEach(m => {
      const r = m.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) return;
      const v = Math.max(-1, Math.min(1, ((r.top + r.height / 2) - vh / 2) / vh));   // -1 above, 0 centred, 1 below
      m.style.setProperty('--v', v.toFixed(3));
    });
  }
  addEventListener('scroll', () => { if (!momentTick) { momentTick = true; requestAnimationFrame(drift); } }, { passive: true });
  drift();

  /* ---------- the relationship diagram ---------- */
  const lab = main.querySelector('.hy-bond');
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  let level = 0, timers = [];
  const wait = (fn, ms) => timers.push(setTimeout(fn, still.matches ? 0 : ms));
  function moment(m) {
    timers.forEach(clearTimeout); timers = [];
    lab.querySelectorAll('[data-moment]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.moment === m.id)));
    lab.querySelectorAll('[data-step]').forEach(li => li.className = '');
    lab.querySelectorAll('.hy-node, .hy-pulse, [data-legend]').forEach(el => el.classList.remove('is-pos', 'is-neg', 'is-on'));
    lab.querySelectorAll('.hy-node-sign').forEach(t => { t.textContent = ''; });
    lab.classList.remove('is-amp');
    void lab.offsetWidth;
    const cls = m.sign > 0 ? 'is-pos' : 'is-neg';
    lab.querySelector('[data-step="0"]').className = 'is-now';
    m.axes.forEach((a, i) => wait(() => {
      lab.querySelector(`[data-node="${a}"]`).classList.add(cls);
      lab.querySelector(`[data-node="${a}"] .hy-node-sign`).textContent = m.sign > 0 ? '＋' : '－';
      lab.querySelector(`[data-pulse="${a}"]`).classList.add(cls, 'is-on');
      lab.querySelector(`[data-legend="${a}"]`).classList.add('is-on');
    }, i * 120));
    wait(() => {
      lab.querySelector('[data-step="0"]').className = 'is-done';
      lab.querySelector('[data-step="1"]').className = m.big ? 'is-now' : 'is-skip';
      if (m.big) lab.classList.add('is-amp');
    }, 820);
    wait(() => {
      lab.querySelector('[data-step="1"]').className = m.big ? 'is-done' : 'is-skip';
      lab.querySelector('[data-step="2"]').className = 'is-now';
      const before = level;
      level = Math.max(-1, Math.min(1, level + m.sign * m.axes.length * .13 * (m.big ? 2 : 1)));
      const capped = Math.abs(before + m.sign * m.axes.length * .13 * (m.big ? 2 : 1)) > 1;
      lab.querySelector('[data-mark]').style.left = `${50 + level * 46}%`;
      lab.querySelector('[data-mood]').textContent = level > .6 ? '많이 가까워졌다' : level > .15 ? '조금 가까워졌다' : level < -.6 ? '거리가 멀어졌다' : level < -.15 ? '조금 멀어졌다' : '제자리에 가깝다';
      lab.querySelector('[data-core]').textContent = m.sign > 0 ? (m.big ? '크게 다가감' : '다가감') : (m.big ? '크게 거리둠' : '거리둠');
      lab.querySelector('[data-cap]').textContent = capped ? '상한에 닿았습니다. 호감도는 더 움직이지 않지만, 이 사건은 기억에 남습니다.' : m.big ? '혜연에게 의미 있는 일이라 변화가 커졌습니다. 방향은 그대로입니다.' : '수치는 확정 전이라 방향과 크기만 보여 줍니다.';
      const mem = lab.querySelector(`[data-mem="${m.sign > 0 ? 'warm' : 'cold'}"]`);
      mem.querySelector('p').textContent = m.text;
      mem.classList.remove('is-new'); void mem.offsetWidth; mem.classList.add('is-new');
    }, 1250);
  }
  lab.addEventListener('click', e => { const b = e.target.closest('[data-moment]'); if (b) moment(MOMENTS.find(m => m.id === b.dataset.moment)); });
  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { lab.classList.add('is-drawn'); o.disconnect(); } }, { threshold: .25 }).observe(lab.querySelector('.hy-diagram'));

  /* ---------- the ice melts as the chapter is read ---------- */
  const chapter = main.querySelector('.hy-chapter');
  const cubes = [...main.querySelectorAll('[data-ice]')];
  const water = main.querySelector('.hy-water');
  const note = main.querySelector('[data-glass-note]');
  const notes = ['삼십 분째', '얼음 세 조각', '두 조각', '마지막 한 조각', '빈 컵'];
  let ticking = false;
  function melt() {
    ticking = false;
    const r = chapter.getBoundingClientRect();
    const t = Math.min(1, Math.max(0, (innerHeight * .5 - r.top) / Math.max(1, r.height - innerHeight * .5)));
    cubes.forEach((c, i) => {
      const left = Math.min(1, Math.max(0, 1 - (t * 4.4 - i)));   // one cube goes per quarter of the chapter
      c.style.opacity = String(left);
      c.style.transform = `scale(${.55 + left * .45})`;
    });
    water.setAttribute('y', String(96 + t * 58));
    note.textContent = notes[Math.min(notes.length - 1, Math.floor(t * 4.4))];
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(melt); } }, { passive: true });
  melt();

  const top = main.querySelector('.hy-top');
  new IntersectionObserver(([e]) => top.classList.toggle('is-solid', !e.isIntersecting), { rootMargin: '-80px 0px 0px 0px' }).observe(main.querySelector('.hy-title'));
  if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
})();
