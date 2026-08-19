import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const src=path.join(__dirname,"src"), out=path.join(__dirname,"_site");
const readJSON=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const esc=s=>String(s??"").replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const attr=esc;
const safeUrl=u=>{const s=String(u||"").trim(); return /^(https?:\/\/|\/|\.\.?\/)/i.test(s)?s:"#"};
const fmtDate=s=>{const d=new Date(String(s)+"T00:00:00+09:00"); return new Intl.DateTimeFormat("ja-JP",{year:"numeric",month:"2-digit",day:"2-digit"}).format(d).replaceAll("/",".")};
const slugFromFile=f=>path.basename(f,".json");

function inline(md){
  let s=esc(md);
  s=s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,(_,alt,url)=>`<img src="${attr(safeUrl(url))}" alt="${alt}">`);
  s=s.replace(/\[([^\]]+)\]\(([^)]+)\)/g,(_,text,url)=>`<a href="${attr(safeUrl(url))}">${text}</a>`);
  s=s.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>");
  s=s.replace(/`([^`]+)`/g,"<code>$1</code>");
  return s;
}
function markdown(md){
  const lines=String(md||"").replace(/\r/g,"").split("\n"); let html=[],para=[],list=null;
  const flushP=()=>{if(para.length){html.push(`<p>${inline(para.join(" "))}</p>`);para=[]}};
  const flushL=()=>{if(list){html.push(`</${list}>`);list=null}};
  for(const raw of lines){const line=raw.trimEnd();
    if(!line.trim()){flushP();flushL();continue}
    let m;
    if((m=line.match(/^(#{2,3})\s+(.+)$/))){flushP();flushL();const n=m[1].length;html.push(`<h${n}>${inline(m[2])}</h${n}>`);continue}
    if((m=line.match(/^>\s?(.+)$/))){flushP();flushL();html.push(`<blockquote>${inline(m[1])}</blockquote>`);continue}
    if((m=line.match(/^[-*]\s+(.+)$/))){flushP();if(list!=="ul"){flushL();list="ul";html.push("<ul>")}html.push(`<li>${inline(m[1])}</li>`);continue}
    if((m=line.match(/^\d+\.\s+(.+)$/))){flushP();if(list!=="ol"){flushL();list="ol";html.push("<ol>")}html.push(`<li>${inline(m[1])}</li>`);continue}
    para.push(line.trim());
  }
  flushP();flushL();return html.join("\n");
}
function copyDir(from,to){fs.mkdirSync(to,{recursive:true});for(const ent of fs.readdirSync(from,{withFileTypes:true})){const a=path.join(from,ent.name),b=path.join(to,ent.name);ent.isDirectory()?copyDir(a,b):fs.copyFileSync(a,b)}}
function header(site,home=false){return `<header><div class="container nav"><a class="brand" href="${home?'#top':'/'}">${esc(site.name)}<small>${esc(site.tagline)}</small></a><nav class="navlinks"><a href="${home?'':'/'}#concept">Concept</a><a href="${home?'':'/'}#method">Method</a><a href="${home?'':'/'}#trainer">Trainer</a><a href="${home?'':'/'}#price">Price</a><a href="${home?'':'/'}#visit">Visit</a><a href="${home?'':'/'}#journal">Journal</a><a class="nav-cta" href="${home?'':'/'}#contact">お問い合わせ</a></nav></div></header>`}
function footer(site){return `<footer><div class="container footer-row"><span>${esc(site.name)}</span><span>© ${new Date().getFullYear()} ${esc(site.name)}</span></div></footer>`}
function head(site,title,desc,url,identity=false){return `<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f5f3ed"><title>${esc(title)}</title><meta name="description" content="${attr(desc)}"><link rel="canonical" href="${attr(url)}"><link rel="stylesheet" href="/assets/css/site.css"><script>document.documentElement.classList.add('js')</script>${identity?'<script src="https://identity.netlify.com/v1/netlify-identity-widget.js" defer></script>':''}<script src="/assets/js/site.js" defer></script></head>`}
function card(p){const cover=p.image?`<div class="post-cover has-image"><img src="${attr(safeUrl(p.image))}" alt=""></div>`:`<div class="post-cover"><span>${esc(p.coverLabel||p.category)}</span></div>`;return `<article class="post reveal">${cover}<div class="post-body"><div class="post-meta">${fmtDate(p.date)} / ${esc(p.category)}</div><h3 title="${attr(p.title)}">${esc(p.title)}</h3><p>${esc(p.excerpt)}</p><div class="post-actions"><button class="like-btn" data-like-slug="${attr(p.slug)}">👍 参考になった <span>0</span></button><a class="read-more" href="/journal/${encodeURIComponent(p.slug)}/">記事を読む →</a></div></div></article>`}
function home(site,posts){const plans=site.prices.map(x=>`<article class="plan${x.featured?' featured':''} reveal"><div class="tag">${esc(x.tag)}</div><h3>${esc(x.name)}</h3><div class="price-num">${esc(x.price)} <small>${esc(x.unit)}</small></div><p>${esc(x.description)}</p><div class="bottom">${esc(x.detail)}</div></article>`).join("");const cards=posts.map(card).join("");const mail=site.contact.email?`<div class="mail-line">メール：<a href="mailto:${attr(site.contact.email)}">${esc(site.contact.email)}</a></div>`:"";return `<!doctype html><html lang="ja">${head(site,`${site.name} | ${site.hero.title}`,site.description,site.url+'/',true)}<body>${header(site,true)}<main id="top">
<section class="hero"><div class="hero-media"><img src="${attr(safeUrl(site.hero.image))}" alt="${attr(site.name)} ジム内観"></div><div class="container hero-inner"><div class="eyebrow">${esc(site.hero.eyebrow)}</div><h1 class="serif">${esc(site.hero.title)}</h1><p>${esc(site.hero.lead)}</p><div class="hero-actions"><a class="btn primary" href="#contact">お問い合わせ</a><a class="btn" href="#concept">Recipeを知る</a></div></div><div class="scroll-note">SCROLL</div></section>
<section class="section" id="concept"><div class="container concept-grid reveal"><div><div class="eyebrow">01 / Philosophy</div><h2 class="serif">${esc(site.concept.title)}</h2></div><div class="lead concept-copy"><p>${esc(site.concept.intro)}</p><p><strong>${esc(site.concept.strong)}</strong></p><p>${esc(site.concept.body)}</p></div></div></section>
<section class="manifesto"><div class="container manifesto-stack"><div class="manifesto-line serif"><span class="keep">持ち上げる前に、</span><span class="keep">立ち方から。</span></div><div class="manifesto-line serif accent">鍛えるだけじゃない。</div><div class="manifesto-line serif">身体を理解する。</div><div class="manifesto-line serif accent">それが、Recipe。</div></div></section>
<section class="section method" id="method"><div class="container"><div class="section-head reveal"><div class="eyebrow">02 / Method</div><h2 class="serif">身体が変わる、3つの順番。</h2><p class="lead">Recipeでは、重さよりも先に「どう立つか」「どう支えるか」「どう動くか」を大切にします。</p></div><div class="method-grid"><article class="method-card reveal" data-num="01"><div class="num">01</div><h3 class="serif">重心を知る。</h3><p>身体とウェイトがどこにあるのか。まず、自分がどこに立っているのかを知ることから始めます。</p></article><article class="method-card reveal" data-num="02"><div class="num">02</div><h3 class="serif">姿勢を覚える。</h3><p>力を出す前に、力を受け止められる姿勢をつくる。それがすべてのトレーニングの土台になります。</p></article><article class="method-card reveal" data-num="03"><div class="num">03</div><h3 class="serif">正しく動かす。</h3><p>重心と姿勢が整ったら、実際にウェイトを動かす。フリーウェイトだから得られる感覚を身体に刻みます。</p></article></div></div></section>
<section class="training"><div class="training-photo"><img src="${attr(safeUrl(site.training.image))}" alt="${attr(site.name)} トレーニング指導"></div><div class="training-copy reveal"><div class="eyebrow">Private Training</div><h2 class="serif">${esc(site.training.title)}</h2><p>${esc(site.training.body)}</p></div></section>
<section class="section trainer" id="trainer"><div class="container trainer-grid"><div class="trainer-photo reveal"><img src="${attr(safeUrl(site.trainer.image))}" alt="${attr(site.name)} トレーナー"></div><div class="trainer-copy reveal"><div class="eyebrow">03 / Trainer</div><h2 class="serif">${esc(site.trainer.title)}</h2><p>${esc(site.trainer.body)}</p><div class="stats"><div class="stat"><strong class="serif">${esc(site.trainer.years)}</strong><span>YEARS / トレーナー歴</span></div><div class="stat"><strong class="serif">${esc(site.trainer.core)}</strong><span>CORE STYLE / 指導の中心</span></div><div class="stat"><strong class="serif">${esc(site.trainer.specialty)}</strong><span>WEIGHT / 得意分野</span></div></div></div></div></section>
<section class="section price" id="price"><div class="container"><div class="section-head reveal"><div class="eyebrow">04 / Price</div><h2 class="serif">続け方も、あなたに合わせる。</h2><p class="lead">目的やトレーニング経験に合わせて、無理のないペースから始められます。</p></div><div class="price-grid">${plans}</div><div class="counseling-band reveal"><span class="label">FIRST COUNSELING</span><strong>${esc(site.counseling.title)}</strong><p>${esc(site.counseling.body)}</p></div></div></section>
<section class="section visit" id="visit">
  <div class="container visit-grid">
    <div class="visit-copy reveal">
   <div class="eyebrow">05 / Visit</div>
    <h2 class="serif">通う時間も、トレーニングの一部に。</h2>      
      <p class="lead">${esc(site.visit.lead)}</p>

      <div class="info-list">
        <div class="info-row">
          <span>所在地</span>
          <span>${esc(site.visit.address)}</span>
        </div>

        <div class="info-row">
          <span>アクセス</span>
          <span>${esc(site.visit.access)}</span>
        </div>

        <div class="info-row">
          <span>駐車場</span>
          <span>${esc(site.visit.parking)}</span>
        </div>
      </div>
    </div>

    <div class="map-box reveal">
      <iframe
        title="${attr(site.name)} 周辺マップ"
        src="${attr(safeUrl(site.visit.mapEmbed))}"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        allowfullscreen>
      </iframe>

      <div class="map-card">
        <strong>${esc(site.name)}</strong>
        <span>桑名シティホテル 4F</span>
      </div>
    </div>
  </div>
</section>
<section class="section contact" id="contact"><div class="container"><div class="contact-head reveal"><div class="contact-title-block"><div class="eyebrow">06 / Contact</div><h2 class="serif" style="white-space:nowrap;font-size:clamp(16px,4vw,56px);">まずは、あなたのことを聞かせてください。</h2></div><div class="contact-intro"><p class="lead">${esc(site.contact.lead)}</p>${mail}</div></div><form class="contact-form reveal" name="contact" method="POST" action="/thanks/" data-netlify="true" netlify-honeypot="bot-field"><input type="hidden" name="form-name" value="contact"><p hidden><label>入力しないでください <input name="bot-field"></label></p><div class="contact-form-grid two-col"><div class="field"><label for="name">お名前 *</label><input id="name" name="name" required placeholder="山田 太郎"></div><div class="field"><label for="kana">フリガナ</label><input id="kana" name="kana" placeholder="ヤマダ タロウ"></div></div><div class="contact-form-grid two-col"><div class="field"><label for="email">メールアドレス *</label><input id="email" type="email" name="email" required placeholder="example@email.com"></div><div class="field"><label for="purpose">お問い合わせ内容 *</label><select id="purpose" name="purpose" required><option value="">選択してください</option><option>体験について</option><option>料金について</option><option>トレーニング内容について</option><option>法人・出張トレーニングについて</option><option>その他</option></select></div></div><div class="field message-field"><label for="message">メッセージ *</label><textarea id="message" name="message" required placeholder="ご相談内容をご記入ください"></textarea></div><div class="form-bottom"><button class="submit" type="submit">入力内容を送信する</button><div class="form-note">送信内容はRecipe運営側へ届きます。</div></div></form></div></section>
<section class="final-cta"><div class="container reveal"><div class="eyebrow">Start Your Recipe</div><h2 class="serif">身体が変わると、日常が変わる。</h2><p>正しく立つことから、正しく動くことへ。あなたの身体に合ったRecipeを、一緒に見つけます。</p><a class="btn sage" href="#contact">お問い合わせはこちら</a></div></section>
<section class="journal" id="journal"><div class="container"><div class="journal-head reveal"><div><div class="eyebrow">07 / Journal</div><h2 class="serif">Recipe Journal</h2><p class="lead">身体のことを、もう少し深く知りたい人へ。</p></div><div class="journal-nav" aria-label="ブログを横に移動"><button class="journal-arrow" id="blogPrev" aria-label="前の記事">←</button><button class="journal-arrow" id="blogNext" aria-label="次の記事">→</button></div></div></div><div class="journal-rail" id="journalRail">${cards}</div></section>
</main>${footer(site)}</body></html>`}
function article(site,p){const cover=p.image?`<div class="article-cover"><img src="${attr(safeUrl(p.image))}" alt="${attr(p.title)}"></div>`:"";return `<!doctype html><html lang="ja">${head(site,`${p.title} | ${site.name}`,p.excerpt,`${site.url}/journal/${encodeURIComponent(p.slug)}/`)}<body>${header(site)}<main class="article-page"><section class="article-hero"><div class="container"><div class="eyebrow">${fmtDate(p.date)} / ${esc(p.category)}</div><h1 class="serif">${esc(p.title)}</h1><p class="article-excerpt">${esc(p.excerpt)}</p></div>${cover}</section><article class="article-content">${markdown(p.body)}<div class="article-tools"><button class="like-btn" data-like-slug="${attr(p.slug)}">👍 参考になった <span>0</span></button><a class="back-journal" href="/#journal">← Recipe Journalへ戻る</a></div></article></main>${footer(site)}</body></html>`}
function thanks(site){return `<!doctype html><html lang="ja">${head(site,`お問い合わせありがとうございます | ${site.name}`,site.description,site.url+'/thanks/')}<body>${header(site)}<main class="thanks-page"><div class="thanks-card"><div class="eyebrow">CONTACT SENT</div><h1 class="serif">お問い合わせありがとうございます。</h1><p>内容を確認のうえ、Recipeよりご連絡いたします。</p><a class="btn sage" href="/">トップページへ戻る</a></div></main>${footer(site)}</body></html>`}
function notFound(site){return `<!doctype html><html lang="ja">${head(site,`ページが見つかりません | ${site.name}`,site.description,site.url+'/404.html')}<body><main class="thanks-page"><div class="thanks-card"><div class="eyebrow">404</div><h1 class="serif">ページが見つかりません。</h1><p>URLをご確認いただくか、トップページへお戻りください。</p><a class="btn sage" href="/">トップページへ</a></div></main></body></html>`}

fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
copyDir(path.join(src,"assets"),path.join(out,"assets"));copyDir(path.join(src,"admin"),path.join(out,"admin"));
const site=readJSON(path.join(src,"data/site.json"));
const posts=fs.readdirSync(path.join(src,"posts")).filter(f=>f.endsWith(".json")).map(f=>({...readJSON(path.join(src,"posts",f)),slug:slugFromFile(f)})).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
fs.writeFileSync(path.join(out,"index.html"),home(site,posts));
for(const p of posts){const dir=path.join(out,"journal",p.slug);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,"index.html"),article(site,p))}
fs.mkdirSync(path.join(out,"thanks"),{recursive:true});fs.writeFileSync(path.join(out,"thanks","index.html"),thanks(site));fs.writeFileSync(path.join(out,"404.html"),notFound(site));
const urls=['/',...posts.map(p=>`/journal/${encodeURIComponent(p.slug)}/`),'/thanks/'];
fs.writeFileSync(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${esc(site.url+u)}</loc></url>`).join('')}</urlset>`);
fs.writeFileSync(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);
console.log(`Built ${posts.length} journal pages into ${out}`);
