import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const TAU=Math.PI*2;

// Deterministic machining data, rather than painted metallic highlights.
function machiningMap(kind) {
  const c=document.createElement('canvas');const size=kind==='perlage'?1024:512;c.width=c.height=size;
  const ctx=c.getContext('2d');let seed=419;const random=()=>{seed=seed*16807%2147483647;return seed/2147483647;};
  ctx.fillStyle='#858585';ctx.fillRect(0,0,size,size);
  if(kind==='perlage'){
    for(let y=-35;y<size+60;y+=51)for(let x=-35;x<size+60;x+=51)for(let r=3;r<43;r+=1.35){ctx.beginPath();ctx.arc(x+(Math.round(y/51)%2)*25,y,r,0,TAU);ctx.strokeStyle=`rgba(${r%4<2?'215,215,215':'45,45,45'},.19)`;ctx.lineWidth=.65;ctx.stroke();}
  }else for(let i=0;i<4200;i++){
    const v=85+Math.floor(random()*100);ctx.strokeStyle=`rgba(${v},${v},${v},.23)`;ctx.lineWidth=.25+random()*.45;ctx.beginPath();
    if(kind==='radial')ctx.arc(size/2,size/2,random()*size*.72,0,TAU);else{const x=random()*size;ctx.moveTo(x,0);ctx.lineTo(x+random()*.4,size);}ctx.stroke();
  }
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;return t;
}
function drawCrown(ctx,x,y,scale,color){
  ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.fillStyle=ctx.strokeStyle=color;ctx.lineWidth=2;ctx.lineCap='round';
  [[-22,-13],[-12,-24],[0,-29],[12,-24],[22,-13]].forEach(([px,py],i)=>{ctx.beginPath();ctx.moveTo(-10+i*5,11);ctx.lineTo(px,py);ctx.stroke();ctx.beginPath();ctx.arc(px,py,2.6,0,TAU);ctx.fill();});
  ctx.beginPath();ctx.ellipse(0,12,10,3.8,0,0,TAU);ctx.stroke();ctx.restore();
}
function dialMap(){
  const c=document.createElement('canvas');c.width=c.height=2048;const ctx=c.getContext('2d');
  const g=ctx.createLinearGradient(0,0,2048,2048);g.addColorStop(0,'#171a1c');g.addColorStop(.43,'#0c0e10');g.addColorStop(1,'#050607');ctx.fillStyle=g;ctx.fillRect(0,0,2048,2048);
  ctx.textAlign='center';ctx.fillStyle='#f1f0e8';drawCrown(ctx,1024,348,2.8,'#e9e9e3');ctx.font='600 81px Georgia';ctx.fillText('ROLEX',1024,575);
  ctx.font='500 43px Arial';ctx.fillText('OYSTER PERPETUAL',1024,638);ctx.font='500 30px Arial';ctx.fillText('SUPERLATIVE CHRONOMETER',1024,1450);ctx.fillText('OFFICIALLY CERTIFIED',1024,1496);
  ctx.font='500 24px Arial';ctx.fillText('SWISS     MADE',1024,1948);drawCrown(ctx,1024,1943,.34,'#e7e8e3');
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;return t;
}
function engravingMap(text,size){
  const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#333b40';ctx.font=`500 ${size}px Georgia`;ctx.fillText(text,512,128);
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}

