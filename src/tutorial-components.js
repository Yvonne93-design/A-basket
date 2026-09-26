import {ingredients} from './data.js';
import {foodArt,ingredientArt,glyph,escapeHtml as esc} from './assets.js';
import {matchDishAsset} from './dish-asset-matcher.js';
import {isPantry} from './food-rules.js';
const actionNames={wash:'清洗食材',slice:'切配食材',dice:'切成小丁',chop:'切配食材',mix:'拌匀',fry:'下锅煎炒',stir_fry:'翻炒',boil:'煮开',simmer:'小火炖煮',steam:'蒸熟',plate:'调味盛盘'};
export function tutorialStateAsset(step){
 if(!['wash','prep'].includes(step.phase))return null;
 const text=step.instruction||step.text||'',ids=step.ingredientIds||[];
 const candidates=[
 ['tomato',/番茄[^，。；]*切丁/,'tomato_diced'],['tomato',/番茄[^，。；]*切块/,'tomato_chunks'],
 ['potato',/土豆[^，。；]*切[小]*块/,'potato_cubes'],['potato',/土豆[^，。；]*切[薄]*片/,'potato_sliced'],
 ['egg',/鸡蛋[^，。；]*打散/,'egg_beaten'],['mushroom',/香菇[^，。；]*切[薄]*片/,'mushroom_sliced'],
 ['lettuce',/生菜[^，。；]*切/,'lettuce_chopped'],['garlic',/蒜[^，。；]*切末/,'garlic_minced'],
 ['scallion',/小葱[^，。；]*切末/,'scallion_chopped'],['carrot',/胡萝卜[^，。；]*切丁/,'carrot_diced']
 ];
 const match=candidates.find(([id,re])=>ids.includes(id)&&re.test(text));
 if(match)return '/assets/library/tutorial-states/'+match[2]+'.png';
 if(step.phase==='wash'&&ids.length===1&&['tomato','potato','lettuce','carrot','onion'].includes(ids[0]))return '/assets/library/tutorial-states/'+ids[0]+'_whole.png';
 return null;
}
function placeholder(label){return `<div class="tutorial-placeholder">${glyph('bowl-food')}<span>${esc(label)}</span></div>`;}
function dishVisual(r){return matchDishAsset(r)?foodArt(r):placeholder('成品图待补充');}
export function tutorialComponentModel(plan){const timeline=[...(plan.atomicTimeline||plan.stages||[])].sort((a,b)=>a.start-b.start||Number(a.handsOn)-Number(b.handsOn));return {prep:timeline.filter(s=>['wash','prep'].includes(s.phase)),cooking:timeline.filter(s=>!['wash','prep'].includes(s.phase))};}
export function renderTutorialComponents(plan,{diners,quantityLabel,completed=false}={}){
 const dishes=plan.adaptedRecipes||[],{prep,cooking}=tutorialComponentModel(plan),needs=plan.requirements||[],main=needs.filter(i=>!isPantry(i.ingredientId)),seasoning=needs.filter(i=>isPantry(i.ingredientId));
 const stepImage=step=>{const src=tutorialStateAsset(step);return src?`<img src="${src}" alt="${esc(step.title||actionNames[step.action]||'食材状态')}">`:placeholder(['wash','prep'].includes(step.phase)?'处理图待补充':'烹饪图待补充');};
 const label=step=>step.title||actionNames[step.action]||'烹饪步骤';
 const name=dishes.map(r=>r.name).join(' + '),fast=plan.cookingMode==='fast';
 return `<div class="tutorial-components" id="tutorial-top"><a href="#/cook" class="tutorial-back" aria-label="返回做饭">${glyph('arrow-left')}</a><section class="tutorial-dish-hero"><div class="tutorial-dish-copy"><h1>${esc(name)}</h1><p>${fast&&plan.parallelWindows?.length?'准备好食材，利用等待时间穿插完成这餐。':'准备好食材，跟着步骤完成这餐。'}</p><div class="tutorial-meta"><span>${glyph('clock')}约 ${plan.estimatedTotalMinutes} 分钟</span><span>${glyph('users')}${diners} 人份</span>${dishes.every(r=>r.difficulty==='简单')?'<span>简单</span>':''}</div><small>${({fast:'省时安排',less_cleanup:'少洗锅',less_prep:'少切配'})[plan.cookingMode]||'标准做法'}</small></div><div class="tutorial-hero-dishes">${dishes.map(r=>`<div>${dishVisual(r)}</div>`).join('')}</div></section><section class="tutorial-section tutorial-preparation"><h2>食材 <small>（${diners} 人份）</small></h2><div class="tutorial-ingredient-list">${main.map(i=>`<div class="tutorial-ingredient">${ingredientArt(i.ingredientId)}<strong>${esc(ingredients[i.ingredientId]?.name||i.ingredientId)}</strong><span>${esc(quantityLabel(i))}</span></div>`).join('')}</div>${seasoning.length?`<div class="tutorial-seasonings"><span>调料</span>${seasoning.map(i=>`<span>${esc(ingredients[i.ingredientId].name)} · 适量</span>`).join('')}</div>`:''}</section>${prep.length?`<section class="tutorial-section"><h2>食材处理 <small>约 ${Math.max(...prep.map(s=>s.end))} 分钟内陆续准备</small></h2><div class="tutorial-prep-cards">${prep.map((s,i)=>`<article class="tutorial-prep-card"><div class="tutorial-state-art">${stepImage(s)}<b>${i+1}</b></div><h3>${esc(label(s))}</h3><p>${esc(s.instruction||s.text)}</p></article>`).join('')}</div></section>`:''}<section class="tutorial-section"><h2>开始烹饪</h2><div class="tutorial-timeline">${cooking.map((s,i)=>{const heat=(s.instruction||'').match(/中小火|中大火|小火|中火|大火/)?.[0];return `<article class="tutorial-cooking-step"><div class="tutorial-step-time"><b>${String(i+1).padStart(2,'0')}</b><span>${s.start}′–${s.end}′</span></div><div class="tutorial-step-body"><div class="tutorial-state-art">${stepImage(s)}</div><div><small>${esc(dishes.find(r=>r.baseRecipeId===s.recipeId||r.id===s.recipeId)?.name||'共用步骤')}</small><h3>${esc(label(s))}</h3><p>${esc(s.instruction||s.text)}</p>${heat?`<span class="tutorial-heat">${esc(heat)}</span>`:''}${!s.handsOn&&(plan.parallelWindows||[]).some(w=>w.stepIds?.includes(s.id))?'<p class="tutorial-step-wait">等待时按下方时间继续下一步，留意锅内状态。</p>':''}</div></div></article>`;}).join('')}</div></section><section class="tutorial-finish"><div class="tutorial-finish-art">${dishes.map(dishVisual).join('')}</div><div><h2>${completed?'已完成':'准备开饭'}</h2><h3>${esc(name)}</h3><p>${completed?'这一餐已记录，实际用量已扣减。':'确认食材熟透、关火后，就可以开饭了。'}</p></div></section><div class="tutorial-finish-actions"><button class="button outline" data-action="tutorial-top">重新查看菜谱</button><button class="button" data-action="usage" ${completed?'disabled':''}>${completed?'已完成':dishes.length===1?'我已完成这道菜':'我已完成这餐'}</button></div></div>`;
}
