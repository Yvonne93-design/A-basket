// Prints only public response fields, never environment variables or request headers.
import {initialState} from '../src/data.js';
import {aiContext} from '../src/ai.js';
import {requirements} from '../src/domain.js';
import {writeFile} from 'node:fs/promises';
const base=process.argv[2]||'http://localhost:4173';
const statusResponse=await fetch(base+'/api/ai/status');
if(!statusResponse.ok)throw new Error('Status endpoint failed');
const status=await statusResponse.json(),state=initialState(),results={};
state.meal.selectedRecipeIds=['tomato_scrambled_egg','miso_tofu_soup'];
state.stock=requirements(state.meal.selectedRecipeIds).map(i=>({...i,status:'available'}));
for(const task of ['planBasket','recommendRecipes','proposeCookingStrategy']){
 const res=await fetch(base+'/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({task,input:aiContext(state)})});
 const out=await res.json();if(!res.ok)throw new Error(task+' HTTP '+res.status);
 results[task]=out;
}
const result={checkedAt:new Date().toISOString(),base,status,results};
await writeFile(new URL('../reports/ai-response-examples.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status,tasks:Object.fromEntries(Object.entries(results).map(([k,v])=>[k,v.meta]))},null,2));
for(const path of ['/healthz','/preview.html','/src/app.js'])if(!(await fetch(base+path)).ok)throw new Error('Demo route failed: '+path);
for(const path of ['/.env','/server/ai-gateway.js'])if((await fetch(base+path)).ok)throw new Error('Private file exposed');
console.log('HTTP health, static routes and private-file isolation passed.');
