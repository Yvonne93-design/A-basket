import {stockedState} from './helpers/kitchen.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,recipes} from '../src/data.js';
import {eligible,requirements} from '../src/domain.js';
import {verifiedReasons} from '../src/planning.js';
import {normalizeContext,validateCandidate,createAIGateway} from '../server/ai-gateway.js';
const config=async()=>({apiKey:'TEST_ONLY_NOT_A_REAL_KEY',model:'test-model',baseUrl:'https://api.openai.com/v1'});
const candidates=s=>recipes.filter(r=>eligible(r,s)).map(r=>r.id);
const reply=body=>({ok:true,json:async()=>({choices:[{finish_reason:'stop',message:{content:JSON.stringify(body)}}]})});
test('OpenAI basket candidates are validated then quantities computed locally; repeat is cached',async()=>{
 const state=initialState();state.cycle.anchorWantedDishIds=[];const ids=candidates(state);const refs=Array.from({length:state.cycle.expectedMeals*2},(_,i)=>ids[i%ids.length]);let calls=0;
 const run=createAIGateway({getConfig:config,fetchImpl:async(url,opts)=>{calls++;assert.equal(url,'https://api.openai.com/v1/chat/completions');const body=JSON.parse(opts.body);assert.equal(body.response_format.type,'json_object');assert.ok(!body.messages[1].content.includes('nickname'));return reply({referenceRecipeIds:refs,planningStrategy:['reuse_stock'],planningInsights:[]});}});
 const before=structuredClone(state);const result=await run('planBasket',state);assert.equal(result.meta.source,'real');assert.deepEqual(result.ingredientSuggestions.map(i=>[i.ingredientId,i.requiredQty]),requirements(refs,state.profile.defaultDiners).filter(i=>i.qty>state.stock.filter(l=>l.ingredientId===i.ingredientId).reduce((n,l)=>n+l.qty,0)).map(i=>[i.ingredientId,i.qty]));assert.deepEqual(state,before);assert.equal((await run('planBasket',state)).meta.cached,true);assert.equal(calls,1);
});
test('real recipe order preserved but availability cannot be supplied by model',async()=>{
 const state=stockedState();const ids=candidates(state).reverse();const run=createAIGateway({getConfig:config,fetchImpl:async()=>reply({recipeCards:ids.map(recipeId=>({recipeId,reasonCodes:verifiedReasons(recipes.find(r=>r.id===recipeId),state)}))})});const result=await run('recommendRecipes',state);assert.deepEqual(result.recipeCards.map(c=>c.recipeId),ids);assert.ok(result.recipeCards.every(c=>typeof c.canCookNow==='boolean'));
 assert.throws(()=>validateCandidate('recommendRecipes',{recipeIds:ids,canCookNow:true},normalizeContext(state)),/校验/);
});
test('unknown, duplicate, omitted, hard-limited and quantity-injecting candidates rejected',()=>{
 const state=normalizeContext(initialState()),ids=candidates(state);for(const recipeIds of [['invented'],[ids[0],ids[0]],ids.slice(1)])assert.throws(()=>validateCandidate('recommendRecipes',{recipeIds},state));
 const refs=Array(state.cycle.expectedMeals*2).fill(ids[0]);assert.throws(()=>validateCandidate('planBasket',{referenceRecipeIds:refs,tradeoffs:[],purchaseQty:999},state));state.diet.allergies=['鸡蛋'];assert.throws(()=>validateCandidate('recommendRecipes',{recipeIds:ids},state));
});
test('missing configuration and provider failure return explicit fallback',async()=>{const s=stockedState();assert.equal((await createAIGateway({getConfig:async()=>({apiKey:''})})('planBasket',s)).meta.source,'fallback');assert.equal((await createAIGateway({getConfig:config,fetchImpl:async()=>({ok:false,status:401})})('recommendRecipes',s)).meta.fallbackReason,'PROVIDER_AUTH');});
test('bad contexts and truncated model output fail closed',async()=>{
 const s=stockedState();assert.throws(()=>normalizeContext({...s,records:{}}),e=>e.status===400);assert.throws(()=>normalizeContext({...s,profile:{defaultDiners:0}}));assert.equal((await createAIGateway({getConfig:config,fetchImpl:async()=>({ok:true,json:async()=>({choices:[{finish_reason:'length',message:{content:'{}'}}]})})})('recommendRecipes',s)).meta.fallbackReason,'INVALID_OUTPUT');
});
test('browser request omits photos, profile names, notes, and cooked plan history',async()=>{
 const {aiContext}=await import('../src/ai.js');const s=initialState();s.profile.nickname='PRIVATE_NICKNAME';s.records=[{recipeIds:[],photoRef:'PRIVATE_PHOTO',note:'PRIVATE_NOTE'}];s.kitchen.tools[0].note='PRIVATE_TOOL_NOTE';s.meal.plan={private:'PRIVATE_PLAN'};const payload=JSON.stringify(aiContext(s));assert.ok(!payload.includes('PRIVATE_'));normalizeContext(aiContext(s));
});

test('cooking optimizer uses compact kitchen facts, low effort and a validated baseline; unrelated history reuses cache',async()=>{
 const state=stockedState();state.meal.selectedRecipeIds=['tomato_pasta','miso_tofu_soup'];let calls=0;
 const run=createAIGateway({getConfig:config,fetchImpl:async(url,opts)=>{calls++;const body=JSON.parse(opts.body),context=JSON.parse(body.messages[1].content);assert.equal(body.reasoning_effort,'low');assert.equal(body.max_tokens,3000);assert.equal(context.cycle,undefined);assert.equal(context.history,undefined);assert.equal(context.confirmedStock,undefined);assert.equal(context.recipeLibrary.length,2);assert.ok(context.recipeLibrary.every(r=>r.atomicSteps.length));assert.deepEqual(context.baselineStrategy.preferredOrder.sort(),[...state.meal.selectedRecipeIds].sort());return reply(context.baselineStrategy);}});
 const first=await run('proposeCookingStrategy',state);assert.equal(first.meta.source,'real');assert.ok(first.meta.durationMs>=0);
 state.records.push({recipeIds:['tomato_scrambled_egg']});state.cycle.goals=['蔬菜多一点'];assert.equal((await run('proposeCookingStrategy',state)).meta.cached,true);assert.equal(calls,1);
});

test('DeepSeek strategy explicitly disables deep thinking for bounded JSON optimization',async()=>{
 const state=stockedState();state.meal.selectedRecipeIds=['tomato_pasta','miso_tofu_soup'];
 const run=createAIGateway({getConfig:async()=>({...await config(),baseUrl:'https://api.deepseek.com',model:'deepseek-flash'}),fetchImpl:async(url,opts)=>{const body=JSON.parse(opts.body);assert.deepEqual(body.thinking,{type:'disabled'});assert.equal(body.reasoning_effort,undefined);return reply(JSON.parse(body.messages[1].content).baselineStrategy);}});
 assert.equal((await run('proposeCookingStrategy',state)).meta.source,'real');
});
