import {purchaseRows} from './food-rules.js';
import {basicStrategy,validateStrategy} from './scheduler.js';
import {basicPlan,basicRecommendations,verifiedInsights,planningMessages,resolveRecipeCards,basketPlanningIssue} from './planning.js';
import {recipes,ingredients} from './data.js';
import {eligible,requirements,cookingPlan,validateCookingPlan} from './domain.js';
export const aiDiagnostics=[];
function recordDiagnostic(task,meta){aiDiagnostics.push({task,...meta,at:new Date().toISOString()});if(aiDiagnostics.length>20)aiDiagnostics.shift();}
export class MockAdapter {
 async planBasket(state){return basicPlan(state);}
 async recommendRecipes(state){return basicRecommendations(state);}
 async proposeCookingStrategy(state){return {...basicStrategy(state),meta:{source:'mock'}};}
 async generateCookingPlan(state){return cookingPlan(state);}
 async parseReceiptOrIngredientPhoto(){return {items:[{ingredientIdCandidate:'tomato',nameCandidate:'番茄',qtyCandidate:2,unitCandidate:'个',confidence:0.5}]};}
 async parseDishPhoto(){return {dishNameCandidates:['番茄炒蛋'],styleTags:['家常'],linkedRecipeCandidates:['tomato_scrambled_egg']};}
 async parseKitchenPhoto(){return {toolCandidates:[{type:'wok',name:'炒锅',quantityCandidate:1,confidence:0.5},{type:'stockpot',name:'汤锅',quantityCandidate:1,confidence:0.5}],stoveSlotsCandidate:2};}
}
// Backend handles credentials. The browser only posts task context to a same-origin endpoint.
export function aiContext(s){return {pantry:s.pantry||{},unitPrefs:s.unitPrefs||{},profile:{defaultDiners:s.profile.defaultDiners},cycle:s.cycle,diet:s.diet,kitchen:{stoveSlots:s.kitchen.stoveSlots,tools:s.kitchen.tools.map(({id,quantity,available})=>({id,quantity,available}))},stock:s.stock.map(({ingredientId,qty,unit,status})=>({ingredientId,qty,unit,status})),wanted:s.wanted.map(({id,linkedRecipeId})=>({id,linkedRecipeId})),records:s.records.slice(0,5).map(({recipeIds})=>({recipeIds:recipeIds||[]})),meal:{diners:s.meal.diners,selectedRecipeIds:s.meal.selectedRecipeIds,constraints:s.meal.constraints}};}
export class RealAIAdapter extends MockAdapter {
 constructor(endpoint='/api/ai'){super();this.endpoint=endpoint;}
 async request(task,input){try{const response=await fetch(this.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({task,input:aiContext(input)}),signal:AbortSignal.timeout(task==='proposeCookingStrategy'?22000:15000)});const out=await response.json();if(!response.ok)throw new Error('AI 服务不可用');recordDiagnostic(task,out.meta);return out;}catch{recordDiagnostic(task,{source:'fallback',fallbackReason:'TRANSPORT_ERROR'});const out=await MockAdapter.prototype[task].call(this,input);return {...out,meta:{source:'fallback',fallbackReason:'TRANSPORT_ERROR',message:'AI 服务暂时繁忙，已使用基础规划。'}};}}
 async planBasket(input){return this.request('planBasket',input);}
 async recommendRecipes(input){return this.request('recommendRecipes',input);}
 async proposeCookingStrategy(input){return this.request('proposeCookingStrategy',input);}
 async generateCookingPlan(state){const proposed=await this.proposeCookingStrategy(state);return {...cookingPlan(state,proposed),meta:proposed.meta};}
}
export class AIService {
 constructor(adapter=new MockAdapter()){this.adapter=adapter;this.mode=adapter instanceof RealAIAdapter?'Real':adapter instanceof MockAdapter?'Mock':'Real';}
 async planBasket(state){const issue=basketPlanningIssue(state);if(issue)throw new Error(issue);const out=await this.adapter.planBasket(structuredClone(state));if(!Array.isArray(out.referenceRecipeIds)||!out.referenceRecipeIds.length||out.referenceRecipeIds.some(id=>!recipes.some(r=>r.id===id&&eligible(r,state))))throw new Error('AI 方案未通过菜谱校验');const anchors=state.cycle.anchorWantedDishIds.map(id=>state.wanted.find(w=>w.id===id)?.linkedRecipeId).filter(Boolean);if(anchors.some(id=>!out.referenceRecipeIds.includes(id)))throw new Error('AI 方案遗漏了锚点菜');const rows=purchaseRows(state,requirements(out.referenceRecipeIds,state.profile.defaultDiners),true);const validInsights=verifiedInsights(out.referenceRecipeIds,state);const planningInsights=Array.isArray(out.planningInsights)?out.planningInsights.filter(i=>validInsights.some(v=>v.type===i.type&&v.ingredientId===i.ingredientId&&JSON.stringify([...v.recipeIds].sort())===JSON.stringify([...(i.recipeIds||[])].sort()))):validInsights.slice(0,8);return {...out,planningMessages:planningMessages(out.referenceRecipeIds,state),planningInsights,ingredientSuggestions:rows,tradeoffs:Array.isArray(out.tradeoffs)?out.tradeoffs.filter(x=>typeof x==='string'):[]};}
 async recommendRecipes(state){const out=await this.adapter.recommendRecipes(structuredClone(state));if(!Array.isArray(out.recipeCards))throw new Error('推荐格式无效');const ranked=[...out.recipeCards,...basicRecommendations(state).recipeCards.filter(c=>!out.recipeCards.some(x=>x.recipeId===c.recipeId))];return {...out,...resolveRecipeCards(ranked,state)};}
 async proposeCookingStrategy(state){const out=await this.adapter.proposeCookingStrategy(structuredClone(state));const {meta,...strategy}=out;return {...validateStrategy(strategy,state),meta};}
 async generateCookingPlan(state){const plan=await this.adapter.generateCookingPlan(structuredClone(state));return validateCookingPlan(plan,state);}
 async parseReceiptOrIngredientPhoto(image){const out=await this.adapter.parseReceiptOrIngredientPhoto(image);if(!Array.isArray(out.items))throw new Error('识别格式无效，请手动添加');return {items:out.items.filter(i=>ingredients[i.ingredientIdCandidate]).map(i=>({...i,qtyCandidate:Number.isFinite(i.qtyCandidate)&&i.qtyCandidate>0?i.qtyCandidate:1,unitCandidate:ingredients[i.ingredientIdCandidate].unit}))};}
 async parseDishPhoto(image){const out=await this.adapter.parseDishPhoto(image);if(!Array.isArray(out.dishNameCandidates)||typeof out.dishNameCandidates[0]!=='string')throw new Error('识别失败，请手动填写');return out;}
 async parseKitchenPhoto(image){const out=await this.adapter.parseKitchenPhoto(image);if(!Array.isArray(out.toolCandidates))throw new Error('识别失败，请手动添加厨具');return out;}
}
// Real server first; explicit deterministic fallback keeps the demo usable without credentials.
export const ai=new AIService(new RealAIAdapter());
