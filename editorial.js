(() => {
 'use strict';
 const body=document.body,wide=window.matchMedia?.('(min-width: 1000px) and (min-height: 720px)');
 let frame=0;
 const scenes=[...document.querySelectorAll('.feature-stage,.project-hero')];
 function update(){frame=0;const enabled=body.classList.contains('motion-enabled')&&wide?.matches&&!document.hidden;for(const scene of scenes){const r=scene.getBoundingClientRect(),value=enabled&&r.bottom>0&&r.top<innerHeight?Math.max(-18,Math.min(18,-r.top*.035)):0;scene.style.setProperty('--media-y',`${value.toFixed(2)}px`);}}
 function schedule(){if(!frame)frame=requestAnimationFrame(update);}
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
 const settings=new MutationObserver(schedule);settings.observe(body,{attributes:true,attributeFilter:['class']});
 document.addEventListener('visibilitychange',schedule);
 const links=[...document.querySelectorAll('.project-nav a')];let sectionObserver,videoObserver;
 if('IntersectionObserver'in window){
  sectionObserver=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;links.forEach(a=>{if(a.hash==='#'+entry.target.id)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}},{rootMargin:'-145px 0px -55% 0px',threshold:0});
  links.forEach(a=>{const target=document.getElementById(a.hash.slice(1));if(target)sectionObserver.observe(target);});
  videoObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting&&!e.target.paused)e.target.pause();}),{threshold:0});document.querySelectorAll('video').forEach(v=>videoObserver.observe(v));
 }
 window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;settings.disconnect();sectionObserver?.disconnect();videoObserver?.disconnect();});
 window.addEventListener('pageshow',event=>{if(!event.persisted)return;settings.observe(body,{attributes:true,attributeFilter:['class']});links.forEach(a=>{const target=document.getElementById(a.hash.slice(1));if(target)sectionObserver?.observe(target);});document.querySelectorAll('video').forEach(v=>videoObserver?.observe(v));schedule();});
 schedule();
})();
