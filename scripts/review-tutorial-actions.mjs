import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {recipes} from '../src/data.js';
import {stockedState} from '../tests/helpers/kitchen.mjs';
import {cookingPlan} from '../src/domain.js';
import {displayQty} from '../src/food-rules.js';
import {renderTutorialComponents} from '../src/tutorial-components.js';
import {resolveActionAsset} from '../src/action-assets.js';
mkdirSync('public/qa/tutorial-actions',{recursive:true});
for(const [mode,prefs] of [['standard',[]],['fast',['省时间']]]){
 const state=stockedState();state.meal.selectedRecipeIds=['tomato_pasta','miso_tofu_soup'];state.meal.constraints.operationPrefs=prefs;state.meal.constraints.timeLimit=180;
 const plan=cookingPlan(state);const html=renderTutorialComponents(plan,{diners:state.meal.diners,quantityLabel:i=>displayQty(state,i.ingredientId,i.qty)});
 const head=readFileSync('public/index.html','utf8').split('</head>')[0].replace(/<script>.*?<\/script>/,'');
 writeFileSync(`public/qa/tutorial-actions/${mode}.html`,head+`</head><body><div class="app"><main class="page plain tutorial-page">${html}</main></div></body></html>`);
}
const missing=[];for(const r of recipes)for(const step of r.atomicSteps)if(!resolveActionAsset(step))missing.push({recipe:r.name,stepId:step.id,action:step.action,instruction:step.instruction});
writeFileSync('docs/tutorial-missing-actions.json',JSON.stringify(missing,null,2)+'\n');
console.log('Review pages generated; unmatched authored steps:',missing.length);
