import './style.css';
import './showroom.css';
import './experience.css';
import {models,money,newOrder,orderTransition,bodyColors,interiorColors,defaultPaint,payments} from './data.js';
const $=(s,p=document)=>p.querySelector(s);
const icons={arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',play:'<path d="m9 5 12 7-12 7z"/>',pause:'<path d="M9 5v14m6-14v14"/>',down:'<path d="M12 4v15m-6-6 6 6 6-6"/>',prev:'<path d="m15 6-6 6 6 6"/>',next:'<path d="m9 6 6 6-6 6"/>',orbit:'<ellipse cx="12" cy="12" rx="10" ry="5"/><ellipse cx="12" cy="12" rx="5" ry="10" transform="rotate(35 12 12)"/>',plus:'<path d="M12 5v14M5 12h14"/>',minus:'<path d="M5 12h14"/>',reset:'<path d="M4 11a8 8 0 1 1 2 6M4 5v6h6"/>',x:'<path d="m6 6 12 12M18 6 6 18"/>',truck:'<path d="M2 5h13v12H2zM15 9h4l3 4v4h-7"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',gift:'<path d="M3 8h18v4H3zm2 4v9h14v-9m-7-4v13m0-13H8a3 3 0 1 1 3-3l1 3h4a3 3 0 1 0-3-3z"/>',check:'<path d="m4 12 5 5 11-11"/>'};
const icon=(n,size=22)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[n]}</svg>`;
const brand=`<a class="brand" href="/" aria-label="BMW M Showroom, главная"><img class="bmw-roundel" src="/bmw.svg" width="43" height="43" alt=""><span>M<span class="brand-lite"> / SHOWROOM</span></span></a>`;
const catalogPage=/^\/catalog(?:\/|\/index\.html)?$/.test(location.pathname);
const config=Object.fromEntries(models.map(m=>[m.id,{body:defaultPaint[m.id],trim:0}]));
let portrait=false,index=0,viewer=null,order=newOrder(),viewPromise,selection,routeToken=0,viewMode='car',openDoor=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(!catalogPage&&location.hash==='#catalog')location.replace('/catalog/'+location.search);
document.body.classList.toggle('catalog-page',catalogPage);
$('#app').innerHTML=`
<header class="top"><div class="top-inner">${brand}<nav aria-label="Навигация"><a href="/" ${catalogPage?'':'aria-current="page"'}>Главная</a><a href="/catalog/" ${catalogPage?'aria-current="page"':''}>Каталог</a></nav>${catalogPage?'<a class="top-link" href="/credits.html">Источники</a>':`<a class="top-link" href="/catalog/">В шоурум ${icon('arrow',18)}</a>`}</div></header>
<main>
${catalogPage?'':`<section id="home" class="hero">
  <div class="hero-media"><video id="hero-film" src="/media/drive.mp4" poster="/media/hero.webp" muted loop playsinline preload="none" aria-hidden="true"></video></div>
  <div class="hero-scrim"></div>
  <div class="hero-inner wrap"><div class="hero-copy"><span class="kicker"><i></i> ВИРТУАЛЬНЫЙ АВТОСАЛОН <span class="divider"></span> BMW M</span>
  <h1>Характер<br><em>в движении.</em></h1><p>Три BMW M. Рассмотрите их в 3D, выберите свою и пройдите путь от шоурума до ключей.</p>
  <a class="button primary" href="/catalog/">Открыть каталог ${icon('arrow')}</a></div>
  <div class="hero-bottom"><a class="scroll-link" href="/catalog/">${icon('down',19)} <span>ИССЛЕДОВАТЬ</span></a><div class="film-control"><span><strong>FILM 01</strong> &nbsp; BMW В ДВИЖЕНИИ</span><button class="round" type="button" id="film-toggle" aria-label="Воспроизвести ролик">${icon('play',17)}</button></div></div></div>
</section>`}
${catalogPage?`<section id="catalog" class="catalog" aria-label="Каталог BMW M">
  <div class="showroom">
    <div class="stage" id="stage" aria-label="Трехмерный шоурум">
      <div id="view"></div><div id="gallery-markers" aria-label="Автомобили в зале"></div><div class="stage-gloss"></div>
      <div class="stage-top"><span><i></i> M COLLECTION</span><span id="stage-model"></span></div>
      <img class="stage-poster" alt="" id="stage-poster"><span class="portrait-label"><span>СТУДИЙНЫЙ РАКУРС</span></span>
      <div id="stage-status" role="status"></div>

      <div class="stage-bottom">
        <span>${icon('orbit',19)} <span id="hint">Перетащите, чтобы изменить ракурс</span></span>
        <div class="stage-controls">
          <button class="round" type="button" data-view="minus" aria-label="Отдалить">${icon('minus',17)}</button><button class="round" type="button" data-view="plus" aria-label="Приблизить">${icon('plus',17)}</button><button class="round" type="button" data-view="reset" aria-label="Вернуть исходный ракурс">${icon('reset',17)}</button>
        </div>
      </div>
    </div>
    <article class="car-panel" id="car-panel" aria-label="Выбранная модель"></article>
    <div class="experience-actions" aria-label="Режим просмотра">
      <button type="button" data-experience="hall" aria-pressed="false">Обзор зала</button>
      <button type="button" data-experience="door" aria-pressed="false" disabled>Открыть дверь</button>
      <button type="button" data-experience="cockpit" aria-pressed="false" disabled>Сесть за руль</button>
    </div>
  </div>
  <div class="catalog-foot">
    <span class="collection-label">THE M COLLECTION</span>
    <div class="model-bar" role="group" aria-label="Модель BMW">${models.map((m,i)=>`<button type="button" class="model-tab" data-model="${i}"><small>0${i+1} / ${m.code}</small><span>${m.name.replace('BMW ','')}</span></button>`).join('')}</div>
    <div class="catalog-pagination"><button class="round" type="button" id="prev" aria-label="Предыдущая модель">${icon('prev',17)}</button><span id="pagination"></span><button class="round" type="button" id="next" aria-label="Следующая модель">${icon('next',17)}</button></div>
  </div>
</section>`:''}
</main>
${catalogPage?'':`<footer><div class="wrap footer-inner">${brand}<p>Независимая демонстрация. Не является официальным сайтом BMW. <a href="/credits.html">Модели и видео</a></p><a href="/">Наверх ↑</a></div></footer>`}
<dialog id="checkout" aria-labelledby="order-title">
  <div class="checkout-viewport" id="checkout-viewport">
    <div class="checkout-stage" id="checkout-stage"></div><div class="checkout-shade"></div>
    <header class="checkout-top"><span class="checkout-brand"><img src="/bmw.svg" width="38" height="38" alt="BMW"> M SHOWROOM</span><button type="button" class="round close" aria-label="Закрыть оформление">${icon('x',20)}</button></header>
    <div id="checkout-copy" class="checkout-copy"></div>
  </div>
