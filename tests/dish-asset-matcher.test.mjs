import test from 'node:test';import assert from 'node:assert/strict';import {existsSync,readFileSync} from 'node:fs';
import {matchDishAsset} from '../src/dish-asset-matcher.js';
import {recipeImageMap} from '../src/recipe-image-map.js';
import {recipes} from '../src/data.js';import {foodArt,foodAssets} from '../src/assets.js';
test('every current recipe has one reviewed image or an explicit missing entry',()=>{
 assert.deepEqual(Object.keys(recipeImageMap).sort(),recipes.map(r=>r.id).sort());
 for(const r of recipes){const entry=recipeImageMap[r.id];assert.equal(entry.name,r.name);assert.ok(entry.note);if(entry.src)assert.ok(existsSync(new URL('../public'+entry.src,import.meta.url)));}
});
test('new and old assets share one mapping across every food rendering context',()=>{
 assert.match(foodAssets.tomato_scrambled_egg,/food-clean-v3/);assert.match(foodAssets.potato_egg,/food-20260926/);
 for(const r of recipes){const before=JSON.stringify(r),html=foodArt(r);if(recipeImageMap[r.id].src)assert.ok(html.includes(recipeImageMap[r.id].src));else assert.match(html,/成品图待补充/);assert.equal(JSON.stringify(r),before);}
});
test('unknown and major adaptations never guess using similar names or ingredient sets',()=>{
 const r=recipes[0];assert.equal(matchDishAsset({...r,id:'unknown'}),null);
 assert.equal(matchDishAsset({...r,visualChange:'major',assetRecipeId:null}),null);
 assert.equal(matchDishAsset({...r,visualChange:'major'}),null);
 assert.equal(matchDishAsset({...r,visualChange:'minor',assetRecipeId:r.id}).src,recipeImageMap[r.id].src);
 const leaf={...r,visualChange:'major',assetRecipeId:'garlic_lettuce'};assert.equal(matchDishAsset(leaf).src,recipeImageMap.garlic_lettuce.src);
 for(const id of ['corn_pork_soup','onion_beef_style_pork','teriyaki_chicken_rice'])assert.equal(recipeImageMap[id].src,`/assets/library/food-19-complete/${id}.png`);
});
test('selected PNGs render without legacy zoom or composition wrappers',()=>{
 const html=foodArt(recipes[0]);assert.doesNotMatch(html,/asset-picture|visual-composition|asset-scale/);
 const css=readFileSync(new URL('../src/library-pass.css',import.meta.url),'utf8');assert.match(css,/object-fit:contain!important;transform:none!important;clip-path:none!important;mask:none!important/);
});
test('all 19 supplied CSV names match the exact recipe and asset filename',async()=>{
 const {journalVisual}=await import('../src/journal-visual.js');
 const {renderTutorialComponents}=await import('../src/tutorial-components.js');
 const rows=readFileSync(new URL('../public/assets/library/food-19-complete/mapping.csv',import.meta.url),'utf8').trim().split(/\r?\n/).slice(1);assert.equal(rows.length,19);
 for(const line of rows){const [name,file]=line.split(','),id=file.replace(/\.png$/,''),r=recipes.find(r=>r.id===id),src='/assets/library/food-19-complete/'+file;
  assert.equal(r.name,name);assert.equal(recipeImageMap[id].src,src);assert.ok(foodArt(r).includes(src));assert.ok(journalVisual({recipeIds:[id]}).includes(src));
  const html=renderTutorialComponents({adaptedRecipes:[r],atomicTimeline:[],ingredientNeeds:[],estimatedMinutes:r.totalTime},{diners:2,quantityLabel:()=>''});assert.ok(html.includes(src));
 }
 assert.equal(recipes.find(r=>r.id==='onion_beef_style_pork').ingredients.some(i=>i.ingredientId==='beef'),false);
});
