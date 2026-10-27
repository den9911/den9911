import { $, $$, action, storage, share } from '/shared/ui.js';

export async function mount(){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let calm=reduce.matches||storage.get('calm-motion',false),escapes=0,caught=0,lastMove=0,progress=0,interval=null;
  $('#app').innerHTML=`<div class="motion-intro"><p class="eyebrow">МАЛЕНЬКАЯ ПЛОЩАДКА ДЛЯ БЕСПОЛЕЗНЫХ ДЕЛ</p><h1>У интерфейса<br>есть <span class="motion-word">характер.</span></h1><p class="lede">Он пружинит, уворачивается и очень занят.<br>Потрогай — здесь можно.</p><div class="row section-gap"><label class="toggle-label"><input type="checkbox" id="calm">Спокойный режим</label><button class="text-button" id="share">Позвать друга ↗</button></div></div><div class="motion-grid"><section class="motion-card chase-card"><div class="row between"><span class="eyebrow">01 / ПОЙМАЙ МЕНЯ</span><span id="score" class="small counter">0 : 0</span></div><h2>Кнопка не в настроении.</h2><p class="small muted">Мышью поймать сложнее. Клавиатурой или пальцем — честный шанс.</p><div class="chase-field" id="chase-field"><button id="escape-button">Ну нажми ↗</button><span class="chase-note" id="chase-note">она что-то задумала</span></div><p id="chase-result" class="small" aria-live="polite">Победит самый настойчивый.</p></section><section class="motion-card spring-card"><p class="eyebrow">02 / РЕЗИНОВАЯ РЕАЛЬНОСТЬ</p><h2>Всё встанет на место.</h2><p class="small muted">Потяни карточки и отпусти. Или нажми на них.</p><div class="spring-field"><button class="spring-tile tile-one" aria-label="Пружинящая карточка: мимо">мимо</button><button class="spring-tile tile-two" aria-label="Пружинящая карточка: дел">дел</button><button class="spring-tile tile-three" aria-label="Пружинящая карточка: кайф">кайф</button></div></section><section class="motion-card waiting-card"><p class="eyebrow">03 / ОЧЕНЬ ВАЖНЫЙ ПРОЦЕСС</p><h2>Готовим ничего.</h2><p class="small muted">Это игрушечная загрузка. Она никуда не подключается и ничего не скачивает.</p><div class="waiting-widget"><div class="waiting-number counter" id="percent">0<span>%</span></div><progress id="waiting" max="100" value="0" aria-label="Шуточная загрузка"></progress><p id="waiting-note" class="small muted" aria-live="polite">Проверяем наличие свободной минутки.</p></div><button id="wait-start">Запустить важный процесс</button></section><section class="motion-card flip-card"><p class="eyebrow">04 / ДВЕ СТОРОНЫ ВОПРОСА</p><h2>У тебя всё получится.</h2><p class="small muted">Нажми на карточку. Иногда полезно посмотреть с другой стороны.</p><button class="flip-object" id="flip" aria-pressed="false"><span class="flip-front">план<br><strong>А</strong></span><span class="flip-back">план<br><strong>Б</strong><small>чай. потом разберёмся.</small></span></button></section></div><p class="small muted section-gap">Никаких библиотек, внешних шрифтов и фоновых запросов. Просто немного CSS и хорошее настроение.</p>`;
  const checkbox=$('#calm'),button=$('#escape-button'),field=$('#chase-field');
  function setCalm(value){calm=value;checkbox.checked=calm;document.body.classList.toggle('calm-motion',calm);storage.set('calm-motion',calm);if(calm){button.style.transform='none';$$('.spring-tile').forEach(tile=>tile.style.transform='');}}
  setCalm(calm);checkbox.addEventListener('change',()=>setCalm(checkbox.checked));reduce.addEventListener('change',e=>{if(e.matches)setCalm(true);});
  function dodge(e){
    if(calm||e.pointerType!=='mouse'||document.activeElement===button||performance.now()-lastMove<260||escapes>=7)return;
    const rect=button.getBoundingClientRect();
    if(Math.hypot(e.clientX-(rect.left+rect.width/2),e.clientY-(rect.top+rect.height/2))>110)return;
    lastMove=performance.now();escapes++;
    const maxX=Math.max(0,field.clientWidth-button.offsetWidth-28),maxY=Math.max(0,field.clientHeight-button.offsetHeight-28);
    button.style.transform=`translate(${Math.round(Math.random()*maxX)}px,${Math.round(Math.random()*maxY)}px)`;
    $('#score').textContent=`${caught} : ${escapes}`;$('#chase-note').textContent=escapes>=7?'ладно, сдаюсь. нажимай.':'не-а, я здесь';
  }
  field.addEventListener('pointermove',dodge);
  button.addEventListener('focus',()=>{button.style.transform='none';});
  action(button,()=>{caught++;escapes=0;button.style.transform='none';$('#score').textContent=`${caught} : 0`;$('#chase-result').textContent='Поймал! Кнопка признаёт твоё превосходство.';$('#chase-note').textContent='можно ещё раз';});
  $$('.spring-tile').forEach(tile=>{
    let start=null,moved=false;
    tile.addEventListener('pointerdown',e=>{if(calm)return;start={x:e.clientX,y:e.clientY};moved=false;tile.setPointerCapture(e.pointerId);tile.classList.add('dragging');});
    tile.addEventListener('pointermove',e=>{if(!start||calm)return;const dx=Math.max(-100,Math.min(100,e.clientX-start.x)),dy=Math.max(-90,Math.min(90,e.clientY-start.y));moved ||= Math.abs(dx)+Math.abs(dy)>5;tile.style.transform=`translate(${dx}px,${dy}px) rotate(${dx/6}deg)`;});
    const release=()=>{start=null;tile.classList.remove('dragging');tile.style.transform='';};
    tile.addEventListener('pointerup',release);tile.addEventListener('pointercancel',release);
    tile.addEventListener('click',()=>{if(calm||moved)return;tile.classList.remove('boing');void tile.offsetWidth;tile.classList.add('boing');});
    tile.addEventListener('animationend',()=>tile.classList.remove('boing'));
  });
  const phases=['Проверяем наличие свободной минутки.','Раскладываем пиксели по росту.','Согласовываем результат с котом.','Почти. Кот попросил ещё минутку.','Готово. Ничего успешно приготовлено.'];
  action($('#wait-start'),()=>{
    if(interval){clearInterval(interval);interval=null;}
    progress=0;$('#wait-start').dataset.lock='true';$('#wait-start').disabled=true;$('#wait-start').textContent='Процесс идёт…';
    interval=setInterval(()=>{
      if(document.hidden)return;
      progress=Math.min(100,progress+(progress<90?6:progress<99?1:0.25));
      $('#percent').innerHTML=`${Math.floor(progress)}<span>%</span>`;$('#waiting').value=progress;
      $('#waiting-note').textContent=phases[progress>=100?4:progress>=90?3:progress>=55?2:progress>=20?1:0];
      if(progress>=100){clearInterval(interval);interval=null;$('#wait-start').dataset.lock='false';$('#wait-start').disabled=false;$('#wait-start').textContent='Приготовить ещё ничего';}
    },120);
  });
  action($('#flip'),()=>{const flipped=$('#flip').getAttribute('aria-pressed')!=='true';$('#flip').setAttribute('aria-pressed',String(flipped));});
  action($('#share'),()=>share(location.href,'Motion Playground','У этого интерфейса есть характер. Попробуй поймать кнопку.'));
  window.addEventListener('pagehide',()=>clearInterval(interval));
}
