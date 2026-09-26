import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/preview.js',import.meta.url),'utf8');
function boot(search){
 const events={},links={'#open-app':{},'#first-use':{},'#reload-app':{addEventListener:(name,fn)=>events.reload=fn}},frame={contentWindow:{location:{hash:'#/onboarding/kitchen'},addEventListener(){ }},addEventListener:(name,fn)=>events[name]=fn},history=[];
 const context={URL,URLSearchParams,encodeURIComponent,crypto:{randomUUID:()=> 'unique-session'},location:{search,hash:'#/login',href:'http://localhost:4173/preview.html'+search+'#/login'},history:{replaceState:(_,__,url)=>history.push(url)},window:{addEventListener(){}},ResizeObserver:class{observe(){}},document:{querySelector:sel=>sel==='iframe'?frame:sel==='.preview-stage'?{clientWidth:500,clientHeight:1000}:sel==='.device-space'?{style:{setProperty(){}}}:links[sel]}};
 vm.runInNewContext(source,context);events.load();return {frame,links,history,events};
}
test('first-use preview keeps isolated data through navigation and full-screen links',()=>{
 const {frame,links,history}=boot('?previewSession=sample');
 assert.equal(frame.src,'/?device=iphone17&previewSession=sample#/login');
 assert.equal(history[0],'/preview.html?previewSession=sample#/onboarding/kitchen');
 assert.equal(links['#open-app'].href,'/?previewSession=sample#/onboarding/kitchen');
 assert.equal(links['#first-use'].href,'/preview.html?previewSession=unique-session#/login');
});
test('ordinary preview continues using original saved data',()=>{
 const {frame,links}=boot('');assert.equal(frame.src,'/?device=iphone17#/login');assert.equal(links['#open-app'].href,'/#/onboarding/kitchen');
});
test('app uses separate storage keys without clearing existing user records',()=>{
 const app=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
 const setup=app.slice(app.indexOf('const previewSession='),app.indexOf('let state,freshUser'));
 for(const [search,key] of [['','yilan-v0-state'],['?previewSession=sample','yilan-v0-state:preview:sample']])assert.equal(vm.runInNewContext(setup+'KEY',{URLSearchParams,location:{search}}),key);
});

test('explicit refresh reloads embedded app and preserves session and current route',()=>{const {frame,events}=boot('?previewSession=sample');events.reload();const url=new URL(frame.src);assert.equal(url.searchParams.get('previewSession'),'sample');assert.equal(url.searchParams.get('reload'),'unique-session');assert.equal(url.hash,'#/onboarding/kitchen');});
