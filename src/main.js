import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { createWatch } from './watch.js';

const $=selector=>document.querySelector(selector);
const media=matchMedia('(prefers-reduced-motion: reduce)');
const stage=$('#watch-viewport'),experience=$('#experience');
const icon=id=>`<svg aria-hidden="true"><use href="#i-${id}"/></svg>`;
const PARTS=[
  {id:'crystal',label:'Cristal de safira',title:'A transparência.',material:'Safira',icon:'ring',description:'Uma camada quase invisível. Separe o cristal para descobrir o mostrador sob uma nova perspectiva.'},
  {id:'bezel',label:'Luneta polida',title:'O contorno da luz.',material:'Oystersteel polido',icon:'ring',description:'A luneta lisa acompanha a forma da caixa. Seu acabamento polido transforma a luz em um contorno contínuo.'},
  {id:'dial',label:'Mostrador',title:'O essencial, à vista.',material:'Mostrador preto',icon:'orbit',description:'Índices aplicados, ponteiros finos e um preto profundo. Cada elemento existe para tornar o tempo legível.'},
  {id:'movement',label:'Mecanismo',title:'O coração do tempo.',material:'Calibre 3230 · estudo ilustrativo',icon:'layers',description:'Aproxime-se das engrenagens, pontes e mola espiral. Uma reconstrução artística para explorar o universo mecânico.'},
  {id:'case',label:'Caixa Oyster',title:'Uma forma essencial.',material:'Oystersteel',icon:'ring',description:'Curvas polidas encontram superfícies escovadas. Explore as asas, o perfil da caixa e a coroa de corda.'},
  {id:'bracelet',label:'Pulseira Oyster',title:'Continuidade em aço.',material:'Pulseira de três elos',icon:'layers',description:'Elos articulados percorrem o pulso até o fecho. Gire livremente para ver o acabamento e a construção por trás.'},
  {id:'back',label:'Fundo da caixa',title:'O outro lado.',material:'Fundo rosqueado',icon:'ring',description:'Uma superfície de aço protege o movimento. Isole o fundo e observe seu perfil e acabamento circular.'},
];
const state={screen:'intro',selected:null,explode:0,targetExplode:0,isolated:false,moving:false,focused:false,playing:false,playhead:0,ready:false,failed:false,light:'atelier',inspectorExpanded:false};
let renderer,scene,camera,controls,watch,environment,keyLight,fillLight;
let frame=0,lastTime=0,mechanicalTime=0,dirty=true,cameraTween=null,activeDrag=null,down=null;
const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
const box=new THREE.Box3(),vector=new THREE.Vector3();
const pose={explode:0,openBack:0,time:0,animate:false,focus:0};

$('#parts-list').innerHTML=PARTS.map(p=>`<button class="part-button" data-part="${p.id}" aria-pressed="false">${icon(p.icon)}<span>${p.label}</span><span class="part-dot" aria-hidden="true"></span></button>`).join('');
document.querySelectorAll('[data-part]').forEach(b=>b.addEventListener('click',()=>selectPart(b.dataset.part)));

