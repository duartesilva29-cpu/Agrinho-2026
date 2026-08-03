const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
const CAT={html:{label:'HTML'},css:{label:'CSS'},campo:{label:'Campo'}};

/* ===== BARALHO BASE ===== */
const BASE=[
 {q:'O que significa a sigla HTML?',a:'HyperText Markup Language — a linguagem de marcação que estrutura a web.',cat:'html'},
 {q:'Qual tag cria um parágrafo?',a:'A tag <p> — de "paragraph". Todo texto começa por ela!',cat:'html'},
 {q:'Para que serve <a href="...">?',a:'Cria um link (hiperlink!) para outra página ou endereço.',cat:'html'},
 {q:'Qual atributo descreve uma imagem?',a:'O atributo alt — texto alternativo, essencial para acessibilidade.',cat:'html'},
 {q:'Qual tag monta uma lista com bolinhas?',a:'<ul> (lista não ordenada), com cada item dentro de <li>.',cat:'html'},
 {q:'O que o CSS faz na página?',a:'Cuida da apresentação: cores, fontes, espaçamentos e o layout.',cat:'css'},
 {q:'Como mudar a cor de um texto?',a:'Com a propriedade color. Ex.: color: green;',cat:'css'},
 {q:'O que faz border-radius?',a:'Arredonda os cantos dos elementos — de caixas a botões.',cat:'css'},
 {q:'O que o seletor :hover faz?',a:'Aplica estilos quando o mouse passa por cima do elemento.',cat:'css'},
 {q:'Como nosso flashcard gira?',a:'Com transform: rotateY(180deg) dentro de uma cena com perspective!',cat:'css'},
 {q:'O que é rotação de culturas?',a:'Alternar plantações diferentes na mesma área para manter o solo fértil.',cat:'campo'},
 {q:'Por que as abelhas são tão importantes?',a:'Porque polinizam as flores — sem elas, quase não haveria frutos e sementes.',cat:'campo'},
 {q:'O que é compostagem?',a:'Transformar restos orgânicos (cascas, folhas) em adubo rico para a horta.',cat:'campo'},
 {q:'O que é irrigação por gotejamento?',a:'Levar água gota a gota até a raiz, evitando desperdício.',cat:'campo'},
 {q:'O que é controle biológico de pragas?',a:'Usar predadores naturais, como a joaninha, para proteger a plantação.',cat:'campo'}
];

let custom=[];
try{custom=JSON.parse(localStorage.getItem('agrinho2026-cartas')||'[]')}catch(e){custom=[]}
const saveCustom=()=>{try{localStorage.setItem('agrinho2026-cartas',JSON.stringify(custom))}catch(e){}};
const allCards=()=>[...BASE,...custom];

let filter='all', view=[], pos=0, acertos=0;
const rebuild=()=>{const all=allCards();view=all.map((c,i)=>i).filter(i=>filter==='all'||all[i].cat===filter);};
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function draw(pop=true){
  const c=allCards()[view[pos]]; if(!c)return;
  $('#stageQ').textContent=c.q; $('#stageA').textContent=c.a;
  const tag=$('#stageTag'); tag.textContent=CAT[c.cat].label; tag.className='cat-tag t-'+c.cat;
  $('#counter').textContent=`Carta ${pos+1} de ${view.length}`;
  $('#progFill').style.width=((pos+1)/view.length*100)+'%';
  $('#acertosNum').textContent=acertos;
  $('#masteryFill').style.width=Math.min(100,acertos/view.length*100)+'%';
  if(pop){const el=$('#studyCard');el.classList.add('swap');setTimeout(()=>el.classList.remove('swap'),420);}
}
function go(dir){
  if(!view.length)return;
  $('#studyCard').classList.remove('flipped');
  pos=(pos+dir+view.length)%view.length;
  setTimeout(draw,REDUCED?0:330);
}
function mark(ok){
  if(!view.length)return;
  const card=$('#studyCard'); card.classList.remove('flipped');
  if(ok){acertos++;pos=(pos+1)%view.length;toast('✅ Boa! Registrado como aprendido.');}
  else{const idx=view.splice(pos,1)[0];view.push(idx);if(pos>=view.length)pos=0;toast('🔁 Sem problema — a carta voltou para o fim da fila.');}
  setTimeout(draw,REDUCED?0:300);
}

