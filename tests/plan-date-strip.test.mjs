import test from 'node:test';
import assert from 'node:assert/strict';
import {planningDates} from '../src/plan-date-strip.js';
test('date strip uses local calendar days across month and year boundaries',()=>{
 const days=planningDates('2026-12-31',new Date(2026,11,30,23));
 assert.deepEqual(days.slice(0,3).map(d=>d.value),['2026-12-30','2026-12-31','2027-01-01']);assert.equal(days[0].today,true);assert.equal(days[2].month,1);
});
test('existing earlier and distant future selections remain available',()=>{
 const now=new Date(2026,8,27,12);
 for(const selected of ['2026-09-01','2027-06-15'])assert.ok(planningDates(selected,now).some(d=>d.value===selected));
 const leap=planningDates('2028-02-29',new Date(2028,1,28,12));assert.equal(leap[1].value,'2028-02-29');assert.equal(leap[2].value,'2028-03-01');
});

test('ranges count both endpoints across month, year and leap day',async()=>{
 const {rangeDays}=await import('../src/plan-date-strip.js');
 assert.equal(rangeDays('2026-09-27','2026-10-01'),5);
 assert.equal(rangeDays('2026-12-31','2027-01-02'),3);
 assert.equal(rangeDays('2028-02-28','2028-03-01'),3);
 assert.equal(rangeDays('2026-09-27','2026-09-27'),1);
});
test('range rendering highlights endpoints and every intermediate day',async()=>{
 const {renderPlanDateStrip}=await import('../src/plan-date-strip.js');
 const html=renderPlanDateStrip('2027-06-15',5);
 assert.equal((html.match(/class="plan-date in-range/g)||[]).length,5);
 assert.match(html,/6月15日 — 6月19日 · 5天/);
 const pending=renderPlanDateStrip('2027-06-15',5,'2027-06-16');
 assert.equal((pending.match(/class="plan-date in-range/g)||[]).length,1);
 assert.match(pending,/待选择/);
});
