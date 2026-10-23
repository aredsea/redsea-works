/* GPT-painted UI library. Original character, location and item art stays intact. */
(() => {
  'use strict';
  const glyphs = {'→':0,'←':1,'↑':2,'↓':3,'▷':4,'▶':4,'✕':6,'×':6,'＋':7,'✓':9,'↺':10,'↗':11,'↘':11,'☀':12,'☼':12,'☾':13,'◌':15,'◷':15};
  const token=/[→←↑↓▷▶✕×＋✓↺↗↘☀☼☾◌◷♩♪♫♬✳⌕★]|(?![©®™])\p{Extended_Pictographic}|\uFE0F/gu;
  const excluded='script,style,textarea,option,.ui-icon,.world-prop';
  function icon(index){const s=document.createElement('span');s.className='ui-icon';s.setAttribute('aria-hidden','true');s.style.setProperty('--icon-x',`${index%4*100/3}%`);s.style.setProperty('--icon-y',`${Math.floor(index/4)*100/3}%`);return s;}
  function prop(world,index,extra=''){const s=document.createElement('span');s.className=`world-prop prop-${world} ${extra}`;s.setAttribute('aria-hidden','true');s.style.setProperty('--prop-x',`${index%3*50}%`);s.style.setProperty('--prop-y',`${Math.floor(index/3)*100}%`);return s;}
  function clean(root){
    if(!root?.isConnected)return;
    const nodes=[];
    if(root.nodeType===3)nodes.push(root);
    else {if(root.closest?.(excluded))return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walker.nextNode())nodes.push(walker.currentNode);}
    for(const node of nodes){
      const parent=node.parentElement;if(!parent||parent.closest(excluded))continue;
      let text=node.nodeValue;
      // A named link already describes its destination; diagonal arrows add no information.
      const link=parent.closest('a');
      if(link&&/[↗↘]/.test(text)&&link.textContent.replace(/[↗↘\s]/g,'')){
        text=text.replace(/[↗↘]/g,'');node.nodeValue=text;
      }
      token.lastIndex=0;if(!token.test(text))continue;
      // Multiplication in quantities is content, not an icon.
      if(text.includes('×')&&!parent.closest('button,.lightbox-close')&&text.trim()!=='×')continue;
      if(/★/.test(text)){node.nodeValue=text.replace(/★+/g,stars=>`${stars.length} / 5`);continue;}
      const frag=document.createDocumentFragment();let previous=0;token.lastIndex=0;
      for(const match of text.matchAll(token)){frag.append(document.createTextNode(text.slice(previous,match.index)));const key=match[0];if(/[©®™]/.test(key))frag.append(document.createTextNode(key));else if(key in glyphs)frag.append(icon(glyphs[key]));else if(/[♩♪♫♬]/.test(key))frag.append(prop('music',2,'prop-inline'));previous=match.index+key.length;}
      frag.append(document.createTextNode(text.slice(previous)));node.replaceWith(frag);
    }
  }
  const placements=[
    ['.rental-seal','rental',0,'prop-seal',true],
    ['.rental-desk-copy','rental',1,'prop-chapter'],
    ['.agency-booking .journey-heading','rental',0,'prop-chapter'],
    ['.agency-date .journey-heading','rental',2,'prop-chapter'],
    ['.agency-after .journey-heading','rental',3,'prop-chapter'],
    ['#places .section-heading','rental',4,'prop-chapter'],
    ['.rental-event-heading','rental',5,'prop-chapter'],
    ['.abyss-title','abyss',0,'prop-crest'],
    ['.abyss-passage-copy','abyss',1,'prop-chapter'],
    ['.guild-assembly .journey-heading','abyss',3,'prop-chapter'],
    ['.guild-encounter .journey-heading','abyss',2,'prop-chapter prop-lantern'],
    ['#city-shop .city-heading','abyss',5,'prop-chapter'],
    ['#city-forge .city-heading','abyss',4,'prop-chapter'],
    ['.music-play-seal>span','music',2,'prop-seal',true],
    ['.recital-introduction .journey-heading','music',3,'prop-chapter'],
    ['.recital-practice .journey-heading','music',1,'prop-chapter prop-metronome'],
    ['.recital-notebook .journey-heading','music',0,'prop-chapter'],
    ['.music-campus-caption','music',4,'prop-chapter'],
    ['.project-music #films .section-heading','music',5,'prop-chapter'],
    ['.ice-story-break','hyeyeon',1,'prop-story-key'],
    ['.hyeyeon-personal .hyeyeon-chapter-head','hyeyeon',2,'prop-chapter'],
    ['.hyeyeon-day .hyeyeon-chapter-head','hyeyeon',3,'prop-chapter'],
    ['.hyeyeon-engine .hyeyeon-chapter-head','hyeyeon',5,'prop-chapter'],
    ['.hyeyeon-memory-chapter','hyeyeon',4,'prop-memory']
  ];
  function decorate(){
    for(const [selector,world,index,extra,replace] of placements)document.querySelectorAll(selector).forEach(host=>{
      if(host.querySelector(`:scope>.${extra.split(' ')[0]}`))return;
      const art=prop(world,index,extra);if(replace)host.replaceChildren(art);else host.prepend(art);
      host.classList.add('has-world-prop');
    });
    document.querySelectorAll('.music-score-strip').forEach(n=>n.remove());
  }
  // Event delegation retains original buttons and their labels/state. Newly rendered
  // booking, city and battle controls receive the same icon treatment.
  decorate();clean(document.body);
  let frame=0;const dirty=new Set();
  const observer=new MutationObserver(records=>{for(const r of records){if(r.type==='characterData')dirty.add(r.target);else r.addedNodes.forEach(n=>{if(!n.parentElement?.closest(excluded))dirty.add(n);});}if(!frame&&dirty.size)frame=requestAnimationFrame(()=>{frame=0;const batch=[...dirty];dirty.clear();batch.forEach(clean);decorate();});});
  observer.observe(document.body,{childList:true,characterData:true,subtree:true});
  window.WorldAssets={refresh:()=>{decorate();clean(document.body);}};
})();
