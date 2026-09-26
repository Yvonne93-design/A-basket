import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {newUserState} from '../src/data.js';import {updateCycleSettings} from '../src/cycle-settings.js';
const values={startDate:'2026-09-27',plannedDays:7,expectedMeals:6,diners:3};
test('current cycle edit preserves identity, preferences, stock and history without starting a planner',async()=>{
 const s=newUserState(),before=structuredClone(s);s.cycle.goals=['蔬菜多一点'];const next=await updateCycleSettings(s,values,()=>{throw Error('not needed');});
 assert.equal(next.cycle.id,s.cycle.id);assert.equal(next.cycle.expectedMeals,6);assert.equal(next.profile.defaultDiners,3);assert.deepEqual(next.cycle.goals,s.cycle.goals);assert.deepEqual(next.stock,s.stock);assert.deepEqual(next.records,s.records);assert.equal(s.cycle.expectedMeals,before.cycle.expectedMeals);
});
test('updates unpurchased suggested quantities but preserves bought rows and manual quantities',async()=>{
 const s=newUserState();s.suggestions=[{ingredientId:'egg',purchaseQty:2},{ingredientId:'tomato',purchaseQty:2}];s.purchases=[{id:'a',ingredientId:'egg',state:'shopping',checked:false,suggestedQty:2,actualQty:2},{id:'b',ingredientId:'tomato',state:'bought',checked:true,actualQty:3}];
 const next=await updateCycleSettings(s,values,async()=>({ingredientSuggestions:[{ingredientId:'egg',purchaseQty:6},{ingredientId:'tomato',purchaseQty:4}]}));
 assert.equal(next.purchases.find(p=>p.id==='a').actualQty,6);assert.deepEqual(next.purchases.find(p=>p.id==='b'),s.purchases[1]);assert.equal(s.purchases[0].actualQty,2);
 s.purchases[0].actualQty=5;const manual=await updateCycleSettings(s,values,async()=>({ingredientSuggestions:[{ingredientId:'egg',purchaseQty:6}]}));assert.equal(manual.purchases.find(p=>p.id==='a').actualQty,5);
});
test('failed validation or planning never commits partial edits',async()=>{
 const s=newUserState();s.suggestions=[{ingredientId:'egg'}];const before=structuredClone(s);
 await assert.rejects(updateCycleSettings(s,{...values,startDate:'2026-02-30'},async()=>({})));await assert.rejects(updateCycleSettings(s,{...values,diners:0},async()=>({})));
 await assert.rejects(updateCycleSettings(s,values,async()=>{throw Error('failed');}));assert.deepEqual(s,before);
});
test('homepage pencil opens local settings, while separate replan entry stays available',()=>{
 const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');assert.match(source,/action\('edit-cycle'/);assert.match(source,/sheet==='edit-cycle'/);assert.match(source,/link\('\/basket\/plan',`\$\{glyph\('plus-circle'\)/);
});