function announce(text){$('#view-status').textContent=text;}
function paintRange(input){input.style.setProperty('--fill',`${(Number(input.value)-Number(input.min))/(Number(input.max)-Number(input.min))*100}%`);}
document.querySelectorAll('input[type=range]').forEach(paintRange);
function updateUI(){
  experience.dataset.screen=state.screen;
  experience.dataset.inspector=state.inspectorExpanded?'expanded':'collapsed';$('#inspector-toggle').setAttribute('aria-expanded',String(state.inspectorExpanded));
  $('#explore-title').hidden=state.screen!=='explore';
  $('#nav-overview').classList.toggle('active',state.screen==='intro');$('#nav-explore').classList.toggle('active',state.screen==='explore');
  $('#nav-overview').setAttribute('aria-current',state.screen==='intro'?'page':'false');$('#nav-explore').setAttribute('aria-current',state.screen==='explore'?'page':'false');
  $('#explode-toggle').setAttribute('aria-pressed',String(state.targetExplode>.02));$('#explode-toggle span').textContent=state.targetExplode>.02?'Recompor':'Desconstruir';
  $('#explosion').value=String(Math.round(state.targetExplode*100));$('#explosion-value').textContent=`${Math.round(state.targetExplode*100)}%`;paintRange($('#explosion'));
  $('#demo-button').classList.toggle('is-playing',state.playing);$('#demo-button').setAttribute('aria-pressed',String(state.playing));
  $('#demo-label').textContent=state.playing?'Pausar':state.playhead>0&&state.playhead<12?'Continuar':'Ver a montagem';
  $('#demo-progress').style.transform=`scaleX(${state.playhead/12})`;
  $('#isolate-part').setAttribute('aria-pressed',String(state.isolated));$('#isolate-part span').textContent=state.isolated?'Mostrar tudo':'Isolar';
  $('#move-part').setAttribute('aria-pressed',String(state.moving));stage.dataset.moving=String(state.moving);
  $('#inspector-tip').textContent=state.moving?'Arraste a peça. Ajuste a profundidade abaixo.':'Dê dois cliques em uma peça para vê-la de perto.';
  $('#gesture-hint span').textContent=state.moving?'Arraste a peça selecionada para reposicioná-la.':state.screen==='explore'?'Gire, selecione, isole. Explore no seu ritmo.':'Arraste para girar. Aproxime para descobrir.';
  document.querySelectorAll('[data-part]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.part===state.selected)));
  for(const axis of ['x','y','z']){
    const n=watch&&state.selected?watch.offsets[state.selected][axis]:0;
    $(`#offset-${axis}`).value=n;$(`#offset-${axis}-value`).textContent=n.toFixed(1).replace('.',',');paintRange($(`#offset-${axis}`));
  }
}

function stopDemo(reset=false){state.playing=false;if(reset)state.playhead=0;updateUI();dirty=true;wake();}
function setScreen(screen,{separate=true}={}){
  if(!state.ready&&screen==='explore')return;
  const changed=state.screen!==screen;state.screen=screen;
  if(screen==='explore'&&changed){
    if(!state.selected)selectPart('movement',{screen:false});
    watch.root.rotation.set(-.08,-.8,-.12);watch.root.position.x=.6;
    if(separate)state.targetExplode=.85;
    const current=state.explode;state.explode=state.targetExplode;updateModel();fitAll(.85);state.explode=current;updateModel();
  }
  if(screen==='intro'&&changed)resetAll(true);
  updateUI();dirty=true;wake();
}
function selectPart(id,{screen=true}={}){
  if(!watch||!watch.parts[id])return;
  stopDemo();state.selected=id;state.focused=false;
  if(screen&&state.screen!=='explore')setScreen('explore',{separate:false});
  const p=PARTS.find(p=>p.id===id);$('#part-title').textContent=p.title;$('#part-material').textContent=p.material;$('#part-description').textContent=p.description;
  watch.select(id);if(state.isolated)watch.isolate(id);
  updateUI();announce(`${p.label} selecionado. Use Focar, Isolar ou Mover.`);dirty=true;wake();
}

function bounds(object){object.updateWorldMatrix(true,true);box.setFromObject(object);return{center:box.getCenter(new THREE.Vector3()),size:box.getSize(new THREE.Vector3())};}
function beginCamera(position,target,duration=.8){
  cameraTween={fromP:camera.position.clone(),fromT:controls.target.clone(),toP:position.clone(),toT:target.clone(),age:0,duration:media.matches?0:duration};dirty=true;wake();
}
function distanceFor(size,padding=1.2){
  const f=Math.tan(THREE.MathUtils.degToRad(camera.fov*.5));return Math.max(size.y/(2*f),size.x/(2*f*camera.aspect))*padding+size.z*.3;
}
function fitAll(duration=.8){
  if(!watch)return;watch.root.updateMatrixWorld(true);
  const b=bounds(watch.root),d=THREE.MathUtils.clamp(distanceFor(b.size,1.08),8,24);
  const dir=camera.position.clone().sub(controls.target).normalize();beginCamera(b.center.clone().addScaledVector(dir,d),b.center,duration);state.focused=false;
}
function focusSelected(){
  if(!state.selected||!watch)return;
  if(!state.isolated&&['movement','back'].includes(state.selected)&&state.targetExplode<.65){state.targetExplode=.75;updateUI();}
  stopDemo();updateModel();const b=bounds(watch.parts[state.selected]);
  const d=THREE.MathUtils.clamp(distanceFor(b.size,1.35),2.5,22),dir=camera.position.clone().sub(controls.target).normalize();
  beginCamera(b.center.clone().addScaledVector(dir,d),b.center,.85);state.focused=true;announce(`${PARTS.find(p=>p.id===state.selected).label} em foco.`);
}
function resetAll(intro=false){
  if(!watch)return;stopDemo(true);state.targetExplode=state.explode=0;state.isolated=false;state.moving=false;state.focused=false;
  watch.resetOffsets();watch.isolate(null);watch.select(null);cameraTween=null;controls.enabled=true;controls.enableDamping=true;
  watch.root.rotation.set(-.08,-.25,-.16);watch.root.position.set(0,0,0);state.selected=null;
  if(intro)state.screen='intro';else if(state.screen==='explore')selectPart('case',{screen:false});
  updateModel();beginCamera(new THREE.Vector3(0,.15,11.8),new THREE.Vector3(0,0,0),.8);updateUI();announce('Relógio, peças e câmera restaurados.');dirty=true;wake();
}
function setExplosion(value){
  if(!watch)return;stopDemo(true);if(state.screen!=='explore')setScreen('explore',{separate:false});
  state.targetExplode=THREE.MathUtils.clamp(value,0,1);updateUI();dirty=true;wake();
}
$('#explore-start').addEventListener('click',()=>setScreen('explore'));
$('#nav-explore').addEventListener('click',()=>setScreen('explore'));
$('#nav-overview').addEventListener('click',()=>setScreen('intro'));
$('#brand-home').addEventListener('click',()=>{state.screen='intro';resetAll(true);});
$('#explosion').addEventListener('input',e=>setExplosion(Number(e.target.value)/100));
$('#explode-toggle').addEventListener('click',()=>setExplosion(state.targetExplode>.1?0:1));
$('#reset-all').addEventListener('click',()=>resetAll());
$('#focus-part').addEventListener('click',focusSelected);
$('#isolate-part').addEventListener('click',()=>{
  if(!state.selected)return;stopDemo();state.isolated=!state.isolated;watch.isolate(state.isolated?state.selected:null);updateModel();if(state.isolated)focusSelected();else fitAll();updateUI();dirty=true;wake();
});
$('#move-part').addEventListener('click',()=>{if(!state.selected)return;stopDemo();state.moving=!state.moving;state.focused=false;updateUI();});
$('#inspector-toggle').addEventListener('click',()=>{
  state.inspectorExpanded=!state.inspectorExpanded;updateUI();
  if(state.inspectorExpanded&&innerWidth<=760){$('#position-details').open=true;requestAnimationFrame(()=>$('.inspector').scrollTo({top:$('#position-details').offsetTop-34,behavior:media.matches?'auto':'smooth'}));}
});
$('#reset-part').addEventListener('click',()=>{if(state.selected){watch.setOffset(state.selected,0,0,0);updateUI();dirty=true;wake();}});
for(const axis of ['x','y','z'])$(`#offset-${axis}`).addEventListener('input',event=>{
  if(!state.selected)return;const value=Number(event.target.value);stopDemo(true);state.focused=false;const p=watch.offsets[state.selected].clone();p[axis]=value;watch.setOffset(state.selected,p.x,p.y,p.z);updateUI();dirty=true;wake();
});

function angleView(name){
  if(!watch)return;stopDemo();state.focused=false;updateModel();const b=bounds(watch.root);
  const dir=new THREE.Vector3(...(name==='front'?[0,0,1]:name==='side'?[1,0,0]:[0,0,-1])).applyQuaternion(watch.root.quaternion).normalize();
  const d=THREE.MathUtils.clamp(distanceFor(b.size,1.1),9,22);beginCamera(b.center.clone().addScaledVector(dir,d),b.center,.85);
  document.querySelectorAll('[data-angle]').forEach(b=>b.classList.toggle('active',b.dataset.angle===name));
}
document.querySelectorAll('[data-angle]').forEach(b=>b.addEventListener('click',()=>angleView(b.dataset.angle)));
function rotateCamera(direction){
  if(!controls)return;stopDemo();state.focused=false;cameraTween=null;
  const offset=camera.position.clone().sub(controls.target),s=new THREE.Spherical().setFromVector3(offset);s.theta+=direction*Math.PI/10;offset.setFromSpherical(s);beginCamera(controls.target.clone().add(offset),controls.target,.25);
}
function zoomCamera(factor){
  if(!controls)return;stopDemo();cameraTween=null;const p=camera.position.clone().sub(controls.target),distance=THREE.MathUtils.clamp(p.length()*factor,controls.minDistance,controls.maxDistance);p.setLength(distance);beginCamera(controls.target.clone().add(p),controls.target,.25);
}
$('#rotate-left').addEventListener('click',()=>rotateCamera(-1));$('#rotate-right').addEventListener('click',()=>rotateCamera(1));
$('#zoom-in').addEventListener('click',()=>zoomCamera(.8));$('#zoom-out').addEventListener('click',()=>zoomCamera(1.25));
stage.addEventListener('keydown',event=>{
  if(!state.ready)return;const key=event.key;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-','Home'].includes(key))event.preventDefault();else return;
  if(key==='Home'){resetAll();return;}if(key==='+'||key==='='){zoomCamera(.8);return;}if(key==='-'){zoomCamera(1.25);return;}
  if(state.moving&&state.selected){
    const p=watch.offsets[state.selected].clone(),d=.15;if(key==='ArrowLeft')p.x-=d;if(key==='ArrowRight')p.x+=d;if(key==='ArrowUp')p.y+=d;if(key==='ArrowDown')p.y-=d;
    p.clampScalar(-4,4);watch.setOffset(state.selected,p.x,p.y,p.z);state.focused=false;updateUI();dirty=true;wake();return;
  }
  if(key==='ArrowLeft'||key==='ArrowRight')rotateCamera(key==='ArrowLeft'?-1:1);
  else{stopDemo();state.focused=false;const s=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));s.phi=THREE.MathUtils.clamp(s.phi+(key==='ArrowUp'?-.15:.15),.1,Math.PI-.1);beginCamera(controls.target.clone().add(new THREE.Vector3().setFromSpherical(s)),controls.target,.25);}
});

