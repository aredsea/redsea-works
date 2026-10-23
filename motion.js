(() => {
  'use strict';
  const body=document.body,main=document.querySelector('#main');
  const button=document.querySelector('.motion-toggle'),progress=document.querySelector('.reading-progress span');
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let preference='on',active=false,observer=null,seen=new WeakSet(),frame=0;
  try{preference=localStorage.getItem('bot-works-motion')||'on';}catch{}
  const selector='.rw-work,.rw-film,.rw-note,.system-copy,.film-grid figure,.scene-grid article,.gallery-grid figure';
  function register(){
    if(!observer)return;
    main.querySelectorAll(selector).forEach(element=>{
      if(seen.has(element)||element.hidden||element.closest('[hidden]'))return;
      seen.add(element);
      const siblings=[...element.parentElement.children].filter(item=>item.matches(selector));
      element.style.setProperty('--reveal-delay',`${Math.min(siblings.indexOf(element),3)*75}ms`);
      element.classList.add('reveal-pending');observer.observe(element);
    });
  }
  function paint(){frame=0;if(!active||document.hidden)return;body.classList.toggle('page-scrolled',window.scrollY>30);const length=document.documentElement.scrollHeight-window.innerHeight;progress?.style.setProperty('--progress',String(length>0?Math.max(0,Math.min(1,window.scrollY/length)):0));}
  function scroll(){if(active&&!frame)frame=requestAnimationFrame(paint);}
  function stop(){observer?.disconnect();observer=null;seen=new WeakSet();cancelAnimationFrame(frame);frame=0;window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll);main.querySelectorAll('.reveal-pending').forEach(e=>e.classList.remove('reveal-pending'));}
  function apply(){
    stop();active=preference!=='off'&&!reduced?.matches;
    body.classList.toggle('motion-enabled',active);body.classList.toggle('motion-reduced',!active);document.documentElement.classList.toggle('motion-reduced',!active);
    if(button){button.hidden=false;button.disabled=Boolean(reduced?.matches);button.setAttribute('aria-pressed',String(!active));button.setAttribute('aria-label',active?'움직임 줄이기':'모션 켜기');const label=button.querySelector('.motion-toggle-text');if(label)label.textContent=active?'모션 ON':'모션 OFF';}
    if(!active){progress?.style.removeProperty('--progress');return;}
    if('IntersectionObserver'in window){observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.remove('reveal-pending');entry.target.classList.add('reveal-arrived');observer?.unobserve(entry.target);}),{threshold:0,rootMargin:'0px 0px 24px 0px'});register();}
    window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll,{passive:true});scroll();
  }
  button?.addEventListener('click',()=>{preference=active?'off':'on';try{localStorage.setItem('bot-works-motion',preference);}catch{}apply();});
  reduced?.addEventListener?.('change',apply);document.addEventListener('portfolio:updated',register);
  document.addEventListener('visibilitychange',()=>{body.classList.toggle('motion-paused',document.hidden);if(!document.hidden)scroll();});
  window.addEventListener('pagehide',stop);window.addEventListener('pageshow',event=>{if(event.persisted)apply();});
  document.querySelectorAll('video').forEach(video=>video.addEventListener('play',()=>document.querySelectorAll('video').forEach(other=>{if(other!==video&&!other.paused)other.pause();})));
  apply();
})();
