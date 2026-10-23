(() => {
  'use strict';
  if(!document.body.classList.contains('world-detail'))return;
  const main=document.querySelector('#main'),body=document.body;
  body.classList.add('scene-deck-page');
  const selectors={
    'rental-danjo':['.rental-arrival','.rental-reception','#overview','.agency-client','.agency-booking','.agency-date','.agency-after','#places','.rental-event-heading','.rental-event-choices','.rental-event-stage','#films','#artworks','#updates','#play-guide','.next-project'],
    'into-the-abyss':['.abyss-threshold','#overview','.abyss-passage','.torba-arrival','#city-guild','#city-shop','#city-forge','#city-inn','.guild-assembly','.guild-encounter','#city-return','.abyss-chronicle','#films','#artworks','#updates','#play-guide','.next-project'],
    'music-story':['.music-overture','#overview','.recital-introduction','.recital-practice','.recital-notebook','#films','#campus','#scenes','#music-booklet','#updates','#play-guide','.next-project'],
    'yoo-hyeyeon':['.hyeyeon-ice','.ice-story-scene','.ice-full','.hyeyeon-cover','#overview','#personal-notes','#daily-life','#relationship-notes','.hyeyeon-event-chapter','.hyeyeon-memory-chapter','#artworks','#updates','#play-guide','.next-project']
  }[body.dataset.project]||[];
  const engine=main.querySelector('#relationship-notes');
  if(engine){
    const chapter=(cls,title,nodes)=>{const section=document.createElement('section');section.className=cls+' page-width';section.innerHTML='<header class="hyeyeon-chapter-head"><span>RELATIONSHIP STUDY / 개발 중</span><h2>'+title+'</h2></header>';nodes.filter(Boolean).forEach(n=>section.append(n));return section;};
    const events=chapter('hyeyeon-event-chapter','어떤 말은, 오래 남습니다.',[engine.querySelector('.hyeyeon-event-line')]);
    const memories=chapter('hyeyeon-memory-chapter','가까워진 날도,<br>멀어진 날도.',[engine.querySelector('.hyeyeon-memory-pair'),engine.querySelector('.hyeyeon-engine-status')]);
    engine.after(events,memories);
  }
  const archive=main.querySelector('.music-appendix');
  if(archive){archive.open=true;archive.querySelector('summary').addEventListener('click',e=>e.preventDefault());}

  // The chapter counter rides in the chapter nav. Nothing floats over the copy.
  const projectNav=document.querySelector('.project-nav');
  // It sticks under the site header, so it has to start there too.
  if(projectNav&&projectNav!==main.firstElementChild)main.prepend(projectNav);
  if(projectNav&&!projectNav.querySelector('.project-nav-links')){
    const links=document.createElement('span');links.className='project-nav-links';
    while(projectNav.firstChild)links.append(projectNav.firstChild);
    projectNav.append(links);
  }
  const controller=document.createElement('span');controller.className='scene-controls';controller.setAttribute('role','group');controller.setAttribute('aria-label','장면 이동');
  controller.innerHTML='<span class="scene-current-title"></span><span class="scene-page-count" aria-live="polite"></span><button type="button" data-scene-prev aria-label="이전 장면">↑</button><button type="button" data-scene-next aria-label="다음 장면">↓</button>';
  if(main.querySelector('[data-lab-reset]')){const reset=document.createElement('button');reset.type='button';reset.dataset.sceneReset='';reset.setAttribute('aria-label','체험 처음부터 다시');reset.title='체험 처음부터 다시';reset.textContent='↺';controller.append(reset);}
  (projectNav||body).append(controller);

  let panels=[],current=0,queued=0,sceneOffset=0;
  const header=document.querySelector('.site-header');
  const chrome=()=>(header?header.offsetHeight:0)+(projectNav?projectNav.offsetHeight:0);
  const observed=new WeakSet();
  const observer=window.IntersectionObserver?new IntersectionObserver(entries=>{
    let best=null;
    entries.forEach(e=>{
      if(!e.isIntersecting)return;
      e.target.classList.add('has-arrived');
      if(e.intersectionRatio>.3&&(!best||e.intersectionRatio>best.intersectionRatio))best=e;
    });
    if(best){const index=panels.indexOf(best.target);if(index>=0)activate(index);}
  },{rootMargin:'-128px 0px -35% 0px',threshold:[.08,.3,.6,.9]}):null;
  function activate(index){current=index;panels.forEach((p,i)=>p.classList.toggle('is-current',i===index));controller.querySelector('.scene-page-count').textContent=`${String(index+1).padStart(2,'0')} / ${String(panels.length).padStart(2,'0')}`;controller.querySelector('.scene-current-title').textContent=panels[index]?.dataset.sceneTitle||'';controller.querySelector('[data-scene-prev]').disabled=index===0;controller.querySelector('[data-scene-next]').disabled=index===panels.length-1;}
  // A heading assembled from several nodes needs its words kept apart.
  function sceneTitle(heading){if(!heading)return '';let text='';heading.childNodes.forEach(node=>{text+=(node.textContent||'')+' ';});return text.replace(/\s+/g,' ').trim();}
  function decorate(){queued=0;
    const replaced=panels[current]&&!panels[current].isConnected;
    const recital=main.querySelector('.recital-introduction');if(recital)recital.id='characters';
    main.querySelectorAll('.recital-person-copy .recital-people').forEach(people=>people.closest('.recital-partner').prepend(people));
    main.querySelectorAll('.music-practice-guide .demo-actions').forEach(actions=>{const preview=actions.closest('.practice-preview');preview.querySelector('.music-instrument').prepend(actions);});
    selectors.forEach(selector=>main.querySelectorAll(selector).forEach(section=>{
      if(section.parentElement?.classList.contains('scene-panel'))return;
      const panel=document.createElement('div');panel.className='scene-panel';
      const heading=section.querySelector('h1,h2,h3,h4')?.cloneNode(true);heading?.querySelectorAll('br').forEach(br=>br.replaceWith(document.createTextNode(' ')));
      const title=sceneTitle(heading)||section.getAttribute('aria-label')||(section.matches('.ice-story-scene')?section.querySelector(':scope>span')?.textContent:null)||({'rental-event-choices':'아카리와 루리'})[section.className]||'기록';
      panel.dataset.sceneTitle=title.replace(/\s+/g,' ').trim().slice(0,42);
      section.before(panel);panel.append(section);section.classList.add('scene-content');
      if(section.matches('.torba-arrival')){const wallet=panel.nextElementSibling,status=wallet?.nextElementSibling,destinations=status?.nextElementSibling;if(wallet?.classList.contains('city-wallet'))section.append(wallet);if(status?.classList.contains('city-status'))section.append(status);if(destinations?.classList.contains('city-destinations'))section.append(destinations);}
    }));
    const footer=document.querySelector('.site-footer');if(footer&&!footer.closest('.scene-panel')){const panel=document.createElement('div');panel.className='scene-panel scene-end';panel.dataset.sceneTitle='redsea works';footer.classList.add('scene-content');panel.append(footer);main.append(panel);}
    panels=[...main.querySelectorAll('.scene-panel')];panels.forEach(panel=>{const named=sceneTitle(panel.firstElementChild?.querySelector('h1,h2,h3,h4'));if(named)panel.dataset.sceneTitle=named.slice(0,42);if(observer&&!observed.has(panel)){observed.add(panel);observer.observe(panel);}});
    window.WorldFocus?.refresh();
    activate(Math.min(current,panels.length-1));
    if(replaced){const panel=panels[current];if(panel)window.scrollTo({top:panelTop(panel)+sceneOffset,behavior:'instant'});}
  }
  function schedule(){if(!queued)queued=requestAnimationFrame(decorate);}
  decorate();
  new MutationObserver(records=>{if(records.some(r=>r.addedNodes.length||r.removedNodes.length))schedule();}).observe(main,{childList:true,subtree:true});
  function panelTop(panel){return Math.max(0,window.scrollY+panel.getBoundingClientRect().top-chrome());}
  function go(index){const panel=panels[Math.max(0,Math.min(panels.length-1,index))];if(!panel)return;sceneOffset=0;window.scrollTo({top:panelTop(panel),behavior:body.classList.contains('motion-reduced')?'instant':'smooth'});activate(panels.indexOf(panel));}
  window.WorldDeck={goTo(element){decorate();const panel=element?.closest('.scene-panel')||element?.querySelector('.scene-panel');if(panel)go(panels.indexOf(panel));}};
  controller.addEventListener('click',e=>{if(e.target.closest('[data-scene-next]'))go(current+1);if(e.target.closest('[data-scene-prev]'))go(current-1);if(e.target.closest('[data-scene-reset]'))main.querySelector('[data-lab-reset]')?.click();});
  document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const target=document.getElementById(a.hash.slice(1));if(!target)return;const panel=target.closest('.scene-panel')||target.querySelector('.scene-panel');if(!panel)return;e.preventDefault();history.replaceState(null,'',a.hash);const detail=target.closest('details');if(detail)detail.open=true;go(panels.indexOf(panel));});
  document.addEventListener('keydown',e=>{if(e.target.matches('input,textarea,select,button'))return;if(e.key==='PageDown'||e.key==='PageUp'){e.preventDefault();go(current+(e.key==='PageDown'?1:-1));}});
  let motionFrame=0;
  function paintScenes(){motionFrame=0;
    const top=chrome(),height=Math.max(1,window.innerHeight-top),reduced=body.classList.contains('motion-reduced')||window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const max=document.documentElement.scrollHeight-window.innerHeight;
    const bar=document.querySelector('.reading-progress span');if(bar)bar.style.width=`${max>0?Math.min(100,Math.max(0,window.scrollY/max*100)):0}%`;
    if(panels[current])sceneOffset=Math.max(0,window.scrollY-panelTop(panels[current]));
    panels.forEach(panel=>{const rect=panel.getBoundingClientRect(),offset=rect.top>top?rect.top-top:Math.min(0,rect.bottom-top-height);
      const distance=reduced?0:Math.max(-1,Math.min(1,offset/height)),away=Math.abs(distance);
      panel.style.setProperty('--scene-away',away.toFixed(3));panel.style.setProperty('--scene-travel',`${distance*42}px`);panel.style.setProperty('--scene-side',`${distance*58}px`);panel.style.setProperty('--scene-blur',`${away*2.4}px`);panel.style.setProperty('--scene-scale',String(1+away*.035));});
  }
  function queueMotion(){if(!motionFrame)motionFrame=requestAnimationFrame(paintScenes);}
  window.addEventListener('scroll',queueMotion,{passive:true});window.addEventListener('resize',queueMotion);new MutationObserver(queueMotion).observe(body,{attributes:true,attributeFilter:['class']});queueMotion();
  const initial=document.getElementById(location.hash.slice(1));if(initial){const panel=initial.closest('.scene-panel')||initial.querySelector('.scene-panel');if(panel)requestAnimationFrame(()=>go(panels.indexOf(panel)));}
})();