function ray(event){
  const r=renderer.domElement.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);return raycaster;
}
function pick(event){
  ray(event);const objects=Object.values(watch.parts).filter(o=>o.visible);const hits=raycaster.intersectObjects(objects,true);
  return hits.find(h=>h.object.userData.partId&&!(h.object.userData.partId==='crystal'&&h.object.material.opacity<.1&&!(state.moving&&state.selected==='crystal')))?.object.userData.partId||null;
}
function bindGestures(){
  const canvas=renderer.domElement;
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;down={x:event.clientX,y:event.clientY,id:event.pointerId};
    if(state.moving){const id=pick(event);if(!id)return;
      selectPart(id);state.focused=false;cameraTween=null;const center=bounds(watch.parts[id]).center;
      const plane=new THREE.Plane().setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()),center);
      const point=ray(event).ray.intersectPlane(plane,new THREE.Vector3());if(!point)return;
      const inverse=watch.root.matrixWorld.clone().invert();activeDrag={id,plane,inverse,start:point.clone().applyMatrix4(inverse),offset:watch.offsets[id].clone(),pointer:event.pointerId};
      controls.enabled=false;canvas.setPointerCapture(event.pointerId);event.stopImmediatePropagation();
    }
  },true);
  canvas.addEventListener('pointermove',event=>{
    if(activeDrag){
      const p=ray(event).ray.intersectPlane(activeDrag.plane,new THREE.Vector3());if(!p)return;
      p.applyMatrix4(activeDrag.inverse).sub(activeDrag.start).add(activeDrag.offset).clampScalar(-4,4);
      watch.setOffset(activeDrag.id,p.x,p.y,p.z);updateUI();dirty=true;wake();event.stopImmediatePropagation();
    }else if(!down){canvas.style.cursor=state.moving?'move':pick(event)?'pointer':'grab';}
  },true);
  const release=event=>{
    if(activeDrag){activeDrag=null;controls.enabled=true;down=null;return;}
    if(down&&Math.hypot(event.clientX-down.x,event.clientY-down.y)<5&&event.button===0){const id=pick(event);if(id)selectPart(id);}
    down=null;
  };
  canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',()=>{activeDrag=null;down=null;controls.enabled=true;});
  canvas.addEventListener('dblclick',event=>{const id=pick(event);if(id){selectPart(id);focusSelected();}});
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
}

