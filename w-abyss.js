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
  const people = p.characters;
  const byId = id => people.find(c => c.id === id);
  const focus = c => c.frame ? `${((c.frame.x + c.frame.width / 2) / c.frame.sourceWidth * 100).toFixed(1)}% ${(c.frame.y / c.frame.sourceHeight * 100).toFixed(1)}%` : '50% 8%';
  const fig = (c, cls = '') => `<img class="${cls}" src="${asset(c.image)}" alt="${esc(c.alt || c.name)}" width="832" height="1216" loading="lazy" style="object-position:${focus(c)}">`;
  const icon = cls => `<img class="ab-cls" src="${asset('identity/abyss-ic_cls_' + cls + '.webp')}" alt="" width="64" height="64">`;
  const companions = people.filter(c => c.group === '동료');
  const city = people.filter(c => c.group !== '동료');
  const items = data.abyssCity?.items || [];
  const updates = (data.updates || []).filter(u => u.project === p.id);

  /* ---------- the expedition, in fixed demo numbers ---------- */
  const QUEST = { name: '균열 핵 토벌', place: '남서 설산 균열', level: '낮음', reward: 70 };
  const FOE = { name: '심연 사냥개', hp: 850, abyss: 60, hit: 95, intent: '물어뜯기 → 전열', weak: '냉기 · 성속성' };
  const PARTY_HP = 1000, GOLD = 600;
  // Each pick brings its real skill name; the demo resolves it with one fixed effect.
  const PICK = {
    marceline: { kind: 'guard', text: '다음 공격을 대신 맞아 받는 피해 −30%' },
    naran: { kind: 'mark', text: '표식: 다음 공격이 치명타(×2) · 심연 −3', abyss: 3 },
    teiris: { kind: 'burst', text: '마력 폭발 ×1.9 · 피해 285', dmg: 285, abyss: 10 },
    erdene: { kind: 'roar', text: '적 공격력 −15% · 심연 −20', abyss: 20 },
    levia: { kind: 'risk', text: 'HP 10%를 치르고 다음 심연 감소 ×1.5' },
    lynette: { kind: 'heal', text: '아군 전체 회복 120 · 보호막 60' }
  };
  const POOL = Object.keys(PICK).map(byId).filter(Boolean);
  const fresh = () => ({ phase: 'quest', team: [], hp: PARTY_HP, shield: 0, foe: FOE.hp, abyss: FOE.abyss, round: 1, used: [], mark: false, risk: false, guard: false, weaken: false, broken: false, log: [], gold: GOLD, depth: 1 });
  let s = fresh();

  function act(who) {
    const c = who === 'attack' ? null : byId(who), k = c ? PICK[c.id] : null;
    let dmg = 0, cut = 0, line = '';
    const mult = s.broken ? 1.5 : 1;
    if (!k) { dmg = 150; cut = 12; line = '일반 공격'; }
    else {
      s.used.push(c.id); line = `${c.name} — ${c.combat.skillName}`;
      if (k.kind === 'guard') s.guard = true;
      if (k.kind === 'mark') { s.mark = true; cut = k.abyss; }
      if (k.kind === 'burst') { dmg = k.dmg; cut = k.abyss; }
      if (k.kind === 'roar') { s.weaken = true; cut = k.abyss; }
      if (k.kind === 'risk') { s.risk = true; s.hp = Math.max(1, s.hp - PARTY_HP * .1); }
      if (k.kind === 'heal') { s.hp = Math.min(PARTY_HP, s.hp + 120); s.shield += 60; }
    }
    if (s.broken) cut = 0;
    if (dmg && s.mark) { dmg *= 2; s.mark = false; line += ' · 치명타'; }
    if (cut && s.risk) { cut = Math.round(cut * 1.5); s.risk = false; }
    dmg = Math.round(dmg * mult);
    s.foe = Math.max(0, s.foe - dmg);
    s.abyss = Math.max(0, s.abyss - cut);
    const parts = [];
    if (dmg) parts.push(`피해 ${dmg}`);
    if (cut) parts.push(`심연 −${cut}`);
    if (k && !dmg && !cut) parts.push(k.text);
    s.log.unshift({ r: s.round, t: `${line}${parts.length ? ' · ' + parts.join(' · ') : ''}` });
    if (!s.broken && s.abyss === 0) { s.broken = true; s.log.unshift({ r: s.round, t: '심연 붕괴 — 사냥개가 휘청인다. 이후 받는 피해 ×1.5', hot: true }); }
    if (s.foe === 0) { s.phase = 'won'; s.log.unshift({ r: s.round, t: '심연 사냥개 쓰러짐', hot: true }); return; }
    // the hound answers, unless the gauge just broke this round
    if (!(s.broken && cut && s.abyss === 0)) {
      let hit = FOE.hit * (s.weaken ? .85 : 1) * (s.guard ? .7 : 1);
      s.guard = false;
      const soaked = Math.min(s.shield, hit); s.shield -= soaked; hit = Math.round(hit - soaked);
      s.hp = Math.max(0, s.hp - hit);
      s.log.unshift({ r: s.round, t: `사냥개의 ${FOE.intent.split(' →')[0]} · 아군 피해 ${hit}${soaked ? ` (보호막 ${Math.round(soaked)})` : ''}`, foe: true });
    }
    s.round++;
    if (s.round > 7 && s.foe > 0) { s.phase = 'stall'; }
  }

  const bar = (v, max, cls) => `<span class="ab-bar ${cls}"><i style="width:${Math.max(0, v / max * 100)}%"></i></span>`;

  function panel() {
    if (s.phase === 'quest') return `<div class="ab-notice${s.signed ? ' is-signed' : ''}">
        <p class="ab-notice-top">연합 길드 토르바 · 의뢰</p>
        <h3>${QUEST.name}</h3>
        <dl><div><dt>장소</dt><dd>${QUEST.place}</dd></div><div><dt>난이도</dt><dd>${QUEST.level}</dd></div><div><dt>보상</dt><dd>${QUEST.reward} G</dd></div></dl>
        <p class="ab-notice-body">균열에서 기어 나온 짐승이 길을 막았다. 넷이서 내려가 핵을 부수고, 살아서 돌아올 것.</p>
        <p class="ab-notice-sign">서명 <span>${s.signed ? '모험가' : '________'}</span></p>
        <span class="ab-wax" aria-hidden="true">T</span>
        <button type="button" class="ab-btn ab-btn-gold" data-a="sign">의뢰 받기 — 서명하기</button>
      </div>`;
    if (s.phase === 'party') return `<div class="ab-party">
        <p class="ab-lead">함께 내려갈 동료 셋을 고르세요. 넷째 자리는 당신입니다.</p>
        <div class="ab-pick" role="group" aria-label="동료 고르기">${POOL.map(c => { const on = s.team.includes(c.id); return `<button type="button" data-pick="${c.id}" aria-pressed="${on}"${!on && s.team.length >= 3 ? ' disabled' : ''}>
          <span class="ab-pick-art">${fig(c)}</span>${icon(c.combat.classId)}
          <span class="ab-pick-copy"><b>${esc(c.name)}</b><small>${esc(c.class)} · ${esc(c.row)}</small><em>${esc(c.combat.skillName)}</em><span>${esc(PICK[c.id].text)}</span></span></button>`; }).join('')}</div>
        <div class="ab-party-foot"><p>${s.team.length} / 3 · 당신과 함께 네 명</p><button type="button" class="ab-btn ab-btn-gold" data-a="descend"${s.team.length < 3 ? ' disabled' : ''}>심연으로 내려가기</button></div>
      </div>`;
    if (s.phase === 'battle' || s.phase === 'won' || s.phase === 'stall') {
      const team = s.team.map(byId);
      const over = s.phase !== 'battle';
      return `<div class="ab-fight">
        <div class="ab-fight-top"><span>B${s.depth} · 심연 회랑</span><b>ROUND ${String(Math.min(s.round, 7)).padStart(2, '0')}</b><span>체험용 고정 수치</span></div>
        <div class="ab-foe${s.broken ? ' is-broken' : ''}${s.phase === 'won' ? ' is-down' : ''}">
          <span class="ab-medal" aria-hidden="true"><img src="${asset('identity/abyss-enemies.png')}" alt="" width="2172" height="724"></span>
          <div><h3>${FOE.name}</h3><p class="ab-intent">예고 · ${FOE.intent}</p><p class="ab-weak">약점 · ${FOE.weak}</p>
          <p class="ab-meter"><span>HP</span>${bar(s.foe, FOE.hp, 'is-hp')}<b>${s.foe}</b></p>
          <p class="ab-meter"><span>심연</span>${bar(s.abyss, FOE.abyss, 'is-abyss')}<b>${s.broken ? '붕괴' : s.abyss}</b></p></div>
        </div>
        <div class="ab-us"><p class="ab-meter"><span>원정대</span>${bar(s.hp, PARTY_HP, 'is-us')}<b>${Math.round(s.hp)}${s.shield ? ` +${Math.round(s.shield)}` : ''}</b></p></div>
        ${over ? '' : `<div class="ab-acts" role="group" aria-label="이번 라운드의 행동">
          <button type="button" data-act="attack"><img src="${asset('identity/abyss-ic_attack.webp')}" alt="" width="64" height="64"><b>일반 공격</b><small>피해 150 · 심연 −12</small></button>
          ${team.map(c => `<button type="button" data-act="${c.id}"${s.used.includes(c.id) ? ' disabled' : ''}>${icon(c.combat.classId)}<b>${esc(c.combat.skillName)}</b><small>${esc(c.name)} · ${esc(PICK[c.id].text)}</small></button>`).join('')}
        </div>`}
        <ol class="ab-log" aria-live="polite">${s.log.slice(0, 6).map(l => `<li class="${l.hot ? 'is-hot' : l.foe ? 'is-foe' : ''}"><span>R${l.r}</span>${esc(l.t)}</li>`).join('') || '<li><span>R1</span>사냥개가 이빨을 드러낸다. 누구부터 움직일까.</li>'}</ol>
        ${s.phase === 'won' ? `<div class="ab-choice"><p>B${s.depth}를 지나왔습니다. 더 내려가면 보상이 커지지만 원정대는 지쳐 있습니다.</p><button type="button" class="ab-btn" data-a="deeper">더 내려간다</button><button type="button" class="ab-btn ab-btn-gold" data-a="home">도시로 귀환한다</button></div>` : ''}
        ${s.phase === 'stall' ? `<div class="ab-choice"><p>일곱 라운드가 지났습니다. 원정대가 지쳐 물러날 때입니다.</p><button type="button" class="ab-btn ab-btn-gold" data-a="home">철수하고 귀환한다</button><button type="button" class="ab-btn" data-a="retry">다시 붙는다</button></div>` : ''}
      </div>`;
    }
    if (s.phase === 'deeper') return `<div class="ab-deeper"><span class="ab-medal is-archer" aria-hidden="true"><img src="${asset('identity/abyss-enemies.png')}" alt="" width="2172" height="724"></span><p class="ab-depth">B2</p><h3>그림자 궁수가 기다린다.</h3><p>예고 · 조준 사격 → 후열. 아홉 구역, 27개 층, 그 아래의 심층. 실제 봇에서는 탐색 보상과 파티 상태를 보고 전진·휴식·철수를 고릅니다. 이 체험은 여기까지입니다.</p><button type="button" class="ab-btn ab-btn-gold" data-a="home">살아 있을 때 돌아간다</button></div>`;
    if (s.phase === 'home') {
      const won = s.foe === 0;
      return `<div class="ab-ledger">
        <div class="ab-ledger-page">
          <p class="ab-ledger-top">원정 기록 · DAY 01</p>
          <h3>${won ? '살아서 돌아왔다.' : '물러나서, 살아남았다.'}</h3>
          <p class="ab-row"><span>의뢰</span><b>${QUEST.name}</b></p>
          <p class="ab-row"><span>원정대</span><b>당신 · ${s.team.map(id => esc(byId(id).name)).join(' · ')}</b></p>
          <p class="ab-row"><span>도달</span><b>B${s.depth}</b></p>
          <p class="ab-row"><span>의뢰 보상</span><b>${won ? `+${QUEST.reward} G` : '없음'}</b></p>
          <p class="ab-row is-sum"><span>소지금</span><b>${(GOLD + (won ? QUEST.reward : 0)).toLocaleString('ko-KR')} G</b></p>
          <p class="ab-fine">수치는 체험용 예시입니다. 실제 봇은 레벨·장비·동료 호감을 새 채팅까지 이어 저장합니다.</p>
        </div>
        <div class="ab-ledger-next"><p>도시로 돌아오면 여관에서 함께 싸운 동료와 시간을 보내고, 대장간에서 장비를 고치고, 다음 의뢰를 고릅니다.</p><button type="button" class="ab-btn ab-btn-gold" data-a="again">다시 원정 준비하기</button></div>
      </div>`;
    }
    return '';
  }

  /* ---------- page ---------- */
  const wpick = r => { const xs = items.filter(i => i.cls === 'paladin' && i.slot === 'weapon' && i.rarity === r); return xs[Math.floor(xs.length / 2)]; };
  const SHELF = [['common', '평범'], ['rare', '희귀'], ['legend', '전설']].map(([r, label]) => ({ g: wpick(r), label })).filter(x => x.g);
  const TOWN = [['loredana', '길드'], ['fenella', '접수처'], ['dorothea', '여관'], ['hanna', '대장간'], ['isolde', '기록관']].map(([id, where]) => ({ c: byId(id), where })).filter(x => x.c);
  const ROSTER = companions.slice(0, 12);
  const film = p.videos?.find(v => v.label === 'WORLD FILM');
  const demo = p.videos?.find(v => v.label === 'COMBAT DIRECTION');
  const DEPTHS = ['지상', 'B1', 'B3', 'B9', 'B18', 'B27', '심층'];

  main.innerHTML = `
  <header class="ab-top">
    <a class="ab-crest" href="#top" aria-label="Into the Abyss, 맨 위로"><svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 3 35 9v11c0 9-6.5 14.5-15 17C11.5 34.5 5 29 5 20V9z"/><path d="M20 11v18M13 18h14" /></svg><span>INTO THE ABYSS</span></a>
    <nav class="ab-nav" aria-label="작품 메뉴"><a href="#torba">경계도시</a><a href="#expedition">원정</a><a href="#companions">동료</a><a href="#world">세계</a><a href="#log">기록</a></nav>
    <a class="ab-back" href="${base}">← ARCHIVE</a>
  </header>
  <aside class="ab-depth-rail" aria-hidden="true"><ol>${DEPTHS.map(d => `<li>${d}</li>`).join('')}</ol><i></i></aside>

  <section class="ab-hero" id="top">
    <img class="ab-hero-art" src="${asset('abyss-cinematic-v1.webp')}" alt="심연 위 경계도시와 원정대" ${size('abyss-cinematic-v1.webp')} fetchpriority="high">
    <div class="ab-hero-copy">
      <p class="ab-hero-pre">A DUNGEON-CRAWLING RPG · ${esc(p.version)}</p>
      <h1>INTO<br>THE ABYSS</h1>
      <p class="ab-hero-lead">${esc(p.tagline)}</p>
      <p class="ab-hero-text">천 년 전 제국이 무너진 자리, 대륙 한가운데 심연이 열렸다. 경계도시 토르바에서 채비하고, 넷이서 내려갔다가, 살아서 돌아온다.</p>
      <div class="ab-hero-act"><a class="ab-btn ab-btn-gold" href="#expedition">원정 나가 보기</a><a class="ab-btn" href="#world">세계 영상 보기</a></div>
    </div>
    <dl class="ab-hero-facts">${p.facts.map(f => `<div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join('')}</dl>
  </section>

  <section class="ab-torba" id="torba" aria-labelledby="torba-h">
    <div class="ab-torba-copy">
      <p class="ab-chapter">I · 경계도시 토르바</p>
      <h2 id="torba-h">내려가기 전에,<br>도시에서 채비한다.</h2>
      ${p.overview.map(t => `<p>${esc(t)}</p>`).join('')}
    </div>
    <figure class="ab-gate"><img src="${asset('worlds/abyss-gateway.webp')}" alt="심연으로 내려가는 관문" width="1672" height="941" loading="lazy"></figure>
    <div class="ab-town">
      <h3>토르바에서 만나는 사람들</h3>
      <ul>${TOWN.map(({ c, where }) => `<li><span class="ab-town-art">${fig(c)}</span><small>${where}</small><b>${esc(c.name)}</b><em>${esc(c.role)}</em></li>`).join('')}</ul>
    </div>
    <div class="ab-shelf">
      <h3>대장간 진열대</h3>
      <p>장비는 1,030종. 직업마다 무기·방어구·장신구가 등급별로 있고, 제련과 가공으로 다시 다듬습니다. 그중 성기사의 무기 세 자루입니다.</p>
      <ul>${SHELF.map(({ g, label }) => `<li class="r-${g.rarity}"><span class="ab-slot"><img src="${asset('city/' + g.icon)}" alt="" width="64" height="64"></span><small>${label} · Lv.${g.level}</small><b>${esc(g.name)}</b></li>`).join('')}</ul>
    </div>
  </section>

  <section class="ab-exp" id="expedition" aria-labelledby="exp-h">
    <div class="ab-exp-head">
      <p class="ab-chapter">II · 원정</p>
      <h2 id="exp-h">의뢰서에 이름을 쓰면,<br>내려갈 수 있다.</h2>
      <ol class="ab-steps">${['의뢰', '원정대', '회랑', '귀환'].map((t, i) => `<li data-step="${i}">${t}</li>`).join('')}</ol>
    </div>
    <div class="ab-exp-body" data-exp>${panel()}</div>
    <p class="ab-fine">이 페이지에서만 해 보는 짧은 원정입니다. 동료의 스킬 이름은 원작 그대로이고, 효과는 체험용으로 단순화한 고정 수치입니다. 실제 판정은 봇의 Lua 엔진이 맡습니다.</p>
  </section>

  <section class="ab-rules" aria-label="게임 규칙">${p.systems.map(x => `<article><span>${esc(x.number)}</span><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></article>`).join('')}</section>

  <section class="ab-roster" id="companions" aria-labelledby="roster-h">
    <div class="ab-roster-head"><p class="ab-chapter">III · 동료</p><h2 id="roster-h">함께 내려갈 사람들</h2><p>직업 10종, 동료 30명. 전열과 후열, 개인 스킬과 특성이 맞물려 같은 넷도 다른 파티가 됩니다. 그중 열두 명입니다.</p></div>
    <ul class="ab-cards">${ROSTER.map(c => `<li><article class="ab-card"><span class="ab-card-art">${fig(c)}</span>${icon(c.combat?.classId || 'warrior')}<div class="ab-card-copy"><small>${esc(c.class)} · ${esc(c.row)}</small><h3>${esc(c.name)}</h3><p>${esc(c.hook)}</p></div></article></li>`).join('')}</ul>
    <p class="ab-more">외 ${companions.length - ROSTER.length}명의 동료와 도시·세계 인물 ${city.length}명은 실제 봇의 도감에서 만납니다.</p>
  </section>

  <section class="ab-world" id="world" aria-labelledby="world-h">
    <div class="ab-world-head"><p class="ab-chapter">IV · 세계</p><h2 id="world-h">심연이 생겨난 세계</h2></div>
    ${film ? `<figure class="ab-film"><video controls playsinline preload="none" poster="${asset(film.poster)}" ${size(film.poster)} aria-label="${esc(film.title)}"><source src="${asset(film.source)}" type="video/mp4"></video><figcaption>${esc(film.caption)}</figcaption></figure>` : ''}
    <figure class="ab-map"><img src="${asset('abyss-world-map.webp')}" alt="Into the Abyss 세계 지도" ${size('abyss-world-map.webp')} loading="lazy"><figcaption>대륙 지도 · 경계도시와 아홉 구역</figcaption></figure>
    ${demo ? `<figure class="ab-film is-small"><video controls playsinline preload="none" poster="${asset(demo.poster)}" ${size(demo.poster)} aria-label="${esc(demo.title)}"><source src="${asset(demo.source)}" type="video/mp4"></video><figcaption><b>${esc(demo.title)}</b> ${esc(demo.caption)}</figcaption></figure>` : ''}
  </section>

  <section class="ab-log-sec" id="log" aria-labelledby="log-h">
    <h2 id="log-h">길드 기록</h2>
    <ol>${updates.map(u => `<li id="${esc(u.id)}"><time datetime="${esc(u.date)}">${esc(u.date.replaceAll('-', '.'))}</time><b>${esc(u.version)}</b><div><h3>${esc(u.title)}</h3><p>${esc(u.text)}</p></div></li>`).join('')}</ol>
    <div class="ab-guide"><h3>시작하는 법</h3><ol>${p.guide.map(g => `<li>${esc(g)}</li>`).join('')}</ol><p>${esc(p.note)}</p></div>
  </section>

  <footer class="ab-foot">
    <a class="ab-next" href="${base}projects/music-story/"><small>다음 작품</small><b>벚꽃이 지는 소리를 너와 들었다</b></a>
    <p>© 2026 redsea works · Into the Abyss ${esc(p.version)} · 성인 대상. 이미지·영상에 AI 생성 및 편집 자료가 포함됩니다. <a href="${base}credits/">저작권 · 크레딧</a></p>
    <a class="ab-back" href="${base}">← ARCHIVE</a>
  </footer>`;

  /* ---------- expedition behaviour ---------- */
  const exp = main.querySelector('[data-exp]');
  const stepOf = { quest: 0, party: 1, battle: 2, won: 2, stall: 2, deeper: 2, home: 3 };
  function paint(sel) {
    exp.innerHTML = panel();
    exp.dataset.phase = s.phase;
    main.querySelectorAll('.ab-steps li').forEach((li, i) => { li.classList.toggle('is-now', i === stepOf[s.phase]); li.classList.toggle('is-done', i < stepOf[s.phase]); });
    if (sel) exp.querySelector(sel)?.focus({ preventScroll: true });
  }
  const later = (fn, ms) => setTimeout(fn, still.matches ? 0 : ms);
  exp.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    const a = b.dataset.a;
    if (a === 'sign') { s.signed = true; paint(); later(() => { s.phase = 'party'; paint('[data-pick]'); }, 850); return; }
    if (b.dataset.pick) { const id = b.dataset.pick, i = s.team.indexOf(id); i >= 0 ? s.team.splice(i, 1) : s.team.push(id); paint(`[data-pick="${id}"]`); return; }
    if (a === 'descend') { s.phase = 'battle'; paint('[data-act="attack"]'); exp.scrollIntoView({ behavior: still.matches ? 'auto' : 'smooth', block: 'start' }); return; }
    if (b.dataset.act) { act(b.dataset.act); exp.classList.remove('is-hit'); void exp.offsetWidth; exp.classList.add('is-hit'); paint(s.phase === 'battle' ? '[data-act="attack"]' : '[data-a]'); return; }
    if (a === 'deeper') { s.depth = 2; s.phase = 'deeper'; paint('[data-a="home"]'); return; }
    if (a === 'retry') { Object.assign(s, { phase: 'battle', foe: FOE.hp, abyss: FOE.abyss, round: 1, used: [], hp: PARTY_HP, shield: 0, broken: false, mark: false, risk: false, guard: false, weaken: false, log: [] }); paint('[data-act="attack"]'); return; }
    if (a === 'home') { s.phase = 'home'; paint('[data-a="again"]'); return; }
    if (a === 'again') { s = fresh(); paint('[data-a="sign"]'); }
  });
  paint();

  /* ---------- the depth rail follows the reader down ---------- */
  const rail = main.querySelector('.ab-depth-rail');
  const marks = [...rail.querySelectorAll('li')];
  let ticking = false;
  function depth() {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const t = max > 0 ? Math.min(1, scrollY / max) : 0;
    rail.style.setProperty('--t', t.toFixed(4));
    const n = Math.min(marks.length - 1, Math.floor(t * marks.length));
    marks.forEach((m, i) => m.classList.toggle('is-here', i === n));
    document.body.style.setProperty('--sink', t.toFixed(3));
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(depth); } }, { passive: true });
  depth();

  const top = main.querySelector('.ab-top');
  new IntersectionObserver(([e]) => top.classList.toggle('is-solid', !e.isIntersecting), { rootMargin: '-80px 0px 0px 0px' }).observe(main.querySelector('.ab-hero-copy'));
  if (location.hash) requestAnimationFrame(() => document.getElementById(location.hash.slice(1))?.scrollIntoView());
})();