$('#flipBtn').onclick=()=>flip();
$('#studyCard').addEventListener('click',flip);
function flip(){
  $('#studyCard').classList.toggle('flipped');
  $('#flipHint').classList.add('hide');
}
$('#prevBtn').onclick=()=>go(-1);
$('#nextBtn').onclick=()=>go(1);
$('#knownBtn').onclick=()=>mark(true);
$('#reviewBtn').onclick=()=>mark(false);
$('#shuffleBtn').onclick=()=>{
  for(let i=view.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[view[i],view[j]]=[view[j],view[i]];}
  pos=0;$('#studyCard').classList.remove('flipped');draw();toast('🔀 Baralho embaralhado!');
};
$$('.chip').forEach(ch=>ch.onclick=()=>{
  filter=ch.dataset.cat;
  $$('.chip').forEach(x=>x.classList.toggle('on',x===ch));
  $('#studyCard').classList.remove('flipped');
  rebuild();pos=0;setTimeout(()=>draw(false),REDUCED?0:300);
});
document.addEventListener('keydown',e=>{
  if(/INPUT|TEXTAREA|SELECT|BUTTON/.test(e.target.tagName))return;
  if(e.code==='Space'){e.preventDefault();flip();}
  else if(e.key==='ArrowRight')go(1);
  else if(e.key==='ArrowLeft')go(-1);
  else if(e.key.toLowerCase()==='e')mark(true);
  else if(e.key.toLowerCase()==='r')mark(false);
});

/* ===== CONSTRUTOR ===== */
$('#builderForm').addEventListener('submit',e=>{
  e.preventDefault();
  const q=$('#inQ').value.trim(),a=$('#inA').value.trim(),cat=$('#inCat').value;
  if(!q||!a){toast('✏️ Preencha a pergunta e a resposta!');return;}
  custom.push({q,a,cat,custom:true,id:Date.now()});
  saveCustom();e.target.reset();renderCustomList();
  filter='all';$$('.chip').forEach(x=>x.classList.toggle('on',x.dataset.cat==='all'));
  rebuild();pos=view.length-1;$('#studyCard').classList.remove('flipped');draw();
  toast('🌟 Carta criada e adicionada ao baralho!');
  document.querySelector('#estudo').scrollIntoView({behavior:REDUCED?'auto':'smooth'});
});
function renderCustomList(){
  $('#customCount').textContent=custom.length;
  const list=$('#customList');
  if(!custom.length){list.innerHTML='<li class="empty">Nenhuma carta criada ainda — escreva a primeira ao lado! ✍️</li>';return;}
  list.innerHTML=custom.map(c=>`<li class="mini"><span class="cat-tag t-${c.cat}">${CAT[c.cat].label}</span><strong>${esc(c.q)}</strong><em>${esc(c.a)}</em><button class="del" data-id="${c.id}" title="Remover carta" aria-label="Remover carta">✕</button></li>`).join('');
  $$('.del').forEach(d=>d.onclick=()=>{
    custom=custom.filter(c=>c.id!=d.dataset.id);saveCustom();renderCustomList();
    rebuild();if(pos>=view.length)pos=0;draw(false);toast('🗑️ Carta removida do baralho.');
  });
}

