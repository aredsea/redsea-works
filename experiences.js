(() => {
  'use strict';
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const img=(base,file,alt='',cls='')=>`<img class="${cls}" src="${base}assets/${esc(file)}" alt="${esc(alt)}" loading="lazy" decoding="async">`;
  const portrait=(p,base,cls='')=>`<span class="journey-portrait ${p.transparent?'transparent-portrait':''} ${cls}">${img(base,p.image,p.name)}</span>`;
  const fullPortrait=(p,base)=>{const f=p.frame;return `<span class="full-portrait" style="--portrait-ratio:${f.width}/${f.height}"><img src="${base}assets/${esc(p.image)}" alt="${esc(p.name)}" width="${f.sourceWidth}" height="${f.sourceHeight}" loading="lazy" decoding="async" style="width:${f.sourceWidth/f.width*100}%;left:${-f.x/f.width*100}%;top:${-f.y/f.height*100}%"></span>`;};
  const button=(attr,label,cls='',disabled=false)=>`<button ${attr} class="${cls}" ${disabled?'disabled':''}>${label}</button>`;
  const gauge=(n,max,kind)=>`<span class="journey-gauge ${kind}"><i style="width:${Math.max(0,Math.min(100,n/max*100))}%"></i></span>`;
  const step=(n,kicker,title,text='')=>`<header class="journey-heading"><span class="journey-number">${n}</span><div><p>${kicker}</p><h3>${title}</h3>${text?`<div class="journey-description">${text}</div>`:''}</div></header>`;
  const icon=(base,name)=>img(base,`identity/abyss-${name}.webp`,'','engraved-icon');
  const companions=p=>p.characters.filter(c=>c.group==='동료');
  const guests=p=>p.characters.filter(c=>c.group==='주요 손님');
  const find=(p,id)=>p.characters.find(c=>c.id===id);
  const player={id:'user',name:'당신',role:'전사',class:'전사',row:'전열',combat:{classId:'warrior'}};
  const team=(s,p)=>[...(s.fighting?[player]:[]),...s.party.map(id=>find(p,id))];
  const hpmax=p=>p.row==='전열'?650:480;
  const sk=(id,name,mp,kind,power=0,breaks=0,description='')=>({id,name,mp,kind,power,breaks,description});
  // A deliberately small encounter: original skill names/costs and core break/guard concepts,
  // with explicit fixed showcase damage. This does not claim to port the complete Lua engine.
  const kits={
    warrior:[sk('taunt','도발',10,'taunt',0,20,'적의 주의를 끌고 심연을 20 깎습니다.'),sk('guard2','굳건한 방어',8,'guard',0,0,'다음 두 번의 피격 피해 40% 감소.')],
    paladin:[sk('shield','파티 보호막',30,'shield',120,0,'전원에게 예시 보호막 120을 부여합니다.'),sk('taunt','도발',10,'taunt',0,20,'다음 두 번의 적 공격을 유도합니다.')],
    archer:[sk('snipe','일발필살',24,'attack',280,0,'체험에서는 치명타 예시 피해 280으로 고정합니다.')],
    chaos:[sk('rift','균열',24,'attack',90,40,'심연을 40 깎습니다. 예시 피해 90.'),sk('wave','혼돈 파동',32,'all',110,20,'적 전체의 심연을 20씩 깎습니다.')],
    alchemist:[sk('heal','파티 회복',30,'heal',180,0,'전원에게 예시 HP 180을 회복합니다.'),sk('defdn','약화 약병',20,'weaken',0,12,'심연 −12. 체험에서는 다음 피격 피해를 늘립니다.')],
    priest:[sk('shield','파티 보호막',30,'shield',120,0,'전원에게 예시 보호막 120을 부여합니다.')],
    sanctioned:[],unsanctioned:[],assassin:[],gladiator:[]
  };
  const skills=p=>[sk('attack','일반 공격',0,'attack',150,['warrior','paladin'].includes(p.combat.classId)?12:p.combat.classId==='chaos'?20:3,'예시 피해 150. 심연이 무너지면 더 큰 피해를 줍니다.'),...(kits[p.combat.classId]||[]),sk('guard','방어',0,'guard',0,0,'다음 피격 피해 40% 감소.')];
  const foes=[{name:'심연 사냥개',intent:'물어뜯기 → 전열',weak:'냉기 · 성속성',hp:850,attack:95},{name:'그림자 궁수',intent:'조준 사격 → 후열',weak:'냉기 · 암속성',hp:700,attack:85}];
  function battleState(s,p){return {phase:'ready',round:1,actor:team(s,p)[0]?.id,pending:null,used:[],allies:Object.fromEntries(team(s,p).map(c=>[c.id,{hp:hpmax(c),mp:100,shield:0,guard:0}])),enemies:foes.map(f=>({hp:f.hp,abyss:60,weak:false})),log:[],taunt:null,tauntTurns:0,fx:null};}
  const modeName={'rental-danjo':'요이마치 · 예약과 데이트','into-the-abyss':'Into the Abyss · 원정 준비','music-story':'공명 듀엣 · 연습실'};
  const api={
    initial(id,s,p){
      if(id==='into-the-abyss'){s.inspect='marceline';s.filter='전체';s.query='';s.battle=battleState(s,p);AbyssCity.initial(s);}
      if(id==='rental-danjo'){s.guest='reiko-azumi';s.settled=false;}
      return s;
    },
    shell(p,base){return `<div class="system-lab work-experience experience-${p.theme}" data-system-lab="${p.id}" data-experience-base="${base}"><div class="lab-bar"><span>${modeName[p.id]}</span><button data-lab-reset>처음부터 다시 ↺</button></div><div class="lab-panel"></div><p class="lab-footnote">이 페이지에서만 해 볼 수 있는 체험입니다. 봇의 이미지와 설정을 사용했으며, 결과는 실제 봇에 저장되지 않습니다.</p></div>`;},
    render(s,p,base,helpers){return p.id==='into-the-abyss'?abyss(s,p,base):p.id==='rental-danjo'?rental(s,p,base,helpers):music(s,p,base,helpers);},
    click(event,s,p,root,ctx){
      const b=event.target.closest('button');if(!b||b.disabled)return false;
      const base=root.dataset.experienceBase;
      const render=focus=>ctx.refresh(focus);
      const go=id=>{const target=root.querySelector(id);if(window.WorldDeck)window.WorldDeck.goTo(target);else target?.scrollIntoView({behavior:document.body.classList.contains('motion-reduced')?'instant':'smooth',block:'start'});};
      if(b.hasAttribute('data-journey-battle')){go('#abyss-encounter');root.querySelector('[data-battle-start]')?.focus({preventScroll:true});return true;}
      if(p.id==='into-the-abyss'){
        const bt=s.battle;
        if(AbyssCity.click(b,s,p,base,()=>{render();if(b.dataset.cityGear)go('[data-city-detail]');},k=>act(s,p,k)))return true;
        if(b.dataset.inspect){s.inspect=b.dataset.inspect;render(`[data-inspect="${s.inspect}"]`);return true;}
        if(b.dataset.partyFilter){s.filter=b.dataset.partyFilter;render(`[data-party-filter="${s.filter}"]`);return true;}
        if(b.dataset.partyMember){const id=b.dataset.partyMember,i=s.party.indexOf(id);if(i>=0){s.party.splice(i,1);s.partyMessage='동료를 편성에서 해제했습니다.';}else if(s.party.length<(s.fighting?3:4)){s.party.push(id);s.partyMessage='동료를 편성했습니다. 아래 전투에도 함께 등장합니다.';}else{s.partyMessage='네 자리가 모두 찼습니다. 편성된 동료의 × 버튼으로 자리를 비워 주세요.';render();return true;}s.battle=battleState(s,p);render();return true;}
        if(b.hasAttribute('data-battle-start')||b.hasAttribute('data-battle-retry')){if(!team(s,p).length)return true;s.battle=battleState(s,p);s.battle.phase='playing';AbyssCity.start(s);s.battle.log=['원정대가 회랑에 들어섰습니다. 아군마다 한 번 행동하면 적이 반격합니다.'];render('[data-battle-skill="attack"]');return true;}
        if(b.dataset.battleActor){if(bt.phase!=='playing'||bt.used.includes(b.dataset.battleActor)||bt.allies[b.dataset.battleActor]?.hp<=0)return true;bt.actor=b.dataset.battleActor;bt.pending=null;render(`[data-battle-actor="${bt.actor}"]`);return true;}
        if(b.dataset.battleSkill){
          const actor=team(s,p).find(c=>c.id===bt.actor),skill=skills(actor).find(x=>x.id===b.dataset.battleSkill);
          if(bt.phase!=='playing'||bt.used.includes(bt.actor)||bt.allies[bt.actor].mp<skill.mp)return true;
          if(['attack','taunt','weaken'].includes(skill.kind)){bt.pending=skill;render(`[data-battle-target="${bt.enemies.findIndex(e=>e.hp>0)}"]`);}else{act(s,p,skill);render('[data-battle-skill="attack"], [data-battle-retry]');}return true;
        }
        if(b.hasAttribute('data-battle-cancel')){bt.pending=null;render('[data-battle-skill="attack"]');return true;}
        if(b.dataset.battleTarget!==undefined){if(bt.pending&&bt.enemies[Number(b.dataset.battleTarget)].hp>0){act(s,p,bt.pending,Number(b.dataset.battleTarget));render('[data-battle-skill="attack"], [data-battle-retry]');}return true;}
      }
      if(p.id==='rental-danjo'){
        if(b.hasAttribute('data-rental-start-date')){s.choice='accept';s.outcome=null;s.counter=false;s.settled=false;render();go('#rental-date');return true;}
        if(b.dataset.rentalGuest){s.guest=b.dataset.rentalGuest;s.choice=null;s.outcome=null;s.counter=false;s.settled=false;render(`[data-rental-guest="${s.guest}"]`);return true;}
        if(b.dataset.rentalMood){s.mood=Number(b.dataset.rentalMood);render(`[data-rental-mood="${s.mood}"]`);return true;}
        if(b.dataset.rentalChoice){
          if(b.closest('[data-journey-step="offer"]')){s.choice=b.dataset.rentalChoice;s.outcome=null;s.counter=false;s.settled=false;render();if(s.choice==='accept')go('#rental-date');}
          else{s.outcome=b.dataset.rentalChoice;s.counter=false;render();}return true;
        }
        if(b.dataset.rentalCounter){s.counter=b.dataset.rentalCounter==='open';render(s.counter?'[data-counter-tier]':undefined);return true;}
        if(b.hasAttribute('data-rental-finish')){s.settled=true;render();go('#rental-after');return true;}
      }
      if(p.id==='music-story'&&b.dataset.musicPerson!==undefined){
        // Keep the live score/timers intact while changing the accompanying portrait/notebook.
        s.person=Number(b.dataset.musicPerson);root.querySelector('[data-music-companion]').innerHTML=musicCompanion(s,p,base);
        root.querySelector('[data-music-notebook]').innerHTML=ctx.helpers.music({...s,tab:'relations'},p);
        root.querySelector(`[data-music-person="${s.person}"]`)?.focus();return true;
      }
      return false;
    },
    change(event,s,p,root,ctx){
      const e=event.target;
      if(p.id==='into-the-abyss'&&AbyssCity.change(event,s,root.dataset.experienceBase,()=>ctx.refresh()))return true;
      if(e.hasAttribute('data-party-fighting')){s.fighting=e.checked;if(s.fighting)s.party=s.party.slice(0,3);s.battle=battleState(s,p);s.partyMessage='편성이 바뀌어 아래 전투를 새로 준비했습니다.';ctx.refresh('[data-party-fighting]');return true;}
      if(e.hasAttribute('data-rental-guest-select')){s.guest=e.value;s.choice=null;s.outcome=null;s.counter=false;s.settled=false;ctx.refresh('[data-rental-guest-select]');return true;}
      if(e.hasAttribute('data-music-resonance')){s.resonance[s.person]=Number(e.value);root.querySelector('[data-music-notebook]').innerHTML=ctx.helpers.music({...s,tab:'relations'},p);root.querySelector('[data-music-resonance]')?.focus();return true;}
      return false;
    },
    input(event,s,p,root){
      if(p.id==='into-the-abyss')AbyssCity.input(event,s,root.dataset.experienceBase,root);
      if(event.target.hasAttribute('data-party-search')){s.query=event.target.value;let count=0;root.querySelectorAll('[data-inspect]').forEach(b=>{const person=find(p,b.dataset.inspect);b.hidden=!(s.filter==='전체'||person.row===s.filter)||![person.name,person.class,person.race].join(' ').includes(s.query.trim());if(!b.hidden)count++;});root.querySelector('[data-party-results]').textContent=`동료 ${count} / 30`;root.querySelector('[data-party-empty]').hidden=count>0;}
    }
  };
  function artProfile(p,base){return `<div class="guild-profile-art">${portrait(p,base)}</div><div class="guild-profile-copy"><p class="guild-nationality">${esc(p.nation)} · ${esc(p.race)}</p><h4>${esc(p.name)}</h4><p class="guild-class">${icon(base,`ic_cls_${p.combat.classId}`)} ${esc(p.class)} <span>${esc(p.row)}</span></p><p class="guild-hook">${esc(p.hook)}</p><p>${esc(p.text)}</p><dl class="guild-signature"><div><dt>고유 스킬 · ${esc(p.combat.skillName)}</dt><dd>${esc(p.combat.skillNote)}</dd></div><div><dt>특성 · ${esc(p.combat.traitName)}</dt><dd>${esc(p.combat.traitNote)}</dd></div></dl>${p.combat.proposed?'<small class="journey-disclosure">추가 동료의 스킬·특성은 원본 설계에서 검토 중인 제안입니다.</small>':''}</div>`;}
  function abyss(s,p,base){
    const person=find(p,s.inspect),all=companions(p),members=team(s,p),visible=all.filter(c=>(s.filter==='전체'||c.row===s.filter)&&[c.name,c.class,c.race].join(' ').includes(s.query.trim()));
    return `<div class="guild-experience">${AbyssCity.render(s,p,base)}<section class="guild-assembly" id="characters">${step('I','동료 편성','원정대 꾸리기','동료의 소개와 능력을 확인하고 원정대에 넣어 보세요.')}<div class="guild-dossier">${artProfile(person,base)}<div class="guild-recruit">${button(`data-party-member="${person.id}"`,s.party.includes(person.id)?'편성에서 제외 −':'원정대에 합류 +','journey-primary')}<span>${s.party.includes(person.id)?'이 동료는 아래 전투에 참가합니다.':'초상화를 눌러 다른 동료도 만나 보세요.'}</span></div></div><div class="guild-roster-tools"><div class="guild-filters" role="group" aria-label="동료 대열">${['전체','전열','후열'].map(f=>button(`data-party-filter="${f}" aria-pressed="${s.filter===f}"`,f)).join('')}</div><label><span class="sr-only">편성 동료 검색</span><input data-party-search type="search" value="${esc(s.query)}" placeholder="이름 · 직업 · 종족"></label><span data-party-results>동료 ${visible.length} / 30</span></div><div class="guild-roster" aria-label="동료 초상화 목록">${all.map(c=>`<button data-inspect="${c.id}" aria-pressed="${s.inspect===c.id}" ${!visible.includes(c)?'hidden':''}>${portrait(c,base)}<span><b>${esc(c.name)}</b><small>${esc(c.class)}</small></span>${s.party.includes(c.id)?'<i aria-label="편성됨">✓</i>':''}</button>`).join('')}</div><p data-party-empty ${visible.length?'hidden':''}>검색과 일치하는 동료가 없습니다.</p><div class="expedition-header"><h4>당신의 원정대 <small>총 4자리</small></h4><label class="persona-switch"><input data-party-fighting type="checkbox" ${s.fighting?'checked':''}> 나도 직접 전투에 참가</label></div><div class="expedition-slots">${Array.from({length:4},(_,i)=>{const c=members[i];return `<div class="expedition-slot ${c?'filled':''}">${c?`${c.image?portrait(c,base):`<span class="persona-medallion">${icon(base,'ic_cls_warrior')}</span>`}<div><small>0${i+1} · ${esc(c.row)}</small><b>${esc(c.name)}</b><span>${esc(c.class)}</span></div>${c.id!=='user'?button(`data-party-member="${c.id}" aria-label="${c.name} 편성 해제"`,'×','slot-remove'):''}`:`<span class="slot-empty">＋</span><div><small>0${i+1}</small><b>빈 자리</b><span>위에서 동료를 선택하세요</span></div>`}</div>`;}).join('')}</div><div class="expedition-bottom"><p role="status" class="party-status">${esc(s.partyMessage||'직접 싸우면 동료 3명, 지휘만 하면 동료 4명. 선택한 편성이 바로 아래 전투에 이어집니다.')}</p>${button('data-journey-battle','이 원정대로 전투하기 ↓','journey-primary',!members.length)}</div></section><section id="abyss-encounter" class="guild-encounter">${step('II','전투 체험','회랑에서의 첫 전투','편성한 동료로 전투를 해 보세요. 적의 다음 공격과 심연 게이지를 확인하며 행동을 고를 수 있습니다.')}<div data-battle-area>${battle(s,p,base)}</div>${AbyssCity.pack(s,base)}</section>${AbyssCity.after(s)}<div class="guild-afterword">${img(base,'abyss-world-map.webp','Into the Abyss 세계 지도')}<div><p>탐험과 도시 생활</p><h4>탐험을 마치면<br>다시 도시로</h4><p>의뢰와 탐색, 귀환과 정산. 회랑에서 함께 싸운 동료는 도시에서도 각자의 삶을 이어갑니다.</p><a href="#characters">원정대 편성으로 돌아가기 ↗</a></div></div></div>`;
  }
  function battle(s,p,base){
    const bt=s.battle,members=team(s,p),actor=members.find(c=>c.id===bt.actor),active=bt.phase==='playing',done=['won','lost','retreated'].includes(bt.phase);
    return `<div class="encounter-board ${bt.fx?'action-resolved':''}"><div class="encounter-topline"><span>심연 회랑 / 훈련 조우</span><b>ROUND ${String(bt.round).padStart(2,'0')}</b><span>체험용 고정 수치</span></div><div class="enemy-stage">${foes.map((f,i)=>`<button data-battle-target="${i}" class="engraved-enemy ${bt.pending&&bt.enemies[i].hp>0?'targetable':''} ${bt.enemies[i].hp<=0?'defeated':''} ${bt.fx?.target===i?'impact':''}" ${!bt.pending||bt.enemies[i].hp<=0?'disabled':''}><span class="enemy-medallion" style="--enemy:${i}">${img(base,'identity/abyss-enemies.png','')}</span><strong>${f.name}</strong><span class="foe-intent">${bt.enemies[i].hp<=0?'격파':bt.enemies[i].abyss===0?'심연 붕괴 · 다음 반격 불가':f.intent}</span><span class="foe-values">HP <b>${bt.enemies[i].hp} / ${f.hp}</b></span>${gauge(bt.enemies[i].hp,f.hp,'hp')}<span class="foe-values">심연 <b>${bt.enemies[i].abyss} / 60</b></span>${gauge(bt.enemies[i].abyss,60,'abyss')}<small>약점 ${f.weak}</small>${bt.pending?'<em class="target-hint">이 적에게 사용</em>':''}${bt.fx?.target===i?`<span class="damage-float" aria-hidden="true">${bt.fx.text}</span>`:''}</button>`).join('')}</div>${done?`<div class="battle-result" role="status"><p>${bt.phase==='won'?'전투 승리':bt.phase==='retreated'?'귀환 완료':'전투 패배'}</p><h4>${bt.phase==='won'?'전투에서 승리했습니다.':bt.phase==='retreated'?'토르바로 귀환했습니다.':'원정대가 패배했습니다.'}</h4><p>${bt.phase==='won'?(s.city.run?'아래 귀환 정산에서 의뢰 보상을 받으세요.':'의뢰 없이 진행한 훈련입니다. 길드에서 의뢰를 받으면 귀환 보상으로 이어집니다.'):bt.phase==='retreated'?'보상 없이 철수했습니다. 도시에서 다시 준비하세요.':'보호막과 방어, 심연 붕괴로 적의 반격을 제어해 보세요.'}</p>${button('data-battle-retry','같은 편성으로 다시 싸우기 ↺','journey-primary')}</div>`:''}<div class="encounter-allies">${members.map(c=>{const a=bt.allies[c.id];return `<button data-battle-actor="${c.id}" aria-pressed="${c.id===bt.actor}" ${!active||a.hp<=0||bt.used.includes(c.id)?'disabled':''}>${c.image?portrait(c,base):`<span class="persona-medallion">${icon(base,'ic_cls_warrior')}</span>`}<div class="ally-readout"><b>${esc(c.name)}</b><span>${esc(c.class)} · ${a.hp<=0?'전투 불능':bt.used.includes(c.id)?'행동 완료':'행동 가능'}</span><label>HP ${a.hp}/${hpmax(c)}</label>${gauge(a.hp,hpmax(c),'hp')}<label>MP ${a.mp}/100 ${a.shield?`· 보호막 ${a.shield}`:''}</label>${gauge(a.mp,100,'mp')}</div></button>`;}).join('')}</div><div class="encounter-controls">${bt.phase==='ready'?`<div class="battle-invite"><div><h4>원정대가 당신의 지시를 기다립니다.</h4><p>아군이 한 번씩 행동한 뒤 적이 반격합니다. 두 적을 모두 쓰러뜨리면 승리합니다.</p></div>${button('data-battle-start','조우 시작 →','journey-primary',!members.length)}</div>`:active?`<div class="actor-command"><div class="actor-caption"><span>${esc(actor.name)}의 차례</span><small>${esc(actor.class)} · MP ${bt.allies[actor.id].mp}</small></div>${bt.pending?`<div class="target-instruction"><b>${esc(bt.pending.name)}</b> — 위의 적을 선택하세요.${button('data-battle-cancel','취소')}</div>`:`<div class="encounter-skills">${skills(actor).map(k=>`<button data-battle-skill="${k.id}" ${bt.allies[actor.id].mp<k.mp?'disabled':''}>${icon(base,({rift:'ic_sk_rift',wave:'ic_sk_wave',snipe:'ic_sk_snipe',taunt:'ic_sk_taunt',heal:'ic_sk_heal',shield:'ic_sk_shield',guard:'ic_defend',guard2:'ic_defend'})[k.id]||'ic_attack')}<span><b>${k.name}</b><small>MP ${k.mp}${k.breaks?` · 심연 −${k.breaks}`:''}</small><em>${k.description}</em></span></button>`).join('')}</div>${['sanctioned','unsanctioned','assassin','gladiator'].includes(actor.combat.classId)?'<p class="journey-disclosure">이 직업의 특수·개인 스킬은 인물 소개에서 확인할 수 있습니다. 짧은 체험에서는 일반 공격과 방어를 사용합니다.</p>':''}`}</div>`:''}</div><div class="encounter-log" role="log" aria-label="전투 기록" aria-live="polite">${bt.log.slice(-4).map(l=>`<p>${esc(l)}</p>`).join('')||'<p>출전 편성 → 조우 시작 → 아군 행동 → 적의 반격</p>'}</div><p class="encounter-note">원본의 직업·스킬 이름, MP, 심연 붕괴와 방어 개념을 사용했습니다. 피해·회복·속도·적 반격은 짧은 체험용으로 단순화했으며, 원본 전투 엔진 전체를 실행하지 않습니다.</p></div>`;
  }
  function act(s,p,k,target=0){
    const b=s.battle,c=team(s,p).find(c=>c.id===b.actor),a=b.allies[c.id];if(a.mp<k.mp)return;a.mp-=k.mp;b.fx=null;
    const hit=i=>{const e=b.enemies[i];if(e.hp<=0)return;const damage=Math.round(k.power*(c.id==='user'?1+AbyssCity.bonus(s,'dmg'):1)*(e.abyss===0?1.5:1)*(e.weak?1.2:1));e.hp=Math.max(0,e.hp-damage);e.abyss=Math.max(0,e.abyss-k.breaks);if(k.kind==='weaken')e.weak=true;b.fx={target:i,text:damage?`−${damage}`:`심연 −${k.breaks}`};b.log.push(`${c.name} · ${k.name} → ${foes[i].name}${damage?` / 피해 ${damage}`:''}${k.breaks?` / 심연 −${k.breaks}`:''}`);};
    if(['attack','taunt','weaken'].includes(k.kind))hit(target);
    if(k.kind==='all')b.enemies.forEach((_,i)=>hit(i));
    if(k.kind==='taunt'){b.taunt=c.id;b.tauntTurns=2;}
    if(k.kind==='guard'){a.guard=k.id==='guard2'?2:1;b.log.push(`${c.name} · ${k.name} / 다음 피격 피해 40% 감소`);}
    if(k.kind==='shield'||k.kind==='heal'){team(s,p).forEach(x=>{const ally=b.allies[x.id];if(ally.hp<=0)return;if(k.kind==='shield')ally.shield=k.power;else ally.hp=Math.min(hpmax(x),ally.hp+k.power);});b.log.push(`${c.name} · ${k.name} / 파티 ${k.kind==='heal'?'HP 회복':'보호막'} +${k.power}`);}
    if(k.kind==='item'){const x=k.item;if(x.kind==='hp')a.hp=Math.min(hpmax(c),a.hp+Math.round(hpmax(c)*x.value));if(x.kind==='mp')a.mp=Math.min(100,a.mp+Math.round(100*x.value));if(x.kind==='sh'){a.shield=Math.round(hpmax(c)*x.value);a.shieldUntil=b.round+3;}if(x.kind==='revive'){const fallen=team(s,p).find(z=>b.allies[z.id].hp<=0);if(fallen)b.allies[fallen.id].hp=Math.round(hpmax(fallen)*.25);}b.log.push(`${c.name} · ${k.name} 사용`);}
    b.pending=null;b.used.push(c.id);
    if(b.enemies.every(e=>e.hp<=0)){b.phase='won';b.log.push('조우 승리. 모든 적을 격파했습니다.');return;}
    const remaining=()=>team(s,p).filter(x=>b.allies[x.id].hp>0&&!b.used.includes(x.id));
    if(!remaining().length){
      b.enemies.forEach((enemy,i)=>{if(enemy.hp<=0)return;if(enemy.abyss===0){b.log.push(`${foes[i].name} · 심연 붕괴로 행동 불가. 다음 라운드 심연 회복.`);enemy.abyss=60;return;}
        const live=team(s,p).filter(x=>b.allies[x.id].hp>0);if(!live.length)return;
        const chosen=live.find(x=>x.id===b.taunt&&b.tauntTurns>0)||live.find(x=>x.row===(i===0?'전열':'후열'))||live[0];const ally=b.allies[chosen.id];
        let damage=Math.round(foes[i].attack*(chosen.id==='user'?Math.max(.1,1-AbyssCity.bonus(s,'dr')):1)*(ally.guard>0?.6:1));if(ally.guard>0)ally.guard--;if(b.tauntTurns>0&&chosen.id===b.taunt)b.tauntTurns--;
        const absorbed=Math.min(ally.shield,damage);ally.shield-=absorbed;damage-=absorbed;ally.hp=Math.max(0,ally.hp-damage);b.log.push(`${foes[i].name} 반격 → ${chosen.name} / 피해 ${damage}${absorbed?` · 보호막 흡수 ${absorbed}`:''}`);
      });
      if(team(s,p).every(x=>b.allies[x.id].hp<=0)){b.phase='lost';return;}b.round++;b.used=[];Object.values(b.allies).forEach(a=>{if(a.shieldUntil&&b.round>=a.shieldUntil){a.shield=0;delete a.shieldUntil;}});
    }
    b.actor=remaining()[0]?.id;
  }
  function rental(s,p,base,h){
    const person=find(p,s.guest),list=guests(p),accepted=s.choice==='accept';
    let offer=h.rental({...s,tab:'offer'}).replace('당신에게 온 지명',esc(person.name)).replace('첫 만남 · 요이마치 소속 렌탈 인력',esc(person.role)).replace('예약을 수락했습니다. 아래에서 데이트를 진행해 보세요.','예약이 확정됐습니다. 바로 아래에서 데이트를 이어가세요.');
    let demand=h.rental({...s,tab:'demand'});
    if(!accepted)demand=`<div class="date-entry"><p class="letter-date">${esc(person.name)} · 예시 데이트</p><h4>${s.choice==='refuse'?'다시 만나 볼까요?':'이 손님과 데이트를 시작할까요?'}</h4><p>${s.choice==='refuse'?'앞서 거절한 예약을 다시 수락하고 체험할 수 있습니다.':'예약을 수락하면 손님의 요구에 답하고, 만남 뒤의 후기까지 확인할 수 있습니다.'}</p>${button('data-rental-start-date','예약 수락하고 시작','journey-primary')}</div>`;
    return `<div class="agency-experience"><div class="agency-masthead">${img(base,'identity/rental-monogram-light.svg','','agency-monogram')}<div><p>あなたの時間を、誰かの特別に。</p><h3>YOIMACHI</h3><span>렌탈남녀 · 요이마치 지명 수첩</span></div><span class="agency-edition">APPOINTMENT<br>NO. 001</span></div><section class="agency-client" id="characters">${step('01','손님 소개','손님 고르기')}<div class="agency-person-layout"><div class="agency-person-art">${portrait(person,base)}<span>손님 / ${String(list.indexOf(person)+1).padStart(2,'0')}</span></div><div class="agency-person-letter"><p class="letter-date">요이마치 · 지명 예약</p><h4>${esc(person.name)}</h4><p class="letter-role">${esc(person.role)}</p><p class="letter-hook">${esc(person.hook)}</p><p>${esc(person.text)}</p><p class="letter-trait">${esc(person.trait)}</p>${window.RentalPlaces.mini(person,base)}<label class="agency-client-select">다른 손님 만나기<select data-rental-guest-select>${list.map(g=>`<option value="${g.id}" ${s.guest===g.id?'selected':''}>${esc(g.name)} · ${esc(g.role)}</option>`).join('')}</select></label><div class="agency-featured">${list.slice(0,6).map(g=>`<button data-rental-guest="${g.id}" aria-label="${esc(g.name)} 선택" aria-pressed="${s.guest===g.id}">${portrait(g,base)}<span>${esc(g.name)}</span></button>`).join('')}</div></div></div></section><section class="agency-booking" data-journey-step="offer">${step('02','예약 신청','예약을 받을까요?','아래 신청 문구는 선택에 따른 흐름을 보여주는 체험용 예시입니다.')}<div class="appointment-illustration">${img(base,'identity/rental-empty-light-bookings.webp','요이마치 예약 수첩')}<span>당신의 시간에<br>손님이 예약을 신청했습니다.</span></div>${offer}</section><section id="rental-date" class="agency-date" data-journey-step="demand">${step('03','데이트 중','손님의 요구에 답하기')}<p class="appointment-state" role="status">${accepted?`${esc(person.name)}와의 예약이 확정됐습니다.`:s.choice==='refuse'?'이번 신청은 거절한 상태입니다.':'예약 없이 둘러보는 중입니다.'}</p>${demand}${s.outcome?`<div class="date-to-review"><span>선택을 마쳤습니다. 만남 뒤의 기록을 확인해 보세요.</span>${button('data-rental-finish','데이트를 마치고 후기 읽기 →','journey-primary')}</div>`:''}</section><section id="rental-after" class="agency-after">${step('04','데이트 종료','보수와 후기 확인하기')}<div class="after-layout">${img(base,'identity/rental-empty-light-reviews.webp','찻잔과 남겨진 꽃잎')}<div><p class="letter-date">${s.settled?'REVIEW / 체험용 후기':'데이트 결과'}</p><h4>${s.settled?'손님이 남긴 후기':'데이트를 마치면<br>후기를 확인할 수 있습니다.'}</h4><p>${s.settled?`${esc(person.name)}와의 예시 데이트가 끝났습니다. 실제 봇에서는 손님의 말투로 후기와 댓글을 작성합니다. 보수를 받고 빚을 갚으며 평판도 관리하게 됩니다.`:'데이트를 마치면 보수를 받고 손님의 평가를 확인합니다. 남은 빚과 생활비도 챙겨야 합니다.'}</p><div class="agency-receipt"><span>예시 지명료 <b>${s.settled?'¥8,000':'—'}</b></span><span>기록 <b>${s.settled?'체험 완료':'데이트 대기'}</b></span></div></div></div></section></div>`;
  }
  function musicCompanion(s,p,base){const c=p.characters[s.person];return `<div class="recital-person-art">${fullPortrait(c,base)}</div><div class="recital-person-copy"><p>함께 연주할 사람</p><h4>${esc(c.name)}</h4><span>${esc(c.role)}</span><h5>${esc(c.hook)}</h5><p>${esc(c.text)}</p><div class="recital-people" role="group" aria-label="함께할 인물">${p.characters.map((x,i)=>button(`data-music-person="${i}" aria-pressed="${s.person===i}"`,`${portrait(x,base)}<span>${esc(x.name)}</span>`)).join('')}</div></div>`;}
  function music(s,p,base,h){return `<div class="recital-experience"><header class="recital-masthead"><span>RESONANCE DUET</span><span>私たちの、小さな練習室。</span></header><section class="recital-introduction">${step('01','인물 소개','누구와 연주할까요?')}<div data-music-companion class="recital-partner">${musicCompanion(s,p,base)}</div><div class="recital-score-line" aria-hidden="true"><span>♩</span><span>♪</span><span>♫</span><span>♩</span><span>♪</span></div></section><section class="recital-practice">${step('02','공명 듀엣 연습','듣고 따라 연주하기')}${h.music({...s,tab:'practice'},p)}</section><section class="recital-notebook">${step('03','관계 기록','연습 기록과 공명도')}<div data-music-notebook>${h.music({...s,tab:'relations'},p)}</div><p class="recital-note">연습 기록과 관계 공명도는 별개입니다. 위의 짧은 연습은 관계 수치를 바꾸지 않습니다.</p></section></div>`;}
  window.WorkExperiences=api;
})();
