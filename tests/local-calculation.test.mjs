import {isPantry} from '../src/food-rules.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {AIService,MockAdapter} from '../src/ai.js';
const ai=new AIService(new MockAdapter());
import {initialState} from '../src/data.js';

test('app calculates without network and responds to diners, meals and stock',async()=>{
 const originalFetch=globalThis.fetch;
 globalThis.fetch=()=>{throw new Error('Local calculation must not request an API');};
 try{
  const state=initialState(),before=structuredClone(state);
  const first=await ai.planBasket(state);
  assert.deepEqual(state,before);
  state.profile.defaultDiners*=2;
  const larger=await ai.planBasket(state);
  for(const row of first.ingredientSuggestions)assert.equal(larger.ingredientSuggestions.find(i=>i.ingredientId===row.ingredientId).requiredQty,row.requiredQty*2);
  state.cycle.expectedMeals+=1;
  const more=await ai.planBasket(state);
  assert.equal(more.referenceRecipeIds.length,first.referenceRecipeIds.length+2);
  state.cycle.carryOverEnabled=true;
  state.stock=more.ingredientSuggestions.map(i=>({ingredientId:i.ingredientId,qty:i.requiredQty,unit:i.unit,status:'available'}));
  const stocked=await ai.planBasket(state);
  assert.deepEqual(stocked.ingredientSuggestions,[]);
  state.cycle.carryOverEnabled=false;
  const noCarry=await ai.planBasket(state);
  assert.ok(noCarry.ingredientSuggestions.filter(i=>!isPantry(i.ingredientId)&&i.ingredientId!=='milk').every(i=>i.purchaseQty===i.requiredQty));
  const recommendations=await ai.recommendRecipes(state);
  assert.ok(recommendations.recipeCards.length>0);
 }finally{globalThis.fetch=originalFetch;}
});
