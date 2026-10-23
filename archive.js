(() => {
  'use strict';
  const data = window.BOT_WORKS;
  const main = document.querySelector('#main');
  if (!data || !main || document.body.dataset.page !== 'home') return;

  const base = document.body.dataset.base || './';
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const asset = name => `${base}assets/${name}`;
  const size = name => data.media?.[name] ? `width="${data.media[name].width}" height="${data.media[name].height}"` : '';
  const url = (p, hash = '') => `${base}projects/${p.id}/${hash}`;
  const date = v => v ? v.slice(0, 7).replace('-', '.') : '';

  // How each work presents itself on the shelf. The display line is set in the
  // archive face; the Korean title stays underneath, as the work's real name.
  const face = {
    'rental-danjo': { display: 'RENTAL 男女', label: 'AGENCY', kind: '시뮬레이션', hook: '요이마치의 렌탈 인력이 되어 지명을 받고, 데이트하고, 보수로 빚을 갚는다.', play: ['#booking', '지명 받아 보기'], pos: '50% 22%' },
    'into-the-abyss': { display: 'INTO THE ABYSS', label: 'GUILD', kind: '시뮬레이션', hook: '도시에서 채비하고, 넷이서 심연으로 내려갔다가, 살아서 돌아온다.', play: ['#expedition', '원정 나가 보기'], pos: '50% 30%' },
    'music-story': { display: 'RESONANCE DUET', label: 'DUET', kind: '캐릭터', hook: '히비키가오카 음악학원, 세 사람과 듣고 따라 치는 공명 듀엣.', play: ['#duet', '같이 연주해 보기'], pos: '50% 40%' },
    'yoo-hyeyeon': { display: 'HYEYEON YOO', label: 'IN PROGRESS', kind: '캐릭터', hook: '닿지 않았으면 싶었다. 23세 사회 초년생 유혜연의 첫 장.', play: ['#ice', '첫 장 읽기'], pos: '68% 20%' }
  };
  const works = data.projects.filter(p => face[p.id]);
  const byDate = [...works].sort((a, b) => String(b.updated).localeCompare(String(a.updated)));
  const backdrop = p => p.storefront?.backdrop || p.cover;
  // Han characters in a Latin display line get their own weight and size.
  const display = text => esc(text).replace(/[぀-鿿]+/g, m => `<span class="cjk">${m}</span>`);

  function hero(p, i) {
    const f = face[p.id];
    const tags = p.tags.filter(t => t !== '제작 중').map(t => `<span>#${esc(t)}</span>`).join('');
    return `<article class="ar-hero-slide${i ? '' : ' is-on'}" data-slide="${i}" aria-roledescription="slide" aria-label="${i + 1} / ${works.length}: ${esc(p.title)}"${i ? ' aria-hidden="true" inert' : ''}>
      <img class="ar-hero-art" src="${asset(backdrop(p))}" alt="" ${size(backdrop(p))} ${i ? 'loading="lazy"' : 'fetchpriority="high"'} style="object-position:${f.pos}">
      <div class="ar-hero-copy">
        <p class="ar-hero-no"><b>NO.${esc(p.number)}</b><span>${esc(f.kind)}</span></p>
        <h1 class="ar-hero-title">${display(f.display)}</h1>
        <p class="ar-hero-ko">${esc(p.title)}</p>
        <p class="ar-hero-meta"><time datetime="${esc(p.updated)}">${date(p.updated)}</time><span class="ar-badge${p.status === '제작 중' ? ' is-wip' : ''}">${p.status === '제작 중' ? '제작 중' : esc(p.version)}</span>${tags}</p>
        <p class="ar-hero-hook">${esc(f.hook)}</p>
        <div class="ar-hero-act"><a class="ar-btn ar-btn-main" href="${url(p)}"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z"/></svg>작품 페이지</a><a class="ar-btn ar-btn-sub" href="${url(p, f.play[0])}">${esc(f.play[1])}</a></div>
      </div>
    </article>`;
  }

  function card(p, opts = {}) {
    const f = face[p.id];
    return `<article class="ar-card${opts.numbered ? ' is-numbered' : ''}" data-work="${p.id}">
      ${opts.numbered ? `<span class="ar-card-num" aria-hidden="true">${Number(p.number)}</span>` : ''}
      <a class="ar-card-art" href="${url(p)}" aria-label="${esc(p.title)} 작품 페이지">
        <img src="${asset(backdrop(p))}" alt="" ${size(backdrop(p))} loading="lazy" style="object-position:${f.pos}">
        <span class="ar-card-kind">${esc(f.kind)}</span><span class="ar-card-label${p.status === '제작 중' ? ' is-wip' : ''}">${esc(f.label)}</span>
        <span class="ar-card-title">${display(f.display)}</span>
      </a>
      <div class="ar-card-body">
        <p class="ar-card-ko"><b>${esc(p.title)}</b><time datetime="${esc(p.updated)}">${date(p.updated)}</time></p>
        <p class="ar-card-tags">${p.tags.map(esc).join('<i aria-hidden="true">·</i>')}</p>
      </div>
    </article>`;
  }

  function row(id, title, sub, items, opts) {
    return `<section class="ar-row" id="${id}" aria-labelledby="${id}-h">
      <h2 class="ar-row-head" id="${id}-h">${esc(title)}<span>${esc(sub)}</span></h2>
      <div class="ar-rail" tabindex="-1">${items.map(p => card(p, opts)).join('')}</div>
    </section>`;
  }

  function film(p, v) {
    return `<article class="ar-film"><a class="ar-film-art" href="${url(p, '#films')}" aria-label="${esc(v.title)} — ${esc(p.title)} 영상 보기">
      <img src="${asset(v.poster)}" alt="" ${size(v.poster)} loading="lazy"><span class="ar-film-play" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M4 2.5v11l9-5.5z"/></svg></span>
      <span class="ar-film-label">${esc(v.label)}</span></a>
      <p class="ar-film-copy"><b>${esc(v.title)}</b><span>${esc(p.title)}</span></p></article>`;
  }

  const films = works.flatMap(p => (p.videos || []).map(v => film(p, v)));
  const updates = data.updates || [];

  main.innerHTML = `
    <section class="ar-hero" id="top" aria-roledescription="carousel" aria-label="대표 작품">
      ${works.map(hero).join('')}
      <div class="ar-hero-dots" role="group" aria-label="대표 작품 고르기">${works.map((p, i) => `<button type="button" data-go="${i}" aria-label="${esc(p.title)}" aria-pressed="${i === 0}"><i></i></button>`).join('')}</div>
      <p class="sr-only" aria-live="polite" id="ar-live"></p>
    </section>
    ${row('r-new', '최근 업데이트', 'NEW', byDate)}
    ${row('r-sim', '시뮬레이션 봇', 'SIMULATION', works.filter(p => face[p.id].kind === '시뮬레이션'))}
    ${row('r-char', '캐릭터 봇', 'CHARACTER', works.filter(p => face[p.id].kind === '캐릭터'))}
    ${films.length ? `<section class="ar-row" id="r-film" aria-labelledby="r-film-h"><h2 class="ar-row-head" id="r-film-h">영상<span>FILMS</span></h2><div class="ar-rail ar-rail-film">${films.join('')}</div></section>` : ''}
    ${row('r-no', '만든 순서대로', 'No.', [...works].sort((a, b) => Number(a.number) - Number(b.number)), { numbered: true })}
    <section class="ar-journal" id="journal" aria-labelledby="journal-h">
      <h2 class="ar-row-head" id="journal-h">업데이트 기록<span>LOG</span></h2>
      <ol class="ar-log">${updates.map(u => { const p = works.find(w => w.id === u.project); return p ? `<li><time datetime="${esc(u.date)}">${esc(u.date.replaceAll('-', '.'))}</time><a href="${url(p, '#log')}"><b>${display(face[p.id].display)}</b><span>${esc(u.version)}</span></a><div><h3>${esc(u.title)}</h3><p>${esc(u.text)}</p></div></li>` : ''; }).join('')}</ol>
    </section>
    <section class="ar-about" id="about" aria-labelledby="about-h">
      <h2 id="about-h">세계를 설계하고,<br>마음을 그려낸다.</h2>
      <p>redsea입니다. RisuAI에서 쓸 캐릭터와 시뮬레이션 봇을 만듭니다. 설정과 대사, 게임 규칙, 화면까지 직접 작업하고, 완성한 봇도 계속 고칩니다.</p>
    </section>`;

  // The hero rotates on its own only while nobody is reading it.
  const slides = [...main.querySelectorAll('.ar-hero-slide')];
  const dots = [...main.querySelectorAll('[data-go]')];
  const hero_ = main.querySelector('.ar-hero');
  const live = main.querySelector('#ar-live');
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  let on = 0, timer = 0, held = false;
  function show(i, announce) {
    if (i === on) return;
    slides[on].classList.remove('is-on'); slides[on].setAttribute('aria-hidden', 'true'); slides[on].inert = true;
    on = i;
    slides[on].classList.add('is-on'); slides[on].removeAttribute('aria-hidden'); slides[on].inert = false;
    dots.forEach((d, n) => d.setAttribute('aria-pressed', String(n === on)));
    if (announce) live.textContent = works[on].title;
  }
  function tick() {
    clearTimeout(timer);
    hero_.style.setProperty('--dwell', '7s');
    hero_.classList.remove('is-timing'); void hero_.offsetWidth;
    if (held || still.matches || document.hidden || slides.length < 2) return;
    hero_.classList.add('is-timing');
    timer = setTimeout(() => { show((on + 1) % slides.length); tick(); }, 7000);
  }
  dots.forEach((d, i) => d.addEventListener('click', () => { show(i, true); tick(); }));
  hero_.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { held = true; tick(); } });
  hero_.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') { held = false; tick(); } });
  hero_.addEventListener('focusin', () => { held = true; tick(); });
  hero_.addEventListener('focusout', e => { if (!hero_.contains(e.relatedTarget)) { held = false; tick(); } });
  document.addEventListener('visibilitychange', tick);
  tick();

  // The header gains a ground once the page leaves the hero.
  const top = document.querySelector('.ar-top');
  const io = new IntersectionObserver(([e]) => top.classList.toggle('is-solid', !e.isIntersecting), { rootMargin: '-72px 0px 0px 0px' });
  io.observe(main.querySelector('.ar-hero-dots'));
})();