function toggleDemo(){
  if(!watch)return;if(state.playing){stopDemo();return;}
  if(state.playhead===0||state.playhead>=12){
    state.playhead=0;watch.resetOffsets();state.isolated=false;state.moving=false;watch.isolate(null);state.screen='explore';state.selected='movement';selectPart('movement',{screen:false});
  }
  state.focused=false;cameraTween=null;state.playing=true;updateUI();announce('Filme de montagem iniciado. Interaja a qualquer momento para pausar.');wake();
}
$('#demo-button').addEventListener('click',toggleDemo);$('#intro-demo').addEventListener('click',toggleDemo);
function demoPose(t){
  const smooth=THREE.MathUtils.smootherstep;let e,focus;
  if(t<2){e=0;focus=0;}else if(t<5){e=smooth(t,2,4.8);focus=0;}else if(t<8.8){e=1;focus=smooth(t,5,6.8);}else{const a=smooth(t,8.8,12);e=1-a;focus=1-a;}
  state.explode=state.targetExplode=e;watch.root.rotation.set(-.08,-.25-e*.6,-.15);watch.root.position.set(e*.7,0,0);updateModel();
  const all=bounds(watch.root),part=bounds(watch.parts.movement),target=all.center.clone().lerp(part.center,focus);
  controls.target.copy(target);camera.position.copy(target).add(new THREE.Vector3(0,.15,THREE.MathUtils.lerp(14,6.3,focus)));controls.update();
}

