import test from 'node:test';import assert from 'node:assert/strict';
import {journalVisual} from '../src/journal-visual.js';import {recipes} from '../src/data.js';import {recipeImageMap} from '../src/recipe-image-map.js';
test('multi-dish records show every saved adapted dish instead of only the first',()=>{
 const record={title:'蒜蓉生菜 · 土豆炒鸡蛋',adaptedRecipes:['garlic_lettuce','potato_egg'].map(id=>structuredClone(recipes.find(r=>r.id===id)))};const before=JSON.stringify(record),html=journalVisual(record);
 assert.ok(html.includes(recipeImageMap.garlic_lettuce.src));assert.ok(html.includes(recipeImageMap.potato_egg.src));assert.equal((html.match(/<figure /g)||[]).length,2);assert.equal(JSON.stringify(record),before);assert.doesNotMatch(html,/<figcaption>/);
});
test('older records retain all recipe ids and missing dish art remains explicit',()=>{
 const html=journalVisual({recipeIds:['garlic_lettuce','corn_pork_soup','unknown-dish']});assert.match(html,/蒜蓉生菜/);assert.match(html,/玉米肉片汤/);assert.match(html,/成品图待补充/);
});
test('major adaptation snapshots do not revert to the base dish art',()=>{
 const r={...recipes[0],assetRecipeId:null,visualChange:'major',displayName:'适配菜'};const html=journalVisual({adaptedRecipes:[r]});assert.match(html,/成品图待补充/);assert.ok(!html.includes(recipeImageMap[recipes[0].id].src));
});
test('user photos and single-dish records preserve their rendering',()=>{
 assert.match(journalVisual({photoRef:'/photo.png',title:'这一餐',recipeIds:['potato_egg']}),/src="\/photo.png"/);assert.doesNotMatch(journalVisual({recipeIds:['potato_egg']}),/journal-meal-images/);
});
