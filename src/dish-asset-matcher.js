import {recipeImageMap} from './recipe-image-map.js';
// Only an authored recipe identity (including an approved adapted identity) may select art.
// Ingredient combinations and filenames are audit metadata, never runtime guesses.
export function matchDishAsset(recipe){
 if(!recipe)return null;
 const id=recipe.assetRecipeId===undefined?recipe.id:recipe.assetRecipeId;
 if(recipe.visualChange==='major'&&recipe.assetRecipeId===undefined)return null;
 const entry=id&&recipeImageMap[id];
 return entry?.src?{...entry,recipeId:id}:null;
}
