import { $, $$, action, storage, share } from '/locales/en/shared/ui.js';

export async function mount(){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let calm=reduce.matches||storage.get('calm-motion',false),escapes=0,caught=0,lastMove=0,progress=0,interval=null;
  $('#app').innerHTML=`<div class="motion-intro"><p class="eyebrow">A SMALL PLAYGROUND FOR USELESS THINGS</p><h1>This interface<br>has <span class="motion-word">personality.</span></h1><p class="lede">It bounces, dodges, and looks terribly busy.<br>Go on. You can touch this one.</p><div class="row section-gap"><label class="toggle-label"><input type="checkbox" id="calm">Calm mode</label><button class="text-button" id="share">Bring a friend ↗</button></div></div><div class="motion-grid"><section class="motion-card chase-card"><div class="row between"><span class="eyebrow">01 / CATCH ME</span><span id="score" class="small counter">0 : 0</span></div><h2>This button has an attitude.</h2><p class="small muted">Harder with a mouse. Keyboard and touch get a fair chance.</p><div class="chase-field" id="chase-field"><button id="escape-button">Go on, click ↗</button><span class="chase-note" id="chase-note">it is plotting something</span></div><p id="chase-result" class="small" aria-live="polite">Persistence wins.</p></section><section class="motion-card spring-card"><p class="eyebrow">02 / SPRING LOADED REALITY</p><h2>It will all fall into place.</h2><p class="small muted">Drag the cards and let go. Or give them a tap.</p><div class="spring-field"><button class="spring-tile tile-one" aria-label="Spring card: skip">skip</button><button class="spring-tile tile-two" aria-label="Spring card: work">work</button><button class="spring-tile tile-three" aria-label="Spring card: bliss">bliss</button></div></section><section class="motion-card waiting-card"><p class="eyebrow">03 / A VERY IMPORTANT PROCESS</p><h2>Making absolutely nothing.</h2><p class="small muted">This is a pretend progress bar. It connects to nothing and downloads nothing.</p><div class="waiting-widget"><div class="waiting-number counter" id="percent">0<span>%</span></div><progress id="waiting" max="100" value="0" aria-label="Pretend progress"></progress><p id="waiting-note" class="small muted" aria-live="polite">Checking for a spare minute.</p></div><button id="wait-start">Start the important process</button></section><section class="motion-card flip-card"><p class="eyebrow">04 / TWO SIDES TO EVERYTHING</p><h2>You will figure it out.</h2><p class="small muted">Tap the card. A different perspective can help.</p><button class="flip-object" id="flip" aria-pressed="false"><span class="flip-front">plan<br><strong>A</strong></span><span class="flip-back">plan<br><strong>B</strong><small>tea first. the rest can wait.</small></span></button></section></div><p class="small muted section-gap">No libraries, remote fonts, or background requests. A little CSS and a good mood.</p>`;
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
    $('#score').textContent=`${caught} : ${escapes}`;$('#chase-note').textContent=escapes>=7?'fine, you win. go ahead.':'nope, over here';
  }
  field.addEventListener('pointermove',dodge);
  button.addEventListener('focus',()=>{button.style.transform='none';});
  action(button,()=>{caught++;escapes=0;button.style.transform='none';$('#score').textContent=`${caught} : 0`;$('#chase-result').textContent='Caught! The button admits defeat.';$('#chase-note').textContent='one more round?';});
  $$('.spring-tile').forEach(tile=>{
    let start=null,moved=false;
    tile.addEventListener('pointerdown',e=>{if(calm)return;start={x:e.clientX,y:e.clientY};moved=false;tile.setPointerCapture(e.pointerId);tile.classList.add('dragging');});
    tile.addEventListener('pointermove',e=>{if(!start||calm)return;const dx=Math.max(-100,Math.min(100,e.clientX-start.x)),dy=Math.max(-90,Math.min(90,e.clientY-start.y));moved ||= Math.abs(dx)+Math.abs(dy)>5;tile.style.transform=`translate(${dx}px,${dy}px) rotate(${dx/6}deg)`;});
    const release=()=>{start=null;tile.classList.remove('dragging');tile.style.transform='';};
    tile.addEventListener('pointerup',release);tile.addEventListener('pointercancel',release);
    tile.addEventListener('click',()=>{if(calm||moved)return;tile.classList.remove('boing');void tile.offsetWidth;tile.classList.add('boing');});
    tile.addEventListener('animationend',()=>tile.classList.remove('boing'));
  });
  const phases=['Checking for a spare minute.','Sorting pixels by height.','Getting the cat’s approval.','Almost. The cat asked for another minute.','Done. Nothing has been successfully made.'];
  action($('#wait-start'),()=>{
    if(interval){clearInterval(interval);interval=null;}
    progress=0;$('#wait-start').dataset.lock='true';$('#wait-start').disabled=true;$('#wait-start').textContent='Very busy…';
    interval=setInterval(()=>{
      if(document.hidden)return;
      progress=Math.min(100,progress+(progress<90?6:progress<99?1:0.25));
      $('#percent').innerHTML=`${Math.floor(progress)}<span>%</span>`;$('#waiting').value=progress;
      $('#waiting-note').textContent=phases[progress>=100?4:progress>=90?3:progress>=55?2:progress>=20?1:0];
      if(progress>=100){clearInterval(interval);interval=null;$('#wait-start').dataset.lock='false';$('#wait-start').disabled=false;$('#wait-start').textContent='Make some more nothing';}
    },120);
  });
  action($('#flip'),()=>{const flipped=$('#flip').getAttribute('aria-pressed')!=='true';$('#flip').setAttribute('aria-pressed',String(flipped));});
  action($('#share'),()=>share(location.href,'Motion Playground','This interface has personality. Try catching the button.'));
  window.addEventListener('pagehide',()=>clearInterval(interval));
}
