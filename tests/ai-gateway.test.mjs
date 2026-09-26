import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,recipes} from '../src/data.js';
import {eligible,requirements} from '../src/domain.js';
import {normalizeContext,validateCandidate,createAIGateway} from '../server/ai-gateway.js';
const config=async()=>({apiKey:'TEST_ONLY_NOT_A_REAL_KEY',model:'test-model',baseUrl:'https://api.openai.com/v1'});
const candidates=s=>recipes.filter(r=>eligible(r,s)).map(r=>r.id);
const reply=body=>({ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify(body)}}]})});
test('OpenAI basket candidates are validated then quantities computed locally; repeat is cached',async()=>{
 const state=initialState();state.cycle.anchorWantedDishIds=[];const ids=candidates(state);const refs=Array.from({length:state.cycle.expectedMeals*2},(_,i)=>ids[i%ids.length]);let calls=0;
 const run=createAIGateway({getConfig:config,fetchImpl:async(url,opts)=>{calls++;assert.equal(url,'https://api.openai.com/v1/chat/completions');const body=JSON.parse(opts.body);assert.equal(body.response_format.json_schema.strict,true);assert.ok(!body.messages[1].content.includes('nickname'));return reply({referenceRecipeIds:refs,tradeoffs:[]});}});
 const before=structuredClone(state);const result=await run('planBasket',state);assert.equal(result.meta.source,'real');assert.deepEqual(result.ingredientSuggestions.map(i=>[i.ingredientId,i.requiredQty]),requirements(refs,state.profile.defaultDiners).map(i=>[i.ingredientId,i.qty]));assert.deepEqual(state,before);assert.equal((await run('planBasket',state)).meta.cached,true);assert.equal(calls,1);
});
test('real recipe order preserved but availability cannot be supplied by model',async()=>{
 const state=initialState();const ids=candidates(state).reverse();const run=createAIGateway({getConfig:config,fetchImpl:async()=>reply({recipeIds:ids})});const result=await run('recommendRecipes',state);assert.deepEqual(result.recipeCards.map(c=>c.recipeId),ids);assert.ok(result.recipeCards.every(c=>typeof c.canCookNow==='boolean'));
 assert.throws(()=>validateCandidate('recommendRecipes',{recipeIds:ids,canCookNow:true},normalizeContext(state)),/未经验证/);
});
test('unknown, duplicate, omitted, hard-limited and quantity-injecting candidates rejected',()=>{
 const state=normalizeContext(initialState()),ids=candidates(state);for(const recipeIds of [['invented'],[ids[0],ids[0]],ids.slice(1)])assert.throws(()=>validateCandidate('recommendRecipes',{recipeIds},state));
 const refs=Array(state.cycle.expectedMeals*2).fill(ids[0]);assert.throws(()=>validateCandidate('planBasket',{referenceRecipeIds:refs,tradeoffs:[],purchaseQty:999},state));state.diet.allergies=['鸡蛋'];assert.throws(()=>validateCandidate('recommendRecipes',{recipeIds:ids},state));
});
test('missing configuration and provider failure never fall back to Mock',async()=>{
 const s=initialState();await assert.rejects(createAIGateway({getConfig:async()=>({apiKey:''})})('planBasket',s),e=>e.code==='AI_NOT_CONFIGURED');await assert.rejects(createAIGateway({getConfig:config,fetchImpl:async()=>({ok:false,status:401})})('recommendRecipes',s),e=>e.code==='PROVIDER_AUTH'&&!e.message.includes('TEST_ONLY'));
});
test('bad contexts and truncated model output fail closed',async()=>{
 const s=initialState();assert.throws(()=>normalizeContext({...s,records:{}}),e=>e.status===400);assert.throws(()=>normalizeContext({...s,profile:{defaultDiners:0}}));await assert.rejects(createAIGateway({getConfig:config,fetchImpl:async()=>({ok:true,json:async()=>({choices:[{finish_reason:'length',message:{content:'{}'}}]})})})('recommendRecipes',s),e=>e.code==='INVALID_OUTPUT');
});
test('browser request omits photos, profile names, notes, and cooked plan history',async()=>{
 const {aiContext}=await import('../src/ai.js');const s=initialState();s.profile.nickname='PRIVATE_NICKNAME';s.records=[{recipeIds:[],photoRef:'PRIVATE_PHOTO',note:'PRIVATE_NOTE'}];s.kitchen.tools[0].note='PRIVATE_TOOL_NOTE';s.meal.plan={private:'PRIVATE_PLAN'};const payload=JSON.stringify(aiContext(s));assert.ok(!payload.includes('PRIVATE_'));normalizeContext(aiContext(s));
});
