export const bodyColors = [
 ['#24252a','Чёрный','Sapphire Black'],
 ['#e5e5df','Белый','Alpine White'],
 ['#9e2232','Красный','Toronto Red'],
 ['#234775','Синий','Portimao Blue'],
 ['#386c57','Зелёный','Isle of Man Green']
];
export const interiorColors = [
 ['#29272a','Чёрная кожа'],
 ['#925732','Кожа коньячного цвета'],
 ['#cfc6b7','Светлая кожа']
];
export const defaultPaint = {m5:4,m4:0,m3:3};
export const payments = ['При получении','По счёту'];
export const models = [
  {id:'m5',name:'BMW M5',code:'G90',type:'Седан',edition:'M HYBRID · M xDRIVE',power:727,accel:'3,5',speed:250,max:305,drive:'Полный',motor:'4,4 л V8 + электромотор',torque:'1 000',price:16900000,length:5.10,
   copy:'Пять метров спокойствия. До первого нажатия на газ. V8 и электромотор работают вместе, чтобы превратить солидный седан в полноценный BMW M.',
   width:2.02},
  {id:'m4',name:'BMW M4 Competition',code:'G82',type:'Купе',edition:'COMPETITION · M xDRIVE',power:530,accel:'3,5',speed:250,max:290,drive:'Полный',motor:'3,0 л · рядная «шестерка»',torque:'650',price:13200000,length:4.80,
   copy:'Две двери, длинный капот и рядная «шестерка». Купе, с которым хочется выбрать дорогу подлиннее.',
   width:1.92},
  {id:'m3',name:'BMW M3 Touring',code:'G81',type:'Универсал',edition:'COMPETITION · M xDRIVE',power:530,accel:'3,6',speed:250,max:280,drive:'Полный',motor:'3,0 л · рядная «шестерка»',torque:'650',price:13700000,length:4.80,
   copy:'Универсал с характером M. Полный привод, рядная «шестерка» и место для вещей на длинные выходные.',
   width:1.92}
];
export const money = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';

export function newOrder(){
 return {step:'method',method:null,payment:payments[0],firstName:'',lastName:'',middleName:'',city:'',street:'',house:''};
}
const addressFields=['city','street','house'];
const nameFields=['firstName','lastName'];
export function orderTransition(order,action,values={}){
 if(action==='method'&&order.step==='method'&&['pickup','delivery'].includes(values.method)){
  return {...order,method:values.method,step:values.method==='delivery'?'loading':'details'};
 }
 if(action==='loaded'&&order.step==='loading')return {...order,step:'details'};
 if(action==='submit'&&order.step==='details'){
  const required=order.method==='delivery'?[...nameFields,...addressFields]:nameFields;
  if(required.some(key=>typeof values[key]!=='string'||!values[key].trim())||!payments.includes(values.payment))return order;
  const details=Object.fromEntries([...required,'middleName','payment'].map(key=>[key,(values[key]||'').trim()]));
  return {...order,...details,step:order.method==='delivery'?'departing':'complete'};
 }
 if(action==='departed'&&order.step==='departing')return {...order,step:'complete'};
 return order;
}
