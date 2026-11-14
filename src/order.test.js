import test from 'node:test';
import assert from 'node:assert/strict';
import {newOrder,orderTransition,bodyColors,interiorColors} from './data.js';

const details={firstName:' Алексей ',lastName:'Иванов',middleName:'',city:'Москва',street:'Лесная',house:'5',payment:'По счёту'};
test('delivery waits for loading, address and payment before driving away',()=>{
 let s=orderTransition(newOrder(),'method',{method:'delivery'});
 assert.equal(s.step,'loading');
 assert.equal(orderTransition(s,'submit',details),s);
 s=orderTransition(s,'loaded');
 for(const key of ['firstName','lastName','city','street','house','payment'])assert.equal(orderTransition(s,'submit',{...details,[key]:' '}),s);
 s=orderTransition(s,'submit',details);
 assert.equal(s.step,'departing');assert.equal(s.firstName,'Алексей');
 assert.equal(orderTransition(s,'departed').step,'complete');
});
test('pickup has no address requirement',()=>{
 let s=orderTransition(newOrder(),'method',{method:'pickup'});
 assert.equal(s.step,'details');
 s=orderTransition(s,'submit',{firstName:'Алексей',lastName:'Иванов',payment:'При получении'});
 assert.equal(s.step,'complete');assert.equal(s.city,'');
});
test('the configuration offers five distinct exterior and three interior finishes',()=>{
 for(const [palette,count] of [[bodyColors,5],[interiorColors,3]]){
  assert.equal(palette.length,count);
  assert.equal(new Set(palette.map(x=>x[0])).size,count);
 }
});
