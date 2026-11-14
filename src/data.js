export const models = [
  {id:'m5',embed:'9dc9e5c88bec4faa94552fdd0b76ed21',name:'BMW M5',code:'G90',type:'Седан',edition:'M HYBRID · M xDRIVE',power:727,accel:'3,5',speed:250,max:305,drive:'Полный',motor:'4,4 л V8 + электромотор',torque:'1 000',price:16900000,length:5.10,
   copy:'Пять метров спокойствия. До первого нажатия на газ. V8 и электромотор работают вместе, чтобы превратить солидный седан в полноценный BMW M.',
   colors:[['#437b65','Isle of Man Green'],['#a2a5a6','Frozen Grey'],['#233a5b','Marina Bay Blue']]},
  {id:'m4',name:'BMW M4 Competition',code:'G82',type:'Купе',edition:'COMPETITION · M xDRIVE',power:530,accel:'3,5',speed:250,max:290,drive:'Полный',motor:'3,0 л · рядная «шестерка»',torque:'650',price:13200000,length:4.80,
   copy:'Две двери, длинный капот и рядная «шестерка». Купе, с которым хочется выбрать дорогу подлиннее.',
   colors:[['#246551','Isle of Man Green'],['#a8abad','Brooklyn Grey'],['#992c38','Toronto Red']]},
  {id:'m3',name:'BMW M3 Touring',code:'G81',type:'Универсал',edition:'COMPETITION · M xDRIVE',power:530,accel:'3,6',speed:250,max:280,drive:'Полный',motor:'3,0 л · рядная «шестерка»',torque:'650',price:13700000,length:4.80,
   copy:'Универсал с характером M. Полный привод, рядная «шестерка» и место для вещей на длинные выходные.',
   colors:[['#384b65','Tanzanite Blue'],['#9b2635','Toronto Red'],['#a6aaad','Brooklyn Grey']]}
];
export const money = n => new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
export function newOrder(){return {step:'method',method:null,payment:'На месте',name:'',city:'',address:''}}
export function orderTransition(order, action, values = {}) {
  if (action === 'method' && ['pickup','delivery'].includes(values.method)) return {...order,method:values.method,step:'details'};
  if (action === 'back') return {...order,step:order.step==='payment'?'details':'method'};
  if (action === 'details' && order.step==='details' && values.name?.trim() && (order.method==='pickup'||(values.city?.trim()&&values.address?.trim()))) return {...order,...values,step:'payment'};
  if (action === 'finish' && order.step==='payment') return {...order,payment:values.payment==='Счет'?'Счет':'На месте',step:'complete'};
  return order;
}
