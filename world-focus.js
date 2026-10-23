(() => {
  'use strict';
  if(!document.body.dataset.project)return;
  const main=document.querySelector('#main');
  const titles={
    'rental-danjo':{'#overview h2':'손님이 당신을 빌립니다.','.agency-client .journey-heading h3':'오늘, 누구의 사람이 될까요?','.agency-booking .journey-heading h3':'이 예약을 받을까요?','.agency-date .journey-heading h3':'어디까지 맞춰 줄까요?','.agency-after .journey-heading h3':'만남은 후기로 남습니다.','#places .section-heading h2':'같은 사람도, 장소에 따라 달라집니다.','.rental-event-heading h2':'이 예약은 끝나지 않습니다.'},
    'into-the-abyss':{'#overview h2':'돌아올 곳이 있어야, 내려갈 수 있습니다.','.abyss-passage-copy h2':'원정은 도시에서 시작됩니다.','.guild-assembly .journey-heading h3':'등을 맡길 동료를 고릅니다.','.guild-encounter .journey-heading h3':'적의 다음 수를 먼저 읽습니다.','.abyss-chronicle h2':'살아 돌아온 이야기가 쌓입니다.'},
    'music-story':{'#overview h2':'말이 끝나면, 연주가 시작됩니다.','.recital-introduction .journey-heading h3':'누구와 첫 음을 맞출까요?','.recital-practice .journey-heading h3':'듣고, 따라 치고, 함께 연주합니다.','.recital-notebook .journey-heading h3':'마음에 든 연주는 남겨 둡니다.','.music-campus-caption h2':'연습실 문 너머에, 누군가 있습니다.'},
    'yoo-hyeyeon':{'#overview h2':'헤어지자는 말 다음에도, 대화는 남습니다.','#personal-notes h2':'가까워질수록, 참견도 늘어납니다.','#daily-life h2':'퇴근해도, 오늘은 끝나지 않았습니다.','#relationship-notes h2':'좋아하는 마음과, 남아 있는 기억.','.hyeyeon-event-chapter h2':'중요한 사건은 더 오래 남습니다.','.hyeyeon-memory-chapter h2':'서운했던 일을, 없던 일로 만들지는 않습니다.'}
  }[document.body.dataset.project]||{};
  function fold(selector,label){main.querySelectorAll(selector).forEach(node=>{if(node.closest('.scene-more'))return;const d=document.createElement('details');d.className='scene-more';const s=document.createElement('summary');s.textContent=label;node.before(d);d.append(s,node);});}
  function refresh(){
    for(const [selector,text]of Object.entries(titles))main.querySelectorAll(selector).forEach(n=>{if(n.textContent!==text)n.textContent=text;});
    // Chapters grow with their content now, so a work's own systems stay on the
    // page instead of hiding behind a disclosure. Only the long route reference
    // is still worth folding.
    fold('.location-route','장소와 이동 규칙');
    main.querySelectorAll('.place-directory:not([data-focus-ready])').forEach(n=>{n.dataset.focusReady='';n.open=false;});
    const event=main.querySelector('.rental-event-heading>p:last-child');if(event&&event.textContent!=='포스터를 고르면, 그 손님의 규칙으로 바뀝니다.')event.textContent='포스터를 고르면, 그 손님의 규칙으로 바뀝니다.';
    const sleeve=main.querySelector('.music-sleeve-note>p');if(sleeve&&sleeve.textContent!=='대화가 끝나면, 짧은 선율이 도착합니다.')sleeve.textContent='대화가 끝나면, 짧은 선율이 도착합니다.';
    main.querySelectorAll('.journey-description').forEach(n=>{const text=n.closest('.guild-assembly')?'동료를 골라 아래 전투에 데려가세요.':n.closest('.guild-encounter')?'아군의 행동과 적의 반격이 한 턴씩 이어집니다.':null;if(text&&n.textContent!==text)n.textContent=text;});
    main.querySelectorAll('.scene-panel').forEach(p=>p.dataset.scrollEffect=({'rental-danjo':'paper','into-the-abyss':'depth','music-story':'score','yoo-hyeyeon':'ink'})[document.body.dataset.project]);
  }
  window.WorldFocus={refresh};refresh();
})();
