import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {cube} from './car.js';
import {rigLocal} from './rig.js';
import {addGallery,makeTransport,roadScene} from './garage.js';
import {bodyColors,interiorColors,defaultPaint} from './data.js';
const vec=(x,y,z)=>new T.Vector3(x,y,z);
const mat=(c,m=.2,r=.4)=>new T.MeshStandardMaterial({color:c,metalness:m,roughness:r});
const smooth=t=>{t=T.MathUtils.clamp(t,0,1);return t*t*(3-2*t)};
export function setupRenderer(canvas, alpha=false){
 const r=new T.WebGLRenderer({canvas,antialias:true,alpha,powerPreference:'high-performance',preserveDrawingBuffer:canvas?.dataset.capture==='true'});
 r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.04;r.outputColorSpace=T.SRGBColorSpace;
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
 softbox(.5,5.5,.3,8,3.6,3.75);
 softbox(6,2.65,1,8,1.7,2.9);
 softbox(-4,3.45,-3.7,7.4,1,3.5);
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
const assetSettings={
 m4:{paint:/body15|mesheszx/i,lamps:/led111/i},
 m3:{paint:/coloured_gloss/i,lamps:/running_front|headlight_low/i}
};
function isPainted(id,mesh,material){
 if(assetSettings[id].paint.test(material.name))return true;
 return id==='m3'&&material.name==='m3g81law'&&/_(hood|body|fender_[RL]|door_[FRL]{2}|bumper_[FR]|tailgate|mirror_[RL]_a)_m3g81law_0$/i.test(mesh.name);
}
export async function loadCar(model, interactive=true){
 if(model.id==='m5')return {group:new T.Group(),paint:[],trim:[],lights:[],doors:[],wheels:[]};
 const a=assetSettings[model.id];const {scene:root}=await loader.loadAsync('/media/'+model.id+'.glb');
 const b1=new T.Box3().setFromObject(root),sz=b1.getSize(vec());if(sz.z>sz.x)root.rotation.y=Math.PI/2;
 root.rotation.y+=model.yaw||0;root.updateMatrixWorld(true);
 const b2=new T.Box3().setFromObject(root),w=b2.getSize(vec()).x;root.scale.multiplyScalar(model.length/w);root.updateMatrixWorld(true);
 const b=new T.Box3().setFromObject(root),c=b.getCenter(vec());root.position.sub(vec(c.x,b.min.y,c.z));
 const wrapper=new T.Group();wrapper.add(root);wrapper.updateMatrixWorld(true);
 const paint=new Set(),lights=new Set(),made=new Map();
 root.traverse(o=>{if(o.isMesh){
  if(model.id==='m3'&&/^m3g80law_(door_|doorpanel_|headlight_)/i.test(o.name))o.visible=false;
  const group=Array.isArray(o.material)?o.material:[o.material];
  const newGroup=group.map(m=>{
   if(model.id==='m4'&&/livery/.test(m.name.toLowerCase()))o.visible=false;
   if(model.id==='m4'&&/chrome51/i.test(m.name)){m.color.set('#353a3f');m.metalness=.74;m.roughness=.31;}
   if(model.id==='m4'&&/m8rim/.test(m.name.toLowerCase())){m.color.set('#545966');m.metalness=.8;m.roughness=.32;}
   if(model.id==='m3'&&/rim/i.test(m.name)){m.color.set('#535862');m.metalness=.75;}
   let finish=m;
   if(isPainted(model.id,o,m)){
    if(!made.has(m))made.set(m,new T.MeshPhysicalMaterial({
      name:m.name,metalness:.43,roughness:.34,clearcoat:.52,clearcoatRoughness:.31,
      side:m.side,envMapIntensity:.9
    }));
    finish=made.get(m);paint.add(finish);
   }
   if(model.id==='m3'&&/chrome_ext/i.test(m.name)){m.color.set('#4d545a');m.metalness=.68;m.roughness=.35;}
   if(model.id==='m4'&&/meshesblack161|pillars1/i.test(m.name)){m.color.set('#262a30');m.roughness=Math.max(.37,m.roughness);}
   if(model.id==='m4'&&/mesheswhite4/i.test(m.name)){m.color.set('#262932');m.roughness=Math.max(.46,m.roughness);}
   if(model.id==='m3'&&/glass_saphir|glass_clear/i.test(m.name)){m.roughness=Math.max(.13,m.roughness);m.depthWrite=false;}
   if(a.lamps.test(m.name)&&m.emissive){m.emissive.set('#b9e5ff');m.emissiveIntensity=.28;lights.add(m);}
   return finish;
  });
  o.material=Array.isArray(o.material)?newGroup:newGroup[0];o.castShadow=true;
 }});
 const rig=interactive?rigLocal(root,wrapper,model):{doors:[],trim:[],wheels:[]};
 return {group:wrapper,paint:[...paint],lights:[...lights],...rig};
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
export function makeViewer(host,status,reduced,opts={}){
 const canvas=document.createElement('canvas');canvas.tabIndex=0;canvas.setAttribute('aria-label','Трёхмерный зал BMW. Стрелки меняют ракурс.');
 let renderer;try{renderer=setupRenderer(canvas)}catch{status.textContent='3D недоступно. Показан статичный ракурс.';return null;}
 host.append(canvas);
 const {s,shadow,room,floor,reflection}=buildStudio();studioEnv(renderer,s);
 const garage=addGallery(room,s), road=roadScene();s.add(road);
 const studioSky=new T.Color('#343735'),roadSky=new T.Color('#364654');
 const camera=new T.PerspectiveCamera(37,1,.065,155);
 const controls=new OrbitControls(camera,canvas);
 controls.enableDamping=true;controls.dampingFactor=.085;controls.enablePan=false;controls.minDistance=4.0;controls.maxDistance=29;controls.maxPolarAngle=Math.PI*.484;controls.minPolarAngle=.48;controls.zoomSpeed=.75;controls.rotateSpeed=.66;
 const truck=makeTransport();truck.g.visible=false;s.add(truck.g);
 const carNode=new T.Group(),exhibits=new T.Group(),displayNodes=new Map();s.add(carNode,exhibits);
 let token=0,active=null,selected=null,chosen=null,insideColor=interiorColors[0][0],mode='idle',since=0,ribbon=null,visible=true,size=vec(),raf=0,dirty=true;
 let doorOpen=false,doorMove={from:0,to:0,time:0},doorAngle=0,view='car',interiorAngle={x:0,y:0},viewFlight=null,sceneDone=null;
 const cache=new Map();
 let portraitTexture;
 function exhibitPortrait(){
  const stage=new T.Group(),width=4.5,height=2.53;
  if(!portraitTexture)portraitTexture=new T.TextureLoader().load('/media/m5-studio.webp',invalidate);
  portraitTexture.colorSpace=T.SRGBColorSpace;
  const picture=new T.Mesh(new T.PlaneGeometry(width,height),new T.MeshBasicMaterial({map:portraitTexture,toneMapped:false}));
  picture.position.set(0,1.55,-.7);stage.add(picture);
  const frame=mat('#20252a',.5,.35);
  cube(stage,width+.11,.09,.13,0,.25,-.72,frame);cube(stage,width+.11,.09,.13,0,2.84,-.72,frame);
  cube(stage,.09,2.59,.13,-2.28,1.54,-.72,frame);cube(stage,.09,2.59,.13,2.28,1.54,-.72,frame);
  return stage;
 }
 const dpr=()=>Math.min(window.devicePixelRatio,innerWidth<=700?1.36:1.62);
 const invalidate=()=>{dirty=true;if(!raf&&visible)raf=requestAnimationFrame(frame);};
 function setPerspective(){
  const w=host.clientWidth,h=host.clientHeight;
  camera.aspect=w/Math.max(h,1);
  if(mode==='idle'&&view==='car'&&w>700)camera.setViewOffset(w,h,-w*.115,-h*.018,w,h);
  else camera.clearViewOffset();
  camera.updateProjectionMatrix();
 }
 function targetPose(next){
  const w=host.clientWidth,h=host.clientHeight,aspect=w/Math.max(1,h),factor=aspect<1.12?Math.max(1,1.05/aspect):1;
  if(next==='cockpit')return [vec(-.205,1.15,-.385),vec(1.2,.95,-.18),64];
  if(next==='hall')return [vec(1.25,3.95,18.0*Math.max(1,factor*.94)),vec(0,.43,-1.85),45];
  if(doorOpen)return [vec(4.65*factor,2.13*factor,-6.0*factor),vec(.0,.78,0),37];
  return [vec(4.78*factor,1.98*factor,5.80*factor),vec(0,.73,0),37];
 }
 function applyPose(next,animate=true){
  const [position,target,fov]=targetPose(next),from=camera.position.clone(),previous=controls.target.clone(),f=camera.fov;
  view=next;host.dataset.view=view;interiorAngle={x:0,y:0};setPerspective();
  controls.enabled=false;
  if(reduced||!animate){camera.position.copy(position);controls.target.copy(target);camera.fov=fov;camera.updateProjectionMatrix();camera.lookAt(target);controls.enabled=view!=='cockpit'&&mode==='idle';if(controls.enabled)controls.update();}
  else viewFlight={from,position,previous,target,f,fov,since:performance.now()};
  invalidate();
 }
 applyPose('car',false);
 function sizeCanvas(){
  const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
  if(w!==size.x||h!==size.y){size.set(w,h,0);renderer.setPixelRatio(dpr());renderer.setSize(w,h,false);setPerspective();if(mode==='idle'&&!viewFlight)applyPose(view,false);}
 }
 new ResizeObserver(()=>{sizeCanvas();invalidate()}).observe(host);
 new IntersectionObserver(([e])=>{visible=e.isIntersecting;if(visible)invalidate()}).observe(host);
 controls.addEventListener('change',invalidate);
 function prefetch(m,low=false){
  const key=m.id+(low?'-display':'');
  if(!cache.has(key))cache.set(key,loadCar(m,!low).catch(e=>{cache.delete(key);throw e}));
  return cache.get(key);
 }
 function park(){
  if(!selected)return;
  const others=(opts.models||[]).filter(x=>x.id!==selected.id);
  if(selected.id==='m5'&&!displayNodes.has('m5')){const g=exhibitPortrait();displayNodes.set('m5',g);exhibits.add(g);}
  for(const item of displayNodes.values())item.visible=false;
  if(selected.id==='m5'){const g=displayNodes.get('m5');g.visible=true;g.position.set(0,0,0);g.rotation.y=0;g.scale.setScalar(1);}
  others.forEach((m,i)=>{
   const show=a=>{
    if(!selected||selected.id===m.id)return;
    const side=i?1:-1;a.group.position.set(side*7.1,.012,0);
    a.group.rotation.y=side*.22;a.group.scale.setScalar(.91);
    a.group.visible=true;a.group.userData.model=m.id;
    a.paint.forEach(p=>p.color.set(bodyColors[defaultPaint[m.id]][0]));
    displayNodes.set(m.id,a.group);exhibits.add(a.group);invalidate();
   };
   if(displayNodes.has(m.id)){
    const g=displayNodes.get(m.id);g.position.set(i?7.1:-7.1,.012,0);g.rotation.y=i?.22:-.22;g.scale.setScalar(.91);g.visible=true;
   }else if(m.id==='m5'){show({group:exhibitPortrait(),paint:[]});}
   else prefetch(m,true).then(a=>{if((opts.models||[]).filter(x=>x.id!==selected?.id)[i]?.id===m.id)show(a);}).catch(()=>{});
  });
 }
 function paint(hex){chosen=hex;active?.paint.forEach(m=>m.color.set(hex));invalidate();}
 function trim(hex){insideColor=hex;active?.trim.forEach(m=>{if(m.map)m.map=null;m.color.set(hex);});invalidate();}
 function setDoor(open,moveCamera=true){
  if(!active?.doors.length)return false;
  doorOpen=open;host.dataset.door=open?'open':'closed';
  doorMove={from:doorAngle,to:open?1:0,time:performance.now()};
  if(moveCamera&&view!=='cockpit')applyPose('car');
  invalidate();return true;
 }
 function setMode(next){
  if(sceneDone){sceneDone(false);sceneDone=null;}
  mode=next;host.dataset.scene=mode;since=performance.now();viewFlight=null;
  if(mode==='idle'){camera.fov=37;applyPose('car',false);}
  else{
   controls.enabled=false;camera.clearViewOffset();camera.fov=innerWidth<=700?49:38;camera.updateProjectionMatrix();
   setDoor(false,false);
  }
  invalidate();
  if(next==='load'||next==='depart')return new Promise(resolve=>{sceneDone=resolve;});
  return Promise.resolve(true);
 }
 const durations={load:6600,depart:4550,gift:2800};
 function place(now){
  const elapsed=(now-since)/1000,t=reduced?(durations[mode]??0)/1000:elapsed;
  const driving=mode==='load'||mode==='loaded'||mode==='depart';
  const onRoad=mode==='depart'&&t>2.45;
  room.visible=floor.visible=reflection.visible=!driving;
  const stand=displayNodes.get('m5');if(stand&&selected?.id==='m5')stand.visible=mode==='idle'&&view==='hall';
  garage.visible=driving&&!onRoad;road.visible=onRoad;exhibits.visible=mode==='idle';
  s.background=onRoad?roadSky:studioSky;s.fog.color.copy(onRoad?roadSky:studioSky);
  const car=carNode.position;car.set(0,0,0);shadow.position.set(0,-.012,0);shadow.visible=mode==='idle'||mode==='gift';
  carNode.rotation.set(0,0,0);
  truck.g.visible=driving;if(ribbon)ribbon.visible=mode==='gift'&&selected?.id!=='m5';
  active?.lights.forEach(m=>m.emissiveIntensity=driving?1.82:.82);
  if(mode==='idle'){
   doorAngle=T.MathUtils.lerp(doorMove.from,doorMove.to,reduced?1:smooth((now-doorMove.time)/480));
   for(const d of active?.doors||[])d.pivot.rotation.y=d.angle*doorAngle;
   return;
  }
  for(const d of active?.doors||[])d.pivot.rotation.y=0;
  if(mode==='gift'){
   camera.position.set(5.8-smooth(t/2)*.53,2.2,6.5);camera.lookAt(0,.74,0);
   if(ribbon){const f=smooth((t-.45)/1.05);ribbon.scale.setScalar(Math.max(.001,f));}
   return;
  }
  const truckX=4.25;
  const loadT=mode==='load'?smooth((t-1.60)/2.99):1;
  const entry=mode==='load'?smooth(t/1.52):1;
  const departT=mode==='depart'?T.MathUtils.clamp(t/4.5,0,1):0;
  const drive=mode==='depart'?departT*departT*32:0;
  truck.g.position.set(truckX+drive,0,0);
  const rampDown=.35,rampUp=-Math.PI/2;
  const ramp=mode==='load'?smooth((t-4.68)/1.18):1;
  truck.gate.rotation.z=T.MathUtils.lerp(rampDown,rampUp,ramp);
  truck.near.visible=mode!=='load'||t<1.55||t>4.65;
  truck.wheels.forEach(w=>w.rotation.z=-drive/.46);
  let x=T.MathUtils.lerp(-7.4,truckX-.18,loadT);
  let z=0;
  if(mode==='load'&&t<1.6){x=-8.08+.68*entry;z=T.MathUtils.lerp(-5.9,0,entry);carNode.rotation.y=-1.48*(1-entry);}
  const r=smooth((x+3.45)/5.2);
  car.set(x+drive,.903*r,z);carNode.rotation.z=.19*Math.sin(r*Math.PI);
  for(const w of active?.wheels||[])w.rotation.z=driving?-((x+8.3)/.37):0;
  if(mode==='load'){
   if(t<1.67){camera.position.set(-11.4+entry*1.3,2.3,6.3+entry*1.0);camera.lookAt(-6.8+entry*2.0,.81,-1.6+entry*.8);}
   else if(t<4.66){
    const a=smooth((t-1.67)/2.99);
    camera.position.set(-6.25+3.5*a,2.3+.6*a,8.2+2.1*a);camera.lookAt(-2.5+4.8*a,1.00,.0);
   }else{
    const a=smooth((t-4.66)/1.94);
    camera.position.set(-2.65+a*.8,2.9,10.4+a*1.6);camera.lookAt(2.2+a*1.2,1.35,0);
   }
  }else if(mode==='loaded'){
   camera.position.set(-1.85,2.9,12.0);camera.lookAt(3.4,1.35,0);
  }else if(onRoad){
   const x0=truck.g.position.x;
   const a=smooth((t-2.45)/2.10);camera.position.set(x0-8.8-a*9.5,2.77+a*.24,8.7+a*1.8);camera.lookAt(x0+.38-a*3.3,1.30,0);
  }else{
   camera.position.set(-1.85+drive*.35,2.9,12.0);camera.lookAt(3.4+drive*.68,1.35,0);
  }
 }
 function mapExhibits(){
  if(mode!=='idle'||view!=='hall'){opts.onMarkers?.([]);return;}
  const points=[...displayNodes].filter(([,g])=>g.visible).map(([id,g])=>{
   const at=g.position.clone().add(vec(0,id==='m5'?2.84:1.64,id==='m5'?-.7:0)).project(camera);
   return {id,x:(at.x*.5+.5)*100,y:(.5-at.y*.5)*100,visible:Math.abs(at.x)<.95&&Math.abs(at.y)<.9&&at.z<1};
  });
  if(selected&&selected.id!=='m5'){const a=vec(0,1.7,0).project(camera);points.push({id:selected.id,x:(a.x*.5+.5)*100,y:(.5-a.y*.5)*100,visible:Math.abs(a.x)<.95&&Math.abs(a.y)<.9&&a.z<1});}
  opts.onMarkers?.(points);
 }
 function frame(now){
  raf=0;if(!visible)return;
  sizeCanvas();dirty=false;place(now);
  if(viewFlight&&mode==='idle'){
   const a=smooth((now-viewFlight.since)/740),m=viewFlight;
   camera.position.lerpVectors(m.from,m.position,a);controls.target.lerpVectors(m.previous,m.target,a);
   camera.fov=T.MathUtils.lerp(m.f,m.fov,a);camera.updateProjectionMatrix();camera.lookAt(controls.target);
   if(a===1){viewFlight=null;controls.enabled=view!=='cockpit';if(controls.enabled)controls.update();}
  }else if(controls.enabled&&mode==='idle')controls.update();
  if(size.x&&size.y){renderer.render(s,camera);mapExhibits();}
  if(sceneDone&&(reduced||now-since>=durations[mode])){
   const fn=sceneDone;sceneDone=null;fn(true);
  }
  if(!raf&&(dirty||viewFlight||(!reduced&&((mode==='idle'&&now-doorMove.time<520)||(durations[mode]&&now-since<durations[mode]+50)))))raf=requestAnimationFrame(frame);
 }
 function control(key){
  if(key==='reset'){applyPose(view);return;}
  if(view==='cockpit'||(key!=='plus'&&key!=='minus'))return;
  const v=camera.position.clone().sub(controls.target),next=T.MathUtils.clamp(v.length()*(key==='plus'?.83:1.19),controls.minDistance,controls.maxDistance);
  camera.position.copy(controls.target).add(v.setLength(next));controls.update();invalidate();
 }
 let pointer=null;
 const ray=new T.Raycaster();
 function shiftCab(dx,dy){
  if(view!=='cockpit'||viewFlight)return;
  interiorAngle.x=T.MathUtils.clamp(interiorAngle.x-dx*.006,-1.37,1.37);
  interiorAngle.y=T.MathUtils.clamp(interiorAngle.y+dy*.006,-.6,.62);
  const {x,y}=interiorAngle;
  camera.lookAt(camera.position.clone().add(vec(Math.cos(y)*Math.cos(x),Math.sin(y)-.08,Math.cos(y)*Math.sin(x))));invalidate();
 }
 canvas.addEventListener('pointerdown',e=>{pointer={x:e.clientX,y:e.clientY,fromX:e.clientX,fromY:e.clientY};if(view==='cockpit')canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(!pointer)return;if(view==='cockpit')shiftCab(e.clientX-pointer.x,e.clientY-pointer.y);pointer.x=e.clientX;pointer.y=e.clientY;});
 canvas.addEventListener('pointercancel',()=>{pointer=null;});
 canvas.addEventListener('pointerup',e=>{
  if(pointer&&mode==='idle'&&view==='hall'&&Math.hypot(e.clientX-pointer.fromX,e.clientY-pointer.fromY)<7){
   const b=canvas.getBoundingClientRect();
   ray.setFromCamera({x:(e.clientX-b.left)/b.width*2-1,y:1-(e.clientY-b.top)/b.height*2},camera);
   let chosen;
   for(const [id,g] of [[selected?.id,carNode],...displayNodes])if(id&&g.visible){
    const box=new T.Box3().setFromObject(g);
    const hit=ray.ray.intersectBox(box,vec());
    if(hit&&(!chosen||hit.distanceTo(camera.position)<chosen.dist))chosen={id,dist:hit.distanceTo(camera.position)};
   }
   if(chosen)opts.onPick?.(chosen.id);
  }
  pointer=null;
 });
 canvas.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','Home'].includes(e.key))return;
  e.preventDefault();if(e.key==='Home'||e.key==='+'||e.key==='-'){control(e.key==='Home'?'reset':e.key==='+'?'plus':'minus');return;}
  if(view==='cockpit'){shiftCab(e.key==='ArrowLeft'?20:e.key==='ArrowRight'?-20:0,e.key==='ArrowUp'?20:e.key==='ArrowDown'?-20:0);return;}
  const sp=new T.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
  if(e.key==='ArrowLeft'||e.key==='ArrowRight')sp.theta+=e.key==='ArrowLeft'?-.14:.14;
  else sp.phi=T.MathUtils.clamp(sp.phi+(e.key==='ArrowUp'?-.10:.10),controls.minPolarAngle,controls.maxPolarAngle);
  camera.position.copy(controls.target).add(vec().setFromSpherical(sp));controls.update();
 });
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();canvas.style.visibility='hidden';status.textContent='3D временно недоступно.';});
 canvas.addEventListener('webglcontextrestored',()=>{canvas.style.visibility='visible';status.textContent='';invalidate()});
 return {paint,trim,control,scene:setMode,view:applyPose,door:setDoor,loaded(){setMode('loaded');},async select(m,hex,trimHex){
  const ticket=++token;selected=m;chosen=hex;insideColor=trimHex;status.textContent='Загружаем 3D…';host.dataset.ready='false';canvas.style.visibility='hidden';park();
  try{
   const a=await prefetch(m);
   if(ticket!==token)return;
   if(active)carNode.remove(active.group);
   if(ribbon){carNode.remove(ribbon);ribbon.traverse(o=>{if(o.isMesh)o.geometry.dispose()});ribbon.children[0]?.material.dispose();}
   active=a;carNode.add(a.group);
   ribbon=m.id==='m5'?null:bow(m.length);if(ribbon){ribbon.visible=false;carNode.add(ribbon);}
   doorOpen=false;doorAngle=0;doorMove={from:0,to:0,time:0};host.dataset.door='closed';
   paint(chosen);trim(insideColor);
   host.dataset.ready='true';host.dataset.model=m.id;status.textContent='';canvas.style.visibility='visible';
   sizeCanvas();applyPose('car',false);invalidate();
  }catch(e){if(ticket===token){status.textContent='Модель не загрузилась. Показан статичный ракурс.';canvas.style.visibility='hidden';console.error(e);}}
 }};
}
