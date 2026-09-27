import {resolveActionAsset} from './action-assets.js';
// Visual specifications contain approved facts only. Providers cannot change recipes or steps.
export class ImageGenerationProvider {
 enabled=false;
 async generate(_spec){return null;}
}
export function dishVisualSpec(recipe){return {version:1,style:'yilan-watercolor',kind:'dish',identity:recipe.visualChange==='major'?recipe.variantKey:recipe.baseRecipeId||recipe.id,assetRecipeId:recipe.assetRecipeId===undefined?recipe.id:recipe.assetRecipeId,ingredientIds:recipe.ingredients.map(i=>i.ingredientId),toolIds:[],action:'plate'};}
export function stepVisualSpec(step){return {version:1,style:'yilan-watercolor',kind:'step',phase:step.phase,actionCode:step.actionCode,ingredientIds:[...new Set(step.ingredientIds||[])].sort(),toolIds:[...new Set(step.toolIds||[])].sort(),action:step.action||'prepare',instruction:step.instruction||step.text||'',targetState:step.targetState||''};}
export class VisualResolver {
 constructor({provider=new ImageGenerationProvider(),cache=new Map()}={}){this.provider=provider;this.cache=cache;this.pending=new Map();}
 key(spec){return JSON.stringify(spec.kind==='dish'&&spec.assetRecipeId?{version:spec.version,style:spec.style,kind:spec.kind,assetRecipeId:spec.assetRecipeId}:spec);}
 fallback(spec){return {kind:spec.assetRecipeId?'asset':'composition',spec};}
 resolve(spec){if(spec.kind==='step'){const asset=resolveActionAsset(spec);return asset?{kind:'image',url:asset.src,actionCode:asset.actionCode,spec}:{kind:'neutral',spec};}const cached=this.cache.get(this.key(spec));if(cached)return cached;if(!spec.assetRecipeId&&this.provider.enabled&&!this.pending.has(this.key(spec)))void this.generate(spec);return this.fallback(spec);}
 async generate(spec){if(spec.kind==='step')return this.resolve(spec);const key=this.key(spec);if(this.cache.has(key))return this.cache.get(key);if(this.pending.has(key))return this.pending.get(key);const request=(async()=>{try{const result=await this.provider.generate(structuredClone(spec));if(result&&typeof result.url==='string'&&/^(https:\/\/|\/(?!\/))/.test(result.url)){const visual={kind:'image',url:result.url,spec};this.cache.set(key,visual);if(typeof globalThis.dispatchEvent==='function')globalThis.dispatchEvent(new Event('yilan-visual-ready'));return visual;}return this.fallback(spec);}catch{return this.fallback(spec);}finally{this.pending.delete(key);}})();this.pending.set(key,request);return request;}
}
// Inject durable cache + a server-backed provider when image generation is enabled.
export class PersistentVisualCache {
 constructor(storage){this.storage=storage;this.memory=new Map();try{for(const [key,value] of JSON.parse(storage?.getItem('yilan-visual-cache-v1')||'[]'))this.memory.set(key,value);}catch{/* Corrupt visual cache never blocks cooking. */}}
 get(key){return this.memory.get(key);}has(key){return this.memory.has(key);}
 set(key,value){this.memory.set(key,value);if(this.memory.size>100)this.memory.delete(this.memory.keys().next().value);try{this.storage?.setItem('yilan-visual-cache-v1',JSON.stringify([...this.memory]));}catch{/* Memory cache remains usable if storage is full. */}}
}
let storage;try{storage=globalThis.localStorage;}catch{/* Storage may be unavailable. */}
export const visualResolver=new VisualResolver({cache:new PersistentVisualCache(storage)});
