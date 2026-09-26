import {plannerQty,pantryStatus,pantryIds} from './food-rules.js';
// Three independent preference scopes; transport deliberately excludes photos and notes.
export function buildAIContext(s){return {
 longTerm:{defaultDiners:s.profile.defaultDiners,allergies:[...s.diet.allergies],absoluteAvoids:[...s.diet.absoluteAvoids],stoveSlots:s.kitchen.stoveSlots,tools:s.kitchen.tools.map(({id,quantity,available})=>({id,quantity,available}))},
 cycle:{plannedDays:s.cycle.plannedDays,expectedMeals:s.cycle.expectedMeals,goals:[...(s.cycle.goals||[])],excludedStockIds:[...(s.cycle.excludedStockIds||[])],carryOverEnabled:s.cycle.carryOverEnabled,anchorRecipeIds:s.cycle.anchorWantedDishIds.map(id=>s.wanted.find(w=>w.id===id)?.linkedRecipeId).filter(Boolean)},
 instant:{diners:s.meal.diners,selectedRecipeIds:[...s.meal.selectedRecipeIds],...structuredClone(s.meal.constraints)},
 history:{recentRecipeIds:s.records.slice(0,5).flatMap(r=>r.recipeIds||[])},
 plannerStock:Object.keys(s.stock.reduce((o,l)=>(o[l.ingredientId]=true,o),{})).map(ingredientId=>({ingredientId,qty:plannerQty(s,ingredientId)})),pantry:pantryIds.map(id=>({ingredientId:id,status:pantryStatus(s,id)})),
 confirmedStock:s.stock.filter(l=>l.status==='available').map(({ingredientId,qty,unit})=>({ingredientId,qty,unit}))
};}
export const planningCodes=['preserve_anchor','reuse_stock','reuse_ingredients','reduce_one_off_purchase','reduce_prep_effort','avoid_recent_repeat','increase_variety'];
export const reasonCodes=['stock_ready','uses_existing_stock','fits_time','matches_cuisine','matches_flavor','adaptable','matches_meal_type','low_prep','low_cleanup','complements_table','avoids_recent_repeat','anchor_related'];
export const reasonText={stock_ready:'现有食材可做',uses_existing_stock:'用得上现有食材',fits_time:'符合这顿时间',matches_cuisine:'今天想吃的菜系',matches_flavor:'合这顿口味',adaptable:'少一味配料也能做',matches_meal_type:'符合这顿餐型',low_prep:'切配较少',low_cleanup:'少用锅具',complements_table:'与圆桌菜共享食材',avoids_recent_repeat:'最近没有吃过',anchor_related:'来自本轮想吃的'};
