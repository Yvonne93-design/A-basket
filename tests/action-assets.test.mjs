import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {actionAssets,stepActionCode,resolveActionAsset,missingActions} from '../src/action-assets.js';
import {visualArt} from '../src/assets.js';
import {cookingPlan} from '../src/domain.js';
import {stockedState} from './helpers/kitchen.mjs';
import {renderTutorialComponents} from '../src/tutorial-components.js';
test('all 41 registry images are original transparent square PNGs',()=>{
 assert.equal(Object.keys(actionAssets).length,41);
 for(const [code,a] of Object.entries(actionAssets)){assert.ok(a.src.endsWith('/'+code+'.png'));const p=readFileSync('public'+a.src);assert.equal(p.readUInt32BE(16),1024);assert.equal(p.readUInt32BE(20),1024);assert.equal(p[25],6);}
});
test('legacy action refinements do not confuse frying, mixing hot soup and cutting shapes',()=>{
 for(const [action,phase,instruction,expected] of [['fry','heat','炒鸡蛋至凝固，暂盛出。','stir_fry'],['fry','heat','先煎鸡肉表面。','pan_fry'],['slice','prep','土豆去皮切细丝，清水冲洗沥干。','shred'],['mix','prep','鸡蛋加牛奶和盐打散，洗手。','beat'],['mix','heat','保持沸腾淋蛋液，煮至完全凝固，加盐。','boil']])assert.equal(stepActionCode({action,phase,instruction}),expected);
});
test('missing or unsafe visual categories stay neutral and are logged once',()=>{
 const step={id:'sanitize-test',action:'wash',instruction:'处理生肉后清洗消毒刀板和双手，再处理其他食材。'};
 assert.equal(resolveActionAsset(step).actionCode,'sanitize');assert.equal(stepActionCode({instruction:'淘洗大米并按电饭煲刻度加水。'}),'rice_setup');assert.equal(stepActionCode({instruction:'启动电饭煲煮熟米饭，保温待用。'}),'cook_rice');
 assert.equal(resolveActionAsset({actionCode:'invented',action:'unknown'}),null);
 assert.ok(!visualArt({kind:'step',action:'unknown'}).includes('visual-composition'));
});
test('all tutorial modes reuse local actions without mutating scheduling or exposing legacy placeholders',()=>{
 for(const prefs of [[],['省时间'],['少洗锅'],['少切配']]){const s=stockedState();s.meal.selectedRecipeIds=['tomato_pasta','miso_tofu_soup'];s.meal.constraints.operationPrefs=prefs;const p=cookingPlan(s),before=JSON.stringify(p);const html=renderTutorialComponents(p,{diners:2,quantityLabel:i=>String(i.qty)});assert.equal(JSON.stringify(p),before);assert.ok(html.includes('/tutorial-actions/'));assert.doesNotMatch(html,/烹饪图待补|处理图待补|visual-composition/);for(const step of p.atomicTimeline)assert.equal(step.actionCode,stepActionCode(step));}
});
test('step visuals never await or invoke image generation, including unknown actions',async()=>{
 const {VisualResolver}=await import('../src/visual-resolver.js');let calls=0;const resolver=new VisualResolver({provider:{enabled:true,generate:async()=>{calls++;}}});
 assert.equal(resolver.resolve({kind:'step',action:'steam'}).url,actionAssets.steam.src);
 assert.equal((await resolver.generate({kind:'step',action:'unknown'})).kind,'neutral');assert.equal(calls,0);
});
