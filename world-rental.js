(() => {
  'use strict';
  if (document.body.dataset.project !== 'rental-danjo') return;
  document.querySelector('.cast-section')?.remove();
  const base = document.body.dataset.base || '../../';
  const asset = name => `${base}assets/${name}`;
  const body = document.body;
  body.dataset.rentalMode = 'agency';
  const hero = document.querySelector('.project-hero');
  hero.className = 'rental-arrival project-hero';
  hero.innerHTML = `<div class="rental-arrival-copy"><span class="rental-seal">宵待ち<br>YOIMACHI</span><p class="eyebrow">RENTAL AGENCY / TOKYO</p><h1 id="project-title">렌탈남녀</h1><p class="rental-lead">예약된 시간만큼,<br>누군가의 사람이 되는 일.</p><p>요이마치의 렌탈 인력으로 일합니다.<br>손님을 만나고, 요구를 판단하고,<br>다음 달의 생활비를 마련합니다.</p><a href="#systems" class="solid-button">오늘의 지명 확인하기 ↗</a><span class="rental-edition">RENTAL 男女 · v45 · 성인 대상</span></div><div class="rental-arrival-art" data-world-scene><img src="${asset('rental-cinematic-v1.webp')}" alt="도쿄의 밤, 서로 다른 사연을 가진 손님들" width="1672" height="941" fetchpriority="high"><a class="rental-cover-note" href="#artworks"><img src="${asset('rental-poster-ensemble.webp')}" alt="렌탈남녀 세 손님 포스터"><span>손님들의 이야기 ↗</span></a><span class="rental-art-caption">TOKYO, AFTER HOURS.</span></div>`;
  const overview = document.querySelector('#overview');
  const reception = document.createElement('section');
  reception.className = 'rental-reception';
  reception.dataset.worldScene = '';
  reception.innerHTML = `<div class="rental-desk-picture"><img src="${asset('worlds/rental-reception.webp')}" width="1672" height="941" alt="예약 장부가 펼쳐진 요이마치의 안내 데스크" loading="lazy"></div><div class="rental-desk-copy"><p class="eyebrow">01 / 요이마치 안내서</p><h2>대화가 끝나도<br>생활은 계속됩니다.</h2><p>수입과 지출, 컨디션과 평판.<br>한 번의 만남이 다음 예약에 남습니다.</p><a href="#places">오늘의 약속 장소 찾기 ↓</a></div>`;
  overview.before(reception);
  overview.querySelector('h2').textContent = '지명부터 다음 예약까지';
  const places = document.querySelector('#places');
  const systems = document.querySelector('#systems');
  if (systems && places) { overview.after(systems); systems.after(places); }
  const takeover = document.createElement('section');
  takeover.id = 'after-hours';
  takeover.className = 'rental-after-hours';
  takeover.innerHTML = `<div class="page-width"><header class="rental-event-heading"><p class="eyebrow">02 / 특별한 손님 · 스포일러</p><h2>약속이,<br>약속으로 끝나지 않을 때.</h2><p>아카리와 루리는 예약 화면의 규칙까지 바꿉니다.<br>아래 포스터를 누르면 페이지 전체가 해당 사건의 분위기로 전환됩니다.</p></header><div class="rental-event-choices"><button data-rental-mode="akari" aria-pressed="false"><img src="${asset('rental-poster-no-escape.webp')}" width="914" height="1280" alt="NO CANCELLATIONS. NO REFUNDS. NO ESCAPE." loading="lazy"><span><small>미즈타니 아카리</small><b>빈 시간은 없어요.</b><em>아카리의 예약으로 전환 ↗</em></span></button><button data-rental-mode="ruri" aria-pressed="false"><img src="${asset('rental-poster-stay.webp')}" width="960" height="1280" alt="I’LL LEAVE. YOU STAY." loading="lazy"><span><small>아마미야 루리</small><b>얼마나 기다렸어요?</b><em>루리의 기록으로 전환 ↗</em></span></button></div><div class="rental-event-stage" aria-live="polite"></div><p class="rental-event-note">원작의 사건 조건을 소개하는 전시용 화면입니다. 실제 예약·저장 데이터에는 영향을 주지 않습니다. 포스터는 제공된 아트워크를 사건 소개에 맞춰 편집 배치했습니다.</p><button class="rental-reset" data-rental-mode="agency">요이마치 안내서로 돌아가기 ↺</button></div>`;
  places.after(takeover);
  const nav = document.querySelector('.project-nav');
  const link = document.createElement('a');link.href='#after-hours';link.textContent='아카리 · 루리';nav.insertBefore(link,nav.children[3] || null);
  const render = mode => {
    body.dataset.rentalMode = mode; body.classList.remove('ruri-agreed');
    document.querySelectorAll('[data-rental-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.rentalMode===mode)));
    const stage = takeover.querySelector('.rental-event-stage');
    if (mode === 'agency') stage.innerHTML = `<div class="rental-agency-note"><span>宵</span><div><h3>두 손님, 서로 다른 규칙.</h3><p>아카리는 예약을 점유하고, 루리는 답장과 기다림을 기록합니다. 사건의 조건과 결과까지 화면에서 확인할 수 있습니다.</p></div></div>`;
    if (mode === 'akari') stage.innerHTML = `<div class="akari-notice"><p>RESERVATION OVERRIDE</p><h3>앞으로 일주일은<br>저만 만나면 돼요.</h3><span>예약자 / 미즈타니 아카리</span></div><div class="akari-week" aria-label="7일간 낮과 밤, 모두 아카리로 예약됨">${Array.from({length:7},(_,i)=>`<div><small>DAY 0${i+1}</small><b>아카리</b><span>낮 · 밤</span><em>예약 확정</em></div>`).join('')}</div><ol class="rental-event-rules"><li><b>10번의 만남</b><p>그 뒤 다른 손님과의 첫 데이트에 확정 난입합니다. 이후 난입은 약 1/3 확률로 결정됩니다.</p></li><li><b>지명 5회 거절</b><p>다음 날부터 7일, 주야 14회가 강제 예약됩니다. 다른 예약은 사라지고 보수는 정상 지급됩니다. 아카리는 끝까지 이것을 렌탈이라고 부릅니다.</p></li><li><b>돌아오지 않는 평상시</b><p>7일 뒤 예약은 다시 열려도 난입과 공포 테마는 남습니다. 다시 5회 거절하면 사망 엔딩과 함께 진행이 멈춥니다.</p></li></ol><details class="rental-spoiler"><summary>별도의 ‘red’ 장악</summary><p>10번의 만남 이후 메타 입력에 반응하는 별도 플래그입니다. 글자가 붉어지고 아카리만 예약을 잡습니다. 7일 감금부터 시작되는 공포 배경과는 발동 조건이 다릅니다. 원작에서는 되돌릴 수 없습니다.</p></details>`;
    if (mode === 'ruri') stage.innerHTML = `<div class="ruri-notice"><div><p>OUR APPOINTMENTS</p><h3>취소했는데,<br>왜 안 왔어요?</h3><p>첫 만남의 긍정적인 후기 이후,<br>답장한 시간까지 약속의 일부가 됩니다.</p></div><div class="ruri-message"><small>루리 · 약속 당일</small><p>오늘은 못 만날 것 같아요.</p><span class="ruri-cancelled">예약 취소</span><em>예약 데이터는 남아 있습니다.</em></div></div><div class="ruri-ledger"><div><span>01</span><h4>답장</h4><p>예약 직후, 전날 밤, 당일 아침.<br>언제 어떻게 답했는지가 남습니다.</p></div><div><span>02</span><h4>기다림</h4><p>가 보기, 끝까지 기다리기, 돌아오기.<br>기다리면 슬롯이 소모됩니다.</p></div><div><span>03</span><h4>기록표</h4><p>단계·점수·메시지·사건·기념일.<br>기념일은 7일 뒤 같은 시간으로 늘어납니다.</p></div></div><div class="ruri-agreement"><h4>매번 기다리는 것만이 답은 아닙니다.</h4><p>기다리던 답장 과반, 취소에 매달리지 않기, 합의한 약속에 제시간에 오기, 지명 두 번 연속 거절하지 않기. 이 규칙을 3예약 연속 지키면 관계가 영구히 달라집니다.</p><button data-ruri-agreement aria-pressed="false">‘합의한 약속’ 이후의 기록 보기 →</button><p class="ruri-result" role="status"></p></div><details class="rental-spoiler"><summary>공개 이후의 파국과 영구적인 결과</summary><p>모든 것을 공개한 뒤 시험을 어겨 파국이 확정되면, 다음 다른 손님과의 데이트에 루리가 나타나 자살합니다. 루리의 예약·메시지·기념일은 사라지고 기록표는 읽기 전용으로 남습니다. 플레이어는 생존하지만 멘탈 상한 10이 영구 적용됩니다. 규칙 경로가 먼저 확정되면 이 사망 플래그는 발생하지 않습니다.</p></details>`;
  };
  takeover.addEventListener('click', event => {
    const choice = event.target.closest('[data-rental-mode]');
    if (choice) {render(choice.dataset.rentalMode); if(choice.dataset.rentalMode!=='agency')takeover.querySelector('.rental-event-stage').scrollIntoView({block:'start',behavior:body.classList.contains('motion-reduced')?'auto':'smooth'});}
    const agreement = event.target.closest('[data-ruri-agreement]');
    if (agreement) {const on=agreement.getAttribute('aria-pressed')!=='true';agreement.setAttribute('aria-pressed',String(on));body.classList.toggle('ruri-agreed',on);takeover.querySelector('.ruri-result').textContent=on?'취소와 다른 남자 이야기를 이용한 시험이 멈춥니다. 직접 말하고, 기념일은 하나만 남습니다. 시간에 대한 집착과 기록표까지 사라지는 것은 아닙니다.':'기록을 닫았습니다. 실제 변화는 원작의 3예약 연속 조건으로 확정됩니다.';}
  });
  render('agency');
})();

