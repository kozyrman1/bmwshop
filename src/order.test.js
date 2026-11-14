import test from 'node:test';
import assert from 'node:assert/strict';
import {newOrder, orderTransition} from './data.js';
test('delivery validates address and passes to confirmation',()=>{
 let x=orderTransition(newOrder(),'method',{method:'delivery'});
 assert.equal(orderTransition(x,'details',{name:'Test'}),x);
 x=orderTransition(x,'details',{name:'Test',city:'Москва',address:'Тестовая, 5'});
 assert.equal(x.step,'payment');
 x=orderTransition(x,'finish',{payment:'Счет'});
 assert.equal(x.step,'complete');assert.equal(x.payment,'Счет');
});
test('pickup skips address and can go back',()=>{
 let x=orderTransition(newOrder(),'method',{method:'pickup'});
 assert.equal(orderTransition(x,'back').step,'method');
 x=orderTransition(x,'details',{name:'Test'});
 assert.equal(x.step,'payment');
 assert.equal(orderTransition(x,'back').step,'details');
 assert.equal(orderTransition(x,'finish').step,'complete');
});
