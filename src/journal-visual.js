import {recipes} from './data.js';
import {foodArt,escapeHtml as esc} from './assets.js';
export function journalVisual(record){
 if(record.photoRef)return `<img class="preview" src="${esc(record.photoRef)}" alt="${esc(record.title)}">`;
 const ids=record.linkedRecipeId?[record.linkedRecipeId]:record.recipeIds?.length?record.recipeIds:record.displayRecipeIds||[];
 const dishes=record.adaptedRecipes?.length?record.adaptedRecipes:ids.map((id,index)=>recipes.find(r=>r.id===(record.displayRecipeIds?.[index]||id))||{id,name:'菜品图片待补充'});
 if(!dishes.length)return foodArt({id:'missing-journal-image',name:record.title});
 if(dishes.length===1)return foodArt(dishes[0]);
 return `<div class="journal-meal-images" aria-label="这餐的 ${dishes.length} 道菜">${dishes.map(r=>`<figure aria-label="${esc(r.displayName||r.name)}">${foodArt(r)}</figure>`).join('')}</div>`;
}
