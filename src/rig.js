import * as T from 'three';
import {seat} from './cabin.js';
const V=(x,y,z)=>new T.Vector3(x,y,z);
function pivot(group,x,z,angle){
 const p=new T.Group();p.position.set(x,.65,z);group.add(p);return {pivot:p,angle};
}
function m3Door(root,group){
 const names=['m3g81law_door_FL','m3g81law_doorpanel_FL','m3g81law_doorglass_FL','m3g81law_mirror_L_a'];
 const d=pivot(group,.79,-.815,-.97);
 group.updateMatrixWorld(true);
 for(const name of names){
  const o=root.getObjectByName(name);
  if(o)d.pivot.attach(o);
 }
 return d;
}
function splitMesh(mesh,test,pivot){
 const original=mesh.geometry, count=original.index?.count??original.attributes.position.count;
 const moved=[],rest=[],w=new T.Vector3(),center=new T.Vector3();
 for(let i=0;i<count;i+=3){
  const ids=[0,1,2].map(k=>original.index?.getX(i+k)??(i+k));
  center.set(0,0,0);
  for(const id of ids){w.fromBufferAttribute(original.attributes.position,id).applyMatrix4(mesh.matrixWorld);center.add(w);}
  center.multiplyScalar(1/3);(test(center)?moved:rest).push(...ids);
 }
 if(!moved.length||!rest.length)return false;
 const keep=original.clone();keep.setIndex(rest);mesh.geometry=keep;
 const piece=original.clone();piece.setIndex(moved);
 const node=new T.Mesh(piece,mesh.material);node.name=mesh.name+'-door';mesh.add(node);node.updateWorldMatrix(true,false);
 pivot.attach(node);return true;
}
function m4Door(root,group){
 const d=pivot(group,.72,-.79,-.96),parts=[];
 root.traverse(o=>{if(o.isMesh&&/body15|mesheszx|pillars1|windows1|black161|livery/i.test(o.material.name)&&o.visible)parts.push(o);});
 group.updateMatrixWorld(true);
 for(const o of parts)splitMesh(o,v=>{
  const glass=/windows1/.test(o.material.name);
  if(v.z>-(glass?.61:.738)||v.x<-.68||v.x>.76||v.y<.33||v.y>1.33)return false;
  if(v.y>.99&&v.x>.65-(v.y-.99)*1.15)return false;
  return true;
 },d.pivot);
 return d;
}
function leatherMaterial(original){
 return new T.MeshPhysicalMaterial({
  name:original.name+' · leather',color:'#29272a',roughness:.62,metalness:.045,
  map:original.map,normalMap:original.normalMap,side:original.side
 });
}
export function rigLocal(root,group,model){
 const trim=new Set(),doors=[],wheelParts=[];
 if(model.id==='m3'){
  const materials=new Map();
  root.traverse(o=>{
   if(o.isMesh&&/seat_(?:FL|FR)|seats_R|doorpanel/i.test(o.name)&&/Interior_Zone1(?:_0)?$/i.test(o.material?.name||'')){
    const base=o.material;
    if(!materials.has(base))materials.set(base,leatherMaterial(base));
    o.material=materials.get(base);trim.add(o.material);
   }
  });
  doors.push(m3Door(root,group));
  const rotating=new Map();
  root.traverse(o=>{
   const m=o.name.match(/^(?:3_Wheel|m3g81law_rim_04_R20)(?:\.(\d+))?$/);
   if(!m)return;
   const key=m[1]||'0';if(!rotating.has(key))rotating.set(key,[]);rotating.get(key).push(o);
  });
  for(const pieces of rotating.values()){
   const pos=pieces[0].getWorldPosition(new T.Vector3()),pivot=new T.Group();
   pivot.position.copy(pos);group.add(pivot);group.updateMatrixWorld(true);
   for(const o of pieces)pivot.attach(o);
   wheelParts.push(pivot);
  }
 }else{
  const color=new T.MeshPhysicalMaterial({color:'#29272a',roughness:.65,metalness:.04});
  const black=new T.MeshPhysicalMaterial({color:'#202127',roughness:.66,metalness:.08});
  for(const side of [-1,1])seat(group,-.15,side*.39,color,black);
  root.traverse(o=>{
   if(o.isMesh&&/mesheswhite4/i.test(o.material?.name||'')){
    const b=new T.Box3().setFromObject(o);
    if(b.max.x<1.55&&b.min.x>-1.55)o.visible=false;
   }
  });
  trim.add(color);doors.push(m4Door(root,group));
 }
 return {doors,trim:[...trim],wheels:wheelParts};
}
