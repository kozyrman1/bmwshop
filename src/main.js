import './style.css';
import {models,money,newOrder,orderTransition} from './data.js';
const $=(s,p=document)=>p.querySelector(s);
const icons={arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',play:'<path d="m9 5 12 7-12 7z"/>',pause:'<path d="M9 5v14m6-14v14"/>',down:'<path d="M12 4v15m-6-6 6 6 6-6"/>',prev:'<path d="m15 6-6 6 6 6"/>',next:'<path d="m9 6 6 6-6 6"/>',orbit:'<ellipse cx="12" cy="12" rx="10" ry="5"/><ellipse cx="12" cy="12" rx="5" ry="10" transform="rotate(35 12 12)"/>',plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',reset:'<path d="M4 11a8 8 0 1 1 2 6M4 5v6h6"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',truck:'<path d="M2 5h13v12H2zM15 9h4l3 4v4h-7"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',gift:'<path d="M3 8h18v4H3zm2 4v9h14v-9m-7-4v13m0-13H8a3 3 0 1 1 3-3l1 3h4a3 3 0 1 0-3-3z"/>',check:'<path d="m4 12 5 5 11-11"/>'};
const icon=(n,size=22)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[n]}</svg>`;
const stripes='<i class="stripes" aria-hidden="true"><b></b><b></b><b></b></i>';
const brand=`<a class="brand" href="#home" aria-label="M Showroom, главная">${stripes}<span>M<span class="brand-lite"> / SHOWROOM</span></span></a>`;
let index=0,color=0,viewer=null,order=newOrder(),scene='idle',viewPromise;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
$('#app').innerHTML=`
<header class="top"><div class="top-inner">${brand}<nav aria-label="Навигация"><a href="#home" data-nav="home">Главная</a><a href="#catalog" data-nav="catalog">Каталог</a></nav><a class="top-link" href="#catalog">В шоурум ${icon('arrow',18)}</a></div></header>
<main>
<section id="home" class="hero">
  <div class="hero-media"><video id="hero-film" src="/media/drive.mp4" poster="/media/hero.webp" muted loop playsinline preload="none" aria-hidden="true"></video></div>
  <div class="hero-scrim"></div>
  <div class="hero-inner wrap"><div class="hero-copy"><span class="kicker"><i></i> ВИРТУАЛЬНЫЙ АВТОСАЛОН <span class="divider"></span> BMW M</span>
  <h1>Характер<br><em>в движении.</em></h1><p>Три BMW M. Рассмотрите их в 3D, выберите свою и пройдите путь от шоурума до ключей.</p>
  <a class="button primary" href="#catalog">Открыть каталог ${icon('arrow')}</a></div>
  <div class="hero-bottom"><a class="scroll-link" href="#catalog">${icon('down',19)} <span>ИССЛЕДОВАТЬ</span></a><div class="film-control"><span><strong>FILM 01</strong> &nbsp; BMW В ДВИЖЕНИИ</span><button class="round" type="button" id="film-toggle" aria-label="Воспроизвести ролик">${icon('play',17)}</button></div></div></div>
</section>
<section id="catalog" class="catalog wrap">
  <div class="section-head"><div><span class="kicker"><i></i> 01 / ВИРТУАЛЬНЫЙ ГАРАЖ</span><h2>Выберите свой M.</h2></div><p>Три разных характера. Один шоурум.</p></div>
  <div class="model-bar" role="group" aria-label="Модель BMW">${models.map((m,i)=>`<button type="button" class="model-tab" data-model="${i}"><small>0${i+1}</small><span>${m.name}</span><span class="model-code">${m.code}</span></button>`).join('')}</div>
  <div class="showroom">
    <div class="stage" id="stage" aria-label="Трехмерный шоурум"><div id="view"></div><div class="stage-gloss"></div>
      <div class="stage-top"><span><i></i> LIVE 3D <span class="stage-caption">/ M SHOWROOM</span></span><span id="stage-model"></span></div>
      <img class="stage-poster" src="/media/m5.webp" alt="" id="stage-poster">
      <div id="stage-status" role="status"></div>
      <div class="stage-bottom"><span>${icon('orbit',19)} <span id="hint">Перетащите, чтобы вращать</span></span><div class="stage-controls">
      <button class="round" type="button" data-view="minus" aria-label="Отдалить">${icon('minus',17)}</button><button class="round" type="button" data-view="plus" aria-label="Приблизить">${icon('plus',17)}</button><button class="round" type="button" data-view="reset" aria-label="Вернуть исходный ракурс">${icon('reset',17)}</button>
      </div></div></div>
    <article class="car-panel" id="car-panel"></article>
  </div>
  <div class="catalog-foot"><span>Характеристики зависят от комплектации. Цены условные.</span><div><button class="round" id="prev" aria-label="Предыдущая модель">${icon('prev',17)}</button><span id="pagination"></span><button class="round" id="next" aria-label="Следующая модель">${icon('next',17)}</button></div></div>
