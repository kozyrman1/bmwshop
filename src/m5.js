import * as T from 'three';
import {cube} from './car.js';
const P=(color,metalness=.15,roughness=.4)=>new T.MeshPhysicalMaterial({color,metalness,roughness});
const V=(x,y,z)=>new T.Vector3(x,y,z);
function mesh(g,geo,mat,x=0,y=0,z=0){
 const m=new T.Mesh(geo,mat);m.position.set(x,y,z);g.add(m);return m;
}
function blob(g,mat,x,y,z,a,b,c){
 const o=mesh(g,new T.SphereGeometry(1,40,22),mat,x,y,z);o.scale.set(a,b,c);return o;
}
function path(g,points,mat,width=.015){
 const curve=new T.CatmullRomCurve3(points.map(p=>V(...p)));
 return mesh(g,new T.TubeGeometry(curve,Math.max(20,points.length*10),width,8,false),mat);
}
function panel(g,points,m){
 const c=points.reduce((a,b)=>a.add(V(...b)),V(0,0,0)).multiplyScalar(1/points.length);
 const vertices=[...c.toArray(),...points.flat()],ids=[];
 for(let i=0;i<points.length;i++)ids.push(0,i+1,(i+1)%points.length+1);
 const q=new T.BufferGeometry();q.setAttribute('position',new T.Float32BufferAttribute(vertices,3));q.setIndex(ids);q.computeVertexNormals();
 return mesh(g,q,m);
}
function loft(g,rows,m,n=72){
 const vertices=[],ids=[],curves=[];
 for(let j=0;j<n;j++){
  const a=j*Math.PI*2/n,sy=Math.sin(a),sz=Math.cos(a);
  curves.push(new T.CatmullRomCurve3(rows.map(([x,w,b,t])=>V(x,(t+b)/2+Math.sign(sy)*(t-b)/2*Math.pow(Math.abs(sy),.69),w*Math.sign(sz)*Math.pow(Math.abs(sz),.44)))));
 }
 for(let i=0;i<=128;i++)for(const c of curves)vertices.push(...c.getPoint(i/128).toArray());
 for(let i=0;i<128;i++)for(let j=0;j<n;j++){const a=i*n+j,b=i*n+(j+1)%n;ids.push(a,b,a+n,b,b+n,a+n);}
 const q=new T.BufferGeometry();q.setAttribute('position',new T.Float32BufferAttribute(vertices,3));q.setIndex(ids);q.computeVertexNormals();return mesh(g,q,m);
}
function plate(g,x,y,z,outline,depth,mat){
 const shape=new T.Shape();outline.forEach(([a,b],i)=>i?shape.lineTo(a,b):shape.moveTo(a,b));shape.closePath();
 const geo=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelThickness:.012,bevelSize:.014,bevelSegments:3,steps:1});
 const m=mesh(g,geo,mat,x,y,z);m.rotation.y=Math.PI/2;return m;
}
export function seat(g,x,z,leather,black){
 blob(g,leather,x,.48,z,.31,.13,.247);
 const back=blob(g,leather,x-.26,.76,z,.13,.32,.235);back.rotation.z=.15;
 blob(g,leather,x-.29,1.06,z,.10,.15,.13);
 for(const s of [-1,1]){
  blob(g,leather,x,.54,z+s*.207,.26,.115,.05);
  const side=blob(g,leather,x-.20,.77,z+s*.19,.12,.25,.071);side.rotation.z=.19;
 }
 cube(g,.43,.06,.25,x,.32,z,black);
}
export function cockpit(g,leather,style='m5'){
 const black=P('#202127',.08,.66),carbon=P('#202a34',.48,.35),silver=P('#a5a9ad',.78,.25);
 const display=new T.MeshBasicMaterial({color:'#182d44'});
 const neon=new T.MeshBasicMaterial({color:'#95baff'});
 for(const s of [-1,1])seat(g,-.15,s*.39,leather,black);
 if(style==='m5'){
  for(const s of [-1,1])seat(g,-1.12,s*.40,leather,black);
 }
 cube(g,1.52,.30,.30,-.19,.50,0,black);
 blob(g,carbon,-.04,.65,0,.60,.10,.146);
 blob(g,black,.64,.94,0,.32,.185,.84);
 const screen=cube(g,.037,.115,.94,.47,1.038,-.15,display);screen.rotation.z=-.10;
 for(let i=0;i<4;i++)cube(g,.012,.010,.095,.445,1.020+i*.016,-.45,neon);
 for(let i=0;i<4;i++)cube(g,.011,.010,.12,.445,1.020+i*.016,-.08,neon);
 for(let i=0;i<4;i++)cube(g,.011,.01,.11,.445,1.02+i*.016,.14,neon);
 cube(g,.024,.011,1.55,.45,.95,0,neon);
 for(const z of [-.28,.28]){
  cube(g,.012,.075,.38,.455,.875,z,carbon);
  for(let i=0;i<3;i++)cube(g,.014,.008,.36,.445,.85+i*.018,z,silver);
 }
 const wheel=new T.Group();wheel.position.set(.32,.91,-.39);wheel.rotation.z=-.29;g.add(wheel);
 const ring=mesh(wheel,new T.TorusGeometry(.162,.021,12,64),black);ring.rotation.y=Math.PI/2;
 const stitch=mesh(wheel,new T.TorusGeometry(.167,.003,6,48),silver,-.018);stitch.rotation.y=Math.PI/2;
 blob(wheel,black,0,0,0,.045,.063,.066);
 for(const z of [-.10,.10])cube(wheel,.04,.025,.11,0,0,z,silver);
 cube(wheel,.031,.115,.028,0,-.081,0,silver);
 return leather;
}
export function makeG90(){
 const g=new T.Group(),paints=[],lights=[],doors=[],wheels=[];
 const paint=P('#386c57',.47,.23);paint.clearcoat=.8;paint.clearcoatRoughness=.18;paint.side=T.DoubleSide;paints.push(paint);
 const leather=P('#29272a',.04,.66);
 const black=P('#111419',.16,.47),carbon=P('#1a1e25',.36,.34),rubber=P('#141417',.015,.82),wheel=P('#5a606a',.82,.26),chrome=P('#afb6bd',.82,.24),caliper=P('#ab253b',.36,.30);
 const glass=P('#23313d',.18,.13);glass.side=T.DoubleSide;glass.opacity=.57;glass.transparent=true;glass.depthWrite=false;
 const red=P('#5b101a',.25,.24);red.emissive.set('#ff2639');red.emissiveIntensity=.62;
 const lamp=P('#a1bdd4',.35,.20);lamp.emissive.set('#e2f0ff');lamp.emissiveIntensity=1.10;lights.push(lamp);
 const under=[[-2.54,.78,.29,.72],[-2.46,.91,.24,.85],[-2.16,.96,.25,.87],[-1.92,.96,.36,.89],[-1.74,.98,.65,.87],[-1.51,.99,.72,.90],[-1.30,.99,.65,.89],[-1.11,.97,.39,.88],[-.85,.94,.27,.87],[.78,.95,.26,.89],[1.11,.99,.40,.92],[1.29,1.0,.67,.92],[1.51,1.01,.74,.94],[1.73,.99,.66,.91],[1.91,.98,.37,.88],[2.23,.96,.30,.86],[2.43,.90,.26,.82],[2.54,.80,.30,.76]];
 loft(g,under.filter(r=>r[0]<-.8),paint);
 loft(g,under.filter(r=>r[0]>.77),paint);
 loft(g,[[-1.04,.87,.27,.48],[-.77,.93,.25,.47],[-.22,.96,.23,.45],[.45,.96,.23,.45],[.85,.93,.25,.47],[1.08,.88,.29,.5]],paint);
 const shape=[[-2.53,.77,.70,.89],[-2.49,.87,.65,.96],[-2.34,.95,.58,1.02],[-2.03,.98,.62,1.05],[-1.69,.99,.75,1.05],[-1.37,.99,.77,1.06],[-1.07,.96,.74,1.02],[-.70,.80,.77,.97],[-.28,.73,.74,.95],[.54,.77,.75,.97],[.92,.92,.75,1.04],[1.24,.99,.79,1.07],[1.48,1.00,.78,1.07],[1.78,.99,.77,1.05],[2.09,.96,.70,1.01],[2.35,.92,.70,.96],[2.53,.81,.70,.87],[2.56,.74,.71,.81]];
 loft(g,shape.filter(r=>r[0]<-1.06),paint);
 loft(g,shape.filter(r=>r[0]>.53),paint);
 const roof=new T.MeshPhysicalMaterial({color:'#252a30',metalness:.53,roughness:.31,clearcoat:.66,side:T.DoubleSide});
 const upright=roof;
 const cabinRoof=[[-1.04,.64,1.332,1.358],[-.79,.687,1.405,1.47],[-.55,.687,1.426,1.501],[.04,.66,1.423,1.485],[.36,.637,1.395,1.434],[.48,.608,1.365,1.388]];
 loft(g,cabinRoof,roof,68);
 for(const side of [-1,1]){
  const z=side;
  const A=[[.445,1.379,.606],[.59,1.307,.652],[.81,1.072,.753],[.95,.999,.797]];
  const C=[[-.89,1.402,.662],[-1.13,1.306,.725],[-1.40,1.129,.803],[-1.60,1.023,.846]];
  path(g,A.map(([x,y,d])=>[x,y,z*d]),upright,.034);
  path(g,C.map(([x,y,d])=>[x,y,z*d]),upright,.052);
  path(g,[[.45,1.384,z*.620],[.06,1.466,z*.668],[-.56,1.464,z*.685],[-.89,1.400,z*.677]],upright,.029);
  path(g,[[-.37,.945,z*.951],[-.40,1.19,z*.759],[-.42,1.46,z*.675]],upright,.034);
  panel(g,[[.45,1.382,z*.616],[.84,1.011,z*.817],[-.40,.953,z*.94],[-.42,1.442,z*.678]],glass);
  panel(g,[[-.44,1.447,z*.681],[-.46,.95,z*.940],[-1.49,.99,z*.858],[-1.135,1.302,z*.728],[-.889,1.414,z*.681]],glass);
 }
 panel(g,[[.438,1.390,-.606],[.926,1.001,-.775],[.926,1.001,.775],[.438,1.390,.606]],glass);
 panel(g,[[-.889,1.422,-.647],[-1.58,1.043,-.819],[-1.58,1.043,.819],[-.889,1.422,.647]],glass);
 for(const side of [-1,1]){
  const z=side;
  for(const [lo,hi,hingeX,isDriver] of [[-.37,.86,.85,side===-1],[-1.46,-.39,-.39,false]]){
   const hinge=new T.Group();hinge.position.set(hingeX,.59,z*.948);g.add(hinge);
   const pts=[[lo,.32,.929],[hi,.30,.951],[hi,.978,.976],[lo,.973,.963]].map(([x,y,d])=>[x-hingeX,y-.59,z*(d-.948)]);
   panel(hinge,pts,paint);
   const belt=pts.map(([x,y,d])=>[x,y+.019,d]);path(hinge,[belt[2],belt[3]],roof,.012);
   panel(hinge,pts.map(([x,y,d])=>[x,y,d-z*.047]),black);
   const [a,b,c,d]=pts;path(hinge,[a,b,c,d,a],carbon,.005);
   cube(hinge,.17,.02,.026,lo+.18-hingeX,.229,z*.036,carbon);
   if(isDriver){
    doors.push({pivot:hinge,angle:-1.01});
    cube(hinge,.8,.035,.065,lo+.54-hingeX,.015,z*-.035,leather);
   }
  }
  cube(g,2.38,.078,.075,-.24,.236,z*.981,carbon);
  const mirror=blob(g,paint,.65,1.081,z*.98,.161,.067,.13);mirror.rotation.y=z*.23;
  blob(g,chrome,.52,1.08,z*1.01,.03,.048,.087);
  const sill=[[1.98,.30,z*.875],[2.44,.34,z*.775],[2.48,.60,z*.77],[2.34,.73,z*.905],[1.96,.60,z*.984]];
  panel(g,sill,carbon);
  for(const wx of [1.51,-1.51]){
   const fender=Array.from({length:17},(_,i)=>{const a=.12+i*Math.PI*.9/16;return [wx+Math.cos(a)*.395,.365+Math.sin(a)*.412,z*1.003];});
   path(g,fender,paint,.025);
  }
  const f=[[2.47,.813,z*.34],[2.41,.811,z*.57],[2.31,.843,z*.83],[2.23,.874,z*.908],[2.26,.918,z*.874],[2.39,.888,z*.59],[2.49,.864,z*.34]];
  panel(g,f,carbon);
  path(g,[[2.473,.835,z*.44],[2.42,.846,z*.56],[2.395,.875,z*.62]],lamp,.010);
  path(g,[[2.40,.847,z*.68],[2.34,.857,z*.78],[2.32,.889,z*.82]],lamp,.011);
  path(g,[[-2.53,.819,z*.28],[-2.49,.823,z*.53],[-2.42,.846,z*.76],[-2.31,.887,z*.89]],red,.024);
  path(g,[[-2.51,.789,z*.41],[-2.46,.799,z*.61],[-2.37,.826,z*.82]],red,.010);
  for(const x of [1.51,-1.51]){
   const w=new T.Group();w.position.set(x,.367,z*.956);g.add(w);wheels.push(w);
   const rim=(r,h,d,material)=>{const m=mesh(w,new T.CylinderGeometry(r,r,h,64),material,0,0,z*d);m.rotation.x=Math.PI/2;return m};
   rim(.368,.251,0,rubber);rim(.275,.014,.127,wheel);rim(.228,.010,.136,black);rim(.195,.012,.145,chrome);
   for(const rr of [.266,.344]){const edge=mesh(w,new T.TorusGeometry(rr,rr>.3?.012:.009,8,64),rr>.3?rubber:chrome,0,0,z*.138);edge.scale.z=.8;}
   for(let i=0;i<10;i++){
    const a=i*Math.PI/5;
    for(const off of [-.074,.074]){
     const f=a+off,sp=cube(w,.178,.016,.024,Math.cos(f)*.163,Math.sin(f)*.163,z*.163,wheel);sp.rotation.z=f+off*1.6;
     const face=cube(w,.158,.006,.008,Math.cos(f)*.169,Math.sin(f)*.169,z*.177,chrome);face.rotation.z=f+off*1.6;
    }
   }
   cube(w,.09,.153,.035,-.126,.06,z*.153,caliper);
   rim(.064,.030,.158,wheel);rim(.034,.008,.179,chrome);
   for(let j=0;j<5;j++){const a=j*Math.PI*2/5;blob(w,chrome,Math.cos(a)*.046,Math.sin(a)*.046,z*.181,.008,.008,.007);}
  }
  for(const zc of [.66,.79]){
   const exhaust=mesh(g,new T.CylinderGeometry(.050,.055,.18,26),wheel,-2.438,.36,z*zc);exhaust.rotation.z=Math.PI/2;
   const inner=mesh(g,new T.CircleGeometry(.041,24),black,-2.532,.36,z*zc);inner.rotation.y=-Math.PI/2;
  }
 }
 for(const side of [-1,1]){
  const h=.61,z=side*.206;
  plate(g,2.548,h,z,[[-.176,-.116],[.13,-.11],[.172,-.054],[.187,.084],[.14,.128],[-.157,.13],[-.185,.087],[-.182,-.054]],.017,black);
  const lines=[[-.164,-.105],[.12,-.105],[.17,-.053],[.178,.081],[.137,.118],[-.148,.117],[-.176,.073],[-.174,-.047],[-.164,-.105]];
  path(g,lines.map(([a,b])=>[2.577,h+b,z-a]),chrome,.009);
  for(let j=0;j<4;j++)cube(g,.032,.014,.292,2.56,h-.062+j*.046,z,carbon);
 }
 plate(g,2.43,.40,0,[[-.79,-.09],[.79,-.09],[.77,.02],[.65,.113],[-.65,.113],[-.77,.02]],.07,black);
 cube(g,.075,.048,1.68,2.43,.307,0,carbon);
 cube(g,.03,.074,1.52,-2.47,.368,0,black);
 const badge=blob(g,chrome,2.18,1.008,0,.041,.009,.039);badge.rotation.z=-.12;
 const logo=blob(g,new T.MeshBasicMaterial({color:'#5db5f6'}),2.18,1.016,0,.027,.005,.026);logo.rotation.z=-.12;
 cockpit(g,leather);
 return {group:g,paint:paints,lights,doors,wheels,trim:[leather]};
}
