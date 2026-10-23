(() => {
  'use strict';
  if (document.body.dataset.project !== 'music-story') return;
  const p = window.BOT_WORKS.projects.find(x => x.id === 'music-story');
  const base = document.body.dataset.base || '../../';
  const esc = x => String(x ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const img = (name, alt, cls = '') => `<img class="${cls}" src="${base}assets/${name}" alt="${esc(alt)}" loading="lazy">`;
  const node = (html) => { const box = document.createElement('div'); box.innerHTML = html; return box.firstElementChild; };
  const main = document.querySelector('#main');
  document.body.classList.add('music-booklet');
  const oldHero = main.querySelector('.project-hero');
  const hero = node(`<section class="music-overture" aria-labelledby="project-title"><div class="music-score-heading page-width"><p>ヒビキガオカ音楽学園 <span>RESONANCE DUET</span></p><span class="music-edition">${esc(p.version)} / CHARACTER & MUSIC</span></div><div class="music-title-spread page-width"><span class="music-side-note">Piano · Voice · Theremin</span><h1 id="project-title">벚꽃이 지는 소리를<br><em>너와 들었다.</em></h1><p>도쿄 서쪽 언덕의 음악학원.<br>연습실 문 너머에서, 세 사람의 연주가 들립니다.</p></div><div class="music-overture-image">${img('music-cinematic-v1.webp','벚꽃이 핀 음악학원에서 만난 세 사람','detail-image')}<span class="music-image-caption">桜の散る音を、君と聴いた</span><a href="#systems" class="music-play-seal"><span aria-hidden="true">♪</span><strong>공명 듀엣</strong><small>연주하기 ↗</small></a></div><div class="music-score-strip" aria-hidden="true"><i>♩</i><i>♪</i><i>♬</i><i>♩</i><i>♫</i><i>♪</i></div><div class="music-sleeve-note page-width"><a href="${base}assets/${esc(p.cover)}" data-lightbox="${esc(p.cover)}" data-alt="작품 포스터" data-caption="벚꽃이 지는 소리를 너와 들었다 · 오리지널 포스터">${img(p.cover,'오리지널 작품 포스터')}<span>오리지널 포스터 ↗</span></a><p>대화가 끝나면 짧은 선율이 도착합니다.<br>듣고, 따라 치고, 마음에 든 연주를 건네세요.<br><strong>세 사람에게 쌓이는 공명은 모두 다릅니다.</strong></p><a class="music-text-link" href="#characters">연주자 세 사람 만나기 ↓</a></div></section>`);
  oldHero.replaceWith(hero);
  const campus = node(`<section class="music-campus" id="campus"><div class="music-campus-picture">${img('worlds/music-conservatory.webp','벚꽃이 보이는 음악학원 피아노 연습실')}<div class="music-campus-caption"><span>H I B I K I G A O K A</span><h2>언덕을 오르면<br>연습이 시작됩니다.</h2></div></div><div class="music-campus-ledger page-width"><header><p class="eyebrow">학원 산책</p><h3>소리가 머무는 곳.</h3><p>연습실, 무대, 기숙사.<br>같은 학원에서도 각자의 하루는 다릅니다.</p></header><ol><li><span>01</span><div><h4>울림 계단</h4><p>역에서 상점가와 육교를 지나 만나는 132개의 계단. 봄이면 벚꽃 사이로 학원에 올라갑니다.</p></div></li><li><span>02</span><div><h4>연습동 · 7호실</h4><p>3층에 걸친 방음실 40개. 아침 8시부터 밤 11시까지 열리며, 밤 9시 이후에는 선착순입니다. 복도 끝 7호실은 피아노 조율 상태가 유난히 좋습니다.</p></div></li><li><span>03</span><div><h4>히비키 홀</h4><p>객석 800석의 공연장. 11월에는 사흘 동안 히비키제가 열립니다. 앙상블은 세 명 이상이어야 하기에, 아직 팀이 없는 안즈에게 올해 무대는 특별합니다.</p></div></li><li><span>04</span><div><h4>옥상과 울림관</h4><p>옥상에는 가사를 쓰고 빗소리를 녹음하는 안즈의 시간이 남습니다. 기숙사 울림관은 1인실이지만 방음이 약해 악기 연습은 금지, 통금은 자정입니다.</p></div></li></ol></div><div class="music-school-year page-width"><span>학원의 일 년</span><p>4월 오디션 <b>·</b> 5월 신입 연주 <b>·</b> 7월 나가노 합숙 <b>·</b> 9월 콩쿠르 <b>·</b> 10월 오케스트라 <b>·</b> 11월 히비키제 <b>·</b> 12월 자선 공연 <b>·</b> 3월 졸업</p></div></section>`);
  const systems = main.querySelector('#systems');
  systems?.before(campus);
  const nav = main.querySelector('.project-nav');
  if(nav){const a=document.createElement('a');a.href='#campus';a.textContent='학원 산책';nav.append(a);}
  // These nodes carry the original cast, audio, video and lightbox listeners.
  const ordered = ['.project-breadcrumb','.music-overture','.project-nav','#overview','#characters','#scenes','#campus','#systems','#films','#artworks','#updates','#play-guide','.project-note','.next-project'];
  ordered.forEach(selector => { const section=main.querySelector(selector); if(section)main.append(section); });
  const scenes = main.querySelector('#scenes');
  if(scenes){
    scenes.querySelector('h2').textContent='세 장면, 세 개의 첫 음.';
    const rail=scenes.querySelector('.scene-grid');
    rail.setAttribute('tabindex','0');rail.setAttribute('aria-label','세 인물의 첫 만남, 가로로 넘겨 보기');
    const controls=node('<div class="music-record-controls"><span>FIRST ENCOUNTERS / 3 SCENES</span><div><button type="button" data-score-slide="-1" aria-label="이전 첫 만남">←</button><button type="button" data-score-slide="1" aria-label="다음 첫 만남">→</button></div></div>');
    scenes.querySelector('.section-heading').after(controls);
    controls.addEventListener('click',e=>{const b=e.target.closest('[data-score-slide]');if(b)rail.scrollBy({left:Number(b.dataset.scoreSlide)*(rail.querySelector('article').getBoundingClientRect().width+28),behavior:document.body.classList.contains('motion-reduced')?'instant':'smooth'});});
  }
  const cast = main.querySelector('#characters');
  if(cast){cast.querySelector('h2').textContent='연주자 소개';const intro=node(`<div class="music-personnel">${p.characters.map((c,i)=>`<a href="#characters" data-music-personnel="${esc(c.id)}"><span>0${i+1}</span><strong>${esc(c.name)}</strong><small>${esc(c.role)}</small></a>`).join('')}</div>`);cast.querySelector('.section-heading').after(intro);intro.addEventListener('click',e=>{const a=e.target.closest('[data-music-personnel]');if(!a)return;e.preventDefault();cast.querySelector(`[data-character="${a.dataset.musicPersonnel}"]`)?.click();cast.querySelector('.cast-stage')?.scrollIntoView({block:'start',behavior:document.body.classList.contains('motion-reduced')?'instant':'smooth'});});}
  main.querySelector('#systems .section-heading h2')?.replaceChildren(document.createTextNode('이번에는 당신이 연주할 차례.'));
  main.querySelector('#films .section-heading h2')?.replaceChildren(document.createTextNode('실제 연주 화면'));
  const observed = main.querySelectorAll('.music-campus-ledger li,.music-personnel a,.scene-grid>article,.system-case');
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(x=>{if(x.isIntersecting)x.target.classList.add('music-in-view');}),{threshold:.15});observed.forEach(x=>observer.observe(x));}
  // The playable recital already includes every musician's full source profile.
  // Remove the duplicate directory; keep the original art as a supplementary booklet.
  main.querySelector('.music-personnel')?.remove();
  main.querySelector('.cast-section')?.remove();
  main.querySelector('.recital-introduction').id='characters';
  const appendix=node('<details class="music-appendix page-width" id="music-booklet"><summary><span>별책 / ART COLLECTION</span><strong>세 사람의 다른 모습</strong><i aria-hidden="true">＋</i></summary><p class="music-appendix-note">사복, 연주하는 순간, 함께 찍은 사진. 캐릭터의 원본 그림을 모았습니다.</p></details>');
  const extraSections=['#artworks'].map(s=>main.querySelector(s)).filter(Boolean);
  extraSections.forEach(s=>appendix.append(s));
  main.append(appendix);
  if(nav){
    const labels=[['#overview','작품 소개'],['#systems','연주 체험'],['#films','시연 영상'],['#campus','학원 산책'],['#scenes','첫 만남'],['#music-booklet','아트워크'],['#play-guide','이용 안내']];
    nav.replaceChildren(...labels.filter(([id])=>main.querySelector(id)).map(([href,text])=>{const a=document.createElement('a');a.href=href;a.textContent=text;return a;}));
  }
  hero.querySelector('.music-text-link').href='#systems';
  hero.querySelector('.music-text-link').textContent='연주자 선택하고 시작하기 ↓';
  const flow=['.project-breadcrumb','.music-overture','.project-nav','#overview','#systems','#films','#campus','#scenes','#music-booklet','#updates','#play-guide','.project-note','.next-project'];
  flow.forEach(s=>{const section=main.querySelector(s);if(section)main.append(section);});
  const revealArchive=()=>{const target=document.getElementById(location.hash.slice(1));if(target?.closest('.music-appendix'))appendix.open=true;};
  window.addEventListener('hashchange',revealArchive);revealArchive();
})();
