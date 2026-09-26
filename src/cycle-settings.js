// Edit the current basket in place; purchase history and actual stock are immutable here.
export async function updateCycleSettings(state,values,planBasket){
 const next=structuredClone(state);
 for(const [key,max] of [['plannedDays',30],['expectedMeals',30],['diners',20]]){
  const n=Number(values[key]);if(!Number.isInteger(n)||n<1||n>max)throw new Error(`请输入 1–${max} 的整数`);
 }
 const date=new Date(values.startDate+'T12:00:00');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(values.startDate)||!Number.isFinite(date.getTime())||date.getFullYear()!==Number(values.startDate.slice(0,4))||date.getMonth()+1!==Number(values.startDate.slice(5,7))||date.getDate()!==Number(values.startDate.slice(8,10)))throw new Error('请选择有效日期');
 const changed=next.cycle.plannedDays!==Number(values.plannedDays)||next.cycle.expectedMeals!==Number(values.expectedMeals)||next.profile.defaultDiners!==Number(values.diners);
 next.cycle.plannedAt=values.startDate+'T12:00:00';next.cycle.plannedDays=Number(values.plannedDays);next.cycle.expectedMeals=Number(values.expectedMeals);next.profile.defaultDiners=Number(values.diners);
 const pending=state.purchases.filter(p=>p.state==='shopping'&&!p.checked);
 if(changed&&(state.suggestions.length||pending.length)){
  const result=await planBasket(next),locked=state.suggestions.filter(i=>i.locked);
  next.suggestions=result.ingredientSuggestions.map(i=>locked.find(l=>l.ingredientId===i.ingredientId)||i);
  next.planningInsights=result.planningInsights||[];next.planningMessages=result.planningMessages||[];next.suggestionSource=result.meta?.source||'mock';
  if(pending.length){
   const fixed=state.purchases.filter(p=>p.state!=='shopping'||p.checked);
   const oldIds=new Set(state.suggestions.map(i=>i.ingredientId));
   const rows=next.suggestions.filter(i=>i.purchaseQty>0&&!fixed.some(p=>p.ingredientId===i.ingredientId)).map(i=>{
    const old=pending.find(p=>p.ingredientId===i.ingredientId);
    return old?{...old,suggestedQty:i.purchaseQty,actualQty:old.actualQty===old.suggestedQty?i.purchaseQty:old.actualQty}:{id:crypto.randomUUID(),ingredientId:i.ingredientId,suggestedQty:i.purchaseQty,actualQty:i.purchaseQty,unit:i.unit,state:'shopping',checked:false};
   });
   next.purchases=[...fixed,...rows,...pending.filter(p=>!oldIds.has(p.ingredientId)&&!rows.some(r=>r.ingredientId===p.ingredientId))];
  }
 }
 return next;
}