/* ===== HERO AUTOMÁTICO ===== */
const HERO=[
 {q:'O que é a tag <p>?',a:'Parágrafo! A base de todo texto na web.'},
 {q:'Por que a abelha é amiga da horta?',a:'Porque poliniza as flores e garante os frutos.'},
 {q:'Como esta carta gira?',a:'Com transform: rotateY(180deg) + perspective.'}
];
let hi=0,ht=[];
const setHero=()=>{$('#heroQ').textContent=HERO[hi].q;$('#heroA').textContent=HERO[hi].a;};
const clearHero=()=>{ht.forEach(clearTimeout);ht=[];};
function heroStep(){
  clearHero();const hc=$('#heroCard');
  hc.classList.add('flipped');
  ht.push(setTimeout(()=>{
    hc.classList.remove('flipped');
    ht.push(setTimeout(()=>{
      hi=(hi+1)%HERO.length;setHero();
      hc.classList.add('swap');setTimeout(()=>hc.classList.remove('swap'),420);
      ht.push(setTimeout(heroStep,2400));
    },700));
  },2600));
}
$('#heroCard').addEventListener('click',()=>{clearHero();$('#heroCard').classList.toggle('flipped');});
$('#heroCard').addEventListener('keydown',e=>{if(e.code==='Enter'){clearHero();$('#heroCard').classList.toggle('flipped');}});
if(!REDUCED){ht.push(setTimeout(heroStep,1900));
  $('#heroWrap').addEventListener('mouseenter',clearHero);
  $('#heroWrap').addEventListener('mouseleave',()=>{clearHero();$('#heroCard').classList.remove('flipped');ht.push(setTimeout(heroStep,1100));});
}else{setHero();}
$('#demoCard').addEventListener('click',()=>$('#demoCard').classList.toggle('flipped'));

/* ===== EFEITOS ===== */
function scramble(el){
  const txt=el.dataset.text;
  if(REDUCED){el.textContent=txt;return;}
  const chars='#<>/\\*+✿§ABC';let frame=0;
  const iv=setInterval(()=>{
    frame++;let out='';
    for(let i=0;i<txt.length;i++){
      if(txt[i]===' '){out+=' ';continue;}
      out+= i<frame/2 ? txt[i] : chars[Math.random()*chars.length|0];
    }
    el.textContent=out;
    if(frame/2>=txt.length){clearInterval(iv);el.textContent=txt;}
  },28);
}
scramble($('#scrambleTitle'));

function countUp(el){
  const target=+el.dataset.count,suf=el.dataset.suffix||'';
  if(REDUCED){el.textContent=target+suf;return;}
  const t0=performance.now(),dur=1400;
  (function f(t){const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);
    el.textContent=Math.round(target*e)+suf;if(p<1)requestAnimationFrame(f);})(t0);
}
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return;
  e.target.classList.add('in');
  if(e.target.classList.contains('stat'))countUp(e.target.querySelector('.n'));
  io.unobserve(e.target);
}),{threshold:.18});
$$('.reveal').forEach(el=>io.observe(el));
$$('.stat').forEach(el=>io.observe(el));

/* copiar código */
$$('.copy').forEach(b=>b.onclick=()=>{
  const code=b.closest('.code').querySelector('pre').innerText;
  if(navigator.clipboard)navigator.clipboard.writeText(code);
  toast('📋 Código copiado! Cole no seu editor.');
  b.textContent='copiado!';setTimeout(()=>b.textContent='copiar',1600);
});

/* toast */
let toastT;
function toast(msg){
  const t=$('#toast');t.textContent=msg;t.classList.add('show');
  clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2600);
}

/* barra de progresso + topbar + nav ativa */
addEventListener('scroll',()=>{
  const h=document.documentElement;
  $('#scrollProg').style.width=(h.scrollTop/(h.scrollHeight-h.clientHeight)*100)+'%';
  $('#topbar').classList.toggle('scrolled',h.scrollTop>10);
},{passive:true});
const secIO=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){
    $$('.nav-links a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id));
  }
}),{rootMargin:'-40% 0px -50% 0px'});
['estudo','construir','tutorial','deques','sobre'].forEach(id=>{const el=document.getElementById(id);if(el)secIO.observe(el);});

/* init */
rebuild();draw(false);renderCustomList();
