import {ingredients} from './data.js';
export const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const glyph=(name,cls='')=>`<img class="ui-icon ${cls}" src="/assets/icons/${name}.svg" alt="" aria-hidden="true">`;
export const ingredientAssets=new Set(['tomato','egg','lettuce','cucumber','onion','carrot']);
const ingredientSymbols={salt:'jar',cooking_oil:'drop',garlic:'plant',scallion:'plant',rice:'bowl-food',noodles:'bowl-food',chicken:'cooking-pot',tofu:'cube',mushroom:'plant',milk:'drop',soy:'jar',potato:'plant'};
export function ingredientArt(id){return `<span class="ingredient-icon ${ingredientAssets.has(id)?'has-art':'missing-art'}">${ingredientAssets.has(id)?`<img src="/assets/p0/ingredients/${id}.png" alt="${ingredients[id].name}">`:glyph(ingredientSymbols[id]||'plant')}</span>`;}
export const foodAssets={tomato_scrambled_egg:'tomato_egg.jpg',garlic_lettuce:'garlic_lettuce.jpg'};
export function foodArt(r){return `<div class="food-image ${foodAssets[r?.id]?'has-art':'no-photo'}">${foodAssets[r?.id]?`<img src="/assets/p0/food_cards/${foodAssets[r.id]}" alt="${escapeHtml(r.name)}">`:`${glyph('bowl-food')}<span class="placeholder-caption">菜品图待补</span>`}</div>`;}
export const illustration=(group,name,cls='',alt='')=>`<img class="illustration ${cls}" src="/assets/p0/${group}/${name}.png" alt="${escapeHtml(alt)}">`;
