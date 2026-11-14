import * as T from 'three';
import {cube} from './car.js';
const seatGeometry=new T.SphereGeometry(1,40,22);
function blob(g,mat,x,y,z,a,b,c){
 const o=new T.Mesh(seatGeometry,mat);o.position.set(x,y,z);o.scale.set(a,b,c);g.add(o);return o;
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