const guide=$('#guide'),gallery=$('#references');
$('#help-open').addEventListener('click',()=>{stopDemo();guide.showModal();});$('#help-close').addEventListener('click',()=>guide.close());
$('#references-open').addEventListener('click',()=>{stopDemo();gallery.showModal();});$('#references-close').addEventListener('click',()=>gallery.close());
for(const dialog of [guide,gallery])dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
const refs=[
  ['angle','Três quartos','Rolex Oyster Perpetual visto em três quartos','Caixa polida, mostrador preto e pulseira Oyster.','swiss'],
  ['front','Mostrador','Rolex Oyster Perpetual visto de frente','Mostrador preto, índices aplicados e luneta lisa.','swiss'],
  ['profile','Perfil e coroa','Perfil da caixa e da coroa Oyster Perpetual','As curvas da caixa, a luneta e a coroa de corda.','watchclub'],
  ['back','Verso e fecho','Verso, fundo da caixa e fecho da pulseira','O fundo fechado e o encontro dos elos no fecho.','swiss'],
  ['bracelet','Pulseira','Pulseira Oyster aberta vista por baixo','A construção articulada dos três elos e do fecho.','swiss'],
  ['dial','Índices e detalhes','Macrofotografia de um índice aplicado no mostrador','Luz, profundidade e acabamento no mostrador.','swiss'],
  ['movement','Movimento real','Fotografia do calibre Rolex 3230 com a caixa aberta','Referência real do calibre; a versão 3D é uma reconstrução artística.','swiss'],
];
const sourceURLs={swiss:'https://www.swisswatchexpo.com/watches/rolex-oyster-perpetual-41-steel-black-dial-mens-watch-124300-box-card-81693/',watchclub:'https://www.watchclub.com/rolex/oyster-perpetual/124300-box-and-certificate-ref-124300-year-2022'};
$('#reference-list').innerHTML=refs.map(([id,title],i)=>`<button data-ref="${id}" aria-pressed="${i===0}"><img src="/assets/reference/${id}.jpg" alt="" loading="lazy"/><span>${title}</span></button>`).join('');
document.querySelectorAll('[data-ref]').forEach(b=>b.addEventListener('click',()=>{
  const [id,,alt,caption,source]=refs.find(r=>r[0]===b.dataset.ref);$('#reference-image').src=`/assets/reference/${id}.jpg`;$('#reference-image').alt=alt;$('#reference-caption').textContent=caption;$('#reference-source').href=sourceURLs[source];document.querySelectorAll('[data-ref]').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));
}));

