(() => {
  'use strict';
  const data = window.BOT_WORKS;
  const base = document.body.dataset.base || './';
  const current = document.body.dataset.project;
  const main = document.querySelector('#main');
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
  const asset = name => `${base}assets/${name}`;
  const dimensions = name => data.media?.[name] ? `width="${data.media[name].width}" height="${data.media[name].height}"` : '';
  const url = project => `${base}projects/${project.id}/`;
  const date = value => value ? value.replaceAll('-', '.') : '';
  const getProject = id => data.projects.find(project => project.id === id);
  const tagHTML = project => project.tags.map(tag => `<span>${escape(tag)}</span>`).join('');

  function cover(project, context = 'work') {
    if (project.cover) return `<img class="${context}-image" src="${asset(project.cover)}" alt="${escape(project.alt)}" ${context === 'hero' ? 'fetchpriority="high"' : 'loading="lazy"'} width="${project.coverWidth}" height="${project.coverHeight}">`;
    return `<div class="wip-art" aria-label="${escape(project.title)} 제작 중"><span class="wip-top">CHARACTER STUDY / ${project.number}</span><div class="wip-orbit" aria-hidden="true"><i></i><i></i><i></i><span></span></div><strong>${escape(project.title)}</strong><span class="wip-bottom">A NEW STORY IS TAKING SHAPE.</span></div>`;
  }

  function homePlate(project, index) {
    const poster = project.storefront.poster && project.storefront.poster !== project.storefront.backdrop ? project.storefront.poster : '';
    return `<article class="rw-plate${index ? '' : ' is-active'}" data-plate="${index}" aria-hidden="${index ? 'true' : 'false'}"${index ? ' inert' : ''}><a class="rw-plate-link" href="${url(project)}"><img class="rw-plate-art" src="${asset(project.storefront.backdrop)}" alt="${escape(project.alt || project.title)}" ${dimensions(project.storefront.backdrop)} ${index ? 'loading="lazy"' : 'fetchpriority="high"'} style="object-position:${project.storefront.position || '50% 50%'}"><span class="rw-plate-sheen" aria-hidden="true"></span>${poster ? `<img class="rw-plate-poster" src="${asset(poster)}" alt="" ${dimensions(poster)} ${index ? 'loading="lazy"' : ''}>` : ''}<span class="rw-plate-type"><span class="rw-plate-no">${project.number} — ${escape(project.category)}${project.status === '제작 중' ? ' · 제작 중' : ''}</span><h2>${escape(project.title)}</h2><span class="rw-plate-line">${escape(project.tagline)}</span><span class="rw-plate-enter">작품 보기<span aria-hidden="true">→</span></span></span></a></article>`;
  }

  function homeWork(project) {
    const when = project.status === '제작 중' ? '<span class="rw-work-wip">제작 중</span>' : `<span>${date(project.updated)}</span>`;
    return `<article class="rw-work" data-work="${project.id}" data-category="${escape(project.category)}" data-status="${escape(project.status)}" style="--project-color:${project.color}">
      <a class="rw-work-art" href="${url(project)}" tabindex="-1" aria-hidden="true"><img src="${asset(project.storefront.backdrop)}" alt="" ${dimensions(project.storefront.backdrop)} loading="lazy" style="object-position:${project.storefront.position || '50% 50%'}"></a>
      <div class="rw-work-copy"><p class="rw-work-meta"><b>${project.number}</b><span>${escape(project.category)}</span><span>${escape(project.version)}</span>${when}</p><h3><a href="${url(project)}">${escape(project.title)}</a></h3><p class="rw-work-line">${escape(project.tagline)}</p><p class="rw-work-text">${escape(project.summary)}</p><a class="rw-work-enter" href="${url(project)}" aria-label="${escape(project.title)} 작품 보기">작품 보기 <span aria-hidden="true">→</span></a></div>
    </article>`;
  }

  function homeFilm(id, videoIndex) {
    const project = getProject(id), video = project.videos[videoIndex];
    const size = data.media?.[video.poster];
    const portrait = size && size.width < size.height;
    return `<article class="rw-film"><a class="rw-film-art${portrait ? ' is-portrait' : ''}" href="${url(project)}#films" aria-label="${escape(video.title)} — ${escape(project.title)} 영상 보기"><img src="${asset(video.poster)}" alt="" ${dimensions(video.poster)} loading="lazy"></a><div class="rw-film-copy"><span>${escape(project.title)}</span><h3>${escape(video.title)}</h3></div></article>`;
  }

  function updateItem(update) {
    const project = getProject(update.project);
    return `<article class="rw-entry" id="${update.id}" style="--project-color:${project.color}"><div class="rw-entry-when"><time datetime="${update.date}">${date(update.date)}</time><span>${escape(update.type)}</span></div><div><a class="rw-entry-who" href="${url(project)}#updates"><i aria-hidden="true"></i>${escape(project.title)} <span>${escape(update.version)}</span></a><h3><a href="${url(project)}#${update.id}">${escape(update.title)}</a></h3><p>${escape(update.text)}</p></div></article>`;
  }

  function mediaImage(item, className = '') {
    return `<figure class="${className}"><button class="capture-image" data-lightbox="${escape(item.image)}" data-alt="${escape(item.alt)}" data-caption="${escape(item.caption)}" aria-label="${escape(item.caption)} 크게 보기"><img src="${asset(item.image)}" alt="${escape(item.alt)}" ${dimensions(item.image)} loading="lazy"><span aria-hidden="true">확대</span></button><figcaption>${escape(item.caption)}</figcaption></figure>`;
  }

  function renderSystems(project) {
    if (!project.systems?.length) return '';
    return `<section class="systems-section page-width" id="systems"><div class="section-heading compact"><div><p class="eyebrow">시스템 체험</p><h2>${escape(project.systemsTitle)}</h2></div><p>아래 화면에서 직접 눌러 보세요.</p></div><p class="capture-note">봇의 UI와 규칙을 웹에서 체험할 수 있게 옮겼습니다. 수치는 예시이며 실제 플레이에는 저장되지 않습니다.</p>${window.SystemShowcase.render(project,base)}<div class="system-explainers">${project.systems.map(item=>`<article class="system-case"><div class="system-copy"><span class="system-number">${item.number}</span><h3>${escape(item.title)}</h3><p>${escape(item.text)}</p></div></article>`).join('')}</div></section>`;
  }

  function renderVideos(project) {
    if (!project.videos?.length) return '';
    return `<section class="film-section" id="films"><div class="page-width"><div class="section-heading compact"><div><p class="eyebrow">소개 · 시연 영상</p><h2>영상 보기</h2></div><p>재생 버튼을 누르면 영상이 시작됩니다.</p></div><div class="film-grid${project.videos.length===1?' single-film':''}">${project.videos.map(item => `<figure><div class="film-label">${escape(item.label)}</div><video controls playsinline preload="none" ${dimensions(item.poster)} poster="${asset(item.poster)}" aria-label="${escape(item.title)}"><source src="${asset(item.source)}" type="video/mp4">이 브라우저에서는 영상을 재생할 수 없습니다.</video><figcaption><h3>${escape(item.title)}</h3><p>${escape(item.caption)}</p></figcaption></figure>`).join('')}</div></div></section>`;
  }

  function renderCharacters(project) {
    if (!project.characters?.length) return '';
    return window.CastExplorer.render(project,base);
  }

  function bindCharacters() {
    window.CastExplorer.bind();
  }

  function renderScenes(project) {
    if(!project.scenes?.length)return '';
    return `<section class="scenes-section page-width" id="scenes"><div class="section-heading compact"><div><p class="eyebrow">첫 만남</p><h2>누구와 먼저 만날까요?</h2></div><p>세 인물의 첫 만남을 소개합니다.</p></div><div class="scene-grid">${project.scenes.map((item,index)=>`<article>${item.image?mediaImage({image:item.image,alt:item.imageCaption,caption:item.imageCaption}):''}<span class="scene-index">0${index+1}</span><p class="eyebrow">${escape(item.name)}</p><h3>${escape(item.title)}</h3><p>${escape(item.text)}</p><blockquote>“${escape(item.quote)}”</blockquote></article>`).join('')}</div></section>`;
  }

  function posterArt(project, context = 'detail') {
    const poster=project.storefront.poster || project.cover;
    const caption=['music-story','yoo-hyeyeon'].includes(project.id);
    return `<img class="${context}-image" src="${asset(poster)}" alt="${escape(project.title)} 작품 포스터" ${dimensions(poster)} style="object-position:${project.id==='yoo-hyeyeon'?'73% 50%':'50% 50%'}">${caption?`<span class="poster-title">${escape(project.title)}</span>`:''}`;
  }

  function renderHome() {
    document.body.classList.add('home-page');
    const projects = data.projects;
    main.innerHTML = `<div class="rw-home">
      <header class="rw-open page-width"><p class="rw-open-brand">redsea works — RisuAI에서 돌아가는 인터랙티브 스토리를 직접 만듭니다.</p><h1>세계를 설계하고,<br><em>마음을 그려낸다.</em></h1></header>

      <section class="rw-stage page-width" aria-labelledby="stage-label"><h2 id="stage-label" class="sr-only">작품 고르기</h2><div class="rw-stage-frame">${projects.map(homePlate).join('')}</div><nav class="rw-index" aria-label="작품 고르기">${projects.map((p, i) => `<button type="button" data-plate-go="${i}" aria-pressed="${i === 0}"><span>${p.number}</span><b>${escape(p.title)}</b></button>`).join('')}</nav><p class="sr-only" aria-live="polite" id="stage-live"></p></section>

      <section class="rw-works page-width" id="works" aria-labelledby="works-title"><div class="rw-section-head"><h2 id="works-title">작품</h2><p>완성작 ${projects.filter(p => p.status !== '제작 중').length} · 제작 중 ${projects.filter(p => p.status === '제작 중').length}</p></div>${projects.map(homeWork).join('')}</section>

      <section class="rw-films page-width" aria-labelledby="films-title"><div class="rw-section-head"><h2 id="films-title">영상</h2><p>직접 만든 세계관 영상과 실제 연주 시연</p></div><div class="rw-film-grid">${homeFilm('into-the-abyss', 1)}${homeFilm('music-story', 0)}</div></section>

      <section class="rw-journal" id="journal" aria-labelledby="journal-title"><div class="page-width"><div class="rw-journal-head"><h2 id="journal-title">업데이트</h2><label><span class="sr-only">업데이트 작품 선택</span><select id="journal-filter"><option value="all">모든 작품</option>${projects.filter(p => data.updates.some(u => u.project === p.id)).map(p => `<option value="${p.id}">${escape(p.title)}</option>`).join('')}</select></label></div><div class="rw-journal-list" id="journal-list"></div><button class="rw-journal-more" id="journal-more" type="button" hidden></button></div></section>

      <section class="rw-note page-width" id="about" aria-labelledby="about-title"><h2 id="about-title">안녕하세요.<br>redsea입니다.</h2><div class="rw-note-body"><p>RisuAI에서 쓸 캐릭터와 시뮬레이션 봇을 만듭니다. 설정과 대사, 게임 규칙, 화면까지 직접 작업합니다.</p><p>완성한 봇도 계속 고치고 있습니다. 새 캐릭터나 기능을 추가하면 이곳에도 올립니다.</p><p class="rw-note-tags"><span>캐릭터와 세계관</span><span>게임 시스템</span><span>인터랙티브 화면</span></p></div></section>
    </div>`;
    bindStage();
    bindJournal();
  }

  function bindStage() {
    const plates = [...document.querySelectorAll('.rw-plate')];
    const buttons = [...document.querySelectorAll('[data-plate-go]')];
    const live = document.querySelector('#stage-live');
    let active = 0;
    function show(index) {
      if (index === active || !plates[index]) return;
      active = index;
      plates.forEach((plate, i) => {
        plate.classList.toggle('is-active', i === index);
        plate.setAttribute('aria-hidden', String(i !== index));
        plate.inert = i !== index;
      });
      buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
      document.documentElement.style.setProperty('--story-accent', data.projects[index].color);
      if (live) live.textContent = `${data.projects[index].title} 선택됨`;
    }
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => show(index));
      button.addEventListener('keydown', event => {
        const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
        if (!step) return;
        event.preventDefault();
        const next = (index + step + buttons.length) % buttons.length;
        show(next);
        buttons[next].focus();
      });
    });
  }

  function bindJournal() {
    const select = document.querySelector('#journal-filter');
    const more = document.querySelector('#journal-more');
    let expanded = false;
    function apply() {
      const items = data.updates.filter(update => select.value === 'all' || update.project === select.value);
      document.querySelector('#journal-list').innerHTML = items.length
        ? (expanded ? items : items.slice(0, 3)).map(updateItem).join('')
        : '<p class="rw-journal-empty">이 작품은 아직 올린 기록이 없습니다.</p>';
      more.hidden = items.length <= 3;
      more.textContent = expanded ? '기록 접기' : `기록 ${items.length}건 모두 보기`;
      more.setAttribute('aria-expanded', String(expanded));
      document.dispatchEvent(new Event('portfolio:updated'));
    }
    select.addEventListener('change', () => { expanded = false; apply(); });
    more.addEventListener('click', () => { expanded = !expanded; apply(); });
    apply();
  }

  function renderProject(project) {
    if (!project) {
      main.innerHTML = `<section class="page-width missing"><p class="eyebrow">페이지 없음</p><h1>작품 페이지를 찾을 수 없습니다.</h1><a class="text-link" href="${base}#works">전체 작품 보기</a></section>`;
      return;
    }
    const updates = data.updates.filter(update => update.project === project.id);
    const next = data.projects[(data.projects.indexOf(project) + 1) % data.projects.length];
    document.body.classList.add('project-page', `project-${project.theme}`);
    document.body.style.setProperty('--project-color', project.color);
    main.innerHTML = `<div class="project-breadcrumb page-width"><a href="${base}#works">← 전체 작품</a><span>N° ${project.number} / ${escape(project.category)}</span></div>
      <section class="project-hero page-width ${project.storefront.cinematic?'cinematic-hero':''}" aria-labelledby="project-title"><div class="project-landscape" aria-hidden="true"><img src="${asset(project.storefront.backdrop)}" ${dimensions(project.storefront.backdrop)} alt="" fetchpriority="high" style="object-position:${project.storefront.position||'50% 50%'}"></div><div class="project-cover ${project.theme} ${project.storefront.cinematic?'cinematic-inset':''}">${posterArt(project)}</div><div class="project-intro"><p class="eyebrow">${escape(project.english)}</p><h1 id="project-title">${escape(project.title)}</h1><p class="project-tagline">${escape(project.tagline)}</p><p class="project-summary">${escape(project.summary)}</p><div class="tags">${tagHTML(project)}</div><div class="project-version"><span class="status-dot ${project.status === '제작 중' ? 'pending' : ''}"></span>${escape(project.version)}${project.updated ? `<time datetime="${project.updated}">${date(project.updated)}</time>` : ''}</div>${project.links.length ? `<div class="project-actions">${project.links.map(link => `<a class="solid-button" href="${escape(link.url)}" target="_blank" rel="noopener noreferrer">${escape(link.label)}</a>`).join('')}</div>` : project.guide.length ? `<a class="solid-button" href="${project.systems?.length?'#systems':'#characters'}">${project.systems?.length?'직접 체험하기':'등장인물 만나기'} ↓</a>` : '<span class="wip-label">제작 중인 캐릭터</span>'}</div></section>
      <nav class="project-nav page-width" aria-label="작품 페이지 메뉴"><a href="#overview">작품 소개</a>${project.videos?.length?'<a href="#films">영상</a>':''}${project.id==='rental-danjo'?'<a href="#places">장소</a>':''}${project.systems?.length?'<a href="#systems">직접 체험</a>':''}${project.characters?.length?'<a href="#characters">등장인물</a>':''}${project.scenes?.length?'<a href="#scenes">첫 만남</a>':''}${project.gallery.length?'<a href="#artworks">아트워크</a>':''}${updates.length?'<a href="#updates">업데이트</a>':''}${project.guide.length?'<a href="#play-guide">이용 안내</a>':''}</nav>
      <section class="project-overview page-width" id="overview"><div><p class="eyebrow">작품 소개</p><h2>${project.status === '제작 중' ? '아직 제작 중입니다.' : escape(project.tagline)}</h2><dl class="project-facts">${project.facts.map(fact => `<div><dt>${escape(fact.label)}</dt><dd>${escape(fact.value)}</dd></div>`).join('')}</dl></div><div class="prose">${project.overview.map(paragraph => `<p>${escape(paragraph)}</p>`).join('')}</div></section>
      ${project.features.length && !project.systems?.length && !project.scenes?.length ? `<section class="feature-section page-width" id="features"><div class="section-heading compact"><div><p class="eyebrow">캐릭터와 관계 설정</p><h2>어떤 캐릭터인가요?</h2></div></div><div class="feature-list">${project.features.map((feature, index) => `<article><span class="feature-number">0${index + 1}</span><h3>${escape(feature.title)}</h3><p>${escape(feature.text)}</p></article>`).join('')}</div></section>` : ''}
      ${window.RentalPlaces.render(project,base)}
      ${renderSystems(project)}
      ${renderVideos(project)}
      ${renderCharacters(project)}
      ${renderScenes(project)}
      ${project.gallery.length ? `<section class="gallery-section page-width ${project.theme==='rental'?'poster-gallery':''} ${project.theme==='abyss'?'world-gallery':''}" id="artworks"><div class="section-heading compact"><div><p class="eyebrow">${escape(project.galleryLabel||'캐릭터 · 일러스트')}</p><h2>${escape(project.galleryTitle||'캐릭터와 장면')}</h2></div></div><div class="gallery-grid">${project.gallery.map(item => mediaImage(item)).join('')}</div></section>` : ''}
      ${updates.length ? `<section class="project-updates" id="updates"><div class="page-width"><div class="section-heading compact"><div><p class="eyebrow">업데이트 내역</p><h2>업데이트 내역</h2></div></div><div class="journal-list">${updates.map(updateItem).join('')}</div></div></section>` : ''}
      ${project.guide.length ? `<section class="play-guide page-width" id="play-guide"><div><p class="eyebrow">이용 안내</p><h2>플레이 방법</h2><span class="platform-label">RISUAI / CHARACTER CARD</span></div><ol>${project.guide.map(step => `<li>${escape(step)}</li>`).join('')}</ol></section>` : ''}
      ${project.note ? `<aside class="project-note page-width"><span aria-hidden="true">✳</span><p>${escape(project.note)}</p></aside>` : ''}
      <a class="next-project page-width" href="${url(next)}"><div><p class="eyebrow">다음 작품 / ${next.number}</p><h2>${escape(next.title)}</h2></div></a>`;
  }

  if (!data || !Array.isArray(data.projects)) {
    main.innerHTML = '<div class="missing page-width"><h1>작품을 불러오지 못했어요.</h1><p>잠시 후 페이지를 다시 열어 주세요.</p></div>';
    return;
  }
  current ? renderProject(getProject(current)) : renderHome();
  bindCharacters();
  window.RentalPlaces.bind(base);
  window.SystemShowcase.bind();
  const lightbox = document.querySelector('#lightbox');
  let previousFocus = null;
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-lightbox]');
    if (!button) return;
    previousFocus = button;
    lightbox.querySelector('img').src = asset(button.dataset.lightbox);
    lightbox.querySelector('img').alt = button.dataset.alt;
    lightbox.querySelector('p').textContent = button.dataset.caption;
    lightbox.classList.remove('original-size');
    lightbox.querySelector('.lightbox-zoom').setAttribute('aria-pressed','false');
    lightbox.showModal();
    document.body.classList.add('modal-open');
  });
  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.querySelector('.lightbox-zoom').addEventListener('click', event => {
    const original=lightbox.classList.toggle('original-size');
    event.currentTarget.setAttribute('aria-pressed',String(original));
  });
  lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('close', () => { document.body.classList.remove('modal-open'); previousFocus?.focus(); });
  if (location.hash) requestAnimationFrame(() => document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView());
})();
