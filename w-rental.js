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
  const yen = n => '¥' + n.toLocaleString('ja-JP');
  const signed = n => (n > 0 ? '+' : n < 0 ? '−' : '') + Math.abs(n);
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const people = p.characters;
  const byId = id => people.find(c => c.id === id);
  // Where the drawn figure sits in its 832×1216 sheet, so every crop lands on the face.
  const focus = c => c.frame ? `${((c.frame.x + c.frame.width / 2) / c.frame.sourceWidth * 100).toFixed(1)}% ${((c.frame.y) / c.frame.sourceHeight * 100 + 4).toFixed(1)}%` : '50% 10%';
  const places = data.rentalPlaces?.places || [];
  const placeOf = c => places.find(pl => pl.signature_guest === c.name);
  const placeImg = (pl, time = 'night') => pl?.images?.[time] || pl?.images?.night || pl?.images?.any || pl?.images?.day;

  const MOODS = [
    [85, '밝음', '행사에 같이 가 주세요. 끝나면 커피 한 잔 더 해도 좋고요.'],
    [15, '보통', '조용한 곳에서 대본을 함께 읽어줄 수 있나요?'],
    [-45, '불안', '사람이 적은 곳이면 좋겠어요. 시간을 조금만 더 내 주세요.'],
    [-88, '벼랑 끝', '오늘은 혼자 있고 싶지 않아요. 약속한 시간에는 꼭 와 주세요.']
  ];
  const DESK = ['reiko-azumi', 'mari-hoshino', 'shizuka-kurosawa', 'jun-kashiwagi', 'nagisa-furukawa', 'koichi-numata'].map(byId).filter(Boolean);
  const LEDGER = ['reiko-azumi', 'mari-hoshino', 'shizuka-kurosawa', 'ruri-amamiya', 'sumire-kuze', 'fumi-saito', 'xue-lin', 'jun-kashiwagi', 'itsuki-hayakawa', 'ren-aizawa', 'koichi-numata', 'ritsu-hasumi'].map(byId).filter(Boolean);
  const FEE = 8000, DEBT = 2000000, CASH = 300000;
  const updates = (data.updates || []).filter(u => u.project === p.id);

  const s = { guest: DESK[0].id, mood: 0, slip: null, demand: null, step: 1 };

  /* ---------- pieces ---------- */
  const seal = (t, cls = '') => `<span class="rn-seal ${cls}" aria-hidden="true">${t}</span>`;
  const figure = (c, cls = '') => `<img class="${cls}" src="${asset(c.image)}" alt="${esc(c.alt || c.name)}" width="832" height="1216" loading="lazy" style="object-position:${focus(c)}">`;

  function slip() {
    const c = byId(s.guest), pl = placeOf(c), [mood, moodName, quote] = MOODS[s.mood];
    const no = String(people.indexOf(c) + 1).padStart(3, '0');
    return `<div class="rn-slip${s.slip ? ' is-' + s.slip : ''}">
      <div class="rn-slip-head"><span>宵待ち 指名票</span><span>No. ${no}</span></div>
      <div class="rn-slip-who">
        <div class="rn-slip-face">${figure(c)}</div>
        <div><p class="rn-slip-from">지명 손님</p><h3>${esc(c.name)}</h3><p class="rn-slip-role">${esc(c.hook)}</p><p class="rn-slip-text">${esc(c.text)}</p></div>
      </div>
      <div class="rn-mood" role="group" aria-label="손님 멘탈">
        <p><span>손님 멘탈</span><b>${signed(mood)}</b><em>${moodName}</em></p>
        <div class="rn-mood-axis" aria-hidden="true"><i style="left:${50 + mood / 2}%"></i></div>
        <div class="rn-mood-pick">${MOODS.map((m, i) => `<button type="button" data-mood="${i}" aria-pressed="${s.mood === i}"${s.slip ? ' disabled' : ''}>${m[1]}</button>`).join('')}</div>
      </div>
      <blockquote class="rn-quote">“${esc(quote)}”</blockquote>
      <dl class="rn-terms">
        <div><dt>약속</dt><dd>토요일 14:00</dd></div>
        <div><dt>장소</dt><dd>${esc(pl ? pl.region : c.trait)}</dd></div>
        <div><dt>대여 시간</dt><dd>2시간</dd></div>
        <div><dt>지명료</dt><dd>${yen(FEE)}</dd></div>
      </dl>
      ${s.slip === 'accept' ? seal('承諾', 'is-ok') : s.slip === 'refuse' ? seal('辞退', 'is-no') : ''}
      <div class="rn-slip-act">${s.slip === 'refuse'
        ? `<button type="button" class="rn-btn" data-act="reconsider">다시 생각하기</button>`
        : s.slip ? '' : `<button type="button" class="rn-btn rn-btn-ink" data-act="accept">수락 도장 찍기</button><button type="button" class="rn-btn" data-act="refuse">이번엔 거절</button>`}</div>
      <p class="rn-note">${s.slip === 'refuse' ? '거절한 지명은 다시 받을 수 있습니다. 손님을 바꿔 보거나 다시 생각해 보세요.' : '손님 멘탈은 요구의 단계를 올리지 않습니다. 같은 단계 안에서 원하는 내용과 말투가 바뀝니다.'}</p>
    </div>
    <figure class="rn-place">${pl ? `<img src="${asset(placeImg(pl))}" alt="${esc(pl.name_ko)}" width="1536" height="1024" loading="lazy"><figcaption><b>${esc(pl.name_ko)}</b><span>${esc(pl.mood)}</span></figcaption>` : ''}</figure>`;
  }

  function date() {
    const c = byId(s.guest), pl = placeOf(c);
    const result = {
      accept: ['받아들였다', '이 선택 뒤의 장면은 실제 봇에서 대화로 이어집니다. 요구는 데이트마다 관계와 장소에 맞춰 새로 쓰입니다.'],
      refuse: ['거절했다', '거절도 기록됩니다. 다음 요구와 후기의 말투가 달라질 수 있습니다.']
    }[s.demand];
    return `<div class="rn-date">
      <div class="rn-date-card">
        <p class="rn-date-tier"><b>요구 1 / 2</b><span>1단계 · 탐색과 동행</span></p>
        <h3>조금 더 걷다가,<br>카페에 들러도 될까요?</h3>
        <p class="rn-date-where">${esc(c.name)} · ${esc(pl ? pl.region : '요이마치')} → 카페</p>
        ${s.demand === 'counter' ? `<div class="rn-counter">
            <p class="rn-counter-title">역제안 · “공원에서 잠깐 쉬며 이야기하는 건 어때요?”</p>
            <div class="rn-counter-two"><div><b>손님이 받으면</b><p>원래 요구를 제안한 행동으로 대신합니다. 역제안 자체의 웃돈은 없습니다.</p></div><div><b>손님이 거절하면</b><p>원래 요구가 그대로 수락됩니다. 역제안은 하루 두 번까지입니다.</p></div></div>
          </div>` : result ? `<div class="rn-result"><b>${result[0]}</b><p>${result[1]}</p></div>` : `<div class="rn-date-act"><button type="button" class="rn-btn rn-btn-ink" data-act="d-accept">받아들인다</button><button type="button" class="rn-btn" data-act="d-refuse">거절한다</button><button type="button" class="rn-btn rn-btn-line" data-act="d-counter">다른 조건으로 역제안</button></div>`}
        ${s.demand ? `<div class="rn-date-next"><button type="button" class="rn-btn rn-btn-ink" data-act="settle">데이트를 마치고 정산하기</button><button type="button" class="rn-link" data-act="d-undo">다른 답 해 보기</button></div>` : ''}
      </div>
      <figure class="rn-date-face">${figure(c)}</figure>
    </div>`;
  }

  function receipt() {
    const c = byId(s.guest);
    return `<div class="rn-after">
      <div class="rn-receipt" aria-label="정산 영수증">
        <p class="rn-receipt-head">YOIMACHI<br><span>RENTAL AGENCY · SHINJUKU</span></p>
        <p class="rn-receipt-row"><span>지명 손님</span><b>${esc(c.name)}</b></p>
        <p class="rn-receipt-row"><span>대여 시간</span><b>2:00</b></p>
        <p class="rn-receipt-row"><span>요구 응답</span><b>${{ accept: '수락', refuse: '거절', counter: '역제안' }[s.demand]}</b></p>
        <p class="rn-receipt-rule"></p>
        <p class="rn-receipt-row"><span>지명료</span><b>${yen(FEE)}</b></p>
        <p class="rn-receipt-row"><span>빚 상환</span><b>−${yen(FEE)}</b></p>
        <p class="rn-receipt-row is-sum"><span>남은 빚</span><b>${yen(DEBT - FEE)}</b></p>
        <p class="rn-receipt-row"><span>소지금</span><b>${yen(CASH)}</b></p>
        <p class="rn-receipt-rule"></p>
        <p class="rn-receipt-foot">金額は体験用の例です<br>금액은 시작 설정의 선택값 중 하나를 쓴 예시입니다</p>
      </div>
      <article class="rn-review">
        <p class="rn-review-stars" aria-label="별점 5점">★★★★★</p>
        <h3>약속한 시간에 와준 사람.</h3>
        <p>처음에는 조건만 확인하려고 했는데, 오늘은 조금 다른 이야기를 했네요. 다음에도 같은 시간에 부탁할게요.</p>
        <p class="rn-review-by">— ${esc(c.name)}의 후기 · 예시</p>
        <p class="rn-note">실제 봇은 데이트 전체를 바탕으로 손님의 말투로 후기와 댓글을 씁니다. 후기와 평판은 다음 지명에 남습니다.</p>
        <button type="button" class="rn-btn rn-btn-ink" data-act="again">다음 지명 받기</button>
      </article>
    </div>`;
  }

  function desk() {
    const steps = [['지명', 1], ['데이트', 2], ['정산', 3]];
    return `<ol class="rn-steps">${steps.map(([t, n]) => `<li class="${s.step === n ? 'is-now' : s.step > n ? 'is-done' : ''}"><span>${n}</span>${t}</li>`).join('')}</ol>
      ${s.step === 1 ? `<div class="rn-guests" role="group" aria-label="지명 손님 고르기">${DESK.map(c => `<button type="button" data-guest="${c.id}" aria-pressed="${s.guest === c.id}"${s.slip === 'accept' ? ' disabled' : ''}>${figure(c)}<span>${esc(c.name)}</span></button>`).join('')}</div><div class="rn-slip-wrap">${slip()}</div>` : ''}
      ${s.step === 2 ? date() : ''}
      ${s.step === 3 ? receipt() : ''}`;
  }

  /* ---------- page ---------- */
  const lead = { agency: '예약된 시간만큼,<br>누군가의 사람이 되는 일.', akari: '앞으로 일주일은,<br>저만 만나면 돼요.', ruri: '취소했는데,<br>왜 안 왔어요?' };

  main.innerHTML = `
  <header class="rn-top">
    <a class="rn-mark" href="#top" aria-label="요이마치 렌탈 사무소, 맨 위로">${seal('宵')}<span><b>YOIMACHI</b><small>렌탈 사무소 · 신주쿠</small></span></a>
    <nav class="rn-nav" aria-label="작품 메뉴"><a href="#agency">사무소</a><a href="#booking">지명</a><a href="#guests">손님</a><a href="#places">장소</a><a href="#after-hours">특별한 손님</a><a href="#posters">포스터</a></nav>
    <a class="rn-back" href="${base}">← ARCHIVE</a>
  </header>

  <section class="rn-hero" id="top">
    <img class="rn-hero-art" src="${asset('rental-cinematic-v1.webp')}" alt="비 오는 도쿄의 라운지, 서로 다른 사연을 가진 세 손님" ${size('rental-cinematic-v1.webp')} fetchpriority="high">
    <div class="rn-hero-copy">
      <h1 class="rn-logo"><span class="rn-logo-l">Rental</span><span class="rn-logo-k">男女</span><span class="sr-only">렌탈남녀</span></h1>
      <p class="rn-hero-lead" data-lead>${lead.agency}</p>
      <p class="rn-hero-tag">${esc(p.tagline)} 요이마치의 렌탈 인력이 되어 지명을 받고, 요구에 답하고, 보수로 빚을 갚습니다.</p>
      <a class="rn-btn rn-btn-cream" href="#booking">오늘의 지명 확인하기</a>
    </div>
    <p class="rn-billing">YOIMACHI RENTAL AGENCY PRESENTS<span>손님 ${people.length}명</span><span>약속 장소 ${places.length}곳</span><span>요구 7단계</span><span>${esc(p.version)}</span><span>성인 대상</span></p>
    <p class="rn-vertical" aria-hidden="true">宵待ち</p>
  </section>

  <section class="rn-agency" id="agency" aria-labelledby="agency-h">
    <figure class="rn-agency-art"><img src="${asset('worlds/rental-reception.webp')}" alt="예약 장부가 펼쳐진 요이마치의 안내 데스크" width="1672" height="941" loading="lazy"></figure>
    <div class="rn-agency-copy">
      <h2 id="agency-h">대화가 끝나도<br>생활은 계속됩니다.</h2>
      ${p.overview.map(t => `<p>${esc(t)}</p>`).join('')}
      <dl class="rn-ledger">
        <div><dt>시작할 때 남은 빚</dt><dd>${yen(DEBT)}</dd></div>
        <div><dt>한 번의 지명료 · 예시</dt><dd>${yen(FEE)}</dd></div>
        <div><dt>엔진이 관리하는 것</dt><dd>외모 · 멘탈 · 평판 · 빚</dd></div>
      </dl>
    </div>
  </section>

  <section class="rn-desk" id="booking" aria-labelledby="booking-h">
    <div class="rn-desk-head">
      <p class="rn-kicker">APPOINTMENT SLIP</p>
      <h2 id="booking-h">오늘의 지명</h2>
      <p>손님을 고르고, 멘탈을 바꿔 신청서의 말투가 어떻게 달라지는지 보세요. 도장을 찍으면 데이트가 시작됩니다.</p>
    </div>
    <div class="rn-desk-body" data-desk aria-live="polite">${desk()}</div>
    <p class="rn-fine">이 페이지에서만 해 보는 체험입니다. 봇의 이미지와 규칙을 옮겼고, 결과는 실제 봇에 저장되지 않습니다.</p>
  </section>

  <section class="rn-systems" aria-label="게임 규칙">
    ${p.systems.map(x => `<article><span>${esc(x.number)}</span><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article>`).join('')}
  </section>

  <section class="rn-guests-book" id="guests" aria-labelledby="guests-h">
    <div class="rn-book-head"><h2 id="guests-h">손님 명부</h2><p>요이마치에 등록된 손님은 ${people.length}명. 그중 주요 손님 몇 사람입니다. 이름을 누르면 그 손님의 지명을 받아 볼 수 있습니다.</p></div>
    <ul class="rn-book">${LEDGER.map((c, i) => `<li><button type="button" data-book="${c.id}" aria-label="${esc(c.name)}의 지명 받아 보기"><span class="rn-book-no">${String(i + 1).padStart(2, '0')}</span><span class="rn-book-face">${figure(c)}</span><b>${esc(c.name)}</b><small>${esc(c.hook)}</small></button></li>`).join('')}</ul>
    <p class="rn-book-more">외 ${people.length - LEDGER.length}명의 손님 — 일반 손님 ${people.filter(c => c.group === '일반 손님').length}명은 실제 봇에서 지명으로 만납니다.</p>
  </section>

  <section class="rn-places" id="places" aria-labelledby="places-h">
    <div class="rn-places-head"><h2 id="places-h">오늘의 약속 장소</h2><p>손님마다 자주 부르는 장소가 있습니다. 같은 곳도 낮과 밤의 얼굴이 다릅니다. 약속 장소는 모두 ${places.length}곳입니다.</p>
      <div class="rn-time" role="group" aria-label="시간대"><button type="button" data-time="night" aria-pressed="true">밤</button><button type="button" data-time="day" aria-pressed="false">낮</button></div></div>
    <div class="rn-strip">${places.filter(pl => pl.group === 'signature' && pl.images?.night && pl.images?.day).slice(0, 8).map(pl => `<figure><img src="${asset(pl.images.night)}" data-night="${asset(pl.images.night)}" data-day="${asset(pl.images.day)}" alt="${esc(pl.name_ko)}" width="1536" height="1024" loading="lazy"><figcaption><b>${esc(pl.region)}</b><span>${esc(pl.name_ko)}</span><em>${esc(pl.signature_guest)}의 장소</em></figcaption></figure>`).join('')}</div>
  </section>

  <section class="rn-after-hours" id="after-hours" aria-labelledby="ah-h">
    <div class="rn-ah-head"><p class="rn-kicker">SPECIAL GUESTS · 스포일러 주의</p><h2 id="ah-h">약속이,<br>약속으로 끝나지 않을 때.</h2><p>아카리와 루리는 예약 화면의 규칙까지 바꿉니다. 포스터를 누르면 이 페이지 전체가 그 사람의 규칙으로 넘어갑니다.</p></div>
    <div class="rn-ah-posters">
      <button type="button" class="rn-ah-poster" data-mode="akari" aria-pressed="false"><img src="${asset('rental-poster-no-escape.webp')}" alt="NO CANCELLATIONS. NO REFUNDS. NO ESCAPE." ${size('rental-poster-no-escape.webp')} loading="lazy"><span><small>미즈타니 아카리</small><b>빈 시간은 없어요.</b></span></button>
      <button type="button" class="rn-ah-poster" data-mode="ruri" aria-pressed="false"><img src="${asset('rental-poster-stay.webp')}" alt="I'LL LEAVE. YOU STAY." ${size('rental-poster-stay.webp')} loading="lazy"><span><small>아마미야 루리</small><b>얼마나 기다렸어요?</b></span></button>
    </div>
    <div class="rn-ah-stage" data-stage aria-live="polite"></div>
  </section>

  <section class="rn-lobby" id="posters" aria-labelledby="lobby-h">
    <h2 id="lobby-h"><span>NOW SHOWING</span>상영 중</h2>
    <div class="rn-lobby-wall">${p.gallery.filter(g => g.image !== 'rental-cinematic-v1.webp').concat([{ image: 'rental-poster-ensemble.webp', alt: '렌탈남녀 세 손님 포스터', caption: '세 손님 · 앙상블 포스터' }]).map((g, i) => `<figure class="rn-frame f${i}"><img src="${asset(g.image)}" alt="${esc(g.alt)}" ${size(g.image)} loading="lazy"><figcaption>${esc(g.caption)}</figcaption></figure>`).join('')}</div>
    <p class="rn-fine">포스터는 기존 캐릭터 에셋을 참조해 새로 제작·편집한 AI 생성 이미지입니다.</p>
  </section>

  <section class="rn-diary" id="log" aria-labelledby="log-h">
    <h2 id="log-h">업무 일지</h2>
    <ol>${updates.map(u => `<li id="${esc(u.id)}"><time datetime="${esc(u.date)}">${esc(u.date.replaceAll('-', '.'))}</time><span>${esc(u.version)}</span><div><h3>${esc(u.title)}</h3><p>${esc(u.text)}</p></div></li>`).join('')}</ol>
    <div class="rn-guide"><h3>시작하는 법</h3><ol>${p.guide.map(g => `<li>${esc(g)}</li>`).join('')}</ol><p>${esc(p.note)}</p></div>
  </section>

  <footer class="rn-foot">
    <a class="rn-next" href="${base}projects/into-the-abyss/"><small>다음 작품</small><b>INTO THE ABYSS</b></a>
    <p>© 2026 redsea works · 렌탈남녀 ${esc(p.version)} · 성인 대상. 이미지에 AI 생성 및 편집 자료가 포함됩니다. <a href="${base}credits/">저작권 · 크레딧</a></p>
    <a class="rn-back" href="${base}">← ARCHIVE</a>
  </footer>
  <button type="button" class="rn-exit" data-mode="agency" hidden>요이마치로 돌아가기</button>`;

  /* ---------- desk behaviour ---------- */
  const deskEl = main.querySelector('[data-desk]');
  function paint(focusSel) {
    deskEl.innerHTML = desk();
    if (focusSel) deskEl.querySelector(focusSel)?.focus({ preventScroll: true });
  }
  function toDesk() { main.querySelector('#booking').scrollIntoView({ behavior: still.matches ? 'auto' : 'smooth', block: 'start' }); }
  deskEl.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    if (b.dataset.guest) { s.guest = b.dataset.guest; s.slip = null; paint(`[data-guest="${s.guest}"]`); return; }
    if (b.dataset.mood) { s.mood = Number(b.dataset.mood); paint(`[data-mood="${s.mood}"]`); return; }
    const act = b.dataset.act;
    if (act === 'accept') { s.slip = 'accept'; paint(); setTimeout(() => { s.step = 2; paint('[data-act="d-accept"]'); }, still.matches ? 0 : 900); }
    if (act === 'refuse') { s.slip = 'refuse'; paint('[data-act="reconsider"]'); }
    if (act === 'reconsider') { s.slip = null; paint('[data-act="accept"]'); }
    if (act === 'd-accept' || act === 'd-refuse' || act === 'd-counter') { s.demand = act.slice(2); paint('[data-act="settle"]'); }
    if (act === 'd-undo') { s.demand = null; paint('[data-act="d-accept"]'); }
    if (act === 'settle') { s.step = 3; paint('[data-act="again"]'); }
    if (act === 'again') { Object.assign(s, { step: 1, slip: null, demand: null, guest: DESK[(DESK.findIndex(c => c.id === s.guest) + 1) % DESK.length].id }); paint('[data-act="accept"]'); toDesk(); }
  });
  main.querySelector('.rn-book').addEventListener('click', e => {
    const b = e.target.closest('[data-book]'); if (!b) return;
    const c = byId(b.dataset.book);
    if (!DESK.includes(c)) DESK[DESK.length - 1] = c;
    Object.assign(s, { guest: c.id, step: 1, slip: null, demand: null });
    paint(); toDesk();
  });

  /* ---------- places day / night ---------- */
  main.querySelector('.rn-time').addEventListener('click', e => {
    const b = e.target.closest('[data-time]'); if (!b) return;
    main.querySelectorAll('[data-time]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    main.querySelectorAll('.rn-strip img').forEach(img => { img.src = img.dataset[b.dataset.time]; });
    main.querySelector('.rn-places').classList.toggle('is-day', b.dataset.time === 'day');
  });

  /* ---------- the takeover ---------- */
  const STAGE = {
    agency: '',
    akari: `<div class="ak-board"><p class="ak-over">RESERVATION OVERRIDE</p><h3>NO CANCELLATIONS.<br>NO REFUNDS.<br>NO ESCAPE.</h3>
      <div class="ak-week" aria-label="7일 동안 낮과 밤 모두 아카리로 예약됨">${Array.from({ length: 7 }, (_, i) => `<div><small>DAY 0${i + 1}</small><b>아카리</b><span>낮 · 밤</span></div>`).join('')}</div>
      <ol class="ak-rules"><li><b>10번의 만남</b><p>그 뒤 다른 손님과의 첫 데이트에 반드시 끼어듭니다. 이후의 난입은 약 1/3 확률로 정해집니다.</p></li><li><b>지명을 다섯 번 거절하면</b><p>다음 날부터 7일, 낮과 밤 14회가 강제로 예약됩니다. 다른 예약은 사라지고 보수는 정상으로 나옵니다. 아카리는 끝까지 이것을 렌탈이라고 부릅니다.</p></li><li><b>돌아오지 않는 평소</b><p>7일 뒤 예약은 다시 열리지만 난입과 공포 테마는 남습니다. 다시 다섯 번 거절하면 사망 엔딩과 함께 진행이 멈춥니다.</p></li></ol>
      <details class="rn-spoil"><summary>별도의 ‘red’ 장악</summary><p>10번의 만남 이후 메타 입력에 반응하는 별도 플래그입니다. 글자가 붉어지고 아카리만 예약을 잡습니다. 7일 감금부터 시작되는 공포 배경과는 발동 조건이 다르며, 원작에서는 되돌릴 수 없습니다.</p></details></div>`,
    ruri: `<div class="ru-book"><div class="ru-msg"><small>루리 · 약속 당일 08:12</small><p>오늘은 못 만날 것 같아요.</p><span class="ru-cancel">예약 취소</span><em>예약 데이터는 남아 있습니다.</em></div>
      <div class="ru-pages"><div><span>01</span><h4>답장</h4><p>예약 직후, 전날 밤, 당일 아침. 언제 어떻게 답했는지가 남습니다.</p></div><div><span>02</span><h4>기다림</h4><p>가 보기, 끝까지 기다리기, 돌아오기. 기다리면 슬롯이 줄어듭니다.</p></div><div><span>03</span><h4>기록표</h4><p>단계 · 점수 · 메시지 · 사건 · 기념일. 기념일은 7일 뒤 같은 시간으로 늘어납니다.</p></div></div>
      <div class="ru-deal"><h4>매번 기다리는 것만이 답은 아닙니다.</h4><p>기다리던 답장의 과반에 답하기, 취소에 매달리지 않기, 합의한 약속에 제시간에 오기, 지명을 두 번 연속 거절하지 않기. 이 규칙을 세 번의 예약 동안 지키면 관계가 영구히 달라집니다.</p><button type="button" class="rn-btn" data-deal aria-pressed="false">‘합의한 약속’ 이후의 기록 보기</button><p class="ru-deal-out" role="status"></p></div>
      <details class="rn-spoil"><summary>공개 이후의 파국과 영구적인 결과</summary><p>모든 것을 공개한 뒤 시험을 어겨 파국이 확정되면, 다음 다른 손님과의 데이트에 루리가 나타나 자살합니다. 루리의 예약·메시지·기념일은 사라지고 기록표는 읽기 전용으로 남습니다. 플레이어는 살아남지만 멘탈 상한 10이 영구히 적용됩니다. 규칙 경로가 먼저 확정되면 이 사망 플래그는 생기지 않습니다.</p></details></div>`
  };
  const stage = main.querySelector('[data-stage]');
  const exit = main.querySelector('.rn-exit');
  function mode(m, jump) {
    document.body.dataset.mode = m;
    main.querySelectorAll('.rn-ah-poster').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === m)));
    main.querySelector('[data-lead]').innerHTML = lead[m];
    stage.innerHTML = STAGE[m];
    exit.hidden = m === 'agency';
    if (m !== 'agency' && !still.matches) { document.body.classList.remove('is-turning'); void document.body.offsetWidth; document.body.classList.add('is-turning'); }
    if (jump) stage.scrollIntoView({ behavior: still.matches ? 'auto' : 'smooth', block: 'start' });
  }
  main.addEventListener('click', e => {
    const b = e.target.closest('button[data-mode]');
    if (b) { const m = b.dataset.mode === document.body.dataset.mode ? 'agency' : b.dataset.mode; mode(m, m !== 'agency'); if (m === 'agency') main.querySelector('#after-hours').scrollIntoView({ block: 'start' }); return; }
    const d = e.target.closest('[data-deal]');
    if (d) {
      const on = d.getAttribute('aria-pressed') !== 'true';
      d.setAttribute('aria-pressed', String(on));
      document.body.classList.toggle('is-agreed', on);
      main.querySelector('.ru-deal-out').textContent = on ? '취소와 다른 남자 이야기를 이용한 시험이 멈춥니다. 직접 말하고, 기념일은 하나만 남습니다. 시간에 대한 집착과 기록표까지 사라지는 것은 아닙니다.' : '';
    }
  });
  mode('agency');

  /* ---------- chrome ---------- */
  const top = main.querySelector('.rn-top');
  new IntersectionObserver(([e]) => top.classList.toggle('is-solid', !e.isIntersecting), { rootMargin: '-80px 0px 0px 0px' }).observe(main.querySelector('.rn-hero-copy'));
  if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());

  /* ---------- the way in: a nomination, a stamp, the noren ---------- */
  const NIGHT = [[110, 196, 261.63, 329.63, 493.88], [87.31, 174.61, 261.63, 329.63, 440], [73.42, 174.61, 220, 261.63, 329.63], [82.41, 220, 246.94, 293.66, 392]];
  const noren = (side, mark) => `<div class="g-half g-${side}"><div class="g-frame"><img src="${asset('identity/rental-gate.webp')}" alt="" width="1536" height="1024" fetchpriority="high"><b class="g-kanji">${mark}</b></div></div>`;
  window.RedseaIntro?.gate({
    world: 'rental',
    label: '렌탈남녀 입장',
    switchIn: '.rn-back',
    scene: `<svg class="g-defs" width="0" height="0" aria-hidden="true" focusable="false"><filter id="g-rough"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="4"/></filter></svg>
      <div class="g-scene">${noren('l', '宵')}${noren('r', '待')}<i class="g-glow"></i><i class="g-rain"></i>
        <p class="g-neon" aria-hidden="true"><span>宵</span><span>待</span><span>ち</span></p></div>
      <div class="g-copy">
        <p class="g-time">新宿 · 23:40 · 지명 1건</p>
        <p class="g-title">오늘 밤,<br>지명이 들어왔습니다.</p>
        <p class="g-sub">렌탈남녀 · 요이마치 렌탈 사무소</p>
        <div class="g-act"><button type="button" data-gate="sound">${RedseaIntro.icon}<span>도장 찍고 입장</span></button><button type="button" data-gate="quiet">소리 없이 입장</button></div>
        <p class="g-note">빗소리와 배경음이 함께 나옵니다. 배경음은 오른쪽 위 버튼으로 언제든 끌 수 있습니다.</p>
      </div>
      <span class="g-stamp" aria-hidden="true">承諾</span>`,
    enter(g, k) {
      if (k) {
        k.tone({ freq: 150, to: 44, dur: .28, vol: .6 });
        k.tone({ type: 'triangle', freq: 92, dur: .12, vol: .22 });
        k.hiss({ type: 'lowpass', from: 900, dur: .09, vol: .35 });
        k.hiss({ at: .5, from: 500, to: 3200, dur: .75, vol: .12, q: .8 });
        k.hiss({ at: .58, from: 700, to: 2600, dur: .6, vol: .07, q: .8 });
        const bell = k.echo(.27, .32, .4);
        k.tone({ at: .7, freq: 1318.5, dur: 1.4, vol: .07, dest: bell });
        k.tone({ at: .7, freq: 1318.5, dur: 1.4, vol: .05 });
        k.tone({ at: .86, freq: 1760, dur: 1.6, vol: .05, dest: bell });
        k.tone({ at: .86, freq: 1760, dur: 1.6, vol: .04 });
      }
      return 1500;
    },
    bed(k) {
      const rain = k.wash({ freq: 2400, q: .4, vol: .045 });
      const street = k.wash({ type: 'lowpass', freq: 320, q: .3, vol: .02 });
      let bar = 0;
      const chord = () => {
        NIGHT[bar++ % NIGHT.length].forEach((f, i) => {
          k.tone({ type: 'triangle', freq: f, dur: 4.6, vol: i ? .03 : .045, attack: .5, cut: 900 });
          if (i > 1) k.tone({ freq: f * 2, at: .04 * i, dur: 1.6, vol: .012, attack: .005 });
        });
      };
      chord();
      const stopChords = k.every(4800, chord);
      const stopCars = k.every(17000, () => k.hiss({ type: 'lowpass', from: 380, to: 1500, dur: 3.2, attack: 1.6, vol: .03 }));
      return () => { stopChords(); stopCars(); rain.stop(); street.stop(); };
    }
  });
})();