function updateModel(){
  if(!watch)return;pose.explode=state.explode;pose.time=mechanicalTime;pose.animate=!media.matches;pose.openBack=0;pose.focus=0;
  watch.update(pose);watch.root.updateMatrixWorld(true);
}
function resize(){
  if(!renderer||!camera)return;const r=stage.getBoundingClientRect();renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<761?1.6:2));renderer.setSize(r.width,r.height);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();dirty=true;wake();
}
function wake(){if(!frame&&state.ready&&!document.hidden)frame=requestAnimationFrame(tick);}
function tick(now){
  frame=0;const dt=lastTime?Math.min((now-lastTime)/1000,.12):0;lastTime=now;let changing=false;
  if(state.playing){state.playhead=Math.min(12,state.playhead+dt);demoPose(state.playhead);updateUI();dirty=true;if(state.playhead>=12){state.playing=false;state.focused=false;updateUI();announce('Montagem concluída. O relógio continua livre para explorar.');}}
  if(!state.playing){
    const d=state.targetExplode-state.explode;if(Math.abs(d)>.0001){state.explode+=d*(media.matches?1:1-Math.exp(-dt*5));changing=true;dirty=true;}else state.explode=state.targetExplode;
  }
  const mechanism=state.explode>.02&&!media.matches;
  if(mechanism||state.playing)mechanicalTime+=dt;
  updateModel();
  if(cameraTween){
    cameraTween.age+=dt;const t=cameraTween.duration===0?1:Math.min(1,cameraTween.age/cameraTween.duration),a=1-Math.pow(1-t,4);
    camera.position.lerpVectors(cameraTween.fromP,cameraTween.toP,a);controls.target.lerpVectors(cameraTween.fromT,cameraTween.toT,a);dirty=true;changing=true;if(t===1)cameraTween=null;
  }else if(state.focused&&state.selected&&!state.playing){
    const center=bounds(watch.parts[state.selected]).center,delta=center.clone().sub(controls.target);if(delta.lengthSq()>.000001){camera.position.add(delta);controls.target.copy(center);dirty=true;}
  }
  const orbitChanged=controls.update();if(orbitChanged)dirty=true;
  if(dirty||mechanism||state.playing){renderer.render(scene,camera);dirty=false;}
  if(changing||mechanism||state.playing||orbitChanged||activeDrag)wake();
}

