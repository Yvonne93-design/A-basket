import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
import {newUserState,recipes,newId} from '../src/data.js';import {foodAssets} from '../src/assets.js';
const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
test('browsing food inspiration does not seed personal history; hearts save and remove real choices',async()=>{
 const state=newUserState(),ctx=vm.createContext({state,foodAssets,newId,recipe:id=>recipes.find(r=>r.id===id),save(){}});
 vm.runInContext(source.slice(source.indexOf('async function act('),source.indexOf("app.addEventListener('click'")),ctx);
 const id=Object.keys(foodAssets)[0];assert.equal(state.wanted.length,0);
 await vm.runInContext(`act('want-recipe|${id}')`,ctx);assert.equal(state.wanted.length,1);assert.equal(state.wanted[0].linkedRecipeId,id);assert.equal(state.records.length,0);assert.equal(state.stock.length,0);
 state.cycle.anchorWantedDishIds=[state.wanted[0].id];await vm.runInContext(`act('want-recipe|${id}')`,ctx);assert.equal(state.wanted.length,0);assert.equal(state.cycle.anchorWantedDishIds.length,0);
});
