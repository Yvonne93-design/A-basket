import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {stockedState} from './helpers/kitchen.mjs';
import {recipes,ingredients} from '../src/data.js';
import {eligible,cookingPlan,validateCookingPlan} from '../src/domain.js';
import {candidateAssessment} from '../src/food-rules.js';
import {normalizeContext} from '../server/ai-gateway.js';
const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
test('eight dishes can be selected, transported and scheduled with all ingredient requirements',()=>{
 const state=stockedState();const ids=recipes.filter(r=>eligible(r,state)).slice(0,8).map(r=>r.id);
 const ctx=vm.createContext({state,cards:[],ingredients,candidateAssessment,recommendationEpoch:0,rankSignature:'',tablePage:0,save(){}});
 vm.runInContext(source.slice(source.indexOf('async function act('),source.indexOf("app.addEventListener('click'")),ctx);
 return (async()=>{for(const id of ids)await vm.runInContext(`act('heart|${id}')`,ctx);
 assert.deepEqual(state.meal.selectedRecipeIds,ids);assert.equal(ctx.tablePage,1);
 assert.deepEqual(normalizeContext(state).meal.selectedRecipeIds,ids);
 const plan=cookingPlan(state);validateCookingPlan(plan,state);
 assert.equal(plan.adaptedRecipes.length,8);
 const required=new Set(plan.requirements.map(i=>i.ingredientId));
 assert.ok(plan.adaptedRecipes.every(r=>r.ingredients.every(i=>required.has(i.ingredientId))));
 })();
});
test('fourth dish still cannot spend missing inventory',()=>{
 const state=stockedState();state.meal.selectedRecipeIds=['tomato_scrambled_egg','garlic_lettuce','miso_tofu_soup'];
 state.stock=state.stock.filter(i=>i.ingredientId!=='corn');
 assert.equal(candidateAssessment(state,'corn_pork_soup').allowed,false);
});
test('table groups four dishes into two rows and paginates without dropping selected dishes',()=>{
 const ids=recipes.slice(0,8).map(r=>r.id);
 const ctx=vm.createContext({tablePage:0,state:{},recipeView:(_,id)=>recipes.find(r=>r.id===id),esc:s=>s,glyph:()=>'',food:()=>'',action:(a,t)=>`<button data-action="${a}">${t}</button>`});
 vm.runInContext(source.slice(source.indexOf('function roundTable('),source.indexOf('function cook(')),ctx);
 ctx.selected=ids.slice(0,4);let html=vm.runInContext('roundTable(selected)',ctx);assert.match(html,/four-dish-table/);assert.equal((html.match(/class="table-dish"/g)||[]).length,4);
 ctx.selected=ids;html=vm.runInContext('roundTable(selected)',ctx);assert.match(html,/餐桌（8 道）/);assert.match(html,/1\/2/);assert.equal((html.match(/class="table-dish"/g)||[]).length,6);
 ctx.tablePage=1;html=vm.runInContext('roundTable(selected)',ctx);assert.match(html,/2\/2/);assert.equal((html.match(/class="table-dish"/g)||[]).length,2);
 ctx.selected=ids.slice(0,4);vm.runInContext('roundTable(selected)',ctx);assert.equal(ctx.tablePage,0);
 assert.equal(ids.length,8);
});
