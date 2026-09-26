const stage=document.querySelector('.preview-stage');
const space=document.querySelector('.device-space');
const frame=document.querySelector('iframe');
const fullScreen=document.querySelector('#open-app');
const previewSession=new URLSearchParams(location.search).get('previewSession');
const sessionQuery=previewSession?'?previewSession='+encodeURIComponent(previewSession):'';
document.querySelector('#first-use').href='/preview.html?previewSession='+crypto.randomUUID()+'#/login';
function fit(){const scale=Math.min(1,(stage.clientWidth-28)/422,(stage.clientHeight-18)/894);space.style.width=422*scale+'px';space.style.height=894*scale+'px';space.style.setProperty('--device-scale',scale);}
new ResizeObserver(fit).observe(stage);fit();
frame.src='/?device=iphone17'+(previewSession?'&previewSession='+encodeURIComponent(previewSession):'')+(location.hash||'#/basket');
frame.addEventListener('load',()=>{const sync=()=>{const hash=frame.contentWindow.location.hash;history.replaceState(null,'','/preview.html'+sessionQuery+hash);fullScreen.href='/'+sessionQuery+hash;};sync();frame.contentWindow.addEventListener('hashchange',sync);});
window.addEventListener('hashchange',()=>{if(frame.contentWindow.location.hash!==location.hash)frame.contentWindow.location.hash=location.hash;});

// Reload the embedded app itself while retaining its current profile and route.
document.querySelector('#reload-app').addEventListener('click',()=>{const url=new URL(frame.src,location.href);url.hash=frame.contentWindow.location.hash;url.searchParams.set('reload',crypto.randomUUID());frame.src=url.href;});
