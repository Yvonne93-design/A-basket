import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
import {newUserState,ingredients,newId} from '../src/data.js';import {unitInfo,normalizeProductState} from '../src/food-rules.js';import {commitPurchase,number} from '../src/domain.js';
const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
function setup(){const state=normalizeProductState(newUserState()),ctx=vm.createContext({state,ingredients,newId,unitInfo,number,commitPurchase,captureItems:[],captureId:newId(),capturePhoto:'',sheet:null,rankSignature:'',save(next){if(next)ctx.state=next;},go(){},notify(){}});vm.runInContext(source.slice(source.indexOf('async function act('),source.indexOf("app.addEventListener('click'")),ctx);return ctx;}
test('manual selection uses household units, increments safely and commits only after review',async()=>{
 const ctx=setup();await vm.runInContext("act('capture-add')",ctx);assert.equal(ctx.sheet,'capture-add');assert.equal(ctx.captureItems.length,0);
 await vm.runInContext("act('capture-pick|milk')",ctx);assert.equal(ctx.captureItems[0].actualQty,250);
 await vm.runInContext("act('capture-step|0|1')",ctx);assert.equal(ctx.captureItems[0].actualQty,500);
 await vm.runInContext("act('capture-step|0|-1')",ctx);await vm.runInContext("act('capture-step|0|-1')",ctx);assert.equal(ctx.captureItems[0].actualQty,250);assert.equal(ctx.state.stock.length,0);
 await vm.runInContext("act('capture-review')",ctx);assert.equal(ctx.sheet,'capture-confirm');assert.equal(ctx.state.stock.length,0);
 await vm.runInContext("act('capture-commit')",ctx);assert.equal(ctx.state.stock[0].ingredientId,'milk');assert.equal(ctx.state.stock[0].qty,250);assert.equal(ctx.captureItems.length,0);
});
test('loading an example cannot silently overwrite a manual draft',async()=>{const ctx=setup();await vm.runInContext("act('capture-pick|tomato')",ctx);await vm.runInContext("act('capture-demo')",ctx);assert.equal(ctx.sheet,'capture-example-confirm');assert.equal(ctx.captureItems[0].ingredientId,'tomato');await vm.runInContext("act('capture-remove|0')",ctx);assert.equal(ctx.captureItems.length,0);});

test('editing opens an in-app picker, replaces one row, preserves compatible quantity and resets incompatible units',async()=>{
 const ctx=setup();await vm.runInContext("act('capture-pick|tomato')",ctx);await vm.runInContext("act('capture-step|0|1')",ctx);const id=ctx.captureItems[0].id;
 await vm.runInContext(`act('capture-edit|${id}')`,ctx);assert.equal(ctx.sheet,'capture-replace|'+id);
 await vm.runInContext("act('capture-pick|egg')",ctx);assert.equal(ctx.captureItems.length,1);assert.equal(ctx.captureItems[0].actualQty,2);assert.equal(ctx.captureItems[0].ingredientId,'egg');assert.equal(ctx.captureItems[0].id,id);
 await vm.runInContext(`act('capture-edit|${id}')`,ctx);await vm.runInContext("act('capture-pick|milk')",ctx);assert.equal(ctx.captureItems[0].actualQty,250);assert.equal(ctx.captureItems[0].unit,'毫升');assert.equal(ctx.state.stock.length,0);
 await vm.runInContext(`act('capture-edit|${id}')`,ctx);await vm.runInContext("act('close')",ctx);assert.equal(ctx.captureItems[0].ingredientId,'milk');assert.equal(ctx.sheet,null);
});
test('capture ingredient names no longer create native dropdown menus',()=>{const capture=source.slice(source.indexOf('function capture()'),source.indexOf('\nfunction ',source.indexOf('function capture()')+8));assert.ok(!capture.includes('<select'));assert.match(capture,/capture-edit/);});
