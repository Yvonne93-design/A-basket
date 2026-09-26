import {ingredients,recipes} from './data.js';
import {eligible,requirements} from './domain.js';
export const pantryIds=['salt','cooking_oil','soy','vinegar','sugar','sesame_oil'];
export const isPantry=id=>pantryIds.includes(id);
export const availableQty=(s,id)=>s.stock.filter(l=>l.ingredientId===id&&l.status==='available').reduce((n,l)=>n+l.qty,0);
export const pantryStatus=(s,id)=>s.pantry?.[id]||(availableQty(s,id)>0?'有':'没有');
export const plannerQty=(s,id)=>s.cycle.carryOverEnabled!==false&&!(s.cycle.excludedStockIds||[]).includes(id)?availableQty(s,id):0;
export const cycleGoals=['蔬菜多一点','肉蛋奶都来点','耐放一点','换换口味','适合带饭'];
export function normalizeProductState(s){s.cycle.goals=[...new Set((s.cycle.goals||[]).map(g=>({'多些蔬菜':'蔬菜多一点','蛋豆肉换着吃':'肉蛋奶都来点'}[g]||g)))].filter(g=>cycleGoals.includes(g)).slice(0,2);s.cycle.excludedStockIds??=[];s.pantry??={};s.unitPrefs??={};s.meal.constraints.cuisines??=[];s.meal.constraints.flavors??=[];return s;}
export function unitInfo(s,id){if(id==='milk')return s.unitPrefs?.milk==='bottle'?{unit:'瓶',size:1000}:{unit:'盒',size:250};if(isPantry(id))return {unit:['salt','sugar'].includes(id)?'袋':'瓶',size:500};return {unit:ingredients[id].unit,size:1};}
export function displayQty(s,id,qty){const u=unitInfo(s,id);return `${Math.round(qty/u.size*100)/100} ${u.unit}`;}
export function stockLabel(s,id){return isPantry(id)?pantryStatus(s,id):displayQty(s,id,availableQty(s,id));}
export const optionalByRecipe={miso_tofu_soup:['scallion'],tomato_pasta:['onion'],potato_soup:['onion'],oyakodon:['onion'],japanese_potato_stew:['onion','carrot']};
// Only authored, cooked-vegetable alternatives. Core proteins and allergens are never inferred.
export const substitutesByRecipe={garlic_spinach:{spinach:['lettuce']},garlic_lettuce:{lettuce:['spinach']},vegetable_noodles:{spinach:['lettuce']}};
const allowedIngredient=(s,id)=>![...s.diet.allergies,...s.diet.absoluteAvoids].some(a=>ingredients[id].name.includes(a));
const adaptationCache=new Map();
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
export function mealAdaptation(s,ids=s.meal.selectedRecipeIds){
 const key=JSON.stringify([ids,s.meal.diners,s.stock,s.pantry,s.diet]);if(adaptationCache.has(key))return adaptationCache.get(key);
 const dishes=ids.map(id=>recipes.find(r=>r.id===id)).filter(Boolean),pool={},needs={},adaptations=[];
 for(const id of Object.keys(ingredients))pool[id]=availableQty(s,id);
 const add=(id,qty)=>{needs[id]=(needs[id]||0)+qty;if(!isPantry(id))pool[id]-=qty;};
 // Reserve all mandatory ingredients first so optional garnish cannot consume another dish's main ingredient.
 for(const r of dishes)for(const i of r.ingredients)if(!(optionalByRecipe[r.id]||[]).includes(i.ingredientId)&&!substitutesByRecipe[r.id]?.[i.ingredientId])add(i.ingredientId,i.qty*s.meal.diners/r.servingBase);
 for(const r of dishes)for(const i of r.ingredients){const qty=i.qty*s.meal.diners/r.servingBase,id=i.ingredientId;if((optionalByRecipe[r.id]||[]).includes(id)){if(pool[id]>=qty)add(id,qty);else adaptations.push({recipeId:r.id,kind:'omit',ingredientId:id,message:`${r.name}可以不放${ingredients[id].name}`});}else if(substitutesByRecipe[r.id]?.[id]){const replacement=pool[id]>=qty?id:substitutesByRecipe[r.id][id].find(x=>pool[x]>=qty&&allowedIngredient(s,x));if(replacement){add(replacement,qty);if(replacement!==id)adaptations.push({recipeId:r.id,kind:'substitute',ingredientId:id,replacementId:replacement,message:`${r.name}用${ingredients[replacement].name}代替${ingredients[id].name}，仍需煮熟`});}else add(id,qty);}}
 const requirements=Object.entries(needs).map(([ingredientId,qty])=>({ingredientId,qty:Math.round(qty*100)/100,unit:ingredients[ingredientId].unit}));
 const missing=requirements.flatMap(i=>{const missing=isPantry(i.ingredientId)?pantryStatus(s,i.ingredientId)==='没有'?i.qty:0:Math.max(0,Math.round((i.qty-availableQty(s,i.ingredientId))*100)/100);return missing?[{...i,missing}]:[];});
 const result=freeze({requirements,adaptations,missing,canCookNow:!missing.length,adaptedRecipes:dishes.map(r=>compileRecipe(r,s,adaptations))});if(adaptationCache.size>=64)adaptationCache.delete(adaptationCache.keys().next().value);adaptationCache.set(key,result);return result;
}
export const cookingNeeds=s=>s.meal.state==='cooking'?(s.meal.plan?.requirements||s.meal.cookingNeeds||requirements(s.meal.selectedRecipeIds,s.meal.diners)):mealAdaptation(s).requirements;
// Only catalog-authored transformations compile executable recipes; model prose is never executed.
function compileRecipe(r,s,changes){const own=changes.filter(a=>a.recipeId===r.id);
 const removed=new Set(own.filter(a=>a.kind==='omit').map(a=>a.ingredientId));
 const replacements={
  scallion:[['、小葱切末',''],['和小葱','']],
  carrot:[['、胡萝卜',''],['胡萝卜、',''],['和胡萝卜','']],
  onion:[['番茄与洋葱','番茄'],['番茄和洋葱','番茄'],['，洋葱切碎',''],['土豆洋葱','土豆'],['洋葱切丝，',''],['洋葱鸡肉','鸡肉']]
 };
 const keep=r.atomicSteps.filter(step=>!(step.phase==='wash'&&removed.has(step.ingredientIds[0]))),ids=new Set(keep.map(x=>x.id));
 const atomicSteps=keep.map(step=>{let instruction=step.instruction;for(const a of own){if(a.kind==='omit')for(const [from,to] of replacements[a.ingredientId]||[])instruction=instruction.replaceAll(from,to);else instruction=instruction.replaceAll(ingredients[a.ingredientId].name,ingredients[a.replacementId].name);}return {...step,ingredientIds:step.ingredientIds.filter(id=>!removed.has(id)).map(id=>own.find(a=>a.kind==='substitute'&&a.ingredientId===id)?.replacementId||id),instruction,dependencies:step.dependencies.filter(id=>ids.has(id))};});

 const substituted=own.filter(a=>a.kind==='substitute');let name=r.name;for(const a of substituted)name=name.replaceAll(ingredients[a.ingredientId].name,ingredients[a.replacementId].name);
 const finalIngredients=r.ingredients.filter(i=>!removed.has(i.ingredientId)).map(i=>({...i,ingredientId:substituted.find(a=>a.ingredientId===i.ingredientId)?.replacementId||i.ingredientId,qty:i.qty*s.meal.diners/r.servingBase}));
 const major=substituted.length>0||own.some(a=>a.kind==='omit'&&a.ingredientId==='carrot');
 const leaf=substituted.find(a=>['garlic_spinach','garlic_lettuce'].includes(r.id));
 return {...r,schemaVersion:1,baseRecipeId:r.id,sourceRecipeId:r.id,name,displayName:name,servingBase:s.meal.diners,ingredients:finalIngredients,atomicSteps,adaptations:own,variantKey:JSON.stringify([r.id,adaptationCodes(own)]),visualChange:major?'major':own.length?'minor':'exact',assetRecipeId:leaf?(leaf.replacementId==='lettuce'?'garlic_lettuce':'garlic_spinach'):major?null:r.id,tasteNotes:own.map(a=>a.kind==='omit'?`不放${ingredients[a.ingredientId].name}，少一些配料香气`:`改用${ingredients[a.replacementId].name}，叶菜口感会不同`)};
}
export function adaptedRecipe(r,s){return (s.meal.state==='cooking'&&s.meal.plan?.adaptedRecipes?.find(x=>x.baseRecipeId===r.id))||mealAdaptation(s,[...new Set([...s.meal.selectedRecipeIds,r.id])]).adaptedRecipes.find(x=>x.baseRecipeId===r.id);}
export function directionOptions(s){const allowed=recipes.filter(r=>eligible(r,s));return {cuisines:[...new Set(allowed.map(r=>r.cuisine))],flavors:[...new Set(allowed.flatMap(r=>r.flavorTags))],mealTypes:[...new Set(allowed.map(r=>r.mealType))]};}
export const allowsTopUp=s=>['可以补买 1–2 样','可接受少量补买'].includes(s.meal.constraints.stockPolicy);
export function purchaseRows(s,needs,planner=false){return needs.map(i=>{const existingQty=planner?plannerQty(s,i.ingredientId):availableQty(s,i.ingredientId),size=unitInfo(s,i.ingredientId).size;const deficit=Math.max(0,i.qty-existingQty);const purchaseQty=isPantry(i.ingredientId)?(pantryStatus(s,i.ingredientId)==='没有'||planner&&pantryStatus(s,i.ingredientId)==='快没了'?size:0):i.ingredientId==='milk'?Math.ceil(deficit/size)*size:Math.round(deficit*100)/100;return {ingredientId:i.ingredientId,requiredQty:i.qty,existingQty,purchaseQty,unit:i.unit,reasonCodes:[existingQty?'已有的已算入':'按这次用量准备'],locked:false};}).filter(i=>i.purchaseQty>0);}
export function candidateAssessment(s,id){const selected=[...new Set([...s.meal.selectedRecipeIds,id])];const adaptation=mealAdaptation(s,selected);const hardValid=selected.every(x=>{const r=recipes.find(r=>r.id===x);return r&&eligible(r,s);});const cookability=!hardValid?'blocked':adaptation.missing.length?(adaptation.missing.length<=2?'needs_purchase':'blocked'):adaptation.adaptations.length?'adaptable':'exact';return {...adaptation,cookability,allowed:hardValid&&(adaptation.canCookNow||allowsTopUp(s)&&adaptation.missing.length<=2),purchaseSuggestions:purchaseRows(s,adaptation.requirements)};}
export function recipeView(s,id){const r=recipes.find(r=>r.id===id);return r?adaptedRecipe(r,s):r;}

export const adaptationCodes=adaptations=>adaptations.map(a=>[a.recipeId,a.kind,a.ingredientId,a.replacementId||''].join(':')).sort();

export function enterCookingBrowse(s){if(s.meal.state==='cooking')return;s.meal.constraints={cuisines:[],flavors:[],mealType:'还没想好',timeLimit:180,operationPrefs:[],stockPolicy:'现有食材优先'};}
