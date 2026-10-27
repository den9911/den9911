import { $, $$, action, storage, share } from '/locales/es/shared/ui.js';

export async function mount(){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let calm=reduce.matches||storage.get('calm-motion',false),escapes=0,caught=0,lastMove=0,progress=0,interval=null;
  $('#app').innerHTML=`<div class="motion-intro"><p class="eyebrow">UN PEQUEÑO PATIO PARA COSAS INÚTILES</p><h1>Esta interfaz<br>tiene <span class="motion-word">carácter.</span></h1><p class="lede">Rebota, se escapa y parece muy ocupada.<br>Tócala. Aquí sí se puede.</p><div class="row section-gap"><label class="toggle-label"><input type="checkbox" id="calm">Modo tranquilo</label><button class="text-button" id="share">Invitar a un amigo ↗</button></div></div><div class="motion-grid"><section class="motion-card chase-card"><div class="row between"><span class="eyebrow">01 / ATRÁPAME</span><span id="score" class="small counter">0 : 0</span></div><h2>Este botón tiene carácter.</h2><p class="small muted">Más difícil con ratón. Con teclado o pantalla táctil tienes una oportunidad justa.</p><div class="chase-field" id="chase-field"><button id="escape-button">Venga, pulsa ↗</button><span class="chase-note" id="chase-note">está tramando algo</span></div><p id="chase-result" class="small" aria-live="polite">Gana quien insiste.</p></section><section class="motion-card spring-card"><p class="eyebrow">02 / REALIDAD ELÁSTICA</p><h2>Todo volverá a su sitio.</h2><p class="small muted">Arrastra las tarjetas y suéltalas. O púlsalas.</p><div class="spring-field"><button class="spring-tile tile-one" aria-label="Tarjeta elástica: fuera">fuera</button><button class="spring-tile tile-two" aria-label="Tarjeta elástica: tareas">tareas</button><button class="spring-tile tile-three" aria-label="Tarjeta elástica: calma">calma</button></div></section><section class="motion-card waiting-card"><p class="eyebrow">03 / UN PROCESO MUY IMPORTANTE</p><h2>Preparando absolutamente nada.</h2><p class="small muted">Esta carga es de broma. No se conecta a nada ni descarga nada.</p><div class="waiting-widget"><div class="waiting-number counter" id="percent">0<span>%</span></div><progress id="waiting" max="100" value="0" aria-label="Progreso de broma"></progress><p id="waiting-note" class="small muted" aria-live="polite">Buscando un minuto libre.</p></div><button id="wait-start">Iniciar el proceso importante</button></section><section class="motion-card flip-card"><p class="eyebrow">04 / DOS CARAS DE LA MISMA MONEDA</p><h2>Lo vas a conseguir.</h2><p class="small muted">Pulsa la tarjeta. A veces ayuda mirar desde el otro lado.</p><button class="flip-object" id="flip" aria-pressed="false"><span class="flip-front">plan<br><strong>A</strong></span><span class="flip-back">plan<br><strong>B</strong><small>primero un té. luego ya veremos.</small></span></button></section></div><p class="small muted section-gap">Sin bibliotecas, fuentes externas ni peticiones de fondo. Un poco de CSS y buen humor.</p>`;
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
    $('#score').textContent=`${caught} : ${escapes}`;$('#chase-note').textContent=escapes>=7?'vale, me rindo. pulsa.':'no, por aquí';
  }
  field.addEventListener('pointermove',dodge);
  button.addEventListener('focus',()=>{button.style.transform='none';});
  action(button,()=>{caught++;escapes=0;button.style.transform='none';$('#score').textContent=`${caught} : 0`;$('#chase-result').textContent='¡Atrapado! El botón admite la derrota.';$('#chase-note').textContent='¿otra vez?';});
  $$('.spring-tile').forEach(tile=>{
    let start=null,moved=false;
    tile.addEventListener('pointerdown',e=>{if(calm)return;start={x:e.clientX,y:e.clientY};moved=false;tile.setPointerCapture(e.pointerId);tile.classList.add('dragging');});
    tile.addEventListener('pointermove',e=>{if(!start||calm)return;const dx=Math.max(-100,Math.min(100,e.clientX-start.x)),dy=Math.max(-90,Math.min(90,e.clientY-start.y));moved ||= Math.abs(dx)+Math.abs(dy)>5;tile.style.transform=`translate(${dx}px,${dy}px) rotate(${dx/6}deg)`;});
    const release=()=>{start=null;tile.classList.remove('dragging');tile.style.transform='';};
    tile.addEventListener('pointerup',release);tile.addEventListener('pointercancel',release);
    tile.addEventListener('click',()=>{if(calm||moved)return;tile.classList.remove('boing');void tile.offsetWidth;tile.classList.add('boing');});
    tile.addEventListener('animationend',()=>tile.classList.remove('boing'));
  });
  const phases=['Buscando un minuto libre.','Ordenando píxeles por altura.','Pidiendo la aprobación del gato.','Casi. El gato ha pedido otro minuto.','Listo. No se ha preparado absolutamente nada.'];
  action($('#wait-start'),()=>{
    if(interval){clearInterval(interval);interval=null;}
    progress=0;$('#wait-start').dataset.lock='true';$('#wait-start').disabled=true;$('#wait-start').textContent='Muy ocupado…';
    interval=setInterval(()=>{
      if(document.hidden)return;
      progress=Math.min(100,progress+(progress<90?6:progress<99?1:0.25));
      $('#percent').innerHTML=`${Math.floor(progress)}<span>%</span>`;$('#waiting').value=progress;
      $('#waiting-note').textContent=phases[progress>=100?4:progress>=90?3:progress>=55?2:progress>=20?1:0];
      if(progress>=100){clearInterval(interval);interval=null;$('#wait-start').dataset.lock='false';$('#wait-start').disabled=false;$('#wait-start').textContent='Preparar más nada';}
    },120);
  });
  action($('#flip'),()=>{const flipped=$('#flip').getAttribute('aria-pressed')!=='true';$('#flip').setAttribute('aria-pressed',String(flipped));});
  action($('#share'),()=>share(location.href,'Motion Playground','Esta interfaz tiene carácter. Intenta atrapar el botón.'));
  window.addEventListener('pagehide',()=>clearInterval(interval));
}
