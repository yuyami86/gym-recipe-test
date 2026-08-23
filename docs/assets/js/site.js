(()=>{
  const menu=document.getElementById('mobileMenu');
  const menuToggle=document.getElementById('menuToggle');
  const menuClose=document.getElementById('menuClose');
  const menuBackdrop=document.getElementById('menuBackdrop');
  const setMenu=open=>{
    if(!menu||!menuToggle||!menuBackdrop)return;
    menu.classList.toggle('open',open);
    menu.setAttribute('aria-hidden',String(!open));
    menuToggle.setAttribute('aria-expanded',String(open));
    menuBackdrop.hidden=!open;
    document.body.classList.toggle('menu-open',open);
  };
  menuToggle?.addEventListener('click',()=>setMenu(menuToggle.getAttribute('aria-expanded')!=='true'));
  menuClose?.addEventListener('click',()=>setMenu(false));
  menuBackdrop?.addEventListener('click',()=>setMenu(false));
  menu?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});

  const contactForm=document.getElementById('contactForm');
  if(contactForm){
    const confirmButton=document.getElementById('confirmContact');
    const review=document.getElementById('contactReview');
    const summary=document.getElementById('contactSummary');
    const editButton=document.getElementById('editContact');
    const sendButton=document.getElementById('sendContact');
    const status=document.getElementById('formStatus');
    const accessKey=contactForm.elements.access_key.value.trim();
    if(accessKey){
      const captcha=document.createElement('div');
      captcha.className='h-captcha';
      captcha.dataset.captcha='true';
      contactForm.querySelector('.privacy-consent')?.before(captcha);
      const captchaScript=document.createElement('script');
      captchaScript.src='https://web3forms.com/client/script.js';
      captchaScript.async=true;
      captchaScript.defer=true;
      document.head.append(captchaScript);
    }
    const showStatus=(text,type='')=>{status.textContent=text;status.className='form-status '+type};
    confirmButton.addEventListener('click',()=>{
      if(!contactForm.reportValidity())return;
      const data=new FormData(contactForm);
      const rows=[['お名前',data.get('name')],['メールアドレス',data.get('email')],['電話番号',data.get('phone')||'未入力'],['お問い合わせ内容',data.get('message')]];
      summary.replaceChildren(...rows.map(([term,value])=>{const wrap=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=term;dd.textContent=String(value);wrap.append(dt,dd);return wrap}));
      review.hidden=false;
      review.scrollIntoView({behavior:'smooth',block:'nearest'});
      showStatus('');
    });
    editButton.addEventListener('click',()=>{review.hidden=true;contactForm.querySelector('input:not([type="hidden"])')?.focus()});
    contactForm.addEventListener('submit',async e=>{
      e.preventDefault();
      if(!contactForm.reportValidity())return;
      if(!accessKey){showStatus('現在フォームの受信設定中です。Instagramまたは公式LINEからお問い合わせください。','error');return}
      sendButton.disabled=true;
      sendButton.textContent='送信中…';
      showStatus('お問い合わせを送信しています。','sending');
      try{
        const object=Object.fromEntries(new FormData(contactForm));
        const response=await fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(object)});
        const result=await response.json();
        if(!response.ok||!result.success)throw new Error(result.message||'送信できませんでした。');
        contactForm.reset();review.hidden=true;showStatus('送信しました。お問い合わせありがとうございます。','success');
      }catch(error){showStatus('送信に失敗しました。時間をおいて再度お試しいただくか、Instagram・公式LINEからご連絡ください。','error')}
      finally{sendButton.disabled=false;sendButton.textContent='この内容で送信する'}
    });
  }
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
  const paint=slug=>{const liked=localStorage.getItem('recipe-liked-'+slug)==='1';(bySlug.get(slug)||[]).forEach(btn=>{const s=btn.querySelector('span');if(s)s.textContent=liked?'1':'0';btn.classList.toggle('liked',liked)})};
  bySlug.forEach((_,slug)=>paint(slug));
  buttons.forEach(btn=>btn.addEventListener('click',()=>{const slug=btn.dataset.likeSlug;if(localStorage.getItem('recipe-liked-'+slug)==='1')return;localStorage.setItem('recipe-liked-'+slug,'1');paint(slug)}));
})();
