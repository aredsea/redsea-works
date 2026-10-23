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
  const body = text.map((t, i) => `<p class="${said(t) ? 'hy-said' : ''}${i === Math.floor(text.length * .5) ? ' hy-turn' : ''}">${esc(t)}</p>`).join('');

  const AXES = [['존중', '상대를 동등한 사람으로 대하는 태도.'], ['이해', '상대의 상황과 마음을 알아보는 반응.'], ['유능함', '일을 판단하고 해내는 모습.'], ['호의', '자신에게 향하는 관심과 친절.'], ['매력', '끌림을 느끼게 하는 인상.']];
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
    <nav class="hy-nav" aria-label="작품 메뉴"><a href="#ice">첫 장</a><a href="#person">인물</a><a href="#days">생활</a><a href="#bond">관계</a><a href="#prints">사진</a></nav>
    <a class="hy-back" href="${base}">← archive</a>
  </header>

  <section class="hy-half" id="top" aria-label="${esc(title)} — 유혜연의 첫 장">
    <p class="hy-half-top">redsea works · 04</p>
    <h1 class="hy-title"><span>${esc(title)}</span></h1>
    <p class="hy-first">${esc(first)}</p>
    <a class="hy-down" href="#ice">첫 장 읽기</a>
    <p class="hy-half-foot">유혜연 · 첫 메시지 ${text.length + 1}문단 · ${esc(p.version)}</p>
  </section>

  <article class="hy-chapter" id="ice" aria-labelledby="ice-h">
    <aside class="hy-margin" aria-hidden="true">${glass}<p class="hy-glass-note" data-glass-note>삼십 분째</p></aside>
    <div class="hy-page">
      <header class="hy-chapter-head"><p>1</p><h2 id="ice-h">${esc(title)}</h2></header>
      <p class="hy-lede">${esc(first)}</p>
      ${body}
      <p class="hy-end">이 글에서 대화가 시작됩니다.</p>
    </div>
  </article>

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
    <div class="hy-axes">
      <div class="hy-axes-core"><b>호감도</b><small>하나의 값</small></div>
      ${AXES.map(([a, t], i) => `<article style="--i:${i}"><span>0${i + 1}</span><h3>${a}</h3><p>${t}</p></article>`).join('')}
    </div>
    <p class="hy-axes-cap">다섯 개의 게이지를 따로 쌓지 않습니다. 한 번의 상호작용을 다섯 방향에서 보고, 그 결과를 하나의 호감도에 반영합니다.</p>
    <ol class="hy-flow"><li><b>상호작용</b><p>말과 행동을 평가합니다.</p></li><li><b>의미 있는 사건</b><p>혜연 개인에게 중요한 일일 때만 변화가 커집니다. 좋고 나쁨의 방향은 유지됩니다.</p></li><li><b>호감도와 사건 기억</b><p>호감도가 상한에 닿아도 사건은 기억할 수 있습니다.</p></li></ol>
    <div class="hy-memory"><article><span>다가감</span><h3>최근의 긍정적 사건</h3><p>관계가 가까워진 전환점을 기억합니다.</p></article><article><span>거리둠</span><h3>최근의 부정적 사건</h3><p>평범한 대화를 했다는 이유만으로 거리감이 저절로 사라지지는 않습니다.</p></article></div>
    <p class="hy-status">긍정·부정 사건은 각각 최근 한 건을 남깁니다. 관계 단계와 연애 전환은 아직 구현 중이며, 실제 RisuAI와 모델을 연결한 품질 검증도 남아 있습니다. 점수의 초기값·범위·배율은 확정되지 않았습니다.</p>
  </section>

  <section class="hy-prints" id="prints" aria-labelledby="prints-h">
    <h2 id="prints-h">같은 사람, 다른 하루.</h2>
    <div class="hy-print-row">${p.gallery.map((g, i) => `<figure><span>${String(i + 1).padStart(2, '0')}</span><img src="${asset(g.image)}" alt="${esc(g.alt)}" ${size(g.image)} loading="lazy"><figcaption>${esc(g.caption)}</figcaption></figure>`).join('')}</div>
  </section>

  <footer class="hy-foot">
    <a class="hy-next" href="${base}projects/rental-danjo/"><small>처음 작품으로</small><b>렌탈남녀</b></a>
    <p>© 2026 redsea works · 유혜연 ${esc(p.version)} · 제작 중. ${esc(p.note)} 이미지에 AI 생성 및 편집 자료가 포함됩니다. <a href="${base}credits/">저작권 · 크레딧</a></p>
    <a class="hy-back" href="${base}">← archive</a>
  </footer>`;

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
