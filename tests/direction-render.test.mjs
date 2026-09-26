import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';
const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
test('direction choices preserve existing sheet nodes and scroll even on background renders',()=>{
 const buttons=['instant-diners|2','instant-cuisine|中式','instant-flavor|不辣','meal-type|面条米粉','time|20','operation|少洗锅','policy|现有食材优先','apply-adjust'].map(action=>({dataset:{action},active:false,attributes:{},classList:{toggle(_,value){this.owner.active=value;}},setAttribute(key,value){this.attributes[key]=value;}}));for(const button of buttons)button.classList.owner=button;
 const panel={scrollTop:287,querySelectorAll:()=>buttons};const app={querySelector:selector=>selector==='.direction-sheet'?panel:null,set innerHTML(_){throw Error('must not replace the page or sheet');}};
 const adjust={diners:2,constraints:{cuisines:['中式'],flavors:['不辣'],mealType:'面条米粉',timeLimit:20,operationPrefs:['少洗锅'],stockPolicy:'现有食材优先'}};
 const context=vm.createContext({app,adjust,sheet:'adjust',allowsTopUp:s=>s.meal.constraints.stockPolicy!=='现有食材优先'});
 vm.runInContext(source.slice(source.indexOf('function syncDirectionChoices('),source.indexOf('function toggle(')),context);
 vm.runInContext('render()',context);assert.ok(buttons.slice(0,7).every(b=>b.active&&b.attributes['aria-pressed']==='true'));assert.equal(panel.scrollTop,287);
 adjust.constraints.cuisines=[];adjust.constraints.operationPrefs=[];vm.runInContext('render()',context);assert.equal(buttons[1].active,false);assert.equal(buttons[5].active,false);assert.equal(panel.scrollTop,287);assert.strictEqual(app.querySelector('.direction-sheet'),panel);
});