async function lighting(){
  scene.add(new THREE.HemisphereLight('#e6f0e7','#081b16',.18));
  keyLight=new THREE.DirectionalLight('#f4f7ff',2);keyLight.position.set(-4,6,7);scene.add(keyLight);
  fillLight=new THREE.DirectionalLight('#dce8df',.7);fillLight.position.set(4,-1,5);scene.add(fillLight);
  const pmrem=new THREE.PMREMGenerator(renderer);
  try{const hdr=await new HDRLoader().loadAsync('/assets/environment/studio_small_03_1k.hdr');hdr.mapping=THREE.EquirectangularReflectionMapping;environment=pmrem.fromEquirectangular(hdr);hdr.dispose();}
  catch(error){
    const room=new THREE.Scene();room.background=new THREE.Color('#343b3e');
    for(const x of [-1,1]){const panel=new THREE.Mesh(new THREE.PlaneGeometry(3,9),new THREE.MeshBasicMaterial({color:new THREE.Color(3,3,3),side:THREE.DoubleSide}));panel.position.set(x*5,2,4);panel.lookAt(0,0,0);room.add(panel);}
    environment=pmrem.fromScene(room,.02);room.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
  }
  pmrem.dispose();scene.environment=environment.texture;scene.environmentIntensity=.68;scene.environmentRotation.set(0,.8,0);
}
$('#studio-light').addEventListener('change',event=>{
  state.light=event.target.value;if(!scene)return;
  const presets={atelier:{rotation:.8,intensity:.68,key:'#f4f7ff',fill:'#dce8df',exposure:1},cool:{rotation:2,intensity:.9,key:'#c9dfff',fill:'#abcbe3',exposure:.95},warm:{rotation:-.55,intensity:.72,key:'#ffdfad',fill:'#e7caa4',exposure:1.05}};
  const p=presets[state.light];scene.environmentRotation.y=p.rotation;scene.environmentIntensity=p.intensity;keyLight.color.set(p.key);fillLight.color.set(p.fill);renderer.toneMappingExposure=p.exposure;dirty=true;wake();
});
function fallback(error){
  state.failed=true;state.ready=false;state.playing=false;if(frame)cancelAnimationFrame(frame);frame=0;
  $('#loading').hidden=true;$('.fallback').hidden=false;renderer?.domElement.remove();
  for(const b of document.querySelectorAll('.control-dock button,.control-dock input,.camera-tools button,#explore-start,#nav-explore,#intro-demo,.view-presets button,#studio-light'))b.disabled=true;
  $('#gesture-hint span').textContent='3D indisponível. Veja as fotografias em Os detalhes.';announce('A visualização 3D não está disponível. A fotografia original e a galeria continuam disponíveis.');console.warn('Watch fallback:',error?.message||error);
}
async function initialize(){
  try{
    renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
    stage.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-hidden','true');
    scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(32,1,.1,100);camera.position.set(0,.15,11.8);
    await lighting();watch=createWatch();watch.root.rotation.set(-.08,-.25,-.16);scene.add(watch.root);
    controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.09;controls.minDistance=1.8;controls.maxDistance=36;controls.enablePan=true;controls.screenSpacePanning=true;controls.rotateSpeed=.65;controls.zoomSpeed=.7;
    controls.addEventListener('start',()=>{stopDemo();cameraTween=null;state.focused=false;dirty=true;wake();});controls.addEventListener('change',()=>{dirty=true;wake();});
    bindGestures();state.ready=true;resize();updateModel();controls.update();renderer.render(scene,camera);stage.classList.add('ready');$('#loading').hidden=true;experience.dataset.ready='true';document.querySelectorAll('[data-await-model]').forEach(e=>e.disabled=false);updateUI();
    renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback('WebGL context lost');});wake();
  }catch(error){fallback(error);}
}
const observer=new ResizeObserver(resize);observer.observe(stage);
document.addEventListener('visibilitychange',()=>{lastTime=0;if(document.hidden){if(frame)cancelAnimationFrame(frame);frame=0;}else wake();});
media.addEventListener('change',()=>{if(media.matches)stopDemo();dirty=true;wake();});
window.addEventListener('pagehide',()=>{observer.disconnect();if(frame)cancelAnimationFrame(frame);controls?.dispose();watch?.dispose();environment?.dispose();renderer?.dispose();},{once:true});
Object.defineProperty(window,'watchExperience',{get:()=>({state:{...state},camera:camera?{position:camera.position.toArray(),target:controls?.target.toArray()}:null,parts:watch?Object.fromEntries(Object.entries(watch.parts).map(([id,g])=>[id,{position:g.position.toArray(),offset:watch.offsets[id].toArray(),visible:g.visible}])):null,render:renderer?{calls:renderer.info.render.calls,triangles:renderer.info.render.triangles}:null})});
for(const s of ['#explore-start','#nav-explore','#intro-demo','#demo-button','#explode-toggle','#studio-light']){const e=$(s);e.disabled=true;e.dataset.awaitModel='true';}
initialize();