export function createWatch(){
  const root=new THREE.Group();root.name='Oyster Perpetual — atelier model';
  const brush=machiningMap('linear'),radial=machiningMap('radial'),perlage=machiningMap('perlage');
  const polished=new THREE.MeshPhysicalMaterial({color:'#e7e9eb',metalness:1,roughness:.09,envMapIntensity:1.05});
  const steel=new THREE.MeshPhysicalMaterial({color:'#aeb5bd',metalness:1,roughness:.48,roughnessMap:brush,bumpMap:brush,bumpScale:.0018,anisotropy:.75,anisotropyRotation:Math.PI/2,envMapIntensity:1.1});
  const satin=new THREE.MeshStandardMaterial({color:'#a6aeb6',metalness:1,roughness:.55,roughnessMap:perlage,bumpMap:perlage,bumpScale:.004});
  const circular=new THREE.MeshStandardMaterial({color:'#c1c4c7',metalness:1,roughness:.27,bumpMap:radial,bumpScale:.0018});
  const darkSteel=new THREE.MeshStandardMaterial({color:'#343b42',metalness:1,roughness:.26});
  const shadow=new THREE.MeshStandardMaterial({color:'#080b0f',roughness:.6,metalness:.3});
  const gold=new THREE.MeshPhysicalMaterial({color:'#c6a25d',metalness:1,roughness:.22,envMapIntensity:1.1});
  const lightGold=new THREE.MeshStandardMaterial({color:'#d6ba7d',metalness:1,roughness:.3,bumpMap:radial,bumpScale:.0012});
  const ruby=new THREE.MeshPhysicalMaterial({color:'#b00c43',metalness:.3,roughness:.12,clearcoat:1,clearcoatRoughness:.08});
  const blue=new THREE.MeshStandardMaterial({color:'#193c71',metalness:1,roughness:.18});
  const lume=new THREE.MeshStandardMaterial({color:'#e3e7df',roughness:.48,metalness:.06});
  const dialMaterial=new THREE.MeshPhysicalMaterial({map:dialMap(),metalness:0,roughness:.56,clearcoat:0,specularIntensity:.08,envMapIntensity:.012});
  const housing=new THREE.Group(),bracelet=new THREE.Group(),bezel=new THREE.Group(),face=new THREE.Group(),movement=new THREE.Group(),crystal=new THREE.Group(),caseback=new THREE.Group();root.add(housing,bracelet,bezel,face,movement,crystal,caseback);
  housing.name='Oyster case and articulated bracelet';bezel.name='Polished smooth bezel';face.name='Black dial and applied indices';movement.name='Illustrative automatic movement';crystal.name='Sapphire crystal';caseback.name='Screw-down caseback';
  const animatedGears=[],oscillators=[],rotors=[];
  function mesh(geo,mat,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;}
  const box=(w,h,d,r,mat,parent,x=0,y=0,z=0)=>mesh(new RoundedBoxGeometry(w,h,d,4,r),mat,parent,x,y,z);
  function disc(r,d,mat,parent,x=0,y=0,z=0,segments=96){const m=mesh(new THREE.CylinderGeometry(r,r,d,segments),mat,parent,x,y,z);m.rotation.x=Math.PI/2;return m;}
  function torus(r,t,mat,parent,x=0,y=0,z=0,segments=96){return mesh(new THREE.TorusGeometry(r,t,12,segments),mat,parent,x,y,z);}
  function extrude(shape,depth,mat,parent,z=0,b=.008){return mesh(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:b>0,bevelSize:b,bevelThickness:b,bevelSegments:3,curveSegments:64,steps:1}),mat,parent,0,0,z);}
  function ring(inner,outer,d,mat,parent,z=0,b=.008){const s=new THREE.Shape();s.absarc(0,0,outer,0,TAU,false);const hole=new THREE.Path();hole.absarc(0,0,inner,0,TAU,true);s.holes.push(hole);return extrude(s,d,mat,parent,z,b);}
  function profile(points,mat,parent){const m=mesh(new THREE.LatheGeometry(points.map(([r,z])=>new THREE.Vector2(r,z)),160),mat,parent);m.rotation.x=Math.PI/2;return m;}
  function text(label,w,h,parent,x,y,z,size=62){return mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:engravingMap(label,size),transparent:true,depthWrite:false,roughness:.6,metalness:.2,polygonOffset:true,polygonOffsetFactor:-1}),parent,x,y,z);}
  function screw(parent,x,y,z,scale=1,blued=false){disc(.038*scale,.015*scale,shadow,parent,x,y,z-.008,24);disc(.031*scale,.016*scale,blued?blue:polished,parent,x,y,z+.005,24);box(.046*scale,.007*scale,.004,.001,shadow,parent,x,y,z+.015).rotation.z=x*7+y*4;}
  function batch(group){
    group.updateMatrixWorld(true);const inverse=group.matrixWorld.clone().invert(),batches=new Map(),originals=new Set();
    group.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,o.matrixWorld));if(!batches.has(o.material))batches.set(o.material,[]);batches.get(o.material).push(g);originals.add(o.geometry);});
    group.clear();batches.forEach((geos,mat)=>{const combined=mergeGeometries(geos,false);if(!combined)throw new Error('Incompatible watch geometry');mesh(combined,mat,group);geos.forEach(g=>g.dispose());});originals.forEach(g=>g.dispose());
  }

  // Continuous convex case wall and sculpted, tapering lugs.
  profile([[1.27,-.255],[1.4,-.29],[1.49,-.275],[1.55,-.21],[1.575,-.12],[1.57,-.015],[1.535,.075],[1.48,.12],[1.27,.12]],polished,housing);
  ring(1.27,1.49,.035,darkSteel,housing,-.27);ring(1.26,1.48,.025,steel,housing,.09);
  for(const side of [-1,1])for(const sign of [-1,1]){
    const s=new THREE.Shape();s.moveTo(.72,1.12);s.bezierCurveTo(.79,1.3,.84,1.55,.84,1.82);s.lineTo(1,1.82);s.bezierCurveTo(1.06,1.53,1.17,1.27,1.25,1.02);s.bezierCurveTo(1.05,1.03,.86,1.09,.72,1.12);
    extrude(s,.2,steel,housing,-.12,.045).scale.set(sign,side,1);
  }
  // Narrow gaps, rolled edges and softly crowned surfaces on each Oyster link.
  function link(w,h,d,parent,x,y,z,center=false){
    const geo=new RoundedBoxGeometry(w,h,d,4,.042),p=geo.attributes.position;
    for(let i=0;i<p.count;i++){const px=p.getX(i),py=p.getY(i),pz=p.getZ(i);if(pz>0)p.setZ(i,pz+.024*Math.cos(py/h*Math.PI)+.007*Math.cos(px/w*Math.PI));}
    geo.computeVertexNormals();mesh(geo,steel,parent,x,y,z);if(center)box(.012,h*.7,d*.8,.004,polished,parent,x-w*.48,y,z-.005);
  }
  for(const side of [-1,1])for(let i=0;i<23;i++){
    const t=i/22,a=Math.PI*t,row=new THREE.Group();
    row.position.set(0,side*(1.73*(1-t)+.55*t+2.1*Math.sin(a)),-.04-1.8*(1-Math.cos(a)));
    row.rotation.x=side*Math.atan2(-1.8*Math.PI*Math.sin(a),-1.18+2.1*Math.PI*Math.cos(a));bracelet.add(row);const taper=1-t*.16;
    link(.79*taper,.335,.19,row,0,side*.035,.018,true);
    for(const sign of [-1,1]){link(.4*taper,.36,.205,row,sign*.612*taper,0,0);disc(.028,.013,polished,row,sign*.819*taper,-.025,-.015,20).rotation.set(0,Math.PI/2,0);}
  }
  // Stepped, knurled winding crown and embossed cap.
  const crown=new THREE.Group();crown.position.set(1.54,0,-.045);crown.rotation.y=Math.PI/2;housing.add(crown);
  disc(.095,.18,polished,crown,0,0,.06,48);disc(.186,.05,polished,crown,0,0,.16,64);disc(.213,.17,steel,crown,0,0,.255,80);
  for(let i=0;i<40;i++){const a=i/40*TAU;box(.021,.024,.16,.008,polished,crown,Math.sin(a)*.208,Math.cos(a)*.208,.255).rotation.z=-a;}
  disc(.195,.026,polished,crown,0,0,.353,80);torus(.185,.008,polished,crown,0,0,.37);
  const cc=document.createElement('canvas');cc.width=cc.height=256;drawCrown(cc.getContext('2d'),128,145,2.4,'#646d70');const ct=new THREE.CanvasTexture(cc);ct.colorSpace=THREE.SRGBColorSpace;
  mesh(new THREE.PlaneGeometry(.23,.23),new THREE.MeshStandardMaterial({map:ct,transparent:true,roughness:.3,metalness:.9,depthWrite:false}),crown,0,0,.369);
  // Closed Oyster clasp, grounded in the rear and side reference photographs.
  box(1.38,1.18,.18,.065,steel,bracelet,0,0,-3.65);
  for(const y of [-.53,.53])box(1.31,.014,.012,.003,darkSteel,bracelet,0,y,-3.749);
  const claspLogo=mesh(new THREE.PlaneGeometry(.28,.28),new THREE.MeshStandardMaterial({map:ct,transparent:true,roughness:.3,metalness:.9,depthWrite:false}),bracelet,0,.13,-3.747);claspLogo.rotation.y=Math.PI;

  // Multi-radius domed bezel produces continuous polished highlight ribbons.
  profile([[1.337,.26],[1.34,.33],[1.36,.365],[1.405,.375],[1.46,.352],[1.515,.31],[1.55,.255],[1.56,.213],[1.54,.17],[1.49,.145],[1.35,.19]].reverse(),polished,bezel);
  ring(1.292,1.346,.055,steel,bezel,.265);torus(1.323,.009,polished,bezel,0,0,.328);
  const rc=document.createElement('canvas');rc.width=rc.height=1024;const rx=rc.getContext('2d');rx.fillStyle='#a0a4a5';rx.fillRect(0,0,1024,1024);rx.font='17px Georgia';rx.textAlign='center';rx.fillStyle='#505659';
  for(let i=0;i<50;i++){const a=i/50*TAU;rx.save();rx.translate(512+Math.sin(a)*488,512-Math.cos(a)*488);rx.rotate(a);rx.fillText('ROLEX'[i%5],0,0);rx.restore();}
  const rt=new THREE.CanvasTexture(rc);rt.colorSpace=THREE.SRGBColorSpace;mesh(new THREE.RingGeometry(1.286,1.34,160),new THREE.MeshStandardMaterial({map:rt,metalness:.85,roughness:.25}),bezel,0,0,.324);
  disc(1.286,.038,shadow,face,0,0,.22);mesh(new THREE.CircleGeometry(1.286,160),dialMaterial,face,0,0,.241);
  for(let i=0;i<60;i++){const a=i/60*TAU;box(i%5===0?.025:.012,i%5===0?.052:.045,.005,.001,lume,face,Math.sin(a)*1.236,Math.cos(a)*1.236,.25).rotation.z=-a;}
  for(let i=1;i<12;i++){
    const a=i/12*TAU,g=new THREE.Group();g.position.set(Math.sin(a)*1.067,Math.cos(a)*1.067,.268);g.rotation.z=-a;face.add(g);
    for(const shift of [3,6,9].includes(i)?[-.046,.046]:[0]){box(.075,.272,.034,.008,polished,g,shift,0,0);box(.047,.239,.006,.002,lume,g,shift,0,.022);}
  }
  const hour=new THREE.Group(),minute=new THREE.Group(),seconds=new THREE.Group();
  function hand(parent,length,width,z,tail){
    const s=new THREE.Shape();s.moveTo(-width*.38,-tail);s.lineTo(width*.38,-tail);s.lineTo(width*.5,length-.065);s.lineTo(0,length);s.lineTo(-width*.5,length-.065);s.closePath();extrude(s,.017,polished,parent,z,.005);
    box(width*.5,length*.73,.005,.002,lume,parent,0,length*.5,z+.025);box(.008,length*.91,.008,.002,polished,parent,-width*.32,length*.43,z+.018);
  }
  hand(hour,.79,.09,.285,.22);hand(minute,1.075,.066,.324,.23);box(.012,1.51,.008,.002,polished,seconds,0,.38,.39);
  disc(.061,.014,polished,seconds,0,-.29,.395,32);disc(.043,.017,shadow,seconds,0,-.29,.4,32);
  hour.rotation.z=-TAU*(10+10/60)/12;minute.rotation.z=-TAU*10/60;seconds.rotation.z=-TAU*33/60;disc(.06,.035,polished,face,0,0,.418,48);
  batch(face);face.add(hour,minute,seconds);
  const glass=new THREE.MeshPhysicalMaterial({color:'#e1f1f6',metalness:0,roughness:.04,transparent:true,opacity:.007,clearcoat:0,specularIntensity:.15,envMapIntensity:.15,depthWrite:false,side:THREE.DoubleSide});
  const glassEdge=new THREE.MeshPhysicalMaterial({color:'#a2bcc8',metalness:.2,roughness:.06,transparent:true,opacity:.4,depthWrite:false});
  disc(1.345,.018,glass,crystal,0,0,.441,128);torus(1.342,.006,glassEdge,crystal,0,0,.446);

  // Movement: toothed spoked wheels, machined bridges, ruby seats and blue hairspring.
  function gearShape(r,teeth){const s=new THREE.Shape();for(let i=0;i<teeth*4;i++){const a=i/(teeth*4)*TAU,d=r*((i%4===1||i%4===2)?1:.925);i?s.lineTo(Math.cos(a)*d,Math.sin(a)*d):s.moveTo(Math.cos(a)*d,Math.sin(a)*d);}s.closePath();const hole=new THREE.Path();hole.absarc(0,0,r*.72,0,TAU,true);s.holes.push(hole);return s;}
  function wheel(parent,x,y,r,teeth,speed,z){
    const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);extrude(gearShape(r,teeth),.025,gold,g,0,.002);
    for(let i=0;i<6;i++){const a=i/6*TAU;box(.018,r*.76,.018,.004,lightGold,g,Math.sin(a)*r*.38,Math.cos(a)*r*.38,.011).rotation.z=-a;}
    torus(r*.81,.006,lightGold,g,0,0,.027,64);disc(r*.21,.036,circular,g,0,0,.014,40);disc(r*.072,.025,shadow,g,0,0,.037,24);disc(r*.043,.027,ruby,g,0,0,.042,24);batch(g);animatedGears.push({object:g,speed});
  }
  function makeMechanism(parent,reverse=false){
    const g=new THREE.Group();parent.add(g);if(reverse){g.rotation.y=Math.PI;g.position.z=-.175;}
    const gears=[[-.4,.67,.355,54,.11,.016],[.22,.47,.275,44,-.17,.035],[.69,.13,.275,44,.17,.05],[-.47,.06,.29,46,-.15,.045],[.12,-.13,.31,48,.15,.066],[.18,-.72,.265,42,-.15,.045],[-.2,-.43,.18,30,-.3,.075],[.72,-.49,.22,36,-.2,.043]];
    disc(1.234,.07,darkSteel,g,0,0,-.103);gears.forEach(([x,y,r])=>disc(r*.96,.008,shadow,g,x,y,-.063,48));
    const plate=new THREE.Shape();plate.absarc(0,0,1.2,0,TAU,false);
    gears.forEach(([x,y,r])=>{const h=new THREE.Path();h.absarc(x,y,r*.97,0,TAU,true);plate.holes.push(h);});
    const hole=new THREE.Path();hole.absarc(-.62,-.65,.34,0,TAU,true);plate.holes.push(hole);extrude(plate,.045,satin,g,-.061,.004);ring(1.19,1.23,.025,lightGold,g,-.055,.004);
    gears.forEach(([x,y,r,teeth,speed,z])=>wheel(g,x,y,r,teeth,speed,z));
    function bridge(points,z){const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();extrude(s,.03,satin,g,z,.012);}
    bridge([[-1.02,.35],[-1.06,.57],[-.86,.92],[-.53,1.065],[-.38,.92],[-.7,.75],[-.88,.45]],.085);
    bridge([[.32,1.02],[.7,.89],[.98,.6],[1.09,.24],[.9,.16],[.75,.57],[.46,.8]],.09);
    bridge([[-.12,.69],[.045,.72],[.28,.16],[.08,-.47],[-.09,-.42],[.08,.17]],.115);
    bridge([[.34,-.97],[.71,-.91],[.99,-.64],[.84,-.52],[.57,-.73],[.31,-.77]],.075);
    bridge([[-1.08,-.18],[-.99,-.54],[-.88,-.64],[-.74,-.55],[-.85,-.2]],.08);
    for(const [x,y,z] of [[-.98,.51,.13],[-.51,.97,.13],[.53,.88,.135],[.97,.29,.135],[.01,.54,.16],[.02,-.33,.16],[.68,-.82,.12],[-.95,-.3,.13]]){screw(g,x,y,z,1.16);torus(.051,.009,lightGold,g,x+.095,y-.032,z-.018,32);disc(.033,.012,ruby,g,x+.095,y-.032,z-.008,32);}
    for(let i=0;i<12;i++){const a=i/12*TAU;screw(g,Math.sin(a)*1.143,Math.cos(a)*1.143,-.002,.72,i%3===0);}
    disc(.23,.028,circular,g,-.4,.67,.083,64);torus(.204,.006,polished,g,-.4,.67,.102,64);screw(g,-.4,.67,.113,1.25);
    const balance=new THREE.Group();balance.position.set(-.62,-.65,.096);g.add(balance);torus(.314,.015,gold,balance);torus(.288,.005,polished,balance);
    for(let i=0;i<3;i++){const a=i/3*TAU;box(.023,.55,.015,.004,gold,balance,Math.sin(a)*.065,Math.cos(a)*.065,0).rotation.z=-a;}
    const spring=[];for(let i=0;i<380;i++){const a=i/379*Math.PI*13,r=.035+.22*i/379;spring.push(new THREE.Vector3(Math.cos(a)*r,Math.sin(a)*r,.024));}
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spring),380,.0025,4,false),blue,balance);disc(.048,.03,gold,balance,0,0,.026,32);disc(.024,.036,ruby,balance,0,0,.034,32);batch(balance);oscillators.push(balance);
    box(.45,.075,.035,.02,satin,g,-.81,-.66,.16).rotation.z=-.2;screw(g,-1.01,-.62,.191,1.1);
    text('ROLEX',.37,.093,g,.5,.82,.129,80);text('3230',.3,.075,g,-.67,.85,.13,85);text('PERPETUAL',.52,.082,g,.6,-.87,.116,62);
    const moving=[...g.children].filter(o=>animatedGears.some(a=>a.object===o)||oscillators.includes(o));moving.forEach(o=>g.remove(o));batch(g);moving.forEach(o=>g.add(o));
  }
  makeMechanism(movement);makeMechanism(movement,true);
  const rotor=new THREE.Group();rotor.position.z=-.37;rotor.rotation.y=Math.PI;movement.add(rotor);
  const rotorShape=new THREE.Shape();rotorShape.absarc(0,0,1.13,-Math.PI*.16,Math.PI*1.06,false);rotorShape.absarc(0,0,.72,Math.PI*1.06,-Math.PI*.16,true);rotorShape.closePath();
  extrude(rotorShape,.048,steel,rotor,0,.012);box(.13,.96,.046,.025,steel,rotor,0,.42,.018);disc(.16,.07,polished,rotor,0,0,.029,48);disc(.092,.075,gold,rotor,0,0,.04,40);screw(rotor,0,0,.093,1.4);text('PERPETUAL',.64,.12,rotor,0,.91,.067,80);batch(rotor);rotors.push(rotor);
  disc(1.29,.065,circular,caseback,0,0,-.315,128);profile([[1.11,-.37],[1.21,-.36],[1.28,-.33],[1.3,-.29],[1.28,-.25]],polished,caseback);
  for(let i=0;i<72;i++){const a=i/72*TAU;box(.012,.035,.025,.003,steel,caseback,Math.sin(a)*1.26,Math.cos(a)*1.26,-.34).rotation.z=-a;}
  batch(housing);batch(bracelet);batch(bezel);batch(caseback);
  const parts={crystal,bezel,dial:face,movement,case:housing,bracelet,back:caseback};
  const offsets=Object.fromEntries(Object.keys(parts).map(id=>[id,new THREE.Vector3()]));
  let selected=null,isolated=null;
  Object.entries(parts).forEach(([id,group])=>{group.userData.partId=id;group.traverse(o=>{if(o.isMesh)o.userData.partId=id;});});
  function selectPart(id){
    selected=id;
    Object.entries(parts).forEach(([partId,g])=>g.traverse(o=>{if(!o.isMesh)return;
      if(!o.userData.originalMaterial)o.userData.originalMaterial=o.material;
      if(partId===id){if(!o.userData.selectedMaterial){o.userData.selectedMaterial=o.userData.originalMaterial.clone();o.userData.selectedMaterial.emissive?.set('#b9a573');o.userData.selectedMaterial.emissiveIntensity=.035;}o.material=o.userData.selectedMaterial;}
      else o.material=o.userData.originalMaterial;
    }));
  }
  return{
    root,parts,offsets,
    select:selectPart,
    isolate(id){isolated=id;},
    setOffset(id,x,y,z){if(offsets[id])offsets[id].set(x,y,z);},
    resetOffsets(){Object.values(offsets).forEach(o=>o.set(0,0,0));},
    update({explode,openBack,time,animate,focus=0}){
      // Wide axial separation follows the lower Claude/Opus reference.
      const e=THREE.MathUtils.smootherstep(explode,0,1);
      crystal.position.set(0,0,e*3.8);bezel.position.set(0,0,e*2.95);face.position.set(0,0,e*1.87);movement.position.set(0,0,e*.64);housing.position.set(0,0,-e*.48);bracelet.position.set(0,0,-e*.48);caseback.position.set(0,0,-e*1.01-openBack*1.35);caseback.visible=openBack<.95;
      // Clear the foreground sapphire during the travelling calibre close-up.
      glass.opacity=.007*(1-focus);glassEdge.opacity=.4*(1-focus);crystal.visible=focus<.999;
      Object.entries(parts).forEach(([id,g])=>{g.position.add(offsets[id]);if(isolated)g.visible=id===isolated;else if(id!=='crystal'&&id!=='back')g.visible=true;});
      if(animate){animatedGears.forEach(({object,speed})=>object.rotation.z=time*speed);oscillators.forEach((o,i)=>o.rotation.z=Math.sin(time*TAU*3.5+i*.4)*.44);rotors.forEach(o=>o.rotation.z=Math.sin(time*.37)*.5+.35);seconds.rotation.z=-TAU*(33+time)/60;}
    },
    dispose(){const geometries=new Set(),materials=new Set(),textures=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);if(o.userData.originalMaterial)materials.add(o.userData.originalMaterial);if(o.userData.selectedMaterial)materials.add(o.userData.selectedMaterial);});materials.forEach(m=>{Object.values(m).forEach(v=>{if(v?.isTexture)textures.add(v);});m.dispose();});geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());}
  };
}
