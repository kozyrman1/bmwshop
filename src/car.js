import * as T from 'three';
const P=(color,metalness=.2,roughness=.35)=>new T.MeshPhysicalMaterial({color,metalness,roughness});
export function cube(g,w,h,d,x,y,z,mat){
 const o=new T.Mesh(new T.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);g.add(o);return o;
}
function part(g,s,x,y,z,m){
 const o=new T.Mesh(new T.SphereGeometry(1,28,14),m);o.scale.set(...s);o.position.set(x,y,z);g.add(o);return o;
}
function surface(g,rings,material,cut=false){
 const data=[],ids=[],n=32;
 for(const [x,w,y0,y1] of rings)for(let j=0;j<n;j++){
  const a=j/n*Math.PI*2, z=w*Math.sign(Math.cos(a))*Math.pow(Math.abs(Math.cos(a)),.48);
  let y=(y1+y0)/2+Math.sign(Math.sin(a))*(y1-y0)/2*Math.pow(Math.abs(Math.sin(a)),.52);
  if(cut&&y<.62){const dx=Math.min(Math.abs(x-1.53),Math.abs(x+1.51));if(dx<.435&&Math.abs(z)>.75)y=Math.max(y,.34+Math.sqrt(.435**2-dx**2));}
  data.push(x,y,z);
 }
 for(let k=0;k<rings.length-1;k++)for(let j=0;j<n;j++){const a=k*n+j,b=k*n+(j+1)%n;ids.push(a,b,a+n,b,b+n,a+n)}
 for(let j=1;j<n-1;j++)ids.push(0,j+1,j,(rings.length-1)*n,(rings.length-1)*n+j,(rings.length-1)*n+j+1);
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(data,3));geo.setIndex(ids);geo.computeVertexNormals();
 material.side=T.DoubleSide;
 const mesh=new T.Mesh(geo,material);g.add(mesh);return mesh;
}
export function prototypeM5(){
 const g=new T.Group(),paint=P('#92989b',.68,.23),black=P(0x10131a,.3,.35),trim=P(0x202731,.73,.27),glass=P(0x172430,.61,.21),tire=P(0x111115,.03,.7),chrome=P(0xb4bbc1,.88,.28),red=P(0xb40d2a,.3,.27),gold=P(0x926a2a,.5,.28);
 paint.clearcoat=.55;paint.clearcoatRoughness=.2;glass.clearcoat=.8;
 const lights=[];
 for(let i=0;i<2;i++){const lamp=P(0xc9f6ff,.22,.27);lamp.emissive.set('#addefe');lamp.emissiveIntensity=.32;lights.push(lamp);}
 const original=[[-2.55,.73,.40,.75],[-2.50,.89,.30,.85],[-2.39,.98,.27,.93],[-2.13,1.02,.25,.96],[-1.64,1.045,.25,.98],[-1.32,1.045,.25,.97],[-.93,1.01,.24,.93],[-.45,.987,.24,.92],[.28,.984,.25,.94],[.86,1.013,.25,.97],[1.46,1.035,.26,1.01],[1.87,1.016,.26,.99],[2.27,.978,.29,.95],[2.48,.899,.33,.89],[2.55,.75,.40,.79]];
 const dense=[];for(let k=0;k<original.length-1;k++){const a=original[k],b=original[k+1],n=Math.ceil((b[0]-a[0])/.085);for(let i=0;i<n;i++)dense.push(a.map((v,j)=>v+(b[j]-v)*i/n));}dense.push(original.at(-1));
 surface(g,dense,paint,true);
 surface(g,[[-1.72,.77,.9,.95],[-1.4,.78,.9,1.03],[-.87,.71,.90,1.29],[-.56,.69,.94,1.40],[-.22,.68,.95,1.45],[.32,.65,.96,1.45],[.56,.64,.97,1.41],[.76,.69,.96,1.31],[1.26,.78,.94,.96]],glass);
 surface(g,[[-.83,.65,1.3,1.32],[-.58,.66,1.37,1.41],[-.22,.66,1.415,1.47],[.32,.62,1.415,1.47],[.55,.58,1.39,1.43],[.69,.56,1.35,1.38]],paint);
 for(const side of [-1,1]){
  cube(g,3.05,.075,.072,-.03,.245,side*.992,black);
  for(const x of [-.76,.29])cube(g,.17,.028,.028,x,.876,side*.997,trim);
  const pillar=cube(g,.10,.40,.042,-.22,1.17,side*.724,black);pillar.rotation.x=side*.20;
  const mirror=part(g,[.18,.083,.118],.66,1.075,side*.988,paint);mirror.rotation.y=side*.21;
  cube(g,.21,.055,.30,.60,1.05,side*.875,trim);
  part(g,[.18,.047,.26],2.28,.822,side*.655,black);
  part(g,[.153,.020,.172],2.36,.834,side*.677,lights[side===1?1:0]);
  cube(g,.024,.075,.43,-2.455,.784,side*.685,red);
  cube(g,.02,.019,.31,-2.468,.796,side*.682,red);
  cube(g,.024,.15,.23,2.5,.485,side*.63,black);
  for(const x of [1.54,-1.53]){
   const wheel=new T.Group();wheel.position.set(x,.372,side*.938);g.add(wheel);
   const disk=(r,h,z,m)=>{const o=new T.Mesh(new T.CylinderGeometry(r,r,h,48),m);o.rotation.x=Math.PI/2;o.position.z=z;wheel.add(o);return o};
   disk(.371,.247,0,tire);disk(.270,.012,side*.130,trim);disk(.235,.009,side*.137,chrome);
   const edge=new T.Mesh(new T.TorusGeometry(.272,.010,8,48),chrome);edge.position.z=side*.141;wheel.add(edge);
   disk(.198,.007,side*.143,black);disk(.162,.007,side*.146,trim);
   cube(wheel,.12,.19,.029,-.11,.055,side*.150,gold);
   for(let i=0;i<10;i++){const a=i*Math.PI/5;for(const e of [-.10,.10]){const v=cube(wheel,.181,.020,.02,Math.cos(a+e)*.157,Math.sin(a+e)*.157,side*.160,chrome);v.rotation.z=a+e;}}
   disk(.064,.024,side*.163,trim);disk(.027,.006,side*.178,chrome);
  }
 }
 for(const z of [-.232,.232]){
  const gr=cube(g,.04,.246,.43,2.521,.672,z,black);gr.rotation.z=-.12;
  for(let j=0;j<5;j++)cube(g,.022,.011,.405,2.548,.58+j*.042,z,trim);
 }
 cube(g,.03,.07,1.65,2.42,.337,0,black);
 cube(g,.045,.08,1.68,-2.47,.336,0,trim);
 for(const z of [-.77,-.63,.63,.77]){const o=new T.Mesh(new T.CylinderGeometry(.045,.052,.12,20),chrome);o.rotation.z=Math.PI/2;o.position.set(-2.46,.321,z);g.add(o);}
 const badge=part(g,[.045,.009,.045],2.28,.939,0,chrome);badge.rotation.z=-.22;
 return {group:g,paint:[paint],lights};
}