</dialog>`;
function $$(s){return [...document.querySelectorAll(s)]}
function swatches(palette,key,active){
 return palette.map(([hex,label],i)=>`<button type="button" class="swatch" style="--swatch:${hex}" aria-label="${label}" title="${label}" data-${key}="${i}" aria-pressed="${i===active}"></button>`).join('');
}
function refreshControls(){
 const hall=$('[data-experience=hall]'), door=$('[data-experience=door]'), cab=$('[data-experience=cockpit]');
 if(!hall)return;
 const ready=$('#view').dataset.ready==='true';
 hall.disabled=!ready;
 hall.textContent=viewMode==='hall'?'К автомобилю':'Обзор зала';
 hall.setAttribute('aria-pressed',String(viewMode==='hall'));
 cab.disabled=!ready||viewMode==='hall';cab.textContent=viewMode==='cockpit'?'Выйти из салона':'Сесть за руль';
 cab.setAttribute('aria-pressed',String(viewMode==='cockpit'));
 door.disabled=!ready||viewMode!=='car';door.textContent=openDoor?'Закрыть дверь':'Открыть дверь';
 door.setAttribute('aria-pressed',String(openDoor));
 $('#catalog').dataset.viewMode=viewMode;
 $('#hint').textContent=viewMode==='hall'?'Выберите автомобиль в зале':viewMode==='cockpit'?'Перетащите, чтобы осмотреться':'Перетащите, чтобы изменить ракурс';
}
function useLive(){
 if(!portrait)return;
 portrait=false;$('#stage').dataset.portrait='false';
}
function setView(next){
 useLive();
 if(!viewer||$('#view').dataset.ready!=='true')return;
 if(next==='cockpit'&&viewMode!=='cockpit'){
  openDoor=true;viewer.door(true,false);
 }else if(viewMode==='cockpit'){
  openDoor=false;viewer.door(false,false);
 }
 viewMode=next;viewer.view(next);refreshControls();
}
function updateMarkers(points){
 for(const point of points){
  const b=$(`[data-exhibit="${point.id}"]`);
  if(!b)continue;
  b.style.left=point.x+'%';b.style.top=point.y+'%';
  b.hidden=!point.visible;
 }
 if(!points.length)$$('[data-exhibit]').forEach(b=>b.hidden=true);
}
function selectModel(i){
 index=(i+models.length)%models.length;
 const m=models[index],c=config[m.id];
 viewMode='car';openDoor=false;portrait=m.id==='m5';
 $('#stage').dataset.portrait=String(portrait);
 $('#view').dataset.ready='false';
 $$('.model-tab').forEach((b,j)=>b.setAttribute('aria-pressed',String(j===index)));
 $('#stage-model').textContent=`0${index+1} / 0${models.length} — ${m.code}`;
 $('#stage').dataset.car=m.id;
 $('#stage-poster').src='/media/'+m.id+'.webp';
 $('#pagination').textContent=`0${index+1} / 0${models.length}`;
 $('#car-panel').innerHTML=`<div class="car-intro"><span class="kicker">${m.edition}</span><h1>${m.name.replace('BMW ','<span>BMW</span> ')}</h1>
  <dl class="stats"><div><dt>Мощность</dt><dd>${m.power} <small>л.с.</small></dd></div><div><dt>0–100 км/ч</dt><dd>${m.accel} <small>с</small></dd></div><div><dt>Макс. скорость</dt><dd>${m.speed} <small>км/ч</small></dd></div></dl></div>
  <div class="car-config">
  <details class="specs"><summary>Характеристики</summary><dl><div><dt>Двигатель</dt><dd>${m.motor}</dd></div><div><dt>Крутящий момент</dt><dd>${m.torque} Н·м</dd></div><div><dt>Привод</dt><dd>${m.drive}</dd></div><div><dt>С пакетом M Driver’s</dt><dd>${m.max} км/ч</dd></div></dl></details>
  <div class="finish-group"><span class="finish-title">КУЗОВ</span><div class="swatches" role="group" aria-label="Цвет кузова">${swatches(bodyColors,'body',c.body)}</div><span class="finish-label" id="body-label">${bodyColors[c.body][1]}</span></div>
  <div class="finish-group"><span class="finish-title">САЛОН</span><div class="swatches" role="group" aria-label="Цвет салона">${swatches(interiorColors,'trim',c.trim)}</div><span class="finish-label" id="trim-label">${interiorColors[c.trim][1]}</span></div>
  <button class="button primary buy" type="button" id="buy">Оформить демо ${icon('arrow',19)}</button><span class="price-note">Условная цена · ${money(m.price)}</span></div>`;
 $('#buy').onclick=openOrder;
 for(const [key,palette,apply] of [['body',bodyColors,'paint'],['trim',interiorColors,'trim']]){
  const list=$$(`[data-${key}]`);
  for(const b of list)b.onclick=()=>{
   useLive();c[key]=Number(b.dataset[key]);list.forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
   $(`#${key}-label`).textContent=palette[c[key]][1];
   viewer?.[apply](palette[c[key]][0]);
  };
 }
 refreshControls();
 selection=loadView().then(async v=>{
  if(models[index]!==m||!v)return;
  await v.select(m,bodyColors[c.body][0],interiorColors[c.trim][0]);
  if(models[index]===m){
   v.paint(bodyColors[c.body][0]);v.trim(interiorColors[c.trim][0]);refreshControls();
  }
 });
}
function pickModel(id){const i=models.findIndex(m=>m.id===id);if(i>=0){if(i===index)setView('car');else selectModel(i);}}
function loadView(){
 if(!viewPromise)viewPromise=import('./view.js').then(({makeViewer})=>{
  viewer=makeViewer($('#view'),$('#stage-status'),reduced.matches,{models,onPick:pickModel,onMarkers:updateMarkers});
  return viewer;
 }).catch(e=>{console.error(e);$('#stage-status').textContent='3D недоступно. Показан статичный ракурс.';return null});
 return viewPromise;
}
const dialog=$('#checkout');
const sceneHost=$('#checkout-stage');
function openOrder(){
 useLive();order=newOrder();routeToken++;renderOrder();dialog.showModal();
}
function restoreStage(){
 const view=$('#view'),stage=$('#stage');
 if(view&&stage&&view.parentElement!==stage)stage.prepend(view);
 viewer?.scene('idle');viewMode='car';openDoor=false;refreshControls();
}
dialog.querySelector('.close').onclick=()=>dialog.close();
dialog.addEventListener('close',()=>{
 routeToken++;restoreStage();order=newOrder();
 $('#checkout-copy').textContent='';dialog.dataset.phase='';
});
function attachCheckoutScene(){
 sceneHost.classList.add('has-media');
 const m=models[index],view=$('#view');
 sceneHost.style.backgroundImage=`url("/media/${m.id}.webp")`;
 if(view&&view.parentElement!==sceneHost)sceneHost.append(view);
}
async function playOrder(next,expected,transition){
 const token=routeToken;
 attachCheckoutScene();
 await selection;
 if(token!==routeToken||!dialog.open||order.step!==expected)return;
 if(viewer&&$('#view').dataset.ready==='true'){
  const complete=await viewer.scene(next);
  if(!complete)return;
 }else if(!reduced.matches){
  await new Promise(resolve=>setTimeout(resolve,750));
 }
 if(token!==routeToken||!dialog.open||order.step!==expected)return;
 order=orderTransition(order,transition);
 if(transition==='loaded')viewer?.loaded();
 renderOrder();
}
const formFields={
 lastName:['Фамилия','Иванов','family-name',true],
 firstName:['Имя','Алексей','given-name',true],
 middleName:['Отчество','Если есть','additional-name',false],
 city:['Город','Москва','address-level2',true],
 street:['Улица','Лесная','address-line1',true],
 house:['Дом','5','off',true]
};
function field(key){
 const [label,placeholder,autocomplete,required]=formFields[key];
 return `<label>${label}<input name="${key}" maxlength="${key==='house'?25:95}" placeholder="${placeholder}" autocomplete="${autocomplete}" ${required?'required':''}></label>`;
}
function renderOrder(){
 const m=models[index],delivery=order.method==='delivery',c=$('#checkout-copy');
 dialog.dataset.phase=order.step;
 if(order.step==='method')sceneHost.classList.remove('has-media');
 const [number,title,lead]={
  method:['01','Как получите BMW?','Выберите способ получения автомобиля.'],
  loading:['02','Погрузка автомобиля','BMW выезжает из гаража и заезжает в закрытый автовоз.'],
  details:['03',delivery?'Куда доставить BMW?':'Самовывоз из шоурума',delivery?'Автомобиль в автовозе. Укажите адрес и способ оплаты.':'Укажите имя и способ оплаты.'],
  departing:['04','Автовоз выезжает','Ваш BMW покидает шоурум.'],
  complete:['05',delivery?'BMW в пути':'BMW ждёт вас',delivery?'Демонстрационная доставка оформлена.':'Демонстрационный заказ оформлен.']
 }[order.step];
 c.innerHTML=`<span class="kicker"><i></i> ${number} / ${m.name.toUpperCase()}</span><h2 id="order-title" tabindex="-1">${title}</h2><p>${lead}</p><div id="order-content"></div><div class="demo-note">Демо. Данные не отправляются, оплата не списывается.</div>`;
 const body=$('#order-content');
 if(order.step==='method'){
  body.innerHTML=`<div class="method-grid"><button type="button" data-method="delivery">${icon('truck',26)}<strong>Доставка</strong><small>Закрытый автовоз</small></button><button type="button" data-method="pickup">${icon('gift',26)}<strong>Самовывоз</strong><small>Выдача в шоуруме</small></button></div>`;
  for(const b of $$('[data-method]'))b.onclick=()=>{
   order=orderTransition(order,'method',{method:b.dataset.method});renderOrder();
   if(order.method==='delivery')playOrder('load','loading','loaded');
   else{attachCheckoutScene();selection?.then(()=>{if(dialog.open&&order.method==='pickup')viewer?.scene('gift');});}
  };
 }else if(order.step==='details'){
  body.innerHTML=`<form id="details-form"><div class="order-fields"><div class="order-name">${['lastName','firstName','middleName'].map(field).join('')}</div>
   ${delivery?`<div class="order-address">${['city','street','house'].map(field).join('')}</div>`:''}</div>
   <fieldset class="order-payment"><legend>Способ оплаты</legend><div class="payment-options">${payments.map((p,i)=>`<label><input type="radio" name="payment" value="${p}" ${i===0?'checked':''}> ${p}</label>`).join('')}</div></fieldset>
   <button type="submit" class="button primary">Далее ${icon('arrow',19)}</button></form>`;
  const form=$('#details-form');
  form.oninput=e=>e.target.setCustomValidity('');
  form.onsubmit=e=>{
   e.preventDefault();
   for(const el of form.querySelectorAll('input[required]'))if(!el.value.trim()){el.setCustomValidity('Заполните это поле');el.reportValidity();return;}
   const next=orderTransition(order,'submit',Object.fromEntries(new FormData(form)));
   if(next===order)return;
   order=next;renderOrder();
   if(delivery)playOrder('depart','departing','departed');
  };
 }else if(order.step==='complete'){
  body.innerHTML=`<p class="receipt" role="status"></p><button type="button" class="button primary" id="done">В каталог ${icon('arrow',19)}</button>`;
  $('.receipt',body).textContent=[m.name,delivery?[order.city,order.street,order.house].join(', '):'Самовывоз',order.payment].join(' · ');
  $('#done').onclick=()=>dialog.close();
 }else{
  body.innerHTML='<div class="dispatch-progress" role="status" aria-label="Идёт анимация"><i></i></div>';
 }
 if(dialog.open)$('#order-title').focus({preventScroll:true});
}
const film=$('#hero-film'),filmBtn=$('#film-toggle');
if(film){
  let filmDesired=!reduced.matches;
  function filmUi(){filmBtn.innerHTML=icon(film.paused?'play':'pause',17);filmBtn.setAttribute('aria-label',film.paused?'Воспроизвести ролик':'Поставить ролик на паузу');}
  function tryPlay(){film.play().catch(filmUi);}
  filmBtn.onclick=()=>{filmDesired=film.paused;if(filmDesired)tryPlay();else film.pause();};
  film.addEventListener('play',filmUi);film.addEventListener('pause',filmUi);
  new IntersectionObserver(([e])=>{if(e.isIntersecting&&filmDesired)tryPlay();else if(!e.isIntersecting)film.pause()},{threshold:.05}).observe($('.hero'));
}
if(catalogPage){
 $('#gallery-markers').innerHTML=models.map(m=>`<button type="button" data-exhibit="${m.id}" hidden>${m.name} ${icon('arrow',13)}</button>`).join('');
 $$('[data-exhibit]').forEach(b=>b.onclick=()=>pickModel(b.dataset.exhibit));
 $$('.model-tab').forEach(b=>b.onclick=()=>selectModel(Number(b.dataset.model)));
 $$('[data-view]').forEach(b=>b.onclick=()=>{useLive();viewer?.control(b.dataset.view);});
 $('[data-experience=hall]').onclick=()=>setView(viewMode==='hall'?'car':'hall');
 $('[data-experience=cockpit]').onclick=()=>setView(viewMode==='cockpit'?'car':'cockpit');
 $('[data-experience=door]').onclick=()=>{useLive();if(viewer?.door(!openDoor)){openDoor=!openDoor;refreshControls();}};
 $('#view').addEventListener('pointerdown',useLive);
 $('#view').addEventListener('keydown',useLive);
 $('#prev').onclick=()=>selectModel(index-1);
 $('#next').onclick=()=>selectModel(index+1);
 const requested=models.findIndex(m=>m.id===new URLSearchParams(location.search).get('model'));
 selectModel(requested<0?0:requested);
}
