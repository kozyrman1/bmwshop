import * as T from 'three';
import {cube} from './car.js';
const P=(color,metalness=.2,roughness=.44)=>new T.MeshStandardMaterial({color,metalness,roughness});
const B=(color)=>new T.MeshBasicMaterial({color});
const V=(x,y,z)=>new T.Vector3(x,y,z);

function strip(g,x,y,z,w,h,d,color){
 return cube(g,w,h,d,x,y,z,B(color));
}
function label(g,main,sub,x,y,z,w=4){
 const c=document.createElement('canvas');c.width=1024;c.height=320;
 const a=c.getContext('2d');a.fillStyle='#e8e8e4';a.font='620 117px Arial';a.fillText(main,47,154);
 a.font='500 35px monospace';a.fillStyle='#a5b6bf';a.fillText(sub,51,224);
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;
 const m=new T.Mesh(new T.PlaneGeometry(w,w*.3125),new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,toneMapped:false}));
 m.position.set(x,y,z);g.add(m);return m;
}
export function addGallery(room,scene){
 const wall=P('#45484a',.06,.91),trim=P('#23282b',.24,.57),glass=P('#424a50',.31,.24);
 for(const x of [-10.2,10.5]){
  const i=x<0?1:-1;
  cube(room,.27,5.0,14.7,x,2.5,-.2,wall);
  for(let z=-6.7;z<=6.7;z+=2.45){
   cube(room,.10,3.3,2.30,x+i*.19,2.51,z,glass);
   cube(room,.15,3.52,.07,x+i*.24,2.51,z-1.19,trim);
   strip(room,x+i*.23,4.1,z,.025,.028,2.31,'#e6e9e6');
   strip(room,x+i*.24,.53,z,.025,.018,2.31,'#798186');
  }
 }
 for(const x of [-7.1,0,7.1]){
  const g=new T.Group();g.position.x=x;room.add(g);
  const bay=new T.Mesh(new T.CylinderGeometry(2.72,2.72,.042,96),P('#3b3d3e',.28,.54));bay.position.y=-.018;g.add(bay);
  const line=new T.Mesh(new T.RingGeometry(2.69,2.705,96),new T.MeshBasicMaterial({color:'#9aa5a6',side:T.DoubleSide,transparent:true,opacity:.46}));line.rotation.x=-Math.PI/2;line.position.y=.006;g.add(line);
 }
 const garage=new T.Group();scene.add(garage);
 const graphite=P('#272b2e',.22,.55),concrete=P('#5a5e60',.07,.86),steel=P('#30383f',.32,.38);
 cube(garage,43,.12,16,1,-.09,0,concrete);
 for(let x=-17;x<22;x+=3.15)cube(garage,.016,.012,15,x,-.026,0,graphite);
 for(let z=-6;z<=6;z+=2.8)cube(garage,42,.012,.015,1,-.026,z,graphite);
 cube(garage,10,4.72,.38,-15.1,2.35,-4.05,concrete);
 cube(garage,24,4.72,.38,5.9,2.35,-4.05,concrete);
 cube(garage,4.25,.84,.43,-8.2,4.34,-4.05,concrete);
 cube(garage,4.2,3.9,.35,-8.2,1.96,-8.4,steel);
 for(const x of [-10.32,-6.07]){
  cube(garage,.19,4.0,.32,x,2,-3.8,steel);
  strip(garage,x,.11,-3.59,.11,.06,.045,'#f6ca78');
  strip(garage,x,2.22,-3.60,.027,2.92,.030,'#eaf2f9');
 }
 strip(garage,-8.2,3.89,-3.62,4.16,.041,.05,'#f7e6d1');
 for(let z=-8;z<=-4;z+=1.25)strip(garage,-8.2,3.7,z,3.73,.04,.055,'#aebed1');
 for(const x of [-15,-10,-5,1,6,11,16]){
  cube(garage,4.9,.20,.24,x,4.7,-1.5,graphite);
  strip(garage,x,4.57,-1.5,4.65,.035,.067,'#ebeadf');
 }
 for(let x=-17;x<17;x+=3.1){
  strip(garage,x,-.021,-2.93,1.65,.009,.036,'#b1a17c');
  strip(garage,x,-.021,2.1,1.65,.009,.036,'#b1a17c');
 }
 label(garage,'M LOGISTICS','ENCLOSED VEHICLE TRANSPORT',-3.10,2.78,-3.83,3.9);
 label(garage,'03','DISPATCH BAY',5.5,3.01,-3.83,2.5);
 garage.visible=false;
 return garage;
}
export function makeTransport(){
 const g=new T.Group(),wheels=[];
 const body=P('#252b32',.36,.37),rubber=P('#111316',.02,.87),rim=P('#8b9299',.80,.33),dark=P('#14191d',.27,.47),silver=P('#687078',.64,.33),red=B('#ec2535'),white=B('#d2eaff');
 const glass=new T.MeshPhysicalMaterial({color:'#182a3b',metalness:.23,roughness:.16,clearcoat:.9});
 const t=2.76,z=.0;
 cube(g,7.2,.16,t,0,.71,z,dark);
 cube(g,7.05,.10,t-.16,0,.85,z,silver);
 for(let x=-3.45;x<3.6;x+=.30)cube(g,.023,.012,t-.22,x,.904,0,dark);
 cube(g,7.16,.12,t,0,3.1,0,body);
 const flank=cube(g,7.16,2.23,.13,0,1.98,t/2,body);
 cube(g,7.16,2.23,.13,0,1.98,-t/2,body);
 cube(g,.13,2.23,t,3.56,1.98,0,body);
 const near=new T.Group();g.add(near);near.add(flank);
 for(const side of [-1,1]){
  const p=side===1?near:g;
  cube(p,7.15,.08,.12,0,1.1,side*1.421,silver);
  cube(p,7.15,.052,.10,0,2.994,side*1.420,silver);
  for(let x=-3.48;x<=3.54;x+=.48)cube(p,.027,1.83,.029,x,2.05,side*1.459,dark);
  for(const x of [-3.19,-1.63,1.02,3.11])strip(g,x,.87,side*1.421,.08,.037,.023,'#eead5a');
  strip(g,-3.624,.79,side*1.13,.041,.112,.29,'#f24b4e');
  strip(g,-3.620,2.94,side*1.25,.041,.057,.092,'#f44344');
 }
 const tag=label(near,'M','PRECISION TRANSPORT',.22,2.25,1.46,2.6);tag.position.z=1.47;
 const cab=new T.Group();g.add(cab);
 const cabShape=new T.Shape();[[3.40,.42],[5.75,.42],[5.79,1.29],[5.59,2.17],[5.32,2.56],[3.83,2.56],[3.62,2.30],[3.48,1.31]].forEach(([x,y],i)=>i?cabShape.lineTo(x,y):cabShape.moveTo(x,y));cabShape.closePath();
 const bodyMesh=new T.Mesh(new T.ExtrudeGeometry(cabShape,{depth:2.25,bevelEnabled:true,bevelThickness:.087,bevelSize:.077,bevelSegments:3}),body);bodyMesh.position.z=-1.125;cab.add(bodyMesh);
 const wind=cube(cab,.076,.67,2.02,5.625,1.96,0,glass);wind.rotation.z=.22;
 for(const side of [-1,1]){
  const w=cube(cab,1.32,.58,.036,4.56,1.91,side*1.212,glass);w.rotation.z=-.045;
  cube(cab,.062,.66,.04,4.01,1.87,side*1.235,dark);
  cube(cab,.24,.052,.045,4.28,1.39,side*1.231,silver);
  cube(cab,.105,.075,.4,5.43,1.91,side*1.32,dark);
  cube(cab,.145,.30,.084,5.52,1.83,side*1.53,silver);
  strip(cab,5.847,.77,side*.87,.027,.12,.37,'#d9eeff');
  strip(cab,5.846,.607,side*.87,.025,.032,.34,'#a5c6e9');
  cube(cab,.81,.065,.27,4.09,.51,side*1.23,silver);
 }
 for(let i=0;i<7;i++)cube(cab,.042,.041,1.10,5.875,.56+i*.086,0,dark);
 cube(cab,.122,.105,2.09,5.82,.43,0,silver);
 for(const x of [-2.10,-1.14,2.95,4.87])for(const side of [-1,1]){
  const wheel=new T.Group();wheel.position.set(x,.462,side*(x===4.87?1.12:1.23));g.add(wheel);wheels.push(wheel);
  const disk=(r,h,at,mat)=>{const m=new T.Mesh(new T.CylinderGeometry(r,r,h,48),mat);m.rotation.x=Math.PI/2;m.position.z=side*at;wheel.add(m);};
  disk(.46,.29,0,rubber);disk(.272,.033,.151,rim);disk(.12,.045,.177,silver);
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4;const bolt=new T.Mesh(new T.SphereGeometry(.025,8,6),dark);bolt.position.set(Math.cos(a)*.17,Math.sin(a)*.17,side*.18);wheel.add(bolt);
  }
 }
 const gate=new T.Group();gate.position.set(-3.59,.9,0);g.add(gate);
 cube(gate,2.56,.106,2.58,-1.28,0,0,silver);
 for(let j=0;j<15;j++)cube(gate,.026,.021,2.49,-.09-j*.166,.062,0,dark);
 for(const side of [-1,1])strip(gate,-1.25,.077,side*1.26,2.48,.017,.024,'#c4a56c');
 strip(gate,-2.49,.069,0,.046,.021,2.45,'#e26b5e');
 return {g,gate,near,wheels};
}
export function roadScene(){
 const g=new T.Group(),asphalt=P('#1d252c',.07,.83),edge=P('#343c41',.10,.76);
 cube(g,138,.10,8,52,-.055,0,asphalt);
 for(const side of [-1,1]){
  cube(g,138,.1,10,52,-.098,side*9.05,edge);
  strip(g,52,.003,side*3.79,138,.008,.057,'#92a3af');
  cube(g,138,.10,.06,52,.31,side*4.58,P('#626f79',.65,.4));
 }
 for(let x=-15;x<=100;x+=6){
  strip(g,x,.004,1.83,2.8,.01,.068,'#a6b1ba');
  const pole=cube(g,.07,4.5,.075,x,2.15,-4.8,P('#45505a',.45,.45));
  strip(g,pole.position.x,4.36,-4.52,.22,.05,.66,'#ecf6ff');
  for(const side of [-1,1])cube(g,.077,.55,.066,x,.20,side*4.57,edge);
 }
 for(let i=0;i<30;i++){
  const x=i*4.05-18;
  cube(g,2.3+Math.sin(i)*.67,1.5+Math.pow(Math.cos(i*.67),2)*6.1,3.9,x,.22+Math.pow(Math.cos(i*.67),2)*2.7,-15-Math.sin(i)*4.5,P(i%2?'#293843':'#394953',.1,.79));
 }
 g.visible=false;return g;
}
