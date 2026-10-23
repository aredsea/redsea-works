(() => {
  'use strict';
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const number=value=>new Intl.NumberFormat('ja-JP').format(value);
  const art=(person,base)=>{
    if(!person.image)return `<div class="portrait-unavailable"><span aria-hidden="true">${esc(person.name.slice(0,1))}</span><p>${esc(person.portraitNote||'개별 초상화가 없는 인물입니다.')}</p></div>`;
    const f=person.frame;
    const style=f?`style="aspect-ratio:${f.width}/${f.height}"`:'';
    const imageStyle=f?`style="width:${(f.sourceWidth/f.width*100).toFixed(4)}%;left:${(-f.x/f.width*100).toFixed(4)}%;top:${(-f.y/f.height*100).toFixed(4)}%"`:'';
    return `<button class="cast-artwork${person.transparent?' is-cutout':''}" data-lightbox="${esc(person.image)}" data-alt="${esc(person.alt)}" data-caption="${esc(person.name)} · 원본 아트" aria-label="${esc(person.name)} 원본 아트 크게 보기"><span class="portrait-frame" ${style}><img src="${base}assets/${esc(person.image)}" alt="${esc(person.alt)}" ${f?`width="${f.sourceWidth}" height="${f.sourceHeight}"`:''} ${imageStyle} decoding="async"></span><span class="artwork-expand">원본 보기 ↗</span></button>`;
  };
  function profile(person,index,total,base){
    return `<div class="cast-profile" data-profile="${esc(person.id)}"><div class="cast-portrait">${art(person,base)}</div><div class="cast-biography"><p class="cast-category">${esc(person.group||'등장인물')} <span>— ${String(index+1).padStart(2,'0')} / ${total}</span></p>${person.en||person.fullName?`<p class="cast-roman">${esc(person.en||person.fullName)}</p>`:''}<h3>${esc(person.name)}</h3><p class="cast-role">${esc(person.role)}</p><div class="cast-bio-rule"></div><p class="character-hook">${esc(person.hook)}</p><p class="cast-story">${esc(person.text)}</p><p class="cast-traits">${esc(person.trait)}</p>${person.race?`<dl class="cast-specs"><div><dt>종족</dt><dd>${esc(person.race)}</dd></div><div><dt>직업</dt><dd>${esc(person.class||person.role)}</dd></div>${person.nation?`<div><dt>소속</dt><dd>${esc(person.nation)}</dd></div>`:''}${person.row?`<div><dt>대열</dt><dd>${esc(person.row)}</dd></div>`:''}</dl>`:''}</div></div>`;
  }
  window.CastExplorer={
    render(project,base){
      const people=project.characters,groups=[...new Set(people.map(p=>p.group||'등장인물'))];
      return `<section class="cast-section page-width" id="characters"><div class="section-heading compact"><div><p class="eyebrow">등장인물 / ${String(people.length).padStart(2,'0')}</p><h2>${esc(project.castTitle)}</h2></div><p>이름을 누르면 소개와 이미지를 볼 수 있습니다.</p></div>${project.castNote?`<p class="cast-intro">${esc(project.castNote)}</p>`:''}<div class="cast-explorer" data-cast-project="${esc(project.id)}" data-cast-base="${base}"><aside class="cast-directory"><div class="cast-directory-tools"><label class="cast-search"><span aria-hidden="true">⌕</span><span class="sr-only">인물 이름과 직업 검색</span><input type="search" data-cast-search placeholder="이름 · 직업 검색" autocomplete="off"></label><div class="cast-groups" role="group" aria-label="인물 분류"><button data-cast-group="전체" aria-pressed="true">전체 <small>${people.length}</small></button>${groups.length>1?groups.map(g=>`<button data-cast-group="${esc(g)}" aria-pressed="false">${esc(g)} <small>${people.filter(p=>(p.group||'등장인물')===g).length}</small></button>`).join(''):''}</div><p class="cast-match" aria-live="polite">${people.length}명의 인물</p></div><div class="cast-selector" role="tablist" aria-orientation="vertical" aria-label="등장인물 목록">${people.map((p,i)=>`<button role="tab" id="cast-tab-${esc(p.id)}" aria-controls="cast-panel-${project.id}" aria-selected="${i===0}" tabindex="${i===0?0:-1}" data-character="${esc(p.id)}"><span class="roster-index">${String(i+1).padStart(2,'0')}</span><span class="roster-name"><strong>${esc(p.name)}</strong><small>${esc(p.role)}</small></span><span class="roster-indicator" aria-hidden="true">↗</span></button>`).join('')}</div><p class="cast-no-results" hidden>조건에 맞는 인물이 없습니다.</p></aside><div class="cast-stage"><div class="cast-stage-top"><span data-cast-caption>${esc(people[0].group||'등장인물')}</span><div><button data-cast-prev aria-label="이전 인물">←</button><button data-cast-next aria-label="다음 인물">→</button></div></div><article class="character-stage" role="tabpanel" tabindex="0" id="cast-panel-${project.id}" aria-labelledby="cast-tab-${esc(people[0].id)}">${profile(people[0],0,people.length,base)}</article></div></div></section>`;
    },
    bind(){
      document.querySelectorAll('[data-cast-project]').forEach(root=>{
        const project=window.BOT_WORKS.projects.find(p=>p.id===root.dataset.castProject),people=project.characters;
        const buttons=[...root.querySelectorAll('[data-character]')],panel=root.querySelector('[role=tabpanel]');
        const search=root.querySelector('[data-cast-search]');let group='전체',current=people[0].id;
        const visible=()=>buttons.filter(b=>!b.hidden);
        const select=(button,focus=false)=>{
          if(!button)return;current=button.dataset.character;const index=people.findIndex(p=>p.id===current),person=people[index];
          buttons.forEach(b=>{b.setAttribute('aria-selected',String(b===button));b.tabIndex=b===button?0:-1;});
          panel.setAttribute('aria-labelledby',button.id);panel.innerHTML=profile(person,index,people.length,root.dataset.castBase);
          root.querySelector('[data-cast-caption]').textContent=person.group||'등장인물';if(focus)button.focus();
        };
        const apply=()=>{
          const query=search.value.trim().normalize('NFKC').toLowerCase();
          buttons.forEach((button,i)=>{const p=people[i];button.hidden=!(group==='전체'||p.group===group)||![p.name,p.role,p.en,p.fullName,p.trait].join(' ').normalize('NFKC').toLowerCase().includes(query);});
          const shown=visible();root.querySelector('.cast-match').textContent=`${shown.length}명의 인물 / 전체 ${people.length}명`;
          root.querySelector('.cast-no-results').hidden=shown.length>0;root.querySelector('.cast-stage').hidden=shown.length===0;
          if(!shown.some(b=>b.dataset.character===current)&&shown.length)select(shown[0]);
          root.querySelectorAll('[data-cast-prev],[data-cast-next]').forEach(b=>b.disabled=!shown.length);
          root.querySelectorAll('[data-cast-group]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.castGroup===group)));
        };
        buttons.forEach(button=>{
          button.addEventListener('click',()=>select(button));
          button.addEventListener('keydown',event=>{
            const shown=visible(),i=shown.indexOf(button);let n;
            if(['ArrowDown','ArrowRight'].includes(event.key))n=(i+1)%shown.length;
            if(['ArrowUp','ArrowLeft'].includes(event.key))n=(i-1+shown.length)%shown.length;
            if(event.key==='Home')n=0;if(event.key==='End')n=shown.length-1;
            if(n===undefined)return;event.preventDefault();select(shown[n],true);
          });
        });
        root.querySelectorAll('[data-cast-group]').forEach(b=>b.addEventListener('click',()=>{group=b.dataset.castGroup;apply();}));
        search.addEventListener('input',apply);
        for(const [attr,offset] of [['data-cast-prev',-1],['data-cast-next',1]])root.querySelector(`[${attr}]`).addEventListener('click',()=>{const shown=visible(),i=shown.findIndex(b=>b.dataset.character===current);select(shown[(i+offset+shown.length)%shown.length]);});
      });
    }
  };

  const tabs={
    'rental-danjo':[['offer','지명 신청'],['demand','요구와 역제안'],['life','생활과 후기']],
    'into-the-abyss':[['party','출전 편성'],['battle','전투와 심연'],['explore','던전 탐색']],
    'music-story':[['practice','마음의 악보'],['relations','공명도와 관계 수첩']]
  };
  const initial=id=>id==='rental-danjo'?{tab:'offer',mood:85,choice:null,counter:false,tier:1,destination:'이동 없음',outcome:null}:id==='into-the-abyss'?{fighting:true,party:['marceline','naran','levia']}:{tab:'practice',phase:'ready',notes:[4,7,4,2,0,4,7,4],judged:[],index:-1,timers:[],raf:0,person:0,resonance:[150,225,75],best:0};
  const signed=n=>n>0?'+'+n:String(n);
  const moodLabel=n=>n<=-60?'벼랑 끝':n<=-20?'불안':n<=39?'보통':'밝음';
  const moods=[85,15,-45,-88];
  const stages=[[0,'낯선 박자'],[75,'귀 기울임'],[150,'편안한 호흡'],[225,'숨겨둔 선율'],[300,'말 없는 신뢰'],[400,'영혼의 공명'],[500,'목숨을 건 사랑']];
  const stage=n=>stages.filter(s=>n>=s[0]).at(-1)[1];
  const stat=(label,value)=>`<div><dt>${label}</dt><dd>${value}</dd></div>`;
  const bar=(value,max,className='')=>`<span class="demo-gauge ${className}"><span style="width:${Math.max(0,Math.min(100,value/max*100))}%"></span></span>`;

  function rental(s){
    const quote=s.mood>=40?'행사에 같이 가 주세요. 끝나면 커피 한 잔 더 해도 좋고요.':s.mood>=-19?'조용한 곳에서 대본을 함께 읽어줄 수 있나요?':s.mood>=-59?'사람이 적은 곳이면 좋겠어요. 시간을 조금만 더 내 주세요.':'오늘은 혼자 있고 싶지 않아요. 약속한 시간에는 꼭 와 주세요.';
    if(s.tab==='offer')return `<div class="rental-preview"><div class="rn-demo-header"><span>YOIMACHI</span><span>지명 신청 <b>01</b></span></div><div class="rn-demo-grid"><div class="rn-request"><p class="demo-eyebrow">지명 신청 · 예시</p><div class="rn-person"><div class="rn-monogram">指</div><div><h3>당신에게 온 지명</h3><p>첫 만남 · 요이마치 소속 렌탈 인력</p></div></div><div class="rn-mood"><span>손님 멘탈 <b>${signed(s.mood)}</b></span><span class="mood-badge">${moodLabel(s.mood)}</span><div class="mood-axis"><i></i><span style="left:${Math.min(50,50+s.mood/2)}%;width:${Math.abs(s.mood)/2}%" class="${s.mood<0?'negative':''}"></span></div><small>−100 <span>0</span> +100</small></div><blockquote>“${quote}”</blockquote><dl class="rn-offer-facts">${stat('약속','토요일 · 14:00')}${stat('장소','신주쿠 · 카페')}${stat('대여 시간','2시간')}${stat('예시 지명료','¥8,000')}</dl><div class="demo-actions"><button data-rental-choice="accept" class="demo-primary" ${s.choice?'disabled':''}>예약 수락</button><button data-rental-choice="refuse" ${s.choice?'disabled':''}>이번엔 거절</button></div><p class="demo-feedback" role="status">${s.choice==='accept'?'예약을 수락했습니다. 아래에서 데이트를 진행해 보세요.':s.choice==='refuse'?'이 신청을 거절했습니다. 다른 멘탈 상태를 선택하면 다시 비교할 수 있습니다.':'조건을 확인하고 대답해 보세요.'}</p></div><aside class="rn-demo-sidebar"><p class="demo-eyebrow">SAME SYSTEM, DIFFERENT STATE</p><h4>손님 멘탈에 따른<br>신청 내용의 차이</h4><p>손님 멘탈을 바꿔 신청 카드의 분위기를 비교해 보세요.</p><div class="mood-options">${moods.map(m=>`<button data-rental-mood="${m}" aria-pressed="${s.mood===m}"><span>${moodLabel(m)}</span><b>${signed(m)}</b></button>`).join('')}</div><p class="demo-small">손님의 멘탈과 요구 단계, 유저 멘탈은 서로 다른 값입니다. 멘탈이 낮다고 요구 단계가 자동으로 오르지는 않습니다.</p></aside></div></div>`;
    if(s.tab==='demand')return `<div class="rental-preview demand-preview"><div class="rn-demo-header"><span>YOIMACHI</span><span>데이트 진행 중</span></div><div class="rn-demo-grid"><div class="rn-request"><p class="demo-eyebrow">요구 1 / 2 · 예시 장면</p><div class="demand-level"><b>1단계</b><span>탐색과 동행</span></div><h3 class="demand-title">조금 더 걷다가,<br>카페에 들러도 될까요?</h3><p class="demand-context">데이트 도중의 요구 · 신주쿠 거리 → 카페</p>${s.outcome?`<div class="demo-outcome" role="status"><b>${s.outcome==='accept'?'요구 수락':s.outcome==='refuse'?'요구 거절':s.outcome==='counter-yes'?'역제안 수락 예시':'역제안 거절 예시'}</b><p>${s.outcome==='counter-no'?'역제안이 거절되어 원래 요구가 수락됩니다.':s.outcome==='counter-yes'?'원래 요구를 제안한 행동으로 대신합니다. 역제안 자체의 웃돈은 없습니다.':'이 선택 뒤의 장면은 실제 봇에서 대화로 이어집니다.'}</p></div>`:s.counter?`<div class="rn-counter-form"><h4>역제안으로 대답하기</h4><label>요구 단계 <select data-counter-tier>${[1,2,3,4,5,6,7].map(n=>`<option value="${n}" ${s.tier===n?'selected':''}>${n}단계</option>`).join('')}</select></label><label>목적지 <select data-counter-destination>${['이동 없음','카페','공원'].map(p=>`<option ${s.destination===p?'selected':''}>${p}</option>`).join('')}</select></label><label>대신 제안할 행동<textarea data-counter-text rows="2" placeholder="예: 공원에서 잠깐 쉬며 이야기하는 건 어때요?">${esc(s.proposal||'')}</textarea></label><p class="demo-small">실제 봇에서는 이 행동을 채팅으로 보냅니다. 여기서는 두 판정 결과를 선택해 확인할 수 있습니다.</p><div class="demo-actions"><button data-rental-choice="counter-yes" class="demo-primary">수락된 경우 보기</button><button data-rental-choice="counter-no">거절된 경우 보기</button></div><button class="demo-text-button" data-rental-counter="cancel">역제안 취소</button></div>`:`<div class="demo-actions"><button data-rental-choice="accept" class="demo-primary">받아들인다</button><button data-rental-choice="refuse">거절한다</button></div><div class="rn-counter-inline"><button data-rental-counter="open">다른 조건으로 역제안 ↗</button><span>오늘 남은 횟수 2회</span></div>`}</div><aside class="rn-demo-sidebar"><p class="demo-eyebrow">A THIRD ANSWER</p><h4>다른 조건을<br>제안할 수도 있습니다.</h4><ol class="demo-steps"><li>1~7단계 중 조건을 고릅니다.</li><li>이동할 장소와 행동을 제안합니다.</li><li>손님이 받으면 원래 요구를 대신합니다.</li></ol><p class="demo-warning">거절되면 원래 요구가 수락됩니다. 역제안은 하루 두 번이며, 제안 자체의 웃돈은 없습니다.</p></aside></div></div>`;
    return `<div class="rental-preview life-preview"><div class="rn-demo-header"><span>YOIMACHI</span><span>생활 상태 · 예시</span></div><div class="rn-demo-grid"><div class="rn-request"><p class="demo-eyebrow">일상의 조건</p><h3>남은 돈과 빚,<br>내일의 일정</h3><dl class="life-stats">${stat('소지금','¥300,000')}${stat('남은 빚','¥2,000,000')}${stat('유저 멘탈','+25')}${stat('외모','+25')}</dl><p class="demo-small">소지금·빚은 시작 설정의 선택값 중 하나를 표시한 예시입니다.</p><div class="week-track">${['월','화','수','목','금','토','일'].map((d,i)=>`<div class="${i===5?'booked':''}"><span>${d}</span><b>${i===5?'14:00':'—'}</b><small>${i===5?'예약':'자유'}</small></div>`).join('')}</div></div><aside class="rn-demo-sidebar"><p class="demo-eyebrow">데이트 후기 · 예시</p><article class="review-example"><div><span>지명 손님의 기록</span><span>★★★★★</span></div><h4>약속한 시간에 와준 사람.</h4><p>처음에는 조건만 확인하려고 했는데, 오늘은 조금 다른 이야기를 했네요. 다음에도 같은 시간에 부탁할게요.</p><small>위 후기는 화면 설명용 예시입니다. 실제 봇은 데이트 전체를 바탕으로 손님 말투의 후기와 댓글을 만듭니다.</small></article><p class="demo-small">보수를 받고 빚을 상환합니다. 손님이 남긴 후기와 평판은 다음 지명에 영향을 줍니다.</p></aside></div></div>`;
  }

  const noteNames={0:'도',2:'레',4:'미',7:'솔'};
  function music(s,project){
    if(s.tab==='relations')return `<div class="music-preview relations-preview"><div class="music-demo-heading"><div><p class="demo-eyebrow">관계 수첩 · 예시</p><h3>인물별 공명도와<br>함께한 기억</h3></div><span class="practice-badge">0—500</span></div><div class="relation-people">${project.characters.map((p,i)=>`<button data-music-person="${i}" aria-pressed="${s.person===i}"><b>${esc(p.name)}</b><span>${stage(s.resonance[i])}</span><strong>${s.resonance[i]}<small>/500</small></strong></button>`).join('')}</div><div class="relation-detail"><div><label class="relation-range">${esc(project.characters[s.person].name)}의 공명도 <output>${s.resonance[s.person]}</output><input data-music-resonance type="range" min="0" max="500" step="25" value="${s.resonance[s.person]}"></label><h4>${stage(s.resonance[s.person])}</h4><div class="resonance-stages">${stages.map(([n,label])=>`<span class="${s.resonance[s.person]>=n?'passed':''}"><b>${n}</b>${label}</span>`).join('')}</div></div><aside class="notebook-example"><p class="demo-eyebrow">관계 수첩 · 예시 항목</p><h4>첫 합주</h4><p>첫 만남부터 약속, 갈등과 화해까지 인물별로 기록합니다.</p><small>위 문장은 수첩의 구조를 보여주는 예시이며, 방문자의 대화 기록을 불러오지 않습니다.</small></aside></div></div>`;
    return `<div class="music-preview practice-preview" data-music-practice><div class="music-demo-heading"><div><p class="demo-eyebrow">PRACTICE ROOM / INTERACTIVE SAMPLE</p><h3>마음의 악보</h3></div><span class="practice-badge">연습 · 공명도 변화 없음</span></div><div class="music-practice-layout"><div class="music-instrument"><div class="music-disc">${s.notes.map((n,i)=>{const rad=(i*360/s.notes.length-90)*Math.PI/180;return `<span class="disc-note" data-note-index="${i}" style="--note-x:${50+40*Math.cos(rad)}%;--note-y:${50+40*Math.sin(rad)}%">${noteNames[n]}</span>`;}).join('')}<div class="disc-center"><span data-music-phase>먼저 듣기</span><strong data-music-note>♪</strong><small data-music-index>8음 · 86 BPM</small><i class="timing-ring" aria-hidden="true"></i></div></div><div class="music-pads" role="group" aria-label="음 건반">${[0,2,4,7].map((n,i)=>`<button data-music-note="${n}" aria-keyshortcuts="${i+1}" disabled><strong>${noteNames[n]}</strong><small>${i+1}</small></button>`).join('')}</div><p class="music-live" data-music-feedback role="status">선율을 들은 뒤 박자에 맞춰 따라 연주해 보세요.</p></div><aside class="music-practice-guide"><p class="demo-eyebrow">LISTEN → REMEMBER → PLAY</p><h4>말보다 먼저,<br>같은 박자로.</h4><p>네 개의 음으로 만든 짧은 즉흥 선율입니다. 들려오는 음과 박자를 기억한 뒤 내 차례에 연주하세요.</p><div class="music-score-legend"><span>±0.10초 <b>공명</b></span><span>±0.18초 <b>울림</b></span><span>±0.24초 <b>여운</b></span></div><div class="demo-actions"><button class="demo-primary" data-music-listen>선율 듣기 ▷</button><button data-music-start disabled>따라 연주</button></div><p class="music-best">이 기기의 최고 기록 <strong data-music-best>${s.best} / 8</strong></p><p class="demo-small">원본의 음·속도·판정 범위를 사용한 8음 연습 샘플입니다. 실제 봇의 112곡과 긴 악보 전체를 포함하지 않으며, 연습은 관계 공명도에 영향을 주지 않습니다.</p></aside></div></div>`;
  }

  window.SystemShowcase={
    render(project,base){
      const items=tabs[project.id];if(!items)return '';
      return window.WorkExperiences.shell(project,base);
    },
    bind(){
      document.querySelectorAll('[data-system-lab]').forEach(root=>bindLab(root));
    }
  };

  function bindLab(root){
    const id=root.dataset.systemLab,project=window.BOT_WORKS.projects.find(p=>p.id===id),panel=root.querySelector('.lab-panel');
    let s=window.WorkExperiences.initial(id,initial(id),project),audio=null;
    const helpers={rental,music,art,stage,bar};
    const clearMusic=()=>{if(s.timers)s.timers.forEach(clearTimeout);if(s.raf)cancelAnimationFrame(s.raf);s.timers=[];s.raf=0;};
    function refresh(focusSelector){
      const oldGauges=new Map([...root.querySelectorAll('.encounter-board [data-battle-target],.encounter-board [data-battle-actor]')].map(e=>[(e.hasAttribute('data-battle-target')?'e':'a')+(e.dataset.battleTarget??e.dataset.battleActor),[...e.querySelectorAll('.journey-gauge i')].map(i=>i.style.width)]));
      panel.innerHTML=window.WorkExperiences.render(s,project,root.dataset.experienceBase,helpers);
      if(id==='music-story')root.dataset.musicPerson=String(s.person);
      if(id==='into-the-abyss'&&document.body.classList.contains('motion-enabled')){
        root.querySelectorAll('.encounter-board [data-battle-target],.encounter-board [data-battle-actor]').forEach(e=>{
          const old=oldGauges.get((e.hasAttribute('data-battle-target')?'e':'a')+(e.dataset.battleTarget??e.dataset.battleActor));
          e.querySelectorAll('.journey-gauge i').forEach((i,n)=>{if(!old?.[n]||old[n]===i.style.width)return;const width=i.style.width;i.style.width=old[n];requestAnimationFrame(()=>requestAnimationFrame(()=>{if(i.isConnected)i.style.width=width;}));});
        });
      }
      if(focusSelector)root.querySelector(focusSelector)?.focus({preventScroll:true});
    }
    function tone(note,time=0){
      const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
      try{audio??=new Audio();if(audio.state==='suspended')audio.resume();const at=audio.currentTime+time,osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.value=261.63*2**(note/12);gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.16,at+.015);gain.gain.exponentialRampToValueAtTime(.001,at+.42);osc.connect(gain);gain.connect(audio.destination);osc.start(at);osc.stop(at+.45);}catch{}
    }
    const later=(fn,ms)=>s.timers.push(setTimeout(fn,ms));
    const musicText=(selector,text)=>{const el=root.querySelector(selector);if(el)el.textContent=text;};
    const light=index=>{root.querySelectorAll('[data-note-index]').forEach((el,i)=>el.classList.toggle('is-current',i===index));musicText('[data-music-note]:not(button)',index<0?'♪':noteNames[s.notes[index]]);musicText('[data-music-index]',index<0?'8음 · 86 BPM':`${index+1} / ${s.notes.length}`);};
    function listen(){
      clearMusic();s.phase='listen';s.judged=[];light(-1);root.querySelectorAll('.is-hit').forEach(e=>e.classList.remove('is-hit'));root.querySelector('[data-music-listen]').disabled=true;root.querySelector('[data-music-start]').disabled=true;root.querySelectorAll('button[data-music-note]').forEach(b=>b.disabled=true);
      musicText('[data-music-phase]','먼저 듣기');musicText('[data-music-feedback]','선율이 먼저 흘러나옵니다. 음과 박자를 기억해 주세요.');
      const beat=60000/86;
      s.notes.forEach((note,i)=>later(()=>{light(i);tone(note);},300+i*beat));
      later(()=>{s.phase='waiting';root.querySelector('[data-music-listen]').disabled=false;root.querySelector('[data-music-start]').disabled=false;musicText('[data-music-phase]','이제 내 차례');musicText('[data-music-feedback]','따라 연주를 누르면 한 박자 뒤에 시작합니다. 건반 또는 숫자 1~4를 사용하세요.');},300+s.notes.length*beat);
    }
    function finish(){
      clearMusic();s.phase='result';light(-1);root.querySelectorAll('button[data-music-note]').forEach(b=>b.disabled=true);root.querySelector('[data-music-listen]').disabled=false;root.querySelector('[data-music-start]').disabled=false;
      const hits=s.judged.filter(x=>x>0).length,perfect=s.judged.filter(x=>x===100).length;
      const result=perfect===s.notes.length?'완전 공명':hits/s.notes.length>=.85?'깊은 공명':hits/s.notes.length>=.6?'옅은 공명':hits/s.notes.length>=.35?'스친 울림':'엇갈림';
      s.best=Math.max(s.best,hits);try{localStorage.setItem('redsea-practice-best-8',String(s.best));}catch{}
      musicText('[data-music-phase]','한 곡의 끝');musicText('[data-music-note]:not(button)',result);musicText('[data-music-index]',`맞은 음 ${hits}/${s.notes.length} · 공명 ${perfect}/${s.notes.length}`);musicText('[data-music-feedback]',`${result}. ${hits}개의 음을 맞췄습니다. 연습 결과는 공명도에 영향을 주지 않습니다.`);musicText('[data-music-best]',`${s.best} / 8`);
    }
    function start(){
      clearMusic();s.phase='play';s.judged=Array(s.notes.length).fill(null);s.start=performance.now()+1000;root.querySelectorAll('.is-hit').forEach(e=>e.classList.remove('is-hit'));root.querySelector('[data-music-listen]').disabled=true;root.querySelector('[data-music-start]').disabled=true;root.querySelectorAll('button[data-music-note]').forEach(b=>b.disabled=false);root.querySelector('button[data-music-note]')?.focus();musicText('[data-music-phase]','이제 내 차례');musicText('[data-music-feedback]','한 박자 뒤, 시작합니다. 음과 박자를 함께 맞춰보세요.');
      const beat=60000/86;
      function frame(){
        if(s.phase!=='play')return;const now=performance.now(),elapsed=now-s.start;
        s.judged.forEach((v,i)=>{if(v===null&&elapsed-i*beat>240)s.judged[i]=0;});
        const next=s.judged.findIndex(v=>v===null);if(next<0){finish();return;}
        light(next);const until=s.start+next*beat-now,scale=Math.max(1,Math.min(1.85,1+until/beat*.85));
        root.querySelector('.timing-ring')?.style.setProperty('--ring-scale',String(scale));
        s.raf=requestAnimationFrame(frame);
      }
      s.raf=requestAnimationFrame(frame);
    }
    function tap(note){
      if(s.phase!=='play')return;tone(note);const now=performance.now(),beat=60000/86;
      const matches=s.notes.map((n,i)=>({n,i,d:Math.abs(now-s.start-i*beat)})).filter(x=>x.n===note&&s.judged[x.i]===null&&x.d<=240).sort((a,b)=>a.d-b.d);
      if(matches.length){const hit=matches[0],points=hit.d<=100?100:hit.d<=180?75:50;s.judged[hit.i]=points;musicText('[data-music-feedback]',`${points===100?'공명':points===75?'울림':'여운'} · ${noteNames[note]}`);root.querySelector(`[data-note-index="${hit.i}"]`)?.classList.add('is-hit');}
      else musicText('[data-music-feedback]','음과 박자를 다시 들어보세요.');
    }
    root.addEventListener('click',event=>{
      const b=event.target.closest('button');if(!b||b.disabled)return;
      if(b.hasAttribute('data-lab-reset')){clearMusic();const best=s.best;s=window.WorkExperiences.initial(id,initial(id),project);if(id==='music-story')s.best=best||0;refresh('[data-lab-reset]');return;}
      if(window.WorkExperiences.click(event,s,project,root,{refresh,clearMusic,helpers})){if(id==='music-story')root.dataset.musicPerson=String(s.person);return;}
      if(b.hasAttribute('data-music-listen'))listen();if(b.hasAttribute('data-music-start'))start();if(b.dataset.musicNote!==undefined)tap(Number(b.dataset.musicNote));
    });
    root.addEventListener('change',event=>{
      const e=event.target;
      if(window.WorkExperiences.change(event,s,project,root,{refresh,clearMusic,helpers}))return;
      if(e.hasAttribute('data-counter-tier'))s.tier=Number(e.value);
      if(e.hasAttribute('data-counter-destination'))s.destination=e.value;
    });
    root.addEventListener('input',event=>{window.WorkExperiences.input(event,s,project,root);if(event.target.hasAttribute('data-counter-text'))s.proposal=event.target.value;});
    root.addEventListener('keydown',event=>{
      if(id==='music-story'&&s.tab==='practice'&&s.phase==='play'&&/^[1-4]$/.test(event.key)&&!event.repeat&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.target.matches('input,textarea,select')){event.preventDefault();tap([0,2,4,7][Number(event.key)-1]);}
    });
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&id==='music-story'&&['listen','play'].includes(s.phase)){clearMusic();s.phase='ready';refresh();}});
    window.addEventListener('pagehide',()=>{clearMusic();audio?.close().catch(()=>{});});
    if(id==='music-story'){try{s.best=Number(localStorage.getItem('redsea-practice-best-8'))||0;}catch{}}
    refresh();
  }
})();
