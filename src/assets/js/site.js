(()=>{
  const base=window.RECIPE_BASE_PATH||'';
  const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if(!reduce && 'IntersectionObserver' in window){
    const ro=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('show');ro.unobserve(e.target)}}),{threshold:.12});
    document.querySelectorAll('.reveal').forEach(el=>ro.observe(el));
    const mo=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('on')}),{threshold:.52});
    document.querySelectorAll('.manifesto-line').forEach(el=>mo.observe(el));
  }else{document.querySelectorAll('.reveal').forEach(el=>el.classList.add('show'));document.querySelectorAll('.manifesto-line').forEach(el=>el.classList.add('on'))}

  const rail=document.getElementById('journalRail');
  const prev=document.getElementById('blogPrev');
  const next=document.getElementById('blogNext');
  if(rail&&prev&&next){
    const step=()=>{const c=rail.querySelector('.post');return c?(c.getBoundingClientRect().width+(parseFloat(getComputedStyle(rail).gap)||0)):rail.clientWidth};
    const state=()=>{const over=rail.scrollWidth>rail.clientWidth+2;rail.classList.toggle('has-overflow',over);prev.disabled=!over||rail.scrollLeft<=2;next.disabled=!over||rail.scrollLeft>=rail.scrollWidth-rail.clientWidth-2};
    prev.addEventListener('click',()=>rail.scrollBy({left:-step(),behavior:'smooth'}));next.addEventListener('click',()=>rail.scrollBy({left:step(),behavior:'smooth'}));rail.addEventListener('scroll',()=>requestAnimationFrame(state),{passive:true});window.addEventListener('resize',state);requestAnimationFrame(state);
  }

  const buttons=[...document.querySelectorAll('.like-btn[data-like-slug]')];
  const bySlug=new Map();
  buttons.forEach(btn=>{const slug=btn.dataset.likeSlug;if(!bySlug.has(slug))bySlug.set(slug,[]);bySlug.get(slug).push(btn)});
  const paint=(slug,count)=>{(bySlug.get(slug)||[]).forEach(btn=>{const s=btn.querySelector('span');if(s)s.textContent=String(count);btn.classList.toggle('liked',localStorage.getItem('recipe-liked-'+slug)==='1')})};
  bySlug.forEach(async(_,slug)=>{try{const r=await fetch(base+'/api/likes/'+encodeURIComponent(slug));if(r.ok){const j=await r.json();paint(slug,j.count||0)}}catch{paint(slug,0)}});
  buttons.forEach(btn=>btn.addEventListener('click',async()=>{const slug=btn.dataset.likeSlug;if(localStorage.getItem('recipe-liked-'+slug)==='1')return;const same=bySlug.get(slug)||[];same.forEach(b=>b.disabled=true);try{const r=await fetch(base+'/api/likes/'+encodeURIComponent(slug),{method:'POST',headers:{'content-type':'application/json'}});if(r.ok){const j=await r.json();localStorage.setItem('recipe-liked-'+slug,'1');paint(slug,j.count||1)}}finally{same.forEach(b=>b.disabled=false)}}));
})();
