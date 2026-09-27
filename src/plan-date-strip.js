const dateKey=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function planningDates(selected,now=new Date()){
 const today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12),chosen=new Date(selected+'T12:00:00');
 const start=new Date(today);const horizon=new Date(today);horizon.setDate(horizon.getDate()+89);
 if(chosen>horizon)start.setFullYear(chosen.getFullYear(),chosen.getMonth(),chosen.getDate()-3);
 const days=Array.from({length:90},(_,i)=>{const d=new Date(start);d.setDate(d.getDate()+i);return d;});
 if(chosen<today)days.unshift(chosen);
 return days.map(d=>({value:dateKey(d),day:d.getDate(),month:d.getMonth()+1,weekday:['周日','周一','周二','周三','周四','周五','周六'][d.getDay()],today:dateKey(d)===dateKey(today)}));
}
export function rangeDays(start,end){
 const utc=value=>{const [y,m,d]=value.split('-').map(Number);return Date.UTC(y,m-1,d);};
 return Math.round((utc(end)-utc(start))/86400000)+1;
}
export function renderPlanDateStrip(selected,days=1,pending=null){
 const start=pending||selected,endDate=new Date(start+'T12:00:00');endDate.setDate(endDate.getDate()+(pending?0:days-1));
 const end=dateKey(endDate),label=value=>{const [,m,d]=value.split('-').map(Number);return `${m}月${d}日`;};
 const dates=planningDates(start);
 return `<div class="plan-date-picker"><div class="plan-date-heading"><span>${pending?'再选结束日期':'选择开始和结束日期'}</span><strong aria-live="polite">${label(start)}${pending?' → 待选择':` — ${label(end)} · ${days}天`}</strong></div><div class="plan-date-strip" role="group" aria-label="起止日期，左右滑动选择">${dates.map((d,i)=>{const first=d.value===start,last=d.value===end,inside=d.value>=start&&d.value<=end;return `<button type="button" class="plan-date${inside?' in-range':''}${first?' range-start active':''}${last?' range-end active':''}" data-action="plan-date|${d.value}" aria-pressed="${inside}" aria-label="${d.month}月${d.day}日 ${d.weekday}${d.today?' 今天':''}"><small>${d.today?'今天':d.weekday}</small><b>${d.day}</b><span>${first?'开始':last?'结束':i===0||d.day===1?d.month+'月':'&nbsp;'}</span></button>`;}).join('')}</div><small class="plan-date-help">${pending?'选更早的日期可重设开始日；同一天也可以。':'先选第一天，再选最后一天，中间自动连选。'}</small></div>`;
}