</section>
</main>
<footer><div class="wrap footer-inner">${brand}<p>Независимая демонстрация. Не является официальным сайтом BMW. <a href="/credits.html">Модели и видео</a></p><a href="#home">Наверх ↑</a></div></footer>
<dialog id="checkout"><div class="dialog-inner"><button class="round close" aria-label="Закрыть оформление">${icon('x',20)}</button><div id="checkout-copy"></div></div></dialog>`;
function selectModel(i){
  index=(i+models.length)%models.length;color=0;const m=models[index];
  $$('.model-tab').forEach((b,j)=>b.setAttribute('aria-pressed',String(j===index)));
  $('#stage-model').textContent=m.code+(m.id==='m5'&&!m.asset?' / ПРОТОТИП':'');
  $('#stage-poster').src='/media/'+m.id+'.webp';
  $('#pagination').textContent=`0${index+1} / 0${models.length}`;
  $('#car-panel').innerHTML=`<span class="kicker"> ${m.edition}</span><h3>${m.name}</h3><p class="car-copy">${m.copy}</p>
    <dl class="stats"><div><dt>Мощность</dt><dd>${m.power} <small>л.с.</small></dd></div><div><dt>0–100 км/ч</dt><dd>${m.accel} <small>с</small></dd></div><div><dt>Макс. скорость</dt><dd>${m.speed} <small>км/ч</small></dd></div></dl>
    <details class="specs"><summary>Все характеристики</summary><dl><div><dt>Двигатель</dt><dd>${m.motor}</dd></div><div><dt>Крутящий момент</dt><dd>${m.torque} Н·м</dd></div><div><dt>Привод</dt><dd>${m.drive}</dd></div><div><dt>С пакетом M Driver’s</dt><dd>${m.max} км/ч</dd></div><div><dt>Транспортный налог</dt><dd>Зависит от региона</dd></div></dl></details>
    <div class="color-row"><div class="swatches" role="group" aria-label="Цвет кузова">${m.colors.map(([hex,n],j)=>`<button type="button" class="swatch" style="--swatch:${hex}" aria-label="${n}" title="${n}" data-color="${j}" aria-pressed="${j===0}"></button>`).join('')}</div><span id="color-label">${m.colors[0][1]}</span></div>
    <div class="price"><small>Ориентир цены</small><strong>${money(m.price)}</strong></div><button class="button primary buy" type="button" id="buy">Купить ${icon('arrow')}</button>`;
  $('#buy').onclick=openOrder;
  $$('.swatch').forEach(b=>b.onclick=()=>{color=Number(b.dataset.color);$$('.swatch').forEach((c,j)=>c.setAttribute('aria-pressed',String(j===color)));$('#color-label').textContent=m.colors[color][1];viewer?.paint(m.colors[color][0]);});
  viewer?.select(m,m.colors[0][0]);
}
function $$(s){return [...document.querySelectorAll(s)]}
function loadView(){
  if(viewPromise)return viewPromise;
  viewPromise=import('./view.js').then(({makeViewer})=>{
    viewer=makeViewer($('#view'), $('#stage-status'),reduced.matches);
    if(viewer){const m=models[index];viewer.select(m,m.colors[color][0]);if(scene!=='idle')viewer.scene(scene);}
    return viewer;
  }).catch(e=>{console.error(e);$('#stage-status').textContent='3D недоступно на этом устройстве';return null});
  return viewPromise;
}
const dialog=$('#checkout');
function openOrder(){order=newOrder();scene='idle';renderOrder();dialog.showModal();viewer?.scene('idle');}
dialog.querySelector('.close').onclick=()=>dialog.close();
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
dialog.addEventListener('close',()=>{scene='idle';viewer?.scene('idle');stageRestore();});
function stageRestore(){if($('#view').parentElement!==$('#stage'))$('#stage').prepend($('#view'))}
const sceneHost=document.createElement('div');
sceneHost.id='order-stage';sceneHost.className='order-stage';
function moveScene(next){
  scene=next;
  sceneHost.append($('#view'));
  const fallback=sceneHost.querySelector('img')||Object.assign(document.createElement('img'),{alt:''});
  fallback.src='/media/'+models[index].id+'.webp';sceneHost.append(fallback);
  viewer?.scene(next);loadView();
}
function renderOrder(){
  const m=models[index], c=$('#checkout-copy');
  const title={method:'Как получите BMW?',details:order.method==='delivery'?'Куда доставить BMW?':'Заберите свой BMW',payment:'Как оплатить?',complete:order.method==='delivery'?'BMW в пути':'BMW ждет вас'}[order.step];
  const lead={method:'Выберите способ получения и посмотрите, как он выглядит в шоуруме.',details:order.method==='delivery'?'BMW заезжает в закрытый автовоз. Введите демонстрационный адрес.':'Фары вспыхнули, лента на месте. Введите имя для демонстрации.',payment:'Выберите вариант для демонстрационного заказа. Деньги не списываются.',complete:order.method==='delivery'?'Автовоз выехал из шоурума в демонстрационной сцене.':'Фары и подарочная лента — ваш BMW готов к выдаче в шоуруме.'}[order.step];
  const step={method:'01',details:'02',payment:'03',complete:'04'}[order.step];
  c.innerHTML=`<span class="kicker"><i></i> ${step} / ${m.name}</span><h2>${title}</h2><p>${lead}</p><div class="scene-slot"></div><div id="order-content"></div><div class="demo-note">Демо-заказ. Данные не отправляются, оплата не проводится.</div>`;
  const body=$('#order-content');
  if(order.step==='method'){
    stageRestore();
    body.innerHTML=`<div class="method-grid"><button type="button" data-method="delivery">${icon('truck',26)}<strong>Доставка</strong><small>Закрытый автовоз</small></button><button type="button" data-method="pickup">${icon('gift',26)}<strong>Самовывоз</strong><small>Выдача в шоуруме</small></button></div>`;
    $$('[data-method]').forEach(b=>b.onclick=()=>{order=orderTransition(order,'method',{method:b.dataset.method});renderOrder();moveScene(order.method==='delivery'?'load':'gift');});
  } else {
    $('.scene-slot',c).append(sceneHost);
    if(order.step==='details'){
      body.innerHTML=`<form id="details-form"><label>Имя<input name="name" maxlength="80" required placeholder="Алексей" autocomplete="off"></label>${order.method==='delivery'?'<div class="address-grid"><label>Город<input name="city" required maxlength="100" placeholder="Москва" autocomplete="off"></label><label>Улица и дом<input name="address" required maxlength="180" placeholder="Лесная, 5" autocomplete="off"></label></div>':''}<div class="form-actions"><button type="button" class="back">Назад</button><button type="submit" class="button primary">К оплате ${icon('arrow')}</button></div></form>`;
      const form=$('#details-form');
      for(const k of ['name','city','address'])if(form.elements[k])form.elements[k].value=order[k];
      form.onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(form));for(const el of [...form.querySelectorAll('input')])if(!el.value.trim()){el.setCustomValidity('Заполните это поле');el.reportValidity();return;}order=orderTransition(order,'details',data);renderOrder();if(order.method==='delivery')moveScene('depart');};
      form.oninput=e=>e.target.setCustomValidity('');
    } else if(order.step==='payment'){
      body.innerHTML=`<form id="payment-form"><div class="payment-options"><label><input type="radio" name="payment" value="На месте" ${order.payment!=='Счет'?'checked':''}> На месте</label><label><input type="radio" name="payment" value="Счет" ${order.payment==='Счет'?'checked':''}> По счету</label></div><div class="form-actions"><button class="back" type="button">Назад</button><button class="button primary" type="submit">Подтвердить демо-заказ ${icon('check',19)}</button></div></form>`;
      $('#payment-form').onsubmit=e=>{e.preventDefault();order=orderTransition(order,'finish',Object.fromEntries(new FormData(e.currentTarget)));renderOrder();};
    } else {
      body.innerHTML=`<p id="receipt" role="status"></p><button type="button" id="done" class="button primary">В каталог ${icon('arrow')}</button>`;
      $('#receipt').textContent=[m.name,order.method==='delivery'?order.city+', '+order.address:'Самовывоз',order.payment==='Счет'?'По счету':'Оплата на месте'].join(' · ');
      $('#done').onclick=()=>dialog.close();
    }
  }
  const back=$('.back',c);if(back)back.onclick=()=>{order=orderTransition(order,'back');renderOrder();if(order.step==='details')moveScene(order.method==='delivery'?'load':'gift');};
}
const film=$('#hero-film'),filmBtn=$('#film-toggle');let filmDesired=!reduced.matches;
function filmUi(){filmBtn.innerHTML=icon(film.paused?'play':'pause',17);filmBtn.setAttribute('aria-label',film.paused?'Воспроизвести ролик':'Поставить ролик на паузу');}
function tryPlay(){film.play().catch(()=>filmUi());}
filmBtn.onclick=()=>{filmDesired=film.paused;if(filmDesired)tryPlay();else film.pause();};
film.addEventListener('play',filmUi);film.addEventListener('pause',filmUi);
new IntersectionObserver(([e])=>{if(e.isIntersecting&&filmDesired)tryPlay();else if(!e.isIntersecting)film.pause()},{threshold:.05}).observe($('.hero'));
new IntersectionObserver(([e])=>{if(e.isIntersecting)loadView()},{rootMargin:'180px'}).observe($('#stage'));
new IntersectionObserver(([e])=>$$('[data-nav]').forEach(a=>{if(a.dataset.nav===(e.isIntersecting?'catalog':'home'))a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')}),{threshold:.32}).observe($('.catalog'));
$$('.model-tab').forEach(b=>b.onclick=()=>{selectModel(Number(b.dataset.model));loadView()});
$$('[data-view]').forEach(b=>b.onclick=()=>loadView().then(v=>v?.control(b.dataset.view)));
$('#prev').onclick=()=>{selectModel(index-1);loadView()};
$('#next').onclick=()=>{selectModel(index+1);loadView()};
selectModel(0);
