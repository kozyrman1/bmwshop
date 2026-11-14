import * as T from 'three';
export function cube(g,w,h,d,x,y,z,mat){
 const o=new T.Mesh(new T.BoxGeometry(w,h,d),mat);o.position.set(x,y,z);g.add(o);return o;
}
