import {visualResolver,stepVisualSpec} from './visual-resolver.js';
import {ingredients} from './data.js';
import {matchDishAsset} from './dish-asset-matcher.js';
import {recipeImageMap} from './recipe-image-map.js';
import {assetLibrary} from './asset-library.js';
export const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const glyph=(name,cls='')=>`<img class="ui-icon ${cls}" src="/assets/icons/${name}.svg" alt="" aria-hidden="true">`;
export function libraryArt(key,cls='',alt=''){const a=assetLibrary[key];return a?`<span class="asset-picture ${cls}" style="--asset-scale:${a.scale}"><img src="${a.src}" alt="${escapeHtml(alt)}"></span>`:'';}
const ingredientMap=Object.fromEntries(['tomato','egg','spinach','carrot','onion','potato','cucumber','mushroom','tofu','pork','broccoli','corn','garlic','rice'].map(id=>[id,`v5/ingredients/${id}`]));
for(const id of ['chicken','milk','scallion','noodles','cooking_oil','soy','salt'])ingredientMap[id]=`food-20260926/ingredients/${id}`;
ingredientMap.vinegar='ingredients/vinegar';
export const ingredientAssets=new Set([...Object.keys(ingredientMap),'lettuce']);
const ingredientSymbols={salt:'jar',cooking_oil:'drop',scallion:'plant',noodles:'bowl-food',chicken:'cooking-pot',milk:'drop',soy:'jar'};
export function ingredientArt(id){return `<span class="ingredient-icon ${ingredientAssets.has(id)?'has-art':'missing-art'}">${ingredientMap[id]?libraryArt(ingredientMap[id],'',ingredients[id].name):id==='lettuce'?`<img src="/assets/p0/ingredients/lettuce.png" alt="生菜">`:glyph(ingredientSymbols[id]||'plant')}</span>`;}
export const foodAssets=Object.fromEntries(Object.entries(recipeImageMap).filter(([,entry])=>entry.src).map(([id,entry])=>[id,entry.src]));
export function visualArt(spec){const visual=visualResolver.resolve(spec);if(visual.kind==='image')return `<img src="${escapeHtml(visual.url)}" alt="食材与厨具示意">`;const key=foodAssets[spec.assetRecipeId];if(key)return `<img class="mapped-dish" src="${escapeHtml(key)}" alt="成品菜">`;return `<span class="visual-composition" aria-label="实际食材与厨具示意">${spec.ingredientIds.filter(id=>!['salt','cooking_oil','soy','sugar','vinegar','sesame_oil'].includes(id)).slice(0,3).map(ingredientArt).join('')}${spec.toolIds.slice(0,1).map(id=>cookwareArt(id)).join('')}${glyph(spec.kind==='dish'?'bowl-food':spec.action==='wash'?'drop':'cooking-pot')}</span>`;}
export const stepArt=step=>visualArt(stepVisualSpec(step));
export function foodArt(r){if(!r)return '';const match=matchDishAsset(r);return match?`<div class="food-image has-art mapped-food"><img class="mapped-dish" src="${escapeHtml(match.src)}" alt="${escapeHtml(r.displayName||r.name)}"></div>`:`<div class="food-image no-photo mapped-food"><span class="dish-placeholder">${glyph('bowl-food')}<span>成品图待补充</span></span></div>`;}

const toolMap={knife:'v5/cookware/knife',mixing_bowl:'v5/cookware/mixing_bowl',wok:'onboarding/cookware_wok',stockpot:'onboarding/cookware_stock_pot',frying_pan:'onboarding/cookware_frying_pan',steamer:'onboarding/cookware_steamer','rice-cooker':'onboarding/appliance_rice_cooker',oven:'onboarding/appliance_oven',air_fryer:'onboarding/appliance_air_fryer',microwave:'onboarding/appliance_microwave',blender:'onboarding/appliance_blender'};
export const cookwareArt=(id,cls='')=>toolMap[id]?libraryArt(toolMap[id],`tool-art ${cls}`):glyph(id==='cutting_board'?'knife':'cooking-pot',`tool-art ${cls}`);
const cuisineMap={'中式':'chinese','日式':'japanese','韩式':'korean','西式':'western','东南亚':'southeast_asian'};
export const cuisineArt=style=>cuisineMap[style]?libraryArt('v5/cuisine/'+cuisineMap[style],'cuisine-art'):glyph('sparkle','cuisine-art');
const illustrationMap={basket_cat:'v5/decorative/basket',plant_olive:'supplement/decorative/flower_pot',chair:'supplement/decorative/chair',sprout:'supplement/decorative/sprout',recipe_note:'supplement/decorative/recipe_note',girl_cooking:'v5/decorative/girl_cooking',wash_ingredients:'v5/tutorial/wash',cut_ingredients:'v5/tutorial/cut',stir_fry:'v5/tutorial/stir_fry',simmer:'v5/tutorial/simmer',mix:'v5/tutorial/mix',plate:'v5/tutorial/plate'};
export const illustration=(group,name,cls='',alt='')=>illustrationMap[name]?libraryArt(illustrationMap[name],`illustration ${cls}`,alt):`<img class="illustration ${cls}" src="/assets/p0/${group}/${name}.png" alt="${escapeHtml(alt)}">`;
