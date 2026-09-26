import test from 'node:test';
import assert from 'node:assert/strict';
import {stockedState} from './helpers/kitchen.mjs';
import {recipes} from '../src/data.js';
import {enterCookingBrowse,candidateAssessment} from '../src/food-rules.js';
import {AIService} from '../src/ai.js';
const service=new AIService({recommendRecipes:async()=>({recipeCards:[]})});
test('entering cooking removes old direction and shows all feasible inventory dishes without expansion',async()=>{
 const s=stockedState();s.meal.constraints={cuisines:['西式'],flavors:['清淡'],mealType:'汤粥',timeLimit:20,operationPrefs:['少洗锅'],stockPolicy:'可以补买 1–2 样'};
 s.stock=s.stock.filter(i=>i.ingredientId!=='corn');
 const before=JSON.stringify(s.stock);enterCookingBrowse(s);
 const expected=recipes.filter(r=>candidateAssessment(s,r.id).allowed).map(r=>r.id).sort();
 const out=await service.recommendRecipes(s);assert.deepEqual(out.recipeCards.map(c=>c.recipeId).sort(),expected);
 assert.ok(!expected.includes('corn_pork_soup'));assert.equal(JSON.stringify(s.stock),before);
 s.meal.constraints.mealType='汤粥';const filtered=await service.recommendRecipes(s);
 assert.ok(filtered.recipeCards.length<out.recipeCards.length);assert.ok(filtered.recipeCards.every(c=>recipes.find(r=>r.id===c.recipeId).mealType==='汤粥'));
});
test('entering cooking preserves selected dishes and never rewrites a running tutorial need',()=>{
 const s=stockedState();s.meal.selectedRecipeIds=['tomato_scrambled_egg'];enterCookingBrowse(s);assert.deepEqual(s.meal.selectedRecipeIds,['tomato_scrambled_egg']);
 s.meal.state='cooking';s.meal.constraints.operationPrefs=['少洗锅'];const before=JSON.stringify(s);enterCookingBrowse(s);assert.equal(JSON.stringify(s),before);
});
