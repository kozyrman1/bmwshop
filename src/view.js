import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {cube,prototypeM5} from './car.js';
const vec=(x,y,z)=>new T.Vector3(x,y,z);
const mat=(c,m=.2,r=.4)=>new T.MeshStandardMaterial({color:c,metalness:m,roughness:r});
const smooth=t=>{t=T.MathUtils.clamp(t,0,1);return t*t*(3-2*t)};
export function setupRenderer(canvas, alpha=false){
 const r=new T.WebGLRenderer({canvas,antialias:true,alpha,powerPreference:'high-performance',preserveDrawingBuffer:canvas?.dataset.capture==='true'});
 r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.09;r.outputColorSpace=T.SRGBColorSpace;
 r.setPixelRatio(Math.min(window.devicePixelRatio,1.65));
 return r;
}
export function studioEnv(r,s){
 const pm=new T.PMREMGenerator(r),room=new RoomEnvironment();
 s.environment=pm.fromScene(room,.045).texture;s.environmentIntensity=.84;
 room.dispose();pm.dispose();
}
export function buildStudio(){
 const s=new T.Scene();s.background=new T.Color('#222a34');s.fog=new T.FogExp2('#262d37',.027);
 const ambient=new T.HemisphereLight('#cfe3ff','#25252e',1.43);s.add(ambient);
 for(const [x,y,z,c,intensity] of [[4,6,4,'#eff6ff',2.25],[-4,5,-4,'#81bcff',2.5],[0,4,7,'#b7c8e4',1.32],[-6,3,4,'#edf3ff',.9]]){
  const l=new T.DirectionalLight(c,intensity);l.position.set(x,y,z);s.add(l);
 }
 const floor=new T.Mesh(new T.PlaneGeometry(160,160),mat('#131820',.34,.68));floor.rotation.x=-Math.PI/2;floor.position.y=-.042;s.add(floor);
 const disc=new T.Mesh(new T.CylinderGeometry(3.48,3.51,.12,96),mat('#252d37',.48,.50));disc.position.y=-.083;s.add(disc);
 const ring=new T.Mesh(new T.RingGeometry(3.43,3.445,96),new T.MeshBasicMaterial({color:'#9aacbe',transparent:true,opacity:.47,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=-.018;s.add(ring);
 const room=new T.Group();s.add(room);
 const wall=mat('#171f29',.25,.78),lit=new T.MeshBasicMaterial({color:'#b3d8f4'}),soft=new T.MeshBasicMaterial({color:'#546978'});
 for(let x=-20;x<23;x+=3.2){
  cube(room,3.15,7,.25,x,3,-8,wall);
  if(x%3<2)cube(room,.026,4.9,.025,x-1.57,2.45,-7.85,soft);
 }
 for(let i=0;i<4;i++)cube(room,34,.026,.016,0,.33+i*.075,-7.84,i===0?lit:soft);
 for(let i=0;i<6;i++)cube(room,17,.04,.10,0,4.6,-6+i*1.1,i%2?soft:lit);
 const cv=document.createElement('canvas');cv.width=128;cv.height=128;const c=cv.getContext('2d'),d=c.createRadialGradient(64,64,8,64,64,64);d.addColorStop(0,'rgba(0,0,0,.78)');d.addColorStop(.6,'rgba(0,0,0,.5)');d.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=d;c.fillRect(0,0,128,128);
 const shadow=new T.Mesh(new T.PlaneGeometry(6.2,3.1),new T.MeshBasicMaterial({map:new T.CanvasTexture(cv),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.012;s.add(shadow);
 return {s,shadow,room,disc,ring};
}
const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const assetSettings={m4:{paint:/body15/i,lamps:/led111/i},m3:{paint:/coloured_gloss/i,lamps:/running_front|headlight_low/i},m5:{paint:/paint|body|carpaint/i,lamps:/headlight|drl/i}};
export async function loadCar(model){
 if(model.id==='m5'&&!model.asset)return prototypeM5();
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
   if(model.id==='m4'&&/m8rim/.test(m.name.toLowerCase())){m.color.set('#545966');m.metalness=.8;m.roughness=.32;}
   if(model.id==='m3'&&/rim/i.test(m.name)){m.color.set('#535862');m.metalness=.75;}
   if(a.paint.test(m.name)){m.map=null;m.metalness=.57;m.roughness=.25;m.envMapIntensity=1.15;paint.add(m);}
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
 const {s,shadow,room,disc,ring}=buildStudio();studioEnv(renderer,s);
 const road=makeRoad();road.g.visible=false;s.add(road.g);
 const studioSky=new T.Color('#222a34'),roadSky=new T.Color('#425668');
 const camera=new T.PerspectiveCamera(38,1,.09,155);
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.085;controls.enablePan=false;controls.minDistance=4.7;controls.maxDistance=13;controls.maxPolarAngle=Math.PI*.487;controls.minPolarAngle=.52;controls.enableZoom=false;controls.rotateSpeed=.63;
 const truck=buildTruck();truck.g.visible=false;s.add(truck.g);
 const carNode=new T.Group();s.add(carNode);
 let token=0,active=null,selected=null,chosen=null,mode='idle',since=0,ribbon=null,visible=true,size=vec(),raf=0,dirty=true;
 const cache=new Map();const dpr=()=>Math.min(window.devicePixelRatio,1.65);
 function reset(){
  const aspect=host.clientWidth/Math.max(1,host.clientHeight),factor=aspect<1.40?1.32:1;
  camera.position.set(5.2*factor,2.15*factor,5.25*factor);controls.target.set(0,.61,0);controls.update();
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
  else {controls.enabled=false;}
  invalidate();
 }
 function place(now){
  const time=(now-since)/1000,t=reduced?10:time;
  const onRoad=mode==='depart'&&t>1.65;
  room.visible=disc.visible=ring.visible=!onRoad;road.g.visible=onRoad;s.background=onRoad?roadSky:studioSky;s.fog.color.copy(onRoad?roadSky:studioSky);
  const car=carNode.position;car.set(0,0,0);shadow.position.set(0,-.012,0);carNode.rotation.set(0,0,0);
  truck.g.visible=mode==='load'||mode==='depart';if(ribbon)ribbon.visible=mode==='gift';
  const light=mode==='gift'&&!reduced&&((t>.15&&t<.33)||(t>.55&&t<.73));
  active?.lights.forEach(m=>m.emissiveIntensity=light?7:.30);beam.intensity=light?8:0;
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
 function control(key){if(key==='reset')reset();else if(key==='plus'||key==='minus'){
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
