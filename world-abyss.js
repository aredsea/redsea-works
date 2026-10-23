(() => {
  'use strict';
  if (document.body.dataset.project !== 'into-the-abyss') return;
  document.querySelector('.cast-section')?.remove();
  const base=document.body.dataset.base||'../../';
  const a=name=>`${base}assets/${name}`;
  const hero=document.querySelector('.project-hero');
  hero.className='abyss-threshold project-hero';
  hero.dataset.worldScene='';
  hero.innerHTML=`<div class="abyss-threshold-image"><img src="${a('worlds/abyss-gateway.webp')}" width="1672" height="941" alt="빛이 닿지 않는 심연과 경계도시의 거대한 문" fetchpriority="high"></div><div class="abyss-title"><p>THE BOUNDARY CITY / TORBA</p><h1 id="project-title">Into the<br><em>Abyss</em></h1><span>도시에서 준비하고,<br>함께 내려가고,<br>살아서 돌아옵니다.</span><a href="#systems">토르바에 입장하기 ↓</a></div><a class="abyss-hero-poster" href="#artworks"><img src="${a('abyss-cover.webp')}" alt="Into the Abyss 공식 커버"><span>원정 기록 / v1.0.9 ↗</span></a><span class="abyss-depth-mark" aria-hidden="true">SURFACE — 000</span>`;
  const overview=document.querySelector('#overview');
  overview.querySelector('h2').textContent='심연의 가장자리에 세워진 도시, 토르바.';
  const passage=document.createElement('section');passage.className='abyss-passage';passage.dataset.worldScene='';
  passage.innerHTML=`<div class="abyss-passage-sticky"><div class="abyss-map-frame"><img src="${a('abyss-world-map.webp')}" alt="대륙과 심연, 경계도시가 표시된 세계 지도" loading="lazy"></div><div class="abyss-passage-copy"><p class="eyebrow">EXPEDITION NOTES / 01</p><h2>내려가기 전에,<br>도시에서 해야 할 일.</h2><p>길드의 의뢰, 상회의 물자, 한나의 대장간.<br>누구와 떠나는지는 전투 밖에서도 차이를 만듭니다.</p><ol><li><b>연합 길드 본관</b><span>의뢰를 받고 원정의 목적을 정합니다.</span></li><li><b>마렌토 상회</b><span>같은 나라 출신 동료 2명 / 3명은 상점 가격 −6% / −12%.</span></li><li><b>한나의 대장간</b><span>제련과 가공을 마치면, 그 작업에 관한 대화로 이어집니다.</span></li><li><b>아랫마을 여관</b><span>식사와 선물, 휴식. 다음 원정까지 관계가 이어집니다.</span></li></ol><a href="#systems">도시에서 직접 준비하기 ↗</a></div></div>`;
  overview.after(passage);
  const systems=document.querySelector('#systems');
  systems.querySelector('.section-heading h2').textContent='준비부터 귀환까지, 한 번의 원정.';
  const memory=document.createElement('section');memory.className='abyss-chronicle page-width';memory.dataset.worldScene='';
  memory.innerHTML=`<div class="chronicle-number" aria-hidden="true">IV</div><div><p class="eyebrow">RETURN / 모험 연대기</p><h2>돌아온 뒤에도<br>그 원정은 남습니다.</h2><p>전투와 장비의 결과는 엔진이 확정합니다.<br>AI는 그 결과와 함께 쌓인 사건을 바탕으로 이야기를 이어 갑니다.</p><div class="chronicle-pages"><article><span>01 / 사건의 기록</span><h3>모험 연대기</h3><p>확정 사건 최대 60줄을 보관하고 최근 15줄을 모델에 전달합니다.</p></article><article><span>02 / 한 장의 끝</span><h3>장 요약</h3><p>귀환·실패·퇴각·다음 층에서 최대 5문장으로 정리합니다. 최근 5개 장이 남습니다.</p></article></div><small>원작의 기억 시스템 소개입니다. 위 전투 체험의 기록은 이 브라우저 안에서만 작동합니다.</small></div>`;
  systems.after(memory);
  const nav=document.querySelector('.project-nav');nav.querySelector('a[href="#systems"]').textContent='도시 → 원정 → 귀환';
})();

