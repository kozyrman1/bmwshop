import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {cube} from './car.js';
const vec=(x,y,z)=>new T.Vector3(x,y,z);
const mat=(c,m=.2,r=.4)=>new T.MeshStandardMaterial({color:c,metalness:m,roughness:r});
const smooth=t=>{t=T.MathUtils.clamp(t,0,1);return t*t*(3-2*t)};
export function setupRenderer(canvas, alpha=false){
 const r=new T.WebGLRenderer({canvas,antialias:true,alpha,powerPreference:'high-performance',preserveDrawingBuffer:canvas?.dataset.capture==='true'});
 r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.16;r.outputColorSpace=T.SRGBColorSpace;
 r.setPixelRatio(Math.min(window.devicePixelRatio,1.65));
 return r;
}
export function studioEnv(r,s){
 const pm=new T.PMREMGenerator(r),studio=new T.Scene();
 studio.background=new T.Color('#292d30');
 function softbox(x,y,z,w,h,gain){
  const panel=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(gain,gain*.97,gain*.91),side:T.DoubleSide}));
  panel.position.set(x,y,z);panel.lookAt(0,.5,0);studio.add(panel);
 }
 softbox(.5,5.5,.3,8,3.6,5.3);
 softbox(6,2.65,1,8,1.7,2.9);
 softbox(-4,3.45,-3.7,7.4,1,4.7);
 softbox(1,2.0,6.8,9,2.6,1.45);
 softbox(-1,4.0,4,8,.4,2.6);
 s.environment=pm.fromScene(studio,.035,.15,30).texture;s.environmentIntensity=.92;
 studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});pm.dispose();
}
function concrete(){
 const c=document.createElement('canvas');c.width=c.height=128;
 const x=c.getContext('2d'),p=x.createImageData(c.width,c.height);
 let seed=1117;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(let j=0;j<c.height;j++)for(let i=0;i<c.width;i++){
  const k=(j*c.width+i)*4,v=154+(random()-.5)*22+4*Math.cos(i*.18+j*.09)+3*Math.cos(j*.24-i*.08);
  p.data.set([v,v,v,255],k);
 }
 x.putImageData(p,0,0);
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(5,5);t.anisotropy=4;return t;
}
export function buildStudio(){
 const s=new T.Scene();s.background=new T.Color('#343735');s.fog=new T.FogExp2('#343735',.019);
 s.add(new T.HemisphereLight('#e0e7ec','#555048',1.38));
 for(const [x,y,z,c,intensity] of [[3,7,4,'#fff6e9',2.35],[-3,5,-5,'#dce8fa',1.55],[6,3,0,'#ffefe0',.82]]){
  const l=new T.DirectionalLight(c,intensity);l.position.set(x,y,z);s.add(l);
 }
 const room=new T.Group();s.add(room);
 const mineral=concrete();
 const back=mat('#5f605d',.04,.94),pillar=mat('#383b3d',.12,.76),trim=mat('#22262a',.26,.52),ceiling=mat('#5d5c58',.08,.93),dark=mat('#3a3e40',.09,.85);
 back.map=mineral;
 const white=new T.MeshBasicMaterial({color:'#fff3df',toneMapped:false});
 const windowMat=new T.MeshBasicMaterial({color:'#9ba4a8',toneMapped:false});
 cube(room,56,7.5,.35,0,3.68,-7.4,back);
 cube(room,.35,7.5,42,-10.2,3.68,5,back);
 cube(room,54,.26,26,0,5.28,.5,ceiling);
 cube(room,56,.52,1.8,0,4.96,-6.41,dark);
 cube(room,56,.12,.05,0,.1,-7.17,trim);
 // Deeply recessed display bays and vertical concrete seams.
 for(let x=-20;x<22;x+=5.2){
  cube(room,.046,5.05,.08,x,2.65,-7.18,pillar);
  cube(room,.24,5.05,.64,x+2.52,2.64,-6.97,pillar);
 }
 cube(room,10.6,3.15,.22,1.2,2.18,-7.16,trim);
 cube(room,10.5,.025,.08,1.2,3.73,-7,white);
 cube(room,10.5,.026,.05,1.2,.60,-7,white);
 for(let i=0;i<7;i++){
  const z=-4.7+i*1.63;
  cube(room,35,.09,.16,.5,5.05,z,trim);
  cube(room,26,.028,.045,2.1,4.998,z,white);
 }
 for(let x=-20;x<-4.5;x+=2.35){
  cube(room,2.27,3.42,.055,x,2.61,-7.04,windowMat);
  cube(room,2.29,.036,.06,x,2.94,-6.993,trim);
  cube(room,.04,3.45,.06,x+1.15,2.6,-6.99,trim);
 }
 const lettering=document.createElement('canvas');lettering.width=1024;lettering.height=256;
 const ctx=lettering.getContext('2d');ctx.fillStyle='#bfe5ff';ctx.font='700 104px sans-serif';ctx.fillText('M',125,145);
 ctx.fillStyle='#e9e9e4';ctx.font='600 49px sans-serif';ctx.fillText('COLLECTION',245,135);
 ctx.fillStyle='#b3b9be';ctx.font='500 21px monospace';ctx.fillText('B M W    M   /   S H O W R O O M',249,179);
 for(let j=0;j<3;j++){ctx.fillStyle=['#7bd1fa','#5069c1','#e75f63'][j];ctx.beginPath();ctx.moveTo(37+j*20,80);ctx.lineTo(55+j*20,80);ctx.lineTo(40+j*20,149);ctx.lineTo(22+j*20,149);ctx.closePath();ctx.fill();}
 const labelTex=new T.CanvasTexture(lettering);labelTex.colorSpace=T.SRGBColorSpace;
 const sign=new T.Mesh(new T.PlaneGeometry(5.55,1.39),new T.MeshBasicMaterial({map:labelTex,transparent:true,depthWrite:false,toneMapped:false}));
 sign.position.set(1.4,2.65,-6.98);room.add(sign);
 const floorMat=mat('#4c4e51',.12,.62);floorMat.map=mineral;floorMat.transparent=true;floorMat.opacity=.93;
 const floor=new T.Mesh(new T.PlaneGeometry(70,70),floorMat);floor.rotation.x=-Math.PI/2;floor.position.y=-.039;floor.renderOrder=1;s.add(floor);
 const reflection=new Reflector(new T.PlaneGeometry(70,70),{textureWidth:768,textureHeight:768,color:'#9c9a98',clipBias:.003,multisample:2});
 reflection.rotation.x=-Math.PI/2;reflection.position.y=-.045;s.add(reflection);
 const joints=new T.Group();room.add(joints);
 for(let i=-5;i<=5;i++){
  cube(joints,56,.005,.016,0,-.031,i*3.15,trim);
  cube(joints,.016,.005,56,i*3.15,-.031,0,trim);
 }
 const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),d=g.createRadialGradient(64,64,3,64,64,63);
 d.addColorStop(0,'rgba(0,0,0,.92)');d.addColorStop(.54,'rgba(0,0,0,.65)');d.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=d;g.fillRect(0,0,128,128);
 const shadow=new T.Mesh(new T.PlaneGeometry(6.15,3.45),new T.MeshBasicMaterial({map:new T.CanvasTexture(c),transparent:true,depthWrite:false}));
 shadow.rotation.x=-Math.PI/2;shadow.position.y=-.012;shadow.renderOrder=2;s.add(shadow);
 return {s,shadow,room,floor,reflection};
}
const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const assetSettings={m4:{paint:/body15|mesheszx|mesheswhite4/i,lamps:/led111/i},m3:{paint:/coloured_gloss/i,lamps:/running_front|headlight_low/i}};
export async function loadCar(model){
 const a=assetSettings[model.id];const {scene:root}=await loader.loadAsync('/media/'+model.id+'.glb');
 const b1=new T.Box3().setFromObject(root),sz=b1.getSize(vec());if(sz.z>sz.x)root.rotation.y=Math.PI/2;
 root.rotation.y+=model.yaw||0;root.updateMatrixWorld(true);
 const b2=new T.Box3().setFromObject(root),w=b2.getSize(vec()).x;root.scale.multiplyScalar(model.length/w);root.updateMatrixWorld(true);
 const b=new T.Box3().setFromObject(root),c=b.getCenter(vec());root.position.sub(vec(c.x,b.min.y,c.z));
 const paint=new Set(),lights=new Set();
 root.traverse(o=>{if(o.isMesh){
  const group=Array.isArray(o.material)?o.material:[o.material];
  for(const m of group){
   if(model.id==='m4'&&/livery/.test(m.name.toLowerCase()))o.visible=false;
   if(model.id==='m4'&&/chrome51/i.test(m.name)){m.color.set('#353a3f');m.metalness=.74;m.roughness=.31;}
   if(model.id==='m4'&&/m8rim/.test(m.name.toLowerCase())){m.color.set('#545966');m.metalness=.8;m.roughness=.32;}
   if(model.id==='m3'&&/rim/i.test(m.name)){m.color.set('#535862');m.metalness=.75;}
   if(a.paint.test(m.name)){m.map=null;m.metalness=.63;m.roughness=.24;m.envMapIntensity=1.2;if('clearcoat' in m){m.clearcoat=.78;m.clearcoatRoughness=.16;}paint.add(m);}
   if(a.lamps.test(m.name)&&m.emissive){m.emissive.set('#b9e5ff');m.emissiveIntensity=.28;lights.add(m);}
  }
  o.castShadow=true;
 }});
 return {group:root,paint:[...paint],lights:[...lights]};
}
function buildTruck(){
 const g=new T.Group(),dark=mat('#242a34',.48,.27),side=mat('#465367',.52,.34),tire=mat('#101116',.08,.75),wheel=mat('#7a8590',.63,.27),glass=mat('#151e28',.42,.17),red=new T.MeshBasicMaterial({color:'#fa4f58'}),white=new T.MeshBasicMaterial({color:'#b2dcf8'});
 cube(g,6.05,.33,2.35,0,.52,0,dark);
 cube(g,6.02,.11,2.27,0,.74,0,side);
 cube(g,6.02,1.85,.09,0,1.71,-1.13,side);
 cube(g,6.02,.11,2.28,0,2.61,0,side);
 cube(g,.09,1.85,2.27,2.98,1.71,0,side);
 const flank=cube(g,6.02,1.84,.09,0,1.71,1.13,side);flank.visible=false;
 for(const z of [-1.13,1.13]){
  cube(g,6,.038,.028,0,2.55,z,white);
  cube(g,6,.041,.028,0,.81,z,white);
  cube(g,.07,1.84,.065,-2.98,1.71,z,side);
  cube(g,.07,.12,.09,-3.045,.57,z,red);
 }
 cube(g,1.84,1.39,2.15,4,.99,0,dark);cube(g,1.41,.96,2.02,3.89,1.89,0,side);
 cube(g,.045,.54,1.80,4.612,1.97,0,glass);
 for(const z of [-1.023,1.023]){cube(g,.69,.52,.04,4.08,1.95,z,glass);cube(g,.08,.13,.31,4.93,.83,z*.76,white);}
 for(const x of [-2.02,-1.28,3.98])for(const z of [-1.09,1.09]){
  const w=new T.Mesh(new T.CylinderGeometry(.39,.39,.27,30),tire);w.rotation.x=Math.PI/2;w.position.set(x,.38,z);g.add(w);
  const rim=new T.Mesh(new T.CylinderGeometry(.20,.20,.021,24),wheel);rim.rotation.x=Math.PI/2;rim.position.set(x,.38,z+Math.sign(z)*.142);g.add(rim);
 }
 const gate=new T.Group();gate.position.set(-3,.73,0);g.add(gate);
 cube(gate,2.85,.075,2.21,-1.425,0,0,side);
 for(let j=0;j<10;j++)cube(gate,.025,.018,2.15,-.15-j*.26,.041,0,dark);
 return {g,gate,flank};
}
function bow(length){
 const group=new T.Group(),r=new T.MeshPhysicalMaterial({color:'#bd193d',metalness:.4,roughness:.29,clearcoat:.7,side:T.DoubleSide});
 const line=(p,radius)=>{const curve=new T.CatmullRomCurve3(p.map(a=>vec(...a)));const m=new T.Mesh(new T.TubeGeometry(curve,40,radius,9,false),r);group.add(m)};

 for(const sign of [-1,1]){
  line([[0,1.51,0],[.06,1.49,sign*.55],[.10,1.24,sign*.79],[.12,.94,sign*1.03],[.12,.49,sign*1.03]],.067);
  line([[0,1.53,0],[-.12,1.83,sign*.23],[-.07,1.84,sign*.48],[.17,1.68,sign*.43],[.06,1.53,0]],.062);
  line([[0,1.54,0],[.21,1.51,sign*.21],[.49,1.485,sign*.32]],.046);
 }
 cube(group,.16,.115,.22,.01,1.54,0,r);
 return group;
}
function makeRoad(){
 const g=new T.Group(),asphalt=mat('#181e27',.08,.82),verge=mat('#26333e',.04,.87);
 cube(g,190,.095,8,54,-.041,0,asphalt);
 for(const side of [-1,1]){
  cube(g,190,.1,.063,54,.011,side*3.82,new T.MeshBasicMaterial({color:'#8296ac'}));
  cube(g,190,.17,13,54,-.086,side*10.6,verge);
  cube(g,190,.075,.045,54,.29,side*4.57,mat('#5c6774',.65,.41));
 }
 const stripes=new T.Group();g.add(stripes);
 const marker=new T.MeshBasicMaterial({color:'#8798a9'});
 for(let j=-4;j<14;j++)cube(stripes,1.6,.017,.057,j*4,.014,1.85,marker);
 const range=new T.Group();g.add(range);
 for(let j=0;j<34;j++){
  const peak=new T.Mesh(new T.ConeGeometry(4+3*Math.abs(Math.sin(j*4.1)),3+7*Math.abs(Math.sin(j*1.7)),5),new T.MeshBasicMaterial({color:j%2?'#273643':'#304252'}));
  peak.position.set(-35+j*5.8,.8,-30-3*Math.sin(j));peak.rotation.y=j*.7;range.add(peak);
 }
 return {g,stripes};
}
export function makeViewer(host,status,reduced){
 const canvas=document.createElement('canvas');canvas.tabIndex=0;canvas.setAttribute('aria-label','3D-модель BMW. Стрелки вращают автомобиль.');
 if(new URLSearchParams(location.search).has('capture'))canvas.dataset.capture='true';
 let renderer;try{renderer=setupRenderer(canvas)}catch{status.textContent='3D недоступно. Показан статичный ракурс.';return null;}
 host.append(canvas);
 const {s,shadow,room,floor,reflection}=buildStudio();studioEnv(renderer,s);
 const road=makeRoad();road.g.visible=false;s.add(road.g);
 const studioSky=new T.Color('#343735'),roadSky=new T.Color('#425668');
 const camera=new T.PerspectiveCamera(36,1,.09,155);
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.085;controls.enablePan=false;controls.minDistance=4.9;controls.maxDistance=18;controls.maxPolarAngle=Math.PI*.48;controls.minPolarAngle=.52;controls.enableZoom=true;controls.zoomSpeed=.75;controls.rotateSpeed=.66;
 const truck=buildTruck();truck.g.visible=false;s.add(truck.g);
 const carNode=new T.Group();s.add(carNode);
 let token=0,active=null,selected=null,chosen=null,mode='idle',since=0,ribbon=null,visible=true,size=vec(),raf=0,dirty=true;
 const cache=new Map();const dpr=()=>Math.min(window.devicePixelRatio,1.65);
 function reset(){
  const w=host.clientWidth,h=host.clientHeight,aspect=w/Math.max(1,h);
  const factor=aspect<1.12?Math.max(1,1.07/aspect):1;
  if(w&&h&&w>700)camera.setViewOffset(w,h,-w*.13,-h*.016,w,h);
  else camera.clearViewOffset();
  camera.position.set(5.7*factor,2.35*factor,6.55*factor);controls.target.set(0,.70,0);controls.update();
 }
 reset();
 function sizeCanvas(){
  const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
  if(w!==size.x||h!==size.y){size.set(w,h,0);renderer.setPixelRatio(dpr());renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();if(mode==='idle')reset();}
 }
 const invalidate=()=>{dirty=true;if(!raf&&visible)raf=requestAnimationFrame(frame);};
 const resize=new ResizeObserver(()=>{sizeCanvas();invalidate()});resize.observe(host);
 new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)invalidate()}).observe(host);
 controls.addEventListener('change',invalidate);
 const beam=new T.PointLight('#b7eaff',0,6,2);beam.position.set(2.75,.78,0);carNode.add(beam);
 function color(hex){chosen=hex;active?.paint.forEach(m=>m.color.set(hex));invalidate();}
 function setMode(m){
  mode=m;host.dataset.scene=m;since=performance.now();
  if(mode==='idle'){controls.enabled=true;reset();}
  else {controls.enabled=false;camera.clearViewOffset();}
  invalidate();
 }
 function place(now){
  const time=(now-since)/1000,t=reduced?10:time;
  const onRoad=mode==='depart'&&t>1.65;
  room.visible=floor.visible=reflection.visible=!onRoad;road.g.visible=onRoad;s.background=onRoad?roadSky:studioSky;s.fog.color.copy(onRoad?roadSky:studioSky);
  const car=carNode.position;car.set(0,0,0);shadow.position.set(0,-.012,0);carNode.rotation.set(0,0,0);
  truck.g.visible=mode==='load'||mode==='depart';if(ribbon)ribbon.visible=mode==='gift';
  const light=mode==='gift'&&!reduced&&((t>.15&&t<.33)||(t>.55&&t<.73));
  active?.lights.forEach(m=>m.emissiveIntensity=light?7:.65);beam.intensity=light?8:0;
  if(mode==='idle')return;
  if(mode==='gift'){
   camera.position.set(6.3-smooth(t/2)*.62,2.45,6.4);camera.lookAt(0,.71,0);
   if(ribbon){const p=smooth((t-.55)/1.20);ribbon.scale.setScalar(Math.max(.001,p));ribbon.position.y=(1-p)*.43;}
  } else {
   const leave=mode==='depart'?smooth((t-.60)/3.25):0;
   const load=mode==='load'?smooth(t/2.85):1;
   truck.g.position.set(2.35+leave*21,0,-.12);
   const open=mode==='depart'?smooth(t/.57):0;
   truck.gate.rotation.z=(1-open)*.257+open*(-Math.PI/2);
   truck.flank.visible=mode==='depart'&&t>.52;
   car.set(T.MathUtils.lerp(-5.4,2.22,load)+leave*21,T.MathUtils.lerp(0,.812,smooth((load-.04)/.64)),-.12);
   carNode.rotation.z=.16*Math.sin(Math.PI*smooth(load));shadow.position.x=car.x;
   if(onRoad){
    const x=truck.g.position.x;road.stripes.position.x=x-(t*3%4);
    camera.position.set(x-6.4,2.95,8.9);camera.lookAt(x+.75,1.08,-.12);
   }else {camera.position.set(-6.8,3.15,10.5);camera.lookAt(-.30+leave*4,.93,0);}
  }
 }
 function frame(now){
  raf=0;if(!visible)return;
  sizeCanvas();
  dirty=false;place(now);
  if(mode==='idle')controls.update();
  if(size.x&&size.y)renderer.render(s,camera);
  if(!raf&&(dirty||(mode!=='idle'&&!reduced&&now-since<4800)))raf=requestAnimationFrame(frame);
 }
 raf=requestAnimationFrame(frame);
 function control(key){if(key==='reset'){reset();invalidate();}else if(key==='plus'||key==='minus'){
   const v=camera.position.clone().sub(controls.target),len=v.length(),next=T.MathUtils.clamp(len*(key==='plus'?.83:1.19),controls.minDistance,controls.maxDistance);
   camera.position.copy(controls.target).add(v.setLength(next));controls.update();invalidate();
  }}
 canvas.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Home'].includes(e.key))return;
  e.preventDefault();if(e.key==='Home'||e.key==='+'||e.key==='-'){control(e.key==='Home'?'reset':e.key==='+'?'plus':'minus');return;}
  const sp=new T.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
  if(e.key==='ArrowLeft'||e.key==='ArrowRight')sp.theta+=e.key==='ArrowLeft'?-.14:.14;
  else sp.phi=T.MathUtils.clamp(sp.phi+(e.key==='ArrowUp'?-.10:.10),controls.minPolarAngle,controls.maxPolarAngle);
  camera.position.copy(controls.target).add(vec().setFromSpherical(sp));controls.update();
 });
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();canvas.style.visibility='hidden';status.textContent='3D временно недоступно.'});
 canvas.addEventListener('webglcontextrestored',()=>{canvas.style.visibility='visible';status.textContent='';invalidate()});
 return {paint:color,control,scene:setMode, async select(m,hex){
   const ticket=++token;selected=m;chosen=hex;status.textContent='Загружаем 3D…';canvas.style.visibility='hidden';host.dataset.ready='false';
   try{
    if(!cache.has(m.id))cache.set(m.id,loadCar(m).catch(e=>{cache.delete(m.id);throw e}));
    const a=await cache.get(m.id);if(ticket!==token)return;
    if(active)carNode.remove(active.group);if(ribbon){carNode.remove(ribbon);ribbon.traverse(o=>{if(o.isMesh)o.geometry.dispose()});ribbon.children[0]?.material.dispose()}
    active=a;carNode.add(a.group);
    ribbon=bow(selected.length);ribbon.visible=false;carNode.add(ribbon);color(chosen);
    status.textContent='';canvas.style.visibility='visible';host.dataset.ready='true';host.dataset.model=m.id;sizeCanvas();place(performance.now());renderer.render(s,camera);invalidate();
   } catch(e){if(ticket===token){status.textContent='Модель не загрузилась. Показан статичный ракурс.';console.error(e);}}
 }};
}
