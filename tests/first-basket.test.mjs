import test from 'node:test';
import assert from 'node:assert/strict';
import {newUserState,initialState,hasBasketHistory,ingredients} from '../src/data.js';
import {candidateAssessment} from '../src/food-rules.js';
import {resolveRecipeCards} from '../src/planning.js';
test('new users have no demo inventory, wanted dishes or history',()=>{
 const s=newUserState();for(const field of ['stock','wanted','records','purchases','purchaseCommits'])assert.deepEqual(s[field],[]);
 assert.equal(s.profile.nickname,'');assert.deepEqual(s.kitchen.tools,[]);assert.equal(hasBasketHistory(s),false);
 s.purchaseCommits.push('first-confirmed-purchase');assert.equal(hasBasketHistory(s),true);
 assert.equal(newUserState().purchaseCommits.length,0);
});
test('missing corn cannot enter cards or table, including model-suggested and stale cards',()=>{
 const s=initialState();s.stock=[{ingredientId:'pork',qty:300,status:'available'}];s.pantry={salt:'有'};
 const cards=[{recipeId:'corn_pork_soup',shortReason:'现有食材可做'}];
 assert.equal(candidateAssessment(s,'corn_pork_soup').allowed,false);
 assert.equal(resolveRecipeCards(cards,s).recipeCards.length,0);
 s.stock.push({ingredientId:'corn',qty:1,status:'available'});
 assert.equal(candidateAssessment(s,'corn_pork_soup').allowed,true);
 assert.equal(resolveRecipeCards(cards,s).recipeCards.length,1);
 s.stock[1].status='consumed';assert.equal(resolveRecipeCards(cards,s).recipeCards.length,0);
 s.meal.constraints.stockPolicy='可以补买 1–2 样';
 const permitted=resolveRecipeCards(cards,s).recipeCards[0];assert.equal(permitted.canCookNow,false);assert.equal(permitted.missingIngredients[0].ingredientId,'corn');
});

import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {normalizeProductState} from '../src/food-rules.js';
test('first launch enters welcome while saved users retain their inventory and route',()=>{
 const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 const boot=source.slice(source.indexOf('let state,freshUser'),source.indexOf('let route='));
 for(const saved of [null,initialState()]){
  let destination=null;
  const context=vm.createContext({KEY:'test',localStorage:{getItem:()=>JSON.stringify(saved)},newUserState,normalizeProductState,location:{hash:'#/basket'},history:{replaceState:(_,__,url)=>destination=url}});
  vm.runInContext(boot,context);
  assert.equal(destination,saved?null:'#/login');
  assert.equal(vm.runInContext('state.stock.length',context),saved?saved.stock.length:0);
 }
});

import {basketPlanningIssue,basicPlan} from '../src/planning.js';
import {AIService,MockAdapter} from '../src/ai.js';
import {toolsCatalog} from '../src/data.js';
test('first basket explains missing cookware before calling AI',async()=>{
 const s=newUserState();let called=false;
 const service=new AIService({planBasket:async()=>{called=true;return {};}});
 assert.match(basketPlanningIssue(s),/厨具/);
 await assert.rejects(service.planBasket(s),/厨具/);assert.equal(called,false);
});
test('first basket with empty stock generates positive shopping quantities after selecting a real pot',async()=>{
 for(const id of ['wok','stockpot']){
  const s=newUserState();normalizeProductState(s);s.kitchen.tools=[{...toolsCatalog.find(t=>t.id===id),quantity:1,available:true}];
  assert.equal(basketPlanningIssue(s),'');
  const out=await new AIService(new MockAdapter()).planBasket(s);
  assert.ok(out.referenceRecipeIds.length>0);assert.ok(out.ingredientSuggestions.length>0);
  assert.ok(out.ingredientSuggestions.every(i=>i.purchaseQty>0));
  assert.deepEqual(s.stock,[]);assert.deepEqual(s.records,[]);
 }
});
test('unsupported appliances and allergy exclusions remain hard constraints with specific messages',()=>{
 const s=newUserState();s.kitchen.tools=[{id:'blender',quantity:1,available:true}];assert.throws(()=>basicPlan(s),/厨具/);
 s.kitchen.tools=[{id:'wok',quantity:1,available:true}];s.diet.absoluteAvoids=Object.values(ingredients).map(i=>i.name);
 assert.throws(()=>basicPlan(s),/饮食限制/);
});
